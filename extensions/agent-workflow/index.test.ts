import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createExtension, { workflowPrompt } from "./index.js";
import { SPEC_OPTION, VIBE_OPTION } from "./mode.js";

const planText = "## Current state\n\nA.\n\n## Desired state\n\nB.\n";

function harness(cwd = "/pi-director-index-test-nonexistent", initialChoice = SPEC_OPTION) {
	const handlers = new Map<string, Array<(event?: any, ctx?: any) => any>>();
	const commands = new Map<string, { handler: (args: string, ctx: any) => Promise<void> }>();
	const tools: any[] = [];
	const branch: any[] = [];
	const seeded: any[] = [];
	const notify = vi.fn();
	const select = vi.fn(async () => initialChoice);
	let sessionName: string | undefined;
	const pi = {
		on: vi.fn((name: string, handler: (event?: any, ctx?: any) => any) => {
			handlers.set(name, [...(handlers.get(name) ?? []), handler]);
		}),
		registerCommand: vi.fn((name: string, command: any) => commands.set(name, command)),
		registerEntryRenderer: vi.fn(),
		registerTool: vi.fn((tool: any) => tools.push(tool)),
		getSessionName: vi.fn(() => sessionName),
		setSessionName: vi.fn((name: string) => { sessionName = name; }),
		sendMessage: vi.fn(),
		sendUserMessage: vi.fn(),
		appendEntry: vi.fn((customType: string, data: unknown) => branch.push({ type: "custom", customType, data })),
		events: { emit: vi.fn(), on: vi.fn() },
	};
	createExtension(pi as any);
	const next = { hasUI: true, sendUserMessage: vi.fn(async () => {}) };
	const newSession = vi.fn(async (options: any) => {
		await options.setup?.({
			appendSessionInfo: (name: string) => { sessionName = name; },
			appendCustomEntry: (customType: string, data: unknown) => seeded.push({ customType, data }),
		});
		await options.withSession?.(next);
		return { cancelled: false };
	});
	const ctx = {
		hasUI: true,
		mode: "tui",
		ui: { notify, select, getEditorText: () => "", setEditorText: vi.fn() },
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

	const inject = async (prompt = "do the thing"): Promise<string> => {
		const injectors = handlers.get("before_agent_start")!;
		const result = await injectors[injectors.length - 1]({ systemPrompt: "base", prompt }, ctx);
		return (result.systemPrompt as string).replace(/\s+/g, " ").trim();
	};

	return { handlers, commands, tools, branch, notify, select, inject, ctx, newSession, next, seeded, pi };
}

describe("workflow prompt", () => {
	it("registers the workflow surfaces and injects one constant contract", async () => {
		const h = harness();
		const prompt = await h.inject();
		expect(prompt.startsWith("base")).toBe(true);
		expect(prompt.match(/<pi_workflow>/g)).toHaveLength(1);
		expect(prompt).toContain("<pi_workflow_mode>spec</pi_workflow_mode>");
		expect([...h.commands.keys()]).toEqual(["vibe", "spec", "execute", "handoff"]);
		expect(h.tools.map((tool) => tool.name)).toEqual(["start_task", "save_plan", "ask"]);
		expect(h.handlers.has("agent_settled")).toBe(true);
	});

	it("stays compact while preserving mode, artifact, and approval invariants", () => {
		const prompt = workflowPrompt();
		expect(prompt.length).toBeLessThanOrEqual(4_800);
		expect(prompt).toContain("session-wide and changes only through /vibe or /spec");
		expect(prompt).toContain("Artifact kind is independent");
		expect(prompt).toContain("A one-line change gets a one-line plan");
		expect(prompt).toContain("every later User-requested mutation needs");
		expect(prompt).toContain("fresh Proceed/Handoff/Revise approval");
		expect(prompt).toContain("Approved plan names never change");
	});

	it("bounds orientation and branches investigation close-out correctly", () => {
		const prompt = workflowPrompt();
		expect(prompt).toContain("bounded orientation memory");
		expect(prompt).toContain("exact likely historical-plan lookups");
		expect(prompt).toContain("Before source discovery");
		expect(prompt).toContain("Question, Align, Scope, Findings, Conclusion, Quirks, and Checklist");
		expect(prompt).toContain("never call \"save_plan\" or request execution approval");
		expect(prompt).toContain("implementation PR summary/QA steps; investigations instead finish findings and conclusion");
	});

	it("keeps Vibe automatic and questions interruption-aware", () => {
		const prompt = workflowPrompt();
		expect(prompt).toContain("Never call \"save_plan\"");
		expect(prompt).toContain("at most one compact \"ask\"");
		expect(prompt).toContain("materially changes the next work interval");
	});

	it("keeps the large contract byte-identical", () => {
		expect(workflowPrompt()).toBe(workflowPrompt());
	});
});

describe("session mode", () => {
	it("asks once before the first Agent call and reuses the persisted choice", async () => {
		const h = harness("/unused", VIBE_OPTION);
		const first = await h.inject("first request");
		expect(first).toContain("<pi_workflow_mode>vibe</pi_workflow_mode>");
		expect(h.select).toHaveBeenCalledTimes(1);
		await h.inject("follow-up");
		expect(h.select).toHaveBeenCalledTimes(1);
	});

	it("switches only through commands and does not trigger a turn", async () => {
		const h = harness();
		await h.commands.get("vibe")!.handler("", h.ctx);
		expect(h.branch.at(-1)).toMatchObject({ customType: "agent-workflow:mode", data: { mode: "vibe" } });
		expect(h.pi.sendUserMessage).not.toHaveBeenCalled();
		await h.commands.get("spec")!.handler("", h.ctx);
		expect(h.branch.at(-1)).toMatchObject({ customType: "agent-workflow:mode", data: { mode: "spec" } });
	});

	it("records an actual switch in the current artifact without triggering work", async () => {
		const cwd = await mkdtemp(join(tmpdir(), "pi-index-mode-log-"));
		try {
			await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
			await writeFile(join(cwd, ".pi", "plan", "dashboard-polish.md"), "# dashboard-polish\n\n## Decisions\n\nInitial direction.\n\n## Checklist\n\n- [ ] Polish\n");
			const h = harness(cwd);
			h.pi.setSessionName("dashboard-polish");
			await h.commands.get("vibe")!.handler("", h.ctx);
			const artifact = await readFile(join(cwd, ".pi", "plan", "dashboard-polish.md"), "utf8");
			expect(artifact).toContain("Workflow mode changed to Vibe.");
			expect(h.pi.sendUserMessage).not.toHaveBeenCalled();
		} finally {
			await rm(cwd, { recursive: true, force: true });
		}
	});
});

describe("manual execution commands", () => {
	let cwd: string;
	beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), "pi-index-handoff-")); });
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

	async function seed() {
		await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
		await writeFile(join(cwd, ".pi", "plan", "dashboard-polish.md"), planText);
	}

	it("reviews Spec execution in the current session", async () => {
		await seed();
		const h = harness(cwd);
		h.select.mockResolvedValueOnce("Proceed — execute this plan (recommended)");
		await h.commands.get("execute")!.handler("", h.ctx);
		expect(h.pi.sendUserMessage).toHaveBeenCalledWith("Execute the approved plan at .pi/plan/dashboard-polish.md.");
		expect(h.newSession).not.toHaveBeenCalled();
	});

	it("reviews a Spec handoff and transfers mode plus authorization", async () => {
		await seed();
		const h = harness(cwd);
		h.select.mockResolvedValueOnce("Handoff — execute in a fresh session (recommended)");
		await h.commands.get("handoff")!.handler("", h.ctx);
		expect(h.newSession).toHaveBeenCalledTimes(1);
		expect(h.seeded).toContainEqual({ customType: "agent-workflow:mode", data: { mode: "spec" } });
		expect(h.seeded).toContainEqual({ customType: "agent-workflow:authorization", data: { state: "approved", task: "dashboard-polish" } });
	});

	it("continues or hands off Vibe without approval", async () => {
		await seed();
		const current = harness(cwd);
		await current.commands.get("vibe")!.handler("", current.ctx);
		await current.commands.get("execute")!.handler("", current.ctx);
		expect(current.select).not.toHaveBeenCalled();
		expect(current.pi.sendUserMessage).toHaveBeenCalledWith("Continue the Vibe task from the work log at .pi/plan/dashboard-polish.md.");

		const fresh = harness(cwd);
		await fresh.commands.get("vibe")!.handler("", fresh.ctx);
		await fresh.commands.get("handoff")!.handler("", fresh.ctx);
		expect(fresh.select).not.toHaveBeenCalled();
		expect(fresh.seeded).toContainEqual({ customType: "agent-workflow:mode", data: { mode: "vibe" } });
	});

	it("warns without spawning when no plan exists", async () => {
		const h = harness(cwd);
		await h.commands.get("handoff")!.handler("", h.ctx);
		expect(h.notify).toHaveBeenCalledWith(expect.stringContaining("plan first"), "warning");
		expect(h.newSession).not.toHaveBeenCalled();
	});
});

