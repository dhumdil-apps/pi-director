import { describe, expect, it } from "vitest";
import { handoffKickoff } from "./handoff.js";
import { derivePhaseFromBranch } from "./phase.js";

const userMessage = (content: unknown) => ({ type: "message", message: { role: "user", content } }) as never;

describe("derivePhaseFromBranch", () => {
	it("reads the kickoff handoff.ts actually sends", () => {
		const kickoff = handoffKickoff({ name: "x", planPath: ".pi/plan/x.md" } as never);
		expect(derivePhaseFromBranch([userMessage(kickoff)])).toBe("execute");
	});

	it("reads a kickoff delivered as content blocks", () => {
		const blocks = [{ type: "text", text: "Execute the approved plan at .pi/plan/x.md." }];
		expect(derivePhaseFromBranch([userMessage(blocks)])).toBe("execute");
	});

	it("is undefined for a session with no plan in play, so no badge is rendered", () => {
		expect(derivePhaseFromBranch([])).toBeUndefined();
		expect(derivePhaseFromBranch([userMessage("fix the typo in README")])).toBeUndefined();
	});

	it("ignores an assistant quoting the kickoff", () => {
		const quoted = {
			type: "message",
			message: { role: "assistant", content: "Execute the approved plan at .pi/plan/x.md." },
		} as never;
		expect(derivePhaseFromBranch([quoted])).toBeUndefined();
	});
});
