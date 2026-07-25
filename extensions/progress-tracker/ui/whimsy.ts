/**
 * The words the indicator wears while a run is in flight.
 *
 * Flavoured by the approval gate rather than shared, so the badge's signal
 * survives the whimsy: a session that is still planning says so even while it
 * is busy. The neutral pool covers the most common working state of all —
 * exploring before any plan exists — which would otherwise render wordless.
 *
 * Pure and injectable: the pick takes its randomness as an argument so the
 * indicator's timers can be tested without stubbing globals.
 */

import type { WorkflowPhase } from "../../agent-workflow/phase.js";

/** Slow enough to read, quick enough to notice: a word lasts a few spinner cycles. */
export const WORD_INTERVAL_MS = 4000;

const NEUTRAL_WORDS = ["Rummaging", "Poking about", "Sniffing around", "Spelunking", "Trawling", "Casing the joint"];

const PLAN_WORDS = ["Pondering", "Scheming", "Surveying", "Sketching", "Weighing", "Squinting", "Plotting"];

const EXECUTE_WORDS = ["Forging", "Wrangling", "Hammering", "Assembling", "Wiring", "Grinding", "Hoisting"];

/** The pool for a phase; the neutral pool stands in until a plan is in play. */
export function wordPool(phase: WorkflowPhase | undefined): string[] {
	if (phase === "plan") return PLAN_WORDS;
	if (phase === "execute") return EXECUTE_WORDS;
	return NEUTRAL_WORDS;
}

/**
 * A word from the pool that is not the one already showing, so every tick is a
 * visible change. A single-word pool repeats it rather than returning nothing.
 */
export function pickWord(pool: string[], current: string | undefined, random: () => number = Math.random): string {
	const candidates = pool.filter((word) => word !== current);
	const choices = candidates.length > 0 ? candidates : pool;
	return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
}
