/**
 * Settings for the powerbar via pi-extension-settings.
 *
 * Configurable: weekly pacing, unmatched weekly override, and density
 * (compact / auto / full). Visuals stay locked; line pickers are gone.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { SettingDefinition } from "../../../extension-preferences/index.js";
import { getSetting } from "../../../extension-preferences/index.js";

export const EXTENSION_NAME = "powerbar";

/** Separator between segments. Matches the one the progress-tracker indicator uses. */
export const SEPARATOR = " · ";
/** Bar width for segments that don't declare their own `barSegments`. */
export const BAR_WIDTH = 10;
/** The powerbar always renders below the editor. */
export const PLACEMENT = "belowEditor" as const;
/** Hard limit on rendered lines. */
export const MAX_LINES = 4;

export const DENSITY_SETTING_ID = "density";
export const DENSITY_VALUES = ["compact", "auto", "full"] as const;
export type PowerbarDensity = (typeof DENSITY_VALUES)[number];
export const DEFAULT_DENSITY: PowerbarDensity = "full";

export const WORKING_DAYS_SETTING_ID = "working-days-per-week";
export const UNMATCHED_WEEKLY_USED_PERCENT_SETTING_ID = "unmatched-weekly-used-percent";
export const UNMATCHED_WEEKLY_RESET_SETTING_ID = "unmatched-weekly-reset";
export const DEFAULT_WORKING_DAYS_PER_WEEK = 5;
const MIN_WORKING_DAYS_PER_WEEK = 1;
const MAX_WORKING_DAYS_PER_WEEK = 7;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/;

export type LineNumber = 1 | 2 | 3 | 4;

export interface PowerbarLine {
  left: string[];
  right: string[];
}

export interface PowerbarSettings {
  /** Index 0 = line 1. Compact/auto use fewer than MAX_LINES. */
  lines: PowerbarLine[];
  /** Insert one blank row between each rendered line. */
  lineGap: boolean;
}

/** Frozen full layout. Change this constant to move full-mode segments; leftover picker keys are ignored. */
export const FIXED_SETTINGS: PowerbarSettings = {
  lines: [
    { left: ["git-branch"], right: ["provider", "model"] },
    { left: ["cost", "agent-stats", "tokens"], right: ["sub-weekly"] },
    { left: ["attention-span"], right: ["sub-hourly"] },
    { left: ["session-name"], right: ["cpu", "ram", "disk", "net"] },
  ],
  lineGap: true,
};

const COMPACT_SETTINGS: PowerbarSettings = {
  lines: [{ left: ["cost", "agent-stats", "tokens"], right: ["model", "provider"] }],
  lineGap: false,
};

const AUTO_SETTINGS: PowerbarSettings = {
  lines: [
    { left: ["cost", "agent-stats", "tokens"], right: ["model", "provider"] },
    { left: ["attention-span"], right: ["sub-weekly", "sub-hourly"] },
  ],
  lineGap: true,
};

export function parseDensity(value: string | undefined): PowerbarDensity {
  const text = value?.trim();
  if (text === "compact" || text === "auto" || text === "full") return text;
  return DEFAULT_DENSITY;
}

/** Normalize free-form settings input before it reaches pacing arithmetic. */
export function parseWorkingDaysPerWeek(value: string | undefined): number {
  const parsed = Number(value?.trim());
  if (!Number.isInteger(parsed) || parsed < MIN_WORKING_DAYS_PER_WEEK || parsed > MAX_WORKING_DAYS_PER_WEEK) {
    return DEFAULT_WORKING_DAYS_PER_WEEK;
  }
  return parsed;
}

export function loadWorkingDaysPerWeek(): number {
  return parseWorkingDaysPerWeek(
    getSetting(EXTENSION_NAME, WORKING_DAYS_SETTING_ID, String(DEFAULT_WORKING_DAYS_PER_WEEK)),
  );
}

