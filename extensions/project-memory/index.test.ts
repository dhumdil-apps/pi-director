import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import createExtension, {
	claimProjectMemoryReminder,
	inspectProjectMemory,
	memoryStatusNotice,
	parseMemoryReview,
	resolveProjectMemory,
	type ProjectMemoryLocation,
	type ProjectMemoryStatus,
} from "./index.js";

const execFileAsync = promisify(execFile);
const roots: string[] = [];
const reviewedAt = "2026-07-26T12:00:00.000Z";

async function git(cwd: string, ...args: string[]): Promise<string> {
	const { stdout } = await execFileAsync("git", args, { cwd, encoding: "utf8" });
	return stdout.trim();
}

async function makeRoot(options: { commit?: boolean; memoryPath?: string } = {}): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), "pi-project-memory-"));
	roots.push(root);
	await git(root, "init", "-q", "-b", "main");
	await git(root, "config", "user.email", "memory@example.com");
	await git(root, "config", "user.name", "Memory Test");
	const memoryPath = options.memoryPath ?? "MEMORY.md";
	await writeFile(join(root, "AGENTS.md"), `# Agents\n\nProject memory is \`${memoryPath}\`.\n`);
	await writeFile(join(root, "app.ts"), "export const value = 1;\n");
	if (options.commit !== false) {
		await git(root, "add", "AGENTS.md", "app.ts");
		await git(root, "commit", "-q", "-m", "initial");
	}
	return root;
}

async function writeReview(root: string, commit?: string, memoryPath = "MEMORY.md"): Promise<void> {
	const target = join(root, memoryPath);
	await mkdir(dirname(target), { recursive: true });
	const reviewedCommit = commit ?? await git(root, "rev-parse", "HEAD");
	await writeFile(
		target,
		`# Project memory\n<!-- memory-review: commit=${reviewedCommit} reviewed-at=${reviewedAt} -->\n\n## Orientation\n\n## Quirks\n`,
	);
}

