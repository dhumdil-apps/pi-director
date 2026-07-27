import { describe, expect, it } from "vitest";
import { segmentsForLabel } from "./index.js";

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
