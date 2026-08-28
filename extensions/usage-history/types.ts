/** Shared usage-history types and hourly keys. */

export interface TokenStats {
  total: number;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export interface BaseStats {
  messages: number;
  cost: number;
  tokens: TokenStats;
}

export interface ModelStats extends BaseStats {
  sessions: Set<string>;
}

export interface ProviderStats extends BaseStats {
  sessions: Set<string>;
  models: Map<string, ModelStats>;
}

export interface TotalStats extends BaseStats {
  sessions: number;
}

export interface Insight {
  /** Structure insights always show; alarms fire only when material. */
  kind: "structure" | "alarm";
  /** Leading stat, already formatted (e.g. "34%", "$446", "1.4×"). */
  stat: string;
  headline: string;
  /** Dimmed follow-up line; empty string renders nothing. */
  advice: string;
}

export interface PeriodInsights {
  insights: Insight[];
}

export interface CostCount {
  cost: number;
  messages: number;
}

export interface PeriodRawData {
  /** All recorded cost, including usage reported by tools and summaries. */
  totalCost: number;
  /** Cost attached to assistant messages, used as the turn-insight denominator. */
  assistantCost: number;
  /** Usage reported by tool results, compactions, and branch summaries. */
  auxiliaryCost: number;
  /** Messages at ≥ CTX_TAX_THRESHOLD context. */
  ctxHigh: CostCount;
  /** Messages below CTX_LOW_THRESHOLD context (comparison group). */
  ctxLow: CostCount;
  projectCosts: Map<string, number>;
  sessionCosts: Map<string, number>;
  /** Cost of each session's first-ever message falling in this period. */
  upfrontCost: number;
  /** Cache misses after >TTL_GAP_MS idle — resuming after the cache expired. */
  ttlMissCost: number;
  /** Cache misses right after a mid-session model switch (no idle gap). */
  modelSwitchMissCost: number;
  /** Cache misses with no idle gap, compaction, or model switch — true prefix changes. */
  prefixMissCost: number;
  reasoningTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  freshTokens: number;
}

/** Per-message adjacency info, computed on raw file order before dedupe. */
export interface MessageMeta {
  /** Gap to the previous assistant message in the same file; -1 when unknown. */
  gapMs: number;
  /** Context size of the previous assistant message in the same file; 0 when first. */
  prevCtx: number;
  /** True when the provider/model differs from the previous assistant message. */
  modelSwitched: boolean;
  /** True for the first deduped message of a session across all its files. */
  isSessionStart: boolean;
}

export interface TrendInfo {
  /** Cost over the last 7 calendar days including today. */
  last7Cost: number;
  /** Average weekly cost over the prior 28 days. */
  priorWeeklyPace: number;
}

export interface TimeFilteredStats {
  providers: Map<string, ProviderStats>;
  totals: TotalStats;
  insights: PeriodInsights;
}

/**
 * One (provider, model, thinkingLevel) cell inside an hourly bucket.
 * Powers the graph explorer; built post-dedupe so it matches table totals.
 */
export interface HourlyCell {
  messages: number;
  cost: number;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  reasoning: number;
}

/** Composite key: `${provider}\u0000${model}\u0000${thinkingLevel}` */
export type HourlyKey = string;

export const HOURLY_KEY_SEP = "\u0000";

export function makeHourlyKey(provider: string, model: string, thinkingLevel: string): HourlyKey {
  return provider + HOURLY_KEY_SEP + model + HOURLY_KEY_SEP + thinkingLevel;
}

export function splitHourlyKey(key: HourlyKey): { provider: string; model: string; thinkingLevel: string } {
  const [provider = "", model = "", thinkingLevel = ""] = key.split(HOURLY_KEY_SEP);
  return { provider, model, thinkingLevel };
}

export interface PeriodBounds {
  todayMs: number;
  weekStartMs: number;
  lastWeekStartMs: number;
  last30DaysStartMs: number;
  nowMs: number;
}

export interface UsageData {
  today: TimeFilteredStats;
  thisWeek: TimeFilteredStats;
  lastWeek: TimeFilteredStats;
  last30Days: TimeFilteredStats;
  allTime: TimeFilteredStats;
  /** Deduped usage bucketed by hour start (ms) → series key → metrics. */
  hourly: Map<number, Map<HourlyKey, HourlyCell>>;
  bounds: PeriodBounds;
}

export type TabName = "today" | "thisWeek" | "lastWeek" | "last30Days" | "allTime";

export const TAB_ORDER: TabName[] = ["today", "thisWeek", "lastWeek", "last30Days", "allTime"];

export type UsageSource = "assistant" | "auxiliary";

/** Pi's own label for usage that cannot be attributed to a provider/model. */
export const AUXILIARY_PROVIDER = "Tools";
export const AUXILIARY_MODEL = "summaries";
export const AUXILIARY_THINKING_LEVEL = "Tools/summaries";

export interface UsageAmount {
  cost: number;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  reasoning: number;
}

export interface SessionMessage extends UsageAmount {
  provider: string;
  model: string;
  /** Thinking level active when the message was produced; "" when unknown. */
  thinkingLevel: string;
  /** Assistant response, or usage reported by a tool/summary entry. */
  source: UsageSource;
  /** Session entry id used to dedupe copied auxiliary entries; empty for assistant messages. */
  sourceId: string;
  timestamp: number;
  /**
   * True when a compaction entry occurred between the previous assistant
   * message and this one. Compaction legitimately changes the request prefix,
   * so such messages are excluded from prefix-change cache-miss accounting.
   */
  afterCompaction: boolean;
}

export interface ChildToolUsage {
  resultIndex: number;
  /** Persisted child session path when the tool supplied one; empty otherwise. */
  sessionFile: string;
  usage: UsageAmount;
}

export interface ToolUsageRecord {
  /** Parent tool-result entry id, stable across copied branch history. */
  sourceId: string;
  timestamp: number;
  /** Canonical Pi 0.81+ tool usage; null for legacy nested-agent results. */
  reportedUsage: UsageAmount | null;
  /** Run id used to derive the standard nested-session path when needed. */
  runId: string;
  /** Recognised per-child usage from nested-agent tool details. */
  children: ChildToolUsage[];
}

export interface ParsedSessionFile {
  /** Empty string when the file has no session header — such files are ignored. */
  sessionId: string;
  /** Working directory from the session header; "" when absent. */
  cwd: string;
  /** Extracted assistant and summary usage records, pre-dedupe. */
  messages: SessionMessage[];
  /** Tool usage is reconciled against recursively scanned child sessions later. */
  toolUsages: ToolUsageRecord[];
}
