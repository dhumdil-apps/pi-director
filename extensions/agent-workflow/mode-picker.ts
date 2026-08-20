/** User-owned routing. Automatic pickers exist only when the Agent recommends actions. */

import type { ExtensionAPI, ExtensionContext, SessionEntry } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "@sinclair/typebox";
import { agentApiTemplate, agentApiText } from "./agent-api.js";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import {
  MODE_EVENT,
  MODE_LABEL,
  recordWorkflowMode,
  resolveWorkflowMode,
  WORKFLOW_MODES,
  type WorkflowMode,
} from "./mode.js";
import { duringUserWait } from "./user-wait.js";

export const HANDOFF_OPTION = "🤝 Hand off to a fresh session";
export const RETURN_OPTION = "↩ Return to editor";
export const NEXT_STEP_EVENT = "agent-workflow:next-step";
export const ASK_SETTLEMENT_EVENT = "agent-workflow:ask-settlement";

export type NextStepActionMode = WorkflowMode | "handoff";

interface NextStepAction {
  mode: NextStepActionMode;
  reason?: string;
  prompt?: string;
}

interface NextStepEvent {
  mode: WorkflowMode;
  actions: NextStepAction[];
}

const NextStepActionParams = Type.Object({
  mode: Type.Union([Type.Literal("align"), Type.Literal("spec"), Type.Literal("vibe"), Type.Literal("handoff")]),
  reason: Type.Optional(Type.String({ description: agentApiText("tool.next.action.reason") })),
  prompt: Type.Optional(Type.String({ description: agentApiText("tool.next.action.prompt") })),
});

const NextStepParams = Type.Object({
  actions: Type.Array(NextStepActionParams, { description: agentApiText("tool.next.actions") }),
});

type NextStepInput = Static<typeof NextStepParams>;
type KickoffIntent = "continue" | "start";
type PickerContext = Pick<ExtensionContext, "cwd" | "hasUI" | "ui" | "sessionManager">;
type PickerAction =
  | { kind: "continue"; mode: WorkflowMode; prompt?: string }
  | { kind: "handoff" }
  | { kind: "switch"; mode: WorkflowMode; prompt?: string }
  | { kind: "return" };

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

function normalizeReason(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.replace(/\s+/g, " ").trim() || undefined;
}

function normalizeAction(value: unknown): NextStepAction | undefined {
  if (!value || typeof value !== "object") return undefined;
  const { mode, reason, prompt } = value as { mode?: unknown; reason?: unknown; prompt?: unknown };
  const normalizedMode = mode === "questionnaire" ? "align" : mode === "phase-boundary" ? "handoff" : mode;
  if (!(["align", "spec", "vibe", "handoff"] as unknown[]).includes(normalizedMode)) return undefined;
  const normalizedPrompt = typeof prompt === "string" && prompt.trim() ? prompt : undefined;
  return {
    mode: normalizedMode as NextStepActionMode,
    ...(normalizeReason(reason) ? { reason: normalizeReason(reason) } : {}),
    ...(normalizedPrompt ? { prompt: normalizedPrompt } : {}),
  };
}

function deriveNextStepSignal(entries: SessionEntry[], current: WorkflowMode): NextStepAction[] | undefined {
  return currentTurnSignal(entries, NEXT_STEP_EVENT, (entry) => {
    const data = entry.data as Partial<NextStepEvent> | undefined;
    if (data?.mode !== current || !Array.isArray(data.actions)) return undefined;
    const actions = data.actions.map(normalizeAction).filter((action): action is NextStepAction => Boolean(action));
    return actions.length ? actions : undefined;
  });
}

interface AskSettlement {
  outcome: "answered" | "cancelled" | "routed";
  target?: Exclude<WorkflowMode, "align">;
}

