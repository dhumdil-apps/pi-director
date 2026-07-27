/**
 * Context-usage readout shared across the workflow UI.
 *
 * Lives in agent-workflow (not progress-tracker) so the approval prompt can
 * lean on the same thresholds the phase indicator's `LLM Attention Span (ctx) <bar>`
 * readout uses, without a circular import: progress-tracker already depends
 * on agent-workflow.
 */

import type { ContextUsage, Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import type { Usage } from "@earendil-works/pi-ai";
import { renderPercentageBar } from "../status-bar/src/powerbar/render.js";
import { SEPARATOR } from "../status-bar/src/powerbar/settings.js";

// Severity reacts to the absolute token count as well as the fill ratio: on a 1M-window
// model 200k of context is only 20% full, yet output quality has already degraded. Whichever
// threshold trips first wins.
export const CONTEXT_WARNING_TOKENS = 100_000;
export const CONTEXT_ERROR_TOKENS = 200_000;
export const CONTEXT_WARNING_PERCENT = 40;
export const CONTEXT_ERROR_PERCENT = 80;

/** Compact token count: 940, 84.0k, 1.0M. */
export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}k`;
  return `${tokens}`;
}

/**
 * How loaded the context is: accent (healthy), warning, or error. Undefined while the
 * token count is unknown (e.g. right after compaction), matching contextUsageText.
 */
export function contextSeverity(usage: ContextUsage | undefined): ThemeColor | undefined {
  if (!usage || usage.tokens == null || usage.contextWindow <= 0) return undefined;
  const percent = Math.round(usage.percent ?? (usage.tokens / usage.contextWindow) * 100);
  if (usage.tokens > CONTEXT_ERROR_TOKENS || percent > CONTEXT_ERROR_PERCENT) return "error";
  if (usage.tokens > CONTEXT_WARNING_TOKENS || percent > CONTEXT_WARNING_PERCENT) return "warning";
  return "accent";
}

/**
 * Whether the context is healthy enough to keep working in this session. An unknown
 * usage counts as lean, mirroring the neutral `ctx —` fallback in the pickers.
 */
export function isLeanContext(usage: ContextUsage | undefined): boolean {
  return (contextSeverity(usage) ?? "accent") === "accent";
}

// Compact five-block meter: enough to show context pressure while leaving room for
// the descriptive label and token readout on its own line above the editor.
const CONTEXT_BAR_WIDTH = 5;

/**
 * Context readout using the powerbar's percentage meter.
 * Returns undefined while the token count is unknown (e.g. right after compaction).
 */
export function contextUsageText(usage: ContextUsage | undefined, theme: Theme): string | undefined {
  const color = contextSeverity(usage);
  if (!color || !usage || usage.tokens == null) return undefined;
  const percent = (usage.tokens / usage.contextWindow) * 100;
  const bar = renderPercentageBar(percent, CONTEXT_BAR_WIDTH, theme, color);
  const readout = `${formatTokens(usage.tokens)} / ${formatTokens(usage.contextWindow)}`;
  // The `none` bar style renders nothing — don't leave a double space behind it.
  return [theme.fg(color, "LLM Attention Span (ctx)"), bar, theme.fg(color, readout)].filter(Boolean).join(" ");
}

// Below half the prompt served from cache, the readout is a cost warning rather than
// reassurance, so it drops to dim instead of claiming the accent color.
const CACHE_HEALTHY_PERCENT = 50;

/**
 * Share of the last request's prompt that was served from cache — `⚡ cache 92%`.
 * Undefined when no assistant turn has completed or the provider reported no
 * prompt tokens at all (nothing to have hit).
 */
export function cacheHitText(usage: Usage | undefined, theme: Theme): string | undefined {
  if (!usage) return undefined;
  const prompt = (usage.input ?? 0) + (usage.cacheRead ?? 0) + (usage.cacheWrite ?? 0);
  if (prompt <= 0) return undefined;
  const percent = Math.round(((usage.cacheRead ?? 0) / prompt) * 100);
  return theme.fg(percent >= CACHE_HEALTHY_PERCENT ? "accent" : "dim", `⚡ cache ${percent}%`);
}

/**
 * Growth since the previous turn — `+3.2k`. Undefined on the first turn (no
 * baseline) and when nothing moved, so a steady context adds no noise.
 */
export function contextDeltaText(
  current: number | null | undefined,
  previous: number | undefined,
  theme: Theme,
): string | undefined {
  if (current == null || previous == null) return undefined;
  const delta = current - previous;
  if (delta === 0) return undefined;
  return theme.fg("dim", `${delta > 0 ? "+" : "−"}${formatTokens(Math.abs(delta))}`);
}

/**
 * The full indicator readout: context bar, cache hit rate, turn delta — joined
 * with the powerbar's separator, with missing fragments dropped rather than
 * leaving a dangling divider. Undefined when even the bar is unknown.
 */
export function contextIndicatorText(
  usage: ContextUsage | undefined,
  theme: Theme,
  extras?: { lastUsage?: Usage; previousTokens?: number },
): string | undefined {
  const context = contextUsageText(usage, theme);
  if (!context) return undefined;
  const fragments = [
    context,
    cacheHitText(extras?.lastUsage, theme),
    contextDeltaText(usage?.tokens, extras?.previousTokens, theme),
  ].filter((fragment): fragment is string => fragment !== undefined);
  return fragments.join(theme.fg("dim", SEPARATOR));
}
