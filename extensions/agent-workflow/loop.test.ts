import { describe, expect, it, vi } from "vitest";
import {
	APPROVED_ENTRY_TYPE,
	CLOSED_ENTRY_TYPE,
	deriveLoop,
	isImplementing,
	LEGACY_MODE_ENTRY_TYPE,
	markApproved,
	markClosed,
} from "./loop.js";

/** The shape sessionManager.getBranch() actually returns for pi.sendMessage markers. */
function fact(customType: string, details: unknown) {
	return { type: "custom_message", customType, display: false, content: "", details };
}

function branchCtx(entries: unknown[], sessionName?: string) {
	return { sessionManager: { getBranch: () => entries, getSessionName: () => sessionName } } as never;
}

function harness() {
	const sent: Array<[any, any]> = [];
	const userMessages: string[] = [];
	const pi = {
		sendMessage: vi.fn((message: any, options: any) => sent.push([message, options])),
		sendUserMessage: vi.fn((content: string) => userMessages.push(content)),
	};
	return { pi: pi as never, sent, userMessages };
}

describe("deriveLoop", () => {
	it("reports planning with no facts on the branch", () => {
		const state = deriveLoop(branchCtx([]));
		expect(state).toEqual({});
		expect(isImplementing(state)).toBe(false);
	});

	it("reports implementing once a task is approved", () => {
		const state = deriveLoop(branchCtx([fact(APPROVED_ENTRY_TYPE, { task: "dashboard-polish" })]));
		expect(state.approvedTask).toBe("dashboard-polish");
		expect(isImplementing(state)).toBe(true);
	});

	it("ends the loop when the approved task is closed", () => {
		const state = deriveLoop(
			branchCtx([fact(APPROVED_ENTRY_TYPE, { task: "dashboard-polish" }), fact(CLOSED_ENTRY_TYPE, { task: "dashboard-polish" })]),
		);
		expect(state).toEqual({ approvedTask: "dashboard-polish", closedTask: "dashboard-polish" });
		expect(isImplementing(state)).toBe(false);
	});

	it("keeps implementing when the close-out names a different task", () => {
		// A second loop in the same session: task A closed, task B approved after it.
		const state = deriveLoop(
			branchCtx([
				fact(APPROVED_ENTRY_TYPE, { task: "cache-recovery" }),
				fact(CLOSED_ENTRY_TYPE, { task: "cache-recovery" }),
				fact(APPROVED_ENTRY_TYPE, { task: "dashboard-polish" }),
			]),
		);
		expect(state).toEqual({ approvedTask: "dashboard-polish", closedTask: "cache-recovery" });
		expect(isImplementing(state)).toBe(true);
	});

	it("takes the last write of each fact", () => {
		const state = deriveLoop(
			branchCtx([fact(APPROVED_ENTRY_TYPE, { task: "first-task" }), fact(APPROVED_ENTRY_TYPE, { task: "second-task" })]),
		);
		expect(state.approvedTask).toBe("second-task");
	});

	it("ignores malformed facts and unrelated entries", () => {
		const state = deriveLoop(
			branchCtx([
				{ type: "message", message: { role: "assistant" } },
				fact(APPROVED_ENTRY_TYPE, { task: 42 }),
				fact(APPROVED_ENTRY_TYPE, undefined),
				fact("some-other-extension:marker", { task: "not-ours" }),
			]),
		);
		expect(state).toEqual({});
	});

	it("upgrades a legacy implement-mode marker using the session name", () => {
		const state = deriveLoop(branchCtx([fact(LEGACY_MODE_ENTRY_TYPE, { mode: "implement" })], "dashboard-polish"));
		expect(state.approvedTask).toBe("dashboard-polish");
		expect(isImplementing(state)).toBe(true);
	});

	it("leaves a legacy plan-mode marker (or a nameless session) in planning", () => {
		expect(deriveLoop(branchCtx([fact(LEGACY_MODE_ENTRY_TYPE, { mode: "plan" })], "dashboard-polish"))).toEqual({});
		expect(deriveLoop(branchCtx([fact(LEGACY_MODE_ENTRY_TYPE, { mode: "implement" })], undefined))).toEqual({});
	});
});

describe("loop facts", () => {
	it("writes a hidden approval fact and kicks off the turn when given a kickoff", () => {
		const { pi, sent, userMessages } = harness();
		markApproved(pi, "dashboard-polish", "Execute the approved plan.");
		const [marker, options] = sent[0];
		expect(marker.customType).toBe(APPROVED_ENTRY_TYPE);
		expect(marker.display).toBe(false);
		expect(marker.details).toEqual({ task: "dashboard-polish" });
		expect(options).toEqual({ triggerTurn: false });
		expect(userMessages).toEqual(["Execute the approved plan."]);
	});

	it("writes the approval fact without a turn when no kickoff is given", () => {
		const { pi, sent, userMessages } = harness();
		markApproved(pi, "dashboard-polish");
		expect(sent).toHaveLength(1);
		expect(userMessages).toEqual([]);
	});

	it("writes a hidden close-out fact", () => {
		const { pi, sent } = harness();
		markClosed(pi, "dashboard-polish");
		const [marker, options] = sent[0];
		expect(marker.customType).toBe(CLOSED_ENTRY_TYPE);
		expect(marker.display).toBe(false);
		expect(marker.details).toEqual({ task: "dashboard-polish" });
		expect(options).toEqual({ triggerTurn: false });
	});

	it("round-trips a written fact back through deriveLoop", () => {
		const { pi, sent } = harness();
		markApproved(pi, "dashboard-polish");
		markClosed(pi, "dashboard-polish");
		const branch = sent.map(([message]) => fact(message.customType, message.details));
		expect(isImplementing(deriveLoop(branchCtx(branch)))).toBe(false);
	});
});
