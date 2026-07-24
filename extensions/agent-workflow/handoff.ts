/**
 * openHandoffSession — the /handoff command's implementation.
 *
 * The approval prompt's Proceed choice keeps the running session; a handoff is
 * the session boundary: it spawns a new session, seeds the task name before the
 * first turn, and sends a kickoff carrying the concrete plan path, so
 * implementation starts with a lean context and nothing to retype.
 * Only a command handler can spawn a session, so /handoff owns this entry point.
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { type PlanTask, resolvePlanTask } from "./task.js";

const HANDOFF_NOTICE_TYPE = "agent-workflow:handoff-notice";
const USAGE = "Usage: /handoff [task-name].";

/** Executing from a handoff is auto-approved: the user approved the plan in the session that handed off. */
export function handoffKickoff(task: PlanTask): string {
	return `Execute the approved plan at ${task.planPath}.`;
}

/**
 * Spawn a fresh session seeded with the resolved task's approved plan. On a
 * resolution error it notifies and spawns nothing. Callable only with a command
 * context, since session spawning is gated to command handlers.
 */
export async function openHandoffSession(
	pi: ExtensionAPI,
	ctx: ExtensionCommandContext,
	taskName?: string,
): Promise<void> {
	const notify = (message: string, type: "info" | "warning") => {
		if (ctx.hasUI) ctx.ui.notify(message, type);
		else pi.sendMessage({ customType: HANDOFF_NOTICE_TYPE, content: message, display: true }, { triggerTurn: false });
	};

	const { task, error } = resolvePlanTask(ctx.cwd, taskName, ctx.sessionManager.getSessionName());
	if (error || !task) {
		notify(error ?? USAGE, "warning");
		return;
	}

	const kickoff = handoffKickoff(task);
	await ctx.waitForIdle();
	await ctx.newSession({
		parentSession: ctx.sessionManager.getSessionFile(),
		// The kickoff message carries the approval; the new session only needs to
		// know which task it is, so save_plan renames the right plan file.
		setup: async (sessionManager) => {
			sessionManager.appendSessionInfo(task.name);
		},
		withSession: async (next) => {
			// sendUserMessage resolves only when the triggered turn ends: an
			// interactive session must not block on it, while a headless run
			// would otherwise exit mid-turn.
			const turn = next.sendUserMessage(kickoff);
			if (next.hasUI) void turn.catch(() => {});
			else await turn;
		},
	});
}
