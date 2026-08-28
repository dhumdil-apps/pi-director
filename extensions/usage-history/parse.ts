/** Session JSONL discovery and buffer parsing. */

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { ChildToolUsage, ParsedSessionFile, SessionMessage, ToolUsageRecord, UsageAmount } from "./types";
import { AUXILIARY_MODEL, AUXILIARY_PROVIDER, AUXILIARY_THINKING_LEVEL } from "./types";

async function collectSessionFilesRecursively(dir: string, files: string[], signal?: AbortSignal): Promise<void> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (signal?.aborted) return;
      const entryPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await collectSessionFilesRecursively(entryPath, files, signal);
      } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
        files.push(entryPath);
      }
    }
  } catch {
    // Skip directories we can't read
  }
}

export async function getAllSessionFiles(sessionsDir: string, signal?: AbortSignal): Promise<string[]> {
  const files: string[] = [];
  await collectSessionFilesRecursively(sessionsDir, files, signal);
  files.sort();
  return files;
}

// =============================================================================
// Session file parsing
// =============================================================================

const NEWLINE = 0x0a;

// Relevance patterns for the buffer-level pre-filter. Pi writes compact JSON
// (`"role":"assistant"`), but imported/third-party session files have been seen
// with Python-style spaced JSON (`"role": "assistant"`), so both are matched.
// False positives (e.g. a tool result quoting one of these strings verbatim)
// only cost a wasted JSON.parse — the parsed entry is still shape-checked.
const PATTERN_ASSISTANT_COMPACT = Buffer.from('"role":"assistant"');
const PATTERN_ASSISTANT_SPACED = Buffer.from('"role": "assistant"');
const PATTERN_TOOL_RESULT_COMPACT = Buffer.from('"role":"toolResult"');
const PATTERN_TOOL_RESULT_SPACED = Buffer.from('"role": "toolResult"');
const PATTERN_USAGE_COMPACT = Buffer.from('"usage":{');
const PATTERN_USAGE_SPACED = Buffer.from('"usage": {');
const PATTERN_SESSION_COMPACT = Buffer.from('"type":"session"');
const PATTERN_SESSION_SPACED = Buffer.from('"type": "session"');
const PATTERN_THINKING_COMPACT = Buffer.from('"type":"thinking_level_change"');
const PATTERN_THINKING_SPACED = Buffer.from('"type": "thinking_level_change"');
const PATTERN_COMPACTION_COMPACT = Buffer.from('"type":"compaction"');
const PATTERN_COMPACTION_SPACED = Buffer.from('"type": "compaction"');
const PATTERN_BRANCH_SUMMARY_COMPACT = Buffer.from('"type":"branch_summary"');
const PATTERN_BRANCH_SUMMARY_SPACED = Buffer.from('"type": "branch_summary"');
// pi-subagents versions predating Pi 0.81 persisted child usage in details but
// could not put it on the canonical tool-result usage field. Their tool names
// are near the start of the line, so we can recover those records without
// scanning every multi-megabyte tool result.
const PATTERN_SUBAGENT_TOOL_COMPACT = Buffer.from('"toolName":"subagent"');
const PATTERN_SUBAGENT_TOOL_SPACED = Buffer.from('"toolName": "subagent"');
const PATTERN_SUBAGENT_WAIT_TOOL_COMPACT = Buffer.from('"toolName":"subagent_wait"');
const PATTERN_SUBAGENT_WAIT_TOOL_SPACED = Buffer.from('"toolName": "subagent_wait"');

const PARSE_YIELD_EVERY_LINES = 2000;

function finiteNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function parseUsageAmount(value: unknown): UsageAmount | null {
  if (!value || typeof value !== "object") return null;
  const persisted = value as Record<string, unknown>;
  const costValue = persisted.cost;
  const cost =
    typeof costValue === "number"
      ? finiteNumber(costValue)
      : costValue && typeof costValue === "object"
        ? finiteNumber((costValue as Record<string, unknown>).total)
        : 0;
  const usage = {
    cost,
    input: finiteNumber(persisted.input),
    output: finiteNumber(persisted.output),
    cacheRead: finiteNumber(persisted.cacheRead),
    cacheWrite: finiteNumber(persisted.cacheWrite),
    reasoning: finiteNumber(persisted.reasoning),
  };
  return usage.cost === 0 && usage.input === 0 && usage.output === 0 && usage.cacheRead === 0 && usage.cacheWrite === 0
    ? null
    : usage;
}

