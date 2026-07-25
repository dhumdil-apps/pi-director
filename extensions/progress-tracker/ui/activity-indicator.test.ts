import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { contextUsageText, updatePhaseIndicator } from "./activity-indicator.js";

const theme = { fg: (color: string, text: string) => `[${color}]${text}`, getFgAnsi: () => "" } as any;

/** The blocks meter emits SGR resets around every glyph; assertions read the glyphs. */
const strip = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, "");
/** Ten block levels, rendered space-separated. */
const bar = (glyphs: string) => [...glyphs].join(" ");

describe("phase indicator", () => {
	it("renders only the idle marker when context usage is unavailable", () => {
		let factory: any;
		const ctx = {
			ui: {
				setWorkingVisible: (visible: boolean) => expect(visible).toBe(false),
				setWidget: (_id: string, nextFactory: unknown) => { factory = nextFactory; },
			},
		} as any;

		updatePhaseIndicator(ctx, false);

		expect(factory({ requestRender: () => {} }, theme).render(80)).toEqual(["[accent]›"]);
	});

	it.each([
		[{ tokens: 84_000, contextWindow: 1_000_000, percent: 8.4 }, `[accent]ctx ${bar("▇         ")} [accent]84.0k / 1.0M`],
		[{ tokens: 940, contextWindow: 200_000, percent: 0.47 }, `[accent]ctx ${bar("          ")} [accent]940 / 200.0k`],
		[{ tokens: 0, contextWindow: 200_000, percent: 0 }, `[accent]ctx ${bar("          ")} [accent]0 / 200.0k`],
		[{ tokens: 140_000, contextWindow: 200_000, percent: 70 }, `[warning]ctx ${bar("███████   ")} [warning]140.0k / 200.0k`],
		[{ tokens: 180_000, contextWindow: 200_000, percent: 90 }, `[error]ctx ${bar("█████████ ")} [error]180.0k / 200.0k`],
		// Absolute thresholds trip on a wide window long before the fill ratio does.
		[{ tokens: 120_000, contextWindow: 1_000_000, percent: 12 }, `[warning]ctx ${bar("█▂        ")} [warning]120.0k / 1.0M`],
		[{ tokens: 250_000, contextWindow: 1_000_000, percent: 25 }, `[error]ctx ${bar("██▄       ")} [error]250.0k / 1.0M`],
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

		const mount = (working: boolean) => {
			let factory: any;
			const ctx = {
				ui: {
					setWorkingVisible: () => {},
					setWidget: (_id: string, nextFactory: unknown) => { factory = nextFactory; },
				},
			} as any;
			updatePhaseIndicator(ctx, working, { tokens: 84_000, contextWindow: 1_000_000, percent: 8.4 } as any);
			const requestRender = vi.fn();
			return { component: factory({ requestRender }, theme), requestRender };
		};

		it("rotates the spinner frame every 120ms and re-renders, keeping context text", () => {
			const { component, requestRender } = mount(true);

			expect(strip(component.render(120)[0])).toBe(`[accent]⠋ [accent]ctx ${bar("▇         ")} [accent]84.0k / 1.0M`);

			vi.advanceTimersByTime(120);
			expect(requestRender).toHaveBeenCalledTimes(1);
			expect(strip(component.render(120)[0])).toBe(`[accent]⠙ [accent]ctx ${bar("▇         ")} [accent]84.0k / 1.0M`);

			// Ten frames wrap back to the first one.
			vi.advanceTimersByTime(120 * 9);
			expect(requestRender).toHaveBeenCalledTimes(10);
			expect(strip(component.render(120)[0])).toBe(`[accent]⠋ [accent]ctx ${bar("▇         ")} [accent]84.0k / 1.0M`);
		});

		it("omits pi's transient activity and phase text from the working line", () => {
			const line = mount(true).component.render(120)[0];
			expect(line).not.toContain("Building…");
			expect(line).not.toContain("implementing");
			expect(line).not.toContain("IMPLEMENT");
		});

		it("keeps the idle marker and starts no timer when the agent is not working", () => {
			const { component, requestRender } = mount(false);

			expect(strip(component.render(120)[0])).toBe(`[accent]› [accent]ctx ${bar("▇         ")} [accent]84.0k / 1.0M`);

			vi.advanceTimersByTime(120 * 5);
			expect(requestRender).not.toHaveBeenCalled();
			expect(vi.getTimerCount()).toBe(0);
			expect(strip(component.render(120)[0])).toBe(`[accent]› [accent]ctx ${bar("▇         ")} [accent]84.0k / 1.0M`);
		});

		it("clears the spinner timer when pi disposes the widget", () => {
			const { component, requestRender } = mount(true);

			expect(vi.getTimerCount()).toBe(1);
			component.dispose();

			expect(vi.getTimerCount()).toBe(0);
			vi.advanceTimersByTime(120 * 5);
			expect(requestRender).not.toHaveBeenCalled();
		});
	});
});
