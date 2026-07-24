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
import { clearPhaseIndicator, updatePhaseIndicator } from "./ui/activity-indicator.js";

export default function (pi: ExtensionAPI) {
  let currentCtx: ExtensionContext | undefined;
  let working = false;
  // Baseline for the growth delta. Only turn_end advances it, so the readout
  // means "since the last turn" rather than "since the last repaint".
  let previousTokens: number | undefined;

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
    updatePhaseIndicator(currentCtx, working, usage, { lastUsage, previousTokens });
    const prompt = lastUsage ? lastUsage.input + lastUsage.cacheRead + lastUsage.cacheWrite : 0;
    pi.events.emit?.("agent-status:update", {
      working,
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
    // A session start or tree move discards the old baseline: the delta would
    // otherwise report a branch switch as this turn's growth.
    previousTokens = undefined;
    refreshStatus();
  };

  pi.on("session_start", async (_event, ctx) => adopt(ctx));
  pi.on("session_tree", async (_event, ctx) => adopt(ctx));

  // Keep ctx reference fresh on every turn
  pi.on("input", async (_event, ctx) => {
    currentCtx = ctx;
    refreshStatus();
  });

  pi.on("agent_start", async (_event, ctx) => {
    currentCtx = ctx;
    working = true;
    refreshStatus();
  });

  pi.on("agent_settled", async (_event, ctx) => {
    currentCtx = ctx;
    working = false;
    refreshStatus();
  });

  pi.on("turn_start", async (_event, ctx) => {
    currentCtx = ctx;
  });

  pi.on("turn_end", async (_event, ctx) => {
    currentCtx = ctx;
    refreshStatus();
    // Advance the baseline only after the turn's readout has been rendered, so
    // the delta shown for this turn is the growth the turn caused.
    previousTokens = ctx.getContextUsage()?.tokens ?? undefined;
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    clearPhaseIndicator(ctx);
    currentCtx = undefined;
    working = false;
  });
}
