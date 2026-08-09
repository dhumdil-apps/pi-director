import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";

export const WORKFLOW_NOTICE_TYPE = "agent-workflow:notice";

interface WorkflowNotice {
  content: string;
  level: "info" | "warning";
}

/** Register durable notice rendering without putting the notice in LLM context. */
export function registerWorkflowNotices(pi: ExtensionAPI): void {
  pi.registerEntryRenderer(WORKFLOW_NOTICE_TYPE, (entry, _options, theme) => {
    const notice = entry.data as Partial<WorkflowNotice> | undefined;
    const content = typeof notice?.content === "string" ? notice.content : "";
    const color = notice?.level === "warning" ? "warning" : "muted";
    return new Text(theme.fg(color, content), 0, 0);
  });
}

/** Persist a headless notice context-free and keep print-mode feedback visible. */
export function appendHeadlessNotice(
  pi: Pick<ExtensionAPI, "appendEntry">,
  mode: ExtensionContext["mode"],
  content: string,
  level: WorkflowNotice["level"],
): void {
  pi.appendEntry(WORKFLOW_NOTICE_TYPE, { content, level } satisfies WorkflowNotice);
  // JSON mode owns stdout/stderr framing; print mode has no entry renderer.
  if (mode === "print") process.stderr.write(`${content}\n`);
}
