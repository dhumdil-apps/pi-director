/**
 * The current workflow cycle phase — for display only.
 *
 * This is separate from the session-scoped Vibe/Spec policy in mode.ts: only
 * context-free display state is written to the session, and
 * nothing here reaches the model. The injected LOOP stays one byte-identical
 * constant and the phase only ever reaches display surfaces, so a wrong badge
 * misinforms the user for one turn
 * instead of shifting the contract under the agent.
 *
 * Transitions are both emitted live and persisted as custom session entries,
 * which do not reach the model. Reconstruction reads the latest transition so
 * revisions can cycle through the phases repeatedly. Approval kickoff messages
 * remain a backward-compatible execute signal for sessions created before the
 * persisted entries existed.
 */

import type { ExtensionAPI, SessionEntry } from "@earendil-works/pi-coding-agent";

export type WorkflowPhase = "explore" | "execute";

/** Used for both the display event and the context-free persisted session entry. */
export const PHASE_EVENT = "agent-workflow:phase";

export interface PhaseEvent {
	phase: WorkflowPhase;
}

export function isWorkflowPhase(value: unknown): value is WorkflowPhase {
	return value === "explore" || value === "execute";
}

/** Historical Plan work is non-mutating proposal work, so it resumes as Explore. */
export function normalizeWorkflowPhase(value: unknown): WorkflowPhase | undefined {
	if (value === "plan") return "explore";
	return isWorkflowPhase(value) ? value : undefined;
}

/** Persist first, then notify live observers; custom entries never enter LLM context. */
export function recordWorkflowPhase(
	pi: Pick<ExtensionAPI, "appendEntry" | "events">,
	phase: WorkflowPhase,
): void {
	pi.appendEntry(PHASE_EVENT, { phase } satisfies PhaseEvent);
	pi.events.emit?.(PHASE_EVENT, { phase } satisfies PhaseEvent);
}

/**
 * The kickoff sentence handoff.ts sends. Matching prose is fragile in general,
 * but this string IS the approval signal the loop names, so the two are one
 * fact: change handoffKickoff and this must change with it (handoff.test.ts
 * pins the sentence).
 */
const KICKOFF_PATTERN = /^Execute the approved plan at .+\.md\./m;

/** Whether this branch has crossed the approval gate for the named plan. */
export function hasApprovedPlan(entries: SessionEntry[], task: string): boolean {
	const kickoff = `Execute the approved plan at .pi/plan/${task}.md.`;
	return entries.some((entry) => {
		if (messageText(entry) === kickoff) return true;
		if (entry.type !== "custom" || entry.customType !== "agent-workflow:authorization") return false;
		const data = entry.data as { state?: unknown; task?: unknown } | undefined;
		return data?.state === "approved" && data.task === task;
	});
}

function messageText(entry: SessionEntry): string | undefined {
	if (entry.type !== "message") return undefined;
	const message = entry.message as { role?: string; content?: unknown };
	if (message.role !== "user") return undefined;
	if (typeof message.content === "string") return message.content;
	if (!Array.isArray(message.content)) return undefined;
	return message.content
		.filter((block): block is { type: "text"; text: string } => (block as { type?: string })?.type === "text")
		.map((block) => block.text)
		.join(" ");
}

/**
 * Reconstruct the latest transition. Persisted phase entries make repeated
 * revision cycles unambiguous; kickoff matching keeps older sessions working.
 */
export function derivePhaseFromBranch(entries: SessionEntry[]): WorkflowPhase | undefined {
	for (let index = entries.length - 1; index >= 0; index--) {
		const entry = entries[index]!;
		if (entry.type === "custom" && entry.customType === PHASE_EVENT) {
			const phase = normalizeWorkflowPhase((entry.data as { phase?: unknown } | undefined)?.phase);
			if (phase) return phase;
		}
		const text = messageText(entry);
		if (text && KICKOFF_PATTERN.test(text)) return "execute";
	}
	return undefined;
}
