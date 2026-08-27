/** User-owned routing. Automatic pickers exist only when the Agent recommends actions. */

import type { ExtensionAPI, ExtensionContext, SessionEntry } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "@sinclair/typebox";
import { readFile } from "node:fs/promises";
import { agentApiTemplate, agentApiText } from "./agent-api.js";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import { MODE_LABEL, recordWorkflowMode, resolveWorkflowMode, WORKFLOW_MODES, type WorkflowMode } from "./mode.js";
import { readPlanDigest } from "./plan-digest.js";
import {
  inspectNextActions,
  normalizeAction,
  type AlignLanding,
  type NextStepAction,
  type NextStepActionMode,
} from "./next-actions.js";
import {
  metaPickerLabels,
  RETURN_ALIGN_OPTION,
  RETURN_OPTION,
  SHOW_PLAN_DISMISS,
  SHOW_PLAN_OPTION,
  withoutRedundantAlignEstablish,
} from "./picker-meta.js";
import { duringUserWait } from "./user-wait.js";
import { missingSessionPlan, planPath } from "./task.js";
import {
  ASK_SETTLEMENT_EVENT,
  currentTurnSignal,
  dispatchSettlement,
  formatGateText,
  formatRoutedAnswersPrompt,
  NEXT_STEP_EVENT,
  planMissingMessage,
  receive,
  snapshot,
} from "./workflow-machine.js";

export const HANDOFF_OPTION = "🤝 Hand off to a fresh session";
export { RETURN_ALIGN_OPTION, RETURN_OPTION, SHOW_PLAN_DISMISS, SHOW_PLAN_OPTION };
export { ASK_SETTLEMENT_EVENT, NEXT_STEP_EVENT };
export type { AlignLanding, NextStepAction, NextStepActionMode };

interface NextStepEvent {
  mode: WorkflowMode;
  actions: NextStepAction[];
  /** When true, agent_settled opens the next-driven picker even if actions were filtered empty. */
  queued?: boolean;
}

const NextStepActionParams = Type.Object({
  mode: Type.Union([Type.Literal("align"), Type.Literal("spec"), Type.Literal("vibe"), Type.Literal("handoff")]),
  reason: Type.String({ description: agentApiText("tool.next.action.reason") }),
  prompt: Type.Optional(Type.String({ description: agentApiText("tool.next.action.prompt") })),
  landing: Type.Optional(
    Type.Union([Type.Literal("establish"), Type.Literal("evaluate")], {
      description: agentApiText("tool.next.action.landing"),
    }),
  ),
});

const NextStepParams = Type.Object({
  actions: Type.Array(NextStepActionParams, { description: agentApiText("tool.next.actions") }),
});

type NextStepInput = Static<typeof NextStepParams>;
type KickoffIntent = "continue" | "start";
type PickerContext = Pick<ExtensionContext, "cwd" | "hasUI" | "ui" | "sessionManager">;
type PickerAction =
  | { kind: "continue"; mode: WorkflowMode; prompt?: string; autostart?: boolean }
  | { kind: "handoff" }
  | { kind: "switch"; mode: WorkflowMode; prompt?: string; autostart?: boolean }
  | { kind: "return" }
  | { kind: "show-plan" };

interface PickerState {
  options: string[];
  actions: Map<string, PickerAction>;
}

/** Align evaluate/review auto-starts; Align establish/idle never auto-starts. Spec/Vibe auto-start when prompt present. */
function actionAutostart(action: NextStepAction): boolean {
  if (action.mode === "handoff") return false;
  if (action.mode === "align") return action.landing === "evaluate" && Boolean(action.prompt);
  return Boolean(action.prompt);
}

function actionDedupeKey(action: NextStepAction): string {
  if (action.mode === "align") return `align:${action.landing ?? "establish"}`;
  return action.mode;
}

/**
 * Stable order for recommended rows: ordinary modes first, handoff next,
 * Align review (RETURN_ALIGN / landing evaluate) last — PWB-style separation.
 */
function sortRecommendedActions(actions: NextStepAction[]): NextStepAction[] {
  const rank = (action: NextStepAction): number => {
    if (action.mode === "align" && (action.landing ?? "establish") === "evaluate") return 2;
    if (action.mode === "handoff") return 1;
    return 0;
  };
  return actions
    .map((action, index) => ({ action, index }))
    .sort((left, right) => rank(left.action) - rank(right.action) || left.index - right.index)
    .map(({ action }) => action);
}

