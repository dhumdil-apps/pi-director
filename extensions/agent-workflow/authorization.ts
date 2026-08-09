import { resolve } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { deriveWorkflowMode, MODE_LABEL } from "./mode.js";

function isPlanMetadataPath(
  cwd: string,
  input: Record<string, unknown>,
): boolean {
  const supplied =
    typeof input.path === "string"
      ? input.path
      : typeof input.file_path === "string"
        ? input.file_path
        : undefined;
  if (!supplied) return false;
  const absolute = resolve(cwd, supplied);
  const planRoot = resolve(cwd, ".pi", "plan");
  return (
    absolute === resolve(cwd, ".pi", "MEMORY.md") ||
    absolute.startsWith(`${planRoot}/`)
  );
}

const SAFE_OUTSIDE_VIBE = new Set([
  "read",
  "grep",
  "find",
  "ls",
  "start_task",
  "save_plan",
]);

/**
 * Mode is the edit gate. Only Vibe may change project files, which is what makes
 * "the Agent never switches mode" enforceable rather than advisory: reaching
 * execution takes a User choice, not a model decision.
 *
 * Shell and unknown custom tools stay visible warnings because the host exposes
 * no reliable generic mutability classification for them.
 */
export function registerAuthorization(pi: ExtensionAPI): void {
  let warned = false;

  pi.on("input", async (event) => {
    if (event.source !== "extension") warned = false;
  });

  pi.on("tool_call", async (event, ctx) => {
    const mode = deriveWorkflowMode(ctx.sessionManager.getBranch()) ?? "ask";
    if (mode === "vibe") return;
    if (event.toolName !== "edit" && event.toolName !== "write") return;
    if (isPlanMetadataPath(ctx.cwd, event.input)) return;
    return {
      block: true,
      reason: `${MODE_LABEL[mode]} does not change project files — the User switches to Vibe when the work is ready to land.`,
      terminate: true,
    };
  });

  pi.on("tool_execution_start", async (event, ctx) => {
    const mode = deriveWorkflowMode(ctx.sessionManager.getBranch()) ?? "ask";
    if (mode === "vibe" || warned) return;
    if (
      SAFE_OUTSIDE_VIBE.has(event.toolName) ||
      event.toolName === "edit" ||
      event.toolName === "write"
    )
      return;
    warned = true;
    if (ctx.hasUI)
      ctx.ui.notify(
        `${MODE_LABEL[mode]} does not execute; shell or custom mutations may bypass the edit/write guard.`,
        "warning",
      );
  });
}
