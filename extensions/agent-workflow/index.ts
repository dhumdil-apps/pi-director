/**
 * Agent Workflow
 *
 * A compact, constant workflow contract plus one tiny session-mode marker.
 * Vibe delegates continuous implementation; Spec retains explicit review.
 * Approval settlement, source edit/write blocking, immutable approved names,
 * and persisted mode state are runtime-backed; judgment-heavy boundaries stay
 * in the model contract.
 */

import { writeFile } from "node:fs/promises";
import type {
  ExtensionAPI,
  ExtensionCommandContext,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { registerAuthorization } from "./authorization.js";
import { registerApproval, reviewPlan } from "./approval.js";
import { registerAsk } from "./ask.js";
import { registerCheckpointInputResolution } from "./checkpoint.js";
import { handoffKickoff, openHandoffSession } from "./handoff.js";
import {
  deriveWorkflowMode,
  ensureWorkflowMode,
  recordWorkflowMode,
  workflowModePrompt,
  type WorkflowMode,
} from "./mode.js";
import { registerWorkflowNotices } from "./notice.js";
import { recordWorkflowPhase } from "./phase.js";
import {
  autoSlug,
  ensurePiState,
  listPlanNames,
  planPath,
  recordModeTransition,
  resolvePlanTask,
  PLAN_TEMPLATE,
  registerTaskManagement,
  VIBE_PLAN_TEMPLATE,
} from "./task.js";

/** Constant contract; the selected mode is injected separately. */
const WORKFLOW_STEPS = `
The User is the human and the Agent is the llm. The injected pi_workflow_mode is session-wide and changes only through /vibe or /spec; switching keeps the current artifact and the next work records the transition. Artifact kind is independent: implementation changes the project; investigation only reports.

Run Context pass → Align → Explore ↔ Align → Execute ↔ Align → Close out.

1. Start and orient
- Before source discovery, use only the request, loaded instructions, session context, bounded orientation memory, and exact likely historical-plan lookups. Call "start_task" with a context-informed name and implementation/investigation intent. A distinct goal gets a new preserved artifact but inherits the session mode.
- Discover local facts instead of asking the User. Historical plans and memory are leads to verify; code wins.

2. Vibe
- For implementation, keep the compact Goal, Direction, Work log, Quirks, Checklist, and Close out record current, then build and verify in the same turn. Never call "save_plan" and never pause for workflow approval.
- Ask zero questions by default. Use at most one compact "ask" per work interval only when plausible directions materially change the visible outcome; otherwise use best judgment. Follow-ups remain Vibe regardless of size until /spec. Required destructive, dependency, credential, or external-action permission remains separate.
- New User input starts Explore; the first mutation enters Execute automatically. /execute continues the current log and /handoff moves it to a lean Vibe session.

3. Spec
- Perform one compact initial Align, then evidence-backed Discovery → Design → Refinement. Use adaptive "ask" only when a decision materially changes the next work interval, scope, ownership, acceptance, or an irreversible choice.
- For implementation, keep Goal, Current state, Align, Decisions, Desired state, Approach, Quirks, Checklist, and Close out current. A one-line change gets a one-line plan.
- Present the complete proposal with "save_plan" and stop. Only Proceed or an approved handoff authorizes project changes; Revise returns to Explore. Plan metadata may change before approval, project files may not.
- After a Spec run settles, every later User-requested mutation needs a complete dated revision and fresh Proceed/Handoff/Revise approval, even small polish. Fixes discovered during uninterrupted execution that are necessary to meet the approved plan remain automatic. Approved plan names never change.

4. Investigation and close out
- Investigations in either mode maintain only Question, Align, Scope, Findings, Conclusion, Quirks, and Checklist; update directly, report, and never call "save_plan" or request execution approval. Later implementation gets a distinct artifact citing the investigation.
- During Execute, keep the artifact current automatically. Stop only for a blocker, invalidated approach, or required action permission; in Spec, any changed requested outcome returns through approval.
- At close out, directly finish every checklist item and implementation PR summary/QA steps; investigations instead finish findings and conclusion. Report changed paths, verification, limitations, and unresolved concerns without declaring User acceptance. Promote only durable orientation or quirks to memory.`;

/** Constant by design: the large cacheable prefix never varies per turn. */
export function workflowPrompt(): string {
  return `<pi_workflow>\n${WORKFLOW_STEPS}\n</pi_workflow>`;
}

export default function createExtension(pi: ExtensionAPI): void {
  registerAuthorization(pi);
  registerTaskManagement(pi);
  registerCheckpointInputResolution(pi);
  registerAsk(pi);
  registerApproval(pi);
  registerWorkflowNotices(pi);

  const setModeCommand = (mode: WorkflowMode) => async (_args: string, ctx: ExtensionCommandContext) => {
    const previous = deriveWorkflowMode(ctx.sessionManager.getBranch()) ?? "spec";
    recordWorkflowMode(pi, mode);
    const name = pi.getSessionName();
    if (previous !== mode && name) {
      await recordModeTransition(ctx.cwd, name, mode).catch(() => {
        if (ctx.hasUI) ctx.ui.notify("Workflow mode changed, but its artifact log could not be updated.", "warning");
      });
    }
    if (ctx.hasUI) ctx.ui.notify(`${mode === "vibe" ? "Vibe" : "Spec"} mode will apply to future work in this session.`, "info");
  };
  pi.registerCommand("vibe", {
    description: "Use automatic Vibe workflow for future work in this session",
    handler: setModeCommand("vibe"),
  });
  pi.registerCommand("spec", {
    description: "Use reviewed Spec workflow for future work in this session",
    handler: setModeCommand("spec"),
  });

  const completions = (prefix: string) => {
    const last = prefix.trim();
    return listPlanNames(process.cwd())
      .filter((name) => name.startsWith(last))
      .map((name) => ({ value: name, label: name }));
  };

  const reviewCommand = (command: "execute" | "handoff") => async (args: string, ctx: ExtensionCommandContext) => {
    const requested = args.trim() || undefined;
    const { task, error } = resolvePlanTask(ctx.cwd, requested, ctx.sessionManager.getSessionName());
    if (!task) {
      if (ctx.hasUI) ctx.ui.notify(error ?? `Usage: /${command} [session-name].`, "warning");
      return;
    }

    const mode = deriveWorkflowMode(ctx.sessionManager.getBranch()) ?? "spec";
    if (mode === "vibe") {
      if (command === "handoff") await openHandoffSession(pi, ctx, task.name, "vibe");
      else {
        recordWorkflowPhase(pi, "execute");
        pi.sendUserMessage(handoffKickoff(task, "vibe"));
      }
      return;
    }

    await reviewPlan(pi, ctx, task, {
      preferHandoff: command === "handoff",
      recoveryCommand: `/${command} ${task.name}`,
      onHandoff: () => openHandoffSession(pi, ctx, task.name, "spec"),
    });
  };
  pi.registerCommand("execute", {
    description: "Execute or review the current plan: /execute [session-name]",
    getArgumentCompletions: completions,
    handler: reviewCommand("execute"),
  });
  pi.registerCommand("handoff", {
    description: "Continue the current plan in a fresh session: /handoff [session-name]",
    getArgumentCompletions: completions,
    handler: reviewCommand("handoff"),
  });

  // Human input starts an exploration interval. Extension-generated approval
  // kickoffs retain Execute and do not revoke authorization.
  pi.on("input", async (event) => {
    if (event.source !== "extension") recordWorkflowPhase(pi, "explore");
  });

  pi.on("before_agent_start", async (event, ctx) => {
    const freshSession = !pi.getSessionName();
    const mode = await ensureWorkflowMode(pi, ctx, freshSession);
    await scaffoldPlan(pi, ctx, event.prompt ?? "", mode);
    return { systemPrompt: `${event.systemPrompt}\n\n${workflowPrompt()}\n${workflowModePrompt(mode)}` };
  });
}

/** Best-effort scaffold so timing and handoff have a durable file immediately. */
async function scaffoldPlan(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  prompt: string,
  mode: WorkflowMode,
): Promise<void> {
  if (pi.getSessionName()) return;
  const name = autoSlug(prompt, new Date());
  try {
    await ensurePiState(ctx.cwd);
    await writeFile(
      planPath(ctx.cwd, name),
      (mode === "vibe" ? VIBE_PLAN_TEMPLATE : PLAN_TEMPLATE).replace("<session-name>", name),
      { encoding: "utf8", flag: "wx" },
    );
  } catch {
    return;
  }
  pi.setSessionName(name);
}
