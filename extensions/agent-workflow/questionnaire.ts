import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type, type Static } from "@sinclair/typebox";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import { duringUserWait } from "./user-wait.js";

const MIN_QUESTIONS = 1;
const MAX_QUESTIONS = 4;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;
const RECOMMENDED_SUFFIX = " (recommended)";
export const WRITE_CUSTOM_ANSWER = "Write a custom answer...";

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
  recommended: Type.Boolean({
    description: "True for exactly one option in each question.",
  }),
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

const QuestionnaireParams = Type.Object({
  questions: Type.Array(QuestionParams, {
    minItems: MIN_QUESTIONS,
    maxItems: MAX_QUESTIONS,
    description: `${MIN_QUESTIONS}-${MAX_QUESTIONS} related consequential questions.`,
  }),
});

type QuestionnaireInput = Static<typeof QuestionnaireParams>;
type QuestionnaireQuestion = QuestionnaireInput["questions"][number];
type QuestionnaireOption = QuestionnaireQuestion["options"][number];

export interface QuestionnaireAnswer {
  id: string;
  value: string;
  label: string;
  wasCustom: boolean;
}

export interface QuestionnaireDetails {
  answers: QuestionnaireAnswer[];
  cancelled: boolean;
  unanswered: string[];
}

function validateInput(params: QuestionnaireInput): void {
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
    if (labels.includes(WRITE_CUSTOM_ANSWER)) {
      throw new Error(`Option labels for ${question.id} must not use the custom-answer label.`);
    }
    if (question.options.filter((option) => option.recommended).length !== 1) {
      throw new Error(`Question ${question.id} must have exactly one recommended option.`);
    }
  }
}

function orderedOptions(question: QuestionnaireQuestion): QuestionnaireOption[] {
  return [
    ...question.options.filter((option) => option.recommended),
    ...question.options.filter((option) => !option.recommended),
  ];
}

function pickerLabel(option: QuestionnaireOption): string {
  return `${option.label}${option.recommended ? RECOMMENDED_SUFFIX : ""}`;
}

function resultText(details: QuestionnaireDetails): string {
  const answers = details.answers.map(
    (answer) =>
      `${answer.id}: ${answer.wasCustom ? "User wrote" : "User selected"}: ${answer.label}`,
  );
  if (details.cancelled) {
    answers.push(
      `The User cancelled with these questions unresolved: ${details.unanswered.join(", ")}. Do not repeat them in prose.`,
    );
  }
  return answers.join("\n");
}

export function registerQuestionnaire(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "questionnaire",
    label: "Questionnaire",
    description:
      "Ask the User 1-4 related alignment questions through native option pickers. Use in Ask when concrete answers are possible; explain trade-offs and mark exactly one recommendation per question. Answers return in the same turn.",
    promptSnippet:
      "Ask focused alignment questions with recommended selectable answers",
    promptGuidelines: [
      "In Ask mode, use questionnaire instead of ending with prose questions when concrete possible answers can be offered; explain trade-offs and mark one recommendation per question.",
    ],
    parameters: QuestionnaireParams,
    // Native dialogs own input while open and must not race sibling tool calls.
    executionMode: "sequential",

    async execute(
      _toolCallId,
      params: QuestionnaireInput,
      _signal,
      _onUpdate,
      ctx: ExtensionContext,
    ) {
      if (!ctx.hasUI) {
        throw new Error("Questionnaire requires an interactive UI.");
      }
      validateInput(params);

      const answers: QuestionnaireAnswer[] = [];
      const checkpoint = openCheckpoint(pi, "question");
      try {
        for (const [index, question] of params.questions.entries()) {
          const options = orderedOptions(question);
          const labels = [
            ...options.map(pickerLabel),
            WRITE_CUSTOM_ANSWER,
          ];
          const title =
            params.questions.length === 1
              ? question.prompt
              : `${index + 1}/${params.questions.length} · ${question.prompt}`;

          let answered = false;
          while (!answered) {
            const choice = await duringUserWait(pi, "question", () =>
              ctx.ui.select(title, labels),
            );
            if (choice === undefined) {
              const details: QuestionnaireDetails = {
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
              });
              answered = true;
              continue;
            }

            const selected = options.find(
              (option) => pickerLabel(option) === choice,
            );
            if (!selected) continue;
            answers.push({
              id: question.id,
              value: selected.value,
              label: selected.label,
              wasCustom: false,
            });
            answered = true;
          }
        }
      } catch (error) {
        resolveCheckpoint(pi, checkpoint.id, "failure");
        throw error;
      }

      const details: QuestionnaireDetails = {
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
      const questions = Array.isArray(args.questions)
        ? (args.questions as QuestionnaireInput["questions"])
        : [];
      const lines = [theme.fg("toolTitle", theme.bold("questionnaire"))];
      for (const [index, question] of questions.entries()) {
        lines.push(theme.fg("text", `${index + 1}. ${question.prompt ?? ""}`));
        if (question.context) lines.push(theme.fg("muted", `   ${question.context}`));
        const options = Array.isArray(question.options)
          ? orderedOptions(question)
          : [];
        for (const option of options) {
          lines.push(
            theme.fg(
              "accent",
              `   • ${option.label}${option.recommended ? RECOMMENDED_SUFFIX : ""}`,
            ),
          );
          if (option.description) {
            lines.push(theme.fg("muted", `     ${option.description}`));
          }
        }
      }
      return new Text(lines.join("\n"), 0, 0);
    },

    renderResult(toolResult, _options, theme) {
      const details = toolResult.details as QuestionnaireDetails | undefined;
      if (!details) {
        const first = toolResult.content[0];
        return new Text(first?.type === "text" ? first.text : "", 0, 0);
      }
      const lines = details.answers.map(
        (answer) =>
          `${theme.fg("success", "✓ ")}${theme.fg("accent", answer.id)}: ${answer.wasCustom ? theme.fg("muted", "(wrote) ") : ""}${answer.label}`,
      );
      if (details.cancelled) {
        lines.push(theme.fg("warning", `Cancelled · unresolved: ${details.unanswered.join(", ")}`));
      }
      return new Text(lines.join("\n"), 0, 0);
    },
  });
}
