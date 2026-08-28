/**
 * Data collection, caching, and insights for the /usage dashboard.
 *
 * Performance model (see CHANGELOG 0.4.0):
 * - Session JSONL files are scanned at the buffer level. Only lines relevant
 *   to assistant or auxiliary accounting are decoded and JSON.parsed. Ordinary
 *   multi-megabyte tool results are skipped; accounting-bearing large results
 *   use an allocation-safe byte parser for their small metadata fields.
 * - Per-file extraction results are persisted to an on-disk cache keyed by
 *   (size, mtimeMs). Session files are append-only, so a warm load only
 *   re-parses files that changed since the last run.
 */

export type {
  BaseStats,
  ChildToolUsage,
  HourlyCell,
  HourlyKey,
  Insight,
  ModelStats,
  ParsedSessionFile,
  PeriodBounds,
  PeriodInsights,
  ProviderStats,
  SessionMessage,
  TabName,
  TimeFilteredStats,
  TokenStats,
  ToolUsageRecord,
  TotalStats,
  TrendInfo,
  UsageAmount,
  UsageData,
  UsageSource,
} from "./types";
export {
  AUXILIARY_MODEL,
  AUXILIARY_PROVIDER,
  AUXILIARY_THINKING_LEVEL,
  HOURLY_KEY_SEP,
  TAB_ORDER,
  makeHourlyKey,
  splitHourlyKey,
} from "./types";
export { getAgentDir, getDefaultCachePath, getSessionsDir } from "./paths";
export { parseSessionBuffer } from "./parse";
export { loadUsageCache, saveUsageCache } from "./cache";
export type { CachedFileState } from "./cache";
export { collectUsageData, projectLabelFromCwd } from "./pipeline";
export type { CollectProgress, CollectUsageOptions } from "./pipeline";
