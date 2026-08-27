/** User-facing ## Digest; Show plan displays this section only. */
const DIGEST_HEADING = /^## Digest[ \t]*$/m;
const NEXT_HEADING = /^## /m;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/** Body of ## Digest until the next heading. Empty, missing, or comment-only means omit. */
export function readPlanDigest(contents: string): string | undefined {
  const start = contents.search(DIGEST_HEADING);
  if (start < 0) return undefined;
  const afterHeading = contents.indexOf("\n", start);
  if (afterHeading < 0) return undefined;
  const rest = contents.slice(afterHeading + 1);
  const next = rest.search(NEXT_HEADING);
  const cleaned = (next < 0 ? rest : rest.slice(0, next)).replace(HTML_COMMENT, "").trim();
  return cleaned || undefined;
}
