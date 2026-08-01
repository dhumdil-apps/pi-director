/**
 * The activity indicator — a persistent row above the editor showing whether a
 * run is in flight and which workflow mode is active.
 *
 * It replaces pi's transient working row, so it owns setWorkingVisible.
 */

import type {
  ExtensionContext,
  Theme,
} from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { addDecisionTime, addPhaseTime, DECISION_CAP_MS, formatDuration, type PlanTime } from "../../agent-workflow/plan-time.js";
import type { WorkflowPhase } from "../../agent-workflow/phase.js";

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
  /**
   * Which side of the approval gate the session is on. Undefined until a plan is
   * in play, so a session that never planned looks exactly as it did before.
   */
  phase?: WorkflowPhase;
  /**
   * When the in-flight run started, as epoch ms. Held by the extension rather
   * than the widget: pi re-creates the factory on every turn boundary, so a
   * closure-local start would restart the counter mid-run.
   */
  runStartedAt?: number;
  /** Settled Explore/Execute work plus capped Align latency. */
  planTime?: PlanTime;
  /** When the current Align choice was presented, for live checkpoint latency. */
  checkpointOpenedAt?: number;
  /** When the latest provider response completed, as epoch ms, for cache age. */
  cacheStartedAt?: number;
  /** Injectable clock, so the live counter is testable. */
  now?: () => number;
}

/** Active shows time in this phase; idle shows age of the provider's prompt cache. */
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

/** Accumulated work-mode and Align accounting stays visible while idle. */
function phaseBuckets(
  working: boolean,
  extras: IndicatorExtras | undefined,
  now: number,
  theme: Theme,
): string {
  if (extras?.planTime == null) return "";
  const currentPhase = extras.phase ?? "explore";
  let time = working && extras.runStartedAt != null
    ? addPhaseTime(extras.planTime, currentPhase, Math.max(0, now - extras.runStartedAt))
    : extras.planTime;
  const openDecisionMs = extras.checkpointOpenedAt == null ? 0 : Math.max(0, now - extras.checkpointOpenedAt);
  if (openDecisionMs > 0) time = addDecisionTime(time, openDecisionMs);
  const explore = theme.fg(currentPhase === "explore" ? "accent" : "dim", `explore ${formatDuration(time.exploreMs)}`);
  const align = theme.fg("dim", `align ${formatDuration(time.decisionMs)}${openDecisionMs >= DECISION_CAP_MS ? "+" : ""}`);
  const execute = theme.fg(currentPhase === "execute" ? "accent" : "dim", `execute ${formatDuration(time.executeMs)}`);
  const separator = theme.fg("dim", " · ");
  return `${separator}${explore}${separator}${align}${separator}${execute}`;
}

// The two prompts describe the next useful user decision rather than exposing
// the workflow's internal phase names. The execute prompt is idle-only: it
// appears after approved work settles, when reviewing or starting fresh fits.
const PHASE_LABELS: Record<WorkflowPhase, string> = {
  explore: "What’s your goal?",
  execute: "What’s up next?",
};

/**
 * Dim while exploring, accent after approval: a session with no plan yet gets
 * the goal prompt, while a settled approved task gets a review-or-fresh-start
 * prompt. The badge is always present even though the underlying phase is not.
 */
function phaseText(phase: WorkflowPhase | undefined, theme: Theme): string {
  const resolved: WorkflowPhase = phase ?? "explore";
  return theme.fg(
    resolved === "execute" ? "accent" : "dim",
    PHASE_LABELS[resolved],
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
      const decisionStillLive = () => extras?.checkpointOpenedAt != null && clock() - extras.checkpointOpenedAt < DECISION_CAP_MS;
      const cacheStillLive = () => extras?.cacheStartedAt != null && (durationMs(false, extras, clock()) ?? 0) < CACHE_ERROR_IDLE_MS;
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
            elapsed === undefined || (!working && elapsed < CACHE_WARNING_IDLE_MS)
              ? ""
              : theme.fg(
                  timerColor(working, elapsed),
                  ` ${
                    !working && elapsed >= CACHE_ERROR_IDLE_MS
                      ? "5m+"
                      : formatDuration(elapsed)
                  }`,
                );
          const buckets = phaseBuckets(working, extras, now, theme);
          const status = working
            ? `${theme.fg("accent", marker)}${timer}${buckets}`
            : `${theme.fg("accent", `${marker} `)}${phaseText(extras?.phase, theme)}${timer}${buckets}`;
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
