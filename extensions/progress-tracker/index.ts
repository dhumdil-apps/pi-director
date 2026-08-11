/**
 * Progress Tracker — an always-visible activity indicator above the editor,
 * a configurable Status Bar context segment, and the agent-status event other
 * tools observe.
 *
 * It deliberately ships no todo tool: pi has none on purpose ("they confuse
 * models"), and a structured list the agent must keep in sync is ceremony, not
 * progress. What the agent is doing shows in the transcript; what this adds is
 * the one thing the transcript cannot show — whether a run is in flight and how
 * much context is left.
 */

import type {
  ExtensionAPI,
  ExtensionContext,
  MessageEndEvent,
  SessionEntry,
  Theme,
  TurnEndEvent,
} from "@earendil-works/pi-coding-agent";
import { getLastAssistantUsage } from "@earendil-works/pi-coding-agent";
import {
  MODE_EVENT,
  resolveWorkflowMode,
  normalizeWorkflowMode,
  type ModeEvent,
  type WorkflowMode,
} from "../agent-workflow/mode.js";
import {
  addModeTime,
  EMPTY_PLAN_TIME,
  readPlanTime,
  updatePlanTime,
  type PlanTime,
} from "../agent-workflow/plan-time.js";
import { planPath } from "../agent-workflow/task.js";
import { contextIndicatorText } from "../agent-workflow/context-usage.js";
import { USER_WAIT_EVENT, type UserWaitEvent } from "../agent-workflow/user-wait.js";
import { clearPhaseIndicator, updatePhaseIndicator } from "./ui/activity-indicator.js";

/** Latest provider response on the active branch, used after reloads and handoffs. */
function latestAssistantTimestamp(entries: SessionEntry[]): number | undefined {
  for (let index = entries.length - 1; index >= 0; index--) {
    const entry = entries[index];
    if (entry?.type !== "message") continue;
    const message = entry.message as { role?: string; timestamp?: unknown };
    if (message.role === "assistant" && typeof message.timestamp === "number" && Number.isFinite(message.timestamp)) {
      return message.timestamp;
    }
  }
  return undefined;
}

