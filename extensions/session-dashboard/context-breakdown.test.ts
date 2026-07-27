import { describe, expect, it } from "vitest";
import {
	buildContextBreakdown,
	estimateTextTokens,
	measureSystemPrompt,
	measureTools,
	renderBreakdown,
} from "./context-breakdown.js";

const AGENTS = "Follow the house style. ".repeat(20);
const CLAUDE = "Claude-specific working agreement. ".repeat(10);
const BASE = "You are pi, a coding agent. ".repeat(30);
const SKILLS = "<skills><skill>docx</skill><skill>pdf</skill></skills>";

const PROMPT = `${BASE}\n${AGENTS}\n${SKILLS}\n${CLAUDE}`;

const FILES = [
	{ path: "/home/m/Github/AGENTS.md", content: AGENTS },
	{ path: "/home/m/Github/CLAUDE.md", content: CLAUDE },
];

describe("estimateTextTokens", () => {
	it("uses the host's chars/4 heuristic, rounding up", () => {
		expect(estimateTextTokens("")).toBe(0);
		expect(estimateTextTokens("abc")).toBe(1);
		expect(estimateTextTokens("abcd")).toBe(1);
		expect(estimateTextTokens("abcde")).toBe(2);
	});
});

describe("measureSystemPrompt", () => {
	it("attributes each context file its exact span", () => {
		const segments = measureSystemPrompt(PROMPT, FILES);
		const byLabel = Object.fromEntries(segments.map((s) => [s.label, s.tokens]));
		expect(byLabel["…/Github/AGENTS.md"]).toBe(Math.ceil(AGENTS.length / 4));
		expect(byLabel["…/Github/CLAUDE.md"]).toBe(Math.ceil(CLAUDE.length / 4));
	});

	it("measures the skills block when present and omits it otherwise", () => {
		const withSkills = measureSystemPrompt(PROMPT, []);
		expect(withSkills.find((s) => s.label === "skills")?.tokens).toBe(Math.ceil(SKILLS.length / 4));
		expect(measureSystemPrompt(BASE, []).find((s) => s.label === "skills")).toBeUndefined();
	});

	it("reports a loaded file that is not in the prompt as zero", () => {
		const extra = { path: "/var/elsewhere/AGENTS.md", content: "unused text" };
		const segments = measureSystemPrompt(PROMPT, [...FILES, extra]);
		expect(segments.find((s) => s.label === "…/elsewhere/AGENTS.md")?.tokens).toBe(0);
	});

	it("leaves everything unclaimed as the base prompt", () => {
		const segments = measureSystemPrompt(PROMPT, FILES);
		const base = segments.find((s) => s.label === "base prompt")!;
		// Two newline separators survive as base, alongside pi's own text.
		const unclaimed = PROMPT.length - AGENTS.length - CLAUDE.length - SKILLS.length;
		expect(base.tokens).toBe(Math.ceil(unclaimed / 4));
	});

	it("never attributes more than the prompt holds", () => {
		const segments = measureSystemPrompt(PROMPT, FILES);
		const sum = segments.reduce((total, s) => total + s.tokens, 0);
		// Per-segment ceilings can each round up by one token.
		expect(sum).toBeGreaterThanOrEqual(Math.floor(PROMPT.length / 4));
		expect(sum).toBeLessThanOrEqual(Math.ceil(PROMPT.length / 4) + segments.length);
	});

	it("tildifies a home-relative path", () => {
		const segments = measureSystemPrompt(PROMPT, [FILES[0]], "/home/m");
		expect(segments.some((s) => s.label === "…/Github/AGENTS.md")).toBe(true);
	});
});

describe("measureTools", () => {
	it("sizes the serialized schemas and counts the tools", () => {
		const tools = [
			{ name: "read", description: "Read a file", parameters: { type: "object", properties: { path: { type: "string" } } } },
			{ name: "write", description: "Write a file", parameters: { type: "object" } },
		];
		const segment = measureTools(tools);
		expect(segment.label).toBe("tools (2)");
		expect(segment.tokens).toBeGreaterThan(0);
	});

	it("handles a tool with no description or schema", () => {
		expect(measureTools([{ name: "bare" }]).tokens).toBeGreaterThan(0);
	});

	it("is empty for no tools", () => {
		expect(measureTools([])).toEqual({ label: "tools (0)", tokens: 0 });
	});
});

describe("renderBreakdown", () => {
	it("orders segments largest first and drops empty ones", () => {
		const block = renderBreakdown([
			{ label: "small", tokens: 10 },
			{ label: "empty", tokens: 0 },
			{ label: "large", tokens: 900 },
		]);
		expect(block).not.toContain("empty");
		expect(block.indexOf("large")).toBeLessThan(block.indexOf("small"));
	});

	it("prefers the provider's total over the sum of the estimates", () => {
		const block = renderBreakdown([{ label: "base prompt", tokens: 10_000 }], 84_000, 200_000);
		expect(block).toContain("total -> 84.0k / 200.0k · 42%");
	});

	it("marks the total as an estimate when the provider reported none", () => {
		const block = renderBreakdown([{ label: "base prompt", tokens: 10_000 }], null, 200_000);
		expect(block).toContain("total -> ≈ 10.0k / 200.0k · 5%");
	});

	it("omits the window share when the window is unknown", () => {
		expect(renderBreakdown([{ label: "base prompt", tokens: 10_000 }])).toContain("total -> ≈ 10.0k\n");
	});

	it("keeps a loaded context file visible when it was not included in the prompt", () => {
		const block = renderBreakdown([{ label: "…/work/AGENTS.md", tokens: 0, showWhenZero: true }]);
		expect(block).toContain("…/work/AGENTS.md -> 0");
	});

	it("is empty when nothing was measured", () => {
		expect(renderBreakdown([{ label: "base prompt", tokens: 0 }])).toBe("");
	});
});

describe("buildContextBreakdown", () => {
	const input = {
		systemPrompt: PROMPT,
		contextFiles: FILES,
		tools: [{ name: "read", description: "Read a file", parameters: { type: "object" } }],
		contextWindow: 200_000,
		home: "/home/m",
	};

	it("renders every source in one block", () => {
		const block = buildContextBreakdown({ ...input, totalTokens: 84_000 });
		expect(block).toContain("conversation");
		expect(block).toContain("base prompt");
		expect(block).toContain("…/Github/AGENTS.md");
		expect(block).toContain("skills");
		expect(block).toContain("tools (1)");
		expect(block).toContain("total -> 84.0k");
	});

	it("derives the conversation as the remainder of the reported total", () => {
		const overhead =
			measureSystemPrompt(PROMPT, FILES, "/home/m").reduce((sum, s) => sum + s.tokens, 0) +
			measureTools(input.tools).tokens;
		const block = buildContextBreakdown({ ...input, totalTokens: 84_000 });
		const conversation = Number(/conversation\s+\S+\s+([\d.]+)k/.exec(block)![1]) * 1000;
		// formatTokens rounds to one decimal, so compare at 100-token resolution.
		expect(conversation).toBeCloseTo(84_000 - overhead, -2);
	});

	it("omits the conversation when no total has been reported yet", () => {
		expect(buildContextBreakdown({ ...input, totalTokens: null })).not.toContain("conversation");
	});

	it("never reports a negative conversation when the estimate overshoots", () => {
		const block = buildContextBreakdown({ ...input, totalTokens: 10 });
		expect(block).not.toContain("conversation");
		expect(block).toContain("total -> 10");
	});
});