function parsedTimestamp(messageTimestamp: unknown, entryTimestamp: unknown): number {
  const parsed =
    typeof messageTimestamp === "number"
      ? messageTimestamp
      : new Date(String(messageTimestamp ?? entryTimestamp ?? "")).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

export function auxiliaryMessage(usage: UsageAmount, timestamp: number, sourceId: string): SessionMessage {
  return {
    provider: AUXILIARY_PROVIDER,
    model: AUXILIARY_MODEL,
    thinkingLevel: AUXILIARY_THINKING_LEVEL,
    source: "auxiliary",
    sourceId,
    ...usage,
    timestamp,
    afterCompaction: false,
  };
}

function buildToolUsageRecord(
  toolName: unknown,
  detailsValue: unknown,
  reportedValue: unknown,
  sourceIdValue: unknown,
  messageTimestamp: unknown,
  entryTimestamp: unknown,
): ToolUsageRecord | null {
  const reportedUsage = parseUsageAmount(reportedValue);
  const details = detailsValue && typeof detailsValue === "object" ? (detailsValue as Record<string, unknown>) : null;
  const totalChildUsage = parseUsageAmount(details?.totalChildUsage);
  const knownNestedTool = toolName === "subagent" || toolName === "subagent_wait";
  const children: ChildToolUsage[] = [];
  if (details && Array.isArray(details.results)) {
    for (let resultIndex = 0; resultIndex < details.results.length; resultIndex++) {
      const result = details.results[resultIndex];
      if (!result || typeof result !== "object") continue;
      const child = result as Record<string, unknown>;
      const usage = parseUsageAmount(child.usage);
      const sessionFile = typeof child.sessionFile === "string" ? child.sessionFile : "";
      // Legacy fallback is deliberately restricted to recognised nested-agent
      // records. Generic Pi 0.81 tools remain canonical through reportedUsage.
      if (usage && (knownNestedTool || totalChildUsage || (reportedUsage && sessionFile))) {
        children.push({ resultIndex, sessionFile, usage });
      }
    }
  }
  if (!reportedUsage && children.length === 0) return null;
  return {
    sourceId: typeof sourceIdValue === "string" ? sourceIdValue : "",
    timestamp: parsedTimestamp(messageTimestamp, entryTimestamp),
    reportedUsage,
    runId: details && typeof details.runId === "string" ? details.runId : "",
    children,
  };
}

const LARGE_TOOL_RESULT_BYTES = 64 * 1024;
const PROPERTY_ID = Buffer.from('"id":');
const PROPERTY_TIMESTAMP = Buffer.from('"timestamp":');
const PROPERTY_MESSAGE = Buffer.from('"message":');
const PROPERTY_TOOL_NAME = Buffer.from('"toolName":');
const PROPERTY_DETAILS = Buffer.from('"details":');
const PROPERTY_USAGE = Buffer.from('"usage":');
const DIRECT_CHILD_PROPERTIES = new Set(["usage", "sessionFile"]);

function skipJsonWhitespace(buffer: Buffer, offset: number, limit: number): number {
  while (
    offset < limit &&
    (buffer[offset] === 0x20 || buffer[offset] === 0x09 || buffer[offset] === 0x0a || buffer[offset] === 0x0d)
  )
    offset++;
  return offset;
}

/** Find one JSON value's end without decoding large strings or container bodies. */
function jsonValueEnd(buffer: Buffer, offset: number, limit: number): number {
  offset = skipJsonWhitespace(buffer, offset, limit);
  if (offset >= limit) return offset;
  const first = buffer[offset];
  if (first === 0x22) {
    let escaped = false;
    for (let i = offset + 1; i < limit; i++) {
      const byte = buffer[i];
      if (escaped) escaped = false;
      else if (byte === 0x5c) escaped = true;
      else if (byte === 0x22) return i + 1;
    }
    return limit;
  }
  if (first === 0x7b || first === 0x5b) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = offset; i < limit; i++) {
      const byte = buffer[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (byte === 0x5c) escaped = true;
        else if (byte === 0x22) inString = false;
        continue;
      }
      if (byte === 0x22) inString = true;
      else if (byte === 0x7b || byte === 0x5b) depth++;
      else if (byte === 0x7d || byte === 0x5d) {
        depth--;
        if (depth === 0) return i + 1;
      }
    }
    return limit;
  }
  let end = offset;
  while (end < limit && buffer[end] !== 0x2c && buffer[end] !== 0x5d && buffer[end] !== 0x7d) end++;
  return end;
}

