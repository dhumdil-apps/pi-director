/**
 * The activity indicator — a persistent row above the editor showing whether a
 * run is in flight and how loaded the context is.
 *
 * It replaces pi's transient working row, so it owns setWorkingVisible.
 */

import type {
  ContextUsage,
  ExtensionContext,
  Theme,
} from "@earendil-works/pi-coding-agent";
import type { Usage } from "@earendil-works/pi-ai";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { contextIndicatorText } from "../../agent-workflow/context-usage.js";
import type { WorkflowPhase } from "../../agent-workflow/phase.js";
import { pickWord, WORD_INTERVAL_MS, wordPool } from "./whimsy.js";

// Re-exported so existing importers (and the widget's own test) keep a single entry point.
export { contextUsageText } from "../../agent-workflow/context-usage.js";

const PHASE_WIDGET_ID = "workflow-phase";
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const SPINNER_INTERVAL_MS = 120;
const IDLE_MARKER = "›";

/** Cache and first-turn-total readouts that sit beside the context bar. */
export interface IndicatorExtras {
  /** Provider usage from the last completed assistant turn, for the cache hit rate. */
  lastUsage?: Usage;
  /** Provider-reported aggregate context total from the first completed turn. */
  firstTurnTokens?: number;
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
  /** Working time accumulated before the current run, if any. */
  sessionWorkingMs?: number;
  /** Injectable clock, so the live counter is testable. */
  now?: () => number;
}

/**
 * Coarse on purpose: sub-second precision would flicker at the spinner's 120 ms
 * cadence, and past an hour the minute is the useful digit.
 */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const seconds = total % 60;
  const minutes = Math.floor(total / 60) % 60;
  const hours = Math.floor(total / 3600);
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

/**
 * Total working time for this in-memory session. The settled total stays fixed
 * while idle; an active run is added at render time so no timer state lives here.
 */
function durationMs(
  working: boolean,
  extras: IndicatorExtras | undefined,
  now: number,
): number | undefined {
  const settled = extras?.sessionWorkingMs;
  if (working && extras?.runStartedAt != null)
    return (settled ?? 0) + Math.max(0, now - extras.runStartedAt);
  return settled;
}

// The two prompts describe the next useful user decision rather than exposing
// the workflow's internal phase names. The execute prompt is idle-only: it
// appears after approved work settles, when reviewing or starting fresh fits.
const PHASE_LABELS: Record<WorkflowPhase, string> = {
  explore: "What’s your goal?",
  plan: "What’s the plan?",
  execute: "What’s up next?",
};

/**
 * Dim while planning, accent after approval: a session with no plan yet gets
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
 * While a run is in flight the badge gives way to a word from the phase's pool:
 * the gate still reads (planning words vs execution words), but the line moves.
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

/** Replace pi's transient working row with a persistent context indicator. */
export function updatePhaseIndicator(
  ctx: ExtensionContext,
  working: boolean,
  usage?: ContextUsage,
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
          const context = contextIndicatorText(usage, theme, extras);
          // Two lines on purpose: the status word changes width every few
          // seconds, and a same-line context readout would slide with it.
          const elapsed = durationMs(
            working,
            extras,
            (extras?.now ?? Date.now)(),
          );
          // The spinner's own re-render drives the counter while working; idle
          // renders it once and needs no timer.
          const timer =
            elapsed === undefined
              ? ""
              : theme.fg("dim", ` ${formatDuration(elapsed)}`);
          const status = `${theme.fg("accent", `${marker} `)}${statusText(extras?.phase, working, word, theme)}${timer}`;
          const lines = [truncateToWidth(status, width)];
          if (context !== undefined)
            lines.push(truncateToWidth(`  ${context}`, width));
          return lines;
        },
        invalidate: () => {},
        dispose: () => {
          if (spinnerTimer) clearInterval(spinnerTimer);
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
