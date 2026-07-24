/**
 * Loop position for the Agent Workflow extension.
 *
 * There is one workflow loop — goal, explore, plan, save-then-proceed, close —
 * and position in it is *derived*, never declared: two hidden branch facts say
 * what happened, and everything else follows from them.
 *
 * - approved: the user approved the plan for a task (Proceed, or /handoff seeding).
 * - closed:   save_summary wrote that task's close-out.
 *
 * A task with an approval and no matching close-out is being implemented. This
 * is per *task*, not per session: a second task in the same session gets its own
 * approval, and a close-out ends only the task it names. The branch is the only
 * durable store, so state is re-derived every turn and never cached at load —
 * a /handoff-seeded session's extension instance loads before its marker is
 * appended.
 */

import type { ExtensionAPI, ExtensionContext, SessionEntry } from "@earendil-works/pi-coding-agent";

export const APPROVED_ENTRY_TYPE = "agent-workflow:approved";
export const CLOSED_ENTRY_TYPE = "agent-workflow:closed";

/**
 * The retired per-session mode marker. Sessions started before the loop rework
 * carry it instead of an approval fact, so it is still read: implement mode
 * meant "the session's task is approved".
 */
export const LEGACY_MODE_ENTRY_TYPE = "agent-workflow:mode";

export interface LoopState {
	/** The task whose plan the user approved, if any. */
	approvedTask?: string;
	/** The task whose close-out has been written, if any. */
	closedTask?: string;
}

/** Whether the approved task is still open — i.e. the loop is past step 4. */
export function isImplementing(state: LoopState): boolean {
	return state.approvedTask !== undefined && state.closedTask !== state.approvedTask;
}

/**
 * getBranch() yields raw session entries, so a hidden marker sent with
 * pi.sendMessage is a top-level custom_message entry — not a message entry
 * with a custom role.
 */
function factDetails(entry: SessionEntry, customType: string): { task?: unknown } | undefined {
	if (entry.type !== "custom_message" || entry.customType !== customType) return undefined;
	return entry.details as { task?: unknown } | undefined;
}

/** Re-read the loop position from the branch. Last write wins for each fact. */
export function deriveLoop(ctx: ExtensionContext): LoopState {
	const state: LoopState = {};
	for (const entry of ctx.sessionManager.getBranch()) {
		const approved = factDetails(entry, APPROVED_ENTRY_TYPE);
		if (typeof approved?.task === "string") {
			state.approvedTask = approved.task;
			continue;
		}
		const closed = factDetails(entry, CLOSED_ENTRY_TYPE);
		if (typeof closed?.task === "string") {
			state.closedTask = closed.task;
			continue;
		}
		// Legacy markers carry no task, so the session name is the task — and it is
		// already canonical there: save_plan and /handoff are the only writers of
		// a session name, and both write a normalized one. (Importing
		// canonicalTaskName here would make task.ts ↔ loop.ts a module cycle.)
		const legacy = entry.type === "custom_message" && entry.customType === LEGACY_MODE_ENTRY_TYPE
			? (entry.details as { mode?: unknown } | undefined)
			: undefined;
		if (legacy?.mode === "implement") {
			const task = ctx.sessionManager.getSessionName()?.trim();
			if (task) state.approvedTask = task;
		}
	}
	return state;
}

/** Record that the user approved this task's plan, and optionally start execution. */
export function markApproved(pi: ExtensionAPI, task: string, kickoff?: string): void {
	pi.sendMessage(
		{ customType: APPROVED_ENTRY_TYPE, content: `Plan approved: ${task}.`, display: false, details: { task } },
		{ triggerTurn: false },
	);
	if (kickoff) pi.sendUserMessage(kickoff);
}

/** Record that this task's close-out has been written. */
export function markClosed(pi: ExtensionAPI, task: string): void {
	pi.sendMessage(
		{ customType: CLOSED_ENTRY_TYPE, content: `Task closed: ${task}.`, display: false, details: { task } },
		{ triggerTurn: false },
	);
}
