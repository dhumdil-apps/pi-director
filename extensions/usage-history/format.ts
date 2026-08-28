/** Shared /usage number and ANSI formatters. */

import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

export function formatCost(cost: number): string {
  if (cost === 0) return "-";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 10) return `$${cost.toFixed(2)}`;
  if (cost < 100) return `$${cost.toFixed(1)}`;
  return `$${Math.round(cost)}`;
}

export function formatTokens(count: number): string {
  if (count === 0) return "-";
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  if (count < 1000000) return `${Math.round(count / 1000)}k`;
  if (count < 10000000) return `${(count / 1000000).toFixed(1)}M`;
  return `${Math.round(count / 1000000)}M`;
}

export function formatNumber(n: number): string {
  if (n === 0) return "-";
  return n.toLocaleString();
}

// Compact axis/legend formatters for the graph view.
export function formatAxisCost(v: number): string {
  if (v === 0) return "$0";
  if (v < 1) return `$${v.toFixed(2)}`;
  if (v < 100) return `$${v.toFixed(1)}`;
  if (v < 10_000) return `$${Math.round(v)}`;
  if (v < 1_000_000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${(v / 1_000_000).toFixed(2)}M`;
}

export function formatAxisCount(v: number): string {
  if (v === 0) return "0";
  if (v < 1000) return String(Math.round(v));
  if (v < 1_000_000) return `${(v / 1000).toFixed(v < 10_000 ? 1 : 0)}k`;
  if (v < 1_000_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  return `${(v / 1_000_000_000).toFixed(1)}B`;
}

// Bright ANSI palette for graph series (Total uses index 0).
const SERIES_COLORS = ["\x1b[97m", "\x1b[96m", "\x1b[95m", "\x1b[93m", "\x1b[92m", "\x1b[94m", "\x1b[91m", "\x1b[90m"];
export const COLOR_RESET = "\x1b[39m";

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length]!;
}

/** "14:32" if the timestamp is today, otherwise "16 Jul" (with year if not this year). */
export function formatSinceDate(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (d.getFullYear() !== now.getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString(undefined, opts);
}
export function padLeft(s: string, len: number): string {
  const vis = visibleWidth(s);
  if (vis >= len) return s;
  return " ".repeat(len - vis) + s;
}

export function padRight(s: string, len: number): string {
  const vis = visibleWidth(s);
  if (vis >= len) return s;
  return s + " ".repeat(len - vis);
}

export function fitCell(s: string, len: number, align: "left" | "right" = "left"): string {
  if (len <= 0) return "";
  const truncated = truncateToWidth(s, len);
  return align === "right" ? padLeft(truncated, len) : padRight(truncated, len);
}

export function clampLines(lines: string[], width: number): string[] {
  return lines.map((line) => truncateToWidth(line, Math.max(width, 0)));
}

export function pickFittingText(width: number, variants: string[]): string {
  for (const variant of variants) {
    if (visibleWidth(variant) <= width) return variant;
  }
  return variants[variants.length - 1] || "";
}
