/**
 * Workflow runtime: Mode × Artifact × Settlement gates aligned with workflow-fsm.ts.
 *
 * The shareable FSM (states, transitions, agent procedures) lives in workflow-fsm.ts.
 * This module owns session snapshots and tool/settlement dispatch only.
 */

import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import { evaluateNextGate } from "./next-actions.js";
import { MODE_EVENT, resolveWorkflowMode, type WorkflowMode } from "./mode.js";
import { dispatchSettlement as dispatchSettlementFromSignals } from "./settlement.js";
import { missingSessionPlan } from "./task.js";
import { WORKFLOW_FSM } from "./workflow-fsm.js";

export type { SettlementDispatch } from "./settlement.js";

export {
  WORKFLOW_FSM,
  WORKFLOW_FSM_VERSION,
  formatRuntimeWorkflowPrompt,
  formatWorkflowPrompt,
  serializeWorkflowFsm,
  toMermaid,
  workflowPrompt,
} from "./workflow-fsm.js";

export type ArtifactRegion = "none" | "named";

/** Compact ask answer carried on PWB route so the target mode can synthesize the plan. */
export interface AskSettlementAnswer {
  id: string;
  label: string;
  value: string;
  wasCustom?: boolean;
}

export interface AskSettlementSignal {
  outcome: "answered" | "cancelled" | "routed";
  target?: Exclude<WorkflowMode, "align">;
  /** Present on routed PWB outcomes for kickoff synthesis. */
  answers?: AskSettlementAnswer[];
}

/** Turn-local signals; ask outcome and next queue are independent flags. */
export interface SettlementSignals {
  ask?: AskSettlementSignal;
  nextQueued: boolean;
  /** True when this turn recorded an explicit empty next (`queued: false`). */
  nextSkip: boolean;
}

export interface WorkflowSnapshot {
  mode: WorkflowMode;
  artifact: ArtifactRegion;
  settlement: SettlementSignals;
  /** FSM version the runtime was built against (for telemetry/visualizers). */
  fsmVersion: string;
}

export type MachineEvent =
  | { type: "TOOL_ASK"; hasQuestions: boolean }
  | { type: "TOOL_DECIDE"; hasQuestions: boolean; allHaveOptions: boolean }
  | {
      type: "TOOL_NEXT";
      hasActions: boolean;
      allTargetsValid: boolean;
      reasonsValid: boolean;
      promptsValid: boolean;
      reviewPromptsValid: boolean;
    }
  | { type: "AGENT_SETTLED" };

export type GuardResult = { ok: true } | { ok: false; kind: "noop" | "error"; message: string };

/** Session custom entry types used for current-turn settlement signals. */
export const NEXT_STEP_EVENT = "agent-workflow:next-step";
export const ASK_SETTLEMENT_EVENT = "agent-workflow:ask-settlement";

export function artifactRegion(cwd: string, sessionName: string | undefined): ArtifactRegion {
  return missingSessionPlan(cwd, sessionName) ? "none" : "named";
}

export function planMissingMessage(cwd: string, sessionName: string | undefined): string {
  return missingSessionPlan(cwd, sessionName) ?? "No plan under .pi/plan/ — start a task first.";
}

/** Normalize gate text so tools never double-prefix Error:. */
export function formatGateText(gate: Extract<GuardResult, { ok: false }>): string {
  if (gate.kind !== "error") return gate.message;
  return gate.message.startsWith("Error:") ? gate.message : `Error: ${gate.message}`;
}

/** Latest matching custom entry in the current turn (stops at user message or mode change). */
export function currentTurnSignal<T>(
  entries: SessionEntry[],
  customType: string,
  read: (entry: SessionEntry & { type: "custom" }) => T | undefined,
): T | undefined {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry?.type === "message" && entry.message.role === "user") return undefined;
    if (entry?.type !== "custom") continue;
    if (entry.customType === customType) return read(entry);
    if (entry.customType === MODE_EVENT) return undefined;
  }
  return undefined;
}

function readSettlementAnswers(value: unknown): AskSettlementAnswer[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const answers: AskSettlementAnswer[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as { id?: unknown; label?: unknown; value?: unknown; wasCustom?: unknown };
    if (typeof row.id !== "string" || typeof row.label !== "string") continue;
    answers.push({
      id: row.id,
      label: row.label,
      value: typeof row.value === "string" ? row.value : row.label,
      ...(row.wasCustom === true ? { wasCustom: true } : {}),
    });
  }
  return answers.length ? answers : undefined;
}

