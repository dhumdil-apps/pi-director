/**
 * The approval prompt — step 4 of the loop, "save, then proceed".
 *
 * A saved plan primes a native prompt instead of ending the turn on a dead
 * toast. It is armed by the tool result and delivered when the turn settles, so
 * it never fires mid-turn.
 *
 * Arming keys on the plan's *contents*, not on the tool or the task name: a
 * save_plan that re-presents the approved plan byte for byte is a
 * mid-implementation correction and stays silent, while any changed plan — a
 * second task, or a re-plan of the same immutable session name — gets its own
 * prompt. Keying on the name alone would offer exactly one decision per session.
 *
 * Because the prompt only lands when the turn settles, an agent that keeps
 * working through save_plan skips the gate silently. The mutating-tool warning
 * below makes that visible without refusing the call: the loop is a contract,
 * not a lock, and a wrong turn the user can see is one they can stop.
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import { isLeanContext } from "./context-usage.js";
import { stripTimeSpent } from "./plan-time.js";
import { planPath } from "./task.js";
import { duringUserWait } from "./user-wait.js";
import { handoffKickoff } from "./handoff.js";
import { appendHeadlessNotice } from "./notice.js";
import { derivePhaseFromBranch, recordWorkflowPhase } from "./phase.js";
import { resolvePlanTask } from "./task.js";

/** Content identity of a plan file; a missing file hashes as empty, never throws. */
async function planDigest(cwd: string, task: string): Promise<string> {
	const contents = await readFile(planPath(cwd, task), "utf8").catch(() => "");
	return createHash("sha256").update(stripTimeSpent(contents)).digest("hex");
}

// Enough to catch the ways the working tree actually changes; a shell command is
// included wholesale rather than guessed at, since a read-only command warns at
// worst and a destructive one is exactly what this exists to surface.
const MUTATING_TOOLS = new Set(["edit", "write", "bash"]);

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
	// Which task the user approved in this session. Deliberately in-memory: it
	// only suppresses a duplicate prompt, so a reload costing one extra prompt is
	// cheaper than a durable fact and the derivation that reads it back.
	let approved: { task: string; digest: string } | undefined;
	// The task whose plan is on the table but unapproved, and whether its warning
	// has already been spent: one warning per task, so a session that chose to keep
	// going is told once instead of nagged on every edit.
	let unapprovedTask: string | undefined;
	let warnedTask: string | undefined;

	// A new human turn after execution starts another workflow cycle. Extension
	// input includes our approval kickoff, which must remain in execute.
	pi.on("input", async (event, ctx) => {
		if (event.source === "extension") return;
		if (derivePhaseFromBranch(ctx.sessionManager.getBranch()) === "execute") {
			recordWorkflowPhase(pi, "explore");
		}
	});

	pi.on("tool_execution_end", async (event, ctx) => {
		if (event.toolName !== "save_plan" || event.isError) return;
		const details = (event.result as { details?: { name?: unknown } } | undefined)?.details;
		if (typeof details?.name !== "string") return;
		// Re-presenting the approved plan unchanged is a correction, not a new decision.
		if (details.name === approved?.task && (await planDigest(ctx.cwd, details.name)) === approved.digest) return;
		pendingOffer = { task: details.name };
		unapprovedTask = details.name;
	});

	// Soft back-stop: notify, never reject. Silence here is the failure mode worth
	// fixing — the gate was missed the one time nothing said so.
	pi.on("tool_execution_start", async (event, ctx) => {
		if (!MUTATING_TOOLS.has(event.toolName)) return;
		if (!unapprovedTask || unapprovedTask === approved?.task || unapprovedTask === warnedTask) return;
		warnedTask = unapprovedTask;
		if (ctx.hasUI) ctx.ui.notify(`Working tree changed before "${unapprovedTask}" was approved.`, "warning");
	});

	pi.on("agent_settled", async (_event, ctx) => {
		const offer = pendingOffer;
		if (!offer) return;
		pendingOffer = undefined;
		const { task } = offer;

		if (!ctx.hasUI) {
			appendHeadlessNotice(pi, ctx.mode, `Plan saved — run /handoff ${task} to execute it in a fresh session.`, "info");
			return;
		}

		const checkpoint = openCheckpoint(pi, "approval");
		let choice: string | undefined;
		try {
			choice = await duringUserWait(pi, "approval", () =>
				ctx.ui.select("Proceed, handoff, or revise?", approvalOptions(isLeanContext(ctx.getContextUsage()))),
			);
		} catch (error) {
			resolveCheckpoint(pi, checkpoint.id, "failure");
			throw error;
		}
		if (choice?.startsWith(PROCEED)) {
			resolveCheckpoint(pi, checkpoint.id, "proceed");
			approved = { task, digest: await planDigest(ctx.cwd, task) };
			unapprovedTask = undefined;
			recordWorkflowPhase(pi, "execute");
			proceed(pi, ctx, task);
			return;
		}
		if (choice?.startsWith(HANDOFF)) {
			resolveCheckpoint(pi, checkpoint.id, "handoff");
			// Only a command handler can spawn a session, so the handoff path hands
			// the user the exact command — naming the task, since .pi/plan/ accumulates.
			const command = `/handoff ${task}`;
			if (!ctx.ui.getEditorText().trim()) ctx.ui.setEditorText(command);
			ctx.ui.notify(`Press Enter to run ${command} in a new session.`, "info");
			return;
		}
		resolveCheckpoint(pi, checkpoint.id, choice?.startsWith(REVISE) ? "revise" : "dismissed");
		ctx.ui.notify(`Plan not approved — revise and save again, or run /handoff ${task}.`, "info");
	});
}

/** Start execution here, naming the concrete plan path so the turn opens on it. */
function proceed(pi: ExtensionAPI, ctx: ExtensionContext, task: string): void {
	const { task: resolved } = resolvePlanTask(ctx.cwd, task, ctx.sessionManager.getSessionName());
	if (resolved) pi.sendUserMessage(handoffKickoff(resolved));
}
