import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateNextGate,
  hasStandaloneDecisionId,
  inspectNextActions,
  normalizeAction,
  type NextGateEvent,
} from "../extensions/agent-workflow/next-actions.ts";
import {
  isRedundantAlignEstablish,
  metaPickerLabels,
  RETURN_ALIGN_OPTION,
  RETURN_OPTION,
  withoutRedundantAlignEstablish,
} from "../extensions/agent-workflow/picker-meta.ts";
import { optionReferences, orderedOptions, pickerLabel } from "../extensions/agent-workflow/question-labels.ts";

const PLAN_ERROR = "No plan under .pi/plan/ — start a task first.";

function nextEvent(raw: unknown[]): NextGateEvent {
  const inspected = inspectNextActions(raw);
  return {
    hasActions: raw.length > 0,
    allTargetsValid: inspected.allTargetsValid,
    reasonsValid: inspected.reasonsValid,
    promptsValid: inspected.promptsValid,
    reviewPromptsValid: inspected.reviewPromptsValid,
  };
}

function gateText(raw: unknown[], artifact: "none" | "named" = "named"): string {
  const gate = evaluateNextGate(nextEvent(raw), artifact, PLAN_ERROR);
  assert.equal(gate.ok, false);
  return gate.message;
}

describe("next action inspection", () => {
  it("accepts valid Spec, Vibe, Align establish, Align evaluate, and handoff rows", () => {
    const raw = [
      { mode: "spec", reason: "Map next gates", prompt: "Research the validator seam." },
      { mode: "vibe", reason: "Implement enforcement", prompt: "Ship the gates and tests." },
      { mode: "align", reason: "Wait in editor", landing: "establish" },
      { mode: "align", reason: "Review the split flags", prompt: "Accept or change D1.", landing: "evaluate" },
      { mode: "handoff", reason: "Continue later on the same plan" },
    ];
    const inspected = inspectNextActions(raw);
    assert.equal(inspected.allTargetsValid, true);
    assert.equal(inspected.reasonsValid, true);
    assert.equal(inspected.promptsValid, true);
    assert.equal(inspected.reviewPromptsValid, true);
    assert.deepEqual(evaluateNextGate(nextEvent(raw), "named", PLAN_ERROR), { ok: true });
  });

  it("keeps older session rows readable when reason is missing", () => {
    const action = normalizeAction({ mode: "spec", prompt: "Legacy row without a subtitle." });
    assert.deepEqual(action, { mode: "spec", prompt: "Legacy row without a subtitle." });
  });

  it("rejects empty and whitespace-only reasons", () => {
    const missing = [{ mode: "spec", prompt: "Research the validator seam." }];
    assert.equal(inspectNextActions(missing).reasonsValid, false);
    assert.match(gateText(missing), /non-empty user-facing reason/);

    const blank = [{ mode: "spec", reason: "   ", prompt: "Research the validator seam." }];
    assert.equal(inspectNextActions(blank).reasonsValid, false);
    assert.match(gateText(blank), /non-empty user-facing reason/);
  });

  it("requires Spec and Vibe contextual prompts", () => {
    const spec = [{ mode: "spec", reason: "Map next gates" }];
    assert.equal(inspectNextActions(spec).promptsValid, false);
    assert.match(gateText(spec), /contextual prompt/);

    const vibe = [{ mode: "vibe", reason: "Implement enforcement" }];
    assert.equal(inspectNextActions(vibe).promptsValid, false);
    assert.match(gateText(vibe), /contextual prompt/);
  });

  it("allows Align establish without a prompt and forbids a handoff prompt", () => {
    const establish = [{ mode: "align", reason: "Wait in editor", landing: "establish" }];
    assert.equal(inspectNextActions(establish).promptsValid, true);
    assert.deepEqual(evaluateNextGate(nextEvent(establish), "named", PLAN_ERROR), { ok: true });

    const handoff = [{ mode: "handoff", reason: "Continue later", prompt: "Do not instruct handoff." }];
    assert.equal(inspectNextActions(handoff).promptsValid, false);
    assert.match(gateText(handoff), /handoff must omit prompt/);
  });

  it("accepts standalone D1 and D-12 review prompts", () => {
    assert.equal(hasStandaloneDecisionId("Accept or change D1."), true);
    assert.equal(hasStandaloneDecisionId("Review D-12 only."), true);
    const d1 = [{ mode: "align", reason: "Review split flags", prompt: "Accept D1.", landing: "evaluate" }];
    const hyphen = [{ mode: "align", reason: "Review hyphen ids", prompt: "Accept D-12.", landing: "evaluate" }];
    assert.equal(inspectNextActions(d1).reviewPromptsValid, true);
    assert.equal(inspectNextActions(hyphen).reviewPromptsValid, true);
    assert.deepEqual(evaluateNextGate(nextEvent(d1), "named", PLAN_ERROR), { ok: true });
    assert.deepEqual(evaluateNextGate(nextEvent(hyphen), "named", PLAN_ERROR), { ok: true });
  });

  it("rejects Align evaluate prompts without a standalone decision id", () => {
    const missingPrompt = [{ mode: "align", reason: "Review split flags", landing: "evaluate" }];
    assert.equal(inspectNextActions(missingPrompt).promptsValid, false);
    assert.match(gateText(missingPrompt), /contextual prompt|handoff must omit|establish prompt is optional/);

    const noId = [
      { mode: "align", reason: "Review split flags", prompt: "Review the open decisions.", landing: "evaluate" },
    ];
    assert.equal(inspectNextActions(noId).promptsValid, true);
    assert.equal(inspectNextActions(noId).reviewPromptsValid, false);
    assert.match(gateText(noId), /D1 or D-12/);

    const nested = [{ mode: "align", reason: "Review split flags", prompt: "See QD1 notes.", landing: "evaluate" }];
    assert.equal(inspectNextActions(nested).reviewPromptsValid, false);
    assert.match(gateText(nested), /D1 or D-12/);
  });

  it("rejects unknown targets and absent plans", () => {
    const unknown = [{ mode: "phase", reason: "Not a mode", prompt: "Nope." }];
    assert.equal(inspectNextActions(unknown).allTargetsValid, false);
    assert.match(gateText(unknown), /valid target/);

    const valid = [{ mode: "spec", reason: "Map next gates", prompt: "Research the validator seam." }];
    assert.match(gateText(valid, "none"), /No plan under \.pi\/plan/);
  });

  it("treats empty next as a no-op even without a plan", () => {
    const inspected = inspectNextActions([]);
    assert.equal(inspected.allTargetsValid, true);
    assert.equal(inspected.reasonsValid, true);
    assert.deepEqual(evaluateNextGate(nextEvent([]), "none", PLAN_ERROR), { ok: true });
  });
});

