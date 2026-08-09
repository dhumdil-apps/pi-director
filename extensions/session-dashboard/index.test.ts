import { homedir } from "node:os";
import { visibleWidth } from "@earendil-works/pi-tui";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UsageData } from "../usage-history/data.js";
import type { GraphModel } from "../usage-history/graph.js";
import { TOTAL_SERIES_KEY } from "../usage-history/graph.js";

const usageMocks = vi.hoisted(() => ({
  collectUsageData: vi.fn<() => Promise<UsageData | null>>(() =>
    Promise.resolve(null),
  ),
}));
const contextMocks = vi.hoisted(() => ({
  loadProjectContextFiles: vi.fn<
    (options: {
      cwd: string;
      agentDir: string;
    }) => Array<{ path: string; content: string }>
  >(() => []),
}));
const memoryMocks = vi.hoisted(() => ({
  inspectProjectMemory: vi.fn<
    () => Promise<{ kind: string; [key: string]: unknown }>
  >(() => Promise.resolve({ kind: "current" })),
  claimProjectMemoryReminder: vi.fn<
    (status: { kind: string }) => Promise<boolean>
  >((status) => Promise.resolve(status.kind !== "current")),
}));
vi.mock("@earendil-works/pi-coding-agent", async (importOriginal) => ({
  ...(await importOriginal()),
  getAgentDir: () => "/agent",
  loadProjectContextFiles: contextMocks.loadProjectContextFiles,
}));
vi.mock("../usage-history/data.js", async (importOriginal) => ({
  ...(await importOriginal()),
  collectUsageData: usageMocks.collectUsageData,
}));
vi.mock("../project-memory/index.js", async (importOriginal) => ({
  ...(await importOriginal()),
  inspectProjectMemory: memoryMocks.inspectProjectMemory,
  claimProjectMemoryReminder: memoryMocks.claimProjectMemoryReminder,
}));

import sessionDashboardExtension, { tildify, UsageChartCard } from "./index.js";

beforeEach(() => {
  vi.clearAllMocks();
});

function expectInOrder(text: string, ...parts: string[]): void {
  let previous = -1;
  for (const part of parts) {
    const index = text.indexOf(part);
    expect(index).toBeGreaterThan(previous);
    previous = index;
  }
}

describe("tildify", () => {
  const home = homedir();
  it.each([
    [`${home}/projects/foo`, "~/projects/foo"],
    [home, "~"],
    [`${home}-backup/projects/foo`, `${home}-backup/projects/foo`],
    ["/var/log/foo", "/var/log/foo"],
  ])("maps %s to %s", (path, expected) => {
    expect(tildify(path)).toBe(expected);
  });
});

describe("UsageChartCard", () => {
  const HOUR = 3_600_000;
  const t0 = Date.UTC(2026, 6, 20, 9, 0, 0); // fixed timestamp — no Date.now() in the model
  const model = (overrides: Partial<GraphModel> = {}): GraphModel => ({
    series: [
      {
        key: TOTAL_SERIES_KEY,
        label: "Total",
        points: [1, 2],
        total: 3,
        hidden: true,
        firstIdx: 0,
        lastIdx: 1,
      },
      {
        key: "anthropic",
        label: "anthropic",
        points: [1, 2],
        total: 3,
        hidden: false,
        firstIdx: 0,
        lastIdx: 1,
      },
    ],
    bucketStarts: [t0, t0 + HOUR],
    bucketMs: HOUR,
    domainStartMs: t0,
    domainEndMs: t0 + 2 * HOUR,
    yMax: 2,
    groupedTotal: 3,
    ...overrides,
  });
  const card = (m: GraphModel = model()) =>
    new UsageChartCard(
      m,
      (s) => s,
      (s) => s,
      (s) => s,
    );

  it("renders the Last 30 Days · Per bucket cost · by model header and a per-model legend", () => {
    const rendered = card().render(72);
    for (const heading of ["Last 30 Days", "Per bucket cost · by model"]) {
      expect(rendered[0]).toContain(heading);
    }
    expect(
      rendered.some(
        (line) => line.includes("anthropic") && line.includes("100%"),
      ),
    ).toBe(true);
  });

  it("closes the legend with Total as a markerless summary row", () => {
    const rendered = card().render(72);
    const totalIdx = rendered.findIndex((line) => line.includes("Total"));
    const seriesIdx = rendered.findIndex((line) => line.includes("anthropic"));
    expect(seriesIdx).toBeGreaterThanOrEqual(0);
    expect(totalIdx).toBeGreaterThan(seriesIdx);
    expect(rendered[totalIdx]).not.toContain("●");
    expect(rendered[totalIdx]).not.toContain("%");
  });

  it("omits the summary row when the model carries no Total series", () => {
    const rendered = card(
      model({
        series: model().series.filter((s) => s.key !== TOTAL_SERIES_KEY),
      }),
    ).render(72);
    expect(rendered.some((line) => line.includes("Total"))).toBe(false);
    expect(rendered.some((line) => line.includes("anthropic"))).toBe(true);
  });

  it("shows a fallback note and no chart when there is no usage in the last 30 days", () => {
    const empty = model({
      series: [
        {
          key: TOTAL_SERIES_KEY,
          label: "Total",
          points: [0],
          total: 0,
          hidden: false,
          firstIdx: -1,
          lastIdx: -1,
        },
      ],
      groupedTotal: 0,
      yMax: 0,
    });
    const rendered = card(empty).render(72);
    expect(
      rendered.some((line) => line.includes("No usage in the last 30 days")),
    ).toBe(true);
    expect(rendered.some((line) => line.includes("anthropic"))).toBe(false);
  });

  it("keeps every line within the container width, even when narrow", () => {
    for (const width of [20, 30, 40, 72]) {
      const rendered = card().render(width);
      expect(rendered.every((line) => visibleWidth(line) <= width)).toBe(true);
    }
  });

  it("renders nothing for a non-positive width", () => {
    expect(card().render(0)).toEqual([]);
  });
});

