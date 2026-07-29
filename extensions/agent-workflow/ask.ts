/**
 * The ask tool — the boundary between Explore and Plan, made a keypress instead of a paragraph.
 *
 * Deliberately a plain `ctx.ui.select` rather than a `ui.custom` overlay: the
 * bundle prefers native dialogs, and the dialog itself only needs to carry the
 * short headlines. The reading material lives above it — `renderCall` prints the
 * question with every headline and its full description as soon as the call
 * streams in, so by the time the dialog opens the User has already read the
 * trade-offs and is only picking a letter.
 *
 * A dismissal is not an error: the Agent should fall back to asking in prose.
 *
 * Actors are named ("the User", "the Agent") rather than addressed as "you", so
 * a sentence that mentions both reads the same in the tool text, in the model's
 * reply, and in the plan file.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type, type Static } from "@sinclair/typebox";
import { recordWorkflowPhase } from "./phase.js";
import { duringUserWait } from "./user-wait.js";

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
			description: `${MIN_OPTIONS}-${MAX_OPTIONS} concrete choices, the Agent's recommendation first.`,
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
		description: "Ask the User to choose between concrete options, in a native picker. Use at least once before every initial plan or re-plan, and whenever another choice would otherwise be made on the User's behalf; put the Agent's recommendation first. For anything that does not fit a short list of options, the Agent asks in an ordinary message instead.",
		parameters: AskParams,
		// The dialog owns the screen while it is open, so it must not race another call.
		executionMode: "sequential",
		async execute(_toolCallId, params: AskInput, _signal, _onUpdate, ctx: ExtensionContext) {
			const headlines = params.options.map((option) => option.headline);
			const base: AskDetails = { question: params.question, headlines, answer: null, index: null };

			// Non-TUI select() resolves undefined, which is indistinguishable from a
			// dismissal — so headlessness is decided before the dialog, not after it.
			if (!ctx.hasUI) {
				return result("Error: no interactive UI — the Agent must ask this in an ordinary message instead.", base, true);
			}
			if (new Set(headlines).size !== headlines.length) {
				return result("Error: option headlines must be distinct — the picker returns the headline, not an index.", base, true);
			}

			// The mandatory scope question is the boundary between discovery and
			// composing the plan. Human response time is paused separately below.
			recordWorkflowPhase(pi, "plan");
			const pickerHeadlines = [...headlines, WRITE_CUSTOM_OPTION];
			const choice = await duringUserWait(pi, "question", () =>
				ctx.ui.select(params.question, pickerHeadlines),
			);

			if (choice === undefined) {
				return result("The User dismissed the question without answering — the Agent asks in an ordinary message, or says which option it would take and why.", base);
			}

			if (choice === WRITE_CUSTOM_OPTION) {
				// Belt and braces: the abort can be missed when the loop checks the
				// signal, so the result also asks the batch to terminate. Terminating
				// only takes effect when every result in the batch does, hence both.
				ctx.abort();
				return {
					...result(
						`The User chose to write a custom answer instead: ${pickerHeadlines.length}. ${WRITE_CUSTOM_OPTION}. The Agent stops here and waits for it.`,
						{ ...base, answer: WRITE_CUSTOM_OPTION, index: pickerHeadlines.length },
					),
					terminate: true,
				};
			}

			const index = headlines.indexOf(choice);
			if (index < 0) {
				return result("The User dismissed the question without answering — the Agent asks in an ordinary message, or says which option it would take and why.", base);
			}

			const chosen = params.options[index];
			return result(
				`The User selected: ${index + 1}. ${chosen.headline} — ${chosen.description}`,
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
