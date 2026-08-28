/** Aggregation, nested-tool accounting, collectUsageData, insights. */

import { readFile, stat } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { homedir } from "node:os";
import type {
  BaseStats,
  ChildToolUsage,
  HourlyCell,
  HourlyKey,
  Insight,
  ModelStats,
  PeriodBounds,
  PeriodInsights,
  PeriodRawData,
  MessageMeta,
  ProviderStats,
  SessionMessage,
  TimeFilteredStats,
  TokenStats,
  ToolUsageRecord,
  TotalStats,
  TrendInfo,
  UsageAmount,
  UsageData,
} from "./types";
import {
  AUXILIARY_MODEL,
  AUXILIARY_PROVIDER,
  AUXILIARY_THINKING_LEVEL,
  HOURLY_KEY_SEP,
  TAB_ORDER,
  makeHourlyKey,
  type TabName,
} from "./types";
import { getDefaultCachePath, getSessionsDir } from "./paths";
import { auxiliaryMessage, getAllSessionFiles, parseSessionBuffer } from "./parse";
import { loadUsageCache, saveUsageCache, type CachedFileState } from "./cache";

function emptyTokens(): TokenStats {
  return { total: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
}

function emptyModelStats(): ModelStats {
  return { sessions: new Set(), messages: 0, cost: 0, tokens: emptyTokens() };
}

function emptyProviderStats(): ProviderStats {
  return { sessions: new Set(), messages: 0, cost: 0, tokens: emptyTokens(), models: new Map() };
}

function emptyTimeFilteredStats(): TimeFilteredStats {
  return {
    providers: new Map(),
    totals: { sessions: 0, messages: 0, cost: 0, tokens: emptyTokens() },
    insights: { insights: [] },
  };
}

function emptyPeriodRawData(): PeriodRawData {
  return {
    totalCost: 0,
    assistantCost: 0,
    auxiliaryCost: 0,
    ctxHigh: { cost: 0, messages: 0 },
    ctxLow: { cost: 0, messages: 0 },
    projectCosts: new Map(),
    sessionCosts: new Map(),
    upfrontCost: 0,
    ttlMissCost: 0,
    modelSwitchMissCost: 0,
    prefixMissCost: 0,
    reasoningTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    freshTokens: 0,
  };
}

/**
 * Collapse a session cwd to a short, stable project label: `~` for the home
 * directory, up to two path segments below home (worktrees collapse to their
 * repository), absolute paths elsewhere.
 */
export function projectLabelFromCwd(cwd: string): string {
  if (!cwd) return "(unknown)";
  // Collapse any home-directory prefix to "~", not just the current user's —
  // session stores merged from other machines can carry a different username.
  const home = homedir();
  let homePrefix: string | null = null;
  if (cwd === home || cwd.startsWith(home + "/")) {
    homePrefix = home;
  } else {
    const m = /^(\/Users\/[^/]+|\/home\/[^/]+)(?=\/|$)/.exec(cwd);
    if (m) homePrefix = m[1]!;
  }
  if (homePrefix !== null && cwd.length <= homePrefix.length) return "~";
  let rel = homePrefix !== null ? cwd.slice(homePrefix.length + 1) : cwd;
  const wt = rel.indexOf("/.worktrees/");
  if (wt !== -1) rel = rel.slice(0, wt);
  const parts = rel.split("/").filter(Boolean);
  const label = parts.slice(0, 2).join("/");
  return homePrefix !== null ? `~/${label}` : `/${label}`;
}

function emptyUsageData(bounds: PeriodBounds): UsageData {
  return {
    today: emptyTimeFilteredStats(),
    thisWeek: emptyTimeFilteredStats(),
    lastWeek: emptyTimeFilteredStats(),
    last30Days: emptyTimeFilteredStats(),
    allTime: emptyTimeFilteredStats(),
    hourly: new Map(),
    bounds,
  };
}

const HOUR_MS = 3_600_000;

function addToHourlyBuckets(hourly: Map<number, Map<HourlyKey, HourlyCell>>, msg: SessionMessage): void {
  if (msg.timestamp <= 0) return; // Unknown time can't be placed on a time axis.
  const hour = Math.floor(msg.timestamp / HOUR_MS) * HOUR_MS;
  let bucket = hourly.get(hour);
  if (!bucket) {
    bucket = new Map();
    hourly.set(hour, bucket);
  }
  const key = makeHourlyKey(msg.provider, msg.model, msg.thinkingLevel);
  let cell = bucket.get(key);
  if (!cell) {
    cell = { messages: 0, cost: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0 };
    bucket.set(key, cell);
  }
  if (msg.source === "assistant") cell.messages++;
  cell.cost += msg.cost;
  cell.input += msg.input;
  cell.output += msg.output;
  cell.cacheRead += msg.cacheRead;
  cell.cacheWrite += msg.cacheWrite;
  cell.reasoning += msg.reasoning;
}

// Helper to accumulate stats into a target
function accumulateStats(
  target: BaseStats,
  cost: number,
  tokens: { total: number; input: number; output: number; cacheRead: number; cacheWrite: number },
  countMessage: boolean,
): void {
  if (countMessage) target.messages++;
  target.cost += cost;
  target.tokens.total += tokens.total;
  target.tokens.input += tokens.input;
  target.tokens.output += tokens.output;
  target.tokens.cacheRead += tokens.cacheRead;
  target.tokens.cacheWrite += tokens.cacheWrite;
}

function getPeriodsForTimestamp(
  timestamp: number,
  todayMs: number,
  weekStartMs: number,
  lastWeekStartMs: number,
  last30DaysStartMs: number,
): TabName[] {
  const periods: TabName[] = ["allTime"];
  if (timestamp >= todayMs) periods.push("today");
  if (timestamp >= weekStartMs) {
    periods.push("thisWeek");
  } else if (timestamp >= lastWeekStartMs) {
    periods.push("lastWeek");
  }
  if (timestamp >= last30DaysStartMs) periods.push("last30Days");
  return periods;
}

const DAY_MS = 24 * HOUR_MS;
const PROGRESS_REPORT_EVERY = 100;

function addMessagesToUsageData(
  data: UsageData,
  sessionId: string,
  project: string,
  messages: SessionMessage[],
  meta: MessageMeta[],
  todayMs: number,
  weekStartMs: number,
  lastWeekStartMs: number,
  last30DaysStartMs: number,
  rawByPeriod: Record<TabName, PeriodRawData>,
  costByDayIdx: Map<number, number>,
): void {
  const sessionContributed = { today: false, thisWeek: false, lastWeek: false, last30Days: false, allTime: false };

  for (let mi = 0; mi < messages.length; mi++) {
    const msg = messages[mi]!;
    const mm = meta[mi]!;

    // pi's built-in test providers never call a real API — keep them out of stats.
    if (EXCLUDED_PROVIDERS.has(msg.provider)) continue;

    // Day-indexed cost totals power the burn-trend insight.
    if (msg.timestamp > 0) {
      const dayIdx = Math.floor((msg.timestamp - todayMs) / DAY_MS);
      costByDayIdx.set(dayIdx, (costByDayIdx.get(dayIdx) ?? 0) + msg.cost);
    }

    addToHourlyBuckets(data.hourly, msg);

    const periods = getPeriodsForTimestamp(msg.timestamp, todayMs, weekStartMs, lastWeekStartMs, last30DaysStartMs);
    const tokens = {
      // Count fresh tokens processed this turn.
      // Include cacheWrite because those prompt tokens were newly written and billed.
      // Exclude cacheRead because repeated cache hits would otherwise dominate totals.
      total: msg.input + msg.output + msg.cacheWrite,
      input: msg.input,
      output: msg.output,
      cacheRead: msg.cacheRead,
      cacheWrite: msg.cacheWrite,
    };

    for (const period of periods) {
      const stats = data[period];

      let providerStats = stats.providers.get(msg.provider);
      if (!providerStats) {
        providerStats = emptyProviderStats();
        stats.providers.set(msg.provider, providerStats);
      }

      let modelStats = providerStats.models.get(msg.model);
      if (!modelStats) {
        modelStats = emptyModelStats();
        providerStats.models.set(msg.model, modelStats);
      }

      const isAssistant = msg.source === "assistant";
      modelStats.sessions.add(sessionId);
      accumulateStats(modelStats, msg.cost, tokens, isAssistant);

      providerStats.sessions.add(sessionId);
      accumulateStats(providerStats, msg.cost, tokens, isAssistant);

      accumulateStats(stats.totals, msg.cost, tokens, isAssistant);
      sessionContributed[period] = true;

      const raw = rawByPeriod[period];
      raw.totalCost += msg.cost;
      raw.projectCosts.set(project, (raw.projectCosts.get(project) ?? 0) + msg.cost);
      raw.sessionCosts.set(sessionId, (raw.sessionCosts.get(sessionId) ?? 0) + msg.cost);

      // Auxiliary calls belong in accounting totals, project/session mix, and
      // burn trend. They are not assistant turns, so do not let their synthetic
      // model identity or nested context distort turn/cache insights.
      if (!isAssistant) {
        raw.auxiliaryCost += msg.cost;
        continue;
      }
      raw.assistantCost += msg.cost;

      const ctx = msg.input + msg.cacheRead + msg.cacheWrite;
      if (ctx >= CTX_TAX_THRESHOLD) {
        raw.ctxHigh.cost += msg.cost;
        raw.ctxHigh.messages++;
      } else if (ctx < CTX_LOW_THRESHOLD) {
        raw.ctxLow.cost += msg.cost;
        raw.ctxLow.messages++;
      }
      if (mm.isSessionStart) raw.upfrontCost += msg.cost;
      if (
        !msg.afterCompaction &&
        mm.prevCtx >= MISS_MIN_PREV_CONTEXT &&
        msg.cacheRead < Math.min(MISS_MAX_CACHE_READ, 0.3 * mm.prevCtx)
      ) {
        if (mm.gapMs > TTL_GAP_MS) raw.ttlMissCost += msg.cost;
        else if (mm.gapMs >= 0 && mm.modelSwitched) raw.modelSwitchMissCost += msg.cost;
        else if (mm.gapMs >= 0) raw.prefixMissCost += msg.cost;
      }
      raw.reasoningTokens += msg.reasoning;
      raw.outputTokens += msg.output;
      raw.cacheReadTokens += msg.cacheRead;
      raw.freshTokens += msg.input + msg.cacheWrite;
    }
  }

  if (sessionContributed.today) data.today.totals.sessions++;
  if (sessionContributed.thisWeek) data.thisWeek.totals.sessions++;
  if (sessionContributed.lastWeek) data.lastWeek.totals.sessions++;
  if (sessionContributed.last30Days) data.last30Days.totals.sessions++;
  if (sessionContributed.allTime) data.allTime.totals.sessions++;
}

// =============================================================================
// Nested tool-usage accounting
// =============================================================================

// Recognised nested-agent tool results report usage for child runs that
// pi-subagents also persists as ordinary session files, which this scan
// already counts with full model attribution. When every child session file
// behind a report is part of the scan, the children speak for themselves and
// the parent's aggregate is skipped. Otherwise the aggregate (or, for pre-0.81
// legacy entries, each unresolved child's reported usage) is counted under
// Tools / summaries.
//
// Copied branch history gets a new parent filename, so a copy's runId-derived
// child paths can dangle even though the original's resolve. Resolved child
// identities are therefore unioned across all copies of an entry before any
// emission, and identical emissions collapse in the sourceId dedupe.

interface ScannedSessionIndex {
  /** Resolved paths of scanned files that have a session header. */
  paths: Set<string>;
  /** Directory of each scanned file → number of scanned files inside it. */
  fileCountByDir: Map<string, number>;
}

function buildScannedSessionIndex(states: Map<string, CachedFileState>): ScannedSessionIndex {
  const paths = new Set<string>();
  const fileCountByDir = new Map<string, number>();
  for (const [filePath, state] of states) {
    if (!state.parsed.sessionId) continue;
    const resolved = resolve(filePath);
    paths.add(resolved);
    const dir = dirname(resolved);
    fileCountByDir.set(dir, (fileCountByDir.get(dir) ?? 0) + 1);
  }
  return { paths, fileCountByDir };
}

function childSessionScanned(
  parentFilePath: string,
  tool: ToolUsageRecord,
  child: ChildToolUsage,
  index: ScannedSessionIndex,
): boolean {
  if (child.sessionFile) {
    const explicit = isAbsolute(child.sessionFile)
      ? resolve(child.sessionFile)
      : resolve(dirname(parentFilePath), child.sessionFile);
    if (index.paths.has(explicit)) return true;
  }
  if (tool.runId) {
    const runDir = resolve(
      dirname(parentFilePath),
      basename(parentFilePath, ".jsonl"),
      tool.runId,
      `run-${child.resultIndex}`,
    );
    // The run directory holds exactly one session per child run, so either the
    // conventional name or a lone scanned file inside it identifies the child.
    if (index.paths.has(join(runDir, "session.jsonl"))) return true;
    if (index.fileCountByDir.get(runDir) === 1) return true;
  }
  return false;
}

/** Identity of one child slot of one tool entry, stable across copied history. */
function toolChildIdentity(tool: ToolUsageRecord, child: ChildToolUsage): string {
  const fingerprint = child.usage.input + child.usage.output + child.usage.cacheRead + child.usage.cacheWrite;
  return `${tool.sourceId}:${tool.timestamp}:${child.resultIndex}:${fingerprint}`;
}

function resolvedToolChildIdentities(states: Map<string, CachedFileState>, index: ScannedSessionIndex): Set<string> {
  const resolved = new Set<string>();
  for (const [filePath, state] of states) {
    for (const tool of state.parsed.toolUsages) {
      if (!tool.sourceId) continue;
      for (const child of tool.children) {
        if (childSessionScanned(filePath, tool, child, index)) resolved.add(toolChildIdentity(tool, child));
      }
    }
  }
  return resolved;
}

function toolUsageMessages(
  parentFilePath: string,
  tool: ToolUsageRecord,
  index: ScannedSessionIndex,
  resolvedChildren: Set<string>,
): SessionMessage[] {
  const scanned = (child: ChildToolUsage) =>
    childSessionScanned(parentFilePath, tool, child, index) ||
    (tool.sourceId !== "" && resolvedChildren.has(toolChildIdentity(tool, child)));
  if (tool.reportedUsage) {
    if (tool.children.length > 0 && tool.children.every(scanned)) return [];
    return [auxiliaryMessage(tool.reportedUsage, tool.timestamp, tool.sourceId)];
  }
  // Before Pi 0.81, recognised nested-agent tools persisted per-child usage in
  // details only. Count just the children whose sessions this scan cannot see.
  return tool.children
    .filter((child) => !scanned(child))
    .map((child) =>
      auxiliaryMessage(child.usage, tool.timestamp, tool.sourceId ? `${tool.sourceId}:child:${child.resultIndex}` : ""),
    );
}
// =============================================================================
// Collection orchestration
// =============================================================================

const STAT_CONCURRENCY = 16;
const DEFAULT_PARSE_CONCURRENCY = 4;
const AGGREGATE_YIELD_EVERY_FILES = 200;

export interface CollectProgress {
  /** Why this pass needs to parse files. */
  mode: "first-run" | "rebuild" | "update";
  /** Session files that need parsing this pass (0 = fully warm). */
  filesToParse: number;
  /** Files parsed so far; reported in coarse increments. */
  filesParsed: number;
  /** Newest session activity already ingested (ms since epoch); null when starting fresh. */
  sinceMs: number | null;
}

export interface CollectUsageOptions {
  signal?: AbortSignal;
  /** Called once before parsing begins and periodically while files are parsed. */
  onProgress?: (progress: CollectProgress) => void;
  /** Defaults to `<agentDir>/sessions`. */
  sessionsDir?: string;
  /** Defaults to `<agentDir>/usage-extension-cache.json`. Pass `null` to disable the on-disk cache. */
  cachePath?: string | null;
  /** Reference time for period bucketing. Defaults to `new Date()`. */
  now?: Date;
  parseConcurrency?: number;
}

export async function collectUsageData(options: CollectUsageOptions = {}): Promise<UsageData | null> {
  const signal = options.signal;
  const now = options.now ?? new Date();
  const sessionsDir = options.sessionsDir ?? getSessionsDir();
  const cachePath = options.cachePath === undefined ? getDefaultCachePath() : options.cachePath;
  const parseConcurrency = Math.max(1, options.parseConcurrency ?? DEFAULT_PARSE_CONCURRENCY);

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();

  // Start of current week (Monday 00:00)
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, ...
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  const weekStartMs = startOfWeek.getTime();

  // Start of last week (previous Monday 00:00)
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const lastWeekStartMs = startOfLastWeek.getTime();

  // Rolling 30-day window: the last 30 calendar days including today,
  // i.e. from midnight 29 days before today. setDate handles DST correctly.
  const startOfLast30Days = new Date(startOfToday);
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 29);
  const last30DaysStartMs = startOfLast30Days.getTime();

  // 1. Discover session files.
  const filePaths = await getAllSessionFiles(sessionsDir, signal);
  if (signal?.aborted) return null;

  // 2. Stat them (batched) so cache freshness can be checked without reading contents.
  const fileStats = new Map<string, { size: number; mtimeMs: number }>();
  {
    let next = 0;
    await Promise.all(
      Array.from({ length: STAT_CONCURRENCY }, async () => {
        while (next < filePaths.length) {
          if (signal?.aborted) return;
          const filePath = filePaths[next++]!;
          try {
            const st = await stat(filePath);
            fileStats.set(filePath, { size: st.size, mtimeMs: st.mtimeMs });
          } catch {
            // File vanished between listing and stat — skip it.
          }
        }
      }),
    );
  }
  if (signal?.aborted) return null;

  // 3. Load the cache and decide which files actually need parsing.
  let cacheFileExists = false;
  if (cachePath) {
    try {
      await stat(cachePath);
      cacheFileExists = true;
    } catch {
      // No cache file yet — first run.
    }
  }
  const previous = cachePath ? await loadUsageCache(cachePath) : new Map<string, CachedFileState>();
  if (signal?.aborted) return null;
  const current = new Map<string, CachedFileState>();
  const toParse: string[] = [];
  for (const filePath of filePaths) {
    const st = fileStats.get(filePath);
    if (!st) continue;
    const cached = previous.get(filePath);
    if (cached && cached.size === st.size && cached.mtimeMs === st.mtimeMs) {
      current.set(filePath, cached);
    } else {
      toParse.push(filePath);
    }
  }
  let dirty = toParse.length > 0;
  if (!dirty) {
    for (const filePath of previous.keys()) {
      if (!fileStats.has(filePath)) {
        dirty = true; // A cached file was deleted — evict it by rewriting.
        break;
      }
    }
  }

  // Progress reporting: distinguish a true first run from a format-change
  // rebuild (cache file present but unusable) and a routine incremental update.
  const progressMode: CollectProgress["mode"] =
    previous.size > 0 ? "update" : cacheFileExists ? "rebuild" : "first-run";
  let sinceMs: number | null = null;
  if (progressMode === "update") {
    for (const state of previous.values()) {
      if (state.mtimeMs > (sinceMs ?? 0)) sinceMs = state.mtimeMs;
    }
  }
  let filesParsed = 0;
  const reportProgress = (): void => {
    options.onProgress?.({ mode: progressMode, filesToParse: toParse.length, filesParsed, sinceMs });
  };
  reportProgress();

  // 4. Parse new/changed files with bounded concurrency.
  {
    let next = 0;
    await Promise.all(
      Array.from({ length: parseConcurrency }, async () => {
        while (next < toParse.length) {
          if (signal?.aborted) return;
          const filePath = toParse[next++]!;
          const st = fileStats.get(filePath)!;
          let buffer: Buffer;
          try {
            buffer = await readFile(filePath);
          } catch {
            filesParsed++;
            continue; // File vanished — skip it.
          }
          const parsed = await parseSessionBuffer(buffer, signal);
          if (signal?.aborted) return; // Never cache a partial parse.
          current.set(filePath, { size: st.size, mtimeMs: st.mtimeMs, parsed });
          filesParsed++;
          if (filesParsed % PROGRESS_REPORT_EVERY === 0 || filesParsed === toParse.length) {
            reportProgress();
          }
        }
      }),
    );
  }

  if (signal?.aborted) {
    // Best effort: persist whatever finished so a cancelled cold build makes
    // the next attempt cheaper. Keep old entries for files not processed yet —
    // they are re-validated against size/mtime next run anyway.
    if (cachePath && dirty && current.size > 0) {
      const merged = new Map(previous);
      for (const [filePath, state] of current) merged.set(filePath, state);
      await saveUsageCache(cachePath, merged).catch(() => {});
    }
    return null;
  }

  // 5. Persist the refreshed cache (also evicts entries for deleted files).
  if (cachePath && dirty) {
    await saveUsageCache(cachePath, current).catch(() => {
      // Cache write failures must never break /usage.
    });
  }

  // 6. Aggregate in sorted path order with cross-file dedupe.
  const data = emptyUsageData({ todayMs, weekStartMs, lastWeekStartMs, last30DaysStartMs, nowMs: now.getTime() });
  const rawByPeriod: Record<TabName, PeriodRawData> = {
    today: emptyPeriodRawData(),
    thisWeek: emptyPeriodRawData(),
    lastWeek: emptyPeriodRawData(),
    last30Days: emptyPeriodRawData(),
    allTime: emptyPeriodRawData(),
  };
  const costByDayIdx = new Map<number, number>();
  const seenSessions = new Set<string>();
  const seenHashes = new Set<string>();
  const scannedSessions = buildScannedSessionIndex(current);
  const resolvedToolChildren = resolvedToolChildIdentities(current, scannedSessions);
  let processedFiles = 0;

  for (const filePath of filePaths) {
    const state = current.get(filePath);
    if (!state || !state.parsed.sessionId) continue;

    if (++processedFiles % AGGREGATE_YIELD_EVERY_FILES === 0) {
      await new Promise<void>((resolve) => setImmediate(resolve));
      if (signal?.aborted) return null;
    }

    // Deduplicate copied history across branched session files, computing
    // adjacency metadata (idle gaps, previous context) on the raw file order
    // so branch copies do not distort miss classification.
    const toolMessages = state.parsed.toolUsages.flatMap((tool) =>
      toolUsageMessages(filePath, tool, scannedSessions, resolvedToolChildren),
    );
    const rawMsgs = toolMessages.length > 0 ? [...state.parsed.messages, ...toolMessages] : state.parsed.messages;
    const deduped: SessionMessage[] = [];
    const meta: MessageMeta[] = [];
    let previousAssistant: SessionMessage | null = null;
    for (const m of rawMsgs) {
      // Auxiliary usage is interleaved with conversation entries, but it must
      // not become the "previous message" for cache-miss classification.
      const prev = m.source === "assistant" ? previousAssistant : null;
      if (m.source === "assistant") previousAssistant = m;

      // Pi entry ids survive copied branch history and distinguish parallel
      // tool results that happen to report identical usage in the same ms.
      // Messages with no real timestamp and no token usage (malformed/imported
      // files with unparseable fields) all degrade to the same hash
      // ("assistant:0:0"). Only dedupe when the hash actually identifies
      // something — otherwise every subsequent degenerate message across every
      // file would be silently dropped as a "duplicate" of the first one seen.
      const tokenFingerprint = m.input + m.output + m.cacheRead + m.cacheWrite;
      const hash =
        m.source === "auxiliary" && m.sourceId
          ? `auxiliary:${m.sourceId}:${m.timestamp}:${tokenFingerprint}`
          : `${m.source}:${m.timestamp}:${tokenFingerprint}`;
      const hasIdentifyingData = Boolean(m.sourceId) || m.timestamp > 0 || tokenFingerprint > 0;
      if (hasIdentifyingData) {
        if (seenHashes.has(hash)) continue;
        seenHashes.add(hash);
      }
      deduped.push(m);
      meta.push({
        gapMs: prev && prev.timestamp > 0 && m.timestamp > 0 ? m.timestamp - prev.timestamp : -1,
        prevCtx: prev ? prev.input + prev.cacheRead + prev.cacheWrite : 0,
        modelSwitched: prev !== null && (prev.provider !== m.provider || prev.model !== m.model),
        isSessionStart: false,
      });
    }
    if (deduped.length === 0) continue;
    const firstAssistantIndex = deduped.findIndex((m) => m.source === "assistant");
    if (firstAssistantIndex !== -1 && !seenSessions.has(state.parsed.sessionId)) {
      seenSessions.add(state.parsed.sessionId);
      meta[firstAssistantIndex]!.isSessionStart = true;
    }

    addMessagesToUsageData(
      data,
      state.parsed.sessionId,
      projectLabelFromCwd(state.parsed.cwd),
      deduped,
      meta,
      todayMs,
      weekStartMs,
      lastWeekStartMs,
      last30DaysStartMs,
      rawByPeriod,
      costByDayIdx,
    );
  }

  // Burn trend: last 7 calendar days vs the average weekly pace of the prior 28.
  let last7 = 0;
  let prior28 = 0;
  for (const [idx, c] of costByDayIdx) {
    if (idx >= -6) last7 += c;
    else if (idx >= -34) prior28 += c;
  }
  const trend: TrendInfo | null = prior28 > 0 ? { last7Cost: last7, priorWeeklyPace: prior28 / 4 } : null;

  for (const period of TAB_ORDER) {
    data[period].insights = computeInsights(rawByPeriod[period], trend);
  }

  return data;
}

