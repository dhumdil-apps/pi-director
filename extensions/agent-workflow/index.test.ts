import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createExtension from "./index.js";
import { APPROVED_ENTRY_TYPE, CLOSED_ENTRY_TYPE } from "./loop.js";

const planText = "## Current state\n\nA.\n\n## Desired state\n\nB.\n";

function harness(cwd = "/pi-kit-index-test-nonexistent") {
	const handlers = new Map<string, Array<(event?: any, ctx?: any) => any>>();
	const commands = new Map<string, { handler: (args: string, ctx: any) => Promise<void> }>();
	const tools: any[] = [];
	const branch: any[] = [];
	const notify = vi.fn();
	let sessionName: string | undefined;
	const pi = {
		on: vi.fn((name: string, handler: (event?: any, ctx?: any) => any) => {
			handlers.set(name, [...(handlers.get(name) ?? []), handler]);
		}),
		registerCommand: vi.fn((name: string, command: any) => commands.set(name, command)),
		registerTool: vi.fn((tool: any) => tools.push(tool)),
		getSessionName: vi.fn(() => sessionName),
		setSessionName: vi.fn((name: string) => { sessionName = name; }),
		sendMessage: vi.fn(),
		sendUserMessage: vi.fn(),
		events: { emit: vi.fn(), on: vi.fn() },
	};
	createExtension(pi as any);
	const newSession = vi.fn(async () => ({ cancelled: false }));
	const ctx = {
		hasUI: true,
		ui: { notify },
		cwd,
		getContextUsage: () => undefined as any,
		waitForIdle: vi.fn(async () => {}),
		newSession,
		sessionManager: {
			getBranch: () => branch,
			getSessionName: () => sessionName,
			getSessionFile: () => "/sessions/current.jsonl",
		},
	};

	const inject = async (): Promise<string> => {
		const injectors = handlers.get("before_agent_start")!;
		const result = await injectors[injectors.length - 1]({ systemPrompt: "base" }, ctx);
		// Collapsed to one line: the prose wraps, so assertions must not depend on where.
		return (result.systemPrompt as string).replace(/\s+/g, " ").trim();
	};

	/** Seed a hidden loop fact the way Proceed or a /handoff-spawned session does. */
	const seed = (customType: string, task: string) => {
		branch.push({ type: "custom_message", customType, display: false, content: "", details: { task } });
	};

	return { handlers, commands, tools, notify, inject, seed, ctx, newSession };
}

