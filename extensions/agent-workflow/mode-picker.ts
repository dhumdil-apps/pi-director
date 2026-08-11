/**
 * The mode picker — the single decision surface in the workflow.
 *
 * Runtime-owned rather than a tool: the Agent must not be able to skip the
 * User's choice by forgetting a call, and picking is faster than typing. It
 * opens when a settled turn has a route to choose, which is why a blocker in
 * Spec or Vibe can stop instead of interrogating the User mid-turn. Unresolved
 * Q&A remains inside its native ask loop and settles without a no-op picker.
 *
 * Cross-mode Spec and Vibe selections start the selected block immediately.
 * Cross-mode Q&A selections only switch mode and wait for the User's next input.
 */

import { type Static, Type } from "@sinclair/typebox";
import type { ExtensionAPI, ExtensionContext, SessionEntry } from "@earendil-works/pi-coding-agent";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import { isLeanContext } from "./context-usage.js";
import {
  MODE_EVENT,
  resolveWorkflowMode,
  MODE_LABEL,
  recordWorkflowMode,
  WORKFLOW_MODES,
  type WorkflowMode,
} from "./mode.js";
import { currentPlanHasOpenWork, currentPlanNextAction, PLAN_SAVED_EVENT, recordModeTransition } from "./task.js";
import { duringUserWait } from "./user-wait.js";

export const HANDOFF_OPTION = "🤝 Hand off to a fresh session";
export const PHASE_HANDOFF_OPTION = "🤝 Hand off next phase";
export const WRITE_CUSTOM_OPTION = "📝 Write a custom answer...";
export const NEXT_STEP_EVENT = "agent-workflow:next-step";

const RECOMMENDED = " (recommended)";

export type NextStepRecommendation = "continue" | WorkflowMode | "phase-boundary";

interface NextStepEvent {
  mode: WorkflowMode;
  recommendation: NextStepRecommendation;
  /** Concise context rendered in the recommended picker label. */
  reason?: string;
  /** Custom next-turn kickoff for actions that launch an Agent turn. */
  prompt?: string;
}

const NextStepParams = Type.Object({
  recommendation: Type.Union([
    Type.Literal("continue"),
    Type.Literal("questionnaire"),
    Type.Literal("spec"),
    Type.Literal("vibe"),
    Type.Literal("phase-boundary"),
  ]),
  reason: Type.Optional(
    Type.String({
      description: "Optional concise reason shown in the recommended picker label; omit when no reason is useful.",
    }),
  ),
  prompt: Type.Optional(
    Type.String({
      description:
        "Optional custom kickoff for Continue in Spec/Vibe or Spec/Vibe transitions; omit it for Q&A and phase-boundary handoff.",
    }),
  ),
});

type NextStepInput = Static<typeof NextStepParams>;

const ALLOWED_RECOMMENDATIONS: Record<WorkflowMode, readonly NextStepRecommendation[]> = {
  questionnaire: ["spec", "vibe", "phase-boundary"],
  spec: ["continue", "questionnaire", "vibe", "phase-boundary"],
  vibe: ["continue", "questionnaire", "spec", "phase-boundary"],
};

const START_LABELS: Record<WorkflowMode, string> = {
  questionnaire: `${MODE_LABEL.questionnaire} — Start a new direction`,
  spec: `${MODE_LABEL.spec} — Research a new direction`,
  vibe: `${MODE_LABEL.vibe} — Start implementing a new direction`,
};

const CONTINUE_LABELS: Record<WorkflowMode, string> = {
  questionnaire: `${MODE_LABEL.questionnaire} — Keep clarifying the direction`,
  spec: `${MODE_LABEL.spec} — Keep researching the plan`,
  vibe: `${MODE_LABEL.vibe} — Keep implementing`,
};

type KickoffIntent = "continue" | "start";

const MODE_KICKOFF_DIRECTIVES: Record<WorkflowMode, string> = {
  questionnaire: "clarify the next unresolved decision with one focused question",
  spec: "research the open questions and shape the findings into an actionable plan",
  vibe: "implement the pending task and verify the changed behavior",
};

