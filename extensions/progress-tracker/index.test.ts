import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { readPlanTiming, readTimeSpent, withTimeSpent } from "../agent-workflow/plan-time.js";
import { USER_WAIT_EVENT } from "../agent-workflow/user-wait.js";
import createExtension from "./index.js";

const theme = { fg: (color: string, text: string) => `[${color}]${text}`, getFgAnsi: () => "" };

/** The blocks meter emits SGR resets around every glyph; assertions read the glyphs. */
const strip = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, "");
/** Five partial-height blocks represent the context-window percentage. */
const bar = (glyphs: string) => [...glyphs].join(" ");

function harness(sessionName = "debug-login") {
  const handlers = new Map<string, Array<(event: unknown, ctx: unknown) => Promise<void>>>();
  const listeners = new Map<string, Array<(value: unknown) => void>>();
  const emitted: Array<[string, any]> = [];
  const tools: any[] = [];
  const pi = {
    on: vi.fn((name: string, handler: (event: unknown, ctx: unknown) => Promise<void>) => {
      handlers.set(name, [...(handlers.get(name) ?? []), handler]);
    }),
    events: {
      on: vi.fn((name: string, listener: (value: unknown) => void) => {
        listeners.set(name, [...(listeners.get(name) ?? []), listener]);
      }),
      emit: vi.fn((name: string, value: any) => emitted.push([name, value])),
    },
    registerTool: vi.fn((tool: any) => tools.push(tool)),
    registerCommand: vi.fn(),
    sendMessage: vi.fn(),
    getSessionName: vi.fn(() => sessionName),
  };
  createExtension(pi as any);
  return { handlers, listeners, emitted, tools };
}

const phaseEntry = (phase: "explore" | "plan" | "execute") => ({
  type: "custom",
  customType: "agent-workflow:phase",
  data: { phase },
});

const assistantEntry = (timestamp: number) => ({
  type: "message",
  message: { role: "assistant", timestamp, content: [], usage: {} },
});

function ctxWith(widgets: Array<[string, any]>, branch: any[] = [], cwd = "/work") {
  return {
    cwd,
    isIdle: () => true,
    getContextUsage: () => ({ tokens: 84_000, contextWindow: 1_000_000, percent: 8.4 }),
    sessionManager: { getBranch: () => branch },
    ui: {
      setWorkingVisible: () => {},
      setWidget: (id: string, factory: unknown) => widgets.push([id, factory]),
    },
  };
}

function indicatorComponent(widgets: Array<[string, any]>): any {
  const [, factory] = widgets.findLast(([id]) => id === "workflow-phase")!;
  return factory({ requestRender: () => {} }, theme);
}

function indicator(widgets: Array<[string, any]>, width = 80): string[] {
  return indicatorComponent(widgets).render(width);
}

