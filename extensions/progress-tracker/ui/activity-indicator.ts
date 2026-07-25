/**
 * The activity indicator — a persistent row above the editor showing whether a
 * run is in flight and how loaded the context is.
 *
 * It replaces pi's transient working row, so it owns setWorkingVisible.
 */

import type { ContextUsage, ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import type { Usage } from "@earendil-works/pi-ai";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { contextIndicatorText } from "../../agent-workflow/context-usage.js";
import type { WorkflowPhase } from "../../agent-workflow/phase.js";
import { SEPARATOR } from "../../status-bar/src/powerbar/settings.js";
import { pickWord, WORD_INTERVAL_MS, wordPool } from "./whimsy.js";

// Re-exported so existing importers (and the widget's own test) keep a single entry point.
export { contextUsageText } from "../../agent-workflow/context-usage.js";

const PHASE_WIDGET_ID = "workflow-phase";
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const SPINNER_INTERVAL_MS = 120;
const IDLE_MARKER = "›";

/** Cache and growth readouts that sit beside the context bar. */
export interface IndicatorExtras {
  /** Provider usage from the last completed assistant turn, for the cache hit rate. */
  lastUsage?: Usage;
  /** Context total at the end of the previous turn, for the growth delta. */
  previousTokens?: number;
  /**
   * Which side of the approval gate the session is on. Undefined until a plan is
   * in play, so a session that never planned looks exactly as it did before.
   */
  phase?: WorkflowPhase;
  /** Injectable randomness for the working word, so its rotation is testable. */
  random?: () => number;
}

// Short enough to cost nothing next to the context bar, and unambiguous: the
// gate has two sides and the badge names the one you are on.
const PHASE_LABELS: Record<WorkflowPhase, string> = { plan: "plan", execute: "exec" };

/** Dim while planning, accent once approved: the badge brightens when work may start. */
function phaseText(phase: WorkflowPhase | undefined, theme: Theme): string | undefined {
  if (!phase) return undefined;
  return theme.fg(phase === "execute" ? "accent" : "dim", PHASE_LABELS[phase]);
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
): string | undefined {
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
          const marker = working ? SPINNER_FRAMES[tick % SPINNER_FRAMES.length] : IDLE_MARKER;
          const context = contextIndicatorText(usage, theme, extras);
          const readout = [statusText(extras?.phase, working, word, theme), context]
            .filter((fragment): fragment is string => fragment !== undefined)
            .join(theme.fg("dim", SEPARATOR));
          const line = readout
            ? `${theme.fg("accent", `${marker} `)}${readout}`
            : theme.fg("accent", marker);
          return [truncateToWidth(line, width)];
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