function kickoffContext(nextAction?: string): string {
  const normalized = nextAction?.replace(/\s+/g, " ").trim();
  return normalized ? ` Prioritize this pending artifact item: “${normalized}”.` : "";
}

/** Everything the picker needs, so a command context can open it too. */
type PickerContext = Pick<ExtensionContext, "cwd" | "hasUI" | "ui" | "sessionManager"> & {
  getContextUsage?: ExtensionContext["getContextUsage"];
};

function startLabel(mode: WorkflowMode): string {
  return START_LABELS[mode];
}

type Recommendation = "continue" | "handoff" | WorkflowMode;
type PickerAction =
  | { kind: "continue"; mode: WorkflowMode; prompt?: string }
  | { kind: "handoff" }
  | { kind: "switch"; mode: WorkflowMode; prompt?: string }
  | { kind: "custom" };

interface PickerState {
  options: string[];
  actions: Map<string, PickerAction>;
}

function currentTurnSignal<T>(
  entries: SessionEntry[],
  customType: string,
  read: (entry: SessionEntry & { type: "custom" }) => T | undefined,
): T | undefined {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry?.type === "message" && entry.message.role === "user") return undefined;
    if (entry?.type !== "custom") continue;
    if (entry.customType === customType) return read(entry);
    if (entry.customType === MODE_EVENT) return undefined;
  }
  return undefined;
}

interface NextStepSignal {
  recommendation: NextStepRecommendation;
  reason?: string;
  prompt?: string;
}

function normalizeReason(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || undefined;
}

function labeledAction(label: string, reason?: string): string {
  return reason ? `${label} — ${reason}` : label;
}

function deriveNextStepSignal(entries: SessionEntry[], current: WorkflowMode): NextStepSignal | undefined {
  return currentTurnSignal(entries, NEXT_STEP_EVENT, (entry) => {
    const data = entry.data as Partial<NextStepEvent> | undefined;
    if (
      data?.mode !== current ||
      !ALLOWED_RECOMMENDATIONS[current].includes(data.recommendation as NextStepRecommendation)
    ) {
      return undefined;
    }
    const reason = normalizeReason(data.reason);
    const prompt = typeof data.prompt === "string" ? data.prompt.trim() : undefined;
    return {
      recommendation: data.recommendation as NextStepRecommendation,
      ...(reason ? { reason } : {}),
      ...(prompt ? { prompt } : {}),
    };
  });
}

export function deriveNextStep(entries: SessionEntry[], current: WorkflowMode): NextStepRecommendation | undefined {
  return deriveNextStepSignal(entries, current)?.recommendation;
}

function planWasJustSaved(entries: SessionEntry[]): boolean {
  return currentTurnSignal(entries, PLAN_SAVED_EVENT, () => true) === true;
}

function defaultRecommendation(
  current: WorkflowMode,
  lean: boolean,
  openWork: boolean,
  planSaved: boolean,
  explicit?: NextStepRecommendation,
): Recommendation | undefined {
  // A valid current-turn recommendation describes the work just presented and
  // must not be replaced by the artifact's stale closeout state.
  if (explicit && explicit !== "phase-boundary") return explicit === current ? "continue" : explicit;
  if (!openWork) return undefined;
  if (explicit === "phase-boundary") {
    return openWork ? "handoff" : undefined;
  }
  if (!lean) return "handoff";
  if (current === "spec" && planSaved) return "vibe";
  // Q&A continues inside the current Agent turn through ask. Without an explicit
  // route, settlement should not manufacture a recommended Q&A-to-Q&A action.
  if (current === "questionnaire") return undefined;
  return "continue";
}

export interface HandoffContinuation {
  mode: WorkflowMode;
  prompt?: string;
}