/** Drop same-mode recommendations; handoff always kept. */
function crossModeActions(current: WorkflowMode, actions: NextStepAction[]): NextStepAction[] {
  return actions.filter((action) => action.mode === "handoff" || action.mode !== current);
}

function deriveNextStepSignal(entries: SessionEntry[], current: WorkflowMode): NextStepAction[] | undefined {
  return currentTurnSignal(entries, NEXT_STEP_EVENT, (entry) => {
    const data = entry.data as Partial<NextStepEvent> | undefined;
    if (data?.mode !== current || !Array.isArray(data.actions)) return undefined;
    const actions = crossModeActions(
      current,
      data.actions.map(normalizeAction).filter((action): action is NextStepAction => Boolean(action)),
    );
    // queued:true (non-empty next call) may yield [] after same-mode filter — still open picker fill-ins.
    if (data.queued === true) return actions;
    return actions.length ? actions : undefined;
  });
}

function defaultKickoff(mode: WorkflowMode, previous?: WorkflowMode): string {
  const source = previous ?? mode;
  if (source === mode) {
    return agentApiTemplate("message.kickoff.continue", { target: MODE_LABEL[mode] });
  }
  return agentApiTemplate("message.kickoff.switch", {
    source: MODE_LABEL[source],
    target: MODE_LABEL[mode],
  });
}

export function continueKickoff(
  mode: WorkflowMode,
  prompt?: string,
  intent: KickoffIntent = "continue",
  previous?: WorkflowMode,
): string {
  const kickoff = defaultKickoff(mode, previous);
  const instruction = typeof prompt === "string" && prompt.trim() ? prompt : undefined;
  return instruction ? `${kickoff}\n${instruction}` : kickoff;
}

function sendContinueKickoff(
  pi: ExtensionAPI,
  mode: WorkflowMode,
  prompt?: string,
  intent: KickoffIntent = "continue",
  previous?: WorkflowMode,
): void {
  pi.sendUserMessage(continueKickoff(mode, prompt, intent, previous), { deliverAs: "followUp" });
}

export function startModeContinuation(
  pi: ExtensionAPI,
  mode: WorkflowMode,
  previous?: WorkflowMode,
  prompt?: string,
): void {
  sendContinueKickoff(pi, mode, prompt, "start", previous);
}

function transitionLabel(current: WorkflowMode, next: WorkflowMode, landing?: AlignLanding): string {
  if (next === "align") {
    return landing === "evaluate"
      ? `${MODE_LABEL.align} — Review decisions (ask)`
      : `${MODE_LABEL.align} — Editor (establish)`;
  }
  if (current === "align" && next === "spec") return `${MODE_LABEL.spec} — Research and propose`;
  if (current === "align" && next === "vibe") return `${MODE_LABEL.vibe} — Start implementing`;
  if (current === "spec" && next === "vibe") return `${MODE_LABEL.vibe} — Implement the proposal`;
  if (current === "vibe" && next === "spec") return `${MODE_LABEL.spec} — Research and revise`;
  return `${MODE_LABEL[next]} — Continue in ${MODE_LABEL[next]}`;
}

