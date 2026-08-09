/**
 * The mode picker — the single decision surface in the workflow.
 *
 * Runtime-owned rather than a tool: the Agent must not be able to skip the
 * User's choice by forgetting a call, and picking is faster than typing. It
 * opens on every settled turn, which is why a blocker in Spec or Vibe can simply
 * stop and describe itself instead of interrogating the User mid-turn.
 *
 * Selecting a mode starts no turn. The User types the next request themselves,
 * so the picker only ever decides which block that request will run.
 */

import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import { isLeanContext } from "./context-usage.js";
import {
  deriveWorkflowMode,
  MODE_LABEL,
  recordWorkflowMode,
  WORKFLOW_MODES,
  type WorkflowMode,
} from "./mode.js";
import { recordModeTransition } from "./task.js";
import { duringUserWait } from "./user-wait.js";

export const CONTINUE_OPTION = "Continue with the recommended next step";
export const HANDOFF_OPTION = "Hand off to a fresh session";
export const WRITE_CUSTOM_OPTION = "Write custom answer...";

const CONTINUE_KICKOFF = "Continue with the recommended next step.";
const RECOMMENDED = " (recommended)";

/** Everything the picker needs, so a command context can open it too. */
type PickerContext = Pick<
  ExtensionContext,
  "cwd" | "hasUI" | "ui" | "sessionManager"
> & {
  getContextUsage?: ExtensionContext["getContextUsage"];
};

function switchLabel(mode: WorkflowMode): string {
  return `Switch to ${MODE_LABEL[mode]}`;
}

/**
 * A loaded context makes a fresh session the better move, so it leads. The
 * escape hatch is last and always present: when the picker is not what the User
 * wants, typing still is.
 */
export function modeOptions(current: WorkflowMode, lean: boolean): string[] {
  const switches = WORKFLOW_MODES.filter((mode) => mode !== current).map(
    switchLabel,
  );
  return lean
    ? [CONTINUE_OPTION, ...switches, HANDOFF_OPTION, WRITE_CUSTOM_OPTION]
    : [
        `${HANDOFF_OPTION}${RECOMMENDED}`,
        CONTINUE_OPTION,
        ...switches,
        WRITE_CUSTOM_OPTION,
      ];
}

// The handoff checkpoint turn is the extension talking to itself; a picker there
// would interrupt the very update the handoff is waiting for.
let suppressNext = false;

export function suppressModePicker(): void {
  suppressNext = true;
}

/** Persist the User's switch and log it where the artifact records decisions. */
export async function applyMode(
  pi: ExtensionAPI,
  ctx: Pick<PickerContext, "cwd" | "hasUI" | "ui">,
  mode: WorkflowMode,
  previous?: WorkflowMode,
): Promise<void> {
  recordWorkflowMode(pi, mode);
  const name = pi.getSessionName();
  if (name && previous !== mode) {
    await recordModeTransition(ctx.cwd, name, mode).catch(() => {
      if (ctx.hasUI)
        ctx.ui.notify(
          "Workflow mode changed, but its artifact log could not be updated.",
          "warning",
        );
    });
  }
  if (ctx.hasUI)
    ctx.ui.notify(
      `${MODE_LABEL[mode]} mode will apply to future work in this session.`,
      "info",
    );
}

export async function openModePicker(
  pi: ExtensionAPI,
  ctx: PickerContext,
): Promise<void> {
  if (!ctx.hasUI) return;

  const current = deriveWorkflowMode(ctx.sessionManager.getBranch()) ?? "ask";
  const options = modeOptions(current, isLeanContext(ctx.getContextUsage?.()));
  const checkpoint = openCheckpoint(pi, "mode");
  let choice: string | undefined;
  try {
    choice = await duringUserWait(pi, "question", () =>
      ctx.ui.select("What next?", options),
    );
  } catch (error) {
    resolveCheckpoint(pi, checkpoint.id, "failure");
    throw error;
  }

  // Dismissal and the custom option are the same escape hatch: control returns
  // to the editor and the mode is untouched.
  if (choice === undefined || choice === WRITE_CUSTOM_OPTION) {
    resolveCheckpoint(
      pi,
      checkpoint.id,
      choice === undefined ? "dismissed" : "custom",
    );
    return;
  }

  if (choice.startsWith(CONTINUE_OPTION)) {
    resolveCheckpoint(pi, checkpoint.id, "continue");
    pi.sendUserMessage(CONTINUE_KICKOFF);
    return;
  }

  if (choice.startsWith(HANDOFF_OPTION)) {
    resolveCheckpoint(pi, checkpoint.id, "handoff");
    const command = `/handoff ${pi.getSessionName() ?? ""}`.trim();
    if (!ctx.ui.getEditorText().trim()) ctx.ui.setEditorText(command);
    ctx.ui.notify(`Press Enter to run ${command} in a new session.`, "info");
    return;
  }

  const next = WORKFLOW_MODES.find((mode) => choice === switchLabel(mode));
  if (!next) {
    resolveCheckpoint(pi, checkpoint.id, "dismissed");
    return;
  }
  resolveCheckpoint(pi, checkpoint.id, next);
  await applyMode(pi, ctx, next, current);
}

export function registerModePicker(pi: ExtensionAPI): void {
  pi.on("agent_settled", async (_event, ctx) => {
    if (suppressNext) {
      suppressNext = false;
      return;
    }
    await openModePicker(pi, ctx);
  });
}