describe("progress tracker indicator", () => {
  it("renders the pre-plan goal prompt and the context readout on its own line", async () => {
    const { handlers } = harness();
    const widgets: Array<[string, any]> = [];
    await handlers.get("session_start")![0]({}, ctxWith(widgets));
    expect(indicator(widgets).map(strip)).toEqual([
      "[accent]› [dim]What’s your goal?",
      `  [accent]LLM Attention Span (ctx) ${bar("▃    ")} [accent]84.0k / 1.0M`,
    ]);
  });

  it("updates the idle prompt above the context readout once a plan is approved", async () => {
    const { handlers, listeners } = harness();
    const widgets: Array<[string, any]> = [];
    const ctx = ctxWith(widgets);
    await handlers.get("session_start")![0]({}, ctx);

    listeners.get("agent-workflow:phase")![0]({ phase: "plan" });
    expect(indicator(widgets).map(strip)).toEqual([
      "[accent]› [dim]What’s the plan?",
      `  [accent]LLM Attention Span (ctx) ${bar("▃    ")} [accent]84.0k / 1.0M`,
    ]);

    listeners.get("agent-workflow:phase")![0]({ phase: "execute" });
    expect(strip(indicator(widgets)[0])).toContain("[accent]What’s up next?");
  });

  it("derives execute from the phase entry seeded before a handoff session starts", async () => {
    const { handlers } = harness();
    const widgets: Array<[string, any]> = [];
    await handlers.get("session_start")![0]({}, ctxWith(widgets, [phaseEntry("execute")]));
    expect(strip(indicator(widgets)[0])).toContain("[accent]What’s up next?");
  });

  it("reconstructs the latest revision phase on tree changes", async () => {
    const { handlers } = harness();
    const widgets: Array<[string, any]> = [];
    const branch = [phaseEntry("execute")];
    const ctx = ctxWith(widgets, branch);
    await handlers.get("session_start")![0]({}, ctx);

    branch.push(phaseEntry("explore"), phaseEntry("plan"));
    await handlers.get("session_tree")![0]({}, ctx);
    expect(strip(indicator(widgets)[0])).toContain("[dim]What’s the plan?");
  });

  it("does not leak the previous phase into a replacement session", async () => {
    const { handlers, emitted } = harness();
    const widgets: Array<[string, any]> = [];
    await handlers.get("session_start")![0]({}, ctxWith(widgets, [phaseEntry("execute")]));
    await handlers.get("session_start")![0]({}, ctxWith(widgets));

    expect(strip(indicator(widgets)[0])).toContain("[dim]What’s your goal?");
    const [, status] = emitted.findLast(([name]) => name === "agent-status:update")!;
    expect(status.phase).toBeUndefined();
  });

  it("retains the provider-reported first-turn total alongside live context", async () => {
    const { handlers } = harness();
    const widgets: Array<[string, any]> = [];
    const ctx = ctxWith(widgets);
    await handlers.get("session_start")![0]({}, ctx);

    await handlers.get("turn_end")![0]({
      message: { role: "assistant", usage: { totalTokens: 6_400 } },
    }, ctx);
    expect(indicator(widgets, 120).map(strip)[1]).toContain("[dim]📦 init 6.4k");

    // A replacement session starts clean until its first completed turn.
    await handlers.get("session_start")![0]({}, ctx);
    expect(indicator(widgets).map(strip)[1]).not.toContain("📦 init");
  });

  it("shows task work while active, cache age while idle, and resets with the session", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const { handlers } = harness();
      const widgets: Array<[string, any]> = [];
      const ctx = ctxWith(widgets);
      await handlers.get("session_start")![0]({}, ctx);

      await handlers.get("agent_start")![0]({}, ctx);
      now.mockReturnValue(6_000);
      let active = indicatorComponent(widgets);
      expect(strip(active.render(120)[0])).toContain("[dim] 5s");
      active.dispose();

      now.mockReturnValue(6_500);
      await handlers.get("message_end")![0]({ message: { role: "assistant", timestamp: 6_500 } }, ctx);
      now.mockReturnValue(7_000);
      await handlers.get("agent_settled")![0]({}, ctx);
      expect(strip(indicator(widgets, 160)[0])).toContain("[accent] 0s[dim] · [accent]explore 6s");

      now.mockReturnValue(100_000);
      expect(strip(indicator(widgets)[0])).toContain("[warning] 1m 33s");

      await handlers.get("agent_start")![0]({}, ctx);
      now.mockReturnValue(104_000);
      active = indicatorComponent(widgets);
      expect(strip(active.render(120)[0])).toContain("[dim] 4s");
      active.dispose();

      now.mockReturnValue(104_500);
      await handlers.get("message_end")![0]({ message: { role: "assistant", timestamp: 104_500 } }, ctx);
      now.mockReturnValue(105_000);
      await handlers.get("agent_settled")![0]({}, ctx);
      expect(strip(indicator(widgets, 160)[0])).toContain("[accent] 0s[dim] · [accent]explore 11s");

      await handlers.get("session_start")![0]({}, ctx);
      expect(strip(indicator(widgets)[0])).not.toMatch(/\] \d/);
    } finally {
      now.mockRestore();
    }
  });

  it("pauses task work and shows the static phase prompt plus cache age during user dialogs", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const { handlers, listeners, emitted } = harness();
      const widgets: Array<[string, any]> = [];
      const ctx = ctxWith(widgets);
      await handlers.get("session_start")![0]({}, ctx);
      listeners.get("agent-workflow:phase")![0]({ phase: "plan" });
      await handlers.get("agent_start")![0]({}, ctx);

      now.mockReturnValue(5_000);
      await handlers.get("message_end")![0]({ message: { role: "assistant", timestamp: 5_000 } }, ctx);
      listeners.get(USER_WAIT_EVENT)![0]({ waiting: true, reason: "approval" });
      expect(strip(indicator(widgets)[0])).toContain("[dim]What’s the plan?[accent] 0s");
      const [, waitingStatus] = emitted.findLast(([name]) => name === "agent-status:update")!;
      expect(waitingStatus.working).toBe(true);

      now.mockReturnValue(65_000);
      expect(strip(indicator(widgets)[0])).toContain("[warning] 1m 00s");
      listeners.get(USER_WAIT_EVENT)![0]({ waiting: false, reason: "approval" });
      now.mockReturnValue(67_000);
      expect(strip(indicator(widgets, 160)[0])).toContain("[dim] 2s[dim] · [dim]explore 0s[dim] · [accent]plan 6s");

      now.mockReturnValue(68_000);
      await handlers.get("agent_settled")![0]({}, ctx);
      await handlers.get("agent_start")![0]({}, ctx);
      expect(strip(indicator(widgets, 160)[0])).toContain("[dim] 0s[dim] · [dim]explore 0s[dim] · [accent]plan 7s");
    } finally {
      now.mockRestore();
    }
  });

  it("persists task work and restores task time plus cache age in a replacement session", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "pi-progress-time-"));
    const path = join(cwd, ".pi", "plan", "debug-login.md");
    await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
    await writeFile(path, withTimeSpent("# debug-login\n\nBody.\n", "debug-login", 60_000));
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const first = harness();
      const widgets: Array<[string, any]> = [];
      const branch = [assistantEntry(500)];
      const ctx = ctxWith(widgets, branch, cwd);
      await first.handlers.get("session_start")![0]({}, ctx);
      expect(strip(indicator(widgets)[0])).toContain("[accent] 0s");

      await first.handlers.get("agent_start")![0]({}, ctx);
      now.mockReturnValue(6_000);
      expect(strip(indicator(widgets, 160)[0])).toContain("[dim] 5s[dim] · [accent]explore 5s");
      await first.handlers.get("message_end")![0]({ message: { role: "assistant", timestamp: 6_000 } }, ctx);
      branch.push(assistantEntry(6_000));
      await first.handlers.get("agent_settled")![0]({}, ctx);
      const persisted = await readFile(path, "utf8");
      expect(readTimeSpent(persisted)).toBe(65_000);
      expect(readPlanTiming(persisted)).toEqual({ exploreMs: 5_000, planMs: 0, executeMs: 0, unallocatedMs: 60_000 });

      now.mockReturnValue(10_000);
      const replacement = harness();
      const restored: Array<[string, any]> = [];
      const restoredCtx = ctxWith(restored, branch, cwd);
      await replacement.handlers.get("session_start")![0]({}, restoredCtx);
      expect(strip(indicator(restored)[0])).toContain("[accent] 4s");
      await replacement.handlers.get("agent_start")![0]({}, restoredCtx);
      expect(strip(indicator(restored, 160)[0])).toContain("[dim] 0s[dim] · [accent]explore 5s");
    } finally {
      now.mockRestore();
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it("splits an active run immediately when the workflow phase changes", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "pi-progress-phases-"));
    const path = join(cwd, ".pi", "plan", "debug-login.md");
    await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
    await writeFile(path, "# debug-login\n\nBody.\n");
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const { handlers, listeners } = harness();
      const widgets: Array<[string, any]> = [];
      const ctx = ctxWith(widgets, [], cwd);
      await handlers.get("session_start")![0]({}, ctx);
      await handlers.get("agent_start")![0]({}, ctx);

      now.mockReturnValue(3_000);
      listeners.get("agent-workflow:phase")![0]({ phase: "plan" });
      expect(strip(indicator(widgets, 240)[0])).toContain("[dim] 0s[dim] · [dim]explore 2s[dim] · [accent]plan 0s[dim] · [dim]execute 0s");

      now.mockReturnValue(7_000);
      listeners.get("agent-workflow:phase")![0]({ phase: "execute" });
      expect(strip(indicator(widgets, 240)[0])).toContain("[dim] 0s[dim] · [dim]explore 2s[dim] · [dim]plan 4s[dim] · [accent]execute 0s");

      now.mockReturnValue(10_000);
      expect(strip(indicator(widgets, 240)[0])).toContain("[dim] 3s[dim] · [dim]explore 2s[dim] · [dim]plan 4s[dim] · [accent]execute 3s");
      now.mockReturnValue(11_000);
      await handlers.get("agent_settled")![0]({}, ctx);

      expect(readPlanTiming(await readFile(path, "utf8"))).toEqual({
        exploreMs: 2_000,
        planMs: 4_000,
        executeMs: 4_000,
        unallocatedMs: 0,
      });
    } finally {
      now.mockRestore();
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it("lazily upgrades a marker-free legacy plan on its next settled run", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "pi-progress-legacy-"));
    const path = join(cwd, ".pi", "plan", "legacy-task.md");
    await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
    await writeFile(path, "## Current state\n\nLegacy body.\n");
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const { handlers } = harness("legacy-task");
      const widgets: Array<[string, any]> = [];
      const ctx = ctxWith(widgets, [], cwd);
      await handlers.get("session_start")![0]({}, ctx);
      expect(strip(indicator(widgets)[0])).not.toContain("[dim] 0s");
      expect(await readFile(path, "utf8")).toBe("## Current state\n\nLegacy body.\n");

      await handlers.get("agent_start")![0]({}, ctx);
      now.mockReturnValue(4_000);
      await handlers.get("agent_settled")![0]({}, ctx);
      expect(readTimeSpent(await readFile(path, "utf8"))).toBe(3_000);
      expect(await readFile(path, "utf8")).toContain("Legacy body.");
    } finally {
      now.mockRestore();
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it("reports the context readout to observers", async () => {
    const { handlers, emitted } = harness();
    await handlers.get("session_start")![0]({}, ctxWith([]));

    const [, status] = emitted.findLast(([name]) => name === "agent-status:update")!;
    expect(status).toMatchObject({ contextUsed: 84_000, contextMax: 1_000_000, cwd: "/work", phase: undefined, sessionName: "debug-login" });
  });
});
