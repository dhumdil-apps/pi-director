/**
 * openHandoffSession — the /handoff command's implementation.
 *
 * A handoff is the session boundary: it spawns a new session, seeds its name and
 * mode before the first turn, and sends a kickoff carrying the concrete plan
 * path, so work resumes with a lean context and nothing to retype.
 *
 * The replacement session inherits only the artifact, so the artifact has to be
 * current first. One checkpoint turn runs in the outgoing session and is awaited
 * before spawning — without it, everything learned since the last write is lost
 * at exactly the moment context is most valuable.
 *
 * Only a command handler can spawn a session, so /handoff owns this entry point.
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { appendHeadlessNotice } from "./notice.js";
import { MODE_EVENT, MODE_LABEL, type ModeEvent, type WorkflowMode } from "./mode.js";
import { suppressModePicker } from "./mode-picker.js";
import { type PlanTask, resolvePlanTask } from "./task.js";

const USAGE = "Usage: /handoff [session-name].";

export function handoffKickoff(task: PlanTask, mode: WorkflowMode = "ask"): string {
  return `Continue the task recorded at ${task.planPath} in ${MODE_LABEL[mode]} mode. Extend that same file; do not start another.`;
}

function checkpointRequest(task: PlanTask): string {
  return `Before this session hands off, bring ${task.planPath} fully up to date with everything learned so far, so a fresh session can resume from it alone. Update the file and stop; do not start new work.`;
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

  // A fresh session must realign the next direction before it resumes work.
  const mode: WorkflowMode = "ask";

  // pi.sendUserMessage only queues the turn, so waitForIdle is what guarantees
  // the artifact is written before the session is replaced.
  suppressModePicker();
  notify(`Checkpointing ${task.planPath} before handing off.`, "info");
  pi.sendUserMessage(checkpointRequest(task));
  await ctx.waitForIdle();

  const kickoff = handoffKickoff(task, mode);
  await ctx.newSession({
    parentSession: ctx.sessionManager.getSessionFile(),
    // Seed task identity and mode before replacement-session extensions
    // initialize; the kickoff separately instructs the model.
    setup: async (sessionManager) => {
      sessionManager.appendSessionInfo(task.name);
      sessionManager.appendCustomEntry(MODE_EVENT, {
        mode,
      } satisfies ModeEvent);
    },
    withSession: async (next) => {
      // sendUserMessage resolves only when the triggered turn ends: an
      // interactive session must not block on it, while a headless run
      // would otherwise exit mid-turn.
      const turn = next.sendUserMessage(kickoff);
      if (next.hasUI) void turn.catch(() => {});
      else await turn;
    },
  });
}
