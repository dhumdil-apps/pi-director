/**
 * Powerbar Sub Producer
 *
 * Shows subscription usage from Usage Monitor.
 * Usage Monitor is loaded by Pi as a sibling extension (declared in package.json pi.extensions).
 *
 * We listen to `usage-core:ready` and `usage-core:update-current`.
 * The state includes a `provider` field — when absent (e.g. xAI / Bedrock),
 * hourly is hidden when weekly has data, and weekly may use the unmatched
 * settings override. A lone missing sibling is omitted; both missing show one n/a.
 *
 * Segment IDs: "sub-hourly", "sub-weekly"
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  DEFAULT_WORKING_DAYS_PER_WEEK,
  loadUnmatchedWeeklyOverride,
  loadWorkingDaysPerWeek,
  parseWorkingDaysPerWeek,
} from "../powerbar/settings.js";

interface RateWindow {
  label: string;
  usedPercent: number;
  resetDescription?: string;
  resetAt?: string;
}

interface UsageCoreState {
  provider?: string;
  usage?: {
    windows: RateWindow[];
  };
}

/** Fallback width for windows whose label carries no duration. */
const DEFAULT_SEGMENTS = 10;
const MIN_SEGMENTS = 3;
const MAX_SEGMENTS = 12;
const WEEKDAYS_PER_WEEK = 5;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function clamp(n: number): number {
  return Math.min(MAX_SEGMENTS, Math.max(MIN_SEGMENTS, n));
}

/**
 * Bars mirror the window's cadence: 5h → 5 bars, Week → 7, 3d → 3.
 * Labels without a duration (Credits, Tokens, Pro, Extra …) keep the default width.
 */
export function segmentsForLabel(label: string | undefined): number {
  const text = (label ?? "").trim();
  if (!text) return DEFAULT_SEGMENTS;

  const hours = text.match(/^(\d+)\s*h$/i);
  if (hours) {
    const n = Number(hours[1]);
    if (n <= 12) return clamp(n);
    return clamp(Math.round(n / 24));
  }

  const days = text.match(/^(\d+)\s*d$/i);
  if (days) return clamp(Number(days[1]));

  if (/^week$/i.test(text)) return 7;
  if (/^day$/i.test(text)) return 12;
  if (/^month(ly)?$/i.test(text)) return DEFAULT_SEGMENTS;

  return DEFAULT_SEGMENTS;
}

/** Sum counted-day time, preserving partial days at either end. */
function countedDayMsBetween(start: Date, end: Date, includeWeekends: boolean): number | undefined {
  const startMs = start.getTime();
  const endMs = end.getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return undefined;

  let countedMs = 0;
  let cursor = startMs;
  while (cursor < endMs) {
    const current = new Date(cursor);
    const nextMidnight = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1).getTime();
    const sliceEnd = Math.min(endMs, nextMidnight);
    const day = current.getDay();
    if (includeWeekends || (day >= 1 && day <= 5)) countedMs += sliceEnd - cursor;
    cursor = sliceEnd;
  }
  return countedMs;
}

/** Frozen slot count: window cadence, not remaining countdown. Weekly uses working days. */
export function segmentsForWindow(
  window: RateWindow,
  _now = new Date(),
  workingDaysPerWeek = DEFAULT_WORKING_DAYS_PER_WEEK,
): number {
  const allocationDays = parseWorkingDaysPerWeek(String(workingDaysPerWeek));
  if (isWeeklyCadence(window.label)) return allocationDays;
  return segmentsForLabel(window.label);
}

function getColor(pct: number): string {
  if (pct > 80) return "error";
  if (pct > 60) return "warning";
  return "accent";
}

type PaceColor = "success" | "accent" | "error";

function countdownMs(window: RateWindow, now: Date): number | undefined {
  if (window.resetAt) {
    const duration = new Date(window.resetAt).getTime() - now.getTime();
    if (Number.isFinite(duration)) return duration;
  }

  const match = window.resetDescription?.trim().match(/^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?$/i);
  if (!match) return undefined;
  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  return ((days * 24 + hours) * 60 + minutes) * 60 * 1000;
}

function isWeeklyCadence(label: string): boolean {
  return /^(?:week|7d|168h)$/i.test(label.trim());
}

