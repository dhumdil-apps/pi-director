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
import { pickWord, WORD_INTERVAL_MS, wordPool } from "./whimsy.js";

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
  /** Injectable randomness for the working word, so its rotation is testable. */
  random?: () => number;
  /**
   * When the in-flight run started, as epoch ms. Held by the extension rather
   * than the widget: pi re-creates the factory on every turn boundary, so a
   * closure-local start would restart the counter mid-run.
   */
  runStartedAt?: number;
  /** Settled Explore/Execute work plus capped Decision latency. */
  planTime?: PlanTime;
  /** When the current Align choice was presented, for live Decision latency. */
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

/** Accumulated work-mode and Decision accounting stays visible while idle. */
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
  const workBuckets: Array<[WorkflowPhase, number]> = [
    ["explore", time.exploreMs],
    ["execute", time.executeMs],
  ];
  const work = workBuckets.map(([bucketPhase, milliseconds]) => {
    const text = `${bucketPhase} ${formatDuration(milliseconds)}`;
    return `${theme.fg("dim", " · ")}${theme.fg(bucketPhase === currentPhase ? "accent" : "dim", text)}`;
  }).join("");
  const decision = `decision ${formatDuration(time.decisionMs)}${openDecisionMs >= DECISION_CAP_MS ? "+" : ""}`;
  return `${work}${theme.fg("dim", " · ")}${theme.fg("dim", decision)}`;
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

/**
 * While a run is in flight the badge gives way to a word from the mode's pool:
 * the gate still reads (exploration vs execution words), but the line moves.
 * Idle keeps the plain badge, and still renders nothing before a plan exists.
 */
function statusText(
  phase: WorkflowPhase | undefined,
  working: boolean,
  word: string,
  theme: Theme,
): string {
  if (!working) return phaseText(phase, theme);
  return theme.fg(phase === "execute" ? "accent" : "dim", `${word}…`);
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

      // The word outlives several spinner cycles, so it gets its own timer
      // rather than a modulo of the frame count.
      const pool = wordPool(extras?.phase);
      let word = pickWord(pool, undefined, extras?.random);
      const wordTimer = working
        ? setInterval(() => {
            word = pickWord(pool, word, extras?.random);
            tui.requestRender();
          }, WORD_INTERVAL_MS)
        : undefined;
      wordTimer?.unref?.();

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
          const status = `${theme.fg("accent", `${marker} `)}${statusText(extras?.phase, working, word, theme)}${timer}${buckets}`;
          return [truncateToWidth(status, width)];
        },
        invalidate: () => {},
        dispose: () => {
          if (spinnerTimer) clearInterval(spinnerTimer);
          if (idleTimer) clearInterval(idleTimer);
          if (wordTimer) clearInterval(wordTimer);
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
