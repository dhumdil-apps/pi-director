/**
 * Agent Workflow
 *
 * One loop per task — Align, Explore, Execute, and Close out — injected as a
 * flow contract rather than a rule list. Align is a short User-visible checkpoint,
 * while Explore and Execute are the only sustained work modes. Two guarantees
 * carry the weight: nothing changes before approval, and decisions stay cheap.
 * Craft advice
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
import { registerCheckpointInputResolution } from "./checkpoint.js";
import { openHandoffSession } from "./handoff.js";
import { registerWorkflowNotices } from "./notice.js";
import { autoSlug, ensurePiState, listPlanNames, planPath, PLAN_TEMPLATE, registerTaskManagement } from "./task.js";

/** The constant workflow contract: two work modes punctuated by Align checkpoints. */
const WORKFLOW_STEPS = `Two actors run this loop: the User (the human) and the Agent (you). Name them instead of writing "you" or "I" wherever a sentence could be read either way — in questions, plans, and reports alike.

The workflow is Align → Explore ↔ Align → Execute ↔ Align → Close out. Explore and Execute are the only sustained work modes. Align is a short User-visible checkpoint that reconciles intent with the context gained since the previous checkpoint. Scope changes how detailed the plan is, never whether there is one.

  1. Initial Align
  - Before source discovery, the Agent uses only the request, loaded instructions, existing session context, and one bounded project-memory read where required.
  - The Agent asks one compact, high-leverage scope question with the "ask" tool, even when the goal appears clear. It confirms the smallest useful outcome against a plausible alternative instead of inventing implementation choices.
  - Align exits when the Agent can state the goal, the main in/out boundary, and what Explore must learn.

  2. Explore
  - The Agent performs read-only discovery and proposal formation. Project memory supplies leads to verify, not durable facts; code wins and contradicted memory is corrected in the same turn.
  - For Pi behavior, inspect local source and focused tests first; open Pi-core docs only for a named host-API question local evidence leaves unresolved.
  - The Agent discovers facts rather than asking the User to guess them. Routine findings and reversible implementation details stay uninterrupted.
  - Use an adaptive Align checkpoint only when a decision changes scope, ownership, acceptance criteria, or an irreversible choice, or when continuing risks substantial wasted context. Present the context delta, recommendation, and consequence without repeating settled decisions.

  3. Pre-execution Align
  - The Agent keeps .pi/plan/<session-name>.md current under Current state, Decisions, Desired state, Approach, Quirks, and Checklist. A one-line change gets a one-line plan.
  - The Agent calls "save_plan" to present the evidence-backed proposal, then ends the turn. The approval picker decides Proceed, Handoff, or Revise after the turn settles.
  - Before approval, corrections replace the complete proposal. After approval begins, material changes append a dated revision; the session keeps one immutable plan name.

  4. Execute
  - Approval arrives as an automated message naming the plan path, or as clear agreement from the User. Until then the Agent keeps the working tree untouched: no edits, writes, or mutating commands.
  - The Agent carries out the approved plan, ticks its checklist while working, and records costly surprises in Quirks when they land.
  - A blocker or invalidated approach triggers adaptive Align and a revised plan; the Agent does not guess past it. Routine validation fixes within the approved approach remain in Execute.

  5. Close out
  - The Agent starts from the plan file: every checklist item is ticked or marked skipped/failed, and the report matches it.
  - The Agent reports changed paths, verification and every skipped or failed check, then promotes only durable orientation or quirks into project memory without advancing its review marker.
  - The plan remains handoff-ready. A follow-up goal starts a new initial Align; use a fresh session or /handoff when accumulated context makes that valuable.`;

/** Constant by design: nothing varies per turn, so the whole prefix is cacheable. */
export function workflowPrompt(): string {
	return `<pi_workflow>\n${WORKFLOW_STEPS}\n</pi_workflow>`;
}

export default function createExtension(pi: ExtensionAPI): void {
	registerTaskManagement(pi);
	registerCheckpointInputResolution(pi);
	registerAsk(pi);
	registerApproval(pi);
	registerWorkflowNotices(pi);

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
