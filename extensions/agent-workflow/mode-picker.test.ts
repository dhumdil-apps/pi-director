import { describe, expect, it, vi } from "vitest";
import {
  CONTINUE_OPTION,
  HANDOFF_OPTION,
  modeOptions,
  openModePicker,
  registerModePicker,
  suppressModePicker,
  WRITE_CUSTOM_OPTION,
} from "./mode-picker.js";

function harness(choice: string | undefined, hasUI = true, mode?: string) {
  const branch: any[] = mode
    ? [{ type: "custom", customType: "agent-workflow:mode", data: { mode } }]
    : [];
  const handlers = new Map<string, (event?: any, ctx?: any) => any>();
  const setEditorText = vi.fn();
  const notify = vi.fn();
  const select = vi.fn(async () => choice);
  const pi = {
    on: vi.fn((name: string, handler: any) => handlers.set(name, handler)),
    appendEntry: vi.fn((customType: string, data: unknown) =>
      branch.push({ type: "custom", customType, data }),
    ),
    events: { emit: vi.fn() },
    getSessionName: vi.fn(() => "dashboard-polish"),
    sendUserMessage: vi.fn(),
  };
  const ctx = {
    hasUI,
    cwd: "/pi-director-mode-picker-nonexistent",
    ui: { select, notify, setEditorText, getEditorText: () => "" },
    getContextUsage: () => undefined,
    sessionManager: { getBranch: () => branch },
  };
  return { pi, ctx, branch, select, notify, setEditorText, handlers };
}

const modeEntries = (branch: any[]) =>
  branch.filter((entry) => entry.customType === "agent-workflow:mode");

describe("mode picker options", () => {
  it("offers the recommended step, the other two modes, handoff, and the escape hatch", () => {
    expect(modeOptions("ask", true)).toEqual([
      CONTINUE_OPTION,
      "Switch to Spec",
      "Switch to Vibe",
      HANDOFF_OPTION,
      WRITE_CUSTOM_OPTION,
    ]);
    expect(modeOptions("vibe", true)).toEqual([
      CONTINUE_OPTION,
      "Switch to Ask",
      "Switch to Spec",
      HANDOFF_OPTION,
      WRITE_CUSTOM_OPTION,
    ]);
  });

  it("leads with handoff once the context is loaded", () => {
    const options = modeOptions("vibe", false);
    expect(options[0]).toBe(`${HANDOFF_OPTION} (recommended)`);
    expect(options.at(-1)).toBe(WRITE_CUSTOM_OPTION);
  });
});

describe("mode picker", () => {
  it("persists the User's switch and starts no turn", async () => {
    const h = harness("Switch to Vibe", true, "ask");
    await openModePicker(h.pi as never, h.ctx as never);
    expect(modeEntries(h.branch).at(-1)).toMatchObject({
      data: { mode: "vibe" },
    });
    expect(h.pi.sendUserMessage).not.toHaveBeenCalled();
  });

  it("continues in the current mode without changing it", async () => {
    const h = harness(CONTINUE_OPTION, true, "spec");
    await openModePicker(h.pi as never, h.ctx as never);
    expect(h.pi.sendUserMessage).toHaveBeenCalledWith(
      "Continue with the recommended next step.",
    );
    expect(modeEntries(h.branch)).toHaveLength(1);
  });

  it.each([
    ["dismissal", undefined],
    ["the custom option", WRITE_CUSTOM_OPTION],
  ])(
    "returns to typing on %s without changing the mode or starting a turn",
    async (_label, choice) => {
      const h = harness(choice as string | undefined, true, "spec");
      await openModePicker(h.pi as never, h.ctx as never);
      expect(modeEntries(h.branch)).toHaveLength(1);
      expect(h.pi.sendUserMessage).not.toHaveBeenCalled();
      expect(h.setEditorText).not.toHaveBeenCalled();
    },
  );

  it("prepares the handoff command instead of spawning from the picker", async () => {
    const h = harness(`${HANDOFF_OPTION} (recommended)`, true, "vibe");
    await openModePicker(h.pi as never, h.ctx as never);
    expect(h.setEditorText).toHaveBeenCalledWith("/handoff dashboard-polish");
    expect(modeEntries(h.branch)).toHaveLength(1);
  });

  it("resolves the checkpoint on every outcome so picker latency is bounded", async () => {
    const h = harness("Switch to Spec", true, "ask");
    await openModePicker(h.pi as never, h.ctx as never);
    const checkpoints = h.branch.filter(
      (entry) => entry.customType === "agent-workflow:checkpoint",
    );
    expect(checkpoints.map((entry) => entry.data.action)).toEqual([
      "open",
      "resolve",
    ]);
  });

  it("stays out of the way without an interactive UI", async () => {
    const h = harness("Switch to Vibe", false, "ask");
    await openModePicker(h.pi as never, h.ctx as never);
    expect(h.select).not.toHaveBeenCalled();
    expect(modeEntries(h.branch)).toHaveLength(1);
  });

  it("skips exactly one settlement when a handoff checkpoint turn is in flight", async () => {
    const h = harness("Switch to Vibe", true, "ask");
    registerModePicker(h.pi as never);
    const settled = h.handlers.get("agent_settled")!;

    suppressModePicker();
    await settled({}, h.ctx);
    expect(h.select).not.toHaveBeenCalled();

    await settled({}, h.ctx);
    expect(h.select).toHaveBeenCalledTimes(1);
  });
});
