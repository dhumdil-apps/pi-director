import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerApproval } from "./approval.js";
import { withTimeSpent } from "./plan-time.js";

const planText = "## Current state\n\nA.\n\n## Desired state\n\nB.\n";

const PROCEED = "Proceed in this session (recommended)";
const HANDOFF = "Handoff to a fresh session";

function harness(cwd: string, sessionName?: string) {
	const handlers = new Map<string, Array<(event: any, ctx: any) => any>>();
	const branch: any[] = [];
	const messages: any[] = [];
	const userMessages: string[] = [];
	const emitted: Array<[string, any]> = [];
	const pi = {
		on: vi.fn((name: string, handler: (event: any, ctx: any) => any) => {
			handlers.set(name, [...(handlers.get(name) ?? []), handler]);
		}),
		events: { emit: vi.fn((name: string, value: any) => emitted.push([name, value])) },
		sendMessage: vi.fn((message: any) => messages.push(message)),
		sendUserMessage: vi.fn((content: string) => userMessages.push(content)),
		appendEntry: vi.fn((customType: string, data: unknown) => branch.push({ type: "custom", customType, data })),
	};
	registerApproval(pi as never);

	/**
	 * Drive the prompt: arm it with a save_plan result, then settle with a ctx
	 * whose select answers `choice` (undefined = dismissed). The editor starts
	 * empty unless `editorText` says otherwise.
	 */
	const offer = async (
		task: string,
		choice: string | undefined,
		options: { editorText?: string; isError?: boolean; usage?: any; hasUI?: boolean; mode?: "tui" | "print"; toolName?: string; kind?: "implementation" | "investigation"; source?: string } = {},
	) => {
		const setEditorText = vi.fn();
		const notify = vi.fn();
		const select = vi.fn(async (_title: string, _options: string[]) => choice);
		const ctx = {
			cwd,
			hasUI: options.hasUI ?? true,
			mode: options.mode ?? (options.hasUI === false ? "print" : "tui"),
			getContextUsage: () => options.usage,
			ui: { notify, setEditorText, getEditorText: () => options.editorText ?? "", select },
			sessionManager: { getBranch: () => branch, getSessionName: () => sessionName },
		};
		await handlers.get("tool_execution_end")![0]({ toolName: options.toolName ?? "save_plan", isError: options.isError ?? false, result: { details: { name: task, kind: options.kind ?? "implementation", source: options.source } } }, ctx);
		await handlers.get("agent_settled")![0]({}, ctx);
		return { setEditorText, notify, select, ctx };
	};

	/** The kickoff still identifies which concrete task execution started. */
	const approvedTasks = () => userMessages.map((content) => content.match(/plan\/(.+)\.md/)?.[1]);

	const phases = () => emitted.filter(([name]) => name === "agent-workflow:phase").map(([, value]) => value.phase);
	const waits = () => emitted.filter(([name]) => name === "agent-workflow:user-wait").map(([, value]) => value);

	return { handlers, offer, messages, userMessages, approvedTasks, branch, phases, waits };
}

