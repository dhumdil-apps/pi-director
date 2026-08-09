import {
  access,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readPlanTiming,
  readTimeSpent,
  withPlanTiming,
  withTimeSpent,
} from "./plan-time.js";
import {
  autoSlug,
  beginTask,
  canonicalTaskName,
  composePlan,
  ensurePiState,
  isScaffold,
  listPlanNames,
  MEMORY_STUB,
  movePlan,
  normalizeTaskName,
  PLAN_TEMPLATE,
  registerTaskManagement,
  resolvePlanTask,
  timestampPrefix,
} from "./task.js";

function modeEntry(mode: string) {
  return { type: "custom", customType: "agent-workflow:mode", data: { mode } };
}

// save_plan belongs to Spec, so that is the default a save_plan harness starts in.
function makeHarness(cwd: string, name?: string, modes: string[] = ["spec"]) {
  let sessionName = name;
  const tools = new Map<string, any>();
  const sent: any[] = [];
  const branch: any[] = modes.map(modeEntry);
  const pi = {
    on: vi.fn(),
    registerTool: (registered: any) => tools.set(registered.name, registered),
    getSessionName: () => sessionName,
    setSessionName: vi.fn((next: string) => {
      sessionName = next;
    }),
    sendMessage: vi.fn((message: any) => sent.push(message)),
    events: { emit: vi.fn() },
  };
  registerTaskManagement(pi as never);
  const ctx = { cwd, sessionManager: { getBranch: () => branch } };
  const run = (name: string, params: any) =>
    tools.get(name)!.execute("call", params, undefined, undefined, ctx);
  return {
    execute: (params: any) => run("save_plan", params),
    pi,
    sent,
    getName: () => sessionName,
    getTool: (name: string) => tools.get(name),
    branch,
  };
}

async function seedPlan(cwd: string, name: string, contents = plan) {
  await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
  await writeFile(join(cwd, ".pi", "plan", `${name}.md`), contents);
}

const plan =
  "## Current state\n\nA.\n\n## Desired state\n\nB.\n\n## Approach\n\nC.\n\n## Quirks\n\nD.\n";

describe("normalizeTaskName", () => {
  it("uses a concise two-to-four word summary without fallback ticket", () => {
    expect(
      normalizeTaskName(
        "please reimagine this dashboard resource section to make it better",
      ),
    ).toBe("reimagine-dashboard-resource-section");
  });
  it("preserves a supplied or current ticket (SI-42, TEST-1234, JIRA-567)", () => {
    expect(normalizeTaskName("SI-42 cache recovery")).toBe(
      "SI-42-cache-recovery",
    );
    expect(normalizeTaskName("TEST-1234 fix login bug")).toBe(
      "TEST-1234-fix-login-bug",
    );
    expect(
      normalizeTaskName("dashboard polish", "JIRA-567-existing-task"),
    ).toBe("JIRA-567-dashboard-polish");
  });
  it("pads a one-word summary", () =>
    expect(normalizeTaskName("dashboard")).toBe("dashboard-task"));
});