describe("mode picker trailing rows", () => {
  it("keeps Return to editor and omits Write a follow-up", () => {
    assert.deepEqual(metaPickerLabels("spec"), [RETURN_OPTION, RETURN_ALIGN_OPTION]);
    assert.deepEqual(metaPickerLabels("align"), [RETURN_OPTION]);
    assert.equal(/write a follow-up/i.test(metaPickerLabels("vibe").join("\n")), false);
  });

  it("drops agent Align-establish idle rows that duplicate static Return→ALIGN", () => {
    const rows = [
      { mode: "vibe", reason: "Ship the fix", prompt: "Implement C7.", landing: undefined },
      { mode: "align", reason: "idle editor after Spec proposal", landing: "establish" },
      { mode: "align", reason: "review open D", prompt: "Accept D1.", landing: "evaluate" },
      { mode: "handoff", reason: "Continue later" },
    ];
    assert.equal(isRedundantAlignEstablish(rows[1]!), true);
    assert.equal(isRedundantAlignEstablish(rows[2]!), false);
    assert.deepEqual(
      withoutRedundantAlignEstablish(rows).map((row) => row.mode + ":" + (row.landing ?? "")),
      ["vibe:", "align:evaluate", "handoff:"],
    );
  });
});

describe("ask picker labels", () => {
  it("shows short slugs without letter prefixes or confidence chrome", () => {
    const options = orderedOptions([
      { value: "a", label: "Ask UI first, then Align duplicate", description: "C10 then C7", confidence: 5 },
      { value: "b", label: "Align duplicate first", description: "C7 then C10", confidence: 4 },
    ]);
    assert.deepEqual(
      options.map((option, index) => pickerLabel(option, index)),
      ["Ask UI first, then Align duplicate", "Align duplicate first"],
    );
    assert.equal(
      options.every((option, index) => !/confidence|\b[A-Z]\. /.test(pickerLabel(option, index))),
      true,
    );
    assert.deepEqual(optionReferences(options), ["Ask UI first, then Align duplicate", "Align duplicate first"]);
  });
});
