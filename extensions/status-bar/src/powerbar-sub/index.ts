/**
 * Powerbar Sub Producer
 *
 * Shows subscription usage from Usage Monitor.
 * Usage Monitor is loaded by Pi as a sibling extension (declared in package.json pi.extensions).
 *
 * We listen to `usage-core:ready` and `usage-core:update-current`.
 * The state includes a `provider` field — when absent (e.g. Bedrock model),
 * we clear the segments.
 *
 * Segment IDs: "sub-hourly", "sub-weekly"
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

interface RateWindow {
	label: string;
	usedPercent: number;
	resetDescription?: string;
}

interface UsageCoreState {
	provider?: string;
	usage?: {
		windows: RateWindow[];
	};
}

/** Fallback width for windows whose label carries no duration. */
const DEFAULT_SEGMENTS = 10;
const MIN_SEGMENTS = 3;
const MAX_SEGMENTS = 12;
const MAX_COUNTDOWN_SEGMENTS = 5;

function clamp(n: number): number {
	return Math.min(MAX_SEGMENTS, Math.max(MIN_SEGMENTS, n));
}

/**
 * Bars mirror the window's cadence: 5h → 5 bars, Week → 7, 3d → 3.
 * Labels without a duration (Credits, Tokens, Pro, Extra …) keep the default width.
 */
export function segmentsForLabel(label: string | undefined): number {
	const text = (label ?? "").trim();
	if (!text) return DEFAULT_SEGMENTS;

	const hours = text.match(/^(\d+)\s*h$/i);
	if (hours) {
		const n = Number(hours[1]);
		if (n <= 12) return clamp(n);
		return clamp(Math.round(n / 24));
	}

	const days = text.match(/^(\d+)\s*d$/i);
	if (days) return clamp(Number(days[1]));

	if (/^week$/i.test(text)) return 7;
	if (/^day$/i.test(text)) return 12;
	if (/^month(ly)?$/i.test(text)) return DEFAULT_SEGMENTS;

	return DEFAULT_SEGMENTS;
}

/**
 * Uses the same compact countdown that is shown beside the bar so the width
 * represents the time horizon the percentage must cover. A partial lower unit
 * rounds up: `4d8h` needs five daily bars and `2h30m` needs three hourly bars.
 */
function segmentsForCountdown(resetDescription: string | undefined): number | undefined {
	const match = resetDescription?.trim().match(/^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?$/i);
	if (!match || (!match[1] && !match[2])) return undefined;

	const days = Number(match[1] ?? 0);
	const hours = Number(match[2] ?? 0);
	const minutes = Number(match[3] ?? 0);

	if (days > 0) return Math.min(MAX_COUNTDOWN_SEGMENTS, days + Number(hours > 0 || minutes > 0));
	return Math.min(MAX_COUNTDOWN_SEGMENTS, hours + Number(minutes > 0));
}

/** Prefer the displayed reset countdown, falling back to the window's cadence. */
export function segmentsForWindow(window: RateWindow): number {
	return segmentsForCountdown(window.resetDescription) ?? segmentsForLabel(window.label);
}

function getColor(pct: number): string {
	if (pct > 80) return "error";
	if (pct > 60) return "warning";
	return "accent";
}

function emitWindow(pi: ExtensionAPI, segmentId: string, window: RateWindow | undefined): void {
	if (!window) {
		pi.events.emit("powerbar:update", { id: segmentId, text: undefined });
		return;
	}

	const pct = Math.round(window.usedPercent);
	const label = window.label || "";
	const reset = window.resetDescription || "";

	const textParts: string[] = [];
	if (label) textParts.push(label);
	if (reset) textParts.push(reset);

	pi.events.emit("powerbar:update", {
		id: segmentId,
		text: textParts.join(" "),
		suffix: `${pct}%`,
		bar: pct,
		barSegments: segmentsForWindow(window),
		color: getColor(pct),
		row: 3,
	});
}

function clearSegments(pi: ExtensionAPI): void {
	pi.events.emit("powerbar:update", { id: "sub-hourly", text: undefined });
	pi.events.emit("powerbar:update", { id: "sub-weekly", text: undefined });
}

function emitUsage(pi: ExtensionAPI, state: UsageCoreState | undefined): void {
	if (!state?.provider) {
		clearSegments(pi);
		return;
	}

	const usage = state.usage;
	if (!usage || usage.windows.length === 0) {
		clearSegments(pi);
		return;
	}

	emitWindow(pi, "sub-hourly", usage.windows[0]);
	emitWindow(pi, "sub-weekly", usage.windows[1]);
}

export default function createExtension(pi: ExtensionAPI): void {
	pi.events.emit("powerbar:register-segment", { id: "sub-hourly", label: "Sub Hourly", row: 3 });
	pi.events.emit("powerbar:register-segment", { id: "sub-weekly", label: "Sub Weekly", row: 3 });

	pi.events.on("usage-core:ready", (payload: unknown) => {
		emitUsage(pi, (payload as { state?: UsageCoreState }).state);
	});

	pi.events.on("usage-core:update-current", (payload: unknown) => {
		emitUsage(pi, (payload as { state?: UsageCoreState }).state);
	});
}
