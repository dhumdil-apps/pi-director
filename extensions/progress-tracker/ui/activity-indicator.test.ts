import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { contextUsageText, formatDuration, updatePhaseIndicator } from "./activity-indicator.js";
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

		it("words the explore state too, and never names a session mode", () => {
			const lines = mount(true, { phase: "explore", random: () => 0 }).component.render(120);
			expect(status(lines)).toContain(`${wordPool("explore")[0]}…`);
			expect(lines[0]).not.toContain("implementing");
			expect(lines[0]).not.toContain("IMPLEMENT");
		});

		it("shows the post-execution prompt, not a working word, once the run settles", () => {
			const lines = mount(false, { phase: "execute", random: () => 0 }).component.render(120);
			expect(status(lines)).toBe("[accent]› [accent]What’s up next?");
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

		it("shows only the current phase interval in the leading timer", () => {
			let now = 10_000;
			const { component } = mount(true, {
				phase: "execute",
				random: () => 0,
				runStartedAt: 5_000,
				now: () => now,
			});
			const word = `[accent]${wordPool("execute")[0]}…`;

			expect(strip(component.render(120)[0])).toBe(`[accent]⠋ ${word}[dim] 5s`);

			// Only the spinner and word timers exist; the counter rides their re-renders.
			expect(vi.getTimerCount()).toBe(2);

			now = 28_000;
			expect(strip(component.render(120)[0])).toBe(`[accent]⠋ ${word}[dim] 23s`);
		});

		it("shows live full-name phase buckets with the current phase accented", () => {
			const { component } = mount(true, {
				phase: "plan",
				random: () => 0,
				runStartedAt: 5_000,
				planTime: { exploreMs: 10_000, planMs: 20_000, executeMs: 30_000, unallocatedMs: 0 },
				now: () => 10_000,
			});

			expect(status(component.render(240))).toContain(
				"[dim] 5s[dim] · [dim]explore 10s[dim] · [accent]plan 25s[dim] · [dim]execute 30s",
			);
		});

		it("keeps static phase buckets beside cache age while idle", () => {
			let now = 10_000;
			const component = mount(false, {
				phase: "plan",
				planTime: { exploreMs: 10_000, planMs: 20_000, executeMs: 30_000, unallocatedMs: 0 },
				cacheStartedAt: 5_000,
				now: () => now,
			}).component;
			const phaseBuckets = "[dim]explore 10s[dim] · [accent]plan 20s[dim] · [dim]execute 30s";

			for (const [at, age] of [[10_000, "5s"], [34_000, "29s"]] as const) {
				now = at;
				expect(status(component.render(240))).toContain(`[accent] ${age}[dim] · ${phaseBuckets}`);
			}
		});

		it("warns after 1m cache age and turns red after 5m", () => {
			let now = 10_000;
			const { component, requestRender } = mount(false, {
				phase: "execute",
				cacheStartedAt: 10_000,
				now: () => now,
			});

			for (const [at, duration] of [
				[10_000, "[accent] 0s"],
				[70_000, "[warning] 1m 00s"],
				[310_000, "[error] 5m 00s"],
			] as const) {
				now = at;
				expect(status(component.render(120))).toContain(duration);
			}

			vi.advanceTimersByTime(1_000);
			expect(requestRender).toHaveBeenCalledOnce();
			component.dispose();
			expect(vi.getTimerCount()).toBe(0);
		});
	});

	it.each([
		[0, "0s"],
		[59_400, "59s"],
		[60_000, "1m 00s"],
		[3_599_000, "59m 59s"],
		[3_600_000, "1h 00m"],
		[3_849_000, "1h 04m"],
		[-5, "0s"],
	])("formats %ims as %s", (ms, expected) => {
		expect(formatDuration(ms)).toBe(expected);
	});
});
