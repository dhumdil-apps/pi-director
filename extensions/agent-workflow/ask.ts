import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type, type Static } from "@sinclair/typebox";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import { MODE_LABEL, resolveWorkflowMode, type WorkflowMode } from "./mode.js";
import { applyMode, startModeContinuation } from "./mode-picker.js";
import { duringUserWait } from "./user-wait.js";

const MIN_QUESTIONS = 1;
const MAX_QUESTIONS = 4;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;
const RECOMMENDED_SUFFIX = " (recommended)";
export const WRITE_CUSTOM_ANSWER = "📝 Write a custom answer...";
export const USE_RECOMMENDED_SPEC = `Use recommended → ${MODE_LABEL.spec}`;
export const USE_RECOMMENDED_VIBE = `Use recommended → ${MODE_LABEL.vibe}`;
const ROUTE_OPTIONS = [USE_RECOMMENDED_SPEC, USE_RECOMMENDED_VIBE] as const;
const RESERVED_LABELS = [WRITE_CUSTOM_ANSWER, ...ROUTE_OPTIONS] as const;
type AskRouteMode = Exclude<WorkflowMode, "questionnaire">;

const OptionParams = Type.Object({
  value: Type.String({
    description: "Stable concise value returned for this option.",
  }),
  label: Type.String({
    description: "Distinct 2-6 word picker label.",
  }),
  description: Type.String({
    description: "One sentence explaining the consequence or trade-off.",
  }),
  recommended: Type.Optional(
    Type.Boolean({
      description: "Set true for exactly one option in each question; omit it for all others.",
    }),
  ),
});

const QuestionParams = Type.Object({
  id: Type.String({ description: "Distinct stable identifier." }),
  context: Type.String({
    description: "Why this decision matters and the evidence behind it.",
  }),
  prompt: Type.String({ description: "The focused question, in one sentence." }),
  options: Type.Array(OptionParams, {
    minItems: MIN_OPTIONS,
    maxItems: MAX_OPTIONS,
    description: `${MIN_OPTIONS}-${MAX_OPTIONS} concrete choices with exactly one recommendation.`,
  }),
});

const AskParams = Type.Object({
  questions: Type.Array(QuestionParams, {
    minItems: MIN_QUESTIONS,
    maxItems: MAX_QUESTIONS,
    description: `${MIN_QUESTIONS}-${MAX_QUESTIONS} related consequential questions.`,
  }),
});

type AskInput = Static<typeof AskParams>;
type AskQuestion = AskInput["questions"][number];
type AskOption = AskQuestion["options"][number];

export interface AskAnswer {
  id: string;
  value: string;
  label: string;
  wasCustom: boolean;
  optionReferences?: string[];
}

export interface AskDetails {
  answers: AskAnswer[];
  cancelled: boolean;
  unanswered: string[];
  routedMode?: AskRouteMode;
}

function validateInput(params: AskInput): void {
  const questionIds = params.questions.map((question) => question.id.trim());
  if (new Set(questionIds).size !== questionIds.length) {
    throw new Error("Question IDs must be distinct.");
  }

  for (const question of params.questions) {
    const labels = question.options.map((option) => option.label.trim());
    const values = question.options.map((option) => option.value.trim());
    if (new Set(labels).size !== labels.length) {
      throw new Error(`Option labels for ${question.id} must be distinct.`);
    }
    if (new Set(values).size !== values.length) {
      throw new Error(`Option values for ${question.id} must be distinct.`);
    }
    if (labels.some((label) => RESERVED_LABELS.some((reserved) => reserved === label))) {
      throw new Error(`Option labels for ${question.id} must not use reserved ask-action labels.`);
    }
    if (question.options.filter((option) => option.recommended).length !== 1) {
      throw new Error(`Question ${question.id} must have exactly one recommended option.`);
    }
  }
}

function orderedOptions(question: AskQuestion): AskOption[] {
  return [
    ...question.options.filter((option) => option.recommended),
    ...question.options.filter((option) => !option.recommended),
  ];
}

function optionLetter(index: number): string {
  return String.fromCharCode("A".charCodeAt(0) + index);
}

