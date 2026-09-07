/**
 * The activity indicator — a persistent row above the editor showing whether a
 * run is in flight and how long work or idle cache age has been running.
 *
 * It replaces pi's transient working row, so it owns setWorkingVisible.
 */

import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";

const PHASE_WIDGET_ID = "workflow-phase";
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const SPINNER_INTERVAL_MS = 120;
const IDLE_REFRESH_INTERVAL_MS = 1_000;
const CACHE_WARNING_IDLE_MS = 60_000;
const CACHE_ERROR_IDLE_MS = 5 * 60_000;
const IDLE_MARKER = "›";

/** Coarse duration for the work/cache timer (`5s`, `1m 23s`, `1h 04m`). */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const seconds = total % 60;
  const minutes = Math.floor(total / 60) % 60;
  const hours = Math.floor(total / 3600);
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

export interface IndicatorExtras {
  /**
   * When the in-flight run started, as epoch ms. Held by the extension rather
   * than the widget: pi re-creates the factory on every turn boundary, so a
   * closure-local start would restart the counter mid-run.
   */
  runStartedAt?: number;
  /** When the latest provider response completed, as epoch ms, for cache age. */
  cacheStartedAt?: number;
  /** Injectable clock, so the live counter is testable. */
  now?: () => number;
}

/** Active shows time in this run; idle shows age of the provider's prompt cache. */
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

/** Replace pi's transient working row with a persistent work/wait indicator. */
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
          const status = working
            ? `${theme.fg("accent", marker)}${timer}`
            : `${theme.fg("accent", `${marker}`)}${timer}`;

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
