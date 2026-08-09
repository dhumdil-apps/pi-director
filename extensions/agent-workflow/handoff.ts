/**
 * openHandoffSession — the /handoff command's implementation.
 *
 * The approval prompt's Proceed choice keeps the running session; a handoff is
 * the session boundary: it spawns a new session, seeds its name before the
 * first turn, and sends a kickoff carrying the concrete plan path, so
 * implementation starts with a lean context and nothing to retype.
 * Only a command handler can spawn a session, so /handoff owns this entry point.
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { appendHeadlessNotice } from "./notice.js";
import { AUTHORIZATION_EVENT, type AuthorizationEvent } from "./authorization.js";
import { deriveWorkflowMode, MODE_EVENT, type ModeEvent, type WorkflowMode } from "./mode.js";
import { PHASE_EVENT, type PhaseEvent } from "./phase.js";
import { type PlanTask, resolvePlanTask } from "./task.js";

const USAGE = "Usage: /handoff [session-name].";

/** Executing from a handoff is auto-approved: the user approved the plan in the session that handed off. */
export function handoffKickoff(task: PlanTask, mode: WorkflowMode = "spec"): string {
	return mode === "vibe"
		? `Continue the Vibe task from the work log at ${task.planPath}.`
		: `Execute the approved plan at ${task.planPath}.`;
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
	requestedMode?: WorkflowMode,
): Promise<void> {
	const notify = (message: string, type: "info" | "warning") => {
		if (ctx.hasUI) ctx.ui.notify(message, type);
		else appendHeadlessNotice(pi, ctx.mode, message, type);
	};

	const { task, error } = resolvePlanTask(ctx.cwd, taskName, ctx.sessionManager.getSessionName());
	if (error || !task) {
		notify(error ?? USAGE, "warning");
		return;
	}

	const mode = requestedMode ?? deriveWorkflowMode(ctx.sessionManager.getBranch()) ?? "spec";
	const kickoff = handoffKickoff(task, mode);
	await ctx.waitForIdle();
	await ctx.newSession({
		parentSession: ctx.sessionManager.getSessionFile(),
		// Seed task identity and display phase before replacement-session
		// extensions initialize; the kickoff separately instructs the model.
			setup: async (sessionManager) => {
				sessionManager.appendSessionInfo(task.name);
				sessionManager.appendCustomEntry(MODE_EVENT, { mode } satisfies ModeEvent);
				if (mode === "spec") sessionManager.appendCustomEntry(AUTHORIZATION_EVENT, { state: "approved", task: task.name } satisfies AuthorizationEvent);
				sessionManager.appendCustomEntry(PHASE_EVENT, { phase: "execute" } satisfies PhaseEvent);
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
