/**
 * Which side of the approval gate the session is on — for display only.
 *
 * This is deliberately not the retired mode/loop state machine (mode.ts,
 * loop.ts): nothing here is written to the session, and nothing here reaches
 * the model. The injected LOOP stays one byte-identical constant and the phase
 * only ever reaches a widget, so a wrong badge misinforms the user for one turn
 * instead of shifting the contract under the agent.
 *
 * Two sources, in precedence order:
 *  - live transitions emitted by approval.ts (in-memory, this session's decisions);
 *  - the kickoff message in the branch, for the cases no transition was seen —
 *    a /handoff-seeded session is approved by construction and never runs the
 *    prompt, and a reload starts with an empty closure.
 */

import type { SessionEntry } from "@earendil-works/pi-coding-agent";

export type WorkflowPhase = "plan" | "execute";

/** Emitted by approval.ts, consumed by progress-tracker's indicator. */
export const PHASE_EVENT = "agent-workflow:phase";

export interface PhaseEvent {
	phase: WorkflowPhase;
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
	return entries.some((entry) => messageText(entry) === kickoff);
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
 * `execute` once a kickoff message appears on the branch, otherwise undefined —
 * never `plan`, so an ordinary session with no plan in play renders no badge at
 * all rather than claiming a phase it was never in.
 */
export function derivePhaseFromBranch(entries: SessionEntry[]): WorkflowPhase | undefined {
	for (const entry of entries) {
		const text = messageText(entry);
		if (text && KICKOFF_PATTERN.test(text)) return "execute";
	}
	return undefined;
}
