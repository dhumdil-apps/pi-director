/**
 * Powerbar Core Extension
 *
 * Listens for "powerbar:update" events from producer extensions,
 * maintains a segment store, and renders a powerline-style widget.
 */

import type { ExtensionAPI, ExtensionUIContext, Theme } from "@earendil-works/pi-coding-agent";
import type { Component, TUI } from "@earendil-works/pi-tui";
import type { OrderedListOption } from "../../../extension-preferences/index.js";
import { renderBar, type Segment } from "./render.js";
import { type LineNumber, loadSettings, MAX_LINES, PLACEMENT, type PowerbarSettings, registerSettings } from "./settings.js";

interface PowerbarUpdatePayload {
	id: string;
	text?: string;
	suffix?: string;
	icon?: string;
	color?: string;
	bar?: number;
	barSegments?: number;
	row?: 1 | 2 | 3 | 4;
	transient?: boolean;
}

interface SegmentRegistration {
	id: string;
	label: string;
	/** Line this segment defaults to, shown in the picker so the layout is legible there. */
	row?: number;
}

function clampLine(row: number | undefined): LineNumber {
	const line = Math.trunc(row ?? 1);
	return (line >= 1 && line <= MAX_LINES ? line : 1) as LineNumber;
}

/** Picker order: by default line, then registration order within the line. */
function orderedOptions(catalog: Map<string, { option: OrderedListOption; row: LineNumber }>): OrderedListOption[] {
	return Array.from(catalog.values())
		.map((entry, index) => ({ ...entry, index }))
		.sort((a, b) => a.row - b.row || a.index - b.index)
		.map((entry) => entry.option);
}

function segmentEquals(left: Segment | undefined, right: Segment): boolean {
	return (
		left?.text === right.text &&
		left.suffix === right.suffix &&
		left.icon === right.icon &&
		left.color === right.color &&
		left.bar === right.bar &&
		left.barSegments === right.barSegments &&
		left.row === right.row &&
		left.transient === right.transient
	);
}

export default function createExtension(pi: ExtensionAPI): void {
	const segments: Map<string, Segment> = new Map();
	const segmentCatalog: Map<string, { option: OrderedListOption; row: LineNumber }> = new Map();
	let settings: PowerbarSettings;
	let currentCtx: { ui: { setWidget: (...args: any[]) => void }; hasUI: boolean } | undefined;

	// Register settings with empty options initially (no segments known yet)
	registerSettings(pi, []);

	// Listen for segment registrations from producer extensions
	pi.events.on("powerbar:register-segment", (data: unknown) => {
		const { id, label, row } = data as SegmentRegistration;
		const line = clampLine(row);
		// The default line rides in the label: the picker is a flat list, and
		// without it there is no way to tell where an unplaced segment lands.
		segmentCatalog.set(id, { option: { id, label: `${label} (line ${line})` }, row: line });
		// Re-register settings with updated segment options
		registerSettings(pi, orderedOptions(segmentCatalog));
	});

	function refresh(): void {
		if (!currentCtx?.hasUI) return;

		currentCtx.ui.setWidget(
			"powerbar",
			(_tui: TUI, theme: Theme): Component & { dispose?(): void } => {
				return {
					render(width: number): string[] {
						return renderBar(segments, settings, theme, width);
					},
					invalidate(): void {
						// No cached state to clear
					},
				};
			},
			{ placement: PLACEMENT },
		);
	}

	// Listen for segment updates from any extension
	pi.events.on("powerbar:update", (data: unknown) => {
		const payload = data as PowerbarUpdatePayload;
		if (!payload?.id) return;

		if (!payload.text && payload.bar === undefined) {
			const changed = segments.delete(payload.id);
			if (!changed) return;
		} else {
			const nextSegment: Segment = {
				id: payload.id,
				text: payload.text ?? "",
				suffix: payload.suffix,
				icon: payload.icon,
				color: payload.color,
				bar: payload.bar,
				barSegments: payload.barSegments,
				row: payload.row,
				transient: payload.transient,
			};
			if (segmentEquals(segments.get(payload.id), nextSegment)) return;
			segments.set(payload.id, nextSegment);
		}

		refresh();
	});

	function hideFooter(ctx: { ui: ExtensionUIContext; hasUI: boolean }): void {
		if (!ctx.hasUI) return;
		ctx.ui.setFooter((_tui, _theme, _footerData) => ({
			render(): string[] {
				return [];
			},
			invalidate(): void {},
		}));
	}

	pi.on("session_start", async (_event, ctx) => {
		// A new session starts with no state: without this, a segment whose
		// producer doesn't proactively re-emit on every session_start (or skips
		// emitting when its data is momentarily unavailable, e.g. ctx.model
		// still unresolved) would keep showing the previous session's value.
		segments.clear();
		settings = loadSettings();
		currentCtx = ctx;
		hideFooter(ctx);
		refresh();
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		if (ctx.hasUI) {
			ctx.ui.setWidget("powerbar", undefined);
		}
		currentCtx = undefined;
	});
}
