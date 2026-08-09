import { describe, expect, it, vi } from "vitest";
import { registerAuthorization } from "./authorization.js";

function harness(mode?: string, hasUI = true) {
  const branch: any[] = mode
    ? [{ type: "custom", customType: "agent-workflow:mode", data: { mode } }]
    : [];
  const handlers = new Map<string, (event?: any, ctx?: any) => any>();
  const notify = vi.fn();
  const pi = {
    on: vi.fn((name: string, handler: any) => handlers.set(name, handler)),
  };
  registerAuthorization(pi as never);
  const ctx = {
    cwd: "/repo",
    hasUI,
    ui: { notify },
    sessionManager: { getBranch: () => branch },
  };
  return {
    notify,
    branch,
    call: (
      toolName: string,
      input: Record<string, unknown> = { path: "src/app.ts" },
    ) => handlers.get("tool_call")!({ toolName, input }, ctx),
    start: (toolName: string) =>
      handlers.get("tool_execution_start")!({ toolName }, ctx),
    input: (source: string) => handlers.get("input")!({ source }, ctx),
  };
}

describe("mode as the edit gate", () => {
  it.each(["edit", "write"])(
    "blocks %s in Ask, including before any mode is recorded",
    async (tool) => {
      for (const mode of [undefined, "ask"]) {
        const result = await harness(mode).call(tool);
        expect(result).toMatchObject({ block: true, terminate: true });
        expect(result.reason).toContain("Ask does not change project files");
      }
    },
  );

  it.each(["edit", "write"])("blocks %s in Spec", async (tool) => {
    const result = await harness("spec").call(tool);
    expect(result).toMatchObject({ block: true, terminate: true });
    expect(result.reason).toContain("Spec does not change project files");
  });

  it.each(["edit", "write"])("allows %s in Vibe", async (tool) => {
    expect(await harness("vibe").call(tool)).toBeUndefined();
  });

  it("never blocks a non-mutating tool", async () => {
    expect(await harness("ask").call("read")).toBeUndefined();
    expect(await harness("spec").call("grep")).toBeUndefined();
  });

  it.each([".pi/plan/dashboard-polish.md", ".pi/MEMORY.md"])(
    "keeps %s writable in every mode",
    async (path) => {
      for (const mode of ["ask", "spec", "vibe"]) {
        expect(await harness(mode).call("write", { path })).toBeUndefined();
      }
    },
  );

  it("resolves a legacy phase entry rather than falling back to Ask", async () => {
    expect(await harness("execute").call("edit")).toBeUndefined();
    expect(await harness("explore").call("edit")).toMatchObject({
      block: true,
    });
  });
});

describe("unclassifiable mutation warning", () => {
  it("warns once per interval outside Vibe, and again after new human input", async () => {
    const h = harness("spec");
    await h.start("bash");
    await h.start("bash");
    expect(h.notify).toHaveBeenCalledTimes(1);
    expect(h.notify).toHaveBeenCalledWith(
      expect.stringContaining("Spec does not execute"),
      "warning",
    );

    await h.input("extension");
    await h.start("bash");
    expect(h.notify).toHaveBeenCalledTimes(1);

    await h.input("interactive");
    await h.start("bash");
    expect(h.notify).toHaveBeenCalledTimes(2);
  });

  it("stays silent in Vibe, for safe tools, and for the already-blocked pair", async () => {
    const vibe = harness("vibe");
    await vibe.start("bash");
    expect(vibe.notify).not.toHaveBeenCalled();

    const spec = harness("spec");
    for (const tool of [
      "read",
      "grep",
      "find",
      "ls",
      "start_task",
      "save_plan",
      "edit",
      "write",
    ]) {
      await spec.start(tool);
    }
    expect(spec.notify).not.toHaveBeenCalled();
  });

  it("does not notify without an interactive UI", async () => {
    const h = harness("spec", false);
    await h.start("bash");
    expect(h.notify).not.toHaveBeenCalled();
  });
});
