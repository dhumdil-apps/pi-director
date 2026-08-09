import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { openHandoffSession } from "./handoff.js";

const plan = "## Current state\n\nA.\n\n## Desired state\n\nB.\n\n## Approach\n\nC.\n\n## Quirks\n\nD.\n";

interface CtxOptions { sessionName?: string; hasUI?: boolean; mode?: "tui" | "print" }

function makeHarness(cwd: string, options: CtxOptions = {}) {
	const sent: any[] = [];
	const entries: any[] = [];
	const notify = vi.fn();
	const pi = {
		appendEntry: vi.fn((customType: string, data: unknown) => entries.push({ customType, data })),
		sendMessage: vi.fn((message: any) => sent.push(message)),
	};

	const seeded = { entries: [] as any[], names: [] as string[] };
	const next = {
		hasUI: true,
		ui: { notify: vi.fn() },
		// Never resolves: the caller must not await the kickoff turn.
		sendUserMessage: vi.fn((_kickoff: string) => new Promise<void>(() => {})),
		sendMessage: vi.fn(async () => {}),
	};
	const newSession = vi.fn(async (opts: any) => {
		await opts.setup?.({
			appendCustomEntry: (customType: string, data: unknown) => seeded.entries.push({ customType, data }),
			appendSessionInfo: (name: string) => seeded.names.push(name),
		});
		await opts.withSession?.(next);
		return { cancelled: false };
	});

	const branch: any[] = [];
	const ctx = {
		cwd,
		hasUI: options.hasUI ?? true,
		mode: options.mode ?? (options.hasUI === false ? "print" : "tui"),
		ui: { notify },
		waitForIdle: vi.fn(async () => {}),
		newSession,
		sessionManager: {
			getBranch: () => branch,
			getSessionName: () => options.sessionName,
			getSessionFile: () => "/sessions/current.jsonl",
		},
	};

	const open = (taskName?: string, mode?: "vibe" | "spec") => openHandoffSession(pi as never, ctx as never, taskName, mode);
	return { open, notify, sent, entries, newSession, next, seeded, branch };
}

async function seedPlan(cwd: string, name: string) {
	await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
	await writeFile(join(cwd, ".pi", "plan", `${name}.md`), plan);
}

describe("openHandoffSession", () => {
	let cwd: string;
	beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), "pi-handoff-cmd-")); });
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

	it("seeds the new session with the task name and a kickoff naming the plan", async () => {
		await seedPlan(cwd, "dashboard-polish");
		const { open, newSession, seeded, next } = makeHarness(cwd);
		await open();

		expect(newSession).toHaveBeenCalledWith(expect.objectContaining({ parentSession: "/sessions/current.jsonl" }));
		// Display state is present before the replacement session is adopted.
		expect(seeded.entries).toEqual([
			{ customType: "agent-workflow:mode", data: { mode: "spec" } },
			{ customType: "agent-workflow:authorization", data: { state: "approved", task: "dashboard-polish" } },
			{ customType: "agent-workflow:phase", data: { phase: "execute" } },
		]);
		expect(seeded.names).toEqual(["dashboard-polish"]);
		const [kickoff] = next.sendUserMessage.mock.calls[0];
		expect(kickoff).toContain(".pi/plan/dashboard-polish.md");
		expect(kickoff).toContain("approved");
	});

	it("hands Vibe work to a fresh Vibe session without claiming plan approval", async () => {
		await seedPlan(cwd, "dashboard-polish");
		const { open, seeded, next } = makeHarness(cwd);
		await open(undefined, "vibe");
		expect(seeded.entries).toEqual([
			{ customType: "agent-workflow:mode", data: { mode: "vibe" } },
			{ customType: "agent-workflow:phase", data: { phase: "execute" } },
		]);
		const [kickoff] = next.sendUserMessage.mock.calls[0];
		expect(kickoff).toContain("Continue the Vibe task");
		expect(kickoff).not.toContain("approved");
	});

	it("waits for the kickoff turn only when the new session has no UI", async () => {
		await seedPlan(cwd, "dashboard-polish");
		const interactive = makeHarness(cwd);
		// next.sendUserMessage never resolves; an interactive handoff still returns.
		await interactive.open();

		const headless = makeHarness(cwd);
		headless.next.hasUI = false;
		let settled = false;
		let finishTurn = () => {};
		headless.next.sendUserMessage.mockImplementation(() => new Promise<void>((resolve) => { finishTurn = resolve; }));
		const pending = headless.open().then(() => { settled = true; });
		await vi.waitFor(() => expect(headless.next.sendUserMessage).toHaveBeenCalled());
		expect(settled).toBe(false);
		finishTurn();
		await pending;
		expect(settled).toBe(true);
	});

	it("notifies the resolution error and spawns nothing when no plan exists", async () => {
		const { open, notify, newSession } = makeHarness(cwd);
		await open();
		expect(notify).toHaveBeenCalledWith(expect.stringContaining("plan first"), "warning");
		expect(newSession).not.toHaveBeenCalled();
	});

	it("persists a context-free error and prints it when the session has no UI", async () => {
		const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
		const { open, sent, entries, newSession } = makeHarness(cwd, { hasUI: false });
		await open();
		expect(sent).toEqual([]);
		expect(entries[0]).toMatchObject({
			customType: "agent-workflow:notice",
			data: { content: expect.stringContaining("plan first"), level: "warning" },
		});
		expect(stderr).toHaveBeenCalledWith(expect.stringContaining("plan first"));
		expect(newSession).not.toHaveBeenCalled();
		stderr.mockRestore();
	});
});
