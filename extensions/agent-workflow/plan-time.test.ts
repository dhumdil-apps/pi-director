import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	addDecisionTime,
	addPhaseTime,
	EMPTY_PLAN_TIME,
	formatDuration,
	readPlanTime,
	readPlanTiming,
	readTimeSpent,
	stripTimeSpent,
	timeSpentBlock,
	totalTimeSpent,
	updatePlanTime,
	withPlanTiming,
} from "./plan-time.js";

const timing = { exploreMs: 50_000, executeMs: 33_456, decisionMs: 12_000, unallocatedMs: 0 };

describe("plan time", () => {
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

	it("writes a machine-readable total with work and Decision breakdown", () => {
		const next = withPlanTiming("# Existing plan\n\n## Current state\n\nA.\n", "ignored-name", timing);
		expect(next).toContain("total-ms=95456 explore-ms=50000 execute-ms=33456 decision-ms=12000 unallocated-ms=0");
		expect(next).toContain("**Time spent:** 1m 35s\n- Explore: 50s\n- Execute: 33s\n- Decision: 12s wall");
		expect(readPlanTiming(next)).toEqual(timing);
		expect(readTimeSpent(next)).toBe(95_456);
	});

	it("migrates a legacy total into visible unallocated history", () => {
		const legacy = "# Legacy\n\n<!-- time-spent:start ms=83456 -->\n**Time spent:** 1m 23s\n<!-- time-spent:end -->\n\nBody.\n";
		expect(readPlanTiming(legacy)).toEqual({ ...EMPTY_PLAN_TIME, unallocatedMs: 83_456 });
		const next = withPlanTiming(legacy, "legacy", readPlanTiming(legacy)!);
		expect(next).toContain("- Unallocated: 1m 23s");
		expect(stripTimeSpent(next)).toBe("# Legacy\n\nBody.");
	});

	it("adds elapsed work to only the active mode and caps each Decision", () => {
		const next = addPhaseTime(timing, "explore", 1_500);
		expect(next).toEqual({ ...timing, exploreMs: 51_500 });
		expect(totalTimeSpent(next)).toBe(96_956);
		expect(addDecisionTime(timing, 600_000).decisionMs).toBe(312_000);
	});

	it("replaces one marker instead of duplicating it", () => {
		const first = withPlanTiming("# Timed\n\nBody.\n", "timed-task", EMPTY_PLAN_TIME);
		const second = withPlanTiming(first, "timed-task", timing);
		expect(second.match(/time-spent:start/g)).toHaveLength(1);
		expect(readPlanTiming(second)).toEqual(timing);
	});

	it("folds legacy Plan work into Explore and starts Decision at zero", () => {
		const legacy = "<!-- time-spent:start total-ms=83456 explore-ms=20000 plan-ms=30000 execute-ms=33456 unallocated-ms=0 -->";
		expect(readPlanTiming(legacy)).toEqual({ exploreMs: 50_000, executeMs: 33_456, decisionMs: 0, unallocatedMs: 0 });
	});

	it("leaves marker-free plans distinguishable for lazy migration", () => {
		expect(readPlanTiming("# Legacy\n\nBody.\n")).toBeUndefined();
	});
});

describe("plan time file update", () => {
	let cwd: string | undefined;
	afterEach(async () => { if (cwd) await rm(cwd, { recursive: true, force: true }); });

	it("atomically upgrades and then updates an existing plan", async () => {
		cwd = await mkdtemp(join(tmpdir(), "pi-plan-time-"));
		const path = join(cwd!, "legacy.md");
		await writeFile(path, "## Current state\n\nKeep me.\n");

		expect(await readPlanTime(path)).toBeUndefined();
		await updatePlanTime(path, "legacy-task", timing);
		expect(await readPlanTime(path)).toEqual(timing);
		expect(await readFile(path, "utf8")).toContain("Keep me.");
		expect(await readFile(path, "utf8")).toContain(timeSpentBlock(timing));
	});
});
