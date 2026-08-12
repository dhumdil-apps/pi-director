/**
 * The mode picker — the single decision surface in the workflow.
 *
 * Runtime-owned rather than a tool: the Agent must not be able to skip the
 * User's choice by forgetting a call, and picking is faster than typing. It
 * opens when a settled turn has a route to choose, which is why a blocker in
 * Spec or Vibe can stop instead of interrogating the User mid-turn. Unresolved
 * Q&A remains inside its native ask loop and settles without a no-op picker.
 *
 * Automatic same-mode and cross-mode selections start the selected block
 * immediately. The neutral custom-answer option is the editor wait state.
 */

import { type Static, Type } from "@sinclair/typebox";
import type { ExtensionAPI, ExtensionContext, SessionEntry } from "@earendil-works/pi-coding-agent";
import { agentApiTemplate, agentApiText } from "./agent-api.js";
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
export const ASK_SETTLEMENT_EVENT = "agent-workflow:ask-settlement";

export type NextStepActionMode = WorkflowMode | "phase-boundary";

interface NextStepAction {
  mode: NextStepActionMode;
  /** Concise context rendered beside this Agent-authored action. */
  reason?: string;
  /** Custom next-turn kickoff for this Agent-starting mode action. */
  prompt?: string;
}

interface NextStepEvent {
  mode: WorkflowMode;
  actions: NextStepAction[];
}

const NextStepActionParams = Type.Object({
  mode: Type.Union([
    Type.Literal("questionnaire"),
    Type.Literal("spec"),
    Type.Literal("vibe"),
    Type.Literal("phase-boundary"),
  ]),
  reason: Type.Optional(Type.String({ description: agentApiText("tool.recommend-next.action.reason") })),
  prompt: Type.Optional(
    Type.String({
      description: agentApiText("tool.recommend-next.action.prompt"),
    }),
  ),
});

const NextStepParams = Type.Object({
  actions: Type.Array(NextStepActionParams, {
    minItems: 1,
    maxItems: 4,
    description: agentApiText("tool.recommend-next.actions"),
  }),
});

type NextStepInput = Static<typeof NextStepParams>;

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

function kickoffContext(nextAction?: string): string {
  const normalized = nextAction?.replace(/\s+/g, " ").trim();
  return normalized ? agentApiTemplate("message.kickoff.pending-action", { nextAction: normalized }) : "";
}

function kickoffDirective(source: WorkflowMode, target: WorkflowMode): string {
  return agentApiText(`message.kickoff.directive.${source}.${target}`);
}

/** Everything the picker needs, so a command context can open it too. */
type PickerContext = Pick<ExtensionContext, "cwd" | "hasUI" | "ui" | "sessionManager"> & {
  getContextUsage?: ExtensionContext["getContextUsage"];
};

function startLabel(mode: WorkflowMode): string {
  return START_LABELS[mode];
}

type PickerAction =
  | { kind: "continue"; mode: WorkflowMode; prompt?: string }
  | { kind: "handoff" }
  | { kind: "switch"; mode: WorkflowMode; prompt?: string; startAgent: boolean }
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
  actions: NextStepAction[];
}

function normalizeReason(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || undefined;
}

function labeledAction(label: string, reason?: string): string {
  return reason ? `${label} — ${reason}` : label;
}

function normalizeAction(value: unknown): NextStepAction | undefined {
  if (!value || typeof value !== "object") return undefined;
  const { mode, reason, prompt } = value as Partial<NextStepAction>;
  if (!["questionnaire", "spec", "vibe", "phase-boundary"].includes(mode as string)) return undefined;
  const normalizedReason = normalizeReason(reason);
  const normalizedPrompt = typeof prompt === "string" ? prompt.trim() : undefined;
  if (mode === "phase-boundary" && normalizedPrompt) return undefined;
  return {
    mode,
    ...(normalizedReason ? { reason: normalizedReason } : {}),
    ...(normalizedPrompt ? { prompt: normalizedPrompt } : {}),
  } as NextStepAction;
}

function deriveNextStepSignal(entries: SessionEntry[], current: WorkflowMode): NextStepSignal | undefined {
  return currentTurnSignal(entries, NEXT_STEP_EVENT, (entry) => {
    const data = entry.data as Partial<NextStepEvent> | undefined;
    if (data?.mode !== current || !Array.isArray(data.actions)) return undefined;
    const actions = data.actions.map(normalizeAction).filter((action): action is NextStepAction => Boolean(action));
    if (!actions.length || new Set(actions.map((action) => action.mode)).size !== actions.length) return undefined;
    return { actions };
  });
}

export function deriveNextStep(entries: SessionEntry[], current: WorkflowMode): NextStepAction[] | undefined {
  return deriveNextStepSignal(entries, current)?.actions;
}

function completedAsk(entries: SessionEntry[]): boolean {
  return (
    currentTurnSignal(entries, ASK_SETTLEMENT_EVENT, (entry) => {
      const outcome = (entry.data as { outcome?: unknown } | undefined)?.outcome;
      return outcome === "answered" || outcome === "cancelled" ? outcome : undefined;
    }) === "answered"
  );
}

function planWasJustSaved(entries: SessionEntry[]): boolean {
  return currentTurnSignal(entries, PLAN_SAVED_EVENT, () => true) === true;
}

