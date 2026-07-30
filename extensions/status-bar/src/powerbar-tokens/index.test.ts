import { describe, expect, it, vi } from "vitest";
import createTokens from "./index.js";

describe("session status segments", () => {
	it("emits active-branch token and agent counts on the session row", async () => {
		const handlers = new Map<string, (event: unknown, ctx: unknown) => Promise<void>>();
		const emit = vi.fn();
		const pi = {
			events: { emit },
			on: (event: string, handler: (event: unknown, ctx: unknown) => Promise<void>) => handlers.set(event, handler),
		};
		createTokens(pi as never);
		emit.mockClear();

		const ctx = {
			sessionManager: {
				getBranch: () => [
					{ type: "message", message: { role: "user" } },
					{
						type: "message",
						message: { role: "assistant", usage: { input: 79_000, output: 2_300, cost: { total: 0.59 } } },
					},
					{ type: "message", message: { role: "toolResult" } },
				],
			},
		};
		await handlers.get("session_start")!(undefined, ctx);

		expect(emit).toHaveBeenCalledWith("powerbar:update", {
			id: "agent-stats",
			text: "msgs 3 · user 1 · agent 1 · tools 1",
			color: "dim",
			row: 2,
		});
		const [, tokens] = emit.mock.calls.findLast(([, payload]) => payload.id === "tokens")!;
		expect(tokens).toMatchObject({ id: "tokens", row: 2, render: expect.any(Function) });
		const theme = { fg: (color: string, text: string) => `[${color}]${text}` };
		expect(tokens.render(theme)).toBe("[dim]↑79k ↓2.3k [accent]$0.59");
	});

	it.each([
		[4.99, "accent"],
		[5, "warning"],
		[9.99, "warning"],
		[10, "error"],
	])("colors cumulative cost %s as %s", async (cost, color) => {
		const handlers = new Map<string, (event: unknown, ctx: unknown) => Promise<void>>();
		const emit = vi.fn();
		createTokens({
			events: { emit },
			on: (event: string, handler: (event: unknown, ctx: unknown) => Promise<void>) => handlers.set(event, handler),
		} as never);
		emit.mockClear();

		await handlers.get("session_start")!(undefined, {
			sessionManager: {
				getBranch: () => [{
					type: "message",
					message: { role: "assistant", usage: { input: 1, output: 1, cost: { total: cost } } },
				}],
			},
		});

		const [, tokens] = emit.mock.calls.findLast(([, payload]) => payload.id === "tokens")!;
		const theme = { fg: (nextColor: string, text: string) => `[${nextColor}]${text}` };
		expect(tokens.render(theme)).toBe(`[dim]↑1 ↓1 [${color}]$${cost.toFixed(2)}`);
	});
});
