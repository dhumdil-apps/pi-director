/**
 * Rendering logic for the powerbar.
 *
 * Builds one independently aligned line per configured line, joined by themed
 * separators. Progress bars are discrete bottom-anchored blocks (partial-height
 * glyphs ▁▂▃▄▅▆▇ over a dim ▁ baseline track). Nothing paints the top of a cell,
 * so bars on adjacent powerbar lines stay visually separate rows.
 */

import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { BAR_WIDTH, type PowerbarSettings, SEPARATOR } from "./settings.js";

export interface Segment {
	id: string;
	/** Primary text, rendered before the bar. */
	text: string;
	/** Text rendered after the bar (e.g., "59%"). */
	suffix?: string;
	icon?: string;
	color?: string;
	/** If set, renders a progress bar. Value is 0–100. */
	bar?: number;
	/** How many discrete blocks to use. Falls back to BAR_WIDTH. */
	barSegments?: number;
	/** Line a transient segment falls back to when it appears in no line setting. */
	row?: 1 | 2 | 3 | 4;
	/** Render on the right while active even when absent from saved settings. */
	transient?: boolean;
}

/**
 * Render a bar of discrete bottom-anchored block characters.
 *
 * Splits the 0–100 percent range evenly across `segments` blocks and
 * computes a fill level (0–7) per block, so a full block renders as ▇
 * rather than █. Empty blocks render a dim ▁ baseline instead of a
 * full-cell background, keeping the top of every cell unpainted.
 */
function renderBlocksBar(percent: number, segments: number, theme: Theme, color: string): string {
	const glyphs = ["▁", "▁", "▂", "▃", "▄", "▅", "▆", "▇"];
	const dimColor = theme.getFgAnsi("dim");
	const fgColor = theme.getFgAnsi((color || "muted") as ThemeColor);
	const reset = "\x1b[39m\x1b[49m";
	const clamped = Math.max(0, Math.min(100, percent));
	const filledFloat = (clamped / 100) * segments;

	const result: string[] = [];
	for (let i = 0; i < segments; i++) {
		const blockFill = Math.max(0, Math.min(1, filledFloat - i));
		const level = Math.round(blockFill * 7);
		const glyph = glyphs[level];
		result.push(level > 0 ? `${fgColor}${glyph}${reset}` : `${dimColor}${glyph}${reset}`);
	}

	return result.join(" ");
}

/** Render a percentage with the same meter powerbar segments use. */
export function renderPercentageBar(percent: number, width: number, theme: Theme, color: string): string {
	return renderBlocksBar(percent, width, theme, color);
}

/**
 * Render a single segment.
 *
 * Layout: [icon] [text] [bar] [suffix]
 */
function renderSegmentText(segment: Segment, theme: Theme): string {
	const parts: string[] = [];
	const themeColor = (segment.color || "muted") as ThemeColor;

	if (segment.icon) {
		parts.push(theme.fg(themeColor, segment.icon));
	}

	if (segment.text) {
		parts.push(theme.fg(themeColor, segment.text));
	}

	if (segment.bar !== undefined) {
		const color = segment.color || "muted";
		parts.push(renderPercentageBar(segment.bar, segment.barSegments ?? BAR_WIDTH, theme, color));
	}

	if (segment.suffix) {
		parts.push(theme.fg(themeColor, segment.suffix));
	}

	return parts.join(" ");
}

interface RenderedSegment {
	text: string;
	width: number;
}

function renderSideSegments(ids: string[], segments: Map<string, Segment>, theme: Theme): RenderedSegment[] {
	const rendered: RenderedSegment[] = [];
	for (const id of ids) {
		const seg = segments.get(id);
		if (!seg || (!seg.text && !seg.suffix && seg.bar === undefined)) continue;
		const text = renderSegmentText(seg, theme);
		rendered.push({ text, width: visibleWidth(text) });
	}
	return rendered;
}