describe("workflow prompt", () => {
	it("registers only the /handoff command and the two plan tools", () => {
		const { commands, tools, handlers } = harness();
		for (const gone of ["mode", "plan", "implement", "review", "flash", "retro"]) {
			expect(commands.has(gone)).toBe(false);
		}
		expect(commands.has("handoff")).toBe(true);
		expect(tools.map((tool) => tool.name)).toEqual(["save_plan", "save_summary"]);
		// The only turn-time hooks are the system-prompt injector and the approval
		// prompt (tool_execution_end arms it, agent_settled delivers it).
		expect(handlers.has("input")).toBe(false);
		expect(handlers.has("agent_start")).toBe(false);
		expect(handlers.has("agent_settled")).toBe(true);
	});

	it("injects one loop block, walking the five steps in order", async () => {
		const prompt = await harness().inject();
		expect(prompt).toContain("<pi_workflow>");
		expect(prompt.match(/<loop>/g)).toHaveLength(1);
		let cursor = -1;
		for (const step of ["1. Goal", "2. Explore", "3. Plan", "4. Save, then proceed", "5. Close out"]) {
			const at = prompt.indexOf(step);
			expect(at, step).toBeGreaterThan(cursor);
			cursor = at;
		}
	});

	it("names the plan topics without demanding a fixed set of sections", async () => {
		const prompt = await harness().inject();
		for (const topic of ["current state", "decisions taken", "desired state", "approach", "quirks"]) {
			expect(prompt).toContain(topic);
		}
		expect(prompt).toContain("not a form to fill in");
		expect(prompt).not.toContain("exactly four sections");
	});

	it("teaches save-before-present and both close-out halves", async () => {
		const prompt = await harness().inject();
		expect(prompt).toContain("call save_plan before you present the plan");
		expect(prompt).toContain("always exists on disk");
		expect(prompt).toContain("Proceed, handoff, or revise?");
		expect(prompt).toContain("call save_summary when the work is done");
		expect(prompt).toContain("straight into .pi/MEMORY.md");
		expect(prompt).toContain("write nothing and say so");
		// The retired ask-first memory policy is gone.
		expect(prompt).not.toContain("only after the user confirms");
	});

	it("frames the guidance as defaults the agent may override out loud", async () => {
		const prompt = await harness().inject();
		expect(prompt).toContain("guidance, not a checklist");
		expect(prompt).toContain("your judgment wins");
		expect(prompt).toContain("say plainly which guidance you are setting aside");
	});

	it("keeps the standing timeless guidance", async () => {
		const prompt = await harness().inject();
		expect(prompt).toContain("never weaken a test");
		expect(prompt).toContain("smallest change that satisfies it");
		expect(prompt).toContain("stop and report instead of guessing");
		expect(prompt).toContain(".pi/plan/<task-name>.md");
		expect(prompt).toContain("never delete one");
		expect(prompt).toContain("legacy .pi/goal/ files are ignored");
		expect(prompt).toContain("never hardcode secrets");
		// Repo conventions defer to AGENTS.md, with a fallback for projects without one.
		expect(prompt).toContain("come from the project's AGENTS.md");
		expect(prompt).toContain("ask before anything destructive or irreversible");
	});

	it("carries no session-mode vocabulary", async () => {
		const approved = harness();
		approved.seed(APPROVED_ENTRY_TYPE, "dashboard-polish");
		for (const prompt of [await harness().inject(), await approved.inject()]) {
			expect(prompt).not.toContain("Session mode");
			expect(prompt).not.toMatch(/\bPLAN\b/);
			expect(prompt).not.toMatch(/\bIMPLEMENT\b/);
			expect(prompt).not.toMatch(/\bmodes?\b/);
		}
	});
});

describe("position line", () => {
	it("reports no approved plan before approval", async () => {
		expect(await harness().inject()).toContain("No plan is approved yet");
	});

	it("names the approved task and its plan path after approval", async () => {
		const h = harness();
		h.seed(APPROVED_ENTRY_TYPE, "dashboard-polish");
		const prompt = await h.inject();
		expect(prompt).toContain("The plan for dashboard-polish at .pi/plan/dashboard-polish.md is approved");
		expect(prompt).not.toContain("No plan is approved yet");
	});

	it("returns to no-approved-plan once the task is closed out", async () => {
		const h = harness();
		h.seed(APPROVED_ENTRY_TYPE, "dashboard-polish");
		h.seed(CLOSED_ENTRY_TYPE, "dashboard-polish");
		expect(await h.inject()).toContain("No plan is approved yet");
	});

	it("comes last, so the guidance prefix stays cacheable", async () => {
		const h = harness();
		h.seed(APPROVED_ENTRY_TYPE, "dashboard-polish");
		const prompt = await h.inject();
		expect(prompt.indexOf("<position>")).toBeGreaterThan(prompt.indexOf("</loop>"));
		expect(prompt.endsWith("</position> </pi_workflow>")).toBe(true);
	});
});

describe("/handoff command", () => {
	let cwd: string;
	beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), "pi-index-handoff-")); });
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

	it("spawns the session for the resolved plan", async () => {
		await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
		await writeFile(join(cwd, ".pi", "plan", "dashboard-polish.md"), planText);
		const h = harness(cwd);
		await h.commands.get("handoff")!.handler("", h.ctx);
		expect(h.newSession).toHaveBeenCalledTimes(1);
	});

	it("warns instead of spawning when no plan exists", async () => {
		const h = harness(cwd);
		await h.commands.get("handoff")!.handler("", h.ctx);
		expect(h.notify).toHaveBeenCalledWith(expect.stringContaining("plan first"), "warning");
		expect(h.newSession).not.toHaveBeenCalled();
	});
});
