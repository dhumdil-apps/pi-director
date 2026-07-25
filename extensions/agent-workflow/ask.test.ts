import { describe, expect, it, vi } from "vitest";
import { type AskDetails, registerAsk, WRITE_CUSTOM_OPTION } from "./ask.js";

const OPTIONS = [
	{ headline: "Keep the trim", description: "Ship the shorter file as it stands." },
	{ headline: "Restore verification", description: "Re-add the commands agents cannot derive." },
];

function harness(select: (title: string, options: string[]) => Promise<string | undefined>, hasUI = true) {
	const tools: any[] = [];
	registerAsk({ registerTool: vi.fn((tool: any) => tools.push(tool)) } as any);
	const selectSpy = vi.fn(select);
	const abortSpy = vi.fn();
	const ctx = { hasUI, ui: { select: selectSpy }, abort: abortSpy };
	const run = (params: any = { question: "Which one?", options: OPTIONS }) =>
		tools[0].execute("call-1", params, undefined, undefined, ctx as any);
	return { tool: tools[0], run, selectSpy, abortSpy };
}

describe("ask tool", () => {
	it("registers one sequential tool taking a question and 2-4 options", () => {
		const { tool } = harness(async () => undefined);
		expect(tool.name).toBe("ask");
		// Sequential: the dialog owns the screen, so it must not race another call.
		expect(tool.executionMode).toBe("sequential");
		expect(Object.keys(tool.parameters.properties)).toEqual(["question", "options"]);
		expect(tool.parameters.properties.options.minItems).toBe(2);
		expect(tool.parameters.properties.options.maxItems).toBe(4);
	});

	it("shows the question with headlines plus custom write option, and maps the pick back to its option", async () => {
		const { run, selectSpy } = harness(async () => "Restore verification");
		const result = await run();
		expect(selectSpy).toHaveBeenCalledWith("Which one?", ["Keep the trim", "Restore verification", WRITE_CUSTOM_OPTION]);
		expect(result.isError).toBe(false);
		expect(result.content[0].text).toBe("User selected: 2. Restore verification — Re-add the commands agents cannot derive.");
		expect(result.details as AskDetails).toMatchObject({ answer: "Restore verification", index: 2 });
	});

	it("allows selecting the last custom answer option and aborts the turn without error", async () => {
		const { run, selectSpy, abortSpy } = harness(async () => WRITE_CUSTOM_OPTION);
		const result = await run();
		expect(selectSpy).toHaveBeenCalledWith("Which one?", ["Keep the trim", "Restore verification", WRITE_CUSTOM_OPTION]);
		expect(abortSpy).toHaveBeenCalled();
		expect(result.isError).toBe(false);
		expect(result.content[0].text).toBe(`User selected: 3. ${WRITE_CUSTOM_OPTION}`);
		expect(result.details as AskDetails).toMatchObject({ answer: WRITE_CUSTOM_OPTION, index: 3 });
	});

	it("treats a dismissal as an answerless result, not an error", async () => {
		const { run } = harness(async () => undefined);
		const result = await run();
		expect(result.isError).toBe(false);
		expect(result.content[0].text).toContain("dismissed");
		expect((result.details as AskDetails).answer).toBeNull();
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

