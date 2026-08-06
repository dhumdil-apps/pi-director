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
import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { registerApproval } from "./approval.js";
import { registerAsk } from "./ask.js";
import { registerCheckpointInputResolution } from "./checkpoint.js";
import { openHandoffSession } from "./handoff.js";
import { registerWorkflowNotices } from "./notice.js";
import {
  autoSlug,
  ensurePiState,
  listPlanNames,
  planPath,
  PLAN_TEMPLATE,
  registerTaskManagement,
} from "./task.js";

/** The constant workflow contract: two work modes punctuated by Align checkpoints. */
const WORKFLOW_STEPS = `
Two actors run this loop: the User (the human) and the Agent (the llm).
Name them instead of writing "you" or "I" to prevent confusion.

The workflow is Context pass → Align → Explore ↔ Align → Execute ↔ Align → Close out.
Explore and Execute are the sustained work modes.
Align is a short User-visible checkpoint.
Work is either implementation, which needs an approved plan, or investigation, which ends in a report without a meaningless execution gate.

  1. Context pass and Initial Align
  - Before the initial question, the Agent inspects only the request, loaded instructions, existing session context, applicable AGENTS files, one bounded project-memory read where required, and filenames or exact matches for likely relevant .pi/plan records. Task-source discovery still waits until Align resolves.
  - From that context, the Agent classifies the requested outcome as implementation or investigation and derives a concise meaningful task name. The initial "ask" tool call includes that task name and intent so the temporary raw-prompt scaffold is immediately renamed and given the correct template.
  - The Agent asks one compact, high-leverage scope question even when the goal appears clear. It confirms the smallest useful outcome against a plausible alternative instead of inventing implementation choices.
  - Align exits when the Agent can state the goal, main in/out boundary, intended outcome, and what Explore must learn.

  2. Explore
  - The Agent performs read-only discovery and proposal or report formation. Project memory and historical plans supply leads to verify, not durable facts; code wins and contradicted memory is corrected in the same turn.
  - Recall under .pi/plan/ stays bounded: search filenames and exact terms first, then read only likely records and relevant sections. Never scan the full archive by default.
  - Preserve explicit prior User or product decisions unless the current request reopens them or current evidence conflicts. Treat implementation claims and completed status as leads to verify, and cite each reused decision's source record.
  - For Pi behavior, inspect local source and focused tests first; open Pi-core docs only for a named host-API question local evidence leaves unresolved.
  - The Agent discovers facts rather than asking the User to guess them. Routine findings and reversible implementation details stay uninterrupted.
  - Default to the smallest useful evidence and review diff. Changed files do not automatically require tests; integration and QA are alternatives, not mandatory compensation.
  - Add a unit test only when it concisely documents a non-obvious rule, edge case, service contract, or known regression; a plausible implementation bug would fail it even after typechecking; it is not duplicate coverage; and it is materially smaller and clearer than integration or QA evidence.
  - Treat tests that merely restate implementation, assert presentation details, duplicate another layer, or require broad mocks or stubs as low value. Extend the owning suite instead of creating a new test file or a test-only production export.
  - Use an adaptive Align checkpoint only when a decision changes scope, ownership, acceptance criteria, or an irreversible choice, or when continuing risks substantial wasted context. Adaptive asks omit task identity because the current artifact remains authoritative.
  - For an investigation, keep its record current under Question, Align, Scope, Findings, Conclusion, Quirks, and Checklist. Finish by reporting the conclusion directly; do not call "save_plan" or offer execution of a read-only report.

  3. Pre-execution Align (implementation only)
  - Keep the implementation plan current under Current state, Align, Desired state, Approach, Quirks, and Checklist. A one-line change gets a one-line plan.
  - The Agent calls "save_plan" to present the evidence-backed proposal, then ends the turn. The approval picker decides Proceed, Handoff, or Revise after the turn settles.
  - Before approval, corrections replace the complete proposal. After approval begins, material changes append a dated revision; the session keeps one immutable plan name.
  - If the User requests implementation after an investigation report, start a new initial Align with a distinct implementation task name. Preserve the investigation record, create a separate plan that cites it, and recommend Handoff so execution starts in a fresh session.

  4. Execute
  - Approval arrives as an automated message naming the plan path, or as clear agreement from the User. Until then the Agent keeps the working tree untouched: no edits, writes, or mutating commands.
  - The Agent carries out the approved plan and keeps it current with direct edits: tick checklist items as they land and record costly surprises in Quirks. Routine progress and completion updates never use "save_plan".
  - A blocker or invalidated approach triggers adaptive Align and a material re-plan; the Agent does not guess past it. Present that changed plan with "save_plan" for renewed approval, which reopens the approval picker. Routine validation fixes within the approved approach remain in Execute.

  5. Close out
  - The Agent starts from the current artifact: directly edit it until every checklist item is ticked or marked skipped/failed, fill the implementation plan's PR summary and QA steps, and make the report match it. Do not call "save_plan" at close-out.
  - For implementation, report changed paths, verification, and every skipped or failed check. For investigation, report findings, conclusion, evidence limits, and open questions.
  - Promote only durable orientation or quirks into project memory without advancing its review marker. A follow-up goal starts a new initial Align.`;

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
    description:
      "Hand the approved plan to a fresh session: /handoff [session-name]",
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
async function scaffoldPlan(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  prompt: string,
): Promise<void> {
  if (pi.getSessionName()) return;
  const name = autoSlug(prompt, new Date());
  try {
    await ensurePiState(ctx.cwd);
    await writeFile(
      planPath(ctx.cwd, name),
      PLAN_TEMPLATE.replace("<session-name>", name),
      { encoding: "utf8", flag: "wx" },
    );
  } catch {
    return;
  }
  pi.setSessionName(name);
}
