import type { ExtensionAPI, ExtensionContext, SessionEntry } from "@earendil-works/pi-coding-agent";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import { duringUserWait } from "./user-wait.js";

export type WorkflowMode = "vibe" | "spec";

export const MODE_EVENT = "agent-workflow:mode";

export interface ModeEvent {
	mode: WorkflowMode;
}

export const VIBE_OPTION = "Vibe — build continuously";
export const SPEC_OPTION = "Spec — review every change";

export function isWorkflowMode(value: unknown): value is WorkflowMode {
	return value === "vibe" || value === "spec";
}

/** Latest persisted choice wins, so commands and forks reconstruct deterministically. */
export function deriveWorkflowMode(entries: SessionEntry[]): WorkflowMode | undefined {
	for (let index = entries.length - 1; index >= 0; index--) {
		const entry = entries[index];
		if (entry?.type !== "custom" || entry.customType !== MODE_EVENT) continue;
		const mode = (entry.data as { mode?: unknown } | undefined)?.mode;
		if (isWorkflowMode(mode)) return mode;
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
 * A new interactive session chooses before its first provider call. Existing and
 * non-interactive sessions inherit the conservative legacy behavior: Spec.
 */
export async function ensureWorkflowMode(
	pi: Pick<ExtensionAPI, "appendEntry" | "events">,
	ctx: ExtensionContext,
	freshSession: boolean,
): Promise<WorkflowMode> {
	const existing = deriveWorkflowMode(ctx.sessionManager.getBranch());
	if (existing) return existing;

	let mode: WorkflowMode = "spec";
	if (freshSession && ctx.hasUI) {
		const checkpoint = openCheckpoint(pi, "mode");
		try {
			const choice = await duringUserWait(pi, "question", () =>
				ctx.ui.select("How should this session work?", [VIBE_OPTION, SPEC_OPTION]),
			);
			mode = choice === VIBE_OPTION ? "vibe" : "spec";
			resolveCheckpoint(pi, checkpoint.id, choice === undefined ? "dismissed-spec" : mode);
		} catch (error) {
			resolveCheckpoint(pi, checkpoint.id, "failure-spec");
			throw error;
		}
	}

	recordWorkflowMode(pi, mode);
	return mode;
}

/** Keep the large contract constant; only this tiny suffix changes per turn. */
export function workflowModePrompt(mode: WorkflowMode): string {
	return `<pi_workflow_mode>${mode}</pi_workflow_mode>`;
}
