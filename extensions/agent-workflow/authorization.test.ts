import { describe, expect, it, vi } from "vitest";
import { deriveAuthorization, recordAuthorization, registerAuthorization } from "./authorization.js";

function harness(mode: "vibe" | "spec") {
	const branch: any[] = [{ type: "custom", customType: "agent-workflow:mode", data: { mode } }];
	const handlers = new Map<string, Array<(event: any, ctx: any) => any>>();
	const emitted: Array<[string, unknown]> = [];
	const notify = vi.fn();
	const pi = {
		on: vi.fn((name: string, handler: any) => handlers.set(name, [...(handlers.get(name) ?? []), handler])),
		appendEntry: vi.fn((customType: string, data: unknown) => branch.push({ type: "custom", customType, data })),
		events: { emit: vi.fn((name: string, data: unknown) => emitted.push([name, data])) },
		getSessionName: () => "dashboard-polish",
	};
	registerAuthorization(pi as never);
	const ctx = { cwd: "/work", hasUI: true, ui: { notify }, sessionManager: { getBranch: () => branch } };
	return { pi, branch, handlers, emitted, notify, ctx };
}

describe("workflow authorization", () => {
	it("marks each Spec User interval as requiring approval", async () => {
		const h = harness("spec");
		await h.handlers.get("input")![0]({ source: "interactive" }, h.ctx);
		expect(deriveAuthorization(h.branch)).toBe("required");
		await h.handlers.get("input")![0]({ source: "extension" }, h.ctx);
		expect(h.branch.filter((entry) => entry.customType === "agent-workflow:authorization")).toHaveLength(1);
	});

	it("blocks Spec source edits while allowing plan metadata", async () => {
		const h = harness("spec");
		await h.handlers.get("input")![0]({ source: "interactive" }, h.ctx);
		const guard = h.handlers.get("tool_call")![0];
		await expect(guard({ toolName: "edit", input: { path: "/work/src/app.ts" } }, h.ctx)).resolves.toMatchObject({ block: true, terminate: true });
		await expect(guard({ toolName: "write", input: { path: "/work/.pi/plan/dashboard-polish.md" } }, h.ctx)).resolves.toBeUndefined();

		recordAuthorization(h.pi as never, "approved", "dashboard-polish");
		await expect(guard({ toolName: "edit", input: { path: "/work/src/app.ts" } }, h.ctx)).resolves.toBeUndefined();
	});

	it("warns once for an unapproved Spec shell interval", async () => {
		const h = harness("spec");
		await h.handlers.get("input")![0]({ source: "interactive" }, h.ctx);
		const start = h.handlers.get("tool_execution_start")![0];
		await start({ toolName: "bash" }, h.ctx);
		await start({ toolName: "bash" }, h.ctx);
		expect(h.notify).toHaveBeenCalledTimes(1);
	});

	it("lets Vibe mutate and enters Execute automatically", async () => {
		const h = harness("vibe");
		await h.handlers.get("input")![0]({ source: "interactive" }, h.ctx);
		expect(deriveAuthorization(h.branch)).toBeUndefined();
		await h.handlers.get("tool_execution_start")![0]({ toolName: "edit" }, h.ctx);
		expect(h.branch.at(-1)).toMatchObject({ customType: "agent-workflow:phase", data: { phase: "execute" } });
	});
});