function askSettlement(entries: SessionEntry[]): AskSettlement | undefined {
  return currentTurnSignal(entries, ASK_SETTLEMENT_EVENT, (entry) => {
    const data = entry.data as { outcome?: unknown; target?: unknown } | undefined;
    if (data?.outcome === "answered" || data?.outcome === "cancelled") return { outcome: data.outcome };
    if (data?.outcome === "routed" && (data.target === "spec" || data.target === "vibe")) {
      return { outcome: "routed", target: data.target };
    }
    return undefined;
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

function transitionLabel(current: WorkflowMode, next: WorkflowMode): string {
  if (next === "align") return `${MODE_LABEL.align} — Clarify or review decisions`;
  if (current === "align" && next === "spec") return `${MODE_LABEL.spec} — Research and propose`;
  if (current === "align" && next === "vibe") return `${MODE_LABEL.vibe} — Start implementing`;
  if (current === "spec" && next === "vibe") return `${MODE_LABEL.vibe} — Implement the proposal`;
  if (current === "vibe" && next === "spec") return `${MODE_LABEL.spec} — Research and revise`;
  return `${MODE_LABEL[next]} — Continue in ${MODE_LABEL[next]}`;
}

function pickerState(current: WorkflowMode, explicit: NextStepAction[] = []): PickerState {
  const options: string[] = [];
  const actions = new Map<string, PickerAction>();
  const recommended = new Set<NextStepActionMode>();
  const add = (label: string, action: PickerAction, reason?: string) => {
    const rendered = reason ? `${label} — ${reason}` : label;
    options.push(rendered);
    actions.set(rendered, action);
  };

  for (const action of explicit) {
    if (recommended.has(action.mode)) continue;
    recommended.add(action.mode);
    if (action.mode === "handoff") {
      add(HANDOFF_OPTION, { kind: "handoff" }, action.reason);
    } else {
      const label = action.reason ? MODE_LABEL[action.mode] : transitionLabel(current, action.mode);
      const kind = action.mode === current ? "continue" : "switch";
      add(label, { kind, mode: action.mode, prompt: action.prompt }, action.reason);
    }
  }

  for (const mode of WORKFLOW_MODES) {
    if (recommended.has(mode)) continue;
    if (mode === current) add(`${MODE_LABEL[mode]} — Continue current mode`, { kind: "continue", mode });
    else add(`${MODE_LABEL[mode]} — Switch mode`, { kind: "switch", mode });
  }
  if (!recommended.has("handoff")) add(HANDOFF_OPTION, { kind: "handoff" });
  add(RETURN_OPTION, { kind: "return" });
  return { options, actions };
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

export async function openModePicker(pi: ExtensionAPI, ctx: PickerContext, force = false): Promise<void> {
  if (!ctx.hasUI) return;
  const branch = ctx.sessionManager.getBranch();
  const current = resolveWorkflowMode(branch);
  const explicit = deriveNextStepSignal(branch, current);
  if (!force && !explicit) return;

  const state = pickerState(current, explicit);
  const checkpoint = openCheckpoint(pi, "mode");
  let choice: string | undefined;
  try {
    choice = await duringUserWait(pi, "mode", () => ctx.ui.select("What next?", state.options));
  } catch (error) {
    resolveCheckpoint(pi, checkpoint.id, "failure");
    throw error;
  }
  if (choice === undefined) {
    resolveCheckpoint(pi, checkpoint.id, "dismissed");
    return;
  }
  const action = state.actions.get(choice);
  if (!action || action.kind === "return") {
    resolveCheckpoint(pi, checkpoint.id, action?.kind === "return" ? "return" : "dismissed");
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
    if (action.prompt) sendContinueKickoff(pi, action.mode, action.prompt, "continue", current);
    return;
  }
  resolveCheckpoint(pi, checkpoint.id, action.mode);
  await applyMode(pi, ctx, action.mode, current);
  if (action.prompt) sendContinueKickoff(pi, action.mode, action.prompt, "start", current);
}

export function registerModePicker(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "next",
    label: "Next",
    description: agentApiText("tool.next.description"),
    parameters: NextStepParams,
    async execute(_toolCallId, params: NextStepInput, _signal, _onUpdate, ctx) {
      const mode = resolveWorkflowMode(ctx.sessionManager.getBranch());
      if (params.actions.length === 0) {
        pi.appendEntry(NEXT_STEP_EVENT, { mode, actions: [] } satisfies NextStepEvent);
        return {
          content: [{ type: "text" as const, text: "No next actions were supplied; no picker will open." }],
          details: { mode, actions: [] },
        };
      }
      const actions = params.actions.map(normalizeAction);
      if (actions.some((action) => !action)) {
        return {
          content: [{ type: "text" as const, text: "Error: every action needs a valid target." }],
          details: { mode, actions: params.actions },
          isError: true,
        };
      }
      const invalidPrompt = (actions as NextStepAction[]).some((action) =>
        action.mode === "handoff" ? Boolean(action.prompt) : !action.prompt,
      );
      if (invalidPrompt) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: every Align, Spec, or Vibe action needs a contextual prompt; handoff must omit it.",
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
            text: `The post-turn picker will rank ${event.actions.map((action) => action.mode).join(", ")}.`,
          },
        ],
        details: event,
      };
    },
  });

  pi.on("agent_settled", async (_event, ctx) => {
    const branch = ctx.sessionManager.getBranch();
    const mode = resolveWorkflowMode(branch);
    const settlement = askSettlement(branch);
    if (settlement?.outcome === "routed" && settlement.target) {
      await applyMode(pi, ctx, settlement.target, mode);
      startModeContinuation(pi, settlement.target, mode);
      return;
    }
    if (settlement?.outcome === "cancelled") return;
    if (deriveNextStepSignal(branch, mode)) await openModePicker(pi, ctx);
  });
}
