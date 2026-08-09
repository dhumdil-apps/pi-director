import { describe, expect, it } from "vitest";
import { handoffKickoff } from "./handoff.js";
import { derivePhaseFromBranch, hasApprovedPlan, PHASE_EVENT } from "./phase.js";

const userMessage = (content: unknown) => ({ type: "message", message: { role: "user", content } }) as never;
const phaseEntry = (phase: string) => ({ type: "custom", customType: PHASE_EVENT, data: { phase } }) as never;

describe("derivePhaseFromBranch", () => {
	it("reads the kickoff handoff.ts actually sends", () => {
		const kickoff = handoffKickoff({ name: "x", planPath: ".pi/plan/x.md" } as never);
		expect(derivePhaseFromBranch([userMessage(kickoff)])).toBe("execute");
	});

	it("reads a kickoff delivered as content blocks", () => {
		const blocks = [{ type: "text", text: "Execute the approved plan at .pi/plan/x.md." }];
		expect(derivePhaseFromBranch([userMessage(blocks)])).toBe("execute");
	});

	it("uses the latest persisted transition and maps legacy Plan to Explore", () => {
		const entries = [
			phaseEntry("explore"),
			userMessage("Execute the approved plan at .pi/plan/x.md."),
			phaseEntry("execute"),
			phaseEntry("plan"),
		];
		expect(derivePhaseFromBranch(entries)).toBe("explore");
		expect(derivePhaseFromBranch([...entries, phaseEntry("execute")])).toBe("execute");
	});

	it("is undefined for a session with no phase signal", () => {
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

	it("identifies the approved task without treating another task as approved", () => {
		const entries = [userMessage("Execute the approved plan at .pi/plan/x.md.")];
		expect(hasApprovedPlan(entries, "x")).toBe(true);
		expect(hasApprovedPlan(entries, "y")).toBe(false);
	});

	it("recognizes persisted Spec authorization as approval", () => {
		const entries = [{
			type: "custom",
			customType: "agent-workflow:authorization",
			data: { state: "approved", task: "x" },
		}] as any;
		expect(hasApprovedPlan(entries, "x")).toBe(true);
		expect(hasApprovedPlan(entries, "y")).toBe(false);
	});
});