describe("input and scaffolding", () => {
	let cwd: string;
	beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), "pi-index-scaffold-")); });
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

	it("records Explore for human input and ignores approval kickoffs", async () => {
		const h = harness(cwd);
		const input = h.handlers.get("input")!.at(-1)!;
		await input({ source: "interactive" }, h.ctx);
		expect(h.branch.at(-1)).toMatchObject({ customType: "agent-workflow:phase", data: { phase: "explore" } });
		const entries = h.branch.length;
		await input({ source: "extension" }, h.ctx);
		expect(h.branch).toHaveLength(entries);
	});

	it("scaffolds the selected mode once", async () => {
		const spec = harness(cwd, SPEC_OPTION);
		await spec.inject("please fix the flaky login test");
		const specName = spec.pi.setSessionName.mock.calls[0][0] as string;
		const specPlan = await readFile(join(cwd, ".pi", "plan", `${specName}.md`), "utf8");
		expect(specPlan).toContain("## Decisions");

		const vibeCwd = await mkdtemp(join(tmpdir(), "pi-index-vibe-"));
		try {
			const vibe = harness(vibeCwd, VIBE_OPTION);
			await vibe.inject("polish the dashboard");
			const vibeName = vibe.pi.setSessionName.mock.calls[0][0] as string;
			const vibePlan = await readFile(join(vibeCwd, ".pi", "plan", `${vibeName}.md`), "utf8");
			expect(vibePlan).toContain("## Direction");
			expect(vibePlan).toContain("## Work log");
			expect(vibePlan).not.toContain("## Decisions");
		} finally {
			await rm(vibeCwd, { recursive: true, force: true });
		}
	});

	it("survives an unwritable cwd without failing the turn", async () => {
		const h = harness("/pi-director-index-test-nonexistent");
		expect(await h.inject("start something")).toContain("<pi_workflow>");
		expect(h.pi.setSessionName).not.toHaveBeenCalled();
	});

	it("keeps the plan directory accumulative", async () => {
		await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
		await writeFile(join(cwd, ".pi", "plan", "older-task.md"), planText);
		const h = harness(cwd);
		await h.inject("new task");
		expect((await readdir(join(cwd, ".pi", "plan"))).length).toBe(2);
	});
});