describe("approval prompt", () => {
	let cwd: string;
	beforeEach(async () => {
		cwd = await mkdtemp(join(tmpdir(), "pi-approval-"));
		await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
		await writeFile(join(cwd, ".pi", "plan", "dashboard-polish.md"), planText);
	});
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

	it("arms once for a task nobody has approved", async () => {
		const h = harness(cwd);
		const first = await h.offer("dashboard-polish", "Revise the plan");
		expect(first.select).toHaveBeenCalledTimes(1);
		expect(h.waits()).toEqual([
			{ waiting: true, reason: "approval" },
			{ waiting: false, reason: "approval" },
		]);
		// Settle again without a new save: the offer was consumed.
		await h.handlers.get("agent_settled")![0]({}, first.ctx);
		expect(first.select).toHaveBeenCalledTimes(1);
	});

	it("Proceed kicks off the approved plan by its concrete path", async () => {
		const h = harness(cwd);
		const { notify } = await h.offer("dashboard-polish", PROCEED);
		expect(h.approvedTasks()).toEqual(["dashboard-polish"]);
		expect(h.userMessages[0]).toBe("Execute the approved plan at .pi/plan/dashboard-polish.md.");
		// Display state is persisted as a context-free custom entry, not a notice.
		expect(h.messages).toEqual([]);
		expect(h.branch.at(-1)).toMatchObject({ customType: "agent-workflow:phase", data: { phase: "execute" } });
		expect(notify).not.toHaveBeenCalled();
	});

	it("stays silent when an already-approved plan is re-saved unchanged", async () => {
		const h = harness(cwd);
		await h.offer("dashboard-polish", PROCEED);
		// Mid-implementation correction: same task, same plan contents.
		const again = await h.offer("dashboard-polish", PROCEED);
		expect(again.select).not.toHaveBeenCalled();
		expect(h.approvedTasks()).toEqual(["dashboard-polish"]);
	});

	it("ignores a script-owned elapsed-time update after approval", async () => {
		const path = join(cwd, ".pi", "plan", "dashboard-polish.md");
		await writeFile(path, withTimeSpent(await readFile(path, "utf8"), "dashboard-polish", 0));
		const h = harness(cwd);
		await h.offer("dashboard-polish", PROCEED);
		await writeFile(path, withTimeSpent(await readFile(path, "utf8"), "dashboard-polish", 83_000));

		const again = await h.offer("dashboard-polish", PROCEED);
		expect(again.select).not.toHaveBeenCalled();
		expect(h.approvedTasks()).toEqual(["dashboard-polish"]);
	});

	it("arms again when the approved task's plan gains a revision", async () => {
		const h = harness(cwd);
		await h.offer("dashboard-polish", PROCEED);
		await writeFile(join(cwd, ".pi", "plan", "dashboard-polish.md"), `${planText}\n## Revision 2 — later\n\nMore.\n`);
		const replan = await h.offer("dashboard-polish", PROCEED);
		expect(replan.select).toHaveBeenCalledTimes(1);
		expect(h.approvedTasks()).toEqual(["dashboard-polish", "dashboard-polish"]);
	});

	it("arms again for a second task in the same session", async () => {
		await writeFile(join(cwd, ".pi", "plan", "cache-recovery.md"), planText);
		const h = harness(cwd);
		await h.offer("dashboard-polish", PROCEED);
		const second = await h.offer("cache-recovery", PROCEED);
		expect(second.select).toHaveBeenCalledTimes(1);
		expect(h.approvedTasks()).toEqual(["dashboard-polish", "cache-recovery"]);
	});

	it("Handoff prefills /handoff with the task name only when the editor is empty", async () => {
		const h = harness(cwd);
		const { setEditorText, notify } = await h.offer("dashboard-polish", HANDOFF);
		expect(setEditorText).toHaveBeenCalledWith("/handoff dashboard-polish");
		expect(notify).toHaveBeenCalledWith(expect.stringContaining("/handoff dashboard-polish"), "info");
		expect(h.approvedTasks()).toEqual([]);

		const busy = harness(cwd);
		const { setEditorText: untouched } = await busy.offer("dashboard-polish", HANDOFF, { editorText: "half-typed thought" });
		expect(untouched).not.toHaveBeenCalled();
	});

	it("Revise and a dismissed prompt approve nothing", async () => {
		for (const choice of ["Revise the plan", undefined]) {
			const h = harness(cwd);
			const { notify, setEditorText } = await h.offer("dashboard-polish", choice as never);
			expect(notify).toHaveBeenCalledWith(expect.stringContaining("Plan not approved"), "info");
			expect(setEditorText).not.toHaveBeenCalled();
			expect(h.approvedTasks()).toEqual([]);
		}
	});

	it("recommends Proceed on a lean context and Handoff on a loaded or investigation-derived plan", async () => {
		const lean = harness(cwd);
		const { select: leanSelect } = await lean.offer("dashboard-polish", undefined);
		expect(leanSelect.mock.calls[0]![1][0]).toBe(PROCEED);

		const loaded = harness(cwd);
		const { select: loadedSelect } = await loaded.offer("dashboard-polish", undefined, {
			// Percentage alone decides: past the warning threshold a fresh session is the recommendation.
			usage: { tokens: 250_000, contextWindow: 1_000_000, percent: 25 },
		});
		expect(loadedSelect.mock.calls[0]![1][0]).toBe("Handoff to a fresh session (recommended)");

		const derived = harness(cwd);
		const { select: derivedSelect } = await derived.offer("dashboard-polish", undefined, { source: "cache-audit" });
		expect(derivedSelect.mock.calls[0]![1][0]).toBe("Handoff to a fresh session (recommended)");
	});

	it("warns once when the working tree changes before approval, and not after it", async () => {
		const h = harness(cwd);
		const { ctx, notify } = await h.offer("dashboard-polish", "Revise the plan");
		const mutate = async (toolName: string) => {
			await h.handlers.get("tool_execution_start")![0]({ toolName, args: {} }, ctx);
		};

		await mutate("read");
		expect(notify).not.toHaveBeenCalledWith(expect.stringContaining("before"), "warning");

		await mutate("edit");
		await mutate("write");
		const warnings = notify.mock.calls.filter(([, level]: any[]) => level === "warning");
		expect(warnings).toHaveLength(1);
		expect(warnings[0]![0]).toContain("dashboard-polish");

		// Approving the task retires the back-stop for every later edit.
		const approved = harness(cwd);
		const { ctx: approvedCtx, notify: quiet } = await approved.offer("dashboard-polish", PROCEED);
		await approved.handlers.get("tool_execution_start")![0]({ toolName: "edit", args: {} }, approvedCtx);
		expect(quiet).not.toHaveBeenCalled();
	});

	it("records only Explore and Execute across a revision cycle", async () => {
		const h = harness(cwd);
		const { ctx } = await h.offer("dashboard-polish", PROCEED);
		expect(h.phases()).toEqual(["execute"]);

		await h.handlers.get("input")![0]({ source: "interactive", text: "please refine it" }, ctx);
		await writeFile(join(cwd, ".pi", "plan", "dashboard-polish.md"), `${planText}\n## Revision 2 — later\n\nMore.\n`);
		await h.offer("dashboard-polish", PROCEED);
		expect(h.phases()).toEqual(["execute", "explore", "execute"]);
	});

	it("does not mistake the extension approval kickoff for a new exploration cycle", async () => {
		const h = harness(cwd);
		await h.handlers.get("input")![0](
			{ source: "extension", text: "Execute the approved plan..." },
			{ sessionManager: { getBranch: () => h.branch } },
		);
		expect(h.phases()).toEqual([]);
	});

	it("keeps an unapproved revision in Explore", async () => {
		const revised = harness(cwd);
		await revised.offer("dashboard-polish", "Revise the plan");
		expect(revised.phases()).toEqual([]);
	});

	it("does not offer execution for an investigation record", async () => {
		const h = harness(cwd);
		const { select } = await h.offer("dashboard-polish", undefined, { kind: "investigation" });
		expect(select).not.toHaveBeenCalled();
	});

	it("never arms on a failed save", async () => {
		const h = harness(cwd);
		const { select } = await h.offer("dashboard-polish", "Revise the plan", { isError: true });
		expect(select).not.toHaveBeenCalled();
	});

	it("persists a context-free /handoff hint and prints it when headless", async () => {
		const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
		const h = harness(cwd);
		const { select } = await h.offer("dashboard-polish", undefined, { hasUI: false });
		expect(select).not.toHaveBeenCalled();
		expect(h.messages).toEqual([]);
		expect(h.branch.at(-1)).toMatchObject({
			customType: "agent-workflow:notice",
			data: { content: expect.stringContaining("/handoff dashboard-polish"), level: "info" },
		});
		expect(stderr).toHaveBeenCalledWith(expect.stringContaining("/handoff dashboard-polish"));
		stderr.mockRestore();
	});
});
