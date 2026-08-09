/**
 * The workflow mode — Ask, Spec, or Vibe.
 *
 * Mode belongs to the User. Nothing here ever selects one on the Agent's behalf:
 * it is persisted when the User picks it and read back wherever the runtime needs
 * to know which block the Agent is bound to. A session starts in Ask.
 *
 * Mode is also the edit gate (authorization.ts) and the timing bucket
 * (plan-time.ts), so it is the one piece of workflow state worth persisting.
 */

import type {
  ExtensionAPI,
  SessionEntry,
} from "@earendil-works/pi-coding-agent";

export type WorkflowMode = "ask" | "spec" | "vibe";

export const MODE_EVENT = "agent-workflow:mode";

export interface ModeEvent {
  mode: WorkflowMode;
}

export const MODE_LABEL: Record<WorkflowMode, string> = {
  ask: "Ask",
  spec: "Spec",
  vibe: "Vibe",
};

export const WORKFLOW_MODES: readonly WorkflowMode[] = ["ask", "spec", "vibe"];

export function isWorkflowMode(value: unknown): value is WorkflowMode {
  return value === "ask" || value === "spec" || value === "vibe";
}

/**
 * Earlier sessions persisted a two-value mode plus a separate phase; both folded
 * into these three, so an old branch resolves instead of resetting to Ask.
 */
export function normalizeWorkflowMode(
  value: unknown,
): WorkflowMode | undefined {
  if (value === "explore" || value === "plan") return "spec";
  if (value === "execute") return "vibe";
  if (value === "align") return "ask";
  return isWorkflowMode(value) ? value : undefined;
}

/** Latest persisted choice wins, so commands and forks reconstruct deterministically. */
export function deriveWorkflowMode(
  entries: SessionEntry[],
): WorkflowMode | undefined {
  for (let index = entries.length - 1; index >= 0; index--) {
    const entry = entries[index];
    if (entry?.type !== "custom" || entry.customType !== MODE_EVENT) continue;
    const mode = normalizeWorkflowMode(
      (entry.data as { mode?: unknown } | undefined)?.mode,
    );
    if (mode) return mode;
  }
  return undefined;
}

export function recordWorkflowMode(
  pi: Pick<ExtensionAPI, "appendEntry" | "events">,
  mode: WorkflowMode,
): void {
  pi.appendEntry(MODE_EVENT, { mode } satisfies ModeEvent);
  pi.events.emit?.(MODE_EVENT, { mode } satisfies ModeEvent);
}

/**
 * Whether execution has ever begun on this branch. Entering Vibe is the User's
 * approval, so it is what locks the plan name and turns a later save into a
 * dated revision rather than a replacement draft.
 */
export function hasEnteredVibe(entries: SessionEntry[]): boolean {
  return entries.some(
    (entry) =>
      entry.type === "custom" &&
      entry.customType === MODE_EVENT &&
      normalizeWorkflowMode(
        (entry.data as { mode?: unknown } | undefined)?.mode,
      ) === "vibe",
  );
}

/** Keep the large contract constant; only this tiny suffix changes per turn. */
export function workflowModePrompt(mode: WorkflowMode): string {
  return `<pi_workflow_mode>${mode}</pi_workflow_mode>`;
}
