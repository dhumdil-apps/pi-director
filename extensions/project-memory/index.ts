/**
 * Project Memory
 *
 * Advisory startup detection for the user-owned project memory. The `/init`
 * prompt owns the review marker; this module compares its commit cursor with
 * committed Git history and keeps reminder cooldown state outside the project.
 */

import { execFile } from "node:child_process";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { getAgentDir, type ExtensionAPI } from "@earendil-works/pi-coding-agent";

const execFileAsync = promisify(execFile);
const REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000;
const REVIEW_MARKER_PREFIX = "<!-- memory-review:";
const REVIEW_MARKER =
  /<!-- memory-review: commit=([0-9a-f]{40}) reviewed-at=(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z) -->/;
const DECLARED_MEMORY_PATH = /`([^`\n]*MEMORY\.md)`/g;

export interface MemoryReview {
  commit: string;
  reviewedAt: string;
}

export interface ProjectMemoryLocation {
  root: string;
  agentsPath: string;
  memoryPath: string;
  memoryRelativePath: string;
}

export type ProjectMemoryStatus =
  | {
      kind: "current";
      location: ProjectMemoryLocation;
      review: MemoryReview;
      head: string;
    }
  | {
      kind: "stale";
      location: ProjectMemoryLocation;
      review: MemoryReview;
      head: string;
      staleSince: string;
    }
  | {
      kind: "unreviewed";
      location: ProjectMemoryLocation;
      head?: string;
      reason: "memory-missing" | "marker-missing";
    }
  | {
      kind: "unknown";
      location: ProjectMemoryLocation;
      review?: MemoryReview;
      head?: string;
      reason: "git-unavailable" | "invalid-marker" | "unborn-repository" | "history-diverged";
    };

interface ReminderRecord {
  token: string;
  remindedAt: string;
}

type ReminderCache = Record<string, ReminderRecord>;

export interface ReminderOptions {
  now?: Date;
  cachePath?: string;
}

async function git(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
    timeout: 3000,
  });
  return stdout;
}

async function readOptional(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return undefined;
  }
}

async function readHead(root: string): Promise<string | undefined> {
  try {
    return (await git(root, ["rev-parse", "--verify", "HEAD"])).trim() || undefined;
  } catch {
    return undefined;
  }
}

function safeDeclaredPath(root: string, value: string): string | undefined {
  const cleaned = value.trim().replace(/^\.\//, "");
  if (!cleaned || cleaned.includes("<") || cleaned.includes(">")) return undefined;
  const absolute = isAbsolute(cleaned) ? normalize(cleaned) : resolve(root, cleaned);
  const withinRoot = relative(root, absolute);
  if (withinRoot.startsWith("..") || isAbsolute(withinRoot)) return undefined;
  return absolute;
}

/** Resolve one repository root and the memory file its root AGENTS.md names. */
export async function resolveProjectMemory(cwd: string): Promise<ProjectMemoryLocation> {
  let root = resolve(cwd);
  try {
    root = (await git(cwd, ["rev-parse", "--show-toplevel"])).trim();
  } catch {
    // A new non-Git project still gets a deterministic local default.
  }

  const agentsPath = join(root, "AGENTS.md");
  const agents = await readOptional(agentsPath);
  let memoryPath: string | undefined;
  if (agents) {
    for (const match of agents.matchAll(DECLARED_MEMORY_PATH)) {
      memoryPath = safeDeclaredPath(root, match[1]);
      if (memoryPath) break;
    }
  }
  if (!memoryPath && (await readOptional(join(root, "MEMORY.md"))) !== undefined) {
    memoryPath = join(root, "MEMORY.md");
  }
  memoryPath ??= join(root, ".pi", "MEMORY.md");

  return {
    root,
    agentsPath,
    memoryPath,
    memoryRelativePath: relative(root, memoryPath).replaceAll("\\", "/"),
  };
}

export function parseMemoryReview(contents: string): MemoryReview | undefined {
  const match = contents.match(REVIEW_MARKER);
  if (!match) return undefined;
  const reviewedAt = new Date(match[2]);
  if (Number.isNaN(reviewedAt.valueOf())) return undefined;
  return { commit: match[1], reviewedAt: match[2] };
}

function relevantHistoryPathspec(location: ProjectMemoryLocation): string[] {
  return [
    ".",
    ":(top,literal,exclude)AGENTS.md",
    ":(top,literal,exclude).pi/AGENTS.md",
    `:(top,literal,exclude)${location.memoryRelativePath}`,
    ":(top,glob,exclude).pi/plan/**",
  ];
}

async function oldestRelevantCommitAt(
  location: ProjectMemoryLocation,
  from: string,
  head: string,
): Promise<string | undefined> {
  const output = await git(location.root, [
    "log",
    "--reverse",
    "--format=%cI",
    `${from}..${head}`,
    "--",
    ...relevantHistoryPathspec(location),
  ]);
  return output
    .split("\n")
    .find((line) => line.trim().length > 0)
    ?.trim();
}

function reminderCachePath(): string {
  return join(getAgentDir(), "cache", "project-memory-reminders.json");
}

async function readReminderCache(path: string): Promise<ReminderCache> {
  try {
    const value = JSON.parse(await readFile(path, "utf8"));
    return value && typeof value === "object" && !Array.isArray(value) ? (value as ReminderCache) : {};
  } catch {
    return {};
  }
}

async function writeReminderCache(path: string, cache: ReminderCache): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
    await rename(temporaryPath, path);
  } finally {
    await rm(temporaryPath, { force: true }).catch(() => {});
  }
}

function reminderToken(status: Exclude<ProjectMemoryStatus, { kind: "current" }>): string {
  if (status.kind === "stale") return `stale:${status.head}`;
  if (status.kind === "unreviewed") return `unreviewed:${status.reason}:${status.head ?? "none"}`;
  return `unknown:${status.reason}:${status.head ?? status.review?.commit ?? "none"}`;
}

/** Classify whether project memory may lag the repository it describes. */
export async function inspectProjectMemory(cwd: string): Promise<ProjectMemoryStatus> {
  const location = await resolveProjectMemory(cwd);
  const contents = await readOptional(location.memoryPath);
  if (contents === undefined) {
    return {
      kind: "unreviewed",
      location,
      head: await readHead(location.root),
      reason: "memory-missing",
    };
  }

  const review = parseMemoryReview(contents);
  if (!review) {
    const head = await readHead(location.root);
    return contents.includes(REVIEW_MARKER_PREFIX)
      ? { kind: "unknown", location, head, reason: "invalid-marker" }
      : { kind: "unreviewed", location, head, reason: "marker-missing" };
  }

  try {
    if ((await git(location.root, ["rev-parse", "--is-inside-work-tree"])).trim() !== "true") {
      return { kind: "unknown", location, review, reason: "git-unavailable" };
    }
  } catch {
    return { kind: "unknown", location, review, reason: "git-unavailable" };
  }

  let head: string;
  try {
    head = (await git(location.root, ["rev-parse", "--verify", "HEAD"])).trim();
  } catch {
    return { kind: "unknown", location, review, reason: "unborn-repository" };
  }

  try {
    await git(location.root, ["merge-base", "--is-ancestor", review.commit, head]);
  } catch {
    return {
      kind: "unknown",
      location,
      review,
      head,
      reason: "history-diverged",
    };
  }

  try {
    const staleSince = await oldestRelevantCommitAt(location, review.commit, head);
    return staleSince
      ? { kind: "stale", location, review, head, staleSince }
      : { kind: "current", location, review, head };
  } catch {
    return {
      kind: "unknown",
      location,
      review,
      head,
      reason: "git-unavailable",
    };
  }
}

/**
 * Claim the advisory reminder for this repository. A relevant commit gets one
 * day of grace; unchanged stale state is silent after its first reminder.
 */
export async function claimProjectMemoryReminder(
  status: ProjectMemoryStatus,
  options: ReminderOptions = {},
): Promise<boolean> {
  const cachePath = options.cachePath ?? reminderCachePath();
  const cache = await readReminderCache(cachePath);
  const key = status.location.root;

  if (status.kind === "current") {
    if (cache[key]) {
      delete cache[key];
      await writeReminderCache(cachePath, cache).catch(() => {});
    }
    return false;
  }

  const now = options.now ?? new Date();
  if (status.kind === "stale") {
    const staleAt = new Date(status.staleSince).valueOf();
    const age = now.valueOf() - staleAt;
    if (Number.isFinite(staleAt) && age >= 0 && age < REMINDER_INTERVAL_MS) return false;
  }

  const token = reminderToken(status);
  const previous = cache[key];
  const previousAt = previous ? new Date(previous.remindedAt).valueOf() : Number.NaN;
  if (previous?.token === token) return false;
  if (Number.isFinite(previousAt) && now.valueOf() - previousAt < REMINDER_INTERVAL_MS) return false;

  cache[key] = { token, remindedAt: now.toISOString() };
  await writeReminderCache(cachePath, cache).catch(() => {});
  return true;
}

export function memoryStatusNotice(): string {
  return "Project memory may be stale. Run /init to refresh it.";
}

/**
 * Freshness inspection remains a package extension for its reusable API, while
 * Session Dashboard owns the single visible startup card.
 */
export default function createExtension(_pi: ExtensionAPI): void {
  void _pi;
}
