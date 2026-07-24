import { access, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { autoSlug, canonicalTaskName, ensurePiState, listPlanNames, movePlan, normalizeTaskName, PLAN_TEMPLATE, registerTaskManagement, resolvePlanTask, timestampPrefix, withSummary } from "./task.js";

function makeHarness(cwd: string, name?: string) {
	let sessionName = name;
	const tools = new Map<string, any>();
	const sent: any[] = [];
	const pi = {
		on: vi.fn(),
		registerTool: (registered: any) => tools.set(registered.name, registered),
		getSessionName: () => sessionName,
		setSessionName: vi.fn((next: string) => { sessionName = next; }),
		sendMessage: vi.fn((message: any) => sent.push(message)),
	};
	registerTaskManagement(pi as never);
	const ctx = { cwd };
	const run = (name: string, params: any) => tools.get(name)!.execute("call", params, undefined, undefined, ctx);
	return {
		execute: (params: any) => run("save_plan", params),
		closeOut: (params: any) => run("close_out", params),
		pi,
		sent,
		getName: () => sessionName,
	};
}

async function seedPlan(cwd: string, name: string, contents = plan) {
	await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
	await writeFile(join(cwd, ".pi", "plan", `${name}.md`), contents);
}

const plan = "## Current state\n\nA.\n\n## Desired state\n\nB.\n\n## Approach\n\nC.\n\n## Quirks\n\nD.\n";

describe("normalizeTaskName", () => {
	it("uses a concise two-to-four word summary without fallback ticket", () => {
		expect(normalizeTaskName("please reimagine this dashboard resource section to make it better")).toBe("reimagine-dashboard-resource-section");
	});
	it("preserves a supplied or current ticket (SI-42, TEST-1234, JIRA-567)", () => {
		expect(normalizeTaskName("SI-42 cache recovery")).toBe("SI-42-cache-recovery");
		expect(normalizeTaskName("TEST-1234 fix login bug")).toBe("TEST-1234-fix-login-bug");
		expect(normalizeTaskName("dashboard polish", "JIRA-567-existing-task")).toBe("JIRA-567-dashboard-polish");
	});
	it("pads a one-word summary", () => expect(normalizeTaskName("dashboard")).toBe("dashboard-task"));
});

describe("save_plan", () => {
	let cwd: string;
	beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), "pi-task-management-")); });
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

	it("normalizes the name, writes the flat plan file, and names the session", async () => {
		const harness = makeHarness(cwd);
		const saved = await harness.execute({ name: "SI-7 dashboard polish", plan });
		const path = join(cwd, ".pi", "plan", "SI-7-dashboard-polish.md");
		expect(saved.details).toEqual({ name: "SI-7-dashboard-polish", path });
		expect(await readFile(path, "utf8")).toBe(plan);
		expect(harness.getName()).toBe("SI-7-dashboard-polish");
	});

	it("overwrites the same file on a re-save after a revision", async () => {
		const harness = makeHarness(cwd);
		await harness.execute({ name: "revised approach", plan });
		const revised = `${plan}\nRevised.\n`;
		const result = await harness.execute({ name: "revised approach", plan: revised });
		expect(result.isError).toBeUndefined();
		expect(await readFile(result.details.path, "utf8")).toBe(revised);
	});

	it("presents the on-disk plan when no body is passed, instead of clobbering it", async () => {
		await seedPlan(cwd, "existing-name", "Edited by the agent.\n");
		const harness = makeHarness(cwd, "existing-name");
		const result = await harness.execute({ name: "existing name" });
		expect(result.isError).toBeUndefined();
		expect(result.content[0].text).toContain("Edited by the agent.");
		expect(await readFile(join(cwd, ".pi", "plan", "existing-name.md"), "utf8")).toBe("Edited by the agent.\n");
	});

	it("echoes the saved plan so the decision is made against the file", async () => {
		const harness = makeHarness(cwd);
		const result = await harness.execute({ name: "dashboard polish", plan });
		expect(result.content[0].text).toContain("## Approach");
	});

	it("says the plan is empty rather than pretending there is one", async () => {
		const harness = makeHarness(cwd);
		const result = await harness.execute({ name: "nothing written yet" });
		expect(result.isError).toBeUndefined();
		expect(result.content[0].text).toContain("(empty)");
	});

	it("keeps the timestamp prefix and moves the file when the slug changes", async () => {
		const auto = "2026-07-24-13-05-01-do-the-thing";
		await seedPlan(cwd, auto);
		const harness = makeHarness(cwd, auto);
		const result = await harness.execute({ name: "dashboard polish", plan });
		expect(result.details.name).toBe("2026-07-24-13-05-01-dashboard-polish");
		expect(harness.getName()).toBe("2026-07-24-13-05-01-dashboard-polish");
		expect(await readdir(join(cwd, ".pi", "plan"))).toEqual(["2026-07-24-13-05-01-dashboard-polish.md"]);
	});

	it("does not mistake a timestamp for an inherited ticket ID", async () => {
		const harness = makeHarness(cwd, "2026-07-24-13-05-01-do-the-thing");
		const result = await harness.execute({ name: "cache recovery", plan });
		expect(result.details.name).toBe("2026-07-24-13-05-01-cache-recovery");
	});

	it("ignores and preserves legacy .pi/goal files", async () => {
		const harness = makeHarness(cwd);
		await mkdir(join(cwd, ".pi", "goal"), { recursive: true });
		await writeFile(join(cwd, ".pi", "goal", "legacy-state.todo.md"), "# Legacy\n");
		const saved = await harness.execute({ name: "legacy state", plan });
		expect(saved.isError).toBeUndefined();
		expect(saved.details.path).toBe(join(cwd, ".pi", "plan", "legacy-state.md"));
		await expect(access(join(cwd, ".pi", "goal", "legacy-state.todo.md"))).resolves.toBeUndefined();
	});
});

