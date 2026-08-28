/**
 * /usage - Usage statistics dashboard
 *
 * Shows an inline view with usage stats grouped by provider.
 * - Tab cycles: Today → This Week → Last Week → All Time
 * - Arrow keys navigate providers
 * - Enter expands/collapses to show models
 *
 * Data collection and caching live in ./data.ts.
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { DynamicBorder } from "@earendil-works/pi-coding-agent";
import { CancellableLoader, Container, Spacer } from "@earendil-works/pi-tui";

import { collectUsageData } from "./data";
import type { CollectProgress, UsageData } from "./data";
import { clampLines, formatSinceDate } from "./format";
import { UsageComponent } from "./usage-view";

export { COLOR_RESET, formatAxisCost, seriesColor } from "./format";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("usage", {
    description: "Show usage statistics dashboard",
    handler: async (_args: string, ctx: ExtensionCommandContext) => {
      if (!ctx.hasUI) {
        return;
      }

      const data = await ctx.ui.custom<UsageData | null>((tui, theme, _kb, done) => {
        const loader = new CancellableLoader(
          tui,
          (s: string) => theme.fg("accent", s),
          (s: string) => theme.fg("muted", s),
          "Loading Usage...",
        );
        let finished = false;
        const finish = (value: UsageData | null) => {
          if (finished) return;
          finished = true;
          loader.dispose();
          done(value);
        };

        loader.onAbort = () => finish(null);

        const onProgress = (p: CollectProgress): void => {
          if (finished || p.filesToParse === 0) return;
          const files = `${p.filesParsed.toLocaleString()}/${p.filesToParse.toLocaleString()} files`;
          if (p.mode === "update") {
            const since = p.sinceMs !== null ? ` since ${formatSinceDate(p.sinceMs)}` : "";
            loader.setMessage(`Updating your usage history${since}… (${files})`);
          } else if (p.mode === "rebuild") {
            loader.setMessage(`Rebuilding your usage history — the cache format changed… (${files})`);
          } else {
            loader.setMessage(`Building your usage history for the first time… (${files})`);
          }
        };

        collectUsageData({ signal: loader.signal, onProgress })
          .then(finish)
          .catch(() => finish(null));

        return loader;
      });

      if (!data) {
        return;
      }

      await ctx.ui.custom<void>((tui, theme, _kb, done) => {
        const container = new Container();

        // Top border
        container.addChild(new Spacer(1));
        container.addChild(new DynamicBorder((s: string) => theme.fg("border", s)));
        container.addChild(new Spacer(1));

        const usage = new UsageComponent(
          theme,
          data,
          () => tui.requestRender(),
          () => done(),
        );

        return {
          render: (w: number) => {
            const borderLines = clampLines(container.render(w), w);
            const usageLines = usage.render(w);
            const bottomBorder = theme.fg("border", "─".repeat(w));
            return clampLines([...borderLines, ...usageLines, "", bottomBorder], w);
          },
          invalidate: () => container.invalidate(),
          handleInput: (input: string) => usage.handleInput(input),
          dispose: () => {},
        };
      });
    },
  });
}