function pickerLabel(option: AskOption, index: number): string {
  return `${optionLetter(index)}. ${option.label}${option.recommended ? RECOMMENDED_SUFFIX : ""}`;
}

function optionReferences(options: AskOption[]): string[] {
  return options.map((option, index) => `${optionLetter(index)} = ${option.label}`);
}

function optionAnswer(question: AskQuestion, option: AskOption): AskAnswer {
  return {
    id: question.id,
    value: option.value,
    label: option.label,
    wasCustom: false,
  };
}

function acceptRemainingRecommendations(questions: AskQuestion[], answers: AskAnswer[]): AskAnswer[] {
  const answeredIds = new Set(answers.map((answer) => answer.id));
  return questions
    .filter((question) => !answeredIds.has(question.id))
    .map((question) =>
      optionAnswer(
        question,
        question.options.find((option) => option.recommended)!,
      ),
    );
}

function routedMode(choice: string): AskRouteMode | undefined {
  if (choice === USE_RECOMMENDED_SPEC) return "spec";
  if (choice === USE_RECOMMENDED_VIBE) return "vibe";
  return undefined;
}

function routeKickoff(mode: AskRouteMode): string {
  const action =
    mode === "spec"
      ? "research the aligned direction and shape it into an actionable proposal"
      : "implement the aligned direction and verify the changed behavior";
  return `Record every User-accepted answer from the completed ask result in the artifact, then ${action}.`;
}

function resultText(details: AskDetails): string {
  const answers = details.answers.map((answer) => {
    const result = `${answer.id}: ${answer.wasCustom ? "User wrote" : "User selected"}: ${answer.label}`;
    return answer.optionReferences ? `${result}\nOption references: ${answer.optionReferences.join(", ")}` : result;
  });
  if (details.cancelled) {
    answers.push(
      `The User cancelled with these questions unresolved: ${details.unanswered.join(", ")}. Do not repeat them in prose.`,
    );
  } else if (details.routedMode) {
    answers.push(`The User accepted all remaining recommendations and routed directly to ${details.routedMode}.`);
  }
  return answers.join("\n");
}