describe("save_plan", () => {
  let cwd: string;
  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "pi-task-management-"));
  });
  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  it("describes the revision rule and the modes that may not call it", () => {
    const tool = makeHarness(cwd).getTool("save_plan");
    expect(tool.description).toContain(
      "replaces the draft until the session has entered Vibe",
    );
    expect(tool.description).toContain("appends a dated revision after");
    expect(tool.description).toContain("Only Spec calls save_plan");
    expect(tool.parameters.properties.plan.description).toContain(
      "Goal, Current state, Findings, Decisions",
    );
  });

  it("normalizes the name, writes the flat plan file, and names the session", async () => {
    const harness = makeHarness(cwd);
    const saved = await harness.execute({
      name: "SI-7 dashboard polish",
      plan,
    });
    const path = join(cwd, ".pi", "plan", "SI-7-dashboard-polish.md");
    expect(saved.details).toEqual({ name: "SI-7-dashboard-polish", path });
    expect(await readFile(path, "utf8")).toBe(
      withTimeSpent(plan, "SI-7-dashboard-polish", 0),
    );
    expect(harness.getName()).toBe("SI-7-dashboard-polish");
  });

  it.each(["ask", "vibe"])("refuses save_plan in %s mode", async (mode) => {
    const harness = makeHarness(cwd, undefined, [mode]);
    const result = await harness.execute({ name: "dashboard polish", plan });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("save_plan belongs to Spec");
  });

  it("replaces a pre-approval draft with the current complete proposal", async () => {
    const harness = makeHarness(cwd);
    await harness.execute({ name: "revised approach", plan });
    const replacement =
      "## Current state\n\nRevised.\n\n## Desired state\n\nD instead.\n";
    const result = await harness.execute({
      name: "revised approach",
      plan: replacement,
    });
    expect(result.isError).toBeUndefined();
    expect(await readFile(result.details.path, "utf8")).toBe(
      withTimeSpent(replacement, "revised-approach", 0),
    );
  });

  it("appends a re-plan once the session has entered Vibe", async () => {
    const harness = makeHarness(cwd, undefined, ["spec", "vibe", "spec"]);
    await harness.execute({ name: "revised approach", plan });
    const result = await harness.execute({
      name: "revised approach",
      plan: "## Approach\n\nD instead.\n",
    });
    const contents = await readFile(result.details.path, "utf8");
    expect(contents).toContain("A.");
    expect(contents).toContain("D instead.");
    expect(contents).toMatch(/## Revision 2 — \d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
  });

  it("rejects renaming an executed plan without moving or rewriting it", async () => {
    await seedPlan(cwd, "approved-plan", plan);
    const harness = makeHarness(cwd, "approved-plan", ["spec", "vibe", "spec"]);
    const result = await harness.execute({
      name: "renamed plan",
      plan: "Changed.",
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("immutable");
    expect(await readdir(join(cwd, ".pi", "plan"))).toEqual([
      "approved-plan.md",
    ]);
    expect(
      await readFile(join(cwd, ".pi", "plan", "approved-plan.md"), "utf8"),
    ).toBe(plan);
  });

  it("replaces the untouched scaffold rather than revising it", async () => {
    await seedPlan(
      cwd,
      "scaffolded-task",
      PLAN_TEMPLATE.replace("<session-name>", "scaffolded-task"),
    );
    const harness = makeHarness(cwd, "scaffolded-task");
    const result = await harness.execute({ name: "scaffolded task", plan });
    expect(await readFile(result.details.path, "utf8")).toBe(
      withTimeSpent(plan, "scaffolded-task", 0),
    );
  });

  it("preserves the mode breakdown when replacing a proposal", async () => {
    const timing = {
      askMs: 12_000,
      specMs: 50_000,
      vibeMs: 33_456,
      unallocatedMs: 0,
    };
    await seedPlan(
      cwd,
      "timed-proposal",
      withPlanTiming(plan, "timed-proposal", timing),
    );
    const harness = makeHarness(cwd, "timed-proposal");
    const result = await harness.execute({
      name: "timed proposal",
      plan: "## Current state\n\nChanged.\n",
    });
    const saved = await readFile(result.details.path, "utf8");
    expect(readTimeSpent(saved)).toBe(95_456);
    expect(readPlanTiming(saved)).toEqual(timing);
  });

  it("presents the on-disk plan when no body is passed, instead of clobbering it", async () => {
    await seedPlan(cwd, "existing-name", "Edited by the agent.\n");
    const harness = makeHarness(cwd, "existing-name");
    const result = await harness.execute({ name: "existing name" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Edited by the agent.");
    expect(
      await readFile(join(cwd, ".pi", "plan", "existing-name.md"), "utf8"),
    ).toBe(withTimeSpent("Edited by the agent.\n", "existing-name", 0));
  });

  it("echoes the saved plan so the decision is made against the file", async () => {
    const harness = makeHarness(cwd);
    const result = await harness.execute({ name: "dashboard polish", plan });
    expect(result.content[0].text).toContain("## Approach");
  });

  it("gives a missing plan its canonical title and zero-time marker", async () => {
    const harness = makeHarness(cwd);
    const result = await harness.execute({ name: "nothing written yet" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("# nothing-written-yet");
    expect(result.content[0].text).toContain("**Time spent:** 0s");
  });

  it("keeps the timestamp prefix and moves the file when the slug changes", async () => {
    const auto = "2026-07-24--13-05-01-do-the-thing";
    await seedPlan(cwd, auto);
    const harness = makeHarness(cwd, auto);
    const result = await harness.execute({ name: "dashboard polish", plan });
    expect(result.details.name).toBe("2026-07-24--13-05-01-dashboard-polish");
    expect(harness.getName()).toBe("2026-07-24--13-05-01-dashboard-polish");
    expect(await readdir(join(cwd, ".pi", "plan"))).toEqual([
      "2026-07-24--13-05-01-dashboard-polish.md",
    ]);
  });

  it("does not mistake a timestamp for an inherited ticket ID", async () => {
    const harness = makeHarness(cwd, "2026-07-24--13-05-01-do-the-thing");
    const result = await harness.execute({ name: "cache recovery", plan });
    expect(result.details.name).toBe("2026-07-24--13-05-01-cache-recovery");
  });

  it("ignores and preserves legacy .pi/goal files", async () => {
    const harness = makeHarness(cwd);
    await mkdir(join(cwd, ".pi", "goal"), { recursive: true });
    await writeFile(
      join(cwd, ".pi", "goal", "legacy-state.todo.md"),
      "# Legacy\n",
    );
    const saved = await harness.execute({ name: "legacy state", plan });
    expect(saved.isError).toBeUndefined();
    expect(saved.details.path).toBe(
      join(cwd, ".pi", "plan", "legacy-state.md"),
    );
    await expect(
      access(join(cwd, ".pi", "goal", "legacy-state.todo.md")),
    ).resolves.toBeUndefined();
  });
});

describe("composePlan", () => {
  const now = new Date("2026-07-25T18:53:00");

  it("takes the body outright when there is nothing to keep", () => {
    expect(composePlan("", "## Approach\n\nA.", now)).toBe(
      "## Approach\n\nA.\n",
    );
    expect(
      composePlan(PLAN_TEMPLATE.replace("<session-name>", "x-task"), "B.", now),
    ).toBe("B.\n");
  });

  it("replaces a draft and only appends revisions after approval", () => {
    expect(composePlan("Original.", "Changed.", now)).toBe("Changed.\n");
    const second = composePlan("Original.", "Changed.", now, true);
    expect(second).toContain("## Revision 2 — 2026-07-25 18:53");
    expect(second.startsWith("Original.")).toBe(true);
    expect(composePlan(second, "Changed again.", now, true)).toContain(
      "## Revision 3 —",
    );
  });

  it("does not duplicate a body that is already the tail of an approved plan", () => {
    const once = composePlan("Original.", "Changed.", now, true);
    expect(composePlan(once, "Changed.", now, true)).toBe(once);
  });

  it("treats an empty body as leave-as-is, and reads the scaffold as untouched", () => {
    expect(composePlan("Original.", "   ", now)).toBe("Original.\n");
    expect(isScaffold(PLAN_TEMPLATE.replace("<session-name>", "x-task"))).toBe(
      true,
    );
    expect(isScaffold(plan)).toBe(false);
  });
});

describe("resolvePlanTask", () => {
  let cwd: string;
  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "pi-plan-resolve-"));
  });
  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  it("resolves the single plan when nothing is named", async () => {
    await seedPlan(cwd, "dashboard-polish");
    expect(resolvePlanTask(cwd, undefined, undefined).task).toEqual({
      name: "dashboard-polish",
      planPath: ".pi/plan/dashboard-polish.md",
    });
  });

  it("prefers an explicitly named task and canonicalizes it", async () => {
    await seedPlan(cwd, "dashboard-polish");
    await seedPlan(cwd, "SI-7-cache-recovery");
    expect(
      resolvePlanTask(cwd, "si-7-cache-recovery", undefined).task?.name,
    ).toBe("SI-7-cache-recovery");
    expect(resolvePlanTask(cwd, "no-such-task", undefined).error).toContain(
      "No plan for no-such-task",
    );
  });

  it("rejects a name that is not a session name", async () => {
    await seedPlan(cwd, "dashboard-polish");
    expect(resolvePlanTask(cwd, "not a task name!", undefined).error).toContain(
      "is not a session name",
    );
  });

  it("falls back to the session name before the lone-file pick", async () => {
    await seedPlan(cwd, "dashboard-polish");
    await seedPlan(cwd, "cache-recovery");
    expect(resolvePlanTask(cwd, undefined, "cache-recovery").task?.name).toBe(
      "cache-recovery",
    );
  });

  it("asks which task when several plans exist", async () => {
    await seedPlan(cwd, "dashboard-polish");
    await seedPlan(cwd, "cache-recovery");
    const { task, error } = resolvePlanTask(cwd, undefined, undefined);
    expect(task).toBeUndefined();
    expect(error).toContain("cache-recovery, dashboard-polish");
    expect(error).toContain("/handoff <session-name>");
  });

  it("errors when no plan exists", () => {
    expect(resolvePlanTask(cwd, undefined, undefined).error).toContain(
      "plan first",
    );
  });
});

describe("listPlanNames", () => {
  let cwd: string;
  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "pi-plan-list-"));
  });
  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  it("lists canonical plan names sorted, and is empty without a plan dir", async () => {
    expect(listPlanNames(cwd)).toEqual([]);
    const plans = join(cwd, ".pi", "plan");
    await mkdir(plans, { recursive: true });
    await writeFile(join(plans, "zeta-task.md"), plan);
    await writeFile(join(plans, "SI-1-alpha-task.md"), plan);
    await writeFile(join(plans, "not a plan.txt"), "x");
    expect(listPlanNames(cwd)).toEqual(["SI-1-alpha-task", "zeta-task"]);
  });
});

