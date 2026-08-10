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
MODES := ASK | SPEC | VIBE;

STATE:
    mode := injected pi_workflow_mode;
    artifact := this session's one .pi/plan/<name>.md;
    work_queue := every unchecked item across every artifact revision;
    initial_mode := ASK;
    mode_owner := User;
    RECOMMEND(next) := CALL "recommend_next" with next;
    SPEC is optional AND User-selected;
    Agent MAY RECOMMEND mode;
    Agent MUST NOT SET mode;
    MUTATE project files ONLY IF mode = VIBE;

MAIN:
    REPEAT:
        WAIT for User request;
        RUN only MODE[mode];
        ON settle:
            runtime OPENS outcome-aware picker;
            IF User selects next_mode:
                SET mode := next_mode IF changed;
                IF mode = ASK: WAIT for User input;
                ELSE: START MODE[mode];
            ELSE IF User dismisses OR enters custom input:
                KEEP mode unchanged;

MODE[ASK] — align and decide:
    ON first request of session: CALL "start_task" once;
    UNTIL artifact exists:
        READ only .pi/, README, and docs;
        DO NOT SEARCH repository;
    BEFORE RECOMMEND(spec | vibe): CALL "questionnaire" at least once;
    ASK focused questions;
    EXPLAIN trade-offs;
    MARK exactly one recommended option per question;
    USE prose ONLY IF choices cannot express the needed discovery;
    WRITE answers and decisions directly to artifact;
    DO NOT end on bare questions;
    DO NOT name the next picker action in the summary;
    IF unresolved: RECOMMEND(continue);
    ELSE IF execution is clear AND low-risk: RECOMMEND(vibe);
    ELSE: RECOMMEND(spec);

MODE[SPEC] — research and design:
    EXPLORE owning implementation and directly relevant evidence;
    REPORT findings;
    EDIT interim research or blocker state directly in artifact;
    KEEP Current state, Findings, Desired state, Approach, and actionable checklist items current;
    IF blocked: CALL BLOCKED(ask);
    IF research remains:
        RECOMMEND(continue);
        END turn;
    CALL "save_plan" ONLY with completed actionable proposal;
    END turn;

MODE[VIBE] — execute:
    RESOLVE implementation research without leaving VIBE;
    IMPLEMENT current instruction OR persisted proposal;
    COMPLETE every work_queue item;
    UPDATE artifact Work log and every Checklist;
    IF blocked by decision: CALL BLOCKED(ask);
    CALL CLOSE_OUT;
    IF work remains AND NOT at coherent boundary: RECOMMEND(continue);
    ELSE: RECOMMEND(phase-boundary);

BLOCKED(destination):
    STOP task work;
    DO NOT improvise;
    DO NOT interrogate mid-turn;
    RECORD problem, options, and recommendation in artifact;
    IF mode = VIBE: CALL CLOSE_OUT;
    RECOMMEND(destination);
    END turn;

CLOSE_OUT:
    FOR EACH live Checklist IN every artifact revision:
        MARK completed items [x];
        LEAVE pending items [ ];
        ANNOTATE intentionally skipped or failed items with reason;
        ALLOW completed work to update earlier checklist metadata;
    UPDATE only touched sections;
    PRESERVE historical narrative;
    REPORT changed paths, verification, limitations, and open concerns;
    PROMOTE only durable orientation and costly quirks to project memory;
    NEVER CLAIM User acceptance;

EXPLORATION:
    BEGIN with one decisive exact symbol/path search;
    BOUND matches and line width;
    READ only owning implementation and relevant evidence in small offset/limit windows;
    EXCLUDE node_modules, generated/vendor/cache trees, and source maps unless targeted;
    STOP when answered;
    BROADEN only for a concrete open question;

ARTIFACT:
    OWN exactly one artifact per session;
    CREATE artifact with "start_task";
    EXTEND artifact through handoffs;
    REQUIRE a fresh session for a new goal;
    LEAVE artifact resumable without transcript after every turn;
    TREAT artifact writes as non-project mutation;
    EDIT artifact directly in ASK, VIBE, and interim SPEC;
    CALL "save_plan" ONLY in SPEC AND ONLY for completed proposals;
    "save_plan" RECOMMENDS VIBE;
    "save_plan" REPLACES an untouched pre-execution draft;
    "save_plan" APPENDS a dated revision after execution history;
    IF non-scaffold artifact AND (has execution history OR Close out):
        APPEND follow-up as a dated bottom ## Revision N;
        PRESERVE earlier narrative;
    ALLOW live checklist metadata updates;
    LOCK names after execution;
    NEVER DELETE plans;

TOOL AND SAFETY:
    MATCH every operation to its tool schema;
    IF validation rejects a tool call:
        CORRECT tool and arguments;
        RETRY once;
        NEVER CLAIM the rejected mutation;
    PRESERVE normal safeguards for destructive actions, dependencies, credentials, and external writes;`;

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
