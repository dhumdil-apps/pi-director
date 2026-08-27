/** Agent-owned one-liner; Progress Tracker working row shows it while a run is in flight. */
const CURRENT_WORK_LINE = /^\*\*Current work:\*\*[ \t]*(.*)$/m;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/** Same-line phrase only. Empty, missing, or HTML-comment-only means omit the slot. */
export function readCurrentWork(contents: string): string | undefined {
  const cleaned = contents.match(CURRENT_WORK_LINE)?.[1]?.replace(HTML_COMMENT, "").replace(/\s+/g, " ").trim();
  return cleaned || undefined;
}
