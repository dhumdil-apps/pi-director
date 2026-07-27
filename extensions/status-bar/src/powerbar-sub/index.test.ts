import { describe, expect, it } from "vitest";
import { segmentsForLabel, segmentsForWindow } from "./index.js";

describe("segmentsForLabel", () => {
	it("maps hour windows to their hour count", () => {
		expect(segmentsForLabel("5h")).toBe(5);
		expect(segmentsForLabel("3h")).toBe(3);
	});

	it("clamps short windows to the minimum", () => {
		expect(segmentsForLabel("1h")).toBe(3);
	});

	it("converts multi-day hour windows to days", () => {
		expect(segmentsForLabel("72h")).toBe(3);
		expect(segmentsForLabel("168h")).toBe(7);
	});

	it("maps day windows", () => {
		expect(segmentsForLabel("3d")).toBe(3);
		expect(segmentsForLabel("7d")).toBe(7);
		expect(segmentsForLabel("30d")).toBe(12);
	});

	it("maps named windows", () => {
		expect(segmentsForLabel("Week")).toBe(7);
		expect(segmentsForLabel("Day")).toBe(12);
		expect(segmentsForLabel("Month")).toBe(10);
		expect(segmentsForLabel("Monthly")).toBe(10);
	});

	it("falls back for non-duration labels", () => {
		expect(segmentsForLabel("Credits")).toBe(10);
		expect(segmentsForLabel("Tokens")).toBe(10);
		expect(segmentsForLabel("Extra [active] 1/5")).toBe(10);
		expect(segmentsForLabel("")).toBe(10);
		expect(segmentsForLabel(undefined)).toBe(10);
	});
});

describe("segmentsForWindow", () => {
	const window = (resetDescription?: string, label = "Month") => ({ label, usedPercent: 0, resetDescription });

	it("rounds day countdowns up to the next daily bar", () => {
		expect(segmentsForWindow(window("4d8h"))).toBe(5);
		expect(segmentsForWindow(window("4d"))).toBe(4);
		expect(segmentsForWindow(window("1d1m"))).toBe(2);
	});

	it("caps day countdowns at five bars", () => {
		expect(segmentsForWindow(window("5d"))).toBe(5);
		expect(segmentsForWindow(window("12d"))).toBe(5);
	});

	it("rounds hour countdowns up and caps them at five bars", () => {
		expect(segmentsForWindow(window("2h30m"))).toBe(3);
		expect(segmentsForWindow(window("5h"))).toBe(5);
		expect(segmentsForWindow(window("8h"))).toBe(5);
	});

	it("falls back to the label cadence without a supported countdown", () => {
		expect(segmentsForWindow(window(undefined, "Week"))).toBe(7);
		expect(segmentsForWindow(window("now", "Month"))).toBe(10);
		expect(segmentsForWindow(window("active", "3d"))).toBe(3);
	});
});