export function pickerState(
  current: WorkflowMode,
  explicit: NextStepAction[] = [],
  options?: { includeCurrentMode?: boolean },
): PickerState {
  const includeCurrentMode = options?.includeCurrentMode ?? true;
  const labels: string[] = [];
  const actions = new Map<string, PickerAction>();
  const recommended = new Set<string>();
  const add = (label: string, action: PickerAction, reason?: string) => {
    const rendered = reason ? `${label} — ${reason}` : label;
    labels.push(rendered);
    actions.set(rendered, action);
  };

  const scoped = includeCurrentMode ? explicit : crossModeActions(current, explicit);
  // Static Return→ALIGN covers establish/idle; keep evaluate/D-review rows only.
  const explicitActions = sortRecommendedActions(withoutRedundantAlignEstablish(scoped));
  for (const action of explicitActions) {
    const key = actionDedupeKey(action);
    if (recommended.has(key)) continue;
    recommended.add(key);
    if (action.mode === "handoff") {
      add(HANDOFF_OPTION, { kind: "handoff" }, action.reason);
    } else {
      const landing = action.mode === "align" ? (action.landing ?? "establish") : undefined;
      const label = action.reason ? MODE_LABEL[action.mode] : transitionLabel(current, action.mode, landing);
      const kind = action.mode === current ? "continue" : "switch";
      add(
        label,
        {
          kind,
          mode: action.mode,
          prompt: action.prompt,
          autostart: actionAutostart(action),
        },
        action.reason,
      );
    }
  }

  for (const mode of WORKFLOW_MODES) {
    // Cross-mode Align idle is trailing RETURN_ALIGN_OPTION only (no agent establish row).
    if (mode === "align") {
      if (mode === current && includeCurrentMode) {
        add(`${MODE_LABEL[mode]} — Continue current mode`, { kind: "continue", mode });
      }
      continue;
    }
    if (recommended.has(mode)) continue;
    if (mode === current) {
      if (includeCurrentMode) add(`${MODE_LABEL[mode]} — Continue current mode`, { kind: "continue", mode });
      continue;
    }
    add(`${MODE_LABEL[mode]} — Switch mode`, { kind: "switch", mode });
  }
  if (!recommended.has("handoff")) add(HANDOFF_OPTION, { kind: "handoff" });
  // Trailing meta: Return (ESC); Return→ALIGN when not already in Align; Show plan last.
  for (const label of metaPickerLabels(current)) {
    if (label === RETURN_OPTION) add(RETURN_OPTION, { kind: "return" });
    else if (label === RETURN_ALIGN_OPTION)
      add(RETURN_ALIGN_OPTION, { kind: "switch", mode: "align", autostart: false });
    else add(SHOW_PLAN_OPTION, { kind: "show-plan" });
  }
  return { options: labels, actions };
}

async function presentPlanDigest(pi: ExtensionAPI, ctx: PickerContext): Promise<void> {
  if (!ctx.hasUI) return;
  const name = pi.getSessionName();
  const missing = missingSessionPlan(ctx.cwd, name);
  if (missing) {
    ctx.ui.notify(missing, "warning");
    return;
  }
  const contents = await readFile(planPath(ctx.cwd, name!), "utf8").catch(() => "");
  const digest = readPlanDigest(contents);
  if (!digest) {
    ctx.ui.notify("No Digest in the plan yet.", "info");
    return;
  }
  await ctx.ui.select(digest, [SHOW_PLAN_DISMISS]);
}

export async function applyMode(
  pi: ExtensionAPI,
  ctx: Pick<PickerContext, "hasUI" | "ui">,
  mode: WorkflowMode,
  _previous?: WorkflowMode,
): Promise<void> {
  recordWorkflowMode(pi, mode);
  if (ctx.hasUI) ctx.ui.notify(`${MODE_LABEL[mode]} mode selected for this session.`, "info");
}

export async function openModePicker(
  pi: ExtensionAPI,
  ctx: PickerContext,
  force = false,
  allowEmpty = false,
): Promise<void> {
  if (!ctx.hasUI) return;
  const branch = ctx.sessionManager.getBranch();
  const current = resolveWorkflowMode(branch);
  const explicit = deriveNextStepSignal(branch, current);
  // next-driven: explicit is [] | non-empty array; /mode force: explicit may be undefined.
  // allowEmpty: Align silent-idle fallback opens fill-ins with no NEXT_STEP_EVENT.
  if (!force && explicit === undefined && !allowEmpty) return;

  // next-driven pickers omit current mode; /mode force keeps full escape-hatch list (D4).
  const state = pickerState(current, explicit ?? [], { includeCurrentMode: force });
  const checkpoint = openCheckpoint(pi, "mode");
  try {
    while (true) {
      const choice = await duringUserWait(pi, "mode", () => ctx.ui.select("What next?", state.options));
      if (choice === undefined) {
        resolveCheckpoint(pi, checkpoint.id, "dismissed");
        return;
      }
      const action = state.actions.get(choice);
      if (!action) {
        resolveCheckpoint(pi, checkpoint.id, "dismissed");
        return;
      }
      if (action.kind === "show-plan") {
        await duringUserWait(pi, "mode", () => presentPlanDigest(pi, ctx));
        continue;
      }
      if (action.kind === "return") {
        resolveCheckpoint(pi, checkpoint.id, "return");
        return;
      }
      if (action.kind === "handoff") {
        resolveCheckpoint(pi, checkpoint.id, "handoff");
        const command = `/handoff ${pi.getSessionName() ?? ""}`.trim();
        if (!ctx.ui.getEditorText().trim()) ctx.ui.setEditorText(command);
        ctx.ui.notify(`Press Enter to run ${command} in a new session.`, "info");
        return;
      }

      if (action.kind === "continue") {
        resolveCheckpoint(pi, checkpoint.id, "continue");
        if (action.autostart && action.prompt) {
          sendContinueKickoff(pi, action.mode, action.prompt, "continue", current);
        }
        return;
      }
      resolveCheckpoint(pi, checkpoint.id, action.mode);
      await applyMode(pi, ctx, action.mode, current);
      // Align establish/idle never kickoff; Align evaluate/review and Spec/Vibe kickoff when autostart.
      if (action.autostart && action.prompt) {
        sendContinueKickoff(pi, action.mode, action.prompt, "start", current);
      } else if (action.mode === "align" && ctx.hasUI) {
        ctx.ui.notify(`${MODE_LABEL.align} ready in editor (establish). No agent start.`, "info");
      }
      return;
    }
  } catch (error) {
    resolveCheckpoint(pi, checkpoint.id, "failure");
    throw error;
  }
}

