/**
 * The words the indicator wears while a run is in flight.
 *
 * Flavoured by the approval gate rather than shared, so the badge's signal
 * survives the whimsy. The neutral pool covers exploration, including legacy
 * sessions where no explicit phase entry exists, which would otherwise render
 * wordless.
 *
 * Pure and injectable: the pick takes its randomness as an argument so the
 * indicator's timers can be tested without stubbing globals.
 */

import type { WorkflowPhase } from "../../agent-workflow/phase.js";

/** Slow enough to read, quick enough to notice: a word lasts a few spinner cycles. */
export const WORD_INTERVAL_MS = 8000;

const NEUTRAL_WORDS = ["Peeking inside", "Sniffing around", "Consulting ghosts"];

const EXECUTE_WORDS = ["Aggressively stitching together", "Beating into submission", "Threatening the hardware"];

/** The pool for a phase; explicit or legacy exploration uses the neutral pool. */
export function wordPool(phase: WorkflowPhase | undefined): string[] {
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
