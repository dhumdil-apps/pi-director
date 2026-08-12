/**
 * openHandoffSession — the /handoff command's implementation.
 *
 * A handoff is the session boundary: it spawns a new session, seeds its name and
 * Q&A mode before the first User message, then resumes alignment against the
 * freshly checkpointed artifact.
 *
 * The replacement session inherits only the artifact, so the artifact has to be
 * current first. One checkpoint turn runs in the outgoing session and is awaited
 * before spawning — without it, everything learned since the last write is lost
 * at exactly the moment context is most valuable.
 *
 * Only a command handler can spawn a session, so /handoff owns this entry point.
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { agentApiTemplate } from "./agent-api.js";
import { appendHeadlessNotice } from "./notice.js";
import { MODE_EVENT, type ModeEvent, resolveWorkflowMode } from "./mode.js";
import { continueKickoff, suppressModePicker } from "./mode-picker.js";
import { currentPlanNextAction, type PlanTask, resolvePlanTask } from "./task.js";

const USAGE = "Usage: /handoff [session-name].";

function checkpointRequest(task: PlanTask): string {
  return agentApiTemplate("message.handoff.checkpoint", { planPath: task.planPath });
}

/**
 * Spawn a fresh session seeded with the resolved task's artifact. On a resolution
 * error it notifies and spawns nothing. Callable only with a command context,
 * since session spawning is gated to command handlers.
 */
export async function openHandoffSession(
  pi: ExtensionAPI,
  ctx: ExtensionCommandContext,
  taskName?: string,
): Promise<void> {
  const notify = (message: string, type: "info" | "warning") => {
    if (ctx.hasUI) ctx.ui.notify(message, type);
    else appendHeadlessNotice(pi, ctx.mode, message, type);
  };

  const { task, error } = resolvePlanTask(ctx.cwd, taskName, ctx.sessionManager.getSessionName());
  if (error || !task) {
    notify(error ?? USAGE, "warning");
    return;
  }

  // The source mode supplies transition context, but every replacement session
  // intentionally re-enters Q&A rather than inheriting executable work.
  const previous = resolveWorkflowMode(ctx.sessionManager.getBranch());

  // pi.sendUserMessage only queues the turn, so waitForIdle is what guarantees
  // the artifact is written before the session is replaced.
  suppressModePicker();
  notify(`Checkpointing ${task.planPath} before handing off.`, "info");
  pi.sendUserMessage(checkpointRequest(task));
  await ctx.waitForIdle();

  const nextAction = await currentPlanNextAction(ctx.cwd, task.name);
  const kickoff = continueKickoff("questionnaire", undefined, "start", previous, nextAction);
  await ctx.newSession({
    parentSession: ctx.sessionManager.getSessionFile(),
    // Seed task identity and Q&A before replacement-session extensions initialize;
    // only the replacement context may start its alignment kickoff.
    setup: async (sessionManager) => {
      sessionManager.appendSessionInfo(task.name);
      sessionManager.appendCustomEntry(MODE_EVENT, {
        mode: "questionnaire",
      } satisfies ModeEvent);
    },
    withSession: async (replacementCtx) => {
      const pending = replacementCtx.sendUserMessage(kickoff);
      if (!replacementCtx.hasUI) {
        await pending;
        return;
      }
      void pending.catch(() => {
        replacementCtx.ui.notify("Handoff completed, but Q&A alignment could not start.", "warning");
      });
    },
  });
}
