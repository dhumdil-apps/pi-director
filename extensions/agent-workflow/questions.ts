import { Type, type Static } from "@sinclair/typebox";
import { agentApiText } from "./agent-api.js";

export const OptionParams = Type.Object({
  value: Type.String({ description: agentApiText("tool.ask.option.value") }),
  label: Type.String({ description: agentApiText("tool.ask.option.label") }),
  description: Type.String({ description: agentApiText("tool.ask.option.description") }),
  confidence: Type.Integer({ description: agentApiText("tool.ask.option.confidence") }),
});

export const QuestionParams = Type.Object({
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

export type QuestionOption = Static<typeof OptionParams>;
export type WorkflowQuestion = Static<typeof QuestionParams>;

export function orderedOptions(question: WorkflowQuestion): QuestionOption[] {
  // Stable sort retains Agent-supplied order when confidence scores tie.
  return [...question.options].sort((left, right) => right.confidence - left.confidence);
}

export function optionLetter(index: number): string {
  return String.fromCharCode("A".charCodeAt(0) + index);
}

export function pickerLabel(option: QuestionOption, index: number): string {
  return `${optionLetter(index)}. ${option.label} · confidence ${option.confidence}/5`;
}

export function optionReferences(options: QuestionOption[]): string[] {
  return options.map((option, index) => `${optionLetter(index)} = ${option.label}`);
}
