/**
 * Pure post-turn UI dispatch. No Pi / session imports so unit tests can cover
 * mode-fallback open_picker without loading agent-api.
 */

export type SettlementMode = "align" | "spec" | "vibe";

export type SettlementDispatch<TAnswer = unknown> =
  | { action: "none" }
  | { action: "route"; target: Exclude<SettlementMode, "align">; answers?: TAnswer[] }
  | { action: "skip_picker" }
  | { action: "open_picker" };

export interface SettlementDispatchInput<TAnswer = unknown> {
  mode: SettlementMode;
  ask?: {
    outcome: "answered" | "cancelled" | "routed";
    target?: Exclude<SettlementMode, "align">;
    answers?: TAnswer[];
  };
  nextQueued: boolean;
  /** Legacy empty next (`queued: false`); treated as omit (fill-in picker). */
  nextSkip: boolean;
}

/**
 * Priority: ask route > ask cancel (suppress picker) > next queue >
 * fill-in fallback open_picker (every mode), including legacy empty next.
 * ask_answered does not suppress next_queued.
 */
export function dispatchSettlement<TAnswer>(input: SettlementDispatchInput<TAnswer>): SettlementDispatch<TAnswer> {
  const { ask, nextQueued } = input;
  if (ask?.outcome === "routed" && ask.target) {
    return {
      action: "route",
      target: ask.target,
      ...(ask.answers?.length ? { answers: ask.answers } : {}),
    };
  }
  if (ask?.outcome === "cancelled") return { action: "skip_picker" };
  if (nextQueued) return { action: "open_picker" };
  return { action: "open_picker" };
}

/** Scope-informed start summary for PWB settlement when no named plan exists yet. */
export function pwbRouteTaskSummary(answers?: Array<{ label?: string; value?: string }> | undefined): string {
  const text = (answers ?? [])
    .map((answer) => String(answer.label || answer.value || "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text || "proceed with best";
}
