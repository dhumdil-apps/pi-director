import { describe, expect, it, vi } from "vitest";

import createExtension from "./index.js";

const theme = { fg: (color: string, text: string) => `[${color}]${text}`, getFgAnsi: () => "" };

/** The blocks meter emits SGR resets around every glyph; assertions read the glyphs. */
const strip = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, "");
/** Five partial-height blocks represent the context-window percentage. */
const bar = (glyphs: string) => [...glyphs].join(" ");

function harness() {
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
    getSessionName: vi.fn(() => "debug-login"),
  };
  createExtension(pi as any);
  return { handlers, listeners, emitted, tools };
}

const phaseEntry = (phase: "explore" | "plan" | "execute") => ({
  type: "custom",
  customType: "agent-workflow:phase",
  data: { phase },
});

function ctxWith(widgets: Array<[string, any]>, branch: any[] = []) {
  return {
    cwd: "/work",
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
      "[accent]› [dim]What’s your goal?",
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
    expect(strip(indicator(widgets)[0])).toContain("[dim]What’s your goal?");
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

    await handlers.get("turn_end")![0]({}, ctx);
    expect(indicator(widgets, 120).map(strip)[1]).toContain("[dim]init tokens 84.0k");

    // A replacement session starts clean until its first completed turn.
    await handlers.get("session_start")![0]({}, ctx);
    expect(indicator(widgets).map(strip)[1]).not.toContain("init tokens");
  });

  it("accumulates working intervals, pauses while idle, and resets with the session", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const { handlers } = harness();
      const widgets: Array<[string, any]> = [];
      const ctx = ctxWith(widgets);
      await handlers.get("session_start")![0]({}, ctx);

      await handlers.get("agent_start")![0]({}, ctx);
      now.mockReturnValue(6_000);
      let active = indicatorComponent(widgets);
      expect(strip(active.render(80)[0])).toContain("[dim] 5s");
      active.dispose();

      now.mockReturnValue(7_000);
      await handlers.get("agent_settled")![0]({}, ctx);
      expect(strip(indicator(widgets)[0])).toContain("[dim] 6s");

      // Wall time while idle does not change the accumulated total.
      now.mockReturnValue(100_000);
      expect(strip(indicator(widgets)[0])).toContain("[dim] 6s");

      await handlers.get("agent_start")![0]({}, ctx);
      now.mockReturnValue(104_000);
      active = indicatorComponent(widgets);
      expect(strip(active.render(80)[0])).toContain("[dim] 10s");
      active.dispose();

      now.mockReturnValue(105_000);
      await handlers.get("agent_settled")![0]({}, ctx);
      expect(strip(indicator(widgets)[0])).toContain("[dim] 11s");

      await handlers.get("session_start")![0]({}, ctx);
      expect(strip(indicator(widgets)[0])).not.toContain("[dim] 11s");
    } finally {
      now.mockRestore();
    }
  });

  it("reports the context readout to observers", async () => {
    const { handlers, emitted } = harness();
    await handlers.get("session_start")![0]({}, ctxWith([]));

    const [, status] = emitted.findLast(([name]) => name === "agent-status:update")!;
    expect(status).toMatchObject({ contextUsed: 84_000, contextMax: 1_000_000, cwd: "/work", phase: undefined, sessionName: "debug-login" });
  });
});