function parseJsonValueAt(buffer: Buffer, offset: number, limit: number): unknown {
  const start = skipJsonWhitespace(buffer, offset, limit);
  const end = jsonValueEnd(buffer, start, limit);
  if (end <= start) return undefined;
  try {
    return JSON.parse(buffer.toString("utf8", start, end));
  } catch {
    return undefined;
  }
}

function parsePropertyValue(buffer: Buffer, property: Buffer, from: number, to: number): unknown {
  const propertyOffset = buffer.indexOf(property, from);
  if (propertyOffset < 0 || propertyOffset >= to) return undefined;
  return parseJsonValueAt(buffer, propertyOffset + property.length, to);
}

function parseLastPropertyValue(buffer: Buffer, property: Buffer, from: number, to: number): unknown {
  const propertyOffset = buffer.lastIndexOf(property, to - 1);
  if (propertyOffset < from) return undefined;
  return parseJsonValueAt(buffer, propertyOffset + property.length, to);
}

interface DirectObjectScan {
  end: number;
  values: Map<string, [start: number, end: number]>;
}

/** Scan direct object properties while skipping nested values allocation-free. */
function scanDirectObjectProperties(
  buffer: Buffer,
  objectStart: number,
  limit: number,
  wanted: Set<string>,
): DirectObjectScan {
  const values = new Map<string, [number, number]>();
  let cursor = objectStart + 1;
  while (cursor < limit) {
    cursor = skipJsonWhitespace(buffer, cursor, limit);
    if (buffer[cursor] === 0x7d) return { end: cursor + 1, values };
    if (buffer[cursor] === 0x2c) {
      cursor++;
      continue;
    }
    if (buffer[cursor] !== 0x22) return { end: jsonValueEnd(buffer, objectStart, limit), values };
    const keyEnd = jsonValueEnd(buffer, cursor, limit);
    let colon = skipJsonWhitespace(buffer, keyEnd, limit);
    if (buffer[colon] !== 0x3a) return { end: jsonValueEnd(buffer, objectStart, limit), values };
    const valueStart = skipJsonWhitespace(buffer, colon + 1, limit);
    const valueEnd = jsonValueEnd(buffer, valueStart, limit);
    const key = buffer.toString("utf8", cursor + 1, keyEnd - 1);
    if (wanted.has(key)) values.set(key, [valueStart, valueEnd]);
    if (valueEnd <= valueStart) return { end: limit, values };
    cursor = valueEnd;
  }
  return { end: limit, values };
}

function parseJsonRange(buffer: Buffer, range: [number, number] | undefined): unknown {
  if (!range) return undefined;
  try {
    return JSON.parse(buffer.toString("utf8", range[0], range[1]));
  } catch {
    return undefined;
  }
}

interface ChildResultsScan {
  end: number;
  results: Array<Record<string, unknown>>;
}

function scanChildResults(buffer: Buffer, arrayStart: number, limit: number): ChildResultsScan {
  const results: Array<Record<string, unknown>> = [];
  let cursor = arrayStart + 1;
  while (cursor < limit) {
    cursor = skipJsonWhitespace(buffer, cursor, limit);
    if (buffer[cursor] === 0x5d) return { end: cursor + 1, results };
    if (buffer[cursor] === 0x2c) {
      cursor++;
      continue;
    }
    if (buffer[cursor] === 0x7b) {
      const scanned = scanDirectObjectProperties(buffer, cursor, limit, DIRECT_CHILD_PROPERTIES);
      results.push({
        usage: parseJsonRange(buffer, scanned.values.get("usage")),
        sessionFile: parseJsonRange(buffer, scanned.values.get("sessionFile")),
      });
      if (scanned.end <= cursor) return { end: limit, results };
      cursor = scanned.end;
      continue;
    }
    const valueEnd = jsonValueEnd(buffer, cursor, limit);
    if (valueEnd <= cursor) return { end: limit, results };
    cursor = valueEnd;
  }
  return { end: limit, results };
}

interface LargeDetailsScan {
  end: number;
  details: Record<string, unknown>;
}

