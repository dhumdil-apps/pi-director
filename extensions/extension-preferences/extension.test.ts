/**
 * Covers this bundle's divergences from the vendored upstream overlay: the
 * shared frame, the search input only appearing when the list is long enough to
 * need one, and the group header only appearing when there are groups.
 */

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let agentDir: string;

vi.mock("@earendil-works/pi-coding-agent", async () => {
	const tui = await import("@earendil-works/pi-tui");
	return {
		getAgentDir: () => agentDir,
		getSettingsListTheme: () => ({
			label: (text: string) => text,
			value: (text: string) => text,
			description: (text: string) => text,
			cursor: "→ ",
			hint: (text: string) => text,
		}),
		DynamicBorder: class {
			render(width: number): string[] {
				return ["─".repeat(width)];
			}
			invalidate(): void {}
		},
		...tui,
	};
});

const theme = { fg: (_color: string, text: string) => text, bold: (text: string) => text } as any;

type Registration = { name: string; settings: unknown[] };

async function renderOverlay(registrations: Registration[]): Promise<string[]> {
	const { default: extension } = await import("./extension.js");
	const listeners = new Map<string, (data: unknown) => void>();
	const commands = new Map<string, { handler: (args: unknown, ctx: unknown) => Promise<void> }>();
	extension({
		events: { on: (name: string, cb: (data: unknown) => void) => listeners.set(name, cb) },
		registerCommand: (name: string, spec: any) => commands.set(name, spec),
	} as any);

	for (const registration of registrations) {
		listeners.get("pi-extension-settings:register")!(registration);
	}

	let lines: string[] = [];
	await commands.get("extension-settings")!.handler(undefined, {
		ui: {
			custom: async (factory: any) => {
				const component = factory({ requestRender: () => {} }, theme, undefined, () => {});
				lines = component.render(80);
			},
			notify: () => {},
		},
	});
	return lines;
}

function setting(id: string) {
	return { id, label: `Setting ${id}`, defaultValue: "", values: ["a", "b"] };
}

beforeEach(() => {
	agentDir = mkdtempSync(join(tmpdir(), "extension-preferences-overlay-"));
});

afterEach(() => {
	rmSync(agentDir, { recursive: true, force: true });
	vi.resetModules();
});

describe("extension settings overlay", () => {
	it("frames the overlay top and bottom", async () => {
		const lines = await renderOverlay([{ name: "powerbar", settings: [setting("line1-left")] }]);
		expect(lines.some((line) => line.startsWith("─".repeat(10)))).toBe(true);
		expect(lines.at(-1)).toBe("─".repeat(80));
	});

	it("drops the group header and its indent for a lone registrant", async () => {
		const lines = await renderOverlay([{ name: "powerbar", settings: [setting("line1-left")] }]);
		expect(lines.join("\n")).not.toContain("powerbar");
		expect(lines.some((line) => line.includes("→ Setting line1-left"))).toBe(true);
	});

	it("keeps group headers once more than one extension registers", async () => {
		const lines = await renderOverlay([
			{ name: "powerbar", settings: [setting("line1-left")] },
			{ name: "other", settings: [setting("thing")] },
		]);
		expect(lines.join("\n")).toContain("powerbar");
		expect(lines.some((line) => line.includes("  Setting thing"))).toBe(true);
	});

	it("shows the search input only once the list is long enough to need it", async () => {
		const short = await renderOverlay([{ name: "powerbar", settings: [setting("line1-left")] }]);
		expect(short.join("\n")).toContain("Enter/Space to change");
		expect(short.join("\n")).not.toContain("Type to search");

		vi.resetModules();
		const long = await renderOverlay([
			{ name: "powerbar", settings: Array.from({ length: 9 }, (_, i) => setting(`line${i}-left`)) },
		]);
		expect(long.join("\n")).toContain("Type to search");
	});
});
