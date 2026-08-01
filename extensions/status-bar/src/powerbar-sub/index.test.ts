import { describe, expect, it } from "vitest";
import { segmentsForLabel, segmentsForWindow } from "./index.js";

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
