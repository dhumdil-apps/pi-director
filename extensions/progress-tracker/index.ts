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

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getLastAssistantUsage } from "@earendil-works/pi-coding-agent";
import { derivePhaseFromBranch, isWorkflowPhase, PHASE_EVENT, type PhaseEvent, type WorkflowPhase } from "../agent-workflow/phase.js";
import { clearPhaseIndicator, updatePhaseIndicator } from "./ui/activity-indicator.js";

export default function (pi: ExtensionAPI) {
  let currentCtx: ExtensionContext | undefined;
  let working = false;
  // The first completed turn's provider-reported aggregate context. It includes
  // the initial user message, so the UI labels it as a total rather than instructions.
  let firstTurnTokens: number | undefined;
  // Display only (see phase.ts). Live transitions update immediately; persisted
  // custom entries reconstruct the latest cycle across handoffs and reloads.
  let phase: WorkflowPhase | undefined;
  // Run timing. The widget re-creates its factory every refresh, so the start
  // stamp has to live here or the counter would restart at each turn boundary.
  let runStartedAt: number | undefined;
  let sessionWorkingMs: number | undefined;

  pi.events.on?.(PHASE_EVENT, (payload: unknown) => {
    const next = (payload as PhaseEvent | undefined)?.phase;
    if (!isWorkflowPhase(next)) return;
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
    updatePhaseIndicator(currentCtx, working, usage, { lastUsage, firstTurnTokens, phase, runStartedAt, sessionWorkingMs });
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

  const adopt = (ctx: ExtensionContext) => {
    currentCtx = ctx;
    working = !ctx.isIdle();
    // Extensions re-instantiate on newSession(), so the closure is empty here even
    // for a session that was approved: re-derive rather than trust the reset.
    try {
      phase = derivePhaseFromBranch(ctx.sessionManager.getBranch());
    } catch {
      // A branch that cannot be read is not worth a missing indicator.
    }
    refreshStatus();
  };

  pi.on("session_start", async (_event, ctx) => {
    firstTurnTokens = undefined;
    phase = undefined;
    runStartedAt = undefined;
    sessionWorkingMs = undefined;
    adopt(ctx);
  });
  pi.on("session_tree", async (_event, ctx) => adopt(ctx));

  // Keep ctx reference fresh on every turn
  pi.on("input", async (_event, ctx) => {
    currentCtx = ctx;
    refreshStatus();
  });

  pi.on("agent_start", async (_event, ctx) => {
    currentCtx = ctx;
    working = true;
    sessionWorkingMs ??= 0;
    runStartedAt ??= Date.now();
    refreshStatus();
  });

  pi.on("agent_settled", async (_event, ctx) => {
    currentCtx = ctx;
    working = false;
    if (runStartedAt != null) sessionWorkingMs = (sessionWorkingMs ?? 0) + Math.max(0, Date.now() - runStartedAt);
    runStartedAt = undefined;
    refreshStatus();
  });

  pi.on("turn_start", async (_event, ctx) => {
    currentCtx = ctx;
  });

  pi.on("turn_end", async (_event, ctx) => {
    currentCtx = ctx;
    if (firstTurnTokens == null) {
      const tokens = ctx.getContextUsage()?.tokens;
      if (typeof tokens === "number" && Number.isFinite(tokens) && tokens >= 0) firstTurnTokens = tokens;
    }
    refreshStatus();
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    clearPhaseIndicator(ctx);
    currentCtx = undefined;
    working = false;
  });
}
