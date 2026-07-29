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
	const window = (resetDescription?: string, label = "Month") => ({ label, usedPercent: 0, resetDescription });

	it.each([
		["4d8h", "Month", 5], ["4d", "Month", 4], ["1d1m", "Month", 2],
		["5d", "Month", 5], ["6d23h", "Month", 5],
		["7d", "Month", 1], ["7d1h", "Month", 2], ["14d", "Month", 2],
		["28d1m", "Month", 5], ["42d", "Month", 5],
		["2h30m", "Month", 3], ["5h", "Month", 5], ["8h", "Month", 5],
		[undefined, "Week", 7], ["now", "Month", 10], ["active", "3d", 3],
	])("maps countdown %s with label %s to %i segments", (reset, label, expected) => {
		expect(segmentsForWindow(window(reset, label))).toBe(expected);
	});
});
