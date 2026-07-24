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
 */

import { writeFile } from "node:fs/promises";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { registerApproval } from "./approval.js";
import { registerAsk } from "./ask.js";
import { openHandoffSession } from "./handoff.js";
import { autoSlug, ensurePiState, listPlanNames, planPath, PLAN_TEMPLATE, registerTaskManagement } from "./task.js";

/**
 * The loop as flow contract: five named actions, and only what the tools cannot
 * say for themselves. Mechanics belong to the tool that performs them — how the
 * plan file is named, what replaces a previous summary — so the block stays the
 * shape of the session and nothing else.
 */
const LOOP = `<loop>
   1. Explore
   - Discover what are we working with before forming an opinion about it.

   2. Ask
   - Surface important choices you would otherwise make on the user's behalf.
   - Put the questions through the "ask" tool.
   - When one answer invalidates another question, say so and try to align with more questions.

   3. Plan
   - Keep .pi/plan/<session-name>.md current as you go, matching its scaffolded format.
   - Call "save_plan" tool to present it, then wait for approval before implementation.
   - A new plan extends the current one (once a <session-name> is set its immutable).

   4. Execute
   - Once a plan is approved, carry the plan out.
   - On a blocker stop and report rather than guess past it - proceed to step 3. to re-plan.

   5. Close out
   - Call "close_out" tool with what changed, what verification ran and reported, and every check skipped or failed.
   - Update .pi/MEMORY.md with work-arounds or other quirks if present.
   - On more requested changes proceed to step 3. to re-plan.
</loop>`;

/** Constant by design: nothing varies per turn, so the whole prefix is cacheable. */
export function workflowPrompt(): string {
	return `<pi_workflow>\n${LOOP}\n</pi_workflow>`;
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