describe("context-free dashboard cards", () => {
  it("registers entry renderers and appends /help and /context without model messages", async () => {
    const commands = new Map<
      string,
      (args: string, ctx: unknown) => Promise<void>
    >();
    const appendEntry = vi.fn();
    const registerEntryRenderer = vi.fn();
    let statusListener: ((value: unknown) => void) | undefined;
    const pi = {
      appendEntry,
      events: {
        on: (_name: string, listener: (value: unknown) => void) => {
          statusListener = listener;
        },
      },
      getAllTools: () => [],
      registerEntryRenderer,
      registerCommand: (
        name: string,
        options: { handler: (args: string, ctx: unknown) => Promise<void> },
      ) => {
        commands.set(name, options.handler);
      },
      on: vi.fn(),
    };
    sessionDashboardExtension(pi as never);

    expect(registerEntryRenderer.mock.calls.map(([type]) => type)).toEqual([
      "session-dashboard",
      "session-dashboard-help",
      "session-dashboard-context",
      "session-dashboard-context-reminder",
    ]);

    await commands.get("help")?.("", {});
    await commands.get("context")?.("", {
      getSystemPrompt: () => "Pi base prompt.",
      getSystemPromptOptions: () => ({ contextFiles: [] }),
      getContextUsage: () => ({ tokens: 10, contextWindow: 1_000 }),
      sessionManager: { buildContextEntries: () => [] },
    });

    expect(appendEntry.mock.calls.map(([type]) => type)).toEqual([
      "session-dashboard-help",
      "session-dashboard-context",
    ]);
    expect(appendEntry.mock.calls[0]?.[1].content).toContain("# Help");
    expect(appendEntry.mock.calls[1]?.[1].content).toContain(
      "context breakdown",
    );

    statusListener?.({ working: true, mode: "vibe", contextUsed: 12_000 });
    statusListener?.({ working: false, mode: "vibe", contextUsed: 12_000 });
    statusListener?.({ working: false, mode: "vibe", contextUsed: 12_000 });
    expect(appendEntry.mock.calls[2]?.[0]).toBe(
      "session-dashboard-context-reminder",
    );
    expect(appendEntry.mock.calls[2]?.[1].content).toContain("Run `/context`");
    expect(appendEntry).toHaveBeenCalledTimes(3);
  });
});

