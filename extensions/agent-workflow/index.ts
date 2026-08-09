/**
 * Agent Workflow
 *
 * A compact, constant pseudocode contract plus one tiny session-mode marker.
 * Mode belongs to the User: Ask aligns, Spec researches and proposes, Vibe
 * executes. The runtime enforces what judgment should not be trusted with — the
 * edit gate, the settled mode picker, the single artifact, and immutable plan
 * names — and leaves the rest to the contract.
 */

import { writeFile } from "node:fs/promises";
import type {
  ExtensionAPI,
  ExtensionCommandContext,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { registerAuthorization } from "./authorization.js";
import { registerCheckpointInputResolution } from "./checkpoint.js";
import { openHandoffSession } from "./handoff.js";
import {
  deriveWorkflowMode,
  recordWorkflowMode,
  workflowModePrompt,
  type WorkflowMode,
} from "./mode.js";
import {
  applyMode,
  openModePicker,
  registerModePicker,
} from "./mode-picker.js";
import { registerWorkflowNotices } from "./notice.js";
import {
  autoSlug,
  ensurePiState,
  listPlanNames,
  planPath,
  PLAN_TEMPLATE,
  registerTaskManagement,
} from "./task.js";

/** Constant contract; the selected mode is injected separately. */
const WORKFLOW_STEPS = `
MODES: ASK · SPEC · VIBE
    Mode is the User's. The Agent works in the injected pi_workflow_mode and may
    recommend another; it never adopts one.

LOOP:
    mode = ASK on session start
    WAIT for the User request
    RUN BLOCK[mode] — never another block
    ON settle the runtime opens the mode picker:
        Continue with the recommended next step · Ask · Spec · Vibe ·
        Hand off · Write your own...
        Dismissal and "Write your own..." return to typing; the mode is unchanged.
    REPEAT

BLOCK ASK — align and decide. No mutations.
    Until the plan file exists: read .pi/, README, and docs only; no repo search.
    Afterwards: search as far as the request requires.
    CALL "start_task" once, on the first request of the session.
    Frame the work, surface assumptions and trade-offs, recommend the next mode.
    Record what was settled under Align and Decisions.

BLOCK SPEC — research and design. No mutations.
    Establish facts from source and docs; code wins over memory.
    Fill Current state, Findings, Desired state, and Approach.
    CALL "save_plan" to persist and echo the proposal, then end the turn.
        It replaces the draft until the session has entered VIBE, and appends a
        dated revision after.

BLOCK VIBE — the only execution engine.
    Implement the current instruction, or the persisted proposal when one exists.
    Keep Work log and Checklist current; verify before ending.
    RUN CLOSE_OUT.

ON BLOCKER in SPEC or VIBE:
    STOP. Do not improvise and do not interrogate mid-turn.
    Write the problem and the options into the artifact, state the recommended
    resolution, and end the turn. The picker carries the decision.

CLOSE_OUT — a step, not a mode.
    Mark checklist items done, skipped, or failed.
    Fill the sections this work touched; leave the rest.
    Report changed paths, verification, limitations, and open concerns.
    Promote only durable orientation and costly quirks to project memory.
    Never claim User acceptance.

ARTIFACT:
    One session owns one .pi/plan/<name>.md, created at "start_task" and extended
    for the life of the session and its handoffs. A new goal needs a new session.
    Every turn must leave it good enough to resume from with no transcript.

SAFETY:
    Destructive actions, dependency changes, credentials, and external writes
    keep their normal permission in every mode.

COMMANDS:
    /ask /spec /vibe   switch mode; starts no turn
    /mode              re-open the picker
    /handoff           checkpoint the artifact, then continue it in a fresh session`;

/** Constant by design: the large cacheable prefix never varies per turn. */
export function workflowPrompt(): string {
  return `<pi_workflow>\n${WORKFLOW_STEPS}\n</pi_workflow>`;
}

export default function createExtension(pi: ExtensionAPI): void {
  registerAuthorization(pi);
  registerTaskManagement(pi);
  registerCheckpointInputResolution(pi);
  registerWorkflowNotices(pi);
  // Last, so any handler that settles first has already run.
  registerModePicker(pi);

  const setModeCommand =
    (mode: WorkflowMode) =>
    async (_args: string, ctx: ExtensionCommandContext) => {
      await applyMode(
        pi,
        ctx,
        mode,
        deriveWorkflowMode(ctx.sessionManager.getBranch()),
      );
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
    description:
      "Checkpoint the artifact and continue it in a fresh session: /handoff [session-name]",
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
      systemPrompt: `${event.systemPrompt}\n\n${workflowPrompt()}\n${workflowModePrompt(mode)}`,
    };
  });
}

/** A session starts in Ask; nothing else ever selects a mode for the User. */
async function ensureWorkflowMode(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
): Promise<WorkflowMode> {
  const existing = deriveWorkflowMode(ctx.sessionManager.getBranch());
  if (existing) return existing;
  recordWorkflowMode(pi, "ask");
  return "ask";
}

/** Best-effort scaffold so timing and handoff have a durable file immediately. */
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
      {
        encoding: "utf8",
        flag: "wx",
      },
    );
  } catch {
    return;
  }
  pi.setSessionName(name);
}
