import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  contextUsageText,
  formatDuration,
  updatePhaseIndicator,
} from "./activity-indicator.js";

const theme = {
  fg: (color: string, text: string) => `[${color}]${text}`,
  getFgAnsi: () => "",
} as any;

/** The blocks meter emits SGR resets around every glyph; assertions read the glyphs. */
const strip = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, "");
/** Five partial-height blocks represent the context-window percentage. */
const bar = (glyphs: string) => [...glyphs].join(" ");

describe("phase indicator", () => {
  it("renders only the marker and mode badge when context usage is unavailable", () => {
    let factory: any;
    const ctx = {
      ui: {
        setWorkingVisible: (visible: boolean) => expect(visible).toBe(false),
        setWidget: (_id: string, nextFactory: unknown) => {
          factory = nextFactory;
        },
      },
    } as any;

    updatePhaseIndicator(ctx, false);

    expect(factory({ requestRender: () => {} }, theme).render(80)).toEqual([
      "[accent]› [dim]What’s your goal?",
    ]);
  });

  it("keeps the current session mode visible while working and idle", () => {
    let factory: any;
    const ctx = {
      ui: {
        setWorkingVisible: () => {},
        setWidget: (_id: string, nextFactory: unknown) => {
          factory = nextFactory;
        },
      },
    } as any;
    updatePhaseIndicator(ctx, false, { mode: "vibe" });
    expect(
      strip(factory({ requestRender: () => {} }, theme).render(120)[0]),
    ).toContain("[accent][VIBE]");
    updatePhaseIndicator(ctx, true, { mode: "spec" });
    expect(
      strip(factory({ requestRender: () => {} }, theme).render(120)[0]),
    ).toContain("[warning][SPEC]");
    updatePhaseIndicator(ctx, false, { mode: "ask" });
    expect(
      strip(factory({ requestRender: () => {} }, theme).render(120)[0]),
    ).toContain("[dim][ASK]");
  });

  it.each([
    [
      { tokens: 84_000, contextWindow: 1_000_000, percent: 8.4 },
      `[accent]Context window ${bar("▃    ")} [accent]84.0k / 1.0M`,
    ],
    [
      { tokens: 940, contextWindow: 200_000, percent: 0.47 },
      `[accent]Context window ${bar("     ")} [accent]940 / 200.0k`,
    ],
    [
      { tokens: 0, contextWindow: 200_000, percent: 0 },
      `[accent]Context window ${bar("     ")} [accent]0 / 200.0k`,
    ],
    [
      { tokens: 140_000, contextWindow: 200_000, percent: 70 },
      `[error]Context window ${bar("███▄ ")} [error]140.0k / 200.0k`,
    ],
    [
      { tokens: 180_000, contextWindow: 200_000, percent: 90 },
      `[error]Context window ${bar("████▄")} [error]180.0k / 200.0k`,
    ],
    // Percentage alone determines severity, regardless of the context-window size.
    [
      { tokens: 120_000, contextWindow: 1_000_000, percent: 12 },
      `[accent]Context window ${bar("▅    ")} [accent]120.0k / 1.0M`,
    ],
    [
      { tokens: 250_000, contextWindow: 1_000_000, percent: 25 },
      `[warning]Context window ${bar("█▂   ")} [warning]250.0k / 1.0M`,
    ],
  ])(
    "renders the context readout with a usage-colored bar (%o)",
    (usage, expected) => {
      expect(strip(contextUsageText(usage as any, theme)!)).toBe(expected);
    },
  );

  it("omits the context readout while the token count is unknown", () => {
    expect(contextUsageText(undefined, theme)).toBeUndefined();
    expect(
      contextUsageText(
        { tokens: null, contextWindow: 200_000, percent: null } as any,
        theme,
      ),
    ).toBeUndefined();
    expect(
      contextUsageText(
        { tokens: 10, contextWindow: 0, percent: null } as any,
        theme,
      ),
    ).toBeUndefined();
  });

  describe("while working", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const mount = (working: boolean, extras?: any) => {
      let factory: any;
      const ctx = {
        ui: {
          setWorkingVisible: () => {},
          setWidget: (_id: string, nextFactory: unknown) => {
            factory = nextFactory;
          },
        },
      } as any;
      updatePhaseIndicator(ctx, working, extras);
      const requestRender = vi.fn();
      return { component: factory({ requestRender }, theme), requestRender };
    };

    const status = (lines: string[]) => strip(lines[0]);

    it("rotates the spinner frame every 120ms", () => {
      const { component, requestRender } = mount(true);

      expect(component.render(120).map(strip)).toEqual(["[accent]⠋"]);

      vi.advanceTimersByTime(120);
      expect(requestRender).toHaveBeenCalledTimes(1);
      expect(strip(component.render(120)[0])).toBe("[accent]⠙");

      // Ten frames wrap back to the first one.
      vi.advanceTimersByTime(120 * 9);
      expect(requestRender).toHaveBeenCalledTimes(10);
      expect(strip(component.render(120)[0])).toBe("[accent]⠋");
    });

    it("puts the counter directly after the badge in every workflow mode", () => {
      for (const mode of ["ask", "spec", "vibe"] as const) {
        const lines = mount(true, {
          mode,
          runStartedAt: 5_000,
          now: () => 10_000,
        }).component.render(120);
        expect(status(lines)).toMatch(
          /^\[accent\]⠋ \[\w+\]\[[A-Z]+\] \[dim\] 5s$/,
        );
      }
    });

    it("shows the post-execution prompt, not working text, once the run settles", () => {
      const lines = mount(false, { mode: "vibe" }).component.render(120);
      expect(status(lines)).toBe(
        "[accent]› [accent][VIBE] [accent]What’s up next?",
      );
    });

    it("keeps the idle marker and starts no timer when the agent is not working", () => {
      const { component, requestRender } = mount(false);

      expect(component.render(120).map(strip)).toEqual([
        "[accent]› [dim]What’s your goal?",
      ]);

      vi.advanceTimersByTime(120 * 5);
      expect(requestRender).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
      expect(component.render(120).map(strip)).toEqual([
        "[accent]› [dim]What’s your goal?",
      ]);
    });

    it("clears the spinner timer when pi disposes the widget", () => {
      const { component, requestRender } = mount(true);

      expect(vi.getTimerCount()).toBe(1);
      component.dispose();

      expect(vi.getTimerCount()).toBe(0);
      vi.advanceTimersByTime(120 * 5);
      expect(requestRender).not.toHaveBeenCalled();
    });

    it("shows only the current mode interval in the leading timer", () => {
      let now = 10_000;
      const { component } = mount(true, {
        mode: "vibe",
        runStartedAt: 5_000,
        now: () => now,
      });
      expect(strip(component.render(120)[0])).toBe(
        "[accent]⠋ [accent][VIBE] [dim] 5s",
      );

      // The counter rides spinner re-renders.
      expect(vi.getTimerCount()).toBe(1);

      now = 28_000;
      expect(strip(component.render(120)[0])).toBe(
        "[accent]⠋ [accent][VIBE] [dim] 23s",
      );
    });

    it("shows live timing in Ask, Spec, Vibe order", () => {
      const { component } = mount(true, {
        mode: "spec",
        runStartedAt: 5_000,
        planTime: {
          askMs: 2_000,
          specMs: 10_000,
          vibeMs: 30_000,
          unallocatedMs: 0,
        },
        now: () => 10_000,
      });

      expect(status(component.render(240))).toContain(
        "[dim] 5s[dim] · [dim]ask 2s[dim] · [accent]spec 15s[dim] · [dim]vibe 30s",
      );
    });

    it("keeps static mode buckets visible while hiding sub-minute idle age", () => {
      let now = 10_000;
      const component = mount(false, {
        mode: "spec",
        planTime: {
          askMs: 2_000,
          specMs: 30_000,
          vibeMs: 30_000,
          unallocatedMs: 0,
        },
        cacheStartedAt: 5_000,
        now: () => now,
      }).component;
      const modeBuckets =
        "[dim]ask 2s[dim] · [accent]spec 30s[dim] · [dim]vibe 30s";

      expect(status(component.render(240))).not.toContain("[accent] 5s");
      expect(status(component.render(240))).toContain(`[dim] · ${modeBuckets}`);

      now = 65_000;
      expect(status(component.render(240))).toContain(
        `[warning] 1m 00s[dim] · ${modeBuckets}`,
      );
    });

    it("advances unresolved picker time and caps that checkpoint at five minutes", () => {
      let now = 10_000;
      const { component, requestRender } = mount(false, {
        mode: "spec",
        planTime: { askMs: 2_000, specMs: 10_000, vibeMs: 0, unallocatedMs: 0 },
        checkpointOpenedAt: 5_000,
        now: () => now,
      });
      expect(status(component.render(240))).toContain("[dim]ask 7s");
      now = 305_000;
      expect(status(component.render(240))).toContain("[dim]ask 5m 02s+");
      vi.advanceTimersByTime(1_000);
      expect(requestRender).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toBe(0);
      component.dispose();
    });

    it("shows idle age from 1m, then caps it red and stops its timer at 5m", () => {
      let now = 10_000;
      const { component, requestRender } = mount(false, {
        mode: "vibe",
        cacheStartedAt: 10_000,
        now: () => now,
      });

      expect(status(component.render(120))).not.toContain("[accent] 0s");
      for (const [at, duration] of [
        [70_000, "[warning] 1m 00s"],
        [310_000, "[error] 5m+"],
        [610_000, "[error] 5m+"],
      ] as const) {
        now = at;
        expect(status(component.render(120))).toContain(duration);
      }

      vi.advanceTimersByTime(1_000);
      expect(requestRender).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toBe(0);

      vi.advanceTimersByTime(10_000);
      expect(requestRender).toHaveBeenCalledOnce();
      component.dispose();

      const alreadyExpired = mount(false, {
        mode: "ask",
        cacheStartedAt: 10_000,
        now: () => 610_000,
      }).component;
      expect(status(alreadyExpired.render(120))).toContain("[error] 5m+");
      expect(vi.getTimerCount()).toBe(0);
      alreadyExpired.dispose();
    });
  });

  it.each([
    [0, "0s"],
    [59_400, "59s"],
    [60_000, "1m 00s"],
    [3_599_000, "59m 59s"],
    [3_600_000, "1h 00m"],
    [3_849_000, "1h 04m"],
    [-5, "0s"],
  ])("formats %ims as %s", (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});
