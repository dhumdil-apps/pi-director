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

function indicator(widgets: Array<[string, any]>, width = 80): string[] {
  const [, factory] = widgets.findLast(([id]) => id === "workflow-phase")!;
  return factory({ requestRender: () => {} }, theme).render(width);
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

  it("derives execute from a handoff-seeded branch, where no transition is ever emitted", async () => {
    const { handlers } = harness();
    const widgets: Array<[string, any]> = [];
    const branch = [
      { type: "message", message: { role: "user", content: "Execute the approved plan at .pi/plan/x.md." } },
    ];
    await handlers.get("session_start")![0]({}, ctxWith(widgets, branch));
    expect(strip(indicator(widgets)[0])).toContain("[accent]What’s up next?");
  });

  it("retains the provider-reported first-turn total alongside live context", async () => {
    const { handlers } = harness();
    const widgets: Array<[string, any]> = [];
    const ctx = ctxWith(widgets);
    await handlers.get("session_start")![0]({}, ctx);

    await handlers.get("turn_end")![0]({}, ctx);
    expect(indicator(widgets, 120).map(strip)[1]).toContain("[dim]first total 84.0k");

    // A replacement session starts clean until its first completed turn.
    await handlers.get("session_start")![0]({}, ctx);
    expect(indicator(widgets).map(strip)[1]).not.toContain("first total");
  });

  it("reports the context readout to observers", async () => {
    const { handlers, emitted } = harness();
    await handlers.get("session_start")![0]({}, ctxWith([]));

    const [, status] = emitted.findLast(([name]) => name === "agent-status:update")!;
    expect(status).toMatchObject({ contextUsed: 84_000, contextMax: 1_000_000, cwd: "/work", phase: undefined, sessionName: "debug-login" });
  });
});
