/**
 * openHandoffSession — the /handoff command's implementation.
 *
 * A handoff is the session boundary: it spawns a new session, seeds its name and
 * Align mode, then auto-starts ordinary Align continue against the already-written
 * artifact. Picker-selected handoff still prepares this command for explicit Enter.
 *
 * Only a command handler can spawn a session, so /handoff owns this entry point.
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { agentApiTemplate } from "./agent-api.js";
import { appendHeadlessNotice } from "./notice.js";
import { MODE_EVENT, MODE_LABEL, type ModeEvent } from "./mode.js";
import { resolvePlanTask } from "./task.js";

const USAGE = "Usage: /handoff [session-name].";

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

  const kickoff = agentApiTemplate("message.kickoff.continue", { target: MODE_LABEL.align });
  await ctx.newSession({
    parentSession: ctx.sessionManager.getSessionFile(),
    // Seed task identity and Align before replacement-session extensions initialize;
    // only the replacement context may start its alignment continue.
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
