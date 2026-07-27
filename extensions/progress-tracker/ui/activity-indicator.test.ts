import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { contextUsageText, updatePhaseIndicator } from "./activity-indicator.js";
import { WORD_INTERVAL_MS, wordPool } from "./whimsy.js";

const theme = { fg: (color: string, text: string) => `[${color}]${text}`, getFgAnsi: () => "" } as any;

/** The blocks meter emits SGR resets around every glyph; assertions read the glyphs. */
const strip = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, "");
/** Five partial-height blocks represent the context-window percentage. */
const bar = (glyphs: string) => [...glyphs].join(" ");

describe("phase indicator", () => {
	it("renders only the marker and mode badge when context usage is unavailable", () => {
		let factory: any;
		const ctx = {
			ui: {
				setWorkingVisible: (visible: boolean) => expect(visible).toBe(false),
				setWidget: (_id: string, nextFactory: unknown) => { factory = nextFactory; },
			},
		} as any;

		updatePhaseIndicator(ctx, false);

		expect(factory({ requestRender: () => {} }, theme).render(80)).toEqual(["[accent]› [dim]What’s your goal?"]);
	});

	it.each([
		[{ tokens: 84_000, contextWindow: 1_000_000, percent: 8.4 }, `[accent]LLM Attention Span (ctx) ${bar("▃    ")} [accent]84.0k / 1.0M`],
		[{ tokens: 940, contextWindow: 200_000, percent: 0.47 }, `[accent]LLM Attention Span (ctx) ${bar("     ")} [accent]940 / 200.0k`],
		[{ tokens: 0, contextWindow: 200_000, percent: 0 }, `[accent]LLM Attention Span (ctx) ${bar("     ")} [accent]0 / 200.0k`],
		[{ tokens: 140_000, contextWindow: 200_000, percent: 70 }, `[error]LLM Attention Span (ctx) ${bar("███▄ ")} [error]140.0k / 200.0k`],
		[{ tokens: 180_000, contextWindow: 200_000, percent: 90 }, `[error]LLM Attention Span (ctx) ${bar("████▄")} [error]180.0k / 200.0k`],
		// Percentage alone determines severity, regardless of the context-window size.
		[{ tokens: 120_000, contextWindow: 1_000_000, percent: 12 }, `[accent]LLM Attention Span (ctx) ${bar("▅    ")} [accent]120.0k / 1.0M`],
		[{ tokens: 250_000, contextWindow: 1_000_000, percent: 25 }, `[warning]LLM Attention Span (ctx) ${bar("█▂   ")} [warning]250.0k / 1.0M`],
	])("renders the context readout with a usage-colored bar (%o)", (usage, expected) => {
		expect(strip(contextUsageText(usage as any, theme)!)).toBe(expected);
	});

	it("omits the context readout while the token count is unknown", () => {
		expect(contextUsageText(undefined, theme)).toBeUndefined();
		expect(contextUsageText({ tokens: null, contextWindow: 200_000, percent: null } as any, theme)).toBeUndefined();
		expect(contextUsageText({ tokens: 10, contextWindow: 0, percent: null } as any, theme)).toBeUndefined();
	});

	describe("while working", () => {
		beforeEach(() => vi.useFakeTimers());
		afterEach(() => vi.useRealTimers());

		const mount = (working: boolean, extras?: any) => {
			let factory: any;
			const ctx = {
				ui: {
					setWorkingVisible: () => {},
					setWidget: (_id: string, nextFactory: unknown) => { factory = nextFactory; },
				},
			} as any;
			updatePhaseIndicator(ctx, working, { tokens: 84_000, contextWindow: 1_000_000, percent: 8.4 } as any, extras);
			const requestRender = vi.fn();
			return { component: factory({ requestRender }, theme), requestRender };
		};

		/** Line 1 is the marker plus the working word or the idle badge; the context readout is line 2. */
		const status = (lines: string[]) => strip(lines[0]);
		const contextLine = `  [accent]LLM Attention Span (ctx) ${bar("▃    ")} [accent]84.0k / 1.0M`;

		it("rotates the spinner frame every 120ms and re-renders, keeping context text", () => {
			// A fixed word keeps this case about the spinner alone.
			const { component, requestRender } = mount(true, { phase: "execute", random: () => 0 });
			const word = `[accent]${wordPool("execute")[0]}…`;

			expect(component.render(120).map(strip)).toEqual([`[accent]⠋ ${word}`, contextLine]);

			vi.advanceTimersByTime(120);
			expect(requestRender).toHaveBeenCalledTimes(1);
			expect(strip(component.render(120)[0])).toBe(`[accent]⠙ ${word}`);

			// Ten frames wrap back to the first one.
			vi.advanceTimersByTime(120 * 9);
			expect(requestRender).toHaveBeenCalledTimes(10);
			expect(strip(component.render(120)[0])).toBe(`[accent]⠋ ${word}`);
		});

		it("swaps the working word at the configured interval, from the pool the phase flavours", () => {
			const draws = [0, 0.99];
			let draw = 0;
			const { component, requestRender } = mount(true, {
				phase: "plan",
				random: () => draws[Math.min(draw++, draws.length - 1)],
			});

			expect(status(component.render(120))).toContain(`${wordPool("plan")[0]}…`);

			vi.advanceTimersByTime(WORD_INTERVAL_MS);
			expect(requestRender).toHaveBeenCalledTimes(Math.floor(WORD_INTERVAL_MS / 120) + 1);
			expect(status(component.render(120))).toContain(`${wordPool("plan").at(-1)}…`);
		});

		it("words the pre-plan explore state too, and never names a session mode", () => {
			const lines = mount(true, { random: () => 0 }).component.render(120);
			expect(status(lines)).toContain(`${wordPool(undefined)[0]}…`);
			expect(lines[0]).not.toContain("implementing");
			expect(lines[0]).not.toContain("IMPLEMENT");
		});

		it("shows the post-execution prompt, not a working word, once the run settles", () => {
			const lines = mount(false, { phase: "execute", random: () => 0 }).component.render(120);
			expect(status(lines)).toBe("[accent]› [accent]What’s up next?");
		});

		it("shows the goal prompt before a plan is approved", () => {
			expect(status(mount(false).component.render(120))).toBe("[accent]› [dim]What’s your goal?");
		});

		it("keeps the idle marker and starts no timer when the agent is not working", () => {
			const { component, requestRender } = mount(false);

			expect(component.render(120).map(strip)).toEqual(["[accent]› [dim]What’s your goal?", contextLine]);

			vi.advanceTimersByTime(120 * 5);
			expect(requestRender).not.toHaveBeenCalled();
			expect(vi.getTimerCount()).toBe(0);
			expect(component.render(120).map(strip)).toEqual(["[accent]› [dim]What’s your goal?", contextLine]);
		});

		it("clears the spinner timer when pi disposes the widget", () => {
			const { component, requestRender } = mount(true);

			// Spinner and word rotation each own a timer.
			expect(vi.getTimerCount()).toBe(2);
			component.dispose();

			expect(vi.getTimerCount()).toBe(0);
			vi.advanceTimersByTime(120 * 5);
			expect(requestRender).not.toHaveBeenCalled();
		});
	});
});
