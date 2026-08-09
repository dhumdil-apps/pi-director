import { randomUUID } from "node:crypto";
import type { ExtensionAPI, SessionEntry } from "@earendil-works/pi-coding-agent";

/** Context-free lifecycle entries for User-visible alignment choices. */
export const CHECKPOINT_EVENT = "agent-workflow:checkpoint";

export type CheckpointKind = "mode" | "question" | "approval";

export type CheckpointEvent =
	| { action: "open"; id: string; kind: CheckpointKind; timestamp: number }
	| { action: "resolve"; id: string; timestamp: number; outcome: string };

export interface OpenCheckpoint {
	id: string;
	kind: CheckpointKind;
	openedAt: number;
}

type CheckpointPi = Pick<ExtensionAPI, "appendEntry" | "events">;

function publish(pi: CheckpointPi, event: CheckpointEvent): void {
	pi.appendEntry(CHECKPOINT_EVENT, event);
	pi.events.emit?.(CHECKPOINT_EVENT, event);
}

/** Open immediately before presenting a choice so Align latency has an observable boundary. */
export function openCheckpoint(
	pi: CheckpointPi,
	kind: CheckpointKind,
	now: number = Date.now(),
): OpenCheckpoint {
	const checkpoint = { id: randomUUID(), kind, openedAt: now };
	publish(pi, { action: "open", id: checkpoint.id, kind, timestamp: now });
	return checkpoint;
}

/** Resolve every terminal outcome, including dismissal and UI failure. */
export function resolveCheckpoint(
	pi: CheckpointPi,
	id: string,
	outcome: string,
	now: number = Date.now(),
): void {
	publish(pi, { action: "resolve", id, outcome, timestamp: now });
}

function isCheckpointEvent(value: unknown): value is CheckpointEvent {
	if (!value || typeof value !== "object") return false;
	const event = value as Partial<CheckpointEvent>;
	const validAction = event.action === "open"
			? event.kind === "mode" || event.kind === "question" || event.kind === "approval"
		: event.action === "resolve" && typeof event.outcome === "string";
	return validAction
		&& typeof event.id === "string"
		&& typeof event.timestamp === "number"
		&& Number.isFinite(event.timestamp);
}

/** Reconstruct the latest unresolved checkpoint on the active branch. */
export function deriveOpenCheckpoint(entries: SessionEntry[]): OpenCheckpoint | undefined {
	const open = new Map<string, OpenCheckpoint>();
	for (const entry of entries) {
		if (entry.type !== "custom" || entry.customType !== CHECKPOINT_EVENT || !isCheckpointEvent(entry.data)) continue;
		const event = entry.data;
		if (event.action === "open") open.set(event.id, { id: event.id, kind: event.kind, openedAt: event.timestamp });
		else open.delete(event.id);
	}
	return [...open.values()].at(-1);
}

/** A custom picker answer remains open until the next human message supplies or cancels it. */
export function registerCheckpointInputResolution(pi: ExtensionAPI): void {
	pi.on("input", async (event, ctx) => {
		if (event.source === "extension") return;
		const checkpoint = deriveOpenCheckpoint(ctx.sessionManager.getBranch());
		if (checkpoint?.kind === "question") resolveCheckpoint(pi, checkpoint.id, "custom-answer");
	});
}