afterEach(async () => {
	await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("memory location and marker", () => {
	it("uses the concrete path declared by root AGENTS.md", async () => {
		const root = await makeRoot({ memoryPath: ".pi/MEMORY.md" });
		const nested = join(root, "nested");
		await mkdir(nested);
		const location = await resolveProjectMemory(nested);
		expect(location.root).toBe(await git(root, "rev-parse", "--show-toplevel"));
		expect(location.memoryRelativePath).toBe(".pi/MEMORY.md");
	});

	it("falls back to an existing root memory, then the .pi default", async () => {
		const withRootMemory = await makeRoot();
		await writeFile(join(withRootMemory, "AGENTS.md"), "# Agents\n");
		await writeFile(join(withRootMemory, "MEMORY.md"), "# Project memory\n");
		expect((await resolveProjectMemory(withRootMemory)).memoryRelativePath).toBe("MEMORY.md");

		const withoutMemory = await makeRoot();
		await writeFile(join(withoutMemory, "AGENTS.md"), "# Agents\n");
		expect((await resolveProjectMemory(withoutMemory)).memoryRelativePath).toBe(".pi/MEMORY.md");
	});

	it("accepts only the exact hidden review marker shape", () => {
		expect(parseMemoryReview(`<!-- memory-review: commit=${"a".repeat(40)} reviewed-at=${reviewedAt} -->`)).toEqual({
			commit: "a".repeat(40),
			reviewedAt,
		});
		expect(parseMemoryReview("<!-- memory-review: commit=short reviewed-at=today -->")).toBeUndefined();
	});
});

describe("freshness classification", () => {
	it("is current at the reviewed commit and after knowledge-only changes", async () => {
		const root = await makeRoot();
		await writeReview(root);
		expect((await inspectProjectMemory(root)).kind).toBe("current");
		await mkdir(join(root, ".pi"));
		await writeFile(join(root, ".pi", "AGENTS.md"), "# Pi-local extension\n");
		expect((await inspectProjectMemory(root)).kind).toBe("current");
		await git(root, "add", "MEMORY.md", ".pi/AGENTS.md");
		await git(root, "commit", "-q", "-m", "review memory");
		expect((await inspectProjectMemory(root)).kind).toBe("current");
	});

	it("is stale after a relevant commit", async () => {
		const root = await makeRoot();
		await writeReview(root);
		await writeFile(join(root, "app.ts"), "export const value = 2;\n");
		await git(root, "add", "app.ts", "MEMORY.md");
		await git(root, "commit", "-q", "-m", "change behavior");
		expect((await inspectProjectMemory(root)).kind).toBe("stale");
	});

	it("ignores staged, unstaged, and untracked work", async () => {
		const root = await makeRoot();
		await writeReview(root);
		await writeFile(join(root, "app.ts"), "export const value = 2;\n");
		await git(root, "add", "app.ts");
		await writeFile(join(root, "app.ts"), "export const value = 3;\n");
		await writeFile(join(root, "next.ts"), "export const next = true;\n");
		expect((await inspectProjectMemory(root)).kind).toBe("current");
	});

	it("is unreviewed when memory or its marker is missing", async () => {
		const root = await makeRoot();
		expect(await inspectProjectMemory(root)).toMatchObject({ kind: "unreviewed", reason: "memory-missing" });
		await writeFile(join(root, "MEMORY.md"), "# Project memory\n\n## Orientation\n\n## Quirks\n");
		expect(await inspectProjectMemory(root)).toMatchObject({ kind: "unreviewed", reason: "marker-missing" });
	});

	it("is unknown for invalid markers, diverged history, unborn repos, and non-Git directories", async () => {
		const invalid = await makeRoot();
		await writeFile(join(invalid, "MEMORY.md"), "# Project memory\n<!-- memory-review: broken -->\n");
		expect(await inspectProjectMemory(invalid)).toMatchObject({ kind: "unknown", reason: "invalid-marker" });

		const diverged = await makeRoot();
		await writeReview(diverged, "f".repeat(40));
		expect(await inspectProjectMemory(diverged)).toMatchObject({ kind: "unknown", reason: "history-diverged" });

		const unborn = await makeRoot({ commit: false });
		await writeReview(unborn, "a".repeat(40));
		expect(await inspectProjectMemory(unborn)).toMatchObject({ kind: "unknown", reason: "unborn-repository" });

		const nonGit = await mkdtemp(join(tmpdir(), "pi-project-memory-nongit-"));
		roots.push(nonGit);
		await writeFile(join(nonGit, "AGENTS.md"), "# Agents\n\nProject memory is `MEMORY.md`.\n");
		await writeReview(nonGit, "a".repeat(40));
		expect(await inspectProjectMemory(nonGit)).toMatchObject({ kind: "unknown", reason: "git-unavailable" });
	});
});

describe("reminder cadence", () => {
	function location(root: string): ProjectMemoryLocation {
		return {
			root,
			agentsPath: join(root, "AGENTS.md"),
			memoryPath: join(root, "MEMORY.md"),
			memoryRelativePath: "MEMORY.md",
		};
	}

	function stale(root: string, head: string, staleSince: string): ProjectMemoryStatus {
		return {
			kind: "stale",
			location: location(root),
			review: { commit: "a".repeat(40), reviewedAt },
			head,
			staleSince,
		};
	}

	it("gives the first relevant commit a 24-hour grace period", async () => {
		const root = await makeRoot();
		const cachePath = join(root, "reminders.json");
		const now = new Date("2026-07-27T12:00:00.000Z");
		expect(await claimProjectMemoryReminder(
			stale(root, "b".repeat(40), "2026-07-27T00:00:01.000Z"),
			{ now, cachePath },
		)).toBe(false);
		expect(await claimProjectMemoryReminder(
			stale(root, "b".repeat(40), "2026-07-26T11:59:59.000Z"),
			{ now, cachePath },
		)).toBe(true);
	});

	it("requires both a new HEAD and a 24-hour cooldown before reminding again", async () => {
		const root = await makeRoot();
		const cachePath = join(root, "reminders.json");
		const old = "2026-07-25T00:00:00.000Z";
		const first = new Date("2026-07-27T12:00:00.000Z");
		expect(await claimProjectMemoryReminder(stale(root, "b".repeat(40), old), { now: first, cachePath })).toBe(true);
		expect(await claimProjectMemoryReminder(stale(root, "b".repeat(40), old), {
			now: new Date("2026-07-29T12:00:00.000Z"), cachePath,
		})).toBe(false);
		expect(await claimProjectMemoryReminder(stale(root, "c".repeat(40), old), {
			now: new Date("2026-07-27T23:00:00.000Z"), cachePath,
		})).toBe(false);
		expect(await claimProjectMemoryReminder(stale(root, "c".repeat(40), old), {
			now: new Date("2026-07-28T12:00:01.000Z"), cachePath,
		})).toBe(true);
	});

	it("applies changed-HEAD cooldown to a missing marker too", async () => {
		const root = await makeRoot();
		const cachePath = join(root, "reminders.json");
		const first = new Date("2026-07-27T12:00:00.000Z");
		expect(await claimProjectMemoryReminder({
			kind: "unreviewed", location: location(root), head: "b".repeat(40), reason: "marker-missing",
		}, { now: first, cachePath })).toBe(true);
		expect(await claimProjectMemoryReminder({
			kind: "unreviewed", location: location(root), head: "c".repeat(40), reason: "marker-missing",
		}, { now: new Date("2026-07-27T23:00:00.000Z"), cachePath })).toBe(false);
		expect(await claimProjectMemoryReminder({
			kind: "unreviewed", location: location(root), head: "c".repeat(40), reason: "marker-missing",
		}, { now: new Date("2026-07-28T12:00:01.000Z"), cachePath })).toBe(true);
	});

	it("clears prior suppression after memory becomes current", async () => {
		const root = await makeRoot();
		const cachePath = join(root, "reminders.json");
		const now = new Date("2026-07-27T12:00:00.000Z");
		expect(await claimProjectMemoryReminder({
			kind: "unreviewed", location: location(root), reason: "marker-missing",
		}, { now, cachePath })).toBe(true);
		expect(await claimProjectMemoryReminder({
			kind: "current",
			location: location(root),
			review: { commit: "b".repeat(40), reviewedAt },
			head: "b".repeat(40),
		}, { now, cachePath })).toBe(false);
		expect(await claimProjectMemoryReminder({
			kind: "unreviewed", location: location(root), reason: "marker-missing",
		}, { now: new Date("2026-07-27T12:01:00.000Z"), cachePath })).toBe(true);
	});
});

describe("startup ownership and command prompt", () => {
	it("does not register a standalone startup notification", () => {
		const pi = { on: vi.fn() };
		createExtension(pi as never);
		expect(pi.on).not.toHaveBeenCalled();
	});

	it("documents every audit branch and instruction layer in the /init template", async () => {
		const promptPath = fileURLToPath(new URL("../../prompts/init.md", import.meta.url));
		const prompt = await readFile(promptPath, "utf8");
		for (const phrase of [
			"instruction-audit scope",
			"nested Git repository",
			"tool-agnostic contributor guide",
			"Pi-local extension",
			"symlink substitution",
			"never silently move or write content",
			"create or improve it",
			"full",
			"valid ancestor marker",
			"working-tree changes",
			"rediscovery test",
			"Code wins over memory",
			"Uncommitted changes never block",
		]) {
			expect(prompt).toContain(phrase);
		}
	});

	it("keeps one concise notice for Session Dashboard", () => {
		expect(memoryStatusNotice()).toBe("Project memory may be stale. Run /init to refresh it.");
	});
});
