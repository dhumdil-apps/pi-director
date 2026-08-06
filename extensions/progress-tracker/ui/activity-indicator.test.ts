import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { contextUsageText, formatDuration, updatePhaseIndicator } from "./activity-indicator.js";

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
		[{ tokens: 84_000, contextWindow: 1_000_000, percent: 8.4 }, `[accent]Context window ${bar("▃    ")} [accent]84.0k / 1.0M`],
		[{ tokens: 940, contextWindow: 200_000, percent: 0.47 }, `[accent]Context window ${bar("     ")} [accent]940 / 200.0k`],
		[{ tokens: 0, contextWindow: 200_000, percent: 0 }, `[accent]Context window ${bar("     ")} [accent]0 / 200.0k`],
		[{ tokens: 140_000, contextWindow: 200_000, percent: 70 }, `[error]Context window ${bar("███▄ ")} [error]140.0k / 200.0k`],
		[{ tokens: 180_000, contextWindow: 200_000, percent: 90 }, `[error]Context window ${bar("████▄")} [error]180.0k / 200.0k`],
		// Percentage alone determines severity, regardless of the context-window size.
		[{ tokens: 120_000, contextWindow: 1_000_000, percent: 12 }, `[accent]Context window ${bar("▅    ")} [accent]120.0k / 1.0M`],
		[{ tokens: 250_000, contextWindow: 1_000_000, percent: 25 }, `[warning]Context window ${bar("█▂   ")} [warning]250.0k / 1.0M`],
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
			updatePhaseIndicator(ctx, working, extras);
			const requestRender = vi.fn();
			return { component: factory({ requestRender }, theme), requestRender };
		};

		const status = (lines: string[]) => strip(lines[0]);

		it("rotates the spinner frame every 120ms", () => {
			const { component, requestRender } = mount(true, { phase: "execute" });

			expect(component.render(120).map(strip)).toEqual(["[accent]⠋"]);

			vi.advanceTimersByTime(120);
			expect(requestRender).toHaveBeenCalledTimes(1);
			expect(strip(component.render(120)[0])).toBe("[accent]⠙");

			// Ten frames wrap back to the first one.
			vi.advanceTimersByTime(120 * 9);
			expect(requestRender).toHaveBeenCalledTimes(10);
			expect(strip(component.render(120)[0])).toBe("[accent]⠋");
		});

		it("puts the counter directly after the spinner in both workflow phases", () => {
			for (const phase of ["explore", "execute"] as const) {
				const lines = mount(true, {
					phase,
					runStartedAt: 5_000,
					now: () => 10_000,
				}).component.render(120);
				expect(status(lines)).toBe("[accent]⠋[dim] 5s");
			}
		});

		it("shows the post-execution prompt, not working text, once the run settles", () => {
			const lines = mount(false, { phase: "execute" }).component.render(120);
			expect(status(lines)).toBe("[accent]› [accent]What’s up next?");
		});

		it("keeps the idle marker and starts no timer when the agent is not working", () => {
			const { component, requestRender } = mount(false);

			expect(component.render(120).map(strip)).toEqual(["[accent]› [dim]What’s your goal?"]);

			vi.advanceTimersByTime(120 * 5);
			expect(requestRender).not.toHaveBeenCalled();
			expect(vi.getTimerCount()).toBe(0);
			expect(component.render(120).map(strip)).toEqual(["[accent]› [dim]What’s your goal?"]);
		});

		it("clears the spinner timer when pi disposes the widget", () => {
			const { component, requestRender } = mount(true);

			expect(vi.getTimerCount()).toBe(1);
			component.dispose();

			expect(vi.getTimerCount()).toBe(0);
			vi.advanceTimersByTime(120 * 5);
			expect(requestRender).not.toHaveBeenCalled();
		});

		it("shows only the current phase interval in the leading timer", () => {
			let now = 10_000;
			const { component } = mount(true, {
				phase: "execute",
				runStartedAt: 5_000,
				now: () => now,
			});
			expect(strip(component.render(120)[0])).toBe("[accent]⠋[dim] 5s");

			// The counter rides spinner re-renders.
			expect(vi.getTimerCount()).toBe(1);

			now = 28_000;
			expect(strip(component.render(120)[0])).toBe("[accent]⠋[dim] 23s");
		});

		it("shows live timing in Explore, Align, Execute order", () => {
			const { component } = mount(true, {
				phase: "explore",
				runStartedAt: 5_000,
				planTime: { exploreMs: 10_000, executeMs: 30_000, decisionMs: 2_000, unallocatedMs: 0 },
				now: () => 10_000,
			});

			expect(status(component.render(240))).toContain(
				"[dim] 5s[dim] · [accent]explore 15s[dim] · [dim]align 2s[dim] · [dim]execute 30s",
			);
		});

		it("keeps static phase buckets visible while hiding sub-minute idle age", () => {
			let now = 10_000;
			const component = mount(false, {
				phase: "explore",
				planTime: { exploreMs: 30_000, executeMs: 30_000, decisionMs: 2_000, unallocatedMs: 0 },
				cacheStartedAt: 5_000,
				now: () => now,
			}).component;
			const phaseBuckets = "[accent]explore 30s[dim] · [dim]align 2s[dim] · [dim]execute 30s";

			expect(status(component.render(240))).not.toContain("[accent] 5s");
			expect(status(component.render(240))).toContain(`[dim] · ${phaseBuckets}`);

			now = 65_000;
			expect(status(component.render(240))).toContain(`[warning] 1m 00s[dim] · ${phaseBuckets}`);
		});

		it("advances unresolved Align time and caps that checkpoint at five minutes", () => {
			let now = 10_000;
			const { component, requestRender } = mount(false, {
				phase: "explore",
				planTime: { exploreMs: 10_000, executeMs: 0, decisionMs: 2_000, unallocatedMs: 0 },
				checkpointOpenedAt: 5_000,
				now: () => now,
			});
			expect(status(component.render(240))).toContain("[dim]align 7s");
			now = 305_000;
			expect(status(component.render(240))).toContain("[dim]align 5m 02s+");
			vi.advanceTimersByTime(1_000);
			expect(requestRender).toHaveBeenCalledOnce();
			expect(vi.getTimerCount()).toBe(0);
			component.dispose();
		});

		it("shows idle age from 1m, then caps it red and stops its timer at 5m", () => {
			let now = 10_000;
			const { component, requestRender } = mount(false, {
				phase: "execute",
				cacheStartedAt: 10_000,
				now: () => now,
			});

			expect(status(component.render(120))).not.toContain("[accent] 0s");
			for (const [at, duration] of [
				[70_000, "[warning] 1m 00s"],
				[310_000, "[error] 5m+"],
				[610_000, "[error] 5m+"],
			] as const) {
				now = at;
				expect(status(component.render(120))).toContain(duration);
			}

			vi.advanceTimersByTime(1_000);
			expect(requestRender).toHaveBeenCalledOnce();
			expect(vi.getTimerCount()).toBe(0);

			vi.advanceTimersByTime(10_000);
			expect(requestRender).toHaveBeenCalledOnce();
			component.dispose();

			const alreadyExpired = mount(false, {
				phase: "explore",
				cacheStartedAt: 10_000,
				now: () => 610_000,
			}).component;
			expect(status(alreadyExpired.render(120))).toContain("[error] 5m+");
			expect(vi.getTimerCount()).toBe(0);
			alreadyExpired.dispose();
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
