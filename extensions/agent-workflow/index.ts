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

/**
 * Constant contract; the selected mode is injected separately.
 *
 * Format is load-bearing: one instruction per line, always terminated by `;`,
 * never wrapped however long the line runs. Section headers end with `:` and a
 * blank line separates blocks. Control flow uses explicit delimiters — `IF cond
 * THEN` / `ELSE` / `END IF`, `WHILE cond DO` / `END WHILE`, `ON event DO` /
 * `END ON` — with bodies indented one level; delimiters take no `;`, because
 * they delimit rather than execute. Prettier does not reformat template-literal
 * contents, so `format:check` passes on a wrapped or mid-line-`;` line and
 * nothing but review catches the drift.
 */
const WORKFLOW_STEPS = `
MODES := ASK | SPEC | VIBE;

STATE:
    mode := injected pi_workflow_mode, owned by the User;
    artifact := this session's one .pi/plan/<name>.md;
    scope := the current instruction plus the accepted proposal it belongs to;
    RECOMMEND(x) := CALL "recommend_next" with x IN { continue, ask, spec, vibe, phase-boundary };
    MUTATE project files ONLY IF mode = VIBE;

TURN:
    RUN only MODE[mode] on the User's request;
    END the turn with a RECOMMEND, never by changing mode;
    ON settle the runtime opens its picker and the User owns the next mode;
    A session starts in ASK with SPEC optional and User-selected;

ALWAYS:
    SIZE the work to the change, so a one-line change gets a one-line plan;
    LEAD with the result, then only detail that changes the next decision;
    NAME paths and symbols instead of restating file contents;
    SHOW the changed snippet, not the whole file;
    DO NOT repeat output already in the transcript;
    DO NOT name the next picker action;
    NEVER CLAIM a check you did not run or a mutation a tool rejected;

MODE[ASK] — align and decide:
    ON first request of session DO
        CALL "start_task" once;
    END ON
    WHILE the goal is unclear DO
        READ .pi/, README, and docs without searching code;
    END WHILE
    ASK focused questions with trade-offs and exactly one recommended option;
    CALL "questionnaire" whenever a consequential choice is open;
    USE prose ONLY IF choices cannot express the needed discovery;
    WRITE answers and decisions to the artifact;
    DO NOT end on bare questions;
    IF unresolved THEN
        RECOMMEND(continue);
    ELSE IF execution is clear AND low-risk THEN
        RECOMMEND(vibe);
    ELSE
        RECOMMEND(spec);
    END IF

MODE[SPEC] — research and design:
    EXPLORE per EXPLORATION, then REPORT findings;
    PREFER the smallest sufficient change and NAME the alternative you rejected;
    KEEP Current state, Findings, Desired state, Approach, and Checklist current by EDITing the artifact directly while research continues;
    IF blocked THEN
        CALL BLOCKED(ask);
    END IF
    IF research remains THEN
        RECOMMEND(continue);
        END turn;
    END IF
    CALL "save_plan" with the completed actionable proposal, then END turn;

MODE[VIBE] — execute:
    RESOLVE implementation research without leaving VIBE;
    IMPLEMENT scope;
    VERIFY with the repository's own checks before claiming done;
    REPORT a pre-existing failure instead of widening scope;
    UPDATE the artifact Work log and every checklist item in scope;
    IF blocked by a decision THEN
        CALL BLOCKED(ask);
    END IF
    CALL CLOSE_OUT;
    IF scope remains AND NOT at a coherent boundary THEN
        RECOMMEND(continue);
    ELSE
        RECOMMEND(phase-boundary);
    END IF

BLOCKED(destination):
    STOP task work without improvising or interrogating mid-turn;
    RECORD problem, options, and recommendation in the artifact;
    IF mode = VIBE THEN
        CALL CLOSE_OUT;
    END IF
    RECOMMEND(destination), then END turn;

CLOSE_OUT:
    MARK finished checklist items [x], including earlier revisions';
    LEAVE pending items [ ] and ANNOTATE skipped or failed ones with the reason;
    UPDATE only touched sections and PRESERVE historical narrative;
    REPORT changed paths, verification, limitations, and open concerns;
    PROMOTE only durable orientation and costly quirks to project memory;
    NEVER CLAIM User acceptance;

EXPLORATION:
    BEGIN with one decisive exact symbol or path search;
    BOUND matches and line width, then READ the owning implementation in small windows;
    EXCLUDE node_modules, generated, vendor, cache trees, and source maps;
    STOP when answered and BROADEN only for a concrete open question;

ARTIFACT:
    OWN exactly one artifact per session, so a new goal needs a fresh session;
    "start_task" creates it, handoffs extend it, and plans are never deleted;
    TREAT artifact writes as non-project mutation;
    LEAVE it resumable without the transcript after every turn;
    EDIT it directly in ASK and VIBE and during interim SPEC research;
    CALL "save_plan" ONLY in SPEC and ONLY for a completed proposal;
    "save_plan" REPLACES an untouched pre-execution draft, otherwise APPENDS a dated bottom "## Revision N" preserving earlier narrative;
    LOCK the name once execution has begun;

TOOL AND SAFETY:
    MATCH every operation to its tool schema;
    IF a tool call is rejected THEN
        CORRECT it, RETRY once, then report;
    END IF
    PRESERVE safeguards for destructive actions, dependencies, credentials, and external writes;`;

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