function joinSegments(segments: RenderedSegment[], separator: string, separatorWidth: number): RenderedSegment {
	if (segments.length === 0) return { text: "", width: 0 };
	const text = segments.map((s) => s.text).join(separator);
	const width = segments.reduce((sum, s) => sum + s.width, 0) + separatorWidth * (segments.length - 1);
	return { text, width };
}

/**
 * Truncate the widest segment to reclaim overflow space.
 * Mutates the array in place and returns the new total width.
 */
function shrinkWidest(segments: RenderedSegment[], overflow: number): void {
	if (segments.length === 0) return;

	let widestIdx = 0;
	for (let i = 1; i < segments.length; i++) {
		if (segments[i].width > segments[widestIdx].width) {
			widestIdx = i;
		}
	}

	const seg = segments[widestIdx];
	const targetWidth = Math.max(1, seg.width - overflow);
	segments[widestIdx] = {
		text: truncateToWidth(seg.text, targetWidth, "…"),
		width: targetWidth,
	};
}

function renderAlignedLine(
	leftIds: string[],
	rightIds: string[],
	segments: Map<string, Segment>,
	theme: Theme,
	width: number,
): string {
	const separator = theme.fg("dim", SEPARATOR);
	const separatorWidth = visibleWidth(separator);
	const leftSegs = renderSideSegments(leftIds, segments, theme);
	const rightSegs = renderSideSegments(rightIds, segments, theme);
	const allSegs = [...leftSegs, ...rightSegs];

	const leftSepCount = Math.max(0, leftSegs.length - 1);
	const rightSepCount = Math.max(0, rightSegs.length - 1);
	const totalSepWidth = (leftSepCount + rightSepCount) * separatorWidth;
	const minPadding = 1;
	let overflow = allSegs.reduce((sum, segment) => sum + segment.width, 0) + totalSepWidth + minPadding - width;

	for (let i = 0; i < allSegs.length && overflow > 0; i++) {
		shrinkWidest(allSegs, overflow);
		const segmentWidth = allSegs.reduce((sum, segment) => sum + segment.width, 0);
		overflow = segmentWidth + totalSepWidth + minPadding - width;
	}

	const left = joinSegments(allSegs.slice(0, leftSegs.length), separator, separatorWidth);
	const right = joinSegments(allSegs.slice(leftSegs.length), separator, separatorWidth);
	const padding = Math.max(minPadding, width - left.width - right.width);
	return truncateToWidth(`${left.text}${" ".repeat(padding)}${right.text}`, width, "…");
}

/**
 * Render one aligned line per configured line.
 *
 * A line that ends up empty still takes a row when a later line has content, so
 * leaving one blank is how a deliberate gap is configured. Trailing empty lines
 * are dropped instead — an unused line 4 must not eat a row.
 */
export function renderBar(
	segments: Map<string, Segment>,
	settings: PowerbarSettings,
	theme: Theme,
	width: number,
): string[] {
	const configured = new Set(settings.lines.flatMap((line) => [...line.left, ...line.right]));
	const hasContent = (id: string): boolean => {
		const segment = segments.get(id);
		return !!segment && (!!segment.text || !!segment.suffix || segment.bar !== undefined);
	};

	// A transient segment nobody placed rides along on the right of its declared line.
	const transientByLine = new Map<number, string[]>();
	for (const segment of segments.values()) {
		if (!segment.transient || configured.has(segment.id)) continue;
		const index = Math.min(settings.lines.length, segment.row ?? 1) - 1;
		transientByLine.set(index, [...(transientByLine.get(index) ?? []), segment.id]);
	}

	const lines: (string | undefined)[] = settings.lines.map((line, index) => {
		const leftIds = line.left.filter(hasContent);
		const rightIds = [...line.right, ...(transientByLine.get(index) ?? [])].filter(hasContent);
		if (leftIds.length === 0 && rightIds.length === 0) return undefined;
		return renderAlignedLine(leftIds, rightIds, segments, theme, width);
	});

	let last = lines.length - 1;
	while (last >= 0 && lines[last] === undefined) last--;
	if (last < 0) return [" ".repeat(width)];
	return lines.slice(0, last + 1).map((line) => line ?? " ".repeat(width));
}
