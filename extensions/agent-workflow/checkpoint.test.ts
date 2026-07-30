import { describe, expect, it, vi } from "vitest";
import {
	CHECKPOINT_EVENT,
	deriveOpenCheckpoint,
	openCheckpoint,
	registerCheckpointInputResolution,
	resolveCheckpoint,
} from "./checkpoint.js";

function harness() {
	const branch: any[] = [];
	const emitted: Array<[string, unknown]> = [];
	const handlers = new Map<string, (event: any, ctx: any) => unknown>();
	const pi = {
		appendEntry: vi.fn((customType: string, data: unknown) => branch.push({ type: "custom", customType, data })),
		events: { emit: vi.fn((name: string, data: unknown) => emitted.push([name, data])) },
		on: vi.fn((name: string, handler: any) => handlers.set(name, handler)),
	};
	return { pi, branch, emitted, handlers };
}

describe("alignment checkpoints", () => {
	it("persists and emits open and resolved lifecycle entries", () => {
		const h = harness();
		const checkpoint = openCheckpoint(h.pi as never, "question", 1_000);
		expect(deriveOpenCheckpoint(h.branch)).toEqual({ ...checkpoint });

		resolveCheckpoint(h.pi as never, checkpoint.id, "selected", 2_500);
		expect(deriveOpenCheckpoint(h.branch)).toBeUndefined();
		expect(h.emitted.map(([name]) => name)).toEqual([CHECKPOINT_EVENT, CHECKPOINT_EVENT]);
		expect(h.branch.at(-1).data).toMatchObject({ action: "resolve", outcome: "selected", timestamp: 2_500 });
	});

	it("reconstructs the latest unresolved checkpoint", () => {
		const h = harness();
		const first = openCheckpoint(h.pi as never, "question", 1_000);
		openCheckpoint(h.pi as never, "approval", 2_000);
		resolveCheckpoint(h.pi as never, first.id, "dismissed", 3_000);
		expect(deriveOpenCheckpoint(h.branch)).toMatchObject({ kind: "approval", openedAt: 2_000 });
	});

	it("ignores malformed lifecycle entries", () => {
		const malformed = [
			{ type: "custom", customType: CHECKPOINT_EVENT, data: { action: "open", id: "bad", kind: "other", timestamp: 1_000 } },
			{ type: "custom", customType: CHECKPOINT_EVENT, data: { action: "resolve", id: "bad", timestamp: 2_000 } },
		];
		expect(deriveOpenCheckpoint(malformed as never)).toBeUndefined();
	});

	it("resolves a custom-answer question on the next human input", async () => {
		const h = harness();
		registerCheckpointInputResolution(h.pi as never);
		const checkpoint = openCheckpoint(h.pi as never, "question", 1_000);
		const ctx = { sessionManager: { getBranch: () => h.branch } };

		await h.handlers.get("input")!({ source: "extension" }, ctx);
		expect(deriveOpenCheckpoint(h.branch)).toEqual(checkpoint);
		await h.handlers.get("input")!({ source: "interactive" }, ctx);
		expect(deriveOpenCheckpoint(h.branch)).toBeUndefined();
		expect(h.branch.at(-1).data).toMatchObject({ outcome: "custom-answer" });
	});
});