export function registerAsk(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "ask",
    label: "Ask",
    description:
      "Ask the User 1-4 related alignment questions through native option pickers. Use from any interactive workflow mode when concrete answers are possible; explain trade-offs and set recommended: true on exactly one option per question, omitting it from the others. Batch only independent questions whose wording and options remain valid regardless of sibling answers. For dependent follow-ups, make a fresh ask call after incorporating the earlier answer. Ordinary answers return in the same turn; explicit recommended-answer routes start their selected mode.",
    promptSnippet: "Ask focused alignment questions with recommended selectable answers",
    promptGuidelines: [
      "Use ask instead of ending with prose questions when concrete possible answers can be offered. Ordinary answers are mode-neutral; only the User's explicit recommended-answer route changes mode.",
      "Batch only independent questions. If an answer can change a later question's wording or options, stop the batch and make a fresh ask call after incorporating that answer.",
      "Call ask without sibling tools so an explicit recommended-answer route can terminate Q&A cleanly before its selected Spec/Vibe continuation.",
      "When the answer needs a user-supplied value, do not offer a selectable ‘specify’ option: direct the User to the built-in Write a custom answer entry, which opens the input field.",
    ],
    parameters: AskParams,
    // Native dialogs own input while open and must not race sibling tool calls.
    executionMode: "sequential",

    async execute(_toolCallId, params: AskInput, _signal, _onUpdate, ctx: ExtensionContext) {
      if (!ctx.hasUI) {
        throw new Error("Ask requires an interactive UI.");
      }
      validateInput(params);

      const answers: AskAnswer[] = [];
      const checkpoint = openCheckpoint(pi, "question");
      try {
        for (const [index, question] of params.questions.entries()) {
          const options = orderedOptions(question);
          const labels = [...options.map(pickerLabel), WRITE_CUSTOM_ANSWER, ...ROUTE_OPTIONS];
          const title =
            params.questions.length === 1
              ? question.prompt
              : `${index + 1}/${params.questions.length} · ${question.prompt}`;

          let answered = false;
          while (!answered) {
            const choice = await duringUserWait(pi, "question", () => ctx.ui.select(title, labels));
            if (choice === undefined) {
              const details: AskDetails = {
                answers,
                cancelled: true,
                unanswered: params.questions.slice(index).map((item) => item.id),
              };
              resolveCheckpoint(pi, checkpoint.id, "cancelled");
              return {
                content: [{ type: "text" as const, text: resultText(details) }],
                details,
              };
            }

            const route = routedMode(choice);
            if (route) {
              answers.push(...acceptRemainingRecommendations(params.questions, answers));
              const details: AskDetails = {
                answers,
                cancelled: false,
                unanswered: [],
                routedMode: route,
              };
              resolveCheckpoint(pi, checkpoint.id, route);
              const previous = resolveWorkflowMode(ctx.sessionManager.getBranch());
              await applyMode(pi, ctx, route, previous);
              startModeContinuation(pi, route, previous, undefined, routeKickoff(route));
              return {
                content: [{ type: "text" as const, text: resultText(details) }],
                details,
                terminate: true,
              };
            }

            if (choice === WRITE_CUSTOM_ANSWER) {
              const custom = await duringUserWait(pi, "question", () =>
                ctx.ui.input(`Custom answer · ${question.prompt}`, "Type an answer"),
              );
              const trimmed = custom?.trim();
              if (!trimmed) continue;
              answers.push({
                id: question.id,
                value: trimmed,
                label: trimmed,
                wasCustom: true,
                optionReferences: optionReferences(options),
              });
              answered = true;
              continue;
            }

            const selected = options.find((option, optionIndex) => pickerLabel(option, optionIndex) === choice);
            if (!selected) continue;
            answers.push(optionAnswer(question, selected));
            answered = true;
          }
        }
      } catch (error) {
        resolveCheckpoint(pi, checkpoint.id, "failure");
        throw error;
      }

      const details: AskDetails = {
        answers,
        cancelled: false,
        unanswered: [],
      };
      resolveCheckpoint(pi, checkpoint.id, "answered");
      return {
        content: [{ type: "text" as const, text: resultText(details) }],
        details,
      };
    },

    renderCall(args, theme) {
      const questions = Array.isArray(args.questions) ? (args.questions as AskInput["questions"]) : [];
      const lines = [theme.fg("toolTitle", theme.bold("ask"))];
      for (const [index, question] of questions.entries()) {
        lines.push(theme.fg("text", `${index + 1}. ${question.prompt ?? ""}`));
        if (question.context) lines.push(theme.fg("muted", `   ${question.context}`));
        const options = Array.isArray(question.options) ? orderedOptions(question) : [];
        for (const [optionIndex, option] of options.entries()) {
          lines.push(theme.fg("accent", `   • ${pickerLabel(option, optionIndex)}`));
          if (option.description) {
            lines.push(theme.fg("muted", `     ${option.description}`));
          }
        }
      }
      return new Text(lines.join("\n"), 0, 0);
    },

    renderResult(toolResult, _options, theme) {
      const details = toolResult.details as AskDetails | undefined;
      if (!details) {
        const first = toolResult.content[0];
        return new Text(first?.type === "text" ? first.text : "", 0, 0);
      }
      const lines = details.answers.map((answer) => {
        let line = `${theme.fg("success", "✓ ")}${theme.fg("accent", answer.id)}: ${answer.wasCustom ? theme.fg("muted", "(wrote) ") : ""}${answer.label}`;
        if (answer.optionReferences) {
          line += `\n   ${theme.fg("muted", answer.optionReferences.join(" · "))}`;
        }
        return line;
      });
      if (details.cancelled) {
        lines.push(theme.fg("warning", `Cancelled · unresolved: ${details.unanswered.join(", ")}`));
      } else if (details.routedMode) {
        lines.push(theme.fg("success", `Routed to ${MODE_LABEL[details.routedMode]}`));
      }
      return new Text(lines.join("\n"), 0, 0);
    },
  });
}