/** Pure window-size markers from providers/overrides — not named quotas (Credits, Extra, models). */
function isCadenceLabel(label: string): boolean {
  const text = label.trim();
  if (!text) return false;
  if (/^(?:week|day|month(?:ly)?)$/i.test(text)) return true;
  return /^\d+\s*[hd]$/i.test(text);
}

/** Display prefix: Weeks (≥8d), Days (1–7d), Hours (<1d). Cadence labels only. */
export function horizonUnitLabel(resetDescription: string | undefined): string | undefined {
  const match = resetDescription?.trim().match(/^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?$/i);
  if (!match || (!match[1] && !match[2] && !match[3])) return undefined;

  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);

  if (days >= 8) return "Weeks";
  if (days >= 1) return "Days";
  if (hours >= 1 || minutes >= 1) return "Hours";
  return undefined;
}

/** Prefer remaining-horizon words for cadence windows; keep named labels as-is. */
export function displayWindowLabel(window: RateWindow): string {
  const label = window.label || "";
  if (!isCadenceLabel(label)) return label;
  return horizonUnitLabel(window.resetDescription) ?? label;
}

/** Route cadence-specific windows without assuming providers return both slots. */
function windowsForSegments(windows: RateWindow[]): { hourly?: RateWindow; weekly?: RateWindow } {
  const weeklyIndex = windows.findIndex((window) => isWeeklyCadence(window.label));
  if (weeklyIndex < 0) return { hourly: windows[0], weekly: windows[1] };

  return {
    hourly: windows.find((_window, index) => index !== weeklyIndex),
    weekly: windows[weeklyIndex],
  };
}

/** Remaining working-day slices in this weekly window, always 1..allocationDays. */
function remainingAllocationDays(window: RateWindow, now: Date, allocationDays: number): number | undefined {
  const duration = countdownMs(window, now);
  if (duration === undefined || duration <= 0) return undefined;

  const includeWeekends = allocationDays > WEEKDAYS_PER_WEEK;
  const countedMs = window.resetAt ? countedDayMsBetween(now, new Date(window.resetAt), includeWeekends) : undefined;
  const remaining = countedMs !== undefined ? Math.ceil(countedMs / DAY_MS) : Math.ceil(duration / DAY_MS);
  if (!Number.isFinite(remaining) || remaining < 1) return 1;
  return Math.min(allocationDays, remaining);
}

function isPastReset(window: RateWindow, now: Date): boolean {
  const duration = countdownMs(window, now);
  return duration !== undefined && duration <= 0;
}

function weeklyPaceColor(window: RateWindow, now: Date, workingDaysPerWeek: number): PaceColor | undefined {
  const allocationDays = parseWorkingDaysPerWeek(String(workingDaysPerWeek));
  if (!isWeeklyCadence(window.label) || isPastReset(window, now)) return undefined;
  const remaining = remainingAllocationDays(window, now, allocationDays);
  if (remaining === undefined) return undefined;
  const usedPercent = Math.max(0, Math.min(100, window.usedPercent));
  const dailyAllocation = 100 / allocationDays;
  const completedAllocation = (allocationDays - remaining) * dailyAllocation;
  const todayLimit = completedAllocation + dailyAllocation;
  if (usedPercent < completedAllocation) return "success";
  if (usedPercent > todayLimit) return "error";
  return "accent";
}

function allocationHoursFromLabel(label: string): number | undefined {
  const hours = label.trim().match(/^(\d+)\s*h$/i);
  if (!hours) return undefined;
  const n = Number(hours[1]);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return n;
}

function hourlyPaceColor(window: RateWindow, now: Date): PaceColor | undefined {
  if (isWeeklyCadence(window.label) || isPastReset(window, now)) return undefined;
  const allocationHours = allocationHoursFromLabel(window.label);
  if (allocationHours === undefined) return undefined;
  const duration = countdownMs(window, now);
  if (duration === undefined || duration <= 0) return undefined;
  const remaining = Math.min(allocationHours, Math.max(1, Math.ceil(duration / HOUR_MS)));
  const usedPercent = Math.max(0, Math.min(100, window.usedPercent));
  const hourAllocation = 100 / allocationHours;
  const completedAllocation = (allocationHours - remaining) * hourAllocation;
  const currentLimit = completedAllocation + hourAllocation;
  if (usedPercent < completedAllocation) return "success";
  if (usedPercent > currentLimit) return "error";
  return "accent";
}