export default function (pi: ExtensionAPI) {
  pi.events.emit?.("powerbar:register-segment", {
    id: "attention-span",
    label: "LLM Attention Span",
    row: 4,
  });

  let currentCtx: ExtensionContext | undefined;
  // Async lifecycle handlers can finish after session replacement invalidates
  // their context. Increment this before shutdown so their continuations stay
  // data-only and never refresh through the old context.
  let lifecycleGeneration = 0;
  let working = false;
  // The first provider response's reported aggregate usage. Read it from the
  // response itself: live context can already include tool results for the next request.
  let firstTurnTokens: number | undefined;
  // Display only. Live transitions update immediately; persisted custom entries
  // reconstruct the current mode across handoffs and reloads.
  let mode: WorkflowMode | undefined;
  // Run timing. The widget re-creates its factory every refresh, so the start
  // stamp has to live here or the counter would restart at each turn boundary.
  let runStartedAt: number | undefined;
  let planTime: PlanTime | undefined;
  let cacheStartedAt: number | undefined;
  let waitingForUser = false;

  // Close the current interval before changing mode. Undefined is the initial
  // Q&A state: the display can still ask for a goal while timing is precise.
  const accrueUntil = (now: number) => {
    if (runStartedAt == null) return;
    planTime = addModeTime(planTime ?? EMPTY_PLAN_TIME, mode ?? "questionnaire", Math.max(0, now - runStartedAt));
    runStartedAt = now;
  };

  const syncModeFromBranch = (ctx: ExtensionContext): void => {
    const next = resolveWorkflowMode(ctx.sessionManager.getBranch());
    if (next === mode) return;
    accrueUntil(Date.now());
    mode = next;
  };

  pi.events.on?.(MODE_EVENT, (payload: unknown) => {
    const next = normalizeWorkflowMode((payload as ModeEvent | undefined)?.mode);
    if (!next) return;
    accrueUntil(Date.now());
    mode = next;
    refreshStatus();
  });

  const refreshStatus = () => {
    if (!currentCtx) return;
    // Context usage only moves at turn boundaries, which is exactly when
    // refreshStatus runs, so reading it here keeps the render pure.
    const usage = currentCtx.getContextUsage();
    // Provider-reported cache figures for the last completed request. Reading
    // the branch is cheap and this runs at turn boundaries only.
    let lastUsage: ReturnType<typeof getLastAssistantUsage>;
    try {
      lastUsage = getLastAssistantUsage(currentCtx.sessionManager.getBranch());
    } catch {
      lastUsage = undefined;
    }
    const indicatorWorking = working && !waitingForUser;
    updatePhaseIndicator(currentCtx, indicatorWorking, {
      mode,
      runStartedAt,
      planTime,
      cacheStartedAt,
    });
    if (usage && usage.tokens != null && usage.contextWindow > 0) {
      const capturedUsage = usage;
      const capturedExtras = { lastUsage, firstTurnTokens };
      pi.events.emit?.("powerbar:update", {
        id: "attention-span",
        row: 4,
        render: (theme: Theme) => contextIndicatorText(capturedUsage, theme, capturedExtras),
      });
    } else {
      pi.events.emit?.("powerbar:update", {
        id: "attention-span",
        text: undefined,
      });
    }
    const prompt = lastUsage ? lastUsage.input + lastUsage.cacheRead + lastUsage.cacheWrite : 0;
    pi.events.emit?.("agent-status:update", {
      working,
      mode,
      sessionName: pi.getSessionName?.(),
      contextUsed: usage?.tokens ?? undefined,
      contextMax: usage?.contextWindow ?? undefined,
      cacheRead: lastUsage?.cacheRead,
      cacheWrite: lastUsage?.cacheWrite,
      cacheHitRate: prompt > 0 ? lastUsage!.cacheRead / prompt : undefined,
      cwd: currentCtx.cwd,
    });
  };

  const persistTiming = async (ctx: ExtensionContext) => {
    // Resolve every session-bound value before the file write yields. The
    // write may outlive this session, so its continuation must use plain data.
    const name = pi.getSessionName?.();
    const time = planTime;
    if (!name || time == null) return;
    const path = planPath(ctx.cwd, name);
    await updatePlanTime(path, name, time).catch(() => {});
  };

  const adopt = async (ctx: ExtensionContext) => {
    const generation = lifecycleGeneration;
    currentCtx = ctx;
    working = !ctx.isIdle();
    waitingForUser = false;
    // Extensions re-instantiate on newSession(), so reconstruct display state
    // and cache age from the active branch rather than trust the empty closure.
    try {
      const branch = ctx.sessionManager.getBranch();
      mode = resolveWorkflowMode(branch);
      cacheStartedAt = latestAssistantTimestamp(branch);
    } catch {
      // A branch that cannot be read is not worth a missing indicator.
    }
    // A marker-free legacy plan stays visually unchanged until its first new run.
    // Existing persisted totals resume across reloads and handoffs.
    const name = pi.getSessionName?.();
    const path = name ? planPath(ctx.cwd, name) : undefined;
    if (path && runStartedAt == null) {
      const persisted = await readPlanTime(path);
      if (generation !== lifecycleGeneration || currentCtx !== ctx) return;
      if (persisted !== undefined && runStartedAt == null) planTime = persisted;
    }
    if (generation !== lifecycleGeneration || currentCtx !== ctx) return;
    refreshStatus();
  };

  pi.on("session_start", async (_event, ctx) => {
    firstTurnTokens = undefined;
    mode = undefined;
    runStartedAt = undefined;
    planTime = undefined;
    cacheStartedAt = undefined;
    waitingForUser = false;
    await adopt(ctx);
  });
  pi.on("session_tree", async (_event, ctx) => {
    await adopt(ctx);
  });

  // Keep ctx reference fresh on every turn
  pi.on("input", async (_event, ctx) => {
    currentCtx = ctx;
    refreshStatus();
  });

  pi.on("agent_start", async (_event, ctx) => {
    currentCtx = ctx;
    // Re-read persisted state at the run boundary in case the mode event was
    // emitted before this extension observed it or a session tree was replaced.
    syncModeFromBranch(ctx);
    working = true;
    planTime ??= EMPTY_PLAN_TIME;
    runStartedAt ??= Date.now();
    refreshStatus();
  });

  pi.on("agent_settled", async (_event, ctx) => {
    const generation = lifecycleGeneration;
    currentCtx = ctx;
    working = false;
    const settledAt = Date.now();
    accrueUntil(settledAt);
    runStartedAt = undefined;
    waitingForUser = false;
    // Best-effort persistence: an unavailable plan must not break turn settlement.
    await persistTiming(ctx);
    if (generation !== lifecycleGeneration || currentCtx !== ctx) return;
    refreshStatus();
  });

  pi.on("turn_start", async (_event, ctx) => {
    currentCtx = ctx;
  });

  // message_end precedes tool execution, so cache age includes time spent in a
  // long-running tool or waiting for a human answer after the provider responds.
  pi.on("message_end", async (event: MessageEndEvent, ctx) => {
    if (event.message.role !== "assistant") return;
    currentCtx = ctx;
    const timestamp = event.message.timestamp;
    cacheStartedAt = typeof timestamp === "number" && Number.isFinite(timestamp) ? timestamp : Date.now();
    refreshStatus();
  });

  pi.on("turn_end", async (event: TurnEndEvent, ctx) => {
    currentCtx = ctx;
    if (firstTurnTokens == null && event.message.role === "assistant") {
      const tokens = event.message.usage.totalTokens;
      if (typeof tokens === "number" && Number.isFinite(tokens) && tokens >= 0) firstTurnTokens = tokens;
    }
    refreshStatus();
  });

  pi.events.on?.(USER_WAIT_EVENT, (payload: unknown) => {
    const next = payload as UserWaitEvent | undefined;
    if (typeof next?.waiting !== "boolean" || next.waiting === waitingForUser) return;
    const now = Date.now();
    if (next.waiting) {
      if (working && runStartedAt != null) {
        accrueUntil(now);
        runStartedAt = undefined;
      }
      waitingForUser = true;
    } else {
      waitingForUser = false;
      if (working) runStartedAt = now;
    }
    refreshStatus();
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    lifecycleGeneration++;
    pi.events.emit?.("powerbar:update", {
      id: "attention-span",
      text: undefined,
    });
    clearPhaseIndicator(ctx);
    currentCtx = undefined;
    working = false;
  });
}