describe("auto-scaffold naming", () => {
  const at = (iso: string) => new Date(iso);

  it("prefixes the first prompt's words with a sortable local timestamp", () => {
    const name = autoSlug(
      "please fix the flaky login test",
      at("2026-07-24T13:05:01"),
    );
    expect(name).toBe("2026-07-24--13-05-01-fix-flaky-login-test");
  });

  it("orders lexically by start time", () => {
    const first = autoSlug("alpha work", at("2026-07-24T09:00:00"));
    const second = autoSlug("beta work", at("2026-07-24T13:05:01"));
    expect([second, first].sort()).toEqual([first, second]);
  });

  it("round-trips a timestamped name and reads its prefix back", () => {
    const name = autoSlug("SI-7 cache recovery", at("2026-07-24T13:05:01"));
    expect(name).toBe("2026-07-24--13-05-01-SI-7-cache-recovery");
    expect(canonicalTaskName(name)).toBe(name);
    expect(timestampPrefix(name)).toBe("2026-07-24--13-05-01");
    expect(
      timestampPrefix("2026-07-24-13-05-01-dashboard-polish"),
    ).toBeUndefined();
    expect(timestampPrefix("dashboard-polish")).toBeUndefined();
  });
});

describe("context-informed task setup", () => {
  let cwd: string;
  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "pi-begin-task-"));
  });
  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  it("renames the temporary scaffold in place", async () => {
    const temporary = "2026-07-31--12-00-00-review-cache-behavior";
    await seedPlan(
      cwd,
      temporary,
      PLAN_TEMPLATE.replace("<session-name>", temporary),
    );
    const started = await beginTask(cwd, temporary, "cache behavior audit");
    expect(started.name).toBe("2026-07-31--12-00-00-cache-behavior-audit");
    await expect(
      access(join(cwd, ".pi", "plan", `${temporary}.md`)),
    ).rejects.toThrow();
    expect(await readdir(join(cwd, ".pi", "plan"))).toEqual([
      "2026-07-31--12-00-00-cache-behavior-audit.md",
    ]);
  });

  it("refuses a second name rather than starting a second artifact", async () => {
    const first = "2026-07-31--12-00-00-dashboard-polish";
    await seedPlan(cwd, first, plan);
    await expect(beginTask(cwd, first, "cache recovery")).rejects.toThrow(
      /already owns this session's plan/,
    );
    expect(await readdir(join(cwd, ".pi", "plan"))).toEqual([`${first}.md`]);
  });

  it("is idempotent when the same name is applied again", async () => {
    const name = "dashboard-polish";
    await seedPlan(cwd, name, plan);
    const started = await beginTask(cwd, name, "dashboard polish");
    expect(started.name).toBe(name);
    expect(await readFile(started.path, "utf8")).toBe(plan);
  });
});

