/**
 * Agent Workflow
 *
 * A compact, constant pseudocode contract plus one tiny session-mode marker.
 * Mode belongs to the User: Ask aligns, Spec researches and proposes, Vibe
 * executes. The runtime enforces what judgment should not be trusted with — the
 * settled mode picker, the single artifact, and immutable plan names — and
 * leaves mode-specific execution guidance to the contract.
 */

import { writeFile } from "node:fs/promises";
import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { registerCheckpointInputResolution } from "./checkpoint.js";
import { openHandoffSession } from "./handoff.js";
import { deriveWorkflowMode, recordWorkflowMode, workflowModePrompt, type WorkflowMode } from "./mode.js";
import { applyMode, openModePicker, registerModePicker } from "./mode-picker.js";
import { registerWorkflowNotices } from "./notice.js";
import { registerQuestionnaire } from "./questionnaire.js";
import { autoSlug, ensurePiState, listPlanNames, planPath, PLAN_TEMPLATE, registerTaskManagement } from "./task.js";

/** Constant contract; the selected mode is injected separately. */
const WORKFLOW_STEPS = `
MODES: ASK · SPEC · VIBE

STATE:
    mode := injected pi_workflow_mode; ASK is the new-session default
    artifact := this session's one .pi/plan/<name>.md
    project_mutation_allowed := (mode = VIBE)
    Mode belongs to the User. The Agent may recommend another mode; it never
    adopts one.

MAIN:
    WAIT for the User request
    RUN MODE[mode] and no other mode procedure
    ON settle:
        runtime opens the outcome-aware picker
        IF User selects a mode: switch if needed; start MODE[selected]
        IF User dismisses or enters custom input: keep mode unchanged
    REPEAT

MODE[ASK] — align and decide:
    ASSERT project_mutation_allowed = false
    ON the session's first request: CALL "start_task" once
    UNTIL artifact exists: read only .pi/, README, and docs; no repository search
    Use "questionnaire" at least once before recommending SPEC or VIBE.
    Ask focused questions with trade-offs and exactly one recommended option;
    use prose only when choices cannot express the discovery needed.
    Write answers and decisions to the artifact directly. Never end on bare
    questions or name the next picker action in the summary.
    CALL "recommend_next" with continue while unresolved, Vibe for clear low-risk
    execution, or Spec for research and design.

MODE[SPEC] — research and design:
    ASSERT project_mutation_allowed = false
    Explore the owning implementation and directly relevant evidence; report findings.
    Edit interim research or blocker state directly; keep Current state, Findings,
    Desired state, Approach, and actionable checklist items current.
    IF blocked: CALL BLOCKED(ASK)
    IF research remains: CALL "recommend_next" with continue; END turn
    CALL "save_plan" only with the completed actionable proposal; END turn
        save_plan is Spec-only, recommends Vibe, replaces an untouched
        pre-execution draft, and appends a dated revision after execution history.

MODE[VIBE] — execute:
    ASSERT project_mutation_allowed = true
    work_queue := every unchecked item across every artifact revision
    Implement the current instruction or persisted proposal without ignoring
    earlier work_queue items. Edit the artifact directly; keep Work log and every
    Checklist current.
    IF blocked by a decision: CALL BLOCKED(ASK)
    IF blocked by research: CALL BLOCKED(SPEC)
    CALL CLOSE_OUT
    IF work remains at a coherent boundary: next := phase-boundary
    ELSE IF work remains: next := continue
    ELSE: next := phase-boundary
    CALL "recommend_next" with next

BLOCKED(destination):
    STOP task work; do not improvise or interrogate mid-turn.
    Record the problem, options, and recommendation in the artifact.
    IF mode = VIBE: CALL CLOSE_OUT
    CALL "recommend_next" with destination; END turn

CLOSE_OUT:
    FOR EACH live Checklist in every revision:
        mark completed items [x]
        leave pending items [ ]; annotate intentionally skipped or failed items
        with the reason; completed work may update earlier checklist metadata
    Update only the sections this work touched; preserve historical narrative.
    Report changed paths, verification, limitations, and open concerns.
    Promote only durable orientation and costly quirks to project memory.
    Never claim User acceptance.

EXPLORATION INVARIANT:
    Begin with one decisive exact symbol/path search. Bound matches and line width;
    read only the owning implementation and relevant evidence in small offset/limit
    windows. Exclude node_modules, generated/vendor/cache trees, and source maps
    unless targeted. Stop when answered; broaden only for a concrete open question.

ARTIFACT INVARIANT:
    One session owns one artifact, created by "start_task" and extended through
    handoffs. A new goal requires a fresh session. Leave the artifact resumable
    without the transcript after every turn.
    Artifact writes are not project mutation. Ask, Vibe, and interim Spec edit
    directly; only completed Spec proposals use "save_plan".
    In a non-scaffold plan, execution history or a Close out makes follow-up a
    dated ## Revision N. Never rewrite narrative; live checklist metadata may
    change. Names lock after execution; never delete plans.

TOOL AND SAFETY INVARIANTS:
    Match each operation to its tool schema. After validation rejection, correct
    the tool and arguments, retry once, and never claim a rejected mutation.
    Destructive actions, dependency changes, credentials, and external writes
    retain their normal permission requirements in every mode.`;