/** Supply context-aware routing only while an unfinished plan still needs work. */
function defaultActions(current: WorkflowMode, lean: boolean, openWork: boolean, planSaved: boolean): NextStepAction[] {
  if (!openWork || current === "questionnaire") return [];
  if (!lean) return [{ mode: "phase-boundary" }];
  if (current === "spec" && planSaved) return [{ mode: "vibe" }];
  return [{ mode: current }];
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

function customLabel(): string {
  return WRITE_CUSTOM_OPTION;
}

function questionnaireKickoff(
  prompt?: string,
  reason?: string,
  nextAction?: string,
  intent: KickoffIntent = "continue",
  previous?: WorkflowMode,
): string {
  const context =
    prompt?.trim() ||
    (reason
      ? agentApiTemplate("message.questionnaire.reason", { reason, context: kickoffContext(nextAction) })
      : undefined) ||
    defaultKickoff("questionnaire", intent, previous, nextAction);
  return `${context}\n${agentApiText("message.questionnaire.start")}`;
}

function pickerState(
  current: WorkflowMode,
  openWork: boolean,
  explicit: NextStepAction[] = [],
  artifactReason?: string,
): PickerState {
  const actions = new Map<string, PickerAction>();
  const options: string[] = [];
  const agentModes = new Set(
    explicit.filter((action) => action.mode !== "phase-boundary").map((action) => action.mode),
  );
  const add = (label: string, action: PickerAction, reason?: string) => {
    const rendered = labeledAction(label, reason);
    options.push(rendered);
    actions.set(rendered, action);
  };

  for (const action of explicit) {
    if (action.mode === "phase-boundary") {
      add(PHASE_HANDOFF_OPTION, { kind: "handoff" }, action.reason);
      continue;
    }
    if (action.mode === current) {
      const prompt =
        current === "questionnaire"
          ? questionnaireKickoff(action.prompt, action.reason, artifactReason, "continue", current)
          : action.prompt;
      add(CONTINUE_LABELS[current], { kind: "continue", mode: current, ...(prompt ? { prompt } : {}) }, action.reason);
      continue;
    }
    const prompt =
      action.mode === "questionnaire"
        ? questionnaireKickoff(action.prompt, action.reason, artifactReason, "start", current)
        : action.prompt;
    add(
      transitionLabel(current, action.mode),
      { kind: "switch", mode: action.mode, startAgent: true, ...(prompt ? { prompt } : {}) },
      action.reason,
    );
  }
  for (const mode of WORKFLOW_MODES) {
    if (mode === current || agentModes.has(mode)) continue;
    // A pending artifact means an explicit mode switch is an instruction to
    // continue that work, not merely relabel the session and strand the User.
    add(secondaryLabel(current, mode, openWork, artifactReason), { kind: "switch", mode, startAgent: openWork });
  }
  if (!explicit.some((action) => action.mode === "phase-boundary")) {
    add(HANDOFF_OPTION, { kind: "handoff" });
  }
  add(customLabel(), { kind: "custom" });
  return { options, actions };
}

export function modeOptions(
  current: WorkflowMode,
  openWork = true,
  explicit?: NextStepAction[],
  artifactReason?: string,
): string[] {
  return pickerState(current, openWork, explicit, artifactReason).options;
}

function defaultKickoff(
  mode: WorkflowMode,
  intent: KickoffIntent,
  previous?: WorkflowMode,
  nextAction?: string,
): string {
  const source = previous ?? mode;
  const directive = kickoffDirective(source, mode);
  const context = kickoffContext(nextAction);
  if (intent === "start" && previous && previous !== mode) {
    return agentApiTemplate("message.kickoff.transition", {
      source: MODE_LABEL[previous],
      target: MODE_LABEL[mode],
      directive,
      context,
    });
  }
  return agentApiTemplate(intent === "start" ? "message.kickoff.start" : "message.kickoff.continue", {
    target: MODE_LABEL[mode],
    directive,
    context,
  });
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

  const kickoff = defaultKickoff(mode, intent, previous, nextAction);
  if (mode === "questionnaire") return `${kickoff}\n${agentApiText("message.questionnaire.start")}`;
  return kickoff;
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
  const actions =
    nextStep?.actions ??
    defaultActions(current, isLeanContext(ctx.getContextUsage?.()), openWork, planWasJustSaved(branch));
  const state = pickerState(current, openWork, actions, artifactNextAction);
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
    sendContinueKickoff(pi, action.mode, action.prompt, "continue", current, artifactNextAction);
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
  if (action.startAgent) sendContinueKickoff(pi, action.mode, action.prompt, "start", current, artifactNextAction);
}

export function registerModePicker(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "recommend_next",
    label: "Recommend Next Step",
    description: agentApiText("tool.recommend-next.description"),
    parameters: NextStepParams,
    async execute(_toolCallId, params: NextStepInput, _signal, _onUpdate, ctx) {
      const mode = resolveWorkflowMode(ctx.sessionManager.getBranch());
      const actions = params.actions.map(normalizeAction);
      if (actions.some((action) => !action) || new Set(actions.map((action) => action?.mode)).size !== actions.length) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: actions must have distinct valid modes; phase-boundary handoff may not include a custom kickoff.",
            },
          ],
          details: { mode, actions: params.actions },
          isError: true,
        };
      }
      const event: NextStepEvent = { mode, actions: actions as NextStepAction[] };
      pi.appendEntry(NEXT_STEP_EVENT, event);
      return {
        content: [
          {
            type: "text" as const,
            text: `The post-turn picker will offer ${actions.map((action) => action!.mode).join(", ")} as Agent-authored actions.`,
          },
        ],
        details: { mode, actions },
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
    // An unresolved or cancelled Q&A exchange has no route to choose. A completed
    // Ask still opens the picker when its Agent forgot to record recommend_next.
    if (mode === "questionnaire" && !deriveNextStepSignal(branch, mode) && !completedAsk(branch)) return;
    await openModePicker(pi, ctx);
  });
}
