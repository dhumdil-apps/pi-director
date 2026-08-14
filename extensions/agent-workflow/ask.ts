import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type, type Static } from "@sinclair/typebox";
import { agentApiTemplate, agentApiText } from "./agent-api.js";
import { openCheckpoint, resolveCheckpoint } from "./checkpoint.js";
import { MODE_LABEL, type WorkflowMode } from "./mode.js";
import { ASK_SETTLEMENT_EVENT } from "./mode-picker.js";
import { duringUserWait } from "./user-wait.js";

export const WRITE_CUSTOM_ANSWER = "📝 Write a custom answer...";
export const PROCEED_WITH_BEST_SPEC = `Proceed with best → ${MODE_LABEL.spec}`;
export const PROCEED_WITH_BEST_VIBE = `Proceed with best → ${MODE_LABEL.vibe}`;
const ROUTE_OPTIONS = [PROCEED_WITH_BEST_SPEC, PROCEED_WITH_BEST_VIBE] as const;
type AskRouteMode = Exclude<WorkflowMode, "align">;

const OptionParams = Type.Object({
  value: Type.String({ description: agentApiText("tool.ask.option.value") }),
  label: Type.String({ description: agentApiText("tool.ask.option.label") }),
  description: Type.String({ description: agentApiText("tool.ask.option.description") }),
  confidence: Type.Integer({ description: agentApiText("tool.ask.option.confidence") }),
});

const QuestionParams = Type.Object({
  id: Type.String({ description: agentApiText("tool.ask.question.id") }),
  context: Type.String({ description: agentApiText("tool.ask.question.context") }),
  prompt: Type.String({ description: agentApiText("tool.ask.question.prompt") }),
  customAnswerLabel: Type.Optional(
    Type.String({
      description: agentApiText("tool.ask.question.custom-answer-label"),
    }),
  ),
  options: Type.Array(OptionParams, { description: agentApiText("tool.ask.question.options") }),
});

const AskParams = Type.Object({
  questions: Type.Array(QuestionParams, { description: agentApiText("tool.ask.questions") }),
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

function orderedOptions(question: AskQuestion): AskOption[] {
  // Stable sort retains Agent-supplied order when confidence scores tie.
  return [...question.options].sort((left, right) => right.confidence - left.confidence);
}

function optionLetter(index: number): string {
  return String.fromCharCode("A".charCodeAt(0) + index);
}

function pickerLabel(option: AskOption, index: number): string {
  return `${optionLetter(index)}. ${option.label} · confidence ${option.confidence}/5`;
}

function customAnswerLabel(question: AskQuestion): string {
  const intent = question.customAnswerLabel?.trim();
  return intent ? `${WRITE_CUSTOM_ANSWER} → ${intent}` : WRITE_CUSTOM_ANSWER;
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

function acceptBestAnswers(questions: AskQuestion[]): AskAnswer[] {
  return questions.flatMap((question) => {
    const best = orderedOptions(question)[0];
    return best ? [optionAnswer(question, best)] : [];
  });
}

function canAcceptBest(questions: AskQuestion[]): boolean {
  return questions.every((question) => question.options.length > 0);
}

function routedMode(choice: string): AskRouteMode | undefined {
  if (choice === PROCEED_WITH_BEST_SPEC) return "spec";
  if (choice === PROCEED_WITH_BEST_VIBE) return "vibe";
  return undefined;
}

function transcriptText(answer: AskAnswer, question: AskQuestion | undefined): string {
  const result = `${answer.id}: ${answer.wasCustom ? "User wrote" : "User selected"}: ${answer.label}`;
  if (!question)
    return answer.optionReferences ? `${result}\nOption references: ${answer.optionReferences.join(", ")}` : result;

  const options = orderedOptions(question).map(
    (option, index) =>
      `  ${optionLetter(index)}. ${option.label} · confidence ${option.confidence}/5 — ${option.description}`,
  );
  return [
    `Question: ${question.prompt}`,
    `Context: ${question.context}`,
    "Options:",
    ...options,
    `Answer: ${answer.wasCustom ? "User wrote" : "User selected"}: ${answer.label}`,
  ].join("\n");
}

function resultText(details: AskDetails, questions: AskQuestion[]): string {
  const answers = details.answers.map((answer) =>
    transcriptText(
      answer,
      questions.find((question) => question.id === answer.id),
    ),
  );
  if (details.cancelled) {
    answers.push(agentApiTemplate("message.ask.cancelled", { unanswered: details.unanswered.join(", ") }));
  } else if (details.routedMode) {
    answers.push(agentApiTemplate("message.ask.routed", { mode: details.routedMode }));
  }
  return answers.join("\n");
}

export function registerAsk(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "ask",
    label: "Ask",
    description: agentApiText("tool.ask.description"),
    promptSnippet: agentApiText("tool.ask.prompt-snippet"),
    parameters: AskParams,
    // Native dialogs own input while open and must not race sibling tool calls.
    executionMode: "sequential",

    async execute(_toolCallId, params: AskInput, _signal, _onUpdate, ctx: ExtensionContext) {
      if (!ctx.hasUI) {
        throw new Error("Ask requires an interactive UI.");
      }

      const answers: AskAnswer[] = [];
      if (params.questions.length === 0) {
        const details: AskDetails = { answers, cancelled: false, unanswered: [] };
        pi.appendEntry(ASK_SETTLEMENT_EVENT, { outcome: "answered" });
        return {
          content: [{ type: "text" as const, text: "No questions were supplied; Ask made no changes." }],
          details,
        };
      }
      const checkpoint = openCheckpoint(pi, "question");
      try {
        for (const [index, question] of params.questions.entries()) {
          const options = orderedOptions(question);
          const customLabel = customAnswerLabel(question);
          const remainingQuestions = params.questions.slice(index);
          const routes = canAcceptBest(remainingQuestions) ? ROUTE_OPTIONS : [];
          const labels = [...options.map(pickerLabel), customLabel, ...routes];
          const title =
            params.questions.length === 1
              ? question.prompt
              : `${index + 1}/${params.questions.length} · ${question.prompt}`;

          let answered = false;
          while (!answered) {
            const choice = await duringUserWait(pi, "question", () => ctx.ui.select(title, labels));
            if (choice === undefined) {
              const details: AskDetails = {
                answers: [],
                cancelled: true,
                unanswered: params.questions.map((item) => item.id),
              };
              resolveCheckpoint(pi, checkpoint.id, "cancelled");
              pi.appendEntry(ASK_SETTLEMENT_EVENT, { outcome: "cancelled" });
              return {
                content: [{ type: "text" as const, text: resultText(details, params.questions) }],
                details,
              };
            }

            const route = routedMode(choice);
            if (route) {
              answers.push(...acceptBestAnswers(remainingQuestions));
              const details: AskDetails = {
                answers,
                cancelled: false,
                unanswered: [],
                routedMode: route,
              };
              resolveCheckpoint(pi, checkpoint.id, route);
              // The current run still carries its Align mode prompt. Defer the
              // User-selected transition until agent_settled so the target starts
              // a fresh run through before_agent_start with the correct marker.
              pi.appendEntry(ASK_SETTLEMENT_EVENT, { outcome: "routed", target: route });
              return {
                content: [{ type: "text" as const, text: resultText(details, params.questions) }],
                details,
                terminate: true,
              };
            }

            if (choice === customLabel) {
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
      pi.appendEntry(ASK_SETTLEMENT_EVENT, { outcome: "answered" });
      return {
        content: [{ type: "text" as const, text: resultText(details, params.questions) }],
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
