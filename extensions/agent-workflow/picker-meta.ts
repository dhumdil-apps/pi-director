/** Trailing mode-picker rows and pure recommended-row filters. Kept free of Pi imports for unit tests. */

export const RETURN_OPTION = "↩ Return to editor";
export const RETURN_ALIGN_OPTION = "Return → ❓ ALIGN";

export function metaPickerLabels(currentMode: "align" | "spec" | "vibe"): string[] {
  return currentMode === "align" ? [RETURN_OPTION] : [RETURN_OPTION, RETURN_ALIGN_OPTION];
}

/** Align establish/idle is covered by static Return→ALIGN (cross-mode) or already being in Align. */
export function isRedundantAlignEstablish(action: { mode: string; landing?: string }): boolean {
  return action.mode === "align" && (action.landing ?? "establish") === "establish";
}

/** Drop agent Align-establish idle rows so they do not duplicate static Return→ALIGN. */
export function withoutRedundantAlignEstablish<T extends { mode: string; landing?: string }>(actions: T[]): T[] {
  return actions.filter((action) => !isRedundantAlignEstablish(action));
}
