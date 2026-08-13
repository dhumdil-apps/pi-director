/**
 * openHandoffSession — the /handoff command's implementation.
 *
 * A handoff is the session boundary: it spawns a new session, seeds its name and
 * Align mode before the first User message, then resumes alignment against the
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
import { readFile } from "node:fs/promises";
import { agentApiTemplate, agentApiText } from "./agent-api.js";
import { appendHeadlessNotice } from "./notice.js";
import { MODE_EVENT, MODE_LABEL, type ModeEvent, resolveWorkflowMode } from "./mode.js";
import { continueKickoff, suppressModePicker } from "./mode-picker.js";
import { stripTimeSpent } from "./plan-time.js";
import { isCurrentPlanFormat, planPath, type PlanTask, resolvePlanTask } from "./task.js";

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

  if (!ctx.isIdle()) {
    notify("Wait for the active turn to settle before handing off.", "warning");
    return;
  }

  // The source mode supplies transition context, but every replacement session
  // intentionally re-enters Align rather than inheriting executable work.
  const previous = resolveWorkflowMode(ctx.sessionManager.getBranch());

  const absolutePlanPath = planPath(ctx.cwd, task.name);
  const initialContents = await readFile(absolutePlanPath, "utf8").catch(() => "");
  const legacy = !isCurrentPlanFormat(initialContents);
  if (!legacy) {
    notify(`Checkpointing ${task.planPath} before handing off.`, "info");
    let before = stripTimeSpent(initialContents);
    let checkpointed = false;
    for (let attempt = 0; attempt < 2 && !checkpointed; attempt += 1) {
      const branchLength = ctx.sessionManager.getBranch().length;
      const releaseSuppression = suppressModePicker();
      try {
        pi.sendUserMessage(checkpointRequest(task));
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        await ctx.waitForIdle();
      } finally {
        releaseSuppression();
      }
      const checkpointEntries = ctx.sessionManager.getBranch().slice(branchLength);
      const checkpointResponse = [...checkpointEntries]
        .reverse()
        .find((entry) => entry.type === "message" && entry.message.role === "assistant");
      const stopReason =
        checkpointResponse?.type === "message"
          ? (checkpointResponse.message as { stopReason?: unknown }).stopReason
          : undefined;
      const afterContents = await readFile(absolutePlanPath, "utf8").catch(() => "");
      const after = stripTimeSpent(afterContents);
      checkpointed = Boolean(
        checkpointResponse &&
        stopReason !== "error" &&
        stopReason !== "aborted" &&
        isCurrentPlanFormat(afterContents) &&
        after !== before,
      );
      before = after;
    }
    if (!checkpointed) {
      notify("Handoff stopped because a durable artifact checkpoint could not be verified.", "warning");
      return;
    }
  }

  const kickoff = legacy
    ? `Begin ${MODE_LABEL.align} against immutable legacy reference ${task.planPath}. Read it for context, then call start before the first .pi write to create a current-format continuation.\n${agentApiText("message.align.start")}`
    : continueKickoff("align", undefined, "start", previous);
  await ctx.newSession({
    parentSession: ctx.sessionManager.getSessionFile(),
    // Seed task identity and Align before replacement-session extensions initialize;
    // only the replacement context may start its alignment kickoff.
    setup: async (sessionManager) => {
      sessionManager.appendSessionInfo(task.name);
      sessionManager.appendCustomEntry(MODE_EVENT, {
        mode: "align",
      } satisfies ModeEvent);
    },
    withSession: async (replacementCtx) => {
      const pending = replacementCtx.sendUserMessage(kickoff);
      if (!replacementCtx.hasUI) {
        await pending;
        return;
      }
      void pending.catch(() => {
        replacementCtx.ui.notify("Handoff completed, but Align could not start.", "warning");
      });
    },
  });
}
