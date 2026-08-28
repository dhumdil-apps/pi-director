/** On-disk per-file usage cache. */

import { readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ChildToolUsage, ParsedSessionFile, SessionMessage, ToolUsageRecord, UsageAmount } from "./types";
import { AUXILIARY_MODEL, AUXILIARY_PROVIDER } from "./types";

const CACHE_VERSION = 5;

type CachedMessageTuple = [
  providerIdx: number,
  modelIdx: number,
  cost: number,
  input: number,
  output: number,
  cacheRead: number,
  cacheWrite: number,
  timestamp: number,
  thinkingLevelIdx: number,
  reasoning: number,
  afterCompaction: 0 | 1,
  auxiliary: 0 | 1,
  sourceIdIdx: number,
];

type CachedUsageTuple = [
  cost: number,
  input: number,
  output: number,
  cacheRead: number,
  cacheWrite: number,
  reasoning: number,
];

type CachedChildToolUsageTuple = [resultIndex: number, sessionFileIdx: number, usage: CachedUsageTuple];

type CachedToolUsageTuple = [
  sourceIdIdx: number,
  timestamp: number,
  reportedUsage: CachedUsageTuple | null,
  runIdIdx: number,
  children: CachedChildToolUsageTuple[],
];

interface CacheFileEntry {
  size: number;
  mtimeMs: number;
  sessionId: string;
  cwd: string;
  messages: CachedMessageTuple[];
  toolUsages: CachedToolUsageTuple[];
}

export interface CachedFileState {
  size: number;
  mtimeMs: number;
  parsed: ParsedSessionFile;
}

export async function loadUsageCache(cachePath: string): Promise<Map<string, CachedFileState>> {
  const result = new Map<string, CachedFileState>();
  let raw: { version?: unknown; names?: unknown; files?: unknown };
  try {
    raw = JSON.parse(await readFile(cachePath, "utf8"));
  } catch {
    return result; // Missing or corrupt cache — rebuild from scratch.
  }
  if (
    !raw ||
    raw.version !== CACHE_VERSION ||
    !Array.isArray(raw.names) ||
    typeof raw.files !== "object" ||
    raw.files === null
  ) {
    return result;
  }

  const names = raw.names as unknown[];
  for (const [filePath, entry] of Object.entries(raw.files as Record<string, CacheFileEntry>)) {
    if (
      !entry ||
      typeof entry.size !== "number" ||
      typeof entry.mtimeMs !== "number" ||
      typeof entry.sessionId !== "string" ||
      typeof entry.cwd !== "string" ||
      !Array.isArray(entry.messages) ||
      !Array.isArray(entry.toolUsages)
    ) {
      continue;
    }
    const messages: SessionMessage[] = [];
    let valid = true;
    for (const tuple of entry.messages) {
      if (!Array.isArray(tuple) || tuple.length !== 13) {
        valid = false;
        break;
      }
      const provider = names[tuple[0]];
      const model = names[tuple[1]];
      const thinkingLevel = names[tuple[8]];
      const sourceId = names[tuple[12]];
      if (
        typeof provider !== "string" ||
        typeof model !== "string" ||
        typeof thinkingLevel !== "string" ||
        typeof sourceId !== "string" ||
        (tuple[11] !== 0 && tuple[11] !== 1)
      ) {
        valid = false;
        break;
      }
      messages.push({
        provider,
        model,
        thinkingLevel,
        source: tuple[11] === 1 ? "auxiliary" : "assistant",
        sourceId,
        cost: Number(tuple[2]) || 0,
        input: Number(tuple[3]) || 0,
        output: Number(tuple[4]) || 0,
        cacheRead: Number(tuple[5]) || 0,
        cacheWrite: Number(tuple[6]) || 0,
        timestamp: Number(tuple[7]) || 0,
        reasoning: Number(tuple[9]) || 0,
        afterCompaction: tuple[10] === 1,
      });
    }
    if (!valid) continue;
    const toolUsages: ToolUsageRecord[] = [];
    for (const tuple of entry.toolUsages) {
      if (!Array.isArray(tuple) || tuple.length !== 5 || !Array.isArray(tuple[4])) {
        valid = false;
        break;
      }
      const sourceId = names[tuple[0]];
      const runId = names[tuple[3]];
      const reportedUsage = cachedUsageAmount(tuple[2]);
      if (typeof sourceId !== "string" || typeof runId !== "string" || (tuple[2] !== null && !reportedUsage)) {
        valid = false;
        break;
      }
      const children: ChildToolUsage[] = [];
      for (const childTuple of tuple[4]) {
        if (!Array.isArray(childTuple) || childTuple.length !== 3) {
          valid = false;
          break;
        }
        const sessionFile = names[childTuple[1]];
        const usage = cachedUsageAmount(childTuple[2]);
        if (typeof childTuple[0] !== "number" || typeof sessionFile !== "string" || !usage) {
          valid = false;
          break;
        }
        children.push({ resultIndex: childTuple[0], sessionFile, usage });
      }
      if (!valid) break;
      toolUsages.push({
        sourceId,
        timestamp: Number(tuple[1]) || 0,
        reportedUsage,
        runId,
        children,
      });
    }
    if (!valid) continue;
    result.set(filePath, {
      size: entry.size,
      mtimeMs: entry.mtimeMs,
      parsed: { sessionId: entry.sessionId, cwd: entry.cwd, messages, toolUsages },
    });
  }
  return result;
}

