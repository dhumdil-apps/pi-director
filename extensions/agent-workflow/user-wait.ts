import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/** Display-only signal for time the Agent is blocked on a human-owned dialog. */
export const USER_WAIT_EVENT = "agent-workflow:user-wait";

export type UserWaitReason = "question" | "approval";

export interface UserWaitEvent {
	waiting: boolean;
	reason: UserWaitReason;
}

/** Always close the wait interval, including dismissed or failed dialogs. */
export async function duringUserWait<T>(
	pi: Pick<ExtensionAPI, "events">,
	reason: UserWaitReason,
	operation: () => Promise<T>,
): Promise<T> {
	pi.events.emit?.(USER_WAIT_EVENT, { waiting: true, reason } satisfies UserWaitEvent);
	try {
		return await operation();
	} finally {
		pi.events.emit?.(USER_WAIT_EVENT, { waiting: false, reason } satisfies UserWaitEvent);
	}
}
