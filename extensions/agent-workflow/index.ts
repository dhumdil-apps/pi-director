/**
 * Agent Workflow
 *
 * One loop per task — goal, explore, ask, plan, execute, close out — injected as
 * a flow contract rather than a rule list. Two guarantees carry the weight:
 * nothing in the working tree changes before an approved plan, and questions are
 * cheap. Craft advice deliberately lives in the project's AGENTS.md instead,
 * which the prompt points at, so it is stated once.
 *
 * The injected block is a constant: no per-turn position, so the whole prefix
 * stays cacheable. Saving a plan for a task nobody has approved arms the
 * approval prompt (approval.ts); a flat plan file on disk carries the task
 * across sessions. Nothing here is enforced.
 */

import { writeFile } from "node:fs/promises";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { registerApproval } from "./approval.js";
import { openHandoffSession } from "./handoff.js";
import { autoSlug, ensurePiState, listPlanNames, planPath, PLAN_TEMPLATE, registerTaskManagement } from "./task.js";

/**
 * The loop as flow contract: only what shapes the session and what the agent
 * cannot read off the repository. Every line is here because its absence
 * produced a misunderstanding — unplanned changes, or a silent assumption.
 */
const LOOP = `  <loop>
    Every task runs the same loop: goal, explore, ask, plan, execute, close out.
    Nothing in the working tree changes until the user has approved a plan.

    1. Goal — the user's request is the scope. Read the project's AGENTS.md and .pi/MEMORY.md
       first; they carry the conventions and past decisions you would otherwise rediscover the
       expensive way. A plan file for this task was scaffolded at .pi/plan/<task-name>.md when
       the session opened — it is your living document, so keep it current as you go, and call
       save_plan with a meaningful name once the real subject is clear (the leading timestamp
       is kept, so files stay time-ordered).

    2. Explore — read the code before forming an opinion about it. A plan written from memory
       of a codebase is a guess wearing a plan's clothes: open the files the task touches,
       their callers and their tests, however small the task looks.

    3. Ask — surface every choice you would otherwise make on the user's behalf. Assumptions
       are where misunderstanding starts, and a question costs a sentence while a wrong plan
       costs the whole task. Ask in ordinary messages, and ask even when the answer seems
       obvious to you — obvious-to-you is exactly where the expensive misreads live. Prefer
       naming the concrete options and your recommendation over an open-ended question.

    4. Plan, then stop — write the plan into the file and call save_plan to present it. A good
       plan covers the current state, the decisions taken and how each question was answered,
       the desired state, the approach, and the quirks worth carrying into a handoff; shape it
       to the task — the scaffolded file sketches those as placeholders. save_plan echoes the
       file back so the user decides against exactly what is on disk. Present the same content,
       end with "Proceed, handoff, or revise?", and stop. The choice is theirs.

    5. Execute — once approved, carry the plan out without asking again. On a blocker nobody
       knew about at planning time, stop and report rather than guessing past it. Re-saving a
       corrected plan mid-implementation is normal and needs no ceremony.

    6. Close out — write into the plan file's Implementation summary what changed, what
       verification actually ran and what it reported, and every check skipped or failed. Then
       put anything durably true about this project into .pi/MEMORY.md — a convention learned,
       a trap hit, a decision worth keeping. If nothing durable came of it, write nothing and
       say so. A blocker that invalidates the plan goes back to step 1; a new goal starts a
       new loop.

    Verification commands, git discipline, and repository conventions come from the project's
    AGENTS.md — follow it. Plans live at .pi/plan/ and are the user's to keep, archive, or
    remove — never delete one; legacy .pi/goal/ files are ignored and preserved.
  </loop>`;

/** Constant by design: nothing varies per turn, so the whole prefix is cacheable. */
export function workflowPrompt(): string {
	return `<pi_workflow>\n${LOOP}\n</pi_workflow>`;
}

export default function createExtension(pi: ExtensionAPI): void {
	registerTaskManagement(pi);
	registerApproval(pi);

	pi.registerCommand("handoff", {
		description: "Hand the approved plan to a fresh session: /handoff [task-name]",
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
 * already carries its task name. Best-effort — an unwritable cwd must not stop
 * the turn.
 */
async function scaffoldPlan(pi: ExtensionAPI, ctx: ExtensionContext, prompt: string): Promise<void> {
	if (pi.getSessionName()) return;
	const name = autoSlug(prompt, new Date());
	try {
		await ensurePiState(ctx.cwd);
		await writeFile(planPath(ctx.cwd, name), PLAN_TEMPLATE.replace("<task-name>", name), { encoding: "utf8", flag: "wx" });
	} catch {
		return;
	}
	pi.setSessionName(name);
}
