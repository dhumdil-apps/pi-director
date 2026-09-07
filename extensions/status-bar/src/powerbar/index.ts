/**
 * Powerbar Core Extension
 *
 * Listens for "powerbar:update" events from producer extensions,
 * maintains a segment store, and renders a powerline-style widget.
 */

import type { ExtensionAPI, Theme } from "@earendil-works/pi-coding-agent";
import type { Component, TUI } from "@earendil-works/pi-tui";
import { renderBar, type Segment } from "./render.js";
import { loadSettings, registerSettings } from "./settings.js";

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
  render?: (theme: Theme) => string | undefined;
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
    left.transient === right.transient &&
    left.render === right.render
  );
}

export default function createExtension(pi: ExtensionAPI): void {
  const segments: Map<string, Segment> = new Map();
  let currentCtx:
    { ui: { setWidget: (...args: any[]) => void; setFooter: (...args: any[]) => void }; hasUI: boolean } | undefined;

  registerSettings(pi);

  function refresh(): void {
    if (!currentCtx?.hasUI) return;

    // Paint in the footer dock. A below-editor widget plus an empty footer still
    // costs one row: Pi's footer VStack slot has minSize 1.
    currentCtx.ui.setWidget("powerbar", undefined);
    currentCtx.ui.setFooter((_tui: TUI, theme: Theme): Component & { dispose?(): void } => {
      return {
        render(width: number): string[] {
          return renderBar(segments, loadSettings(), theme, width);
        },
        invalidate(): void {
          // No cached state to clear
        },
      };
    });
  }

  // Listen for segment updates from any extension
  pi.events.on("powerbar:update", (data: unknown) => {
    const payload = data as PowerbarUpdatePayload;
    if (!payload?.id) return;

    if (!payload.text && payload.bar === undefined && !payload.render) {
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
        render: payload.render,
      };
      if (segmentEquals(segments.get(payload.id), nextSegment)) return;
      segments.set(payload.id, nextSegment);
    }

    refresh();
  });

  pi.on("session_start", async (_event, ctx) => {
    // A new session starts with no state: without this, a segment whose
    // producer doesn't proactively re-emit on every session_start (or skips
    // emitting when its data is momentarily unavailable, e.g. ctx.model
    // still unresolved) would keep showing the previous session's value.
    segments.clear();
    currentCtx = ctx;
    refresh();
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    if (ctx.hasUI) {
      ctx.ui.setWidget("powerbar", undefined);
      ctx.ui.setFooter(undefined);
    }
    currentCtx = undefined;
  });
}