function cachedUsageAmount(value: unknown): UsageAmount | null {
  if (
    !Array.isArray(value) ||
    value.length !== 6 ||
    value.some((part) => typeof part !== "number" || !Number.isFinite(part))
  ) {
    return null;
  }
  return {
    cost: value[0],
    input: value[1],
    output: value[2],
    cacheRead: value[3],
    cacheWrite: value[4],
    reasoning: value[5],
  };
}

function cacheUsageAmount(usage: UsageAmount): CachedUsageTuple {
  return [usage.cost, usage.input, usage.output, usage.cacheRead, usage.cacheWrite, usage.reasoning];
}

export async function saveUsageCache(cachePath: string, states: Map<string, CachedFileState>): Promise<void> {
  const names: string[] = [];
  const nameIndex = new Map<string, number>();
  const intern = (name: string): number => {
    let idx = nameIndex.get(name);
    if (idx === undefined) {
      idx = names.length;
      names.push(name);
      nameIndex.set(name, idx);
    }
    return idx;
  };

  const files: Record<string, CacheFileEntry> = {};
  for (const [filePath, state] of states) {
    files[filePath] = {
      size: state.size,
      mtimeMs: state.mtimeMs,
      sessionId: state.parsed.sessionId,
      cwd: state.parsed.cwd,
      messages: state.parsed.messages.map((m): CachedMessageTuple => [
        intern(m.provider),
        intern(m.model),
        m.cost,
        m.input,
        m.output,
        m.cacheRead,
        m.cacheWrite,
        m.timestamp,
        intern(m.thinkingLevel),
        m.reasoning,
        m.afterCompaction ? 1 : 0,
        m.source === "auxiliary" ? 1 : 0,
        intern(m.source === "auxiliary" ? m.sourceId : ""),
      ]),
      toolUsages: state.parsed.toolUsages.map((tool): CachedToolUsageTuple => [
        intern(tool.sourceId),
        tool.timestamp,
        tool.reportedUsage ? cacheUsageAmount(tool.reportedUsage) : null,
        intern(tool.runId),
        tool.children.map((child): CachedChildToolUsageTuple => [
          child.resultIndex,
          intern(child.sessionFile),
          cacheUsageAmount(child.usage),
        ]),
      ]),
    };
  }

  const payload = JSON.stringify({ version: CACHE_VERSION, names, files });
  // Atomic-ish write: concurrent /usage runs race to a last-writer-wins rename
  // instead of interleaving partial writes.
  const tmpPath = join(dirname(cachePath), `.usage-cache-${process.pid}-${Date.now()}.tmp`);
  await writeFile(tmpPath, payload, "utf8");
  await rename(tmpPath, cachePath);
}
