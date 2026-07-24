import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createExtension, { workflowPrompt } from "./index.js";
import { PLAN_TEMPLATE } from "./task.js";

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

	const inject = async (prompt = "do the thing"): Promise<string> => {
		const injectors = handlers.get("before_agent_start")!;
		const result = await injectors[injectors.length - 1]({ systemPrompt: "base", prompt }, ctx);
		// Collapsed to one line: the prose wraps, so assertions must not depend on where.
		return (result.systemPrompt as string).replace(/\s+/g, " ").trim();
	};

	return { handlers, commands, tools, notify, inject, ctx, newSession, pi };
}

describe("workflow prompt", () => {
	it("registers only the /handoff command and the loop's three tools", () => {
		const { commands, tools, handlers } = harness();
		for (const gone of ["mode", "plan", "implement", "review", "flash", "retro", "todos"]) {
			expect(commands.has(gone)).toBe(false);
		}
		expect(commands.has("handoff")).toBe(true);
		expect(tools.map((tool) => tool.name)).toEqual(["save_plan", "close_out", "ask"]);
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
		for (const step of ["1. Explore", "2. Ask", "3. Plan", "4. Execute", "5. Close out"]) {
			const at = prompt.indexOf(step);
			expect(at, step).toBeGreaterThan(cursor);
			cursor = at;
		}
	});

	it("states the no-changes-before-approval guarantee, and names its one out", async () => {
		const prompt = await harness().inject();
		expect(prompt).toContain("Nothing in the working tree changes until the user has approved a plan");
		expect(prompt).toContain("if something must, say so first");
		expect(prompt).toContain("then stop: the approval picker takes it from there");
		// The picker owns that question; the agent is not told to type it.
		expect(prompt).not.toContain("Proceed, handoff, or revise?");
	});

	it("makes questions cheap rather than rationed", async () => {
		const prompt = await harness().inject();
		expect(prompt).toContain("surface every choice you would otherwise make on the user's behalf");
		expect(prompt).toContain("ask even when the answer seems obvious to you");
		// The retired dampener that rationed questions to "genuine open choices".
		expect(prompt).not.toContain("Ask questions only about");
	});

	it("routes questions through the ask tool, and says what a clashing answer costs", async () => {
		const prompt = await harness().inject();
		expect(prompt).toContain("Put the questions through the ask tool");
		expect(prompt).toContain("strive to align with more questions");
	});

	it("points the plan at the scaffolded format instead of listing its sections", async () => {
		const prompt = await harness().inject();
		expect(prompt).toContain(".pi/plan/<session-name>.md");
		expect(prompt).toContain("matching its scaffolded format");
		// The topics themselves live in the template the step points at.
		for (const topic of ["Current state", "Decisions", "Desired state", "Approach", "Quirks"]) {
			expect(PLAN_TEMPLATE, topic).toContain(`## ${topic}`);
		}
	});

	it("names a tool for each step that has one, and none that was retired", async () => {
		const prompt = await harness().inject();
		expect(prompt).toContain("Call save_plan to present it");
		expect(prompt).toContain("call close_out with what changed");
		expect(prompt).toContain("into .pi/MEMORY.md");
		expect(prompt).not.toContain("save_summary");
	});

	it("keeps craft advice out beyond the one line that shapes execution", async () => {
		const prompt = await harness().inject();
		expect(prompt).toContain("the smallest change that fits the code around it");
		// Generic craft advice belongs in AGENTS.md, stated once, not duplicated here.
		for (const duplicated of [
			"never weaken a test",
			"never hardcode secrets",
			"macOS-portable",
			"cheapest relevant baseline check",
		]) {
			expect(prompt, duplicated).not.toContain(duplicated);
		}
	});

	it("carries no session-mode or position vocabulary", async () => {
		const prompt = await harness().inject();
		expect(prompt).not.toContain("<position>");
		expect(prompt).not.toContain("Session mode");
		expect(prompt).not.toMatch(/\bPLAN\b/);
		expect(prompt).not.toMatch(/\bIMPLEMENT\b/);
		expect(prompt).not.toMatch(/\bmodes?\b/);
	});

	it("is a constant, so the whole prefix stays cacheable", async () => {
		// No argument to vary, and nothing derived per turn: byte-identical every call.
		expect(workflowPrompt()).toBe(workflowPrompt());
		const first = await harness().inject("one thing");
		const second = await harness().inject("a completely different thing");
		expect(first.slice(first.indexOf("<pi_workflow>"))).toBe(second.slice(second.indexOf("<pi_workflow>")));
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

describe("plan scaffolding", () => {
	let cwd: string;
	beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), "pi-index-scaffold-")); });
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

	const planFiles = async () => (await readdir(join(cwd, ".pi", "plan"))).sort();

	it("names and scaffolds an unnamed session on its first turn", async () => {
		const h = harness(cwd);
		await h.inject("please fix the flaky login test");
		const name = h.pi.setSessionName.mock.calls[0][0] as string;
		expect(name).toMatch(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-fix-flaky-login-test$/);
		expect(await planFiles()).toEqual([`${name}.md`]);
		const written = await readFile(join(cwd, ".pi", "plan", `${name}.md`), "utf8");
		expect(written).toContain(`# ${name}`);
		expect(written).toContain("## Implementation summary");
		// The MEMORY stub is part of the same bootstrap.
		await expect(readFile(join(cwd, ".pi", "MEMORY.md"), "utf8")).resolves.toContain("#");
	});

	it("scaffolds once, leaving a named or resumed session untouched", async () => {
		const h = harness(cwd);
		await h.inject("first prompt about caching");
		const name = h.pi.setSessionName.mock.calls[0][0] as string;
		await h.inject("second prompt, same session");
		expect(h.pi.setSessionName).toHaveBeenCalledTimes(1);
		expect(await planFiles()).toEqual([`${name}.md`]);
	});

	it("survives an unwritable cwd without failing the turn", async () => {
		const h = harness("/pi-kit-index-test-nonexistent");
		expect(await h.inject("start something")).toContain("<pi_workflow>");
		expect(h.pi.setSessionName).not.toHaveBeenCalled();
	});
});
