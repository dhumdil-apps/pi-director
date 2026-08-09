import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { openHandoffSession } from "./handoff.js";

const plan =
  "## Current state\n\nA.\n\n## Desired state\n\nB.\n\n## Approach\n\nC.\n\n## Quirks\n\nD.\n";

interface CtxOptions {
  sessionName?: string;
  hasUI?: boolean;
  mode?: "tui" | "print";
}

function makeHarness(cwd: string, options: CtxOptions = {}) {
  const sent: any[] = [];
  const entries: any[] = [];
  const notify = vi.fn();
  const pi = {
    appendEntry: vi.fn((customType: string, data: unknown) =>
      entries.push({ customType, data }),
    ),
    sendMessage: vi.fn((message: any) => sent.push(message)),
    sendUserMessage: vi.fn(),
  };

  const seeded = { entries: [] as any[], names: [] as string[] };
  const next = {
    hasUI: true,
    ui: { notify: vi.fn() },
    // Never resolves: the caller must not await the kickoff turn.
    sendUserMessage: vi.fn((_kickoff: string) => new Promise<void>(() => {})),
    sendMessage: vi.fn(async () => {}),
  };
  const newSession = vi.fn(async (opts: any) => {
    await opts.setup?.({
      appendCustomEntry: (customType: string, data: unknown) =>
        seeded.entries.push({ customType, data }),
      appendSessionInfo: (name: string) => seeded.names.push(name),
    });
    await opts.withSession?.(next);
    return { cancelled: false };
  });

  const branch: any[] = [];
  const ctx = {
    cwd,
    hasUI: options.hasUI ?? true,
    mode: options.mode ?? (options.hasUI === false ? "print" : "tui"),
    ui: { notify },
    waitForIdle: vi.fn(async () => {}),
    newSession,
    sessionManager: {
      getBranch: () => branch,
      getSessionName: () => options.sessionName,
      getSessionFile: () => "/sessions/current.jsonl",
    },
  };

  const open = (taskName?: string, mode?: "ask" | "spec" | "vibe") =>
    openHandoffSession(pi as never, ctx as never, taskName, mode);
  return {
    open,
    notify,
    sent,
    entries,
    newSession,
    next,
    seeded,
    branch,
    pi,
    ctx,
  };
}

async function seedPlan(cwd: string, name: string) {
  await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
  await writeFile(join(cwd, ".pi", "plan", `${name}.md`), plan);
}

describe("openHandoffSession", () => {
  let cwd: string;
  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "pi-handoff-cmd-"));
  });
  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  it("checkpoints the artifact before spawning so no context is lost", async () => {
    await seedPlan(cwd, "dashboard-polish");
    const { open, newSession, pi, ctx } = makeHarness(cwd);
    await open();

    const [request] = pi.sendUserMessage.mock.calls[0];
    expect(request).toContain(
      "bring .pi/plan/dashboard-polish.md fully up to date",
    );
    expect(request).toContain("do not start new work");
    expect(pi.sendUserMessage.mock.invocationCallOrder[0]).toBeLessThan(
      newSession.mock.invocationCallOrder[0],
    );
    expect(ctx.waitForIdle).toHaveBeenCalled();
  });

  it("seeds the new session with the task name, its mode, and a kickoff naming the plan", async () => {
    await seedPlan(cwd, "dashboard-polish");
    const { open, newSession, seeded, next } = makeHarness(cwd);
    await open();

    expect(newSession).toHaveBeenCalledWith(
      expect.objectContaining({ parentSession: "/sessions/current.jsonl" }),
    );
    // Display state is present before the replacement session is adopted.
    expect(seeded.entries).toEqual([
      { customType: "agent-workflow:mode", data: { mode: "ask" } },
    ]);
    expect(seeded.names).toEqual(["dashboard-polish"]);
    const [kickoff] = next.sendUserMessage.mock.calls[0];
    expect(kickoff).toContain(".pi/plan/dashboard-polish.md");
    expect(kickoff).toContain("Extend that same file");
  });

  it("carries the current mode into the fresh session", async () => {
    await seedPlan(cwd, "dashboard-polish");
    const { open, seeded, next } = makeHarness(cwd);
    await open(undefined, "vibe");
    expect(seeded.entries).toEqual([
      { customType: "agent-workflow:mode", data: { mode: "vibe" } },
    ]);
    expect(next.sendUserMessage.mock.calls[0][0]).toContain("in Vibe mode");
  });

  it("waits for the kickoff turn only when the new session has no UI", async () => {
    await seedPlan(cwd, "dashboard-polish");
    const interactive = makeHarness(cwd);
    // next.sendUserMessage never resolves; an interactive handoff still returns.
    await interactive.open();

    const headless = makeHarness(cwd);
    headless.next.hasUI = false;
    let settled = false;
    let finishTurn = () => {};
    headless.next.sendUserMessage.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishTurn = resolve;
        }),
    );
    const pending = headless.open().then(() => {
      settled = true;
    });
    await vi.waitFor(() =>
      expect(headless.next.sendUserMessage).toHaveBeenCalled(),
    );
    expect(settled).toBe(false);
    finishTurn();
    await pending;
    expect(settled).toBe(true);
  });

  it("notifies the resolution error and neither checkpoints nor spawns when no plan exists", async () => {
    const { open, notify, newSession, pi } = makeHarness(cwd);
    await open();
    expect(notify).toHaveBeenCalledWith(
      expect.stringContaining("plan first"),
      "warning",
    );
    expect(pi.sendUserMessage).not.toHaveBeenCalled();
    expect(newSession).not.toHaveBeenCalled();
  });

  it("persists a context-free error and prints it when the session has no UI", async () => {
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    const { open, sent, entries, newSession } = makeHarness(cwd, {
      hasUI: false,
    });
    await open();
    expect(sent).toEqual([]);
    expect(entries[0]).toMatchObject({
      customType: "agent-workflow:notice",
      data: {
        content: expect.stringContaining("plan first"),
        level: "warning",
      },
    });
    expect(stderr).toHaveBeenCalledWith(expect.stringContaining("plan first"));
    expect(newSession).not.toHaveBeenCalled();
    stderr.mockRestore();
  });
});
