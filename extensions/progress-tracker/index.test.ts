import { describe, expect, it, vi } from "vitest";

vi.mock("../extension-preferences/index.js", () => ({
  getSetting: (_extension: string, id: string, fallback: string) =>
    id === "bar-style" ? "continuous" : id === "bar-width" ? "10" : fallback,
}));

import createExtension from "./index.js";

const theme = { fg: (color: string, text: string) => `[${color}]${text}`, getFgAnsi: () => "" };

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
    expect(indicator(widgets)).toBe("[accent]› [accent]ctx [accent]▉          [accent]84.0k / 1.0M");
  });

  it("reports context state to observers without a workflow phase or session mode", async () => {
    const { handlers, emitted } = harness();
    await handlers.get("session_start")![0]({}, ctxWith([]));

    const [, status] = emitted.findLast(([name]) => name === "agent-status:update")!;
    expect("phase" in status).toBe(false);
    expect("mode" in status).toBe(false);
  });

  it("subscribes to no workflow-mode event", () => {
    expect(harness().listeners.size).toBe(0);
  });

  it("registers no tool: the indicator observes, it does not ask the agent for input", () => {
    expect(harness().tools).toEqual([]);
  });
});
