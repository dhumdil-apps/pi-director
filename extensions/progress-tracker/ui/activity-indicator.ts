/**
 * The activity indicator — a persistent row above the editor showing whether a
 * run is in flight and which workflow mode is active.
 *
 * It replaces pi's transient working row, so it owns setWorkingVisible.
 */

import type { ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { addModeTime, formatDuration, type PlanTime } from "../../agent-workflow/plan-time.js";
import { MODE_LABEL, type WorkflowMode } from "../../agent-workflow/mode.js";

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
  /** Settled Align/Spec/Vibe Agent work. */
  planTime?: PlanTime;
  /** When the latest provider response completed, as epoch ms, for cache age. */
  cacheStartedAt?: number;
  /** Plan **Current work:** phrase; omitted while idle or when empty. */
  currentWork?: string;
  /** Injectable clock, so the live counter is testable. */
  now?: () => number;
}

/** Active shows time in this mode; idle shows age of the provider's prompt cache. */
function durationMs(working: boolean, extras: IndicatorExtras | undefined, now: number): number | undefined {
  if (!working) {
    return extras?.cacheStartedAt == null ? undefined : Math.max(0, now - extras.cacheStartedAt);
  }
  return extras?.runStartedAt == null ? undefined : Math.max(0, now - extras.runStartedAt);
}

function timerColor(working: boolean, elapsedMs: number): "accent" | "dim" | "warning" | "error" {
  if (working) return "accent";
  if (elapsedMs >= CACHE_ERROR_IDLE_MS) return "error";
  if (elapsedMs >= CACHE_WARNING_IDLE_MS) return "warning";
  return "accent";
}

/** Accumulated per-mode accounting stays visible while idle. */
function modeBuckets(working: boolean, extras: IndicatorExtras | undefined, now: number, theme: Theme): string {
  if (extras?.planTime == null) return "";
  const currentMode = extras.mode ?? "align";
  // Buckets are Agent work only: an open picker or question is the User's time,
  // and the leading cache-age readout already shows that idle risk.
  const time =
    working && extras.runStartedAt != null
      ? addModeTime(extras.planTime, currentMode, Math.max(0, now - extras.runStartedAt))
      : extras.planTime;
  const separator = theme.fg("dim", " · ");
  const align = theme.fg(
    currentMode === "align" ? "warning" : "dim",
    `${MODE_LABEL.align} ${formatDuration(time.alignMs)}`,
  );
  const spec = theme.fg(
    currentMode === "spec" ? "warning" : "dim",
    `${MODE_LABEL.spec} ${formatDuration(time.specMs)}`,
  );
  const vibe = theme.fg(
    currentMode === "vibe" ? "warning" : "dim",
    `${MODE_LABEL.vibe} ${formatDuration(time.vibeMs)}`,
  );
  return `${separator}${align}${separator}${spec}${separator}${vibe}`;
}

// The prompts describe the next useful User decision without a separate mode
// badge; the timing buckets keep the Align/Spec/Vibe order visible.
const MODE_PROMPTS: Record<WorkflowMode, string> = {
  align: "What’s your goal?",
  spec: "Reviewing the plan",
  vibe: "What’s up next?",
};

/** Keep mode buckets visible: cap Current work to the leftover width. */
function workingStatus(
  left: string,
  currentWork: string | undefined,
  buckets: string,
  width: number,
  theme: Theme,
): string {
  if (!currentWork) return `${left}${buckets}`;
  const budget = width - visibleWidth(left) - visibleWidth(buckets) - 1;
  if (budget <= 0) return `${left}${buckets}`;
  const clipped = truncateToWidth(currentWork, budget, "…");
  return clipped ? `${left}${theme.fg("dim", ` ${clipped}`)}${buckets}` : `${left}${buckets}`;
}

/** Dim while aligning, warning once executing. */
function modeText(mode: WorkflowMode | undefined, theme: Theme): string {
  const resolved: WorkflowMode = mode ?? "align";
  return theme.fg(resolved === "vibe" ? "warning" : "dim", MODE_PROMPTS[resolved]);
}

/** Replace pi's transient working row with a persistent workflow indicator. */
export function updatePhaseIndicator(ctx: ExtensionContext, working: boolean, extras?: IndicatorExtras): void {
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
      const cacheStillLive = () =>
        extras?.cacheStartedAt != null && (durationMs(false, extras, clock()) ?? 0) < CACHE_ERROR_IDLE_MS;
      if (!working && cacheStillLive()) {
        idleTimer = setInterval(() => {
          if (!cacheStillLive()) {
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
          const marker = working ? SPINNER_FRAMES[tick % SPINNER_FRAMES.length] : IDLE_MARKER;
          const now = (extras?.now ?? Date.now)();
          const elapsed = durationMs(working, extras, now);
          // Active work rides the spinner; idle refreshes the cache-age timer.
          const timer =
            elapsed === undefined || (!working && elapsed < CACHE_WARNING_IDLE_MS)
              ? ""
              : theme.fg(
                  timerColor(working, elapsed),
                  ` ${!working && elapsed >= CACHE_ERROR_IDLE_MS ? "5m+" : formatDuration(elapsed)}`,
                );
          const buckets = modeBuckets(working, extras, now, theme);
          const currentWork = working ? extras?.currentWork?.trim() : undefined;
          const status = working
            ? workingStatus(theme.fg("accent", marker) + timer, currentWork, buckets, width, theme)
            : `${theme.fg("accent", `${marker} `)}${modeText(extras?.mode, theme)}${timer}${buckets}`;
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
