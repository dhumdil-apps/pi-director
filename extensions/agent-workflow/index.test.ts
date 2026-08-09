import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createExtension, { workflowPrompt } from "./index.js";

const planText = "## Current state\n\nA.\n\n## Desired state\n\nB.\n";

function harness(cwd = "/pi-director-index-test-nonexistent", hasUI = true) {
  const handlers = new Map<string, Array<(event?: any, ctx?: any) => any>>();
  const commands = new Map<
    string,
    { handler: (args: string, ctx: any) => Promise<void> }
  >();
  const tools: any[] = [];
  const branch: any[] = [];
  const seeded: any[] = [];
  const notify = vi.fn();
  const select = vi.fn(async () => undefined as string | undefined);
  let sessionName: string | undefined;
  const pi = {
    on: vi.fn((name: string, handler: (event?: any, ctx?: any) => any) => {
      handlers.set(name, [...(handlers.get(name) ?? []), handler]);
    }),
    registerCommand: vi.fn((name: string, command: any) =>
      commands.set(name, command),
    ),
    registerEntryRenderer: vi.fn(),
    registerTool: vi.fn((tool: any) => tools.push(tool)),
    getSessionName: vi.fn(() => sessionName),
    setSessionName: vi.fn((name: string) => {
      sessionName = name;
    }),
    sendMessage: vi.fn(),
    sendUserMessage: vi.fn(),
    appendEntry: vi.fn((customType: string, data: unknown) =>
      branch.push({ type: "custom", customType, data }),
    ),
    events: { emit: vi.fn(), on: vi.fn() },
  };
  createExtension(pi as any);
  const next = { hasUI: true, sendUserMessage: vi.fn(async () => {}) };
  const newSession = vi.fn(async (options: any) => {
    await options.setup?.({
      appendSessionInfo: (name: string) => {
        sessionName = name;
      },
      appendCustomEntry: (customType: string, data: unknown) =>
        seeded.push({ customType, data }),
    });
    await options.withSession?.(next);
    return { cancelled: false };
  });
  const ctx = {
    hasUI,
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

  const inject = async (
    prompt = "do the thing",
  ): Promise<string | undefined> => {
    const injectors = handlers.get("before_agent_start")!;
    const result = await injectors[injectors.length - 1](
      { systemPrompt: "base", prompt },
      ctx,
    );
    return result === undefined
      ? undefined
      : (result.systemPrompt as string).replace(/\s+/g, " ").trim();
  };

  return {
    handlers,
    commands,
    tools,
    branch,
    notify,
    select,
    inject,
    ctx,
    newSession,
    next,
    seeded,
    pi,
  };
}

describe("workflow prompt", () => {
  it("registers the workflow surfaces and injects one constant contract", async () => {
    const h = harness();
    const prompt = await h.inject();
    expect(prompt!.startsWith("base")).toBe(true);
    expect(prompt!.match(/<pi_workflow>/g)).toHaveLength(1);
    expect(prompt).toContain("<pi_workflow_mode>ask</pi_workflow_mode>");
    expect([...h.commands.keys()]).toEqual([
      "ask",
      "spec",
      "vibe",
      "mode",
      "handoff",
    ]);
    expect(h.tools.map((tool) => tool.name)).toEqual([
      "start_task",
      "save_plan",
    ]);
    expect(h.handlers.has("agent_settled")).toBe(true);
  });

  it("stays compact and keeps mode ownership with the User", () => {
    const prompt = workflowPrompt();
    expect(prompt.length).toBeLessThanOrEqual(4_800);
    expect(prompt).toContain("Mode is the User's");
    expect(prompt).toContain("it never adopts one");
    expect(prompt).toContain("RUN BLOCK[mode] — never another block");
    expect(prompt).toContain("mode = ASK on session start");
  });

  it("keeps Ask and Spec read-only and Vibe the only execution engine", () => {
    const prompt = workflowPrompt();
    expect(prompt).toContain("BLOCK ASK — align and decide. No mutations.");
    expect(prompt).toContain("BLOCK SPEC — research and design. No mutations.");
    expect(prompt).toContain("BLOCK VIBE — the only execution engine.");
  });

  it("routes a blocker to the picker instead of a mid-turn interrogation", () => {
    const prompt = workflowPrompt();
    expect(prompt).toContain("ON BLOCKER in SPEC or VIBE");
    expect(prompt).toContain("do not interrogate mid-turn");
    expect(prompt).toContain("The picker carries the decision");
  });

  it("binds the session to one artifact and preserves safety and close-out", () => {
    const prompt = workflowPrompt();
    expect(prompt).toContain("One session owns one .pi/plan/<name>.md");
    expect(prompt).toContain("A new goal needs a new session");
    expect(prompt).toContain("resume from with no transcript");
    expect(prompt).toContain("keep their normal permission in every mode");
    expect(prompt).toContain("Never claim User acceptance");
  });

  it("keeps the large contract byte-identical", () => {
    expect(workflowPrompt()).toBe(workflowPrompt());
  });
});

describe("session mode", () => {
  it("starts in Ask without asking, and reuses the persisted choice", async () => {
    const h = harness();
    expect(await h.inject("first request")).toContain(
      "<pi_workflow_mode>ask</pi_workflow_mode>",
    );
    expect(h.select).not.toHaveBeenCalled();
    expect(
      h.branch.filter((entry) => entry.customType === "agent-workflow:mode"),
    ).toHaveLength(1);
    await h.inject("follow-up");
    expect(
      h.branch.filter((entry) => entry.customType === "agent-workflow:mode"),
    ).toHaveLength(1);
  });

  it("injects nothing at all without an interactive UI", async () => {
    const h = harness("/unused", false);
    expect(await h.inject("headless request")).toBeUndefined();
    expect(h.branch).toHaveLength(0);
  });

  it("switches only through commands and does not trigger a turn", async () => {
    const h = harness();
    for (const mode of ["vibe", "spec", "ask"]) {
      await h.commands.get(mode)!.handler("", h.ctx);
      expect(h.branch.at(-1)).toMatchObject({
        customType: "agent-workflow:mode",
        data: { mode },
      });
    }
    expect(h.pi.sendUserMessage).not.toHaveBeenCalled();
  });

  it("records an actual switch in the current artifact without triggering work", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "pi-index-mode-log-"));
    try {
      await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
      await writeFile(
        join(cwd, ".pi", "plan", "dashboard-polish.md"),
        "# dashboard-polish\n\n## Decisions\n\nInitial direction.\n\n## Checklist\n\n- [ ] Polish\n",
      );
      const h = harness(cwd);
      h.pi.setSessionName("dashboard-polish");
      await h.commands.get("vibe")!.handler("", h.ctx);
      const artifact = await readFile(
        join(cwd, ".pi", "plan", "dashboard-polish.md"),
        "utf8",
      );
      expect(artifact).toContain("Workflow mode changed to Vibe.");
      expect(h.pi.sendUserMessage).not.toHaveBeenCalled();
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});

describe("handoff command", () => {
  let cwd: string;
  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "pi-index-handoff-"));
  });
  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  async function seed() {
    await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
    await writeFile(join(cwd, ".pi", "plan", "dashboard-polish.md"), planText);
  }

  it("checkpoints the artifact before spawning, and carries the mode across", async () => {
    await seed();
    const h = harness(cwd);
    await h.commands.get("vibe")!.handler("", h.ctx);
    await h.commands.get("handoff")!.handler("", h.ctx);

    expect(h.pi.sendUserMessage).toHaveBeenCalledWith(
      expect.stringContaining(
        "bring .pi/plan/dashboard-polish.md fully up to date",
      ),
    );
    const checkpointOrder = h.pi.sendUserMessage.mock.invocationCallOrder[0];
    expect(checkpointOrder).toBeLessThan(
      h.newSession.mock.invocationCallOrder[0],
    );
    expect(h.ctx.waitForIdle).toHaveBeenCalled();
    expect(h.seeded).toEqual([
      { customType: "agent-workflow:mode", data: { mode: "vibe" } },
    ]);
    expect(h.next.sendUserMessage).toHaveBeenCalledWith(
      expect.stringContaining(
        "Continue the task recorded at .pi/plan/dashboard-polish.md in Vibe mode",
      ),
    );
  });

  it("warns without spawning or checkpointing when no plan exists", async () => {
    const h = harness(cwd);
    await h.commands.get("handoff")!.handler("", h.ctx);
    expect(h.notify).toHaveBeenCalledWith(
      expect.stringContaining("plan first"),
      "warning",
    );
    expect(h.pi.sendUserMessage).not.toHaveBeenCalled();
    expect(h.newSession).not.toHaveBeenCalled();
  });
});

describe("scaffolding", () => {
  let cwd: string;
  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "pi-index-scaffold-"));
  });
  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  it("scaffolds one flat artifact once", async () => {
    const h = harness(cwd);
    await h.inject("please fix the flaky login test");
    const name = h.pi.setSessionName.mock.calls[0][0] as string;
    const scaffold = await readFile(
      join(cwd, ".pi", "plan", `${name}.md`),
      "utf8",
    );
    expect(scaffold).toContain("## Decisions");
    expect(scaffold).toContain("## Work log");
    expect(scaffold).toContain("### QA steps");

    await h.inject("keep going");
    expect(h.pi.setSessionName).toHaveBeenCalledTimes(1);
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
