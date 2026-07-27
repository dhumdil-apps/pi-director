import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let agentDir: string;

vi.mock("@earendil-works/pi-coding-agent", () => ({
	getAgentDir: () => agentDir,
}));

function writeStored(powerbar: Record<string, string>): void {
	writeFileSync(join(agentDir, "settings-extensions.json"), JSON.stringify({ powerbar }));
}

beforeEach(() => {
	agentDir = mkdtempSync(join(tmpdir(), "powerbar-settings-"));
});

afterEach(() => {
	rmSync(agentDir, { recursive: true, force: true });
});

describe("powerbar layout settings", () => {
	it("defaults to the layout the fixed per-producer rows used to render", async () => {
		const { loadSettings } = await import("./settings.js");
		expect(loadSettings().lines).toEqual([
			{ left: ["git-branch", "session-name"], right: ["provider", "model"] },
			{ left: ["agent-stats", "tokens"], right: [] },
			{ left: ["cpu", "ram", "disk", "net"], right: ["sub-hourly", "sub-weekly"] },
			{ left: [], right: [] },
		]);
	});

	it("splits a stored left/right layout across the lines its segments sat on", async () => {
		writeStored({ left: "session-name,tokens,cpu", right: "model,sub-weekly" });
		const { loadSettings } = await import("./settings.js");
		expect(loadSettings().lines).toEqual([
			{ left: ["session-name"], right: ["model"] },
			{ left: ["tokens"], right: [] },
			{ left: ["cpu"], right: ["sub-weekly"] },
			{ left: [], right: [] },
		]);
	});

	it("leaves an already-migrated layout alone", async () => {
		writeStored({ left: "cpu", right: "", "line1-left": "tokens", "line1-right": "" });
		const { loadSettings } = await import("./settings.js");
		const lines = loadSettings().lines;
		expect(lines[0]).toEqual({ left: ["tokens"], right: [] });
		// Line 3 keeps its default rather than picking up the legacy `cpu`.
		expect(lines[2].left).toEqual(["cpu", "ram", "disk", "net"]);
	});

	it("keeps an explicitly emptied line empty", async () => {
		writeStored({ "line1-left": "tokens", "line2-left": "", "line3-left": "cpu" });
		const { loadSettings } = await import("./settings.js");
		expect(loadSettings().lines[1]).toEqual({ left: [], right: [] });
	});
});
