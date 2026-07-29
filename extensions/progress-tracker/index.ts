/**
 * Progress Tracker — an always-visible activity and context indicator above the
 * editor, plus the agent-status event other tools observe.
 *
 * It deliberately ships no todo tool: pi has none on purpose ("they confuse
 * models"), and a structured list the agent must keep in sync is ceremony, not
 * progress. What the agent is doing shows in the transcript; what this adds is
 * the one thing the transcript cannot show — whether a run is in flight and how
 * much context is left.
 */

import type { ExtensionAPI, ExtensionContext, MessageEndEvent, SessionEntry, TurnEndEvent } from "@earendil-works/pi-coding-agent";
import { getLastAssistantUsage } from "@earendil-works/pi-coding-agent";
import { derivePhaseFromBranch, isWorkflowPhase, PHASE_EVENT, type PhaseEvent, type WorkflowPhase } from "../agent-workflow/phase.js";
import { addPhaseTime, EMPTY_PLAN_TIME, readPlanTime, updatePlanTime, type PlanTime } from "../agent-workflow/plan-time.js";
import { planPath } from "../agent-workflow/task.js";
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
  let currentCtx: ExtensionContext | undefined;
  let working = false;
  // The first provider response's reported aggregate usage. Read it from the
  // response itself: live context can already include tool results for the next request.
  let firstTurnTokens: number | undefined;
  // Display only (see phase.ts). Live transitions update immediately; persisted
  // custom entries reconstruct the latest cycle across handoffs and reloads.
  let phase: WorkflowPhase | undefined;
  // Run timing. The widget re-creates its factory every refresh, so the start
  // stamp has to live here or the counter would restart at each turn boundary.
  let runStartedAt: number | undefined;
  let planTime: PlanTime | undefined;
  let cacheStartedAt: number | undefined;
  let waitingForUser = false;

  // Close the current interval before changing phase. Undefined is the initial
  // Explore state: the display can still ask for a goal while timing is precise.
  const accrueUntil = (now: number) => {
    if (runStartedAt == null) return;
    planTime = addPhaseTime(planTime ?? EMPTY_PLAN_TIME, phase ?? "explore", Math.max(0, now - runStartedAt));
    runStartedAt = now;
  };

  pi.events.on?.(PHASE_EVENT, (payload: unknown) => {
    const next = (payload as PhaseEvent | undefined)?.phase;
    if (!isWorkflowPhase(next)) return;
    accrueUntil(Date.now());
    phase = next;
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
    updatePhaseIndicator(currentCtx, indicatorWorking, usage, { lastUsage, firstTurnTokens, phase, runStartedAt, planTime, cacheStartedAt });
    const prompt = lastUsage ? lastUsage.input + lastUsage.cacheRead + lastUsage.cacheWrite : 0;
    pi.events.emit?.("agent-status:update", {
      working,
      phase,
      sessionName: pi.getSessionName?.(),
      contextUsed: usage?.tokens ?? undefined,
      contextMax: usage?.contextWindow ?? undefined,
      cacheRead: lastUsage?.cacheRead,
      cacheWrite: lastUsage?.cacheWrite,
      cacheHitRate: prompt > 0 ? lastUsage!.cacheRead / prompt : undefined,
      cwd: currentCtx.cwd,
    });
  };

  const adopt = async (ctx: ExtensionContext) => {
    currentCtx = ctx;
    working = !ctx.isIdle();
    waitingForUser = false;
    // Extensions re-instantiate on newSession(), so reconstruct display state
    // and cache age from the active branch rather than trust the empty closure.
    try {
      const branch = ctx.sessionManager.getBranch();
      phase = derivePhaseFromBranch(branch);
      cacheStartedAt = latestAssistantTimestamp(branch);
    } catch {
      // A branch that cannot be read is not worth a missing indicator.
    }
    // A marker-free legacy plan stays visually unchanged until its first new run.
    // Existing persisted totals resume across reloads and handoffs.
    const name = pi.getSessionName?.();
    if (name && runStartedAt == null) {
      const persisted = await readPlanTime(planPath(ctx.cwd, name));
      if (persisted !== undefined) planTime = persisted;
    }
    refreshStatus();
  };

  pi.on("session_start", async (_event, ctx) => {
    firstTurnTokens = undefined;
    phase = undefined;
    runStartedAt = undefined;
    planTime = undefined;
    cacheStartedAt = undefined;
    waitingForUser = false;
    await adopt(ctx);
  });
  pi.on("session_tree", async (_event, ctx) => { await adopt(ctx); });

  // Keep ctx reference fresh on every turn
  pi.on("input", async (_event, ctx) => {
    currentCtx = ctx;
    refreshStatus();
  });

  pi.on("agent_start", async (_event, ctx) => {
    currentCtx = ctx;
    working = true;
    planTime ??= EMPTY_PLAN_TIME;
    runStartedAt ??= Date.now();
    refreshStatus();
  });

  pi.on("agent_settled", async (_event, ctx) => {
    currentCtx = ctx;
    working = false;
    const settledAt = Date.now();
    accrueUntil(settledAt);
    runStartedAt = undefined;
    waitingForUser = false;
    const name = pi.getSessionName?.();
    if (name && planTime != null) {
      // Best-effort persistence: an unavailable plan must not break turn settlement.
      await updatePlanTime(planPath(ctx.cwd, name), name, planTime).catch(() => {});
    }
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
    cacheStartedAt = typeof timestamp === "number" && Number.isFinite(timestamp)
      ? timestamp
      : Date.now();
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
    clearPhaseIndicator(ctx);
    currentCtx = undefined;
    working = false;
  });
}