describe("session dashboard startup", () => {
  it("shows a loading widget until the welcome message is ready", async () => {
    const handlers = new Map<
      string,
      (event: unknown, ctx: unknown) => Promise<void>
    >();
    const setWidget = vi.fn();
    const appendEntry = vi.fn();
    const pi = {
      registerEntryRenderer: vi.fn(),
      registerCommand: vi.fn(),
      on: (
        event: string,
        handler: (event: unknown, ctx: unknown) => Promise<void>,
      ) => handlers.set(event, handler),
      appendEntry,
    };
    const loadedContext = "Follow the repository guide.";
    contextMocks.loadProjectContextFiles.mockReturnValueOnce([
      { path: "/workspace/AGENTS.md", content: loadedContext },
      { path: "/workspace/ignored/AGENTS.md", content: "Not in Pi's prompt." },
    ]);
    const ctx = {
      hasUI: true,
      cwd: process.cwd(),
      getSystemPrompt: () => `Pi base prompt.\n${loadedContext}`,
      ui: { setWidget },
    };
    sessionDashboardExtension(pi as never);

    const startup = handlers.get("session_start")?.({}, ctx);
    expect(setWidget).toHaveBeenCalledWith("session-dashboard-loading", [
      "Preparing session dashboard…",
    ]);

    await startup;

    expect(appendEntry.mock.calls[0]?.[0]).toBe("session-dashboard");
    const content = appendEntry.mock.calls[0]?.[1].content as string;
    for (const included of [
      "> 🧠 `/init` · 📊 `/usage` · ⚙️ `/extension-settings` · ❓ `/help`",
      "**📦 Context files**",
      "`/workspace/AGENTS.md`",
      `*${tildify(process.cwd())}*`,
    ])
      expect(content).toContain(included);
    for (const omitted of [
      "⚡ Raw Pi",
      "⌘ Handoff",
      "/mode",
      "📜",
      "ignored/AGENTS.md",
      "π Measure twice, cut once. What’s your goal?",
    ]) {
      expect(content).not.toContain(omitted);
    }
    for (const command of [
      "❓ `/help`",
      "⚙️ `/extension-settings`",
      "📊 `/usage`",
      "🧠 `/init`",
    ]) {
      expect(content.split(command)).toHaveLength(2);
    }
    expect(content.startsWith(`*${tildify(process.cwd())}*`)).toBe(true);
    expect(setWidget).toHaveBeenLastCalledWith(
      "session-dashboard-loading",
      undefined,
    );
  });

  it("waits for concurrent memory and usage checks before sending one dashboard", async () => {
    let resolveUsage!: (value: UsageData | null) => void;
    let resolveMemory!: (value: { kind: "current" }) => void;
    usageMocks.collectUsageData.mockImplementationOnce(
      () =>
        new Promise<UsageData | null>((resolve) => {
          resolveUsage = resolve;
        }),
    );
    memoryMocks.inspectProjectMemory.mockImplementationOnce(
      () =>
        new Promise<{ kind: "current" }>((resolve) => {
          resolveMemory = resolve;
        }),
    );

    const handlers = new Map<
      string,
      (event: unknown, ctx: unknown) => Promise<void>
    >();
    const appendEntry = vi.fn();
    const pi = {
      registerEntryRenderer: vi.fn(),
      registerCommand: vi.fn(),
      on: (
        event: string,
        handler: (event: unknown, ctx: unknown) => Promise<void>,
      ) => handlers.set(event, handler),
      appendEntry,
    };
    sessionDashboardExtension(pi as never);

    const startup = handlers.get("session_start")?.(
      {},
      {
        hasUI: true,
        cwd: process.cwd(),
        getSystemPrompt: () => "Pi base prompt.",
        ui: { setWidget: vi.fn() },
      },
    );
    expect(usageMocks.collectUsageData).toHaveBeenCalledOnce();
    expect(memoryMocks.inspectProjectMemory).toHaveBeenCalledWith(
      process.cwd(),
    );
    expect(appendEntry).not.toHaveBeenCalled();

    resolveUsage(null);
    await Promise.resolve();
    expect(appendEntry).not.toHaveBeenCalled();
    resolveMemory({ kind: "current" });
    await startup;
    expect(appendEntry).toHaveBeenCalledOnce();
  });

  it("renders an unreviewed memory notice inside the ordered dashboard card", async () => {
    memoryMocks.inspectProjectMemory.mockResolvedValueOnce({
      kind: "unreviewed",
      reason: "marker-missing",
      location: {},
    });
    const handlers = new Map<
      string,
      (event: unknown, ctx: unknown) => Promise<void>
    >();
    const appendEntry = vi.fn();
    const pi = {
      registerEntryRenderer: vi.fn(),
      registerCommand: vi.fn(),
      on: (
        event: string,
        handler: (event: unknown, ctx: unknown) => Promise<void>,
      ) => handlers.set(event, handler),
      appendEntry,
    };
    sessionDashboardExtension(pi as never);

    await handlers.get("session_start")?.(
      {},
      {
        hasUI: true,
        cwd: process.cwd(),
        getSystemPrompt: () => "Pi base prompt.",
        ui: { setWidget: vi.fn() },
      },
    );

    const content = appendEntry.mock.calls[0]?.[1].content as string;
    const tip =
      "> 🧠 `/init` · 📊 `/usage` · ⚙️ `/extension-settings` · ❓ `/help`";
    const notice = "> ⚠️ Project memory may be stale. Run /init to refresh it.";
    expect(appendEntry).toHaveBeenCalledOnce();
    expect(content).toContain(notice);
    expectInOrder(content, tip, notice);
  });

  it("serializes a daily per-model 30-day graph", async () => {
    const day = 24 * 3_600_000;
    const start = Date.UTC(2026, 6, 1);
    const now = start + 30 * day;
    const emptyPeriod: UsageData["today"] = {
      providers: new Map(),
      totals: {
        sessions: 0,
        messages: 0,
        cost: 0,
        tokens: { total: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      },
      insights: { insights: [] },
    };
    usageMocks.collectUsageData.mockResolvedValueOnce({
      today: emptyPeriod,
      thisWeek: emptyPeriod,
      lastWeek: emptyPeriod,
      last30Days: emptyPeriod,
      allTime: emptyPeriod,
      hourly: new Map([
        [
          start + 2 * day,
          new Map([
            [
              "openai\u0000gpt-5\u0000",
              {
                messages: 1,
                cost: 1,
                input: 0,
                output: 0,
                cacheRead: 0,
                cacheWrite: 0,
                reasoning: 0,
              },
            ],
          ]),
        ],
        [
          start + 17 * day,
          new Map([
            [
              "openai\u0000gpt-5-mini\u0000",
              {
                messages: 1,
                cost: 2,
                input: 0,
                output: 0,
                cacheRead: 0,
                cacheWrite: 0,
                reasoning: 0,
              },
            ],
          ]),
        ],
      ]),
      bounds: {
        todayMs: now - day,
        weekStartMs: now - 7 * day,
        lastWeekStartMs: now - 14 * day,
        last30DaysStartMs: start,
        nowMs: now,
      },
    });
    const handlers = new Map<
      string,
      (event: unknown, ctx: unknown) => Promise<void>
    >();
    const appendEntry = vi.fn();
    const pi = {
      registerEntryRenderer: vi.fn(),
      registerCommand: vi.fn(),
      on: (
        event: string,
        handler: (event: unknown, ctx: unknown) => Promise<void>,
      ) => handlers.set(event, handler),
      appendEntry,
    };
    sessionDashboardExtension(pi as never);
    const loadedContext = "Follow the repository guide.";
    contextMocks.loadProjectContextFiles.mockReturnValueOnce([
      { path: "/workspace/AGENTS.md", content: loadedContext },
    ]);
    memoryMocks.inspectProjectMemory.mockResolvedValueOnce({
      kind: "stale",
      location: {},
    });

    await handlers.get("session_start")?.(
      {},
      {
        hasUI: true,
        cwd: process.cwd(),
        getSystemPrompt: () => `Pi base prompt.\n${loadedContext}`,
        ui: { setWidget: vi.fn() },
      },
    );

    const content = appendEntry.mock.calls[0]?.[1].content as string;
    const json = content.match(
      /<!-- session-dashboard-usage-chart -->\n(.+)\n<!-- \/session-dashboard-usage-chart -->/,
    )?.[1];
    const graph = JSON.parse(json ?? "") as GraphModel;
    const notice = "> ⚠️ Project memory may be stale. Run /init to refresh it.";
    expectInOrder(
      content,
      "🧠 `/init`",
      "<!-- session-dashboard-usage-chart -->",
      "**📦 Context files**",
      notice,
    );
    expect(content.trimEnd().endsWith(notice)).toBe(true);
    expect(content.match(/❓ `\/help`/g)).toHaveLength(1);
    expect(graph).toMatchObject({
      domainStartMs: start,
      domainEndMs: now,
      bucketMs: day,
    });
    expect(graph.bucketStarts).toHaveLength(30);
    expect(graph.series.map((series) => series.key)).toEqual([
      TOTAL_SERIES_KEY,
      "gpt-5-mini",
      "gpt-5",
    ]);
    // Hidden at build time so it neither overdraws the per-model lines nor inflates yMax.
    expect(graph.series.map((series) => series.hidden)).toEqual([
      true,
      false,
      false,
    ]);
  });
});
