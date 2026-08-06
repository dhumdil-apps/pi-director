import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { type AskDetails, registerAsk, WRITE_CUSTOM_OPTION } from "./ask.js";
import { INVESTIGATION_TEMPLATE, PLAN_TEMPLATE, TASK_STARTED_EVENT } from "./task.js";

const OPTIONS = [
	{ headline: "Keep the trim", description: "Ship the shorter file as it stands." },
	{ headline: "Restore verification", description: "Re-add the commands agents cannot derive." },
];

function harness(select: (title: string, options: string[]) => Promise<string | undefined>, hasUI = true, cwd = "/unused", initialName?: string) {
	const tools: any[] = [];
	const emitted: Array<[string, any]> = [];
	const branch: any[] = [];
	let sessionName = initialName;
	const setSessionName = vi.fn((name: string) => { sessionName = name; });
	registerAsk({
		registerTool: vi.fn((tool: any) => tools.push(tool)),
		appendEntry: vi.fn((customType: string, data: unknown) => branch.push({ type: "custom", customType, data })),
		events: { emit: vi.fn((name: string, value: unknown) => emitted.push([name, value])) },
		getSessionName: vi.fn(() => sessionName),
		setSessionName,
	} as any);
	const selectSpy = vi.fn(select);
	const abortSpy = vi.fn();
	const ctx = { cwd, hasUI, ui: { select: selectSpy }, abort: abortSpy, sessionManager: { getBranch: () => branch } };
	const run = (params: any = { question: "Which one?", options: OPTIONS }) =>
		tools[0].execute("call-1", params, undefined, undefined, ctx as any);
	return { tool: tools[0], run, selectSpy, abortSpy, emitted, setSessionName };
}

describe("ask tool", () => {
	it("registers one sequential tool taking a question and 2-4 options", () => {
		const { tool } = harness(async () => undefined);
		expect(tool.name).toBe("ask");
		// Sequential: the dialog owns the screen, so it must not race another call.
		expect(tool.executionMode).toBe("sequential");
		expect(Object.keys(tool.parameters.properties)).toEqual(["question", "task", "options"]);
		expect(tool.parameters.properties.options.minItems).toBe(2);
		expect(tool.parameters.properties.options.maxItems).toBe(4);
	});

	it("uses initial task identity to rename and select the investigation template before asking", async () => {
		const cwd = await mkdtemp(join(tmpdir(), "pi-ask-task-"));
		try {
			const initial = "2026-07-31--12-00-00-check-the-cache";
			await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
			await writeFile(join(cwd, ".pi", "plan", `${initial}.md`), PLAN_TEMPLATE.replace("<session-name>", initial));
			const { run, setSessionName } = harness(async () => "Keep the trim", true, cwd, initial);
			await run({ question: "Which one?", task: { name: "cache behavior audit", intent: "investigation" }, options: OPTIONS });
			const next = "2026-07-31--12-00-00-cache-behavior-audit";
			expect(setSessionName).toHaveBeenCalledWith(next);
			expect(await readFile(join(cwd, ".pi", "plan", `${next}.md`), "utf8")).toContain("## Findings");
		} finally {
			await rm(cwd, { recursive: true, force: true });
		}
	});

	it("resets timing when a follow-up implementation preserves an investigation", async () => {
		const cwd = await mkdtemp(join(tmpdir(), "pi-ask-follow-up-"));
		try {
			const investigation = "2026-07-31--12-00-00-cache-audit";
			await mkdir(join(cwd, ".pi", "plan"), { recursive: true });
			await writeFile(join(cwd, ".pi", "plan", `${investigation}.md`), INVESTIGATION_TEMPLATE.replace("<session-name>", investigation));
			const { run, emitted } = harness(async () => "Keep the trim", true, cwd, investigation);
			await run({ question: "Which one?", task: { name: "fix cache recovery", intent: "implementation" }, options: OPTIONS });
			expect(emitted).toContainEqual([TASK_STARTED_EVENT, { resetTiming: true }]);
		} finally {
			await rm(cwd, { recursive: true, force: true });
		}
	});

	it("shows the question with headlines plus custom write option, and maps the pick back to its option", async () => {
		const { run, selectSpy, emitted } = harness(async () => "Restore verification");
		const result = await run();
		expect(selectSpy).toHaveBeenCalledWith("Which one?", ["Keep the trim", "Restore verification", WRITE_CUSTOM_OPTION]);
		expect(result.isError).toBe(false);
		expect(result.content[0].text).toBe("The User selected: 2. Restore verification — Re-add the commands agents cannot derive.");
		expect(result.details as AskDetails).toMatchObject({ answer: "Restore verification", index: 2 });
		expect(emitted.map(([name]) => name)).toEqual([
			"agent-workflow:checkpoint",
			"agent-workflow:user-wait",
			"agent-workflow:user-wait",
			"agent-workflow:checkpoint",
		]);
		expect(emitted[0]![1]).toMatchObject({ action: "open", kind: "question" });
		expect(emitted.at(-1)![1]).toMatchObject({ action: "resolve", outcome: "selected" });
	});

	it("allows selecting the last custom answer option and both aborts and terminates the turn without error", async () => {
		const { run, selectSpy, abortSpy } = harness(async () => WRITE_CUSTOM_OPTION);
		const result = await run();
		expect(selectSpy).toHaveBeenCalledWith("Which one?", ["Keep the trim", "Restore verification", WRITE_CUSTOM_OPTION]);
		expect(abortSpy).toHaveBeenCalled();
		expect(result.isError).toBe(false);
		expect(result.terminate).toBe(true);
		expect(result.content[0].text).toContain(WRITE_CUSTOM_OPTION);
		expect(result.content[0].text).toContain("stops here");
		expect(result.details as AskDetails).toMatchObject({ answer: WRITE_CUSTOM_OPTION, index: 3 });
	});

	it("resolves Decision timing when the scope question is dismissed", async () => {
		const { run, emitted } = harness(async () => undefined);
		const result = await run();
		expect(result.isError).toBe(false);
		expect(result.content[0].text).toContain("dismissed");
		expect((result.details as AskDetails).answer).toBeNull();
		expect(emitted.at(-1)![1]).toMatchObject({ action: "resolve", outcome: "dismissed" });
	});

	it("never opens a dialog headlessly, where select() would look like a dismissal", async () => {
		const { run, selectSpy } = harness(async () => "Keep the trim", false);
		const result = await run();
		expect(selectSpy).not.toHaveBeenCalled();
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain("ordinary message");
	});

	it("rejects duplicate headlines, which the label-only picker cannot tell apart", async () => {
		const duplicated = [OPTIONS[0], { ...OPTIONS[1], headline: OPTIONS[0].headline }];
		const { run, selectSpy } = harness(async () => "Keep the trim");
		const result = await run({ question: "Which one?", options: duplicated });
		expect(selectSpy).not.toHaveBeenCalled();
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain("distinct");
	});
});

