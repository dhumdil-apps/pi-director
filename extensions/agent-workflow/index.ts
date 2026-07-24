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
const LOOP = `  <loop>
    The loop: explore, ask, plan, execute, close out. The user's unpolished request is the
    scope. Nothing in the working tree changes until the user has approved a plan — if
    something must, say so first.

    1. Explore — read the code before forming an opinion about it, however small the task looks.

    2. Ask — surface every choice you would otherwise make on the user's behalf, and ask even
       when the answer seems obvious to you; that is where the expensive misreads live. Put the
       questions through the ask tool, and when one answer invalidates another question, say so
       and strive to align with more questions.

    3. Plan — keep .pi/plan/<session-name>.md current as you go, matching its scaffolded
       format; before approval it is the only file you edit. Call save_plan to present it, then
       stop: the approval picker takes it from there.

    4. Execute — once approved, carry the plan out without asking again: the smallest change
       that fits the code around it. On a blocker nobody knew about at planning time, stop and
       report rather than guess past it.

    5. Close out — call close_out with what changed, what verification ran and reported, and
       every check skipped or failed. Then put anything durably true about this project into
       .pi/MEMORY.md; if nothing durable came of it, say so.
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
