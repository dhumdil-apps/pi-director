/**
 * The approval prompt — step 4 of the loop, "save, then proceed".
 *
 * A saved plan primes a native prompt instead of ending the turn on a dead
 * toast. It is armed by the tool result and delivered when the turn settles, so
 * it never fires mid-turn.
 *
 * Arming keys on the *task*, not on the tool: a save_plan for a task the user
 * has already approved is a mid-implementation correction and must stay silent,
 * while a save_plan for a different task — a second loop in the same session —
 * gets its own prompt.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { isLeanContext } from "./context-usage.js";
import { handoffKickoff } from "./handoff.js";
import { deriveLoop, markApproved } from "./loop.js";
import { resolvePlanTask } from "./task.js";

const APPROVAL_NOTICE_TYPE = "agent-workflow:approval-notice";

const PROCEED = "Proceed in this session";
const HANDOFF = "Handoff to a fresh session";
const REVISE = "Revise the plan";

/**
 * ui.select takes plain string options with no initial index, so the
 * context-load recommendation lives in the labels: a lean context recommends
 * proceeding here, a loaded one recommends handing off to a fresh session.
 */
export function approvalOptions(lean: boolean): string[] {
	return lean
		? [`${PROCEED} (recommended)`, HANDOFF, REVISE]
		: [`${HANDOFF} (recommended)`, PROCEED, REVISE];
}

export function registerApproval(pi: ExtensionAPI): void {
	// Ephemeral by design: a pending offer belongs to the turn that armed it and
	// is never persisted, so a reload never resurrects a stale prompt.
	let pendingOffer: { task: string } | undefined;

	pi.on("tool_execution_end", async (event, ctx) => {
		if (event.toolName !== "save_plan" || event.isError) return;
		const details = (event.result as { details?: { name?: unknown } } | undefined)?.details;
		if (typeof details?.name !== "string") return;
		// An approved task re-saving its plan is a correction, not a new decision.
		if (details.name === deriveLoop(ctx).approvedTask) return;
		pendingOffer = { task: details.name };
	});

	pi.on("agent_settled", async (_event, ctx) => {
		const offer = pendingOffer;
		if (!offer) return;
		pendingOffer = undefined;
		const { task } = offer;

		if (!ctx.hasUI) {
			pi.sendMessage(
				{ customType: APPROVAL_NOTICE_TYPE, content: `Plan saved — run /handoff ${task} to execute it in a fresh session.`, display: true },
				{ triggerTurn: false },
			);
			return;
		}

		const choice = await ctx.ui.select("Proceed, handoff, or revise?", approvalOptions(isLeanContext(ctx.getContextUsage())));
		if (choice?.startsWith(PROCEED)) {
			proceed(pi, ctx, task);
			return;
		}
		if (choice?.startsWith(HANDOFF)) {
			// Only a command handler can spawn a session, so the handoff path hands
			// the user the exact command — naming the task, since .pi/plan/ accumulates.
			const command = `/handoff ${task}`;
			if (!ctx.ui.getEditorText().trim()) ctx.ui.setEditorText(command);
			ctx.ui.notify(`Press Enter to run ${command} in a new session.`, "info");
			return;
		}
		ctx.ui.notify(`Plan not approved — revise and save again, or run /handoff ${task}.`, "info");
	});
}

/** Record the approval and start execution here, naming the concrete plan path. */
function proceed(pi: ExtensionAPI, ctx: ExtensionContext, task: string): void {
	const { task: resolved } = resolvePlanTask(ctx.cwd, task, ctx.sessionManager.getSessionName());
	markApproved(pi, task, resolved ? handoffKickoff(resolved) : undefined);
}
