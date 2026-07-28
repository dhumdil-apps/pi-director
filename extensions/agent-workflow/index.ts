/**
 * Agent Workflow
 *
 * One loop per task — goal, explore, ask, plan, execute, close out — injected as
 * a flow contract rather than a rule list. Two guarantees carry the weight:
 * nothing in the working tree changes before an approved plan, and questions are
 * cheap — cheap enough to have their own native picker (ask.ts). Craft advice
 * deliberately lives in the project's AGENTS.md instead, which the prompt points
 * at, so it is stated once.
 *
 * The injected block is a constant: no per-turn position, so the whole prefix
 * stays cacheable. Saving a plan for a task nobody has approved arms the
 * approval prompt (approval.ts); a flat plan file on disk carries the task
 * across sessions. Nothing here is enforced.
 *
 * The gate is delivered on agent_settled, so it only works if the agent yields
 * the turn after save_plan. That mechanism is stated in the loop rather than
 * implied by a prohibition, restated on the save_plan result itself (task.ts),
 * and — when it is missed anyway — surfaced as a warning rather than a refusal.
 */

import { writeFile } from "node:fs/promises";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { registerApproval } from "./approval.js";
import { registerAsk } from "./ask.js";
import { openHandoffSession } from "./handoff.js";
import { autoSlug, ensurePiState, listPlanNames, planPath, PLAN_TEMPLATE, registerTaskManagement } from "./task.js";

/**
 * The workflow steps as flow contract: five named actions, and only what the tools cannot
 * say for themselves. Mechanics belong to the tool that performs them — how the
 * plan file is named, how the session is renamed — so the block stays the shape
 * of the session and nothing else.
 */
const WORKFLOW_STEPS = `Every workflow runs all five steps (or resumes at step 4 when starting from a /handoff). Scope changes how detailed the plan is, never whether there is one: a one-line change gets a one-line plan, and "trivially small" is not an exemption.

  1. Explore
  - Start from project memory (.pi/MEMORY.md, or wherever AGENTS.md says it lives) - leads to verify, not durable facts. When code contradicts it, code wins: correct the entry in the same turn.
  - Discover what we are working with before forming an opinion about it.

  2. Ask
  - Surface important choices you would otherwise make on the user's behalf.
  - Put the questions through the "ask" tool.
  - When one answer invalidates another question, say so and try to align with more questions.

  3. Plan
  - Keep .pi/plan/<session-name>.md current under the scaffolded headings (Current state, Decisions, Desired state, Approach, Quirks, Checklist).
  - Call "save_plan" tool to present it, then end your turn: the approval prompt is delivered once the turn settles, so a turn that keeps going never reaches it.
  - Before approval, corrections and added requirements revise one complete proposal. Re-save that complete plan; only the approval prompt approves.
  - After approval/execution, a material scope change creates a dated revision: pass only what changed, preserving the approved plan. The session keeps one plan file (the <session-name> is immutable).

  4. Execute
  - Approval arrives as automated message naming the plan path ("Execute the approved plan at ..."), or as clear user agreement (e.g., "proceed", "go ahead", "approved").
  - Keep working tree untouched until approved — no edits, writes, or mutating commands (including bash).
  - Once approved, carry the plan out.
  - Keep the plan file current while working: tick checklist boxes (- [x]) using edit tools. Call "save_plan" only when scope changes or re-planning is needed.
  - Write a costly surprise into the plan's Quirks when it lands; close-out consolidates what was captured, it does not recall.
  - On a blocker stop and report rather than guess past it - proceed to step 3. to re-plan.

  5. Close out
  - Start from the plan file: every checklist box is ticked, or marked skipped or failed, and says the same thing your report says.
  - The next session reads the plan file - must be up to date and ready for handoff (via /handoff command).
  - Report what changed, what verification ran and reported, and every check skipped or failed.
  - Promote durable orientation and quirks captured in the plan into project memory, replacing what they supersede - never a task log, and never advance the /init review marker.
  - On more requested changes proceed to step 3. to re-plan.`;

/** Constant by design: nothing varies per turn, so the whole prefix is cacheable. */
export function workflowPrompt(): string {
	return `<pi_workflow>\n${WORKFLOW_STEPS}\n</pi_workflow>`;
}

export default function createExtension(pi: ExtensionAPI): void {
	registerTaskManagement(pi);
	registerAsk(pi);
	registerApproval(pi);

	pi.registerCommand("handoff", {
		description: "Hand the approved plan to a fresh session: /handoff [session-name]",
		getArgumentCompletions: (prefix) => {
			const last = prefix.trim();
			return listPlanNames(process.cwd())
				.filter((name) => name.startsWith(last))
				.map((name) => ({ value: name, label: name }));
		},
		handler: async (args, ctx) => {
			await openHandoffSession(pi, ctx, args.trim() || undefined);
		},
	});

	pi.on("before_agent_start", async (event, ctx) => {
		await scaffoldPlan(pi, ctx, event.prompt ?? "");
		return { systemPrompt: `${event.systemPrompt}\n\n${workflowPrompt()}` };
	});
}

/**
 * Give the task a plan file from its very first message, so the agent has a
 * living document to keep current instead of one that appears at step 4. Only a
 * fresh, unnamed session is scaffolded: a resumed or /handoff-seeded session
 * already carries its session name. Best-effort — an unwritable cwd must not stop
 * the turn.
 */
async function scaffoldPlan(pi: ExtensionAPI, ctx: ExtensionContext, prompt: string): Promise<void> {
	if (pi.getSessionName()) return;
	const name = autoSlug(prompt, new Date());
	try {
		await ensurePiState(ctx.cwd);
		await writeFile(planPath(ctx.cwd, name), PLAN_TEMPLATE.replace("<session-name>", name), { encoding: "utf8", flag: "wx" });
	} catch {
		return;
	}
	pi.setSessionName(name);
}
