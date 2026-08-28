/** Pure next-action normalize/inspect. Session reads stay reason-optional; new next calls enforce separately. */

export type NextStepActionMode = "align" | "spec" | "vibe" | "handoff";
export type AlignLanding = "establish" | "evaluate";

export interface NextStepAction {
  mode: NextStepActionMode;
  reason?: string;
  prompt?: string;
  /** Align only. Default establish (idle gate / editor). */
  landing?: AlignLanding;
}

export const NEXT_ACTION_MODES = ["align", "spec", "vibe", "handoff"] as const;

/** Standalone decision slugs: `D1-tighten-writes` or legacy `D-tighten-writes` — not bare `D1`, `D-12`, or `QD-topic`. */
export const STANDALONE_DECISION_ID = /\bD(?:\d+)?-[a-z][a-z0-9]*(?:-[a-z0-9]+)*\b/;

export function hasStandaloneDecisionId(prompt: string): boolean {
  return STANDALONE_DECISION_ID.test(prompt);
}

export function normalizeReason(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.replace(/\s+/g, " ").trim() || undefined;
}

export function normalizeLanding(mode: NextStepActionMode, landing: unknown): AlignLanding | undefined {
  if (mode !== "align") return undefined;
  return landing === "evaluate" ? "evaluate" : "establish";
}

/** Read-compat: missing reason is kept as absent; callers that reject new next calls inspect reasonsValid. */
export function normalizeAction(value: unknown): NextStepAction | undefined {
  if (!value || typeof value !== "object") return undefined;
  const { mode, reason, prompt, landing } = value as {
    mode?: unknown;
    reason?: unknown;
    prompt?: unknown;
    landing?: unknown;
  };
  const normalizedMode = mode === "questionnaire" ? "align" : mode === "phase-boundary" ? "handoff" : mode;
  if (!(NEXT_ACTION_MODES as readonly unknown[]).includes(normalizedMode)) return undefined;
  const asMode = normalizedMode as NextStepActionMode;
  const normalizedPrompt = typeof prompt === "string" && prompt.trim() ? prompt : undefined;
  const normalizedLanding = normalizeLanding(asMode, landing);
  return {
    mode: asMode,
    ...(normalizeReason(reason) ? { reason: normalizeReason(reason) } : {}),
    ...(normalizedPrompt ? { prompt: normalizedPrompt } : {}),
    ...(normalizedLanding ? { landing: normalizedLanding } : {}),
  };
}

function promptsValidForActions(actions: NextStepAction[]): boolean {
  return actions.every((action) => {
    if (action.mode === "handoff") return !action.prompt;
    if (action.mode === "align") {
      if ((action.landing ?? "establish") === "establish") return true;
      return Boolean(action.prompt);
    }
    return Boolean(action.prompt);
  });
}

function reviewPromptsValidForActions(actions: NextStepAction[]): boolean {
  return actions.every((action) => {
    if (action.mode !== "align") return true;
    if ((action.landing ?? "establish") !== "evaluate") return true;
    return Boolean(action.prompt && hasStandaloneDecisionId(action.prompt));
  });
}

export interface NextActionInspection {
  normalized: NextStepAction[];
  allTargetsValid: boolean;
  reasonsValid: boolean;
  promptsValid: boolean;
  reviewPromptsValid: boolean;
}

export type NextGateEvent = {
  hasActions: boolean;
  allTargetsValid: boolean;
  reasonsValid: boolean;
  promptsValid: boolean;
  reviewPromptsValid: boolean;
};

export type NextGateResult = { ok: true } | { ok: false; kind: "error"; message: string };

export function evaluateNextGate(event: NextGateEvent, artifact: "none" | "named", planError: string): NextGateResult {
  if (!event.hasActions) return { ok: true };
  if (!event.allTargetsValid) {
    return { ok: false, kind: "error", message: "every action needs a valid target." };
  }
  if (!event.reasonsValid) {
    return { ok: false, kind: "error", message: "every action needs a non-empty user-facing reason." };
  }
  if (!event.promptsValid) {
    return {
      ok: false,
      kind: "error",
      message:
        "Spec/Vibe actions need a contextual prompt; Align establish prompt is optional; handoff must omit prompt.",
    };
  }
  if (!event.reviewPromptsValid) {
    return {
      ok: false,
      kind: "error",
      message: "Align evaluate needs a prompt that names a decision slug (D-topic).",
    };
  }
  if (artifact === "none") return { ok: false, kind: "error", message: planError };
  return { ok: true };
}

export function inspectNextActions(raw: unknown[]): NextActionInspection {
  const actions = raw.map(normalizeAction);
  const allTargetsValid = raw.length === 0 || actions.every(Boolean);
  const normalized = actions.filter((action): action is NextStepAction => Boolean(action));
  const reasonsValid = raw.length === 0 || normalized.every((action) => Boolean(action.reason));
  const promptsValid = raw.length === 0 || (allTargetsValid && promptsValidForActions(normalized));
  const reviewPromptsValid = raw.length === 0 || (allTargetsValid && reviewPromptsValidForActions(normalized));
  return { normalized, allTargetsValid, reasonsValid, promptsValid, reviewPromptsValid };
}
