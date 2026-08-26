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

/** User-facing option row: short descriptive slug only (no letter prefix or confidence chrome). */
export function pickerLabel(option: RankedOption, _index?: number): string {
  return option.label;
}

/** Custom-answer footnotes: plain labels in display order (confidence stays internal). */
export function optionReferences(options: RankedOption[]): string[] {
  return options.map((option) => option.label);
}