/** Scan nested-agent details and its result metadata in a single byte pass. */
function scanLargeDetails(buffer: Buffer, objectStart: number, limit: number): LargeDetailsScan {
  const details: Record<string, unknown> = { results: [] };
  let cursor = objectStart + 1;
  while (cursor < limit) {
    cursor = skipJsonWhitespace(buffer, cursor, limit);
    if (buffer[cursor] === 0x7d) return { end: cursor + 1, details };
    if (buffer[cursor] === 0x2c) {
      cursor++;
      continue;
    }
    if (buffer[cursor] !== 0x22) return { end: jsonValueEnd(buffer, objectStart, limit), details };
    const keyEnd = jsonValueEnd(buffer, cursor, limit);
    let colon = skipJsonWhitespace(buffer, keyEnd, limit);
    if (buffer[colon] !== 0x3a) return { end: jsonValueEnd(buffer, objectStart, limit), details };
    const valueStart = skipJsonWhitespace(buffer, colon + 1, limit);
    const key = buffer.toString("utf8", cursor + 1, keyEnd - 1);
    let valueEnd: number;
    if (key === "results" && buffer[valueStart] === 0x5b) {
      const scanned = scanChildResults(buffer, valueStart, limit);
      details.results = scanned.results;
      valueEnd = scanned.end;
    } else {
      valueEnd = jsonValueEnd(buffer, valueStart, limit);
      if (key === "runId" || key === "totalChildUsage") {
        details[key] = parseJsonRange(buffer, [valueStart, valueEnd]);
      }
    }
    if (valueEnd <= valueStart) return { end: limit, details };
    cursor = valueEnd;
  }
  return { end: limit, details };
}

/**
 * Parse only the small accounting fields from a large tool-result line. This
 * avoids UTF-8 decoding and JSON.parse allocation for multi-megabyte content.
 */
function parseLargeToolResultLine(line: Buffer): ToolUsageRecord | null {
  const messageOffset = line.indexOf(PROPERTY_MESSAGE);
  if (messageOffset < 0) return null;
  const detailsOffset = line.indexOf(PROPERTY_DETAILS, messageOffset);
  let detailsEnd = -1;
  let details: Record<string, unknown> | null = null;
  if (detailsOffset >= 0) {
    const detailsStart = skipJsonWhitespace(line, detailsOffset + PROPERTY_DETAILS.length, line.length);
    if (line[detailsStart] === 0x7b) {
      const scanned = scanLargeDetails(line, detailsStart, line.length);
      detailsEnd = scanned.end;
      details = scanned.details;
    }
  }

  const reportedUsage =
    detailsEnd >= 0
      ? parsePropertyValue(line, PROPERTY_USAGE, detailsEnd, line.length)
      : parseLastPropertyValue(line, PROPERTY_USAGE, messageOffset, line.length);
  const sourceId = parsePropertyValue(line, PROPERTY_ID, 0, messageOffset);
  const entryTimestamp = parsePropertyValue(line, PROPERTY_TIMESTAMP, 0, messageOffset);
  const messageTimestamp = parseLastPropertyValue(line, PROPERTY_TIMESTAMP, messageOffset, line.length);
  const toolName = parsePropertyValue(
    line,
    PROPERTY_TOOL_NAME,
    messageOffset,
    detailsOffset >= 0 ? detailsOffset : line.length,
  );
  return buildToolUsageRecord(toolName, details, reportedUsage, sourceId, messageTimestamp, entryTimestamp);
}

function lineMightBeRelevant(line: Buffer): boolean {
  // Entry type/role fields are at the front of Pi's JSONL objects. Restrict
  // those checks to a small prefix so multi-megabyte tool output is not scanned
  // repeatedly for every possible entry shape.
  const head = line.length > 1024 ? line.subarray(0, 1024) : line;
  if (head.includes(PATTERN_ASSISTANT_COMPACT) || head.includes(PATTERN_ASSISTANT_SPACED)) return true;

  if (head.includes(PATTERN_TOOL_RESULT_COMPACT) || head.includes(PATTERN_TOOL_RESULT_SPACED)) {
    if (
      head.includes(PATTERN_SUBAGENT_TOOL_COMPACT) ||
      head.includes(PATTERN_SUBAGENT_TOOL_SPACED) ||
      head.includes(PATTERN_SUBAGENT_WAIT_TOOL_COMPACT) ||
      head.includes(PATTERN_SUBAGENT_WAIT_TOOL_SPACED)
    ) {
      return true;
    }
    // Pi serializes optional tool usage after content/details and immediately
    // before the small isError/timestamp suffix. Checking the tail preserves
    // the fast path for ordinary tool results, which dominate session bytes.
    const tail = line.length > 4096 ? line.subarray(line.length - 4096) : line;
    return tail.includes(PATTERN_USAGE_COMPACT) || tail.includes(PATTERN_USAGE_SPACED);
  }

  return (
    head.includes(PATTERN_SESSION_COMPACT) ||
    head.includes(PATTERN_THINKING_COMPACT) ||
    head.includes(PATTERN_COMPACTION_COMPACT) ||
    head.includes(PATTERN_BRANCH_SUMMARY_COMPACT) ||
    head.includes(PATTERN_SESSION_SPACED) ||
    head.includes(PATTERN_THINKING_SPACED) ||
    head.includes(PATTERN_COMPACTION_SPACED) ||
    head.includes(PATTERN_BRANCH_SUMMARY_SPACED)
  );
}

