/**
 * The mode picker — the single decision surface in the workflow.
 *
 * Runtime-owned rather than a tool: the Agent must not be able to skip the
 * User's choice by forgetting a call, and picking is faster than typing. It
 * opens on every settled turn with state-aware options, which is why a blocker
 * in Spec or Vibe can stop instead of interrogating the User mid-turn.
 *
 * Cross-mode Spec and Vibe selections start the selected block immediately.
 * Cross-mode Ask selections only switch mode and wait for the User's next input.
 */

import { type Static, Type } from "@sinclair/typebox";
import type { ExtensionAPI, ExtensionContext, SessionEntry } from "@earendil-works/pi-coding-agent";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import { isLeanContext } from "./context-usage.js";
import {
  deriveWorkflowMode,
  MODE_EVENT,
  MODE_LABEL,
  recordWorkflowMode,
  WORKFLOW_MODES,
  type WorkflowMode,
} from "./mode.js";
import { currentPlanHasOpenWork, currentPlanNextAction, PLAN_SAVED_EVENT, recordModeTransition } from "./task.js";
import { duringUserWait } from "./user-wait.js";

export const HANDOFF_OPTION = "Hand off to a fresh session";
export const PHASE_HANDOFF_OPTION = "Hand off next phase";
export const WRITE_CUSTOM_OPTION = "Write custom answer...";
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
    Type.Literal("ask"),
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
        "Optional custom kickoff for continue or Spec/Vibe transitions; Ask may use it for targeted Q&A, but omit it for Ask transitions and phase-boundary handoff.",
    }),
  ),
});

type NextStepInput = Static<typeof NextStepParams>;

const ALLOWED_RECOMMENDATIONS: Record<WorkflowMode, readonly NextStepRecommendation[]> = {
  ask: ["continue", "spec", "vibe"],
  spec: ["continue", "ask", "vibe"],
  vibe: ["continue", "ask", "spec", "phase-boundary"],
};

const START_LABELS: Record<WorkflowMode, string> = {
  ask: "Ask — Start a new direction",
  spec: "Spec — Research a new direction",
  vibe: "Vibe — Start implementing a new direction",
};

const CONTINUE_LABELS: Record<WorkflowMode, string> = {
  ask: "Ask — Keep clarifying the direction",
  spec: "Spec — Keep researching the plan",
  vibe: "Vibe — Keep implementing",
};

const CONTINUE_KICKOFFS: Record<WorkflowMode, string> = {
  ask: "Align the task, update the artifact, then recommend Spec or Vibe.",
  spec: "Research the task, update the artifact, then save the actionable plan.",
  vibe: "Execute the current work, update the artifact, and close out with verification.",
};

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
    return current === "vibe" && !lean ? "handoff" : "continue";
  }
  if (current === "vibe" && !lean) return "handoff";
  if (current === "spec" && planSaved) return "vibe";
  return "continue";
}

function transitionLabel(current: WorkflowMode, next: WorkflowMode): string {
  if (next === "ask") return "Ask — Clarify the next decision";
  if (current === "ask" && next === "spec") return "Spec — Research the open questions";
  if (current === "ask" && next === "vibe") return "Vibe — Start implementing the request";
  if (current === "spec" && next === "vibe") return "Vibe — Start implementing the plan";
  if (current === "vibe" && next === "spec") return "Spec — Research the remaining questions";
  return `${MODE_LABEL[next]} — Continue in ${MODE_LABEL[next]}`;
}

function pickerState(
  current: WorkflowMode,
  lean: boolean,
  openWork: boolean,
  planSaved: boolean,
  explicit?: NextStepRecommendation,
  askPrompt?: string,
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
    ...(askPrompt ? { prompt: askPrompt } : {}),
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
      { kind: "switch", mode: recommendation, ...(askPrompt ? { prompt: askPrompt } : {}) },
      true,
    );
  } else {
    add(START_LABELS[current], { kind: "switch", mode: current });
  }

  if (openWork && recommendation !== "continue") {
    add(CONTINUE_LABELS[current], continueAction);
  }
  for (const mode of WORKFLOW_MODES) {
    if (mode === current || mode === recommendation) continue;
    add(startLabel(mode), { kind: "switch", mode });
  }
  if (openWork && recommendation !== "handoff") {
    add(HANDOFF_OPTION, { kind: "handoff" });
  }
  add(WRITE_CUSTOM_OPTION, { kind: "custom" });
  return { options, actions };
}

export function modeOptions(
  current: WorkflowMode,
  lean: boolean,
  openWork = true,
  planSaved = false,
  explicit?: NextStepRecommendation,
  askPrompt?: string,
  explicitReason?: string,
  artifactReason?: string,
): string[] {
  return pickerState(current, lean, openWork, planSaved, explicit, askPrompt, explicitReason, artifactReason).options;
}

export function continueKickoff(mode: WorkflowMode, prompt?: string): string | undefined {
  if (prompt?.trim()) return prompt.trim();
  return CONTINUE_KICKOFFS[mode];
}

function sendContinueKickoff(pi: ExtensionAPI, mode: WorkflowMode, prompt?: string): void {
  const kickoff = continueKickoff(mode, prompt);
  if (kickoff) pi.sendUserMessage(kickoff);
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
  const current = deriveWorkflowMode(branch) ?? "ask";
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
    sendContinueKickoff(pi, action.mode, action.prompt);
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
  if (action.mode !== "ask") sendContinueKickoff(pi, action.mode, action.prompt);
}

export function registerModePicker(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "recommend_next",
    label: "Recommend Next Step",
    description:
      "Record the outcome that the post-turn picker should recommend. Call before settling when Ask should continue or proceed to Spec/Vibe, when Spec needs Ask or more research, or when Vibe should continue, return to Ask/Spec, or mark a coherent phase boundary. Include a concise reason for the recommended picker label when useful. Ask may include a targeted Q&A prompt for its continue recommendation. This records intent only; the User still selects the action.",
    parameters: NextStepParams,
    async execute(_toolCallId, params: NextStepInput, _signal, _onUpdate, ctx) {
      const mode = deriveWorkflowMode(ctx.sessionManager.getBranch()) ?? "ask";
      if (!ALLOWED_RECOMMENDATIONS[mode].includes(params.recommendation)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${params.recommendation} is not a valid ${MODE_LABEL[mode]} recommendation.`,
            },
          ],
          details: { mode, recommendation: params.recommendation },
          isError: true,
        };
      }
      const reason = normalizeReason(params.reason);
      const prompt = params.prompt?.trim();
      const promptAllowed =
        params.recommendation === "continue" || params.recommendation === "spec" || params.recommendation === "vibe";
      if (prompt && !promptAllowed) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: a custom kickoff is only valid for continue or Spec/Vibe transitions.",
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
    await openModePicker(pi, ctx);
  });
}