/** Derive the action a fresh, lean replacement session should inherit. */
export function deriveHandoffContinuation(
  entries: SessionEntry[],
  current: WorkflowMode,
  openWork: boolean,
): HandoffContinuation {
  const signal = deriveNextStepSignal(entries, current);
  const recommendation =
    signal?.recommendation === "phase-boundary"
      ? "continue"
      : defaultRecommendation(current, true, openWork, planWasJustSaved(entries), signal?.recommendation);
  const mode =
    recommendation === "questionnaire" || recommendation === "spec" || recommendation === "vibe"
      ? recommendation
      : current;
  const promptTargetsMode =
    signal?.recommendation === mode || (signal?.recommendation === "continue" && mode === current);
  return {
    mode,
    ...(promptTargetsMode && signal?.prompt ? { prompt: signal.prompt } : {}),
  };
}

function transitionLabel(current: WorkflowMode, next: WorkflowMode): string {
  if (next === "questionnaire") return `${MODE_LABEL.questionnaire} — Clarify the next decision`;
  if (current === "questionnaire" && next === "spec") return `${MODE_LABEL.spec} — Research the open questions`;
  if (current === "questionnaire" && next === "vibe") return `${MODE_LABEL.vibe} — Start implementing the request`;
  if (current === "spec" && next === "vibe") return `${MODE_LABEL.vibe} — Start implementing the plan`;
  if (current === "vibe" && next === "spec") return `${MODE_LABEL.spec} — Research the remaining questions`;
  return `${MODE_LABEL[next]} — Continue in ${MODE_LABEL[next]}`;
}

function secondaryLabel(current: WorkflowMode, next: WorkflowMode, openWork: boolean, artifactReason?: string): string {
  const label = openWork ? transitionLabel(current, next) : startLabel(next);
  return openWork && artifactReason ? labeledAction(label, artifactReason) : label;
}

function customLabel(current: WorkflowMode, openWork: boolean): string {
  const mode = openWork ? CONTINUE_LABELS[current] : MODE_LABEL[current];
  return `${WRITE_CUSTOM_OPTION} (${mode})`;
}

function pickerState(
  current: WorkflowMode,
  lean: boolean,
  openWork: boolean,
  planSaved: boolean,
  explicit?: NextStepRecommendation,
  questionnairePrompt?: string,
  explicitReason?: string,
  artifactReason?: string,
): PickerState {
  const recommendation = defaultRecommendation(current, lean, openWork, planSaved, explicit);
  const reason = explicitReason ?? artifactReason;
  const handoffReason =
    recommendation === "handoff" && artifactReason
      ? [explicitReason, `unfinished checklist: ${artifactReason}`].filter(Boolean).join("; ")
      : reason;
  const actions = new Map<string, PickerAction>();
  const options: string[] = [];
  const continueAction: PickerAction = {
    kind: "continue",
    mode: current,
    ...(current !== "questionnaire" && questionnairePrompt ? { prompt: questionnairePrompt } : {}),
  };
  const add = (label: string, action: PickerAction, recommended = false, actionReason = reason) => {
    const rendered = `${recommended ? labeledAction(label, actionReason) : label}${recommended ? RECOMMENDED : ""}`;
    options.push(rendered);
    actions.set(rendered, action);
  };

  if (recommendation === "continue") {
    add(CONTINUE_LABELS[current], continueAction, true);
  } else if (recommendation === "handoff") {
    add(PHASE_HANDOFF_OPTION, { kind: "handoff" }, true, handoffReason);
  } else if (recommendation) {
    add(
      transitionLabel(current, recommendation),
      {
        kind: "switch",
        mode: recommendation,
        ...(recommendation !== "questionnaire" && questionnairePrompt ? { prompt: questionnairePrompt } : {}),
      },
      true,
    );
  } else if (openWork) {
    add(CONTINUE_LABELS[current], continueAction);
  }

  // Completed Q&A already has an explicit route; its continuation only returns
  // to the editor, unlike Spec/Vibe continuations that start another Agent turn.
  if (current !== "questionnaire" && openWork && recommendation !== "continue" && recommendation !== undefined) {
    add(CONTINUE_LABELS[current], continueAction);
  }
  for (const mode of WORKFLOW_MODES) {
    if (mode === current || mode === recommendation) continue;
    add(secondaryLabel(current, mode, openWork, artifactReason), { kind: "switch", mode });
  }
  if (openWork && recommendation !== "handoff") {
    add(HANDOFF_OPTION, { kind: "handoff" });
  }
  add(customLabel(current, openWork), { kind: "custom" });
  return { options, actions };
}

