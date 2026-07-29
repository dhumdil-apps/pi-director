import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
	EXTENSION_GROUPS,
	EXTENSION_PRESENTATIONS,
	presentationCoverageErrors,
	renderExtensionDeck,
} from "./extensions.js";
import { USAGE_CHART_END, USAGE_CHART_START, renderWelcomeText } from "./welcome.js";

const BUNDLE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function expectInOrder(text: string, ...parts: string[]): void {
	let previous = -1;
	for (const part of parts) {
		const index = text.indexOf(part);
		expect(index).toBeGreaterThan(previous);
		previous = index;
	}
}

function activeExtensionNames(): string[] {
	const pkg = JSON.parse(readFileSync(join(BUNDLE_ROOT, "package.json"), "utf8"));
	return pkg.pi.extensions.map((entry: string) => entry.split("/").filter(Boolean).at(-2));
}

describe("session dashboard extension metadata", () => {
	it("has presentation metadata for exactly the active manifest extensions", () => {
		const names = activeExtensionNames();
		expect(presentationCoverageErrors(names)).toEqual([]);
		expect(EXTENSION_PRESENTATIONS.map((presentation) => presentation.name).sort()).toEqual([...names].sort());
	});

	it("loads the project-memory notice after the session dashboard", () => {
		const names = activeExtensionNames();
		expect(names.indexOf("session-dashboard")).toBeLessThan(names.indexOf("project-memory"));
	});

	// The catalog is hand-written prose, so nothing kept it in step with the
	// manifest — it silently missed the Inspector bridge and terminal-keys until
	// an audit caught them. Names only: descriptions stay editorial.
	it("lists every active extension in the docs catalog", () => {
		const catalog = readFileSync(join(BUNDLE_ROOT, "docs", "EXTENSIONS.md"), "utf8");
		const title = (name: string) => name.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
		const missing = activeExtensionNames().filter((name) => !catalog.includes(`**${title(name)}**`));
		expect(missing).toEqual([]);
	});

	it("renders each active extension under its group, in group order, without prose", () => {
		const names = activeExtensionNames();
		const deck = renderExtensionDeck(names);
		for (const group of EXTENSION_GROUPS) expect(deck).toContain(`**${group.title}**`);
		for (const presentation of EXTENSION_PRESENTATIONS) {
			expect(presentation.description).not.toBe("");
			expect(deck).toContain(presentation.name);
		}
		for (const prose of ["README", " — "]) expect(deck).not.toContain(prose);
		expectInOrder(deck, "**Display**", "**Usage**", "**Workflow**", "**Config**");
	});

	it("renders the current directory before the hint without a footer when omitted", () => {
		const welcome = renderWelcomeText({
			workingDirectory: "~/work",
			contextFiles: "**📦 Context files**\n- `AGENTS.md`",
			tip: "🧠 `/init` · 📊 `/usage` · ⚙️ `/extension-settings` · ❓ `/help`",
		});
		expect(welcome.startsWith("~/work")).toBe(true);
		expectInOrder(welcome, "~/work", "🧠 `/init`", "**📦 Context files**");
		for (const omitted of ["🧩 **Extensions**", "Session context", "Quick reference"]) {
			expect(welcome).not.toContain(omitted);
		}
	});

	it("places the hint and chart before context, with memory notice last", () => {
		const welcome = renderWelcomeText({
			workingDirectory: "~/work",
			tip: "❓ `/help`",
			usageChart: '{"model":true}',
			contextFiles: "**📦 Context files**\n- `AGENTS.md`",
			memoryNotice: "> ⚠️ Project memory needs review.",
		});
		expectInOrder(welcome, "~/work", "❓ `/help`", USAGE_CHART_START, '{"model":true}', USAGE_CHART_END, "**📦 Context files**", "Project memory needs review");
	});
});
