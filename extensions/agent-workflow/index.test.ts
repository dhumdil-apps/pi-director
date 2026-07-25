import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createExtension, { workflowPrompt } from "./index.js";

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
	it("appends one loop block to the base prompt, and registers only /handoff", async () => {
		const h = harness();
		const prompt = await h.inject();
		expect(prompt.startsWith("base")).toBe(true);
		expect(prompt.match(/<loop>/g)).toHaveLength(1);
		expect([...h.commands.keys()]).toEqual(["handoff"]);
		// The only turn-time hooks are the system-prompt injector and the approval
		// prompt (tool_execution_end arms it, agent_settled delivers it).
		expect(h.handlers.has("input")).toBe(false);
		expect(h.handlers.has("agent_start")).toBe(false);
		expect(h.handlers.has("agent_settled")).toBe(true);
	});

	it("names only tools that are actually registered", async () => {
		// Derived from the prompt rather than copied from it, so renaming or
		// retiring a tool without updating the loop fails here.
		const h = harness();
		const named = [...(await h.inject()).matchAll(/"([a-z_]+)" tool/g)].map((match) => match[1]);
		expect(named.length).toBeGreaterThan(0);
		const registered = h.tools.map((tool) => tool.name);
		for (const name of named) expect(registered, name).toContain(name);
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
		expect(name).toMatch(/^\d{4}-\d{2}-\d{2}--\d{2}-\d{2}-\d{2}-fix-flaky-login-test$/);
		expect(await planFiles()).toEqual([`${name}.md`]);
		const written = await readFile(join(cwd, ".pi", "plan", `${name}.md`), "utf8");
		expect(written).toContain(`# ${name}`);
		expect(written).toContain("## Checklist");
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
