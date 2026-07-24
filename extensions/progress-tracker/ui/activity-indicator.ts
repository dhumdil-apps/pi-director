/**
 * The activity indicator — a persistent row above the editor showing whether a
 * run is in flight and how loaded the context is.
 *
 * It replaces pi's transient working row, so it owns setWorkingVisible.
 */

import type { ContextUsage, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { Usage } from "@earendil-works/pi-ai";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { contextIndicatorText } from "../../agent-workflow/context-usage.js";

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

      return {
        render: (width: number) => {
          const marker = working ? SPINNER_FRAMES[tick % SPINNER_FRAMES.length] : IDLE_MARKER;
          const context = contextIndicatorText(usage, theme, extras);
          const line = context
            ? `${theme.fg("accent", `${marker} `)}${context}`
            : theme.fg("accent", marker);
          return [truncateToWidth(line, width)];
        },
        invalidate: () => {},
        dispose: () => {
          if (spinnerTimer) clearInterval(spinnerTimer);
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
