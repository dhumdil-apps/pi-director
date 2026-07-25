import { visibleWidth } from "@earendil-works/pi-tui";
import { describe, expect, it } from "vitest";
import { renderBar, renderPercentageBar, type Segment } from "./render.js";
import type { PowerbarSettings } from "./settings.js";

const theme = {
	fg: (_color: string, text: string) => text,
	getFgAnsi: () => "",
} as any;

function layout(...lines: Array<{ left?: string[]; right?: string[] }>): PowerbarSettings {
	const padded = [...lines, {}, {}, {}, {}].slice(0, 4);
	return { lines: padded.map((line) => ({ left: line.left ?? [], right: line.right ?? [] })) };
}

const settings = layout({ left: ["branch"], right: ["model"] });

describe("shared percentage bar", () => {
	it("renders block meters with the requested segment count", () => {
		const rendered = renderPercentageBar(25, 4, theme, "accent");
		expect(rendered.replace(/\x1b\[[0-9;]*m/g, "")).toBe("█      ");
	});
});

describe("status bar transient segments", () => {
	it("shows active transient segments without adding them to saved settings", () => {
		const segments = new Map<string, Segment>([
			["branch", { id: "branch", text: "main" }],
			["model", { id: "model", text: "sonnet" }],
			["notice", { id: "notice", text: "notice", icon: "⚡", transient: true }],
		]);
		expect(renderBar(segments, settings, theme, 80)[0]).toContain("sonnet · ⚡ notice");
	});

	it("puts a transient segment on the line it declares", () => {
		const segments = new Map<string, Segment>([
			["branch", { id: "branch", text: "main" }],
			["notice", { id: "notice", text: "notice", transient: true, row: 2 }],
		]);
		const lines = renderBar(segments, settings, theme, 80);
		expect(lines).toHaveLength(2);
		expect(lines[0]).not.toContain("notice");
		expect(lines[1]).toContain("notice");
	});

	it("does not show an unconfigured non-transient segment", () => {
		const segments = new Map<string, Segment>([
			["branch", { id: "branch", text: "main" }],
			["model", { id: "model", text: "sonnet" }],
			["hidden", { id: "hidden", text: "hidden" }],
		]);
		expect(renderBar(segments, settings, theme, 80).join("\n")).not.toContain("hidden");
	});
});

describe("status bar lines", () => {
	const segments = new Map<string, Segment>([
		["session", { id: "session", text: "SI-1234-status-layout" }],
		["branch", { id: "branch", text: "main" }],
		["tokens", { id: "tokens", text: "↑79k ↓2.3k $0.59" }],
		["agent", { id: "agent", text: "msgs 9 / user 2 / agent 3" }],
		["cpu", { id: "cpu", text: "cpu", bar: 10, suffix: "10%" }],
		["net", { id: "net", text: "net ↓1G ↑2G" }],
		["model", { id: "model", text: "sonnet" }],
		["context", { id: "context", text: "ctx", bar: 10, suffix: "10%" }],
		["quota", { id: "quota", text: "5h", bar: 20, suffix: "20%" }],
	]);

	it("renders each configured line independently aligned", () => {
		const lines = renderBar(
			segments,
			layout(
				{ left: ["session", "branch"], right: ["model"] },
				{ left: ["agent", "context", "tokens"] },
				{ left: ["cpu", "net"], right: ["quota"] },
			),
			theme,
			100,
		);

		expect(lines).toHaveLength(3);
		expect(lines[0]).toContain("SI-1234-status-layout · main");
		expect(lines[0]).toContain("sonnet");
		expect(lines[1]).toContain("msgs 9 / user 2 / agent 3 · ctx");
		expect(lines[1]).toMatch(/ctx.*10% · ↑79k ↓2\.3k \$0\.59/);
		expect(lines[2]).toContain("net ↓1G ↑2G");
		expect(lines[2]).toContain("5h");
		expect(lines.every((line) => visibleWidth(line) === 100)).toBe(true);
	});

	it("keeps an empty line between used lines as a blank row", () => {
		const lines = renderBar(segments, layout({ left: ["branch"] }, {}, { left: ["cpu"] }), theme, 40);
		expect(lines).toHaveLength(3);
		expect(lines[1]).toBe(" ".repeat(40));
		expect(lines[2]).toContain("cpu");
	});

	it("drops trailing empty lines", () => {
		const lines = renderBar(segments, layout({ left: ["branch"] }, { left: ["tokens"] }), theme, 40);
		expect(lines).toHaveLength(2);
	});

	it("falls back to one blank line when nothing has content", () => {
		expect(renderBar(new Map(), layout({ left: ["branch"] }), theme, 40)).toEqual([" ".repeat(40)]);
	});
});
