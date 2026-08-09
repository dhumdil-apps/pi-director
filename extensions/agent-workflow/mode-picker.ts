/**
 * The mode picker — the single decision surface in the workflow.
 *
 * Runtime-owned rather than a tool: the Agent must not be able to skip the
 * User's choice by forgetting a call, and picking is faster than typing. It
 * opens on every settled turn with state-aware options, which is why a blocker
 * in Spec or Vibe can stop instead of interrogating the User mid-turn.
 *
 * Every mode selection starts the selected block immediately, so the picker is
 * the only transition action the User needs to take.
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
import { currentPlanHasOpenWork, PLAN_SAVED_EVENT, recordModeTransition } from "./task.js";
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
}

const NextStepParams = Type.Object({
  recommendation: Type.Union([
    Type.Literal("continue"),
    Type.Literal("ask"),
    Type.Literal("spec"),
    Type.Literal("vibe"),
    Type.Literal("phase-boundary"),
  ]),
});

type NextStepInput = Static<typeof NextStepParams>;

const ALLOWED_RECOMMENDATIONS: Record<WorkflowMode, readonly NextStepRecommendation[]> = {
  ask: ["continue", "spec", "vibe"],
  spec: ["continue", "ask", "vibe"],
  vibe: ["continue", "ask", "spec", "phase-boundary"],
};

const CONTINUE_LABELS: Record<WorkflowMode, string> = {
  ask: "Continue alignment",
  spec: "Continue research and planning",
  vibe: "Continue implementation",
};

const CONTINUE_KICKOFFS: Record<WorkflowMode, string> = {
  ask: "Continue aligning the goal, constraints, and definition of done. Use questionnaire at least once for every new task. When alignment is complete, update the artifact and call recommend_next with Spec or Vibe.",
  spec: "Continue exploring the owning implementation and directly relevant evidence. Present an actionable proposal with save_plan when ready, or record a blocker and call recommend_next with Ask when a User decision is required.",
  vibe: "Continue implementing the current plan, reconcile every open checklist item, and close out with verification.",
};

/** Everything the picker needs, so a command context can open it too. */
type PickerContext = Pick<ExtensionContext, "cwd" | "hasUI" | "ui" | "sessionManager"> & {
  getContextUsage?: ExtensionContext["getContextUsage"];
};

function startLabel(mode: WorkflowMode): string {
  return `Start ${MODE_LABEL[mode]}`;
}

type Recommendation = "continue" | "handoff" | WorkflowMode;
type PickerAction =
  | { kind: "continue"; mode: WorkflowMode }
  | { kind: "handoff" }
  | { kind: "switch"; mode: WorkflowMode }
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
    if (entry?.type === "message") return undefined;
    if (entry?.type !== "custom") continue;
    if (entry.customType === customType) return read(entry);
    if (entry.customType === MODE_EVENT) return undefined;
  }
  return undefined;
}

export function deriveNextStep(entries: SessionEntry[], current: WorkflowMode): NextStepRecommendation | undefined {
  return currentTurnSignal(entries, NEXT_STEP_EVENT, (entry) => {
    const data = entry.data as Partial<NextStepEvent> | undefined;
    return data?.mode === current &&
      ALLOWED_RECOMMENDATIONS[current].includes(data.recommendation as NextStepRecommendation)
      ? data.recommendation
      : undefined;
  });
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
): Recommendation {
  if (!openWork) return current === "ask" ? "spec" : "ask";
  if (explicit === "phase-boundary") {
    return current === "vibe" && !lean ? "handoff" : "continue";
  }
  if (explicit) return explicit === current ? "continue" : explicit;
  if (current === "spec" && planSaved) return "vibe";
  return "continue";
}

function transitionLabel(current: WorkflowMode, next: WorkflowMode, openWork: boolean): string {
  if (!openWork) return `Start a new direction in ${MODE_LABEL[next]}`;
  if (next === "ask") return "Return to Ask";
  if (current === "ask" && next === "spec") return "Proceed to Spec";
  if (current === "ask" && next === "vibe") return "Start Vibe";
  if (current === "spec" && next === "vibe") return "Approve plan and start Vibe";
  return `Proceed to ${MODE_LABEL[next]}`;
}

function pickerState(
  current: WorkflowMode,
  lean: boolean,
  openWork: boolean,
  planSaved: boolean,
  explicit?: NextStepRecommendation,
): PickerState {
  const recommendation = defaultRecommendation(current, lean, openWork, planSaved, explicit);
  const actions = new Map<string, PickerAction>();
  const options: string[] = [];
  const add = (label: string, action: PickerAction, recommended = false) => {
    const rendered = recommended ? `${label}${RECOMMENDED}` : label;
    options.push(rendered);
    actions.set(rendered, action);
  };

  if (recommendation === "continue") {
    add(CONTINUE_LABELS[current], { kind: "continue", mode: current }, true);
  } else if (recommendation === "handoff") {
    add(PHASE_HANDOFF_OPTION, { kind: "handoff" }, true);
  } else {
    add(transitionLabel(current, recommendation, openWork), { kind: "switch", mode: recommendation }, true);
  }

  if (openWork && recommendation !== "continue") {
    add(CONTINUE_LABELS[current], { kind: "continue", mode: current });
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
): string[] {
  return pickerState(current, lean, openWork, planSaved, explicit).options;
}

export function continueKickoff(mode: WorkflowMode): string {
  return CONTINUE_KICKOFFS[mode];
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
  const openWork = await currentPlanHasOpenWork(ctx.cwd, pi.getSessionName() ?? ctx.sessionManager.getSessionName?.());
  const state = pickerState(
    current,
    isLeanContext(ctx.getContextUsage?.()),
    openWork,
    planWasJustSaved(branch),
    deriveNextStep(branch, current),
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
    pi.sendUserMessage(continueKickoff(action.mode));
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
  pi.sendUserMessage(continueKickoff(action.mode));
}

export function registerModePicker(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "recommend_next",
    label: "Recommend Next Step",
    description:
      "Record the outcome that the post-turn picker should recommend. Call before settling when Ask should continue or proceed to Spec/Vibe, when Spec needs Ask or more research, or when Vibe should continue, return to Ask/Spec, or mark a coherent phase boundary. This records intent only; the User still selects the action.",
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
      pi.appendEntry(NEXT_STEP_EVENT, {
        mode,
        recommendation: params.recommendation,
      } satisfies NextStepEvent);
      return {
        content: [
          {
            type: "text" as const,
            text: `The post-turn picker will recommend ${params.recommendation}.`,
          },
        ],
        details: { mode, recommendation: params.recommendation },
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