/**
 * Extract the session id plus assistant/tool/summary usage from a JSONL buffer.
 * Returns partial results when aborted — callers must check `signal.aborted`
 * before caching or using the result.
 */
export async function parseSessionBuffer(buffer: Buffer, signal?: AbortSignal): Promise<ParsedSessionFile> {
  const messages: SessionMessage[] = [];
  const toolUsages: ToolUsageRecord[] = [];
  let sessionId = "";
  let cwd = "";
  // Assistant messages don't carry the thinking level; pi records it as separate
  // thinking_level_change entries, always written before the first assistant
  // message of a session. Replaying them in append order attributes each message
  // to the level active when it was produced.
  let thinkingLevel = "";
  let compactionPending = false;

  let start = 0;
  let lineNumber = 0;

  while (start < buffer.length) {
    let end = buffer.indexOf(NEWLINE, start);
    if (end === -1) end = buffer.length;

    lineNumber++;
    if (lineNumber % PARSE_YIELD_EVERY_LINES === 0) {
      await new Promise<void>((resolve) => setImmediate(resolve));
      if (signal?.aborted) return { sessionId, cwd, messages, toolUsages };
    }

    const lineBuffer = buffer.subarray(start, end);
    if (end > start && lineMightBeRelevant(lineBuffer)) {
      const head = lineBuffer.subarray(0, Math.min(1024, lineBuffer.length));
      if (lineBuffer.length > LARGE_TOOL_RESULT_BYTES && head.includes(PATTERN_TOOL_RESULT_COMPACT)) {
        const toolUsage = parseLargeToolResultLine(lineBuffer);
        if (toolUsage) toolUsages.push(toolUsage);
        start = end + 1;
        continue;
      }
      try {
        const entry = JSON.parse(buffer.toString("utf8", start, end));

        if (entry.type === "session") {
          sessionId = entry.id;
          if (typeof entry.cwd === "string") cwd = entry.cwd;
        } else if (entry.type === "thinking_level_change") {
          if (typeof entry.thinkingLevel === "string") thinkingLevel = entry.thinkingLevel;
        } else if (entry.type === "compaction") {
          const usage = parseUsageAmount(entry.usage);
          if (usage)
            messages.push(
              auxiliaryMessage(
                usage,
                parsedTimestamp(undefined, entry.timestamp),
                typeof entry.id === "string" ? entry.id : "",
              ),
            );
          compactionPending = true;
        } else if (entry.type === "branch_summary") {
          const usage = parseUsageAmount(entry.usage);
          if (usage)
            messages.push(
              auxiliaryMessage(
                usage,
                parsedTimestamp(undefined, entry.timestamp),
                typeof entry.id === "string" ? entry.id : "",
              ),
            );
        } else if (entry.type === "message" && entry.message?.role === "assistant") {
          const msg = entry.message;
          if (msg.usage && msg.provider && msg.model) {
            const fallbackTs = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
            messages.push({
              provider: msg.provider,
              model: msg.model,
              thinkingLevel,
              source: "assistant",
              sourceId: "",
              cost: msg.usage.cost?.total || 0,
              input: msg.usage.input || 0,
              output: msg.usage.output || 0,
              cacheRead: msg.usage.cacheRead || 0,
              cacheWrite: msg.usage.cacheWrite || 0,
              reasoning: msg.usage.reasoning || 0,
              timestamp: msg.timestamp || (Number.isNaN(fallbackTs) ? 0 : fallbackTs),
              afterCompaction: compactionPending,
            });
            compactionPending = false;
          }
        } else if (entry.type === "message" && entry.message?.role === "toolResult") {
          const msg = entry.message;
          const toolUsage = buildToolUsageRecord(
            msg.toolName,
            msg.details,
            msg.usage,
            entry.id,
            msg.timestamp,
            entry.timestamp,
          );
          if (toolUsage) toolUsages.push(toolUsage);
        }
      } catch {
        // Skip malformed lines
      }
    }

    start = end + 1;
  }

  return { sessionId, cwd, messages, toolUsages };
}
