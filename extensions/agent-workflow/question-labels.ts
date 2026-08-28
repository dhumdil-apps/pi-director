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

/** User-facing option row: `A. {value}` slug chrome. Description stays off the native select row. */
export function pickerLabel(option: RankedOption, index = 0): string {
  return `${optionLetter(index)}. ${option.value}`;
}

/** Native picker title: prompt only (context stays in chat renderCall). */
export function pickerTitle(prompt: string, _context?: string): string {
  return prompt.replace(/\s+/g, " ").trim();
}

/** Custom-answer footnotes: same A. chrome as picker rows (confidence stays internal). */
export function optionReferences(options: RankedOption[]): string[] {
  return options.map((option, index) => pickerLabel(option, index));
}
