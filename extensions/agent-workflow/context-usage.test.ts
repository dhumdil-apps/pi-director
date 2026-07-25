import { describe, expect, it, vi } from "vitest";

import { cacheHitText, contextDeltaText, contextIndicatorText } from "./context-usage.js";

const theme = { fg: (color: string, text: string) => `[${color}]${text}`, getFgAnsi: () => "" } as any;

/** The blocks meter emits SGR resets around every glyph; assertions read the glyphs. */
const strip = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, "");
/** Ten block levels, rendered space-separated. */
const bar = (glyphs: string) => [...glyphs].join(" ");

const usage = (over: Record<string, number> = {}) =>
  ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, ...over }) as any;

describe("cacheHitText", () => {
  it("reports the share of the prompt served from cache", () => {
    expect(cacheHitText(usage({ input: 100, cacheRead: 900 }), theme)).toBe("[accent]⚡ cache 90%");
  });

  it("dims a hit rate below half", () => {
    expect(cacheHitText(usage({ input: 900, cacheRead: 100 }), theme)).toBe("[dim]⚡ cache 10%");
  });

  it("counts cache writes as prompt tokens that did not hit", () => {
    expect(cacheHitText(usage({ cacheRead: 500, cacheWrite: 500 }), theme)).toBe("[accent]⚡ cache 50%");
  });

  it("is undefined without usage or prompt tokens", () => {
    expect(cacheHitText(undefined, theme)).toBeUndefined();
    expect(cacheHitText(usage({ output: 50 }), theme)).toBeUndefined();
  });
});

describe("contextDeltaText", () => {
  it("shows growth since the previous turn", () => {
    expect(contextDeltaText(87_200, 84_000, theme)).toBe("[dim]+3.2k");
  });

  it("shows a drop after compaction", () => {
    expect(contextDeltaText(12_000, 84_000, theme)).toBe("[dim]−72.0k");
  });

  it("is undefined on the first turn, on no movement, and on unknown totals", () => {
    expect(contextDeltaText(84_000, undefined, theme)).toBeUndefined();
    expect(contextDeltaText(84_000, 84_000, theme)).toBeUndefined();
    expect(contextDeltaText(null, 84_000, theme)).toBeUndefined();
  });
});

describe("contextIndicatorText", () => {
  const ctxUsage = { tokens: 84_000, contextWindow: 1_000_000, percent: 8 } as any;

  it("joins every available fragment", () => {
    const line = contextIndicatorText(ctxUsage, theme, {
      lastUsage: usage({ input: 100, cacheRead: 900 }),
      previousTokens: 80_800,
    });
    expect(strip(line!)).toBe(`[accent]ctx ${bar("▆▁▁▁▁▁▁▁▁▁")} [accent]84.0k / 1.0M[dim] · [accent]⚡ cache 90%[dim] · [dim]+3.2k`);
  });

  it("drops missing fragments without leaving a dangling separator", () => {
    expect(strip(contextIndicatorText(ctxUsage, theme)!)).toBe(`[accent]ctx ${bar("▆▁▁▁▁▁▁▁▁▁")} [accent]84.0k / 1.0M`);
  });

  it("is undefined when the context total itself is unknown", () => {
    expect(contextIndicatorText(undefined, theme, { previousTokens: 1 })).toBeUndefined();
    expect(contextIndicatorText({ tokens: null, contextWindow: 200_000, percent: null } as any, theme)).toBeUndefined();
  });
});
