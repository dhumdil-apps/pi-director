/**
 * The activity indicator — a persistent row above the editor showing whether a
 * run is in flight and which workflow mode is active.
 *
 * It replaces pi's transient working row, so it owns setWorkingVisible.
 */

import type { ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import {
  addDecisionTime,
  addModeTime,
  DECISION_CAP_MS,
  formatDuration,
  type PlanTime,
} from "../../agent-workflow/plan-time.js";
import type { WorkflowMode } from "../../agent-workflow/mode.js";

// Re-exported so existing importers (and the widget's own test) keep a single entry point.
export { contextUsageText } from "../../agent-workflow/context-usage.js";
export { formatDuration } from "../../agent-workflow/plan-time.js";

const PHASE_WIDGET_ID = "workflow-phase";
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const SPINNER_INTERVAL_MS = 120;
const IDLE_REFRESH_INTERVAL_MS = 1_000;
const CACHE_WARNING_IDLE_MS = 60_000;
const CACHE_ERROR_IDLE_MS = 5 * 60_000;
const IDLE_MARKER = "›";

export interface IndicatorExtras {
  /** Which block the Agent is bound to, and which timing bucket is accruing. */
  mode?: WorkflowMode;
  /**
   * When the in-flight run started, as epoch ms. Held by the extension rather
   * than the widget: pi re-creates the factory on every turn boundary, so a
   * closure-local start would restart the counter mid-run.
   */
  runStartedAt?: number;
  /** Settled Ask/Spec/Vibe work, including capped picker latency in Ask. */
  planTime?: PlanTime;
  /** When the current picker was presented, for live checkpoint latency. */
  checkpointOpenedAt?: number;
  /** When the latest provider response completed, as epoch ms, for cache age. */
  cacheStartedAt?: number;
  /** Injectable clock, so the live counter is testable. */
  now?: () => number;
}

const MODE_COLOR: Record<WorkflowMode, "dim" | "warning" | "accent"> = {
  ask: "dim",
  spec: "warning",
  vibe: "accent",
};

function modeBadge(mode: WorkflowMode | undefined, theme: Theme): string {
  if (!mode) return "";
  return `${theme.fg(MODE_COLOR[mode], `[${mode.toUpperCase()}]`)} `;
}

/** Active shows time in this mode; idle shows age of the provider's prompt cache. */
function durationMs(
  working: boolean,
  extras: IndicatorExtras | undefined,
  now: number,
): number | undefined {
  if (!working) {
    return extras?.cacheStartedAt == null
      ? undefined
      : Math.max(0, now - extras.cacheStartedAt);
  }
  return extras?.runStartedAt == null
    ? undefined
    : Math.max(0, now - extras.runStartedAt);
}

function timerColor(
  working: boolean,
  elapsedMs: number,
): "accent" | "dim" | "warning" | "error" {
  if (working) return "dim";
  if (elapsedMs >= CACHE_ERROR_IDLE_MS) return "error";
  if (elapsedMs >= CACHE_WARNING_IDLE_MS) return "warning";
  return "accent";
}

/** Accumulated per-mode accounting stays visible while idle. */
function modeBuckets(
  working: boolean,
  extras: IndicatorExtras | undefined,
  now: number,
  theme: Theme,
): string {
  if (extras?.planTime == null) return "";
  const currentMode = extras.mode ?? "ask";
  let time =
    working && extras.runStartedAt != null
      ? addModeTime(
          extras.planTime,
          currentMode,
          Math.max(0, now - extras.runStartedAt),
        )
      : extras.planTime;
  const openDecisionMs =
    extras.checkpointOpenedAt == null
      ? 0
      : Math.max(0, now - extras.checkpointOpenedAt);
  if (openDecisionMs > 0) time = addDecisionTime(time, openDecisionMs);
  const separator = theme.fg("dim", " · ");
  const ask = theme.fg(
    currentMode === "ask" ? "accent" : "dim",
    `ask ${formatDuration(time.askMs)}${openDecisionMs >= DECISION_CAP_MS ? "+" : ""}`,
  );
  const spec = theme.fg(
    currentMode === "spec" ? "accent" : "dim",
    `spec ${formatDuration(time.specMs)}`,
  );
  const vibe = theme.fg(
    currentMode === "vibe" ? "accent" : "dim",
    `vibe ${formatDuration(time.vibeMs)}`,
  );
  return `${separator}${ask}${separator}${spec}${separator}${vibe}`;
}

// The prompts describe the next useful User decision rather than restating the
// mode name the badge already shows.
const MODE_PROMPTS: Record<WorkflowMode, string> = {
  ask: "What’s your goal?",
  spec: "Reviewing the plan",
  vibe: "What’s up next?",
};

/** Dim while aligning, accent once executing: the badge is always present. */
function modeText(mode: WorkflowMode | undefined, theme: Theme): string {
  const resolved: WorkflowMode = mode ?? "ask";
  return theme.fg(
    resolved === "vibe" ? "accent" : "dim",
    MODE_PROMPTS[resolved],
  );
}

/** Replace pi's transient working row with a persistent workflow indicator. */
export function updatePhaseIndicator(
  ctx: ExtensionContext,
  working: boolean,
  extras?: IndicatorExtras,
): void {
  ctx.ui.setWorkingVisible(false);
  ctx.ui.setWidget(
    PHASE_WIDGET_ID,
    (tui, theme) => {
      let tick = 0;
      // Only an active run animates; an idle widget keeps no timer alive.
      const spinnerTimer = working
        ? setInterval(() => {
            tick++;
            tui.requestRender();
          }, SPINNER_INTERVAL_MS)
        : undefined;
      spinnerTimer?.unref?.();

      // Idle repaints the cache age until cache-miss risk is already established;
      // beyond five minutes another ticking counter conveys no useful signal.
      let idleTimer: ReturnType<typeof setInterval> | undefined;
      const clock = extras?.now ?? Date.now;
      const decisionStillLive = () =>
        extras?.checkpointOpenedAt != null &&
        clock() - extras.checkpointOpenedAt < DECISION_CAP_MS;
      const cacheStillLive = () =>
        extras?.cacheStartedAt != null &&
        (durationMs(false, extras, clock()) ?? 0) < CACHE_ERROR_IDLE_MS;
      if (!working && (cacheStillLive() || decisionStillLive())) {
        idleTimer = setInterval(() => {
          if (!cacheStillLive() && !decisionStillLive()) {
            const expiredTimer = idleTimer;
            idleTimer = undefined;
            if (expiredTimer) clearInterval(expiredTimer);
          }
          tui.requestRender();
        }, IDLE_REFRESH_INTERVAL_MS);
        idleTimer.unref?.();
      }

      return {
        render: (width: number) => {
          const marker = working
            ? SPINNER_FRAMES[tick % SPINNER_FRAMES.length]
            : IDLE_MARKER;
          const now = (extras?.now ?? Date.now)();
          const elapsed = durationMs(working, extras, now);
          // Active work rides the spinner; idle refreshes the cache-age timer.
          const timer =
            elapsed === undefined ||
            (!working && elapsed < CACHE_WARNING_IDLE_MS)
              ? ""
              : theme.fg(
                  timerColor(working, elapsed),
                  ` ${
                    !working && elapsed >= CACHE_ERROR_IDLE_MS
                      ? "5m+"
                      : formatDuration(elapsed)
                  }`,
                );
          const buckets = modeBuckets(working, extras, now, theme);
          const badge = modeBadge(extras?.mode, theme);
          const status = working
            ? `${theme.fg("accent", badge ? `${marker} ` : marker)}${badge}${timer}${buckets}`
            : `${theme.fg("accent", `${marker} `)}${badge}${modeText(extras?.mode, theme)}${timer}${buckets}`;
          return [truncateToWidth(status, width)];
        },
        invalidate: () => {},
        dispose: () => {
          if (spinnerTimer) clearInterval(spinnerTimer);
          if (idleTimer) clearInterval(idleTimer);
        },
      };
    },
    { placement: "aboveEditor" },
  );
}

export function clearPhaseIndicator(ctx: ExtensionContext): void {
  ctx.ui.setWidget(PHASE_WIDGET_ID, undefined);
  ctx.ui.setWorkingVisible(true);
}
