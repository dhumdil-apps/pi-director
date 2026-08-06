import { describe, expect, it, vi } from "vitest";

import { cacheHitText, contextIndicatorText, contextSeverity } from "./context-usage.js";

const theme = { fg: (color: string, text: string) => `[${color}]${text}`, getFgAnsi: () => "" } as any;

/** The blocks meter emits SGR resets around every glyph; assertions read the glyphs. */
const strip = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, "");
/** Five meter blocks remain readable outside their ANSI styling. */
const bar = (glyphs: string) => [...glyphs].join(" ");

const usage = (over: Record<string, number> = {}) =>
  ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, ...over }) as any;

describe("contextSeverity", () => {
  it("uses percentage-only thresholds with strict warning and error boundaries", () => {
    expect(contextSeverity({ tokens: 20, contextWindow: 100, percent: 20 } as any)).toBe("accent");
    expect(contextSeverity({ tokens: 20.1, contextWindow: 100, percent: 20.1 } as any)).toBe("warning");
    expect(contextSeverity({ tokens: 40, contextWindow: 100, percent: 40 } as any)).toBe("warning");
    expect(contextSeverity({ tokens: 40.1, contextWindow: 100, percent: 40.1 } as any)).toBe("error");
    expect(contextSeverity({ tokens: 250_000, contextWindow: 1_000_000, percent: 25 } as any)).toBe("warning");
  });
});

describe("cacheHitText", () => {
  it("reports the share of the prompt served from cache neutrally", () => {
    expect(cacheHitText(usage({ input: 100, cacheRead: 900 }), theme)).toBe("[dim]🗃️ cache 90%");
  });

  it("keeps a low hit rate neutral", () => {
    expect(cacheHitText(usage({ input: 900, cacheRead: 100 }), theme)).toBe("[dim]🗃️ cache 10%");
  });

  it("counts cache writes as prompt tokens that did not hit", () => {
    expect(cacheHitText(usage({ cacheRead: 500, cacheWrite: 500 }), theme)).toBe("[dim]🗃️ cache 50%");
  });

  it("is undefined without usage or prompt tokens", () => {
    expect(cacheHitText(undefined, theme)).toBeUndefined();
    expect(cacheHitText(usage({ output: 50 }), theme)).toBeUndefined();
  });
});

describe("contextIndicatorText", () => {
  const ctxUsage = { tokens: 84_000, contextWindow: 1_000_000, percent: 8 } as any;

  it("joins the five-block context meter, cache rate, and first-turn total", () => {
    const line = contextIndicatorText(ctxUsage, theme, {
      lastUsage: usage({ input: 100, cacheRead: 900 }),
      firstTurnTokens: 80_800,
    });
    expect(strip(line!)).toBe(`[accent]Context window ${bar("▃    ")} [accent]84.0k / 1.0M[dim] · [dim]🗃️ cache 90%[dim] · [error]📦 init 80.8k`);
  });

  it.each([
    [9_999, "dim"],
    [10_000, "warning"],
    [19_999, "warning"],
    [20_000, "error"],
  ])("colors %i initial tokens as %s independently of whole-context severity", (tokens, color) => {
    expect(strip(contextIndicatorText(ctxUsage, theme, { firstTurnTokens: tokens })!))
      .toContain(`[${color}]📦 init ${tokens >= 1_000 ? `${(tokens / 1_000).toFixed(1)}k` : tokens}`);
  });

  it("drops missing fragments without leaving a dangling separator", () => {
    expect(strip(contextIndicatorText(ctxUsage, theme)!)).toBe(`[accent]Context window ${bar("▃    ")} [accent]84.0k / 1.0M`);
  });

  it("is undefined when the context total itself is unknown", () => {
    expect(contextIndicatorText(undefined, theme, { firstTurnTokens: 1 })).toBeUndefined();
    expect(contextIndicatorText({ tokens: null, contextWindow: 200_000, percent: null } as any, theme)).toBeUndefined();
  });
});
