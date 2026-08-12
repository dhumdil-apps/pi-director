/**
 * Powerbar Git Producer
 *
 * Shows the current git branch, tracked working-tree diff statistics, and a dirty marker (*).
 * Segment ID: "git-branch"
 */

import type { ExtensionAPI, ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import { execFile } from "child_process";
import { readFileSync, statSync } from "fs";
import { isAbsolute, join, resolve } from "path";

/**
 * Resolve the real git dir for cwd. In a linked worktree or submodule, ".git"
 * is a file containing "gitdir: <path-to-real-gitdir>", not a directory —
 * without this, HEAD is looked up at the wrong path and the segment just
 * silently disappears in an otherwise valid checkout.
 */
function resolveGitDir(cwd: string): string | undefined {
  const gitPath = join(cwd, ".git");
  try {
    const stat = statSync(gitPath);
    if (stat.isDirectory()) return gitPath;
    if (stat.isFile()) {
      const match = readFileSync(gitPath, "utf-8")
        .trim()
        .match(/^gitdir:\s*(.+)$/);
      if (match) return isAbsolute(match[1]) ? match[1] : resolve(cwd, match[1]);
    }
  } catch {
    // Fall through to undefined below.
  }
  return undefined;
}

// Strip control/escape characters (ANSI escapes, etc.) before a git-derived
// string reaches the terminal. A ref name shouldn't contain these, but HEAD
// is plain file content — a crafted repo (e.g. from an untrusted archive)
// could still smuggle a terminal escape sequence through it.
// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional stripping
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;

export function getGitBranch(cwd: string): string | undefined {
  const gitDir = resolveGitDir(cwd);
  if (!gitDir) return undefined;
  try {
    const head = readFileSync(join(gitDir, "HEAD"), "utf-8").trim();
    const branch = head.startsWith("ref: refs/heads/")
      ? head.slice(16) // Named branch.
      : head.slice(0, 8); // Detached HEAD — short hash.
    return branch.replace(CONTROL_CHARS, "");
  } catch {
    return undefined;
  }
}

function isDirty(cwd: string): Promise<boolean> {
  return new Promise((resolve) => {
    execFile("git", ["status", "--porcelain", "--untracked-files=no"], { cwd, timeout: 2000 }, (err, stdout) =>
      resolve(!err && stdout.trim().length > 0),
    );
  });
}

interface GitDiffStats {
  files: number;
  additions: number;
  removals: number;
}

function getDiffStats(cwd: string): Promise<GitDiffStats | undefined> {
  return new Promise((resolve) => {
    execFile("git", ["diff", "--numstat", "HEAD"], { cwd, timeout: 2000 }, (err, stdout) => {
      if (err) {
        resolve(undefined);
        return;
      }

      const stats: GitDiffStats = { files: 0, additions: 0, removals: 0 };
      for (const line of stdout.trim().split("\n")) {
        if (!line) continue;
        const [added, removed] = line.split("\t");
        stats.files++;
        // Binary rows use "-" counts: they changed a file, but no source lines.
        if (/^\d+$/.test(added)) stats.additions += Number(added);
        if (/^\d+$/.test(removed)) stats.removals += Number(removed);
      }
      resolve(stats);
    });
  });
}

function formatFileCount(files: number): string {
  return `${files} file${files === 1 ? "" : "s"}`;
}

async function emitBranch(pi: ExtensionAPI, ctx: ExtensionContext): Promise<void> {
  const branch = getGitBranch(ctx.cwd);
  if (branch) {
    const [dirty, stats] = await Promise.all([isDirty(ctx.cwd), getDiffStats(ctx.cwd)]);
    const branchColor = dirty ? "warning" : "muted";
    pi.events.emit("powerbar:update", {
      id: "git-branch",
      row: 1,
      render: (theme: Theme) => {
        const branchText = dirty ? `${branch}*` : branch;
        if (!stats) return `${theme.fg(branchColor, "⎇")} ${theme.fg(branchColor, branchText)}`;
        return [
          `${theme.fg(branchColor, "⎇")} ${theme.fg(branchColor, branchText)}`,
          theme.fg("dim", ` · ${formatFileCount(stats.files)} · `),
          theme.fg("success", `+${stats.additions}`),
          theme.fg("error", ` −${stats.removals}`),
        ].join("");
      },
    });
  } else {
    pi.events.emit("powerbar:update", {
      id: "git-branch",
      text: undefined,
    });
  }
}

export default function createExtension(pi: ExtensionAPI): void {
  pi.events.emit("powerbar:register-segment", { id: "git-branch", label: "Git Branch", row: 1 });

  pi.on("session_start", async (_event, ctx) => {
    await emitBranch(pi, ctx);
  });

  // Refresh after tools that can change branch or dirty state
  pi.on("tool_result", async (event, ctx) => {
    if (event.toolName === "bash" || event.toolName === "edit" || event.toolName === "write") {
      await emitBranch(pi, ctx);
    }
  });
}
