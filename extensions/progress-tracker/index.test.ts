import { describe, expect, it, vi } from "vitest";

import createExtension from "./index.js";

const theme = { fg: (color: string, text: string) => `[${color}]${text}`, getFgAnsi: () => "" };

/** The blocks meter emits SGR resets around every glyph; assertions read the glyphs. */
const strip = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, "");
/** Ten block levels, rendered space-separated. */
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
  };
  createExtension(pi as any);
  return { handlers, listeners, emitted, tools };
}

function ctxWith(widgets: Array<[string, any]>) {
  return {
    cwd: "/work",
    isIdle: () => true,
    getContextUsage: () => ({ tokens: 84_000, contextWindow: 1_000_000, percent: 8.4 }),
    sessionManager: { getBranch: () => [] },
    ui: {
      setWorkingVisible: () => {},
      setWidget: (id: string, factory: unknown) => widgets.push([id, factory]),
    },
  };
}

function indicator(widgets: Array<[string, any]>): string {
  const [, factory] = widgets.findLast(([id]) => id === "workflow-phase")!;
  return factory({ requestRender: () => {} }, theme).render(80)[0];
}

describe("progress tracker indicator", () => {
  it("renders only the context readout", async () => {
    const { handlers } = harness();
    const widgets: Array<[string, any]> = [];
    await handlers.get("session_start")![0]({}, ctxWith(widgets));
    expect(strip(indicator(widgets))).toBe(`[accent]› [accent]ctx ${bar("▇         ")} [accent]84.0k / 1.0M`);
  });

  it("reports the context readout to observers", async () => {
    const { handlers, emitted } = harness();
    await handlers.get("session_start")![0]({}, ctxWith([]));

    const [, status] = emitted.findLast(([name]) => name === "agent-status:update")!;
    expect(status).toMatchObject({ contextUsed: 84_000, contextMax: 1_000_000, cwd: "/work" });
  });
});
