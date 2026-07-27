/**
 * The ask tool — step 3 of the loop, made a keypress instead of a paragraph.
 *
 * Deliberately a plain `ctx.ui.select` rather than a `ui.custom` overlay: the
 * bundle prefers native dialogs, and the dialog itself only needs to carry the
 * short headlines. The reading material lives above it — `renderCall` prints the
 * question with every headline and its full description as soon as the call
 * streams in, so by the time the dialog opens the user has already read the
 * trade-offs and is only picking a letter.
 *
 * A dismissal is not an error: the agent should fall back to asking in prose.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type, type Static } from "@sinclair/typebox";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;

const AskParams = Type.Object({
	question: Type.String({ description: "The question, as one sentence." }),
	options: Type.Array(
		Type.Object({
			headline: Type.String({ description: "The choice in 2-5 words. This is what the picker shows, so it must be distinct from the other headlines." }),
			description: Type.String({ description: "One sentence on what this choice means or costs." }),
		}),
		{
			minItems: MIN_OPTIONS,
			maxItems: MAX_OPTIONS,
			description: `${MIN_OPTIONS}-${MAX_OPTIONS} concrete choices, your recommendation first.`,
		},
	),
});

type AskInput = Static<typeof AskParams>;

export interface AskDetails {
	question: string;
	headlines: string[];
	answer: string | null;
	index: number | null;
}

function result(text: string, details: AskDetails, isError = false) {
	return { content: [{ type: "text" as const, text }], details, isError };
}

export const WRITE_CUSTOM_OPTION = "Write custom answer...";

export function registerAsk(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "ask",
		label: "Ask",
		description: "Ask the user to choose between concrete options, in a native picker. Use whenever a choice would otherwise be made on their behalf; put your recommendation first. For anything that does not fit a short list of options, ask in an ordinary message instead.",
		parameters: AskParams,
		// The dialog owns the screen while it is open, so it must not race another call.
		executionMode: "sequential",
		async execute(_toolCallId, params: AskInput, _signal, _onUpdate, ctx: ExtensionContext) {
			const headlines = params.options.map((option) => option.headline);
			const base: AskDetails = { question: params.question, headlines, answer: null, index: null };

			// Non-TUI select() resolves undefined, which is indistinguishable from a
			// dismissal — so headlessness is decided before the dialog, not after it.
			if (!ctx.hasUI) {
				return result("Error: no interactive UI — ask this in an ordinary message instead.", base, true);
			}
			if (new Set(headlines).size !== headlines.length) {
				return result("Error: option headlines must be distinct — the picker returns the headline, not an index.", base, true);
			}

			const pickerHeadlines = [...headlines, WRITE_CUSTOM_OPTION];
			const choice = await ctx.ui.select(params.question, pickerHeadlines);

			if (choice === undefined) {
				return result("User dismissed the question without answering — ask in an ordinary message, or say which option you would take and why.", base);
			}

			if (choice === WRITE_CUSTOM_OPTION) {
				ctx.abort();
				return result(
					`User selected: ${pickerHeadlines.length}. ${WRITE_CUSTOM_OPTION}`,
					{ ...base, answer: WRITE_CUSTOM_OPTION, index: pickerHeadlines.length },
				);
			}

			const index = headlines.indexOf(choice);
			if (index < 0) {
				return result("User dismissed the question without answering — ask in an ordinary message, or say which option you would take and why.", base);
			}

			const chosen = params.options[index];
			return result(
				`User selected: ${index + 1}. ${chosen.headline} — ${chosen.description}`,
				{ ...base, answer: chosen.headline, index: index + 1 },
			);
		},

		/** The Q&A the dialog cannot show: every headline with its full description. */
		renderCall(args, theme) {
			const options = Array.isArray(args.options) ? (args.options as AskInput["options"]) : [];
			const lines = [theme.fg("toolTitle", theme.bold("ask ")) + theme.fg("text", String(args.question ?? ""))];
			for (const [at, option] of options.entries()) {
				lines.push(theme.fg("accent", `  ${at + 1}. ${option.headline}`));
				if (option.description) lines.push(theme.fg("muted", `     ${option.description}`));
			}
			lines.push(theme.fg("accent", `  ${options.length + 1}. ${WRITE_CUSTOM_OPTION}`));
			return new Text(lines.join("\n"), 0, 0);
		},

		renderResult(toolResult, _options, theme) {
			const details = toolResult.details as AskDetails | undefined;
			// Unanswered, whether dismissed or refused: the result text says which.
			if (!details || details.answer === null) {
				const first = toolResult.content[0];
				return new Text(theme.fg("warning", first?.type === "text" ? first.text : "Unanswered"), 0, 0);
			}
			return new Text(theme.fg("success", "✓ ") + theme.fg("accent", `${details.index}. ${details.answer}`), 0, 0);
		},
	});
}
