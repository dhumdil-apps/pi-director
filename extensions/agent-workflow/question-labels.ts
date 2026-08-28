/** Pure ask/decide option ordering and user-facing labels (no Pi / agent-api imports). */

export interface RankedOption {
  value: string;
  label: string;
  description: string;
  confidence: number;
}

export function orderedOptions<T extends RankedOption>(options: T[]): T[] {
  // Stable sort retains Agent-supplied order when confidence scores tie.
  return [...options].sort((left, right) => right.confidence - left.confidence);
}

/** A/B/C letter for display order (0 → A). Confidence stays internal ranking only. */
export function optionLetter(index: number): string {
  if (index < 0) return "A";
  if (index < 26) return String.fromCharCode(65 + index);
  return `A${index + 1}`;
}

const DESC_ROW_MAX = 72;

/** Truncate description for narrow TUI picker rows. */
export function shortenDescription(description: string, max = DESC_ROW_MAX): string {
  const text = description.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/**
 * User-facing option row: `A. label — description` when description is present.
 * Keeps scannable everyday wording visible in the native select list.
 */
export function pickerLabel(option: RankedOption, index = 0): string {
  const head = `${optionLetter(index)}. ${option.label}`;
  const desc = option.description?.trim();
  if (!desc) return head;
  return `${head} — ${shortenDescription(desc)}`;
}

/**
 * Picker title: plain prompt, with short context when provided (D6).
 * Multiline when context exists so the why-it-matters line is visible.
 */
export function pickerTitle(prompt: string, context?: string): string {
  const p = prompt.replace(/\s+/g, " ").trim();
  const c = context?.replace(/\s+/g, " ").trim();
  if (!c) return p;
  const shortCtx = c.length > 120 ? `${c.slice(0, 119).trimEnd()}…` : c;
  return `${p}\n${shortCtx}`;
}

/** Custom-answer footnotes: same A. chrome as picker rows (confidence stays internal). */
export function optionReferences(options: RankedOption[]): string[] {
  return options.map((option, index) => pickerLabel(option, index));
}