describe("plan template", () => {
  it("stubs every section one flat artifact needs", () => {
    for (const section of [
      "## Goal",
      "## Align",
      "## Current state",
      "## Findings",
      "## Decisions",
      "## Desired state",
      "## Approach",
      "## Work log",
      "## Quirks",
      "## Checklist",
      "### PR summary",
      "### QA steps",
    ]) {
      expect(PLAN_TEMPLATE).toContain(section);
    }
    expect(PLAN_TEMPLATE).not.toContain("agent-workflow:artifact");
  });
});

describe("ensurePiState / movePlan", () => {
  let cwd: string;
  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "pi-ensure-state-"));
  });
  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  it("creates the plan dir and a MEMORY stub, and never overwrites an existing one", async () => {
    await ensurePiState(cwd);
    const memory = join(cwd, ".pi", "MEMORY.md");
    expect(await readFile(memory, "utf8")).toBe(MEMORY_STUB);
    expect(MEMORY_STUB).toContain("## Orientation");
    expect(MEMORY_STUB).toContain("## Quirks");
    expect(MEMORY_STUB).not.toContain("## Summary");
    await writeFile(memory, "# Mine\n");
    await ensurePiState(cwd);
    await expect(access(join(cwd, ".pi", "plan"))).resolves.toBeUndefined();
    expect(await readFile(memory, "utf8")).toBe("# Mine\n");
  });

  it("renames a plan file, and is a no-op without a source", async () => {
    await seedPlan(cwd, "old-name");
    await movePlan(cwd, "old-name", "new-name");
    expect(await readdir(join(cwd, ".pi", "plan"))).toEqual(["new-name.md"]);
    await movePlan(cwd, "absent-name", "other-name");
    expect(await readdir(join(cwd, ".pi", "plan"))).toEqual(["new-name.md"]);
  });
});
