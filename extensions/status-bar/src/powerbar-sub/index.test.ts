import { describe, expect, it } from "vitest";
import createExtension, { dailyPacingForWindow, segmentsForLabel, segmentsForWindow } from "./index.js";

describe("segmentsForLabel", () => {
	it.each([
		["5h", 5], ["3h", 3], ["1h", 3],
		["72h", 3], ["168h", 7],
		["3d", 3], ["7d", 7], ["30d", 12],
		["Week", 7], ["Day", 12], ["Month", 10], ["Monthly", 10],
		["Credits", 10], ["Tokens", 10], ["Extra [active] 1/5", 10], ["", 10], [undefined, 10],
	])("maps %s to %i segments", (label, expected) => {
		expect(segmentsForLabel(label)).toBe(expected);
	});
});

describe("subscription window routing", () => {
	interface TestWindow {
		label: string;
		usedPercent: number;
		resetDescription?: string;
		resetAt?: string;
	}

	function emitWindows(windows: TestWindow[]): Array<Record<string, unknown>> {
		const updates: Array<Record<string, unknown>> = [];
		const handlers = new Map<string, (payload: unknown) => void>();
		const pi = {
			events: {
				emit: (event: string, payload: unknown) => {
					if (event === "powerbar:update") updates.push(payload as Record<string, unknown>);
				},
				on: (event: string, handler: (payload: unknown) => void) => handlers.set(event, handler),
			},
		} as any;
		createExtension(pi);

		handlers.get("usage-core:update-current")?.({ state: { provider: "codex", usage: { windows } } });
		return updates;
	}

	it("routes a sole 168h window through weekly daily pacing", () => {
		const resetAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
		const updates = emitWindows([{
			label: "168h",
			usedPercent: 55,
			resetDescription: "4d",
			resetAt,
		}]);

		expect(updates[0]).toEqual({ id: "sub-hourly", text: undefined });
		expect(updates[1]).toMatchObject({
			id: "sub-weekly",
			text: "168h 4d",
			suffix: "45% left",
		});
	});

	it("preserves shorter and weekly slots when both windows are present", () => {
		const resetAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
		const updates = emitWindows([
			{ label: "5h", usedPercent: 10, resetDescription: "2h" },
			{ label: "Week", usedPercent: 55, resetDescription: "4d", resetAt },
		]);

		expect(updates.map(({ id, text }) => ({ id, text }))).toEqual([
			{ id: "sub-hourly", text: "5h 2h" },
			{ id: "sub-weekly", text: "Week 4d" },
		]);
	});
});

describe("dailyPacingForWindow", () => {
	const now = new Date(2026, 6, 31, 12);
	const resetAt = new Date(2026, 7, 5, 11);
	const window = (usedPercent: number, label = "Week", reset = resetAt) => ({
		label,
		usedPercent,
		resetDescription: "4d23h",
		resetAt: reset.toISOString(),
	});

	it.each([
		[30, 0, "success", "70% left"],
		[40, 0, "accent", "60% left"],
		[50, 100 / 6, "accent", "50% left"],
		[60, 100 / 3, "accent", "40% left"],
		[61, 35, "error", "39% left"],
		[70, 50, "error", "30% left"],
	])("maps %i%% used to daily allocation fill and color", (used, bar, color, suffix) => {
		const pacing = dailyPacingForWindow(window(used), now);

		expect(pacing).toMatchObject({ barSegments: 3, color, suffix });
		expect(pacing?.bar).toBeCloseTo(bar);
	});

	it("maps the reported midweek snapshot to today's budget position", () => {
		const reportedNow = new Date(2026, 7, 5, 13, 52);
		const reportedReset = new Date(2026, 7, 10, 10, 20);
		const pacing = dailyPacingForWindow({
			label: "168h",
			usedPercent: 55,
			resetDescription: "4d20h",
			resetAt: reportedReset.toISOString(),
		}, reportedNow);

		expect(pacing).toEqual({
			bar: 25,
			barSegments: 3,
			color: "accent",
			suffix: "45% left",
		});
	});

	it("applies only to weekly resets strictly between one day and one week away", () => {
		const oneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
		const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

		expect(dailyPacingForWindow(window(50, "Month"), now)).toBeUndefined();
		expect(dailyPacingForWindow(window(50, "Week", oneDay), now)).toBeUndefined();
		expect(dailyPacingForWindow(window(50, "Week", oneWeek), now)).toBeUndefined();
	});
});

describe("segmentsForWindow", () => {
	const window = (resetDescription?: string, label = "Month", resetAt?: string) => ({
		label,
		usedPercent: 0,
		resetDescription,
		resetAt,
	});

	it.each([
		["4d8h", "Month", 5], ["4d", "Month", 4], ["1d1m", "Month", 2],
		["5d", "Month", 5], ["6d23h", "Month", 5],
		["7d", "Month", 1], ["7d1h", "Month", 2], ["14d", "Month", 2],
		["28d1m", "Month", 4], ["42d", "Month", 4],
		["2h30m", "Month", 3], ["5h", "Month", 5], ["8h", "Month", 8], ["12h", "Month", 8],
		[undefined, "Week", 7], ["now", "Month", 10], ["active", "3d", 3],
	])("maps countdown %s with label %s to %i segments", (reset, label, expected) => {
		expect(segmentsForWindow(window(reset, label))).toBe(expected);
	});

	it("excludes weekend time from a weekly limit after it drops to days", () => {
		const friday = new Date(2026, 6, 31, 12);
		const wednesday = new Date(2026, 7, 5, 11);

		expect(segmentsForWindow(window("4d23h", "168h", wednesday.toISOString()), friday)).toBe(3);
	});

	it("keeps partial weekday time when no weekend is crossed", () => {
		const monday = new Date(2026, 7, 3, 9);
		const thursday = new Date(2026, 7, 6, 8);

		expect(segmentsForWindow(window("2d23h", "168h", thursday.toISOString()), monday)).toBe(3);
	});
});