export function modeOptions(
  current: WorkflowMode,
  lean: boolean,
  openWork = true,
  planSaved = false,
  explicit?: NextStepRecommendation,
  questionnairePrompt?: string,
  explicitReason?: string,
  artifactReason?: string,
): string[] {
  return pickerState(current, lean, openWork, planSaved, explicit, questionnairePrompt, explicitReason, artifactReason)
    .options;
}

export function continueKickoff(
  mode: WorkflowMode,
  prompt?: string,
  intent: KickoffIntent = "continue",
  previous?: WorkflowMode,
  nextAction?: string,
): string {
  const supplied = prompt?.trim();
  if (supplied) return supplied;

  const transition =
    intent === "start" && previous && previous !== mode
      ? `Switch from ${MODE_LABEL[previous]} to ${MODE_LABEL[mode]}.`
      : intent === "start"
        ? `Begin ${MODE_LABEL[mode]} mode for the selected direction.`
        : `Continue in ${MODE_LABEL[mode]} mode.`;
  return `${transition} ${MODE_KICKOFF_DIRECTIVES[mode]}.${kickoffContext(nextAction)}`;
}

function sendContinueKickoff(
  pi: ExtensionAPI,
  mode: WorkflowMode,
  prompt?: string,
  intent: KickoffIntent = "continue",
  previous?: WorkflowMode,
  nextAction?: string,
): void {
  // Use the user-message path so Pi runs before_agent_start again and injects
  // the current persisted mode marker and workflow contract for the continuation.
  pi.sendUserMessage(continueKickoff(mode, prompt, intent, previous, nextAction), { deliverAs: "followUp" });
}

/** Start the same continuation used by non-Q&A picker transitions. */
export function startModeContinuation(
  pi: ExtensionAPI,
  mode: WorkflowMode,
  previous?: WorkflowMode,
  nextAction?: string,
  prompt?: string,
): void {
  sendContinueKickoff(pi, mode, prompt, "start", previous, nextAction);
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
      if (ctx.hasUI) ctx.ui.notify("Workflow mode changed, but its artifact log could not be updated.", "warning");
    });
  }
  if (ctx.hasUI) ctx.ui.notify(`${MODE_LABEL[mode]} mode selected for this session.`, "info");
}

export async function openModePicker(pi: ExtensionAPI, ctx: PickerContext): Promise<void> {
  if (!ctx.hasUI) return;

  const branch = ctx.sessionManager.getBranch();
  const current = resolveWorkflowMode(branch);
  const planName = pi.getSessionName() ?? ctx.sessionManager.getSessionName?.();
  const openWork = await currentPlanHasOpenWork(ctx.cwd, planName);
  const artifactNextAction = await currentPlanNextAction(ctx.cwd, planName);
  const nextStep = deriveNextStepSignal(branch, current);
  const state = pickerState(
    current,
    isLeanContext(ctx.getContextUsage?.()),
    openWork,
    planWasJustSaved(branch),
    nextStep?.recommendation,
    nextStep?.prompt,
    nextStep?.reason,
    artifactNextAction,
  );
  const checkpoint = openCheckpoint(pi, "mode");
  let choice: string | undefined;
  try {
    choice = await duringUserWait(pi, "question", () => ctx.ui.select("What next?", state.options));
  } catch (error) {
    resolveCheckpoint(pi, checkpoint.id, "failure");
    throw error;
  }

  // Dismissal and the custom option are the same escape hatch: control returns
  // to the editor and the mode is untouched.
  if (choice === undefined) {
    resolveCheckpoint(pi, checkpoint.id, "dismissed");
    return;
  }

  const action = state.actions.get(choice);
  if (!action || action.kind === "custom") {
    resolveCheckpoint(pi, checkpoint.id, action?.kind === "custom" ? "custom" : "dismissed");
    return;
  }

  if (action.kind === "continue") {
    resolveCheckpoint(pi, checkpoint.id, "continue");
    if (action.mode !== "questionnaire") {
      sendContinueKickoff(pi, action.mode, action.prompt, "continue", current, artifactNextAction);
    }
    return;
  }

  if (action.kind === "handoff") {
    resolveCheckpoint(pi, checkpoint.id, "handoff");
    const command = `/handoff ${pi.getSessionName() ?? ""}`.trim();
    if (!ctx.ui.getEditorText().trim()) ctx.ui.setEditorText(command);
    ctx.ui.notify(`Press Enter to run ${command} in a new session.`, "info");
    return;
  }

  resolveCheckpoint(pi, checkpoint.id, action.mode);
  await applyMode(pi, ctx, action.mode, current);
  if (action.mode !== "questionnaire") {
    sendContinueKickoff(pi, action.mode, action.prompt, "start", current, artifactNextAction);
  }
}