/** Used percent for the unmatched weekly override. Empty, junk, or out of range is unset. */
export function parseUnmatchedWeeklyUsedPercent(value: string | undefined): number | undefined {
  const text = value?.trim() ?? "";
  if (!text) return undefined;
  const match = text.match(/^(\d+(?:\.\d+)?)%?$/);
  if (!match) return undefined;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return undefined;
  return parsed;
}

/**
 * ISO-8601 reset only. Natural grok.com dates stay unset.
 * - Date-only (`2026-08-21`) → local midnight
 * - Date-time without zone (`2026-08-21T18:57`) → local wall clock
 * - Date-time with `Z` or `±HH:MM` → that absolute instant (do not append `Z` to a local clock time)
 */
export function parseUnmatchedWeeklyReset(value: string | undefined): Date | undefined {
  const text = value?.trim() ?? "";
  if (!text) return undefined;

  const dateOnly = text.match(ISO_DATE);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const parsed = new Date(year, month - 1, day);
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
      return undefined;
    }
    return parsed;
  }

  if (!ISO_DATE_TIME.test(text)) return undefined;
  const ms = Date.parse(text);
  if (!Number.isFinite(ms)) return undefined;
  return new Date(ms);
}

export interface UnmatchedWeeklyOverride {
  usedPercent: number;
  resetAt: Date;
}

/** Both fields must parse or the unmatched weekly override stays unset. */
export function loadUnmatchedWeeklyOverride(): UnmatchedWeeklyOverride | undefined {
  const usedPercent = parseUnmatchedWeeklyUsedPercent(
    getSetting(EXTENSION_NAME, UNMATCHED_WEEKLY_USED_PERCENT_SETTING_ID, ""),
  );
  const resetAt = parseUnmatchedWeeklyReset(getSetting(EXTENSION_NAME, UNMATCHED_WEEKLY_RESET_SETTING_ID, ""));
  if (usedPercent === undefined || resetAt === undefined) return undefined;
  return { usedPercent, resetAt };
}

export function registerSettings(pi: ExtensionAPI): void {
  const definitions: SettingDefinition[] = [
    {
      id: DENSITY_SETTING_ID,
      label: "Status bar density",
      description:
        "compact: one line (cost, stats, tokens | model, provider). auto: that plus attention-span and usage with a gap. full: four lines; model sits with provider, weekly on line 2, hourly on line 3.",
      defaultValue: DEFAULT_DENSITY,
      values: [...DENSITY_VALUES],
    },
    {
      id: WORKING_DAYS_SETTING_ID,
      label: "Working days per week",
      description: "Days used to pace weekly subscription bars. Enter an integer from 1 to 7; 6–7 include weekends.",
      defaultValue: String(DEFAULT_WORKING_DAYS_PER_WEEK),
    },
    {
      id: UNMATCHED_WEEKLY_USED_PERCENT_SETTING_ID,
      label: "Unmatched weekly used %",
      description:
        "Manual weekly used percent for unmatched providers (xAI, Bedrock). Use 0–100, optionally with %. Both this and the reset must be set or weekly stays n/a.",
      defaultValue: "",
    },
    {
      id: UNMATCHED_WEEKLY_RESET_SETTING_ID,
      label: "Unmatched weekly reset",
      description:
        "Manual weekly reset as ISO-8601. Prefer local wall clock without Z (`2026-08-21T18:57` or `2026-08-21`); use Z/offset only for a true UTC instant — appending Z to a local time overstates remaining by your UTC offset. Natural dates are rejected. Both this and the used percent must be set or weekly stays n/a.",
      defaultValue: "",
    },
  ];

  pi.events.emit("pi-extension-settings:register", {
    name: EXTENSION_NAME,
    settings: definitions,
  });
}

export function loadSettings(): PowerbarSettings {
  const density = parseDensity(getSetting(EXTENSION_NAME, DENSITY_SETTING_ID, DEFAULT_DENSITY));
  if (density === "compact") return COMPACT_SETTINGS;
  if (density === "auto") return AUTO_SETTINGS;
  return FIXED_SETTINGS;
}
