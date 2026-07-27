/**
 * Project Memory
 *
 * Read-only startup detection for the user-owned project memory. The `/memory`
 * prompt owns every write; this extension only resolves the file, compares its
 * review marker with Git, and offers a non-blocking interactive notice.
 */

import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { isAbsolute, join, normalize, relative, resolve } from "node:path";
import { promisify } from "node:util";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const execFileAsync = promisify(execFile);
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
	| { kind: "current"; location: ProjectMemoryLocation; review: MemoryReview }
	| { kind: "stale"; location: ProjectMemoryLocation; review: MemoryReview }
	| { kind: "dirty"; location: ProjectMemoryLocation; review: MemoryReview }
	| { kind: "unreviewed"; location: ProjectMemoryLocation; reason: "memory-missing" | "marker-missing" }
	| { kind: "unknown"; location: ProjectMemoryLocation; review?: MemoryReview; reason: "git-unavailable" | "invalid-marker" | "unborn-repository" | "history-diverged" };

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
	if (!memoryPath && await readOptional(join(root, "MEMORY.md")) !== undefined) {
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

function splitZeroTerminated(value: string): string[] {
	return value.split("\0").filter(Boolean).map((path) => path.replaceAll("\\", "/"));
}

function relevantPaths(paths: string[], location: ProjectMemoryLocation): string[] {
	const ignored = new Set(["AGENTS.md", location.memoryRelativePath]);
	return paths.filter((path) => !ignored.has(path));
}

async function workingTreePaths(root: string): Promise<string[]> {
	const [unstaged, staged, untracked] = await Promise.all([
		git(root, ["diff", "--name-only", "-z"]),
		git(root, ["diff", "--cached", "--name-only", "-z"]),
		git(root, ["ls-files", "--others", "--exclude-standard", "-z"]),
	]);
	return splitZeroTerminated(`${unstaged}${staged}${untracked}`);
}

/** Classify whether project memory may lag the repository it describes. */
export async function inspectProjectMemory(cwd: string): Promise<ProjectMemoryStatus> {
	const location = await resolveProjectMemory(cwd);
	const contents = await readOptional(location.memoryPath);
	if (contents === undefined) return { kind: "unreviewed", location, reason: "memory-missing" };

	const review = parseMemoryReview(contents);
	if (!review) {
		return contents.includes(REVIEW_MARKER_PREFIX)
			? { kind: "unknown", location, reason: "invalid-marker" }
			: { kind: "unreviewed", location, reason: "marker-missing" };
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
		return { kind: "unknown", location, review, reason: "history-diverged" };
	}

	try {
		const dirty = relevantPaths(await workingTreePaths(location.root), location);
		if (dirty.length > 0) return { kind: "dirty", location, review };
		const committed = splitZeroTerminated(await git(location.root, ["diff", "--name-only", "-z", `${review.commit}..${head}`]));
		if (relevantPaths(committed, location).length > 0) return { kind: "stale", location, review };
		return { kind: "current", location, review };
	} catch {
		return { kind: "unknown", location, review, reason: "git-unavailable" };
	}
}

export function memoryStatusNotice(status: Exclude<ProjectMemoryStatus, { kind: "current" }>): string {
	switch (status.kind) {
		case "dirty":
			return "Project memory may lag uncommitted repository changes. Run /memory when you want to review it.";
		case "stale":
			return `Project memory was last reviewed at ${status.review.commit.slice(0, 8)}. Run /memory when you want to refresh it.`;
		case "unreviewed":
			return status.reason === "memory-missing"
				? "Project memory is not initialized. Run /memory when you want to build it."
				: "Project memory has no review marker. Run /memory when you want to audit it.";
		case "unknown":
			return "Project memory freshness could not be established from Git. Run /memory full when you want to audit it.";
	}
}

export default function createExtension(pi: ExtensionAPI): void {
	let notified = false;
	pi.on("session_start", async (_event, ctx) => {
		if (notified || !ctx.hasUI) return;
		const status = await inspectProjectMemory(ctx.cwd);
		if (status.kind === "current") return;
		notified = true;
		ctx.ui.notify(memoryStatusNotice(status), "warning");
	});
}