export function registerModePicker(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "recommend_next",
    label: "Recommend Next Step",
    description:
      "Record the outcome that the post-turn picker should recommend. Call before settling when Q&A is complete and should proceed to Spec/Vibe, when Spec needs Q&A or more research, or when Vibe should continue, return to Q&A/Spec, or mark a coherent phase boundary. Unresolved Q&A continues through ask without calling this tool. Include a concise reason for the recommended picker label when useful. Q&A selections wait for the User's next input and must not include a custom kickoff. This records intent only; the User still selects the action.",
    parameters: NextStepParams,
    async execute(_toolCallId, params: NextStepInput, _signal, _onUpdate, ctx) {
      const mode = resolveWorkflowMode(ctx.sessionManager.getBranch());
      if (!ALLOWED_RECOMMENDATIONS[mode].includes(params.recommendation)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${params.recommendation} is not valid for the persisted runtime mode ${MODE_LABEL[mode]}. The injected mode marker is informational; continue in ${MODE_LABEL[mode]} or switch modes through the picker.`,
            },
          ],
          details: { mode, recommendation: params.recommendation },
          isError: true,
        };
      }
      const reason = normalizeReason(params.reason);
      const prompt = params.prompt?.trim();
      const promptAllowed =
        params.recommendation === "spec" ||
        params.recommendation === "vibe" ||
        (params.recommendation === "continue" && mode !== "questionnaire");
      if (prompt && !promptAllowed) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: a custom kickoff is only valid for Spec/Vibe transitions or Continue outside Q&A.",
            },
          ],
          details: { mode, recommendation: params.recommendation, error: "prompt is not valid for this action" },
          isError: true,
        };
      }
      const event: NextStepEvent = { mode, recommendation: params.recommendation };
      if (reason) event.reason = reason;
      if (prompt) event.prompt = prompt;
      pi.appendEntry(NEXT_STEP_EVENT, event);
      return {
        content: [
          {
            type: "text" as const,
            text: `The post-turn picker will recommend ${params.recommendation}${reason ? `: ${reason}` : ""}${prompt ? " with a custom kickoff" : ""}.`,
          },
        ],
        details: {
          mode,
          recommendation: params.recommendation,
          ...(reason ? { reason } : {}),
          ...(prompt ? { prompt } : {}),
        },
      };
    },
  });

  pi.on("agent_settled", async (_event, ctx) => {
    if (suppressNext) {
      suppressNext = false;
      return;
    }
    const branch = ctx.sessionManager.getBranch();
    const mode = resolveWorkflowMode(branch);
    // An unresolved or cancelled Q&A exchange has no route to choose. Return to
    // the editor; completed alignment records a Spec/Vibe/handoff recommendation.
    if (mode === "questionnaire" && !deriveNextStepSignal(branch, mode)) return;
    await openModePicker(pi, ctx);
  });
}