export function registerModePicker(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "next",
    label: "Next",
    description: agentApiText("tool.next.description"),
    parameters: NextStepParams,
    async execute(_toolCallId, params: NextStepInput, _signal, _onUpdate, ctx) {
      const branch = ctx.sessionManager.getBranch();
      const mode = resolveWorkflowMode(branch);
      const inspected = inspectNextActions(params.actions);
      const snap = snapshot(branch, ctx.cwd, pi.getSessionName());
      const gate = receive(
        snap,
        {
          type: "TOOL_NEXT",
          hasActions: params.actions.length > 0,
          allTargetsValid: inspected.allTargetsValid,
          reasonsValid: inspected.reasonsValid,
          promptsValid: inspected.promptsValid,
          reviewPromptsValid: inspected.reviewPromptsValid,
        },
        planMissingMessage(ctx.cwd, pi.getSessionName()),
      );
      if (!gate.ok) {
        return {
          content: [{ type: "text" as const, text: formatGateText(gate) }],
          details: { mode, actions: params.actions },
          ...(gate.kind === "error" ? { isError: true as const } : {}),
        };
      }
      if (params.actions.length === 0) {
        pi.appendEntry(NEXT_STEP_EVENT, { mode, actions: [], queued: false } satisfies NextStepEvent);
        return {
          content: [{ type: "text" as const, text: "No next actions were supplied; no picker will open." }],
          details: { mode, actions: [], queued: false },
        };
      }
      const filtered = sortRecommendedActions(
        withoutRedundantAlignEstablish(crossModeActions(mode, inspected.normalized)),
      );
      const dropped = inspected.normalized.length - filtered.length;
      const event: NextStepEvent = { mode, actions: filtered, queued: true };
      pi.appendEntry(NEXT_STEP_EVENT, event);
      const ranked =
        event.actions.length > 0
          ? event.actions.map((action) => action.mode).join(", ")
          : "other modes (same-mode recommendations were omitted)";
      const note = dropped > 0 ? ` Omitted ${dropped} same-mode action(s).` : "";
      return {
        content: [
          {
            type: "text" as const,
            text: `The post-turn picker will rank ${ranked}.${note}`,
          },
        ],
        details: event,
      };
    },
  });

  pi.on("agent_settled", async (_event, ctx) => {
    const branch = ctx.sessionManager.getBranch();
    const mode = resolveWorkflowMode(branch);
    const snap = snapshot(branch, ctx.cwd, pi.getSessionName());
    const dispatch = dispatchSettlement(snap);
    if (dispatch.action === "route") {
      await applyMode(pi, ctx, dispatch.target, mode);
      startModeContinuation(pi, dispatch.target, mode, formatRoutedAnswersPrompt(dispatch.answers));
      return;
    }
    if (dispatch.action === "skip_picker") return;
    if (dispatch.action === "open_picker") await openModePicker(pi, ctx, false, true);
  });
}
