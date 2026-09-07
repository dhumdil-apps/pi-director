/**
 * Progress Tracker — an always-visible activity indicator above the editor,
 * a configurable Status Bar context segment, and the agent-status event other
 * tools observe.
 *
 * It deliberately ships no todo tool: pi has none on purpose ("they confuse
 * models"), and a structured list the agent must keep in sync is ceremony, not
 * progress. What this adds beyond the transcript is whether a run is in flight
 * and how much context is left.
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
import { getSetting } from "../extension-preferences/index.js";
import {
  DEFAULT_DENSITY,
  DENSITY_SETTING_ID,
  EXTENSION_NAME as POWERBAR_EXTENSION_NAME,
  parseDensity,
} from "../status-bar/src/powerbar/settings.js";
import { contextCompactText, contextIndicatorText } from "./context-usage.js";
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
    row: 3,
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
  // Run timing. The widget re-creates its factory every refresh, so the start
  // stamp has to live here or the counter would restart at each turn boundary.
  let runStartedAt: number | undefined;
  let cacheStartedAt: number | undefined;

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
    updatePhaseIndicator(currentCtx, working, {
      runStartedAt,
      cacheStartedAt,
    });
    if (usage && usage.tokens != null && usage.contextWindow > 0) {
      const capturedUsage = usage;
      const capturedExtras = { lastUsage, firstTurnTokens };
      const density = parseDensity(getSetting(POWERBAR_EXTENSION_NAME, DENSITY_SETTING_ID, DEFAULT_DENSITY));
      pi.events.emit?.("powerbar:update", {
        id: "attention-span",
        row: 3,
        render: (theme: Theme) =>
          density === "compact"
            ? contextCompactText(capturedUsage, theme)
            : contextIndicatorText(capturedUsage, theme, capturedExtras),
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
    const generation = lifecycleGeneration;
    currentCtx = ctx;
    working = !ctx.isIdle();
    // Extensions re-instantiate on newSession(), so reconstruct cache age from
    // the active branch rather than trust the empty closure.
    try {
      cacheStartedAt = latestAssistantTimestamp(ctx.sessionManager.getBranch());
    } catch {
      // A branch that cannot be read is not worth a missing indicator.
    }
    if (generation !== lifecycleGeneration || currentCtx !== ctx) return;
    refreshStatus();
  };

  pi.on("session_start", async (_event, ctx) => {
    firstTurnTokens = undefined;
    runStartedAt = undefined;
    cacheStartedAt = undefined;
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
    const generation = lifecycleGeneration;
    currentCtx = ctx;
    working = true;
    runStartedAt ??= Date.now();
    if (generation !== lifecycleGeneration || currentCtx !== ctx) return;
    refreshStatus();
  });

  pi.on("agent_settled", async (_event, ctx) => {
    currentCtx = ctx;
    working = false;
    runStartedAt = undefined;
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
