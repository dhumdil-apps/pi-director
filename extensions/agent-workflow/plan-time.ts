import { randomUUID } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import type { WorkflowMode } from "./mode.js";

const TIME_SPENT_BLOCK =
  /^<!-- time-spent:start[^\r\n]* -->\r?\n\*\*Time spent:\*\*[^\r\n]*\r?\n(?:- [^\r\n]*\r?\n)*<!-- time-spent:end -->$/m;
const LEGACY_TIME = /^<!-- time-spent:start ms=(\d+) -->/m;
const MODE_TIME =
  /^<!-- time-spent:start total-ms=(\d+) questionnaire-ms=(\d+) spec-ms=(\d+) vibe-ms=(\d+) unallocated-ms=(\d+) -->/m;
const LEGACY_WORKFLOW_TIME =
  /^<!-- time-spent:start total-ms=(\d+) explore-ms=(\d+) execute-ms=(\d+) decision-ms=(\d+) unallocated-ms=(\d+) -->/m;
const LEGACY_PHASE_TIME =
  /^<!-- time-spent:start total-ms=(\d+) explore-ms=(\d+) plan-ms=(\d+) execute-ms=(\d+) unallocated-ms=(\d+) -->/m;

export interface PlanTime {
  /** Agent work in Q&A mode. Human latency at a picker is never billed here. */
  questionnaireMs: number;
  specMs: number;
  vibeMs: number;
  /** Time persisted before mode tracking existed. */
  unallocatedMs: number;
}

export const EMPTY_PLAN_TIME: PlanTime = {
  questionnaireMs: 0,
  specMs: 0,
  vibeMs: 0,
  unallocatedMs: 0,
};

function exactMs(value: number): number {
  return Math.max(0, Math.floor(value));
}

export function totalTimeSpent(time: PlanTime): number {
  return exactMs(time.questionnaireMs) + exactMs(time.specMs) + exactMs(time.vibeMs) + exactMs(time.unallocatedMs);
}

export function addModeTime(time: PlanTime, mode: WorkflowMode, ms: number): PlanTime {
  const next = { ...time };
  next[`${mode}Ms` as const] += exactMs(ms);
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
  const questionnaireMs = exactMs(time.questionnaireMs);
  const specMs = exactMs(time.specMs);
  const vibeMs = exactMs(time.vibeMs);
  const unallocatedMs = exactMs(time.unallocatedMs);
  const totalMs = questionnaireMs + specMs + vibeMs + unallocatedMs;
  const lines = [
    `<!-- time-spent:start total-ms=${totalMs} questionnaire-ms=${questionnaireMs} spec-ms=${specMs} vibe-ms=${vibeMs} unallocated-ms=${unallocatedMs} -->`,
    `**Time spent:** ${formatDuration(totalMs)}`,
    `- Q&A: ${formatDuration(questionnaireMs)}`,
    `- Spec: ${formatDuration(specMs)}`,
    `- Vibe: ${formatDuration(vibeMs)}`,
  ];
  if (unallocatedMs > 0) lines.push(`- Unallocated: ${formatDuration(unallocatedMs)}`);
  lines.push("<!-- time-spent:end -->");
  return lines.join("\n");
}

/** Parse timing, folding every historical bucket layout onto the current three. */
export function readPlanTiming(contents: string): PlanTime | undefined {
  const current = contents.match(MODE_TIME);
  if (current) {
    const [, declaredTotal, questionnaire, spec, vibe, unallocated] = current.map(Number);
    const timing = {
      questionnaireMs: questionnaire!,
      specMs: spec!,
      vibeMs: vibe!,
      unallocatedMs: unallocated!,
    };
    if (Object.values(timing).every(Number.isSafeInteger) && totalTimeSpent(timing) === declaredTotal) return timing;
    return undefined;
  }
  const workflow = contents.match(LEGACY_WORKFLOW_TIME);
  if (workflow) {
    const [, declaredTotal, explore, execute, decision, unallocated] = workflow.map(Number);
    // The retired decision bucket was human picker latency, not Agent work, so it
    // lands in unallocated rather than Q&A. The sum is preserved either way.
    const timing = {
      questionnaireMs: 0,
      specMs: explore!,
      vibeMs: execute!,
      unallocatedMs: unallocated! + decision!,
    };
    if (Object.values(timing).every(Number.isSafeInteger) && totalTimeSpent(timing) === declaredTotal) return timing;
    return undefined;
  }
  const phase = contents.match(LEGACY_PHASE_TIME);
  if (phase) {
    const [, declaredTotal, explore, plan, execute, unallocated] = phase.map(Number);
    const timing = {
      questionnaireMs: 0,
      specMs: explore! + plan!,
      vibeMs: execute!,
      unallocatedMs: unallocated!,
    };
    if (
      [declaredTotal, explore, plan, execute, unallocated].every(Number.isSafeInteger) &&
      totalTimeSpent(timing) === declaredTotal
    )
      return timing;
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
  return withPlanTiming(contents, name, {
    ...EMPTY_PLAN_TIME,
    unallocatedMs: exactMs(ms),
  });
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
