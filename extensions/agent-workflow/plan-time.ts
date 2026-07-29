import { randomUUID } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import type { WorkflowPhase } from "./phase.js";

const TIME_SPENT_BLOCK = /^<!-- time-spent:start[^\r\n]* -->\r?\n\*\*Time spent:\*\*[^\r\n]*\r?\n(?:- [^\r\n]*\r?\n)*<!-- time-spent:end -->$/m;
const LEGACY_TIME = /^<!-- time-spent:start ms=(\d+) -->/m;
const PHASE_TIME = /^<!-- time-spent:start total-ms=(\d+) explore-ms=(\d+) plan-ms=(\d+) execute-ms=(\d+) unallocated-ms=(\d+) -->/m;

export interface PlanTime {
	exploreMs: number;
	planMs: number;
	executeMs: number;
	/** Time persisted before phase tracking existed. */
	unallocatedMs: number;
}

export const EMPTY_PLAN_TIME: PlanTime = {
	exploreMs: 0,
	planMs: 0,
	executeMs: 0,
	unallocatedMs: 0,
};

function exactMs(value: number): number {
	return Math.max(0, Math.floor(value));
}

export function totalTimeSpent(time: PlanTime): number {
	return exactMs(time.exploreMs) + exactMs(time.planMs) + exactMs(time.executeMs) + exactMs(time.unallocatedMs);
}

export function addPhaseTime(time: PlanTime, phase: WorkflowPhase, ms: number): PlanTime {
	const next = { ...time };
	next[`${phase}Ms` as const] += exactMs(ms);
	return next;
}

/** The same coarse duration shown by Progress Tracker. */
export function formatDuration(ms: number): string {
	const total = Math.max(0, Math.floor(ms / 1000));
	const seconds = total % 60;
	const minutes = Math.floor(total / 60) % 60;
	const hours = Math.floor(total / 3600);
	if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
	if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
	return `${seconds}s`;
}

export function timeSpentBlock(value: PlanTime | number): string {
	const time = typeof value === "number" ? { ...EMPTY_PLAN_TIME, unallocatedMs: exactMs(value) } : value;
	const exploreMs = exactMs(time.exploreMs);
	const planMs = exactMs(time.planMs);
	const executeMs = exactMs(time.executeMs);
	const unallocatedMs = exactMs(time.unallocatedMs);
	const totalMs = exploreMs + planMs + executeMs + unallocatedMs;
	const lines = [
		`<!-- time-spent:start total-ms=${totalMs} explore-ms=${exploreMs} plan-ms=${planMs} execute-ms=${executeMs} unallocated-ms=${unallocatedMs} -->`,
		`**Time spent:** ${formatDuration(totalMs)}`,
		`- Explore: ${formatDuration(exploreMs)}`,
		`- Plan: ${formatDuration(planMs)}`,
		`- Execute: ${formatDuration(executeMs)}`,
	];
	if (unallocatedMs > 0) lines.push(`- Unallocated: ${formatDuration(unallocatedMs)}`);
	lines.push("<!-- time-spent:end -->");
	return lines.join("\n");
}

/** Parse phase timing, migrating a total-only block into unallocated history. */
export function readPlanTiming(contents: string): PlanTime | undefined {
	const phase = contents.match(PHASE_TIME);
	if (phase) {
		const [, declaredTotal, explore, plan, execute, unallocated] = phase.map(Number);
		const timing = { exploreMs: explore!, planMs: plan!, executeMs: execute!, unallocatedMs: unallocated! };
		if (Object.values(timing).every(Number.isSafeInteger) && totalTimeSpent(timing) === declaredTotal) return timing;
		return undefined;
	}
	const legacy = contents.match(LEGACY_TIME)?.[1];
	if (legacy === undefined) return undefined;
	const total = Number(legacy);
	return Number.isSafeInteger(total) ? { ...EMPTY_PLAN_TIME, unallocatedMs: total } : undefined;
}

/** Exact persisted total milliseconds, or undefined for a marker-free plan. */
export function readTimeSpent(contents: string): number | undefined {
	const timing = readPlanTiming(contents);
	return timing ? totalTimeSpent(timing) : undefined;
}

/** Approval identity excludes this script-owned, mechanically changing block. */
export function stripTimeSpent(contents: string): string {
	const match = TIME_SPENT_BLOCK.exec(contents);
	if (!match || match.index === undefined) return contents.trim();
	const before = contents.slice(0, match.index).trimEnd();
	const after = contents.slice(match.index + match[0].length).trimStart();
	return `${before}${before && after ? "\n\n" : ""}${after}`.trim();
}

/** Add or replace the script-owned block below the canonical plan title. */
export function withPlanTiming(contents: string, name: string, time: PlanTime): string {
	const clean = stripTimeSpent(contents).trim();
	const firstLineEnd = clean.indexOf("\n");
	const firstLine = firstLineEnd === -1 ? clean : clean.slice(0, firstLineEnd);
	const hasTitle = /^# (?!#)/.test(firstLine);
	const title = hasTitle ? firstLine : `# ${name}`;
	const body = hasTitle ? clean.slice(firstLineEnd === -1 ? clean.length : firstLineEnd + 1).trim() : clean;
	return `${title}\n\n${timeSpentBlock(time)}${body ? `\n\n${body}` : ""}\n`;
}

/** Backward-compatible helper: a scalar is historical, unallocated time. */
export function withTimeSpent(contents: string, name: string, ms: number): string {
	return withPlanTiming(contents, name, { ...EMPTY_PLAN_TIME, unallocatedMs: exactMs(ms) });
}

export async function writePlanAtomically(path: string, contents: string): Promise<void> {
	const temporaryPath = `${path}.${randomUUID()}.tmp`;
	try {
		await writeFile(temporaryPath, contents, { encoding: "utf8", flag: "wx" });
		await rename(temporaryPath, path);
	} catch (error) {
		await rm(temporaryPath, { force: true });
		throw error;
	}
}

export async function readPlanTime(path: string): Promise<PlanTime | undefined> {
	const contents = await readFile(path, "utf8").catch(() => undefined);
	return contents === undefined ? undefined : readPlanTiming(contents);
}

/** Replace only the time envelope, using an atomic rename for editor-safe writes. */
export async function updatePlanTime(path: string, name: string, time: PlanTime): Promise<void> {
	const contents = await readFile(path, "utf8");
	await writePlanAtomically(path, withPlanTiming(contents, name, time));
}