describe("resolvePlanTask", () => {
	let cwd: string;
	beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), "pi-plan-resolve-")); });
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

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
		expect(resolvePlanTask(cwd, "si-7-cache-recovery", undefined).task?.name).toBe("SI-7-cache-recovery");
		expect(resolvePlanTask(cwd, "no-such-task", undefined).error).toContain("No plan for no-such-task");
	});

	it("rejects a name that is not a session name", async () => {
		await seedPlan(cwd, "dashboard-polish");
		expect(resolvePlanTask(cwd, "not a task name!", undefined).error).toContain("is not a session name");
	});

	it("falls back to the session name before the lone-file pick", async () => {
		await seedPlan(cwd, "dashboard-polish");
		await seedPlan(cwd, "cache-recovery");
		expect(resolvePlanTask(cwd, undefined, "cache-recovery").task?.name).toBe("cache-recovery");
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
		expect(resolvePlanTask(cwd, undefined, undefined).error).toContain("plan first");
	});
});

describe("listPlanNames", () => {
	let cwd: string;
	beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), "pi-plan-list-")); });
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

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
		const name = autoSlug("please fix the flaky login test", at("2026-07-24T13:05:01"));
		expect(name).toBe("2026-07-24-13-05-01-fix-flaky-login-test");
	});

	it("orders lexically by start time", () => {
		const first = autoSlug("alpha work", at("2026-07-24T09:00:00"));
		const second = autoSlug("beta work", at("2026-07-24T13:05:01"));
		expect([second, first].sort()).toEqual([first, second]);
	});

	it("round-trips a timestamped name and reads its prefix back", () => {
		const name = autoSlug("SI-7 cache recovery", at("2026-07-24T13:05:01"));
		expect(name).toBe("2026-07-24-13-05-01-SI-7-cache-recovery");
		expect(canonicalTaskName(name)).toBe(name);
		expect(timestampPrefix(name)).toBe("2026-07-24-13-05-01");
		expect(timestampPrefix("dashboard-polish")).toBeUndefined();
	});
});

describe("close_out", () => {
	let cwd: string;
	beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), "pi-close-out-")); });
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

	const planFile = (name: string) => readFile(join(cwd, ".pi", "plan", `${name}.md`), "utf8");

	it("fills the scaffolded placeholder in the session's plan", async () => {
		await seedPlan(cwd, "cache-recovery", PLAN_TEMPLATE.replace("<session-name>", "cache-recovery"));
		const h = makeHarness(cwd, "cache-recovery");
		const result = await h.closeOut({ summary: "Rewrote the resolver. 12 tests green." });
		expect(result.isError).toBeFalsy();
		const written = await planFile("cache-recovery");
		expect(written).toContain("## Implementation summary\n\nRewrote the resolver. 12 tests green.\n");
		expect(written).not.toContain("<filled at close-out");
		// Earlier sections are untouched.
		expect(written).toContain("## Approach");
	});

	it("replaces a previous summary instead of stacking another", async () => {
		await seedPlan(cwd, "cache-recovery", PLAN_TEMPLATE.replace("<session-name>", "cache-recovery"));
		const h = makeHarness(cwd, "cache-recovery");
		await h.closeOut({ summary: "First pass." });
		await h.closeOut({ summary: "Second pass, after review." });
		const written = await planFile("cache-recovery");
		expect(written.match(/## Implementation summary/g)).toHaveLength(1);
		expect(written).toContain("Second pass, after review.");
		expect(written).not.toContain("First pass.");
	});

	it("errors, without writing, when no plan resolves", async () => {
		const h = makeHarness(cwd, "cache-recovery");
		const result = await h.closeOut({ summary: "Nowhere to put this." });
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain("No plan");
	});

	it("never renames the session — close-out is not a rename", async () => {
		await seedPlan(cwd, "cache-recovery", PLAN_TEMPLATE);
		const h = makeHarness(cwd, "cache-recovery");
		await h.closeOut({ summary: "Done." });
		expect(h.pi.setSessionName).not.toHaveBeenCalled();
		expect(h.getName()).toBe("cache-recovery");
	});
});

describe("withSummary", () => {
	it("appends the section when the plan has none", () => {
		expect(withSummary("# Task\n\n## Approach\n\nDo it.\n", "Did it.")).toBe(
			"# Task\n\n## Approach\n\nDo it.\n\n## Implementation summary\n\nDid it.\n",
		);
	});

	it("keeps the sections that follow the summary", () => {
		const plan = "## Implementation summary\n\nold\n\n## Quirks\n\nkeep me\n";
		const written = withSummary(plan, "new");
		expect(written).toBe("## Implementation summary\n\nnew\n\n## Quirks\n\nkeep me\n");
	});
});

describe("ensurePiState / movePlan", () => {
	let cwd: string;
	beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), "pi-ensure-state-")); });
	afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

	it("creates the plan dir and a MEMORY stub, and never overwrites an existing one", async () => {
		await ensurePiState(cwd);
		const memory = join(cwd, ".pi", "MEMORY.md");
		expect(await readFile(memory, "utf8")).toBe("# Project memory\n\nWork-arounds or other quirks learned on this project.\n");
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
