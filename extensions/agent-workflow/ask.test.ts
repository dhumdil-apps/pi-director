import { describe, expect, it, vi } from "vitest";
import { type AskDetails, registerAsk, WRITE_CUSTOM_OPTION } from "./ask.js";

const CONTEXT = "The evidence supports the shorter file; choosing otherwise restores commands the Agent cannot derive.";

const OPTIONS = [
	{ headline: "Keep the trim", description: "Ship the shorter file as it stands." },
	{ headline: "Restore verification", description: "Re-add the commands agents cannot derive." },
];

function harness(select: (title: string, options: string[]) => Promise<string | undefined>, hasUI = true) {
	const tools: any[] = [];
	const emitted: Array<[string, any]> = [];
	const branch: any[] = [];
	registerAsk({
		registerTool: vi.fn((tool: any) => tools.push(tool)),
		appendEntry: vi.fn((customType: string, data: unknown) => branch.push({ type: "custom", customType, data })),
		events: { emit: vi.fn((name: string, value: unknown) => emitted.push([name, value])) },
	} as any);
	const selectSpy = vi.fn(select);
	const abortSpy = vi.fn();
	const ctx = { hasUI, ui: { select: selectSpy }, abort: abortSpy, sessionManager: { getBranch: () => branch } };
	const run = (params: any = { context: CONTEXT, question: "Which one?", options: OPTIONS }) =>
		tools[0].execute("call-1", params, undefined, undefined, ctx as any);
	return { tool: tools[0], run, selectSpy, abortSpy, emitted };
}

describe("ask tool", () => {
	it("registers one sequential tool taking a question and 2-4 options", () => {
		const { tool } = harness(async () => undefined);
		expect(tool.name).toBe("ask");
		// Sequential: the dialog owns the screen, so it must not race another call.
		expect(tool.executionMode).toBe("sequential");
		expect(Object.keys(tool.parameters.properties)).toEqual(["context", "question", "options"]);
		expect(tool.parameters.required).toContain("context");
		expect(tool.parameters.properties.options.minItems).toBe(2);
		expect(tool.parameters.properties.options.maxItems).toBe(4);
		expect(tool.description).toContain("never for routine implementation choices");
	});

	it("shows the question with headlines plus custom write option, and maps the pick back to its option", async () => {
		const { run, selectSpy, emitted } = harness(async () => "Restore verification");
		const result = await run();
		expect(selectSpy).toHaveBeenCalledWith("Which one?", ["Keep the trim", "Restore verification", WRITE_CUSTOM_OPTION]);
		expect(result.isError).toBe(false);
		expect(result.content[0].text).toBe("The User selected: 2. Restore verification — Re-add the commands agents cannot derive.");
		expect(result.details as AskDetails).toMatchObject({ context: CONTEXT, answer: "Restore verification", index: 2 });
		expect(emitted.map(([name]) => name)).toEqual([
			"agent-workflow:checkpoint",
			"agent-workflow:user-wait",
			"agent-workflow:user-wait",
			"agent-workflow:checkpoint",
		]);
		expect(emitted[0]![1]).toMatchObject({ action: "open", kind: "question" });
		expect(emitted.at(-1)![1]).toMatchObject({ action: "resolve", outcome: "selected" });
	});

	it("renders the required evidence and recommendation context before the question and options", () => {
		const { tool } = harness(async () => undefined);
		const rendered = tool.renderCall(
			{ context: CONTEXT, question: "Which one?", options: OPTIONS },
			{ fg: (_token: string, text: string) => text, bold: (text: string) => text },
		).render(240).join("\n");
		expect(rendered.indexOf(CONTEXT)).toBeLessThan(rendered.indexOf("Which one?"));
		expect(rendered.indexOf("Which one?")).toBeLessThan(rendered.indexOf("Keep the trim"));
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
		const result = await run({ context: CONTEXT, question: "Which one?", options: duplicated });
		expect(selectSpy).not.toHaveBeenCalled();
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain("distinct");
	});
});
