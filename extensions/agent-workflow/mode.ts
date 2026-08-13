/**
 * The workflow mode — Align, Spec, or Vibe.
 *
 * Mode belongs to the User. Nothing here ever selects one on the Agent's behalf:
 * it is persisted when the User picks it and read back wherever the runtime needs
 * to know which block the Agent is bound to. A session starts in Align.
 *
 * Mode is persisted workflow state and the timing bucket (plan-time.ts), so it
 * is the one piece of workflow state worth persisting.
 */

import type { ExtensionAPI, SessionEntry } from "@earendil-works/pi-coding-agent";

export type WorkflowMode = "align" | "spec" | "vibe";

export const MODE_EVENT = "agent-workflow:mode";

export interface ModeEvent {
  mode: WorkflowMode;
}

export const MODE_LABEL: Record<WorkflowMode, string> = {
  align: "❓ ALIGN",
  spec: "🔎 SPEC",
  vibe: "🚀 VIBE",
};

export const WORKFLOW_MODES: readonly WorkflowMode[] = ["align", "spec", "vibe"];

export function isWorkflowMode(value: unknown): value is WorkflowMode {
  return value === "align" || value === "spec" || value === "vibe";
}

/**
 * Earlier sessions persisted a two-value mode plus a separate phase; both folded
 * into these three, so an old branch resolves instead of resetting to Align.
 */
export function normalizeWorkflowMode(value: unknown): WorkflowMode | undefined {
  if (value === "explore" || value === "plan") return "spec";
  if (value === "execute") return "vibe";
  if (value === "questionnaire") return "align";
  return isWorkflowMode(value) ? value : undefined;
}

/** Latest persisted choice wins, so commands and forks reconstruct deterministically. */
export function deriveWorkflowMode(entries: SessionEntry[]): WorkflowMode | undefined {
  for (let index = entries.length - 1; index >= 0; index--) {
    const entry = entries[index];
    if (entry?.type !== "custom" || entry.customType !== MODE_EVENT) continue;
    const mode = normalizeWorkflowMode((entry.data as { mode?: unknown } | undefined)?.mode);
    if (mode) return mode;
  }
  return undefined;
}

/** Resolve the persisted runtime mode once, including the legacy default. */
export function resolveWorkflowMode(entries: SessionEntry[]): WorkflowMode {
  return deriveWorkflowMode(entries) ?? "align";
}

export function recordWorkflowMode(pi: Pick<ExtensionAPI, "appendEntry" | "events">, mode: WorkflowMode): void {
  pi.appendEntry(MODE_EVENT, { mode } satisfies ModeEvent);
  pi.events.emit?.(MODE_EVENT, { mode } satisfies ModeEvent);
}

/** Keep the large contract constant; only this informational suffix changes per turn. */
export function workflowModePrompt(mode: WorkflowMode): string {
  return `<pi_workflow_mode>${mode}</pi_workflow_mode>`;
}
