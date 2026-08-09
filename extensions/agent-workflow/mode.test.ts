import { describe, expect, it, vi } from "vitest";
import {
  deriveWorkflowMode,
  hasEnteredVibe,
  normalizeWorkflowMode,
  recordWorkflowMode,
  workflowModePrompt,
} from "./mode.js";

function harness() {
  const branch: any[] = [];
  const emitted: Array<[string, unknown]> = [];
  const pi = {
    appendEntry: vi.fn((customType: string, data: unknown) =>
      branch.push({ type: "custom", customType, data }),
    ),
    events: {
      emit: vi.fn((name: string, data: unknown) => emitted.push([name, data])),
    },
  };
  return { pi, branch, emitted };
}

function entry(mode: string) {
  return { type: "custom", customType: "agent-workflow:mode", data: { mode } };
}

describe("workflow mode", () => {
  it("persists the latest selected mode", () => {
    const h = harness();
    recordWorkflowMode(h.pi as never, "vibe");
    recordWorkflowMode(h.pi as never, "spec");
    expect(deriveWorkflowMode(h.branch)).toBe("spec");
    expect(h.emitted).toContainEqual(["agent-workflow:mode", { mode: "spec" }]);
  });

  it("leaves an unstarted session without a persisted mode", () => {
    expect(deriveWorkflowMode([])).toBeUndefined();
  });

  it.each([
    ["explore", "spec"],
    ["plan", "spec"],
    ["execute", "vibe"],
    ["align", "ask"],
    ["ask", "ask"],
    ["spec", "spec"],
    ["vibe", "vibe"],
  ])("folds the legacy value %s onto %s", (legacy, expected) => {
    expect(normalizeWorkflowMode(legacy)).toBe(expected);
    expect(deriveWorkflowMode([entry(legacy)] as never)).toBe(expected);
  });

  it("rejects an unrecognised value instead of guessing", () => {
    expect(normalizeWorkflowMode("review")).toBeUndefined();
    expect(deriveWorkflowMode([entry("review")] as never)).toBeUndefined();
  });

  it("reports execution once Vibe has been entered, including via a legacy entry", () => {
    expect(hasEnteredVibe([entry("ask"), entry("spec")] as never)).toBe(false);
    expect(hasEnteredVibe([entry("vibe"), entry("spec")] as never)).toBe(true);
    expect(hasEnteredVibe([entry("execute")] as never)).toBe(true);
  });

  it("keeps the dynamic marker tiny", () => {
    expect(workflowModePrompt("vibe")).toBe(
      "<pi_workflow_mode>vibe</pi_workflow_mode>",
    );
  });
});
