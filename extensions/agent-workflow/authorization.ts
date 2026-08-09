import { resolve } from "node:path";
import type { ExtensionAPI, SessionEntry } from "@earendil-works/pi-coding-agent";
import { deriveWorkflowMode } from "./mode.js";
import { recordWorkflowPhase } from "./phase.js";

export const AUTHORIZATION_EVENT = "agent-workflow:authorization";

export type AuthorizationState = "required" | "approved";

export interface AuthorizationEvent {
	state: AuthorizationState;
	task?: string;
}

export function deriveAuthorization(entries: SessionEntry[]): AuthorizationState | undefined {
	for (let index = entries.length - 1; index >= 0; index--) {
		const entry = entries[index];
		if (entry?.type !== "custom" || entry.customType !== AUTHORIZATION_EVENT) continue;
		const state = (entry.data as { state?: unknown } | undefined)?.state;
		if (state === "required" || state === "approved") return state;
	}
	return undefined;
}

export function recordAuthorization(
	pi: Pick<ExtensionAPI, "appendEntry" | "events">,
	state: AuthorizationState,
	task?: string,
): void {
	const event = { state, ...(task ? { task } : {}) } satisfies AuthorizationEvent;
	pi.appendEntry(AUTHORIZATION_EVENT, event);
	pi.events.emit?.(AUTHORIZATION_EVENT, event);
}

function isPlanMetadataPath(cwd: string, input: Record<string, unknown>): boolean {
	const supplied = typeof input.path === "string"
		? input.path
		: typeof input.file_path === "string" ? input.file_path : undefined;
	if (!supplied) return false;
	const absolute = resolve(cwd, supplied);
	const planRoot = resolve(cwd, ".pi", "plan");
	return absolute === resolve(cwd, ".pi", "MEMORY.md") || absolute.startsWith(`${planRoot}/`);
}

const SAFE_BEFORE_SPEC_APPROVAL = new Set(["read", "grep", "find", "ls", "ask", "start_task", "save_plan"]);

/**
 * Spec hard-blocks source edit/write calls until the latest requested increment
 * is approved. Shell and unknown custom tools stay visible warnings because the
 * host exposes no reliable generic mutability classification for them.
 */
export function registerAuthorization(pi: ExtensionAPI): void {
	let warned = false;

	pi.on("input", async (event, ctx) => {
		if (event.source === "extension") return;
		const mode = deriveWorkflowMode(ctx.sessionManager.getBranch()) ?? "spec";
		if (mode === "spec") recordAuthorization(pi, "required", pi.getSessionName());
		warned = false;
	});

	pi.on("tool_call", async (event, ctx) => {
		const branch = ctx.sessionManager.getBranch();
		if ((deriveWorkflowMode(branch) ?? "spec") !== "spec") return;
		if (deriveAuthorization(branch) === "approved") return;
		if (event.toolName !== "edit" && event.toolName !== "write") return;
		if (isPlanMetadataPath(ctx.cwd, event.input)) return;
		return {
			block: true,
			reason: "Spec requires the current plan revision to be approved before project files change.",
			terminate: true,
		};
	});

	pi.on("tool_execution_start", async (event, ctx) => {
		const branch = ctx.sessionManager.getBranch();
		const mode = deriveWorkflowMode(branch) ?? "spec";
		if (mode === "vibe") {
			if (event.toolName === "edit" || event.toolName === "write") {
				recordWorkflowPhase(pi, "execute");
			}
			return;
		}
		if (deriveAuthorization(branch) === "approved" || warned) return;
		if (SAFE_BEFORE_SPEC_APPROVAL.has(event.toolName) || event.toolName === "edit" || event.toolName === "write") return;
		warned = true;
		if (ctx.hasUI) ctx.ui.notify("Spec has not approved this requested increment; shell or custom mutations may bypass the edit/write guard.", "warning");
	});
}
