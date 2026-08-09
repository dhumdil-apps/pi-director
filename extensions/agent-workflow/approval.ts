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
 * The authorization layer blocks source edit/write calls before approval. The
 * local warning below remains a compatibility back-stop for a save whose host
 * continues into another mutating call before settlement.
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import { isLeanContext } from "./context-usage.js";
import { stripTimeSpent } from "./plan-time.js";
import { duringUserWait } from "./user-wait.js";
import { handoffKickoff } from "./handoff.js";
import { appendHeadlessNotice } from "./notice.js";
import { recordAuthorization } from "./authorization.js";
import { recordWorkflowPhase } from "./phase.js";
import { planPath, resolvePlanTask, type PlanTask } from "./task.js";

/** Content identity of a plan file; a missing file hashes as empty, never throws. */
async function planDigest(cwd: string, task: string): Promise<string> {
	const contents = await readFile(planPath(cwd, task), "utf8").catch(() => "");
	return createHash("sha256").update(stripTimeSpent(contents)).digest("hex");
}

// Enough to catch the ways the working tree actually changes; a shell command is
// included wholesale rather than guessed at, since a read-only command warns at
// worst and a destructive one is exactly what this exists to surface.
const MUTATING_TOOLS = new Set(["edit", "write", "bash"]);

const PROCEED = "Proceed — execute this plan";
const HANDOFF = "Handoff — execute in a fresh session";
const REVISE = "Revise — return to Explore";
const PLAN_APPROVED_EVENT = "agent-workflow:plan-approved";

/**
 * ui.select takes plain string options with no initial index, so the
 * context-load recommendation lives in the labels: a lean context recommends
 * proceeding here, a loaded one recommends handing off to a fresh session.
 */
export function approvalOptions(lean: boolean, preferHandoff = false): string[] {
	return lean && !preferHandoff
		? [`${PROCEED} (recommended)`, HANDOFF, REVISE]
		: [`${HANDOFF} (recommended)`, PROCEED, REVISE];
}

export interface PlanReviewOptions {
	preferHandoff?: boolean;
	/** Command handlers can spawn a replacement session; normal saves cannot. */
	onHandoff?: () => Promise<void>;
	/** The useful recovery command for headless plan review. */
	recoveryCommand?: string;
}

/**
 * Show the one native approval picker used for a saved plan and manual command
 * recovery. Commands supply onHandoff because only their context can replace a
 * session; the normal save path instead prepares that command in the editor.
 */
export async function reviewPlan(
	pi: ExtensionAPI,
	ctx: ExtensionContext,
	task: PlanTask,
	options: PlanReviewOptions = {},
): Promise<"proceed" | "handoff" | "revise" | "dismissed"> {
	if (!ctx.hasUI) {
		appendHeadlessNotice(pi, ctx.mode, `Plan ready — run ${options.recoveryCommand ?? `/handoff ${task.name}`} to review and execute it.`, "info");
		return "dismissed";
	}

	const checkpoint = openCheckpoint(pi, "approval");
	let choice: string | undefined;
	try {
		choice = await duringUserWait(pi, "approval", () =>
			ctx.ui.select("Proceed, handoff, or revise?", approvalOptions(isLeanContext(ctx.getContextUsage()), options.preferHandoff)),
		);
	} catch (error) {
		resolveCheckpoint(pi, checkpoint.id, "failure");
		throw error;
	}
	if (choice?.startsWith(PROCEED)) {
		resolveCheckpoint(pi, checkpoint.id, "proceed");
		pi.events.emit?.(PLAN_APPROVED_EVENT, { task: task.name, digest: await planDigest(ctx.cwd, task.name) });
		recordAuthorization(pi, "approved", task.name);
		recordWorkflowPhase(pi, "execute");
		proceed(pi, ctx, task.name);
		return "proceed";
	}
	if (choice?.startsWith(HANDOFF)) {
		resolveCheckpoint(pi, checkpoint.id, "handoff");
		if (options.onHandoff) await options.onHandoff();
		else {
			const command = `/handoff ${task.name}`;
			if (!ctx.ui.getEditorText().trim()) ctx.ui.setEditorText(command);
			ctx.ui.notify(`Press Enter to run ${command} in a new session.`, "info");
		}
		return "handoff";
	}
	if (choice?.startsWith(REVISE)) {
		resolveCheckpoint(pi, checkpoint.id, "revise");
		recordAuthorization(pi, "required", task.name);
		recordWorkflowPhase(pi, "explore");
		ctx.ui.notify(`Plan not approved — revise and save again, or run /handoff ${task.name}.`, "info");
		return "revise";
	}
	resolveCheckpoint(pi, checkpoint.id, "dismissed");
	ctx.ui.notify(`Plan review dismissed — choose Revise or run /handoff ${task.name} when ready.`, "info");
	return "dismissed";
}

export function registerApproval(pi: ExtensionAPI): void {
	// Ephemeral by design: a pending offer belongs to the turn that armed it and
	// is never persisted, so a reload never resurrects a stale prompt.
	let pendingOffer: { task: string; preferHandoff: boolean } | undefined;
	// Which task the user approved in this session. Deliberately in-memory: it
	// only suppresses a duplicate prompt, so a reload costing one extra prompt is
	// cheaper than a durable fact and the derivation that reads it back.
	let approved: { task: string; digest: string } | undefined;
	// The task whose plan is on the table but unapproved, and whether its warning
	// has already been spent: one warning per task, so a session that chose to keep
	// going is told once instead of nagged on every edit.
	let unapprovedTask: string | undefined;
	let warnedTask: string | undefined;

	// Manual /execute recovery uses the same picker but bypasses save_plan's
	// settlement handler, so it publishes approval through this context-free event.
	pi.events.on?.(PLAN_APPROVED_EVENT, (value: unknown) => {
		const approval = value as { task?: unknown; digest?: unknown };
		if (typeof approval.task !== "string" || typeof approval.digest !== "string") return;
		approved = { task: approval.task, digest: approval.digest };
		if (unapprovedTask === approval.task) unapprovedTask = undefined;
	});

	pi.on("tool_execution_end", async (event, ctx) => {
		if (event.toolName !== "save_plan" || event.isError) return;
		const details = (event.result as { details?: { name?: unknown; kind?: unknown; source?: unknown } } | undefined)?.details;
		if (typeof details?.name !== "string" || details.kind === "investigation") return;
		// Re-presenting the approved plan unchanged is a correction, not a new decision.
		if (details.name === approved?.task && (await planDigest(ctx.cwd, details.name)) === approved.digest) return;
		pendingOffer = { task: details.name, preferHandoff: typeof details.source === "string" };
		unapprovedTask = details.name;
		// The plan result is already persisted and visible. Abort now so the host
		// reaches agent_settled and cannot let the model work past the approval gate.
		ctx.abort();
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
		const { task, preferHandoff } = offer;

		const resolved = resolvePlanTask(ctx.cwd, task, ctx.sessionManager.getSessionName()).task;
		if (!resolved) return;
		const outcome = await reviewPlan(pi, ctx, resolved, {
			preferHandoff,
			recoveryCommand: `/handoff ${task}`,
		});
		if (outcome === "proceed") {
			approved = { task, digest: await planDigest(ctx.cwd, task) };
			unapprovedTask = undefined;
		}
	});
}

/** Start execution here, naming the concrete plan path so the turn opens on it. */
function proceed(pi: ExtensionAPI, ctx: ExtensionContext, task: string): void {
	const { task: resolved } = resolvePlanTask(ctx.cwd, task, ctx.sessionManager.getSessionName());
	if (resolved) pi.sendUserMessage(handoffKickoff(resolved));
}