/** Build the agent kickoff instruction that carries PWB answers into Spec/Vibe. */
export function formatRoutedAnswersPrompt(answers: AskSettlementAnswer[] | undefined): string | undefined {
  if (!answers?.length) return undefined;
  const lines = answers.map((answer) => {
    const via = answer.wasCustom ? "wrote" : "selected";
    return `- ${answer.id}: ${via} ${answer.label}`;
  });
  return [
    "Named artifact is already ensured (envision start/reuse, or runtime PWB settlement start). Synthesize these Proceed-with-best answers into the plan User transcript, Goal, Align, Decisions, and Checklist before other primary work:",
    ...lines,
  ].join("\n");
}

export function readAskSettlement(entries: SessionEntry[]): AskSettlementSignal | undefined {
  return currentTurnSignal(entries, ASK_SETTLEMENT_EVENT, (entry) => {
    const data = entry.data as { outcome?: unknown; target?: unknown; answers?: unknown } | undefined;
    if (data?.outcome === "answered" || data?.outcome === "cancelled") return { outcome: data.outcome };
    if (data?.outcome === "routed" && (data.target === "spec" || data.target === "vibe")) {
      const answers = readSettlementAnswers(data.answers);
      return { outcome: "routed", target: data.target, ...(answers ? { answers } : {}) };
    }
    return undefined;
  });
}

export function readNextQueued(entries: SessionEntry[], current: WorkflowMode): boolean {
  return Boolean(
    currentTurnSignal(entries, NEXT_STEP_EVENT, (entry) => {
      const data = entry.data as { mode?: unknown; actions?: unknown; queued?: unknown } | undefined;
      if (data?.mode !== current || !Array.isArray(data.actions)) return undefined;
      // Non-empty next call opens the picker even when same-mode filter left actions empty.
      if (data.queued === true) return true;
      if (data.actions.length === 0) return undefined;
      return true;
    }),
  );
}

export function readNextSkip(entries: SessionEntry[], current: WorkflowMode): boolean {
  return Boolean(
    currentTurnSignal(entries, NEXT_STEP_EVENT, (entry) => {
      const data = entry.data as { mode?: unknown; actions?: unknown; queued?: unknown } | undefined;
      if (data?.mode !== current || !Array.isArray(data.actions)) return undefined;
      if (data.queued === true) return undefined;
      if (data.queued === false) return true;
      if (data.actions.length === 0) return true;
      return undefined;
    }),
  );
}

export function settlementSignals(entries: SessionEntry[], mode: WorkflowMode): SettlementSignals {
  return {
    ask: readAskSettlement(entries),
    nextQueued: readNextQueued(entries, mode),
    nextSkip: readNextSkip(entries, mode),
  };
}

export function snapshot(entries: SessionEntry[], cwd: string, sessionName: string | undefined): WorkflowSnapshot {
  const mode = resolveWorkflowMode(entries);
  return {
    mode,
    artifact: artifactRegion(cwd, sessionName),
    settlement: settlementSignals(entries, mode),
    fsmVersion: WORKFLOW_FSM.version,
  };
}

/**
 * Mechanical tool gates. Messages and mode matrix match WORKFLOW_FSM.tools.*.gate.
 * Does not judge workflow quality (counts, confidence, naming).
 */
export function receive(snap: WorkflowSnapshot, event: MachineEvent, planError: string): GuardResult {
  switch (event.type) {
    case "TOOL_ASK": {
      if (snap.mode !== "align") {
        return {
          ok: false,
          kind: "noop",
          message: "Ask is ALIGN-only; no questions were shown. Use decide in SPEC/VIBE.",
        };
      }
      if (!event.hasQuestions) return { ok: true };
      // Envision entry may ask before start; decide/next still require a named plan.
      return { ok: true };
    }
    case "TOOL_DECIDE": {
      if (snap.mode === "align") {
        return {
          ok: false,
          kind: "noop",
          message: "Decide is SPEC/VIBE-only; no decision was recorded. Use ask in ALIGN.",
        };
      }
      if (!event.hasQuestions) {
        return {
          ok: false,
          kind: "noop",
          message: "No questions were supplied; Decide made no changes.",
        };
      }
      if (!event.allHaveOptions) {
        return {
          ok: false,
          kind: "noop",
          message: "Decide needs compared options; no decision was recorded.",
        };
      }
      if (snap.artifact === "none") return { ok: false, kind: "error", message: planError };
      return { ok: true };
    }
    case "TOOL_NEXT":
      return evaluateNextGate(event, snap.artifact, planError);
    case "AGENT_SETTLED":
      return { ok: true };
    default:
      return { ok: true };
  }
}

/**
 * Post-turn UI dispatch. See settlement.ts for priority, including omitted-next fill-in fallback.
 */
export function dispatchSettlement(snap: WorkflowSnapshot) {
  return dispatchSettlementFromSignals({
    mode: snap.mode,
    ask: snap.settlement.ask,
    nextQueued: snap.settlement.nextQueued,
    nextSkip: snap.settlement.nextSkip,
  });
}
