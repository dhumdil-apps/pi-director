/**
 * Settings for the powerbar via pi-extension-settings.
 *
 * Configurable behavior is limited to layout and weekly subscription pacing.
 * Everything visual is locked (see the constants below) — those knobs existed,
 * were either inert or wrong, and are gone.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { OrderedListOption, SettingDefinition } from "../../../extension-preferences/index.js";
import { getSetting, setSetting } from "../../../extension-preferences/index.js";

export const EXTENSION_NAME = "powerbar";

/** Separator between segments. Matches the one the progress-tracker indicator uses. */
export const SEPARATOR = " · ";
/** Bar width for segments that don't declare their own `barSegments`. */
export const BAR_WIDTH = 10;
/** The powerbar always renders below the editor. */
export const PLACEMENT = "belowEditor" as const;
/** Hard limit on rendered lines. */
export const MAX_LINES = 4;

export const WORKING_DAYS_SETTING_ID = "working-days-per-week";
export const DEFAULT_WORKING_DAYS_PER_WEEK = 5;
const MIN_WORKING_DAYS_PER_WEEK = 1;
const MAX_WORKING_DAYS_PER_WEEK = 7;

export type LineNumber = 1 | 2 | 3 | 4;
export type Side = "left" | "right";

export interface PowerbarLine {
  left: string[];
  right: string[];
}

export interface PowerbarSettings {
  /** Always MAX_LINES entries, index 0 = line 1. */
  lines: PowerbarLine[];
  /** Insert one blank row between each rendered line. */
  lineGap: boolean;
}

/** Setting id for one side of one line — `line2-right`. */
export function settingId(line: LineNumber, side: Side): string {
  return `line${line}-${side}`;
}

/**
 * Defaults reproduce the layout the hardcoded per-producer rows used to
 * produce, so an unconfigured bar looks exactly as it did.
 */
const DEFAULT_LINES: Record<string, string> = {
  "line1-left": "git-branch,session-name",
  "line1-right": "provider,model",
  "line2-left": "cost,agent-stats,tokens",
  "line2-right": "",
  "line3-left": "cpu,ram,disk,net",
  "line3-right": "sub-hourly,sub-weekly",
  "line4-left": "attention-span",
  "line4-right": "",
};

/** Line a segment used to be pinned to, for migrating a pre-line-settings layout. */
const LEGACY_ROW: Record<string, LineNumber> = {
  "session-name": 1,
  "git-branch": 1,
  model: 1,
  provider: 1,
  cost: 2,
  tokens: 2,
  "agent-stats": 2,
  cpu: 3,
  ram: 3,
  disk: 3,
  net: 3,
  "sub-hourly": 3,
  "sub-weekly": 3,
};

export const LINES: readonly LineNumber[] = [1, 2, 3, 4];

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

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function registerSettings(pi: ExtensionAPI, segmentOptions: OrderedListOption[]): void {
  const definitions: SettingDefinition[] = [
    {
      id: "line-gap",
      label: "Line gap",
      description: "Insert one blank row between each rendered Status Bar line.",
      defaultValue: "off",
      values: ["off", "on"],
    },
    {
      id: WORKING_DAYS_SETTING_ID,
      label: "Working days per week",
      description: "Days used to pace weekly subscription bars. Enter an integer from 1 to 7; 6–7 include weekends.",
      defaultValue: String(DEFAULT_WORKING_DAYS_PER_WEEK),
    },
  ];
  for (const line of LINES) {
    for (const side of ["left", "right"] as const) {
      const id = settingId(line, side);
      definitions.push({
        id,
        label: `Line ${line} ${side}`,
        description: `Segments on line ${line}, aligned ${side}. A line left empty between two used lines renders as a blank line.`,
        defaultValue: DEFAULT_LINES[id],
        options: segmentOptions,
      });
    }
  }

  pi.events.emit("pi-extension-settings:register", {
    name: EXTENSION_NAME,
    settings: definitions,
  });
}

/**
 * Split a stored `left`/`right` layout across the lines its segments used to be
 * pinned to. Runs at most once: any stored line setting means the layout has
 * already moved over, and the orphaned legacy keys are simply never read again.
 */
export function migrateLegacyLayout(): void {
  const legacy = { left: getSetting(EXTENSION_NAME, "left"), right: getSetting(EXTENSION_NAME, "right") };
  if (legacy.left === undefined && legacy.right === undefined) return;
  for (const line of LINES) {
    for (const side of ["left", "right"] as const) {
      if (getSetting(EXTENSION_NAME, settingId(line, side)) !== undefined) return;
    }
  }

  const migrated = new Map<string, string[]>();
  for (const side of ["left", "right"] as const) {
    for (const id of parseList(legacy[side])) {
      const key = settingId(LEGACY_ROW[id] ?? 1, side);
      migrated.set(key, [...(migrated.get(key) ?? []), id]);
    }
  }
  for (const line of LINES) {
    for (const side of ["left", "right"] as const) {
      const key = settingId(line, side);
      setSetting(EXTENSION_NAME, key, (migrated.get(key) ?? []).join(","));
    }
  }
}

/** Add the separately rendered cost segment to existing token layouts, keeping it prominent. */
function migrateCostSegmentLayout(): void {
  for (const line of LINES) {
    for (const side of ["left", "right"] as const) {
      const key = settingId(line, side);
      const stored = getSetting(EXTENSION_NAME, key);
      const ids = parseList(stored);
      if (stored === undefined || !ids.includes("tokens") || ids.includes("cost")) continue;
      setSetting(EXTENSION_NAME, key, ["cost", ...ids].join(","));
    }
  }
}

export function loadSettings(): PowerbarSettings {
  migrateLegacyLayout();
  migrateCostSegmentLayout();
  return {
    lines: LINES.map((line) => ({
      left: parseList(getSetting(EXTENSION_NAME, settingId(line, "left"), DEFAULT_LINES[settingId(line, "left")])),
      right: parseList(getSetting(EXTENSION_NAME, settingId(line, "right"), DEFAULT_LINES[settingId(line, "right")])),
    })),
    lineGap: getSetting(EXTENSION_NAME, "line-gap", "off") === "on",
  };
}
