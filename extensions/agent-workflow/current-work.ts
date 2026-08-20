/** Agent-owned one-liner; Progress Tracker displays it while a run is in flight. */
const CURRENT_WORK_LINE = /^\*\*Current work:\*\*\s*(.*)$/m;

/** First `**Current work:**` line; empty or missing means omit the slot. */
export function readCurrentWork(contents: string): string | undefined {
  const value = contents.match(CURRENT_WORK_LINE)?.[1]?.trim();
  return value || undefined;
}