// =============================================================================
// Insights
// =============================================================================

// Context tax (structure)
const CTX_TAX_THRESHOLD = 150_000;
const CTX_LOW_THRESHOLD = 100_000;
// Project mix (structure)
const PROJECT_TOP_COUNT = 3;
const PROJECT_MAX_DOMINANCE_PERCENT = 90;
// Reasoning share (structure)
const REASONING_MIN_PERCENT = 5;
// Burn trend (structure)
const TREND_HIGH_RATIO = 1.5;
const TREND_LOW_RATIO = 0.6;
// Cache-miss alarms
const TTL_GAP_MS = 5 * 60_000;
const MISS_MIN_PREV_CONTEXT = 20_000;
const MISS_MAX_CACHE_READ = 5_000;
/** pi's built-in test providers never send anything to a real API. */
const EXCLUDED_PROVIDERS = new Set(["faux-provider", "fake-provider"]);

const CACHE_MISS_ALARM_PERCENT = 2;
const CACHE_MISS_ALARM_MIN_COST = 1;
// Concentration / upfront alarms
const TOP_SESSION_COUNT = 5;
const CONCENTRATION_ALARM_PERCENT = 35;
const UPFRONT_ALARM_PERCENT = 8;
// Cache-leverage alarm
const LEVERAGE_FLOOR = 5;
const LEVERAGE_MIN_COST = 5;
const LEVERAGE_MIN_FRESH_TOKENS = 1_000_000;