/** Constant by design: the large cacheable prefix never varies per turn. */
export function workflowPrompt(): string {
  return `<pi_workflow>\n${WORKFLOW_STEPS}\n</pi_workflow>`;
}

export default function createExtension(pi: ExtensionAPI): void {
  registerQuestionnaire(pi);
  registerTaskManagement(pi);
  registerCheckpointInputResolution(pi);
  registerWorkflowNotices(pi);
  // Last, so any handler that settles first has already run.
  registerModePicker(pi);

  const setModeCommand = (mode: WorkflowMode) => async (_args: string, ctx: ExtensionCommandContext) => {
    await applyMode(pi, ctx, mode, deriveWorkflowMode(ctx.sessionManager.getBranch()));
  };
  pi.registerCommand("ask", {
    description: "Align and decide before any work in this session",
    handler: setModeCommand("ask"),
  });
  pi.registerCommand("spec", {
    description: "Research and propose before any change in this session",
    handler: setModeCommand("spec"),
  });
  pi.registerCommand("vibe", {
    description: "Execute the current instruction or proposal in this session",
    handler: setModeCommand("vibe"),
  });
  pi.registerCommand("mode", {
    description: "Re-open the mode picker",
    handler: async (_args, ctx) => openModePicker(pi, ctx),
  });

  pi.registerCommand("handoff", {
    description: "Checkpoint the artifact and continue it in a fresh session: /handoff [session-name]",
    getArgumentCompletions: (prefix: string) => {
      const last = prefix.trim();
      return listPlanNames(process.cwd())
        .filter((name) => name.startsWith(last))
        .map((name) => ({ value: name, label: name }));
    },
    handler: async (args: string, ctx: ExtensionCommandContext) => {
      await openHandoffSession(pi, ctx, args.trim() || undefined);
    },
  });

  pi.on("before_agent_start", async (event, ctx) => {
    // Headless runs have no picker and no gate to answer, so the contract would
    // describe a workflow that cannot happen. Leave those sessions alone.
    if (!ctx.hasUI) return;
    const mode = await ensureWorkflowMode(pi, ctx);
    await scaffoldPlan(pi, ctx, event.prompt ?? "");
    return {
      systemPrompt: `${event.systemPrompt}\n\n${workflowPrompt()}`,
      message: {
        customType: "agent-workflow:mode-context",
        content: [{ type: "text", text: workflowModePrompt(mode) }],
        display: false,
      },
    };
  });
}

/** A session starts in Ask; nothing else ever selects a mode for the User. */
async function ensureWorkflowMode(pi: ExtensionAPI, ctx: ExtensionContext): Promise<WorkflowMode> {
  const existing = deriveWorkflowMode(ctx.sessionManager.getBranch());
  if (existing) return existing;
  recordWorkflowMode(pi, "ask");
  return "ask";
}

/** Best-effort scaffold so timing and handoff have a durable file immediately. */
async function scaffoldPlan(pi: ExtensionAPI, ctx: ExtensionContext, prompt: string): Promise<void> {
  if (pi.getSessionName()) return;
  const name = autoSlug(prompt, new Date());
  try {
    await ensurePiState(ctx.cwd);
    await writeFile(planPath(ctx.cwd, name), PLAN_TEMPLATE.replace("<session-name>", name), {
      encoding: "utf8",
      flag: "wx",
    });
  } catch {
    return;
  }
  pi.setSessionName(name);
}