function formatReset(date: Date, now = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  if (diffMs < 0) return "now";

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours < 24) return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;

  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d${remHours}h` : `${days}d`;
}

/** Prefer a live countdown from resetAt so frozen provider strings cannot overstate headroom. */
function resolveWindow(window: RateWindow, now: Date): RateWindow {
  if (!window.resetAt) return window;
  const at = new Date(window.resetAt);
  if (!Number.isFinite(at.getTime())) return window;
  return {
    ...window,
    resetDescription: formatReset(at, now),
  };
}

function emitUnavailable(pi: ExtensionAPI, segmentId: string): void {
  pi.events.emit("powerbar:update", { id: segmentId, text: "n/a", color: "dim" });
}

function emitHidden(pi: ExtensionAPI, segmentId: string): void {
  pi.events.emit("powerbar:update", { id: segmentId, text: undefined });
}

function unmatchedWeeklyWindow(): RateWindow | undefined {
  const override = loadUnmatchedWeeklyOverride();
  if (!override) return undefined;
  return {
    label: "Week",
    usedPercent: override.usedPercent,
    resetAt: override.resetAt.toISOString(),
    resetDescription: formatReset(override.resetAt),
  };
}

function emitWindow(pi: ExtensionAPI, segmentId: string, window: RateWindow, workingDaysPerWeek: number): void {
  const now = new Date();
  const resolved = resolveWindow(window, now);
  const pct = Math.round(resolved.usedPercent);
  const label = displayWindowLabel(resolved);
  const reset = resolved.resetDescription || "";
  const textParts: string[] = [];
  if (label) textParts.push(label);
  if (reset) textParts.push(reset);

  pi.events.emit("powerbar:update", {
    id: segmentId,
    text: textParts.join(" "),
    suffix: `${pct}%`,
    bar: Math.min(100, Math.max(0, resolved.usedPercent)),
    barSegments: segmentsForWindow(resolved, now, workingDaysPerWeek),
    color: isPastReset(resolved, now)
      ? "dim"
      : (weeklyPaceColor(resolved, now, workingDaysPerWeek) ?? hourlyPaceColor(resolved, now) ?? getColor(pct)),
    row: 3,
  });
}

function emitSlot(
  pi: ExtensionAPI,
  segmentId: string,
  window: RateWindow | undefined,
  workingDaysPerWeek: number,
): void {
  if (window) emitWindow(pi, segmentId, window, workingDaysPerWeek);
  else emitHidden(pi, segmentId);
}

function emitUsage(pi: ExtensionAPI, state: UsageCoreState | undefined): void {
  const workingDaysPerWeek = loadWorkingDaysPerWeek();
  let hourly: RateWindow | undefined;
  let weekly: RateWindow | undefined;

  if (!state?.provider) {
    weekly = unmatchedWeeklyWindow();
  } else if (state.usage && state.usage.windows.length > 0) {
    const windows = windowsForSegments(state.usage.windows);
    hourly = windows.hourly;
    weekly = windows.weekly;
  }

  if (!hourly && !weekly) {
    emitUnavailable(pi, "sub-hourly");
    emitHidden(pi, "sub-weekly");
    return;
  }

  emitSlot(pi, "sub-hourly", hourly, workingDaysPerWeek);
  emitSlot(pi, "sub-weekly", weekly, workingDaysPerWeek);
}

export default function createExtension(pi: ExtensionAPI): void {
  pi.events.emit("powerbar:register-segment", { id: "sub-hourly", label: "Sub Hourly", row: 3 });
  pi.events.emit("powerbar:register-segment", { id: "sub-weekly", label: "Sub Weekly", row: 3 });

  pi.events.on("usage-core:ready", (payload: unknown) => {
    emitUsage(pi, (payload as { state?: UsageCoreState }).state);
  });

  pi.events.on("usage-core:update-current", (payload: unknown) => {
    emitUsage(pi, (payload as { state?: UsageCoreState }).state);
  });
}
