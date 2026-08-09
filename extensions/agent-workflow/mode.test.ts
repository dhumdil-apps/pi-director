import { describe, expect, it, vi } from "vitest";
import {
	deriveWorkflowMode,
	ensureWorkflowMode,
	recordWorkflowMode,
	SPEC_OPTION,
	VIBE_OPTION,
	workflowModePrompt,
} from "./mode.js";

function harness(choice: string | undefined, hasUI = true) {
	const branch: any[] = [];
	const emitted: Array<[string, unknown]> = [];
	const pi = {
		appendEntry: vi.fn((customType: string, data: unknown) => branch.push({ type: "custom", customType, data })),
		events: { emit: vi.fn((name: string, data: unknown) => emitted.push([name, data])) },
	};
	const select = vi.fn(async () => choice);
	const ctx = { hasUI, ui: { select }, sessionManager: { getBranch: () => branch } };
	return { pi, ctx, branch, emitted, select };
}

describe("session workflow mode", () => {
	it("persists the latest command-selected mode", () => {
		const h = harness(undefined);
		recordWorkflowMode(h.pi as never, "vibe");
		recordWorkflowMode(h.pi as never, "spec");
		expect(deriveWorkflowMode(h.branch)).toBe("spec");
	});

	it("offers Vibe first before the first interactive Agent call", async () => {
		const h = harness(VIBE_OPTION);
		expect(await ensureWorkflowMode(h.pi as never, h.ctx as never, true)).toBe("vibe");
		expect(h.select).toHaveBeenCalledWith("How should this session work?", [VIBE_OPTION, SPEC_OPTION]);
		expect(h.emitted).toContainEqual(["agent-workflow:mode", { mode: "vibe" }]);
		expect(h.emitted.some(([name, data]: any) => name === "agent-workflow:checkpoint" && data.kind === "mode")).toBe(true);
	});

	it("defaults dismissed, headless, and legacy sessions to Spec", async () => {
		const dismissed = harness(undefined);
		expect(await ensureWorkflowMode(dismissed.pi as never, dismissed.ctx as never, true)).toBe("spec");

		const headless = harness(VIBE_OPTION, false);
		expect(await ensureWorkflowMode(headless.pi as never, headless.ctx as never, true)).toBe("spec");
		expect(headless.select).not.toHaveBeenCalled();

		const legacy = harness(VIBE_OPTION);
		expect(await ensureWorkflowMode(legacy.pi as never, legacy.ctx as never, false)).toBe("spec");
		expect(legacy.select).not.toHaveBeenCalled();
	});

	it("reuses persisted state and keeps the dynamic marker tiny", async () => {
		const h = harness(SPEC_OPTION);
		recordWorkflowMode(h.pi as never, "vibe");
		expect(await ensureWorkflowMode(h.pi as never, h.ctx as never, true)).toBe("vibe");
		expect(h.select).not.toHaveBeenCalled();
		expect(workflowModePrompt("vibe")).toBe("<pi_workflow_mode>vibe</pi_workflow_mode>");
	});
});