function fmtMoney(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  if (v >= 100) return `$${Math.round(v)}`;
  return `$${v.toFixed(2)}`;
}

function fmtPercent(p: number): string {
  return p >= 10 ? `${Math.round(p)}%` : `${p.toFixed(1)}%`;
}

/**
 * Insights come in two kinds:
 * - structure: always-on decomposition of where the period's cost went.
 * - alarm: fires only when a wasteful pattern is material for the period, so
 *   an all-clear period shows a calm panel instead of a wall of 2% factoids.
 * Periods with zero recorded cost produce an empty list — the UI renders a
 * distinct empty-state for that case.
 */
function computeInsights(raw: PeriodRawData, trend: TrendInfo | null): PeriodInsights {
  if (raw.totalCost <= 0) {
    return { insights: [] };
  }
  const total = raw.totalCost;
  const assistantTotal = raw.assistantCost;
  const assistantPctLabel = raw.auxiliaryCost > 0 ? "assistant-message cost" : "this period";
  const insights: Insight[] = [];

  // --- Alarms (listed first) ---

  const ttlPct = assistantTotal > 0 ? (raw.ttlMissCost / assistantTotal) * 100 : 0;
  if (ttlPct >= CACHE_MISS_ALARM_PERCENT && raw.ttlMissCost >= CACHE_MISS_ALARM_MIN_COST) {
    insights.push({
      kind: "alarm",
      stat: fmtMoney(raw.ttlMissCost),
      headline: `spent resuming conversations after a break (${fmtPercent(ttlPct)} of ${assistantPctLabel})`,
      advice:
        "Sent context is only reusable for a few minutes. After a longer pause, the next message pays to send the whole conversation again. Replying while a session is fresh avoids this.",
    });
  }

  const switchPct = assistantTotal > 0 ? (raw.modelSwitchMissCost / assistantTotal) * 100 : 0;
  if (switchPct >= CACHE_MISS_ALARM_PERCENT && raw.modelSwitchMissCost >= CACHE_MISS_ALARM_MIN_COST) {
    insights.push({
      kind: "alarm",
      stat: fmtMoney(raw.modelSwitchMissCost),
      headline: `spent switching models mid-conversation (${fmtPercent(switchPct)} of ${assistantPctLabel})`,
      advice:
        "Changing model re-sends the whole conversation at full price — the previous model's saved context doesn't transfer. Switching between tasks instead of mid-conversation avoids this.",
    });
  }

  const prefixPct = assistantTotal > 0 ? (raw.prefixMissCost / assistantTotal) * 100 : 0;
  if (prefixPct >= CACHE_MISS_ALARM_PERCENT && raw.prefixMissCost >= CACHE_MISS_ALARM_MIN_COST) {
    insights.push({
      kind: "alarm",
      stat: fmtMoney(raw.prefixMissCost),
      headline: `spent re-sending conversations mid-session (${fmtPercent(prefixPct)} of ${assistantPctLabel})`,
      advice:
        "These messages paid full price for context that had already been sent — with no break, compaction, or model switch to explain it. Usually a tool or workflow is restarting or rewriting conversations. Worth a look if it stays high.",
    });
  }

  if (raw.sessionCosts.size > TOP_SESSION_COUNT) {
    const sortedSessions = Array.from(raw.sessionCosts.values()).sort((a, b) => b - a);
    const topWeight = sortedSessions.slice(0, TOP_SESSION_COUNT).reduce((sum, c) => sum + c, 0);
    const topPct = (topWeight / total) * 100;
    if (topPct >= CONCENTRATION_ALARM_PERCENT) {
      insights.push({
        kind: "alarm",
        stat: fmtMoney(topWeight),
        headline: `came from just ${TOP_SESSION_COUNT} of your ${raw.sessionCosts.size} sessions (${fmtPercent(topPct)} of this period)`,
        advice: "A handful of sessions drove most of the spend. The graph view can show what they were doing.",
      });
    }
  }

  const upfrontPct = assistantTotal > 0 ? (raw.upfrontCost / assistantTotal) * 100 : 0;
  if (upfrontPct >= UPFRONT_ALARM_PERCENT) {
    insights.push({
      kind: "alarm",
      stat: fmtMoney(raw.upfrontCost),
      headline: `spent on the opening message of new sessions (${fmtPercent(upfrontPct)} of ${assistantPctLabel})`,
      advice: "A session's first message sends everything from scratch. Fewer, longer sessions cut this overhead.",
    });
  }

  if (assistantTotal >= LEVERAGE_MIN_COST && raw.freshTokens >= LEVERAGE_MIN_FRESH_TOKENS) {
    const leverage = raw.cacheReadTokens / raw.freshTokens;
    if (leverage < LEVERAGE_FLOOR) {
      insights.push({
        kind: "alarm",
        stat: `${leverage.toFixed(1)}×`,
        headline: "tokens reused from history for every token paid at full price",
        advice:
          "Typical interactive use reuses 10× or more. A low number means conversations keep being sent from scratch — look for workflows that restart sessions.",
      });
    }
  }

  // --- Structure (always-on) ---

  if (raw.auxiliaryCost > 0) {
    const pct = (raw.auxiliaryCost / total) * 100;
    if (pct >= 1) {
      insights.push({
        kind: "structure",
        stat: fmtPercent(pct),
        headline: "of your cost came from usage reported by tools and conversation summaries",
        advice: "Pi records this separately because it cannot be attributed reliably to a specific provider and model.",
      });
    }
  }

  if (raw.ctxHigh.messages > 0 && assistantTotal > 0) {
    const pct = (raw.ctxHigh.cost / assistantTotal) * 100;
    if (pct >= 1) {
      const avgHigh = raw.ctxHigh.cost / raw.ctxHigh.messages;
      const avgLow = raw.ctxLow.messages > 0 ? raw.ctxLow.cost / raw.ctxLow.messages : 0;
      const cmp =
        avgLow > 0
          ? ` — ${fmtMoney(avgHigh)}/msg vs ${fmtMoney(avgLow)} under ${formatThresholdTokens(CTX_LOW_THRESHOLD)}`
          : "";
      insights.push({
        kind: "structure",
        stat: fmtPercent(pct),
        headline: `of your ${raw.auxiliaryCost > 0 ? "assistant-message cost" : "cost"} came from messages with ≥${formatThresholdTokens(CTX_TAX_THRESHOLD)} tokens loaded${cmp}`,
        advice: "Long conversations cost more per message. /compact mid-task and /clear between tasks keep them lean.",
      });
    }
  }

  if (raw.projectCosts.size >= 2) {
    const top = [...raw.projectCosts.entries()].sort((a, b) => b[1] - a[1]).slice(0, PROJECT_TOP_COUNT);
    const topPct = (top[0]![1] / total) * 100;
    if (topPct < PROJECT_MAX_DOMINANCE_PERCENT) {
      const rest = top
        .slice(1)
        .map(([label, c]) => `${label} ${fmtPercent((c / total) * 100)}`)
        .join(", ");
      insights.push({
        kind: "structure",
        stat: fmtPercent(topPct),
        headline: `of your cost was ${top[0]![0]}${rest ? ` — then ${rest}` : ""}`,
        advice: "",
      });
    }
  }

  if (raw.outputTokens > 0) {
    const reasoningPct = (raw.reasoningTokens / raw.outputTokens) * 100;
    if (reasoningPct >= REASONING_MIN_PERCENT) {
      insights.push({
        kind: "structure",
        stat: fmtPercent(reasoningPct),
        headline: "of your output tokens were hidden reasoning",
        advice:
          "Models charge for their behind-the-scenes thinking as output tokens. pi records this only from 0.80.3 (June 2026), so older periods understate it.",
      });
    }
  }

  if (trend && trend.priorWeeklyPace > 0) {
    const ratio = trend.last7Cost / trend.priorWeeklyPace;
    const advice =
      ratio >= TREND_HIGH_RATIO
        ? "Spending is up against your own baseline — the graph view shows what changed."
        : ratio <= TREND_LOW_RATIO
          ? "Spending is well below your recent baseline."
          : "";
    insights.push({
      kind: "structure",
      stat: `${ratio.toFixed(1)}×`,
      headline: `your last 7 days (${fmtMoney(trend.last7Cost)}) vs your prior 4-week pace (${fmtMoney(trend.priorWeeklyPace)}/wk)`,
      advice,
    });
  }

  return { insights };
}

function formatThresholdTokens(n: number): string {
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  if (n >= 1_000) return `${n / 1_000}k`;
  return String(n);
}
