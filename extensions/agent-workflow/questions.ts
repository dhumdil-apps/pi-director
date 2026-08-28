import { Type, type Static } from "@sinclair/typebox";
import { agentApiText } from "./agent-api.js";
import {
  optionReferences as referencesForOptions,
  orderedOptions as orderRankedOptions,
  pickerLabel as labelForOption,
} from "./question-labels.js";

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
  options: Type.Array(OptionParams, { description: agentApiText("tool.ask.question.options") }),
});

export type QuestionOption = Static<typeof OptionParams>;
export type WorkflowQuestion = Static<typeof QuestionParams>;

export function orderedOptions(question: WorkflowQuestion): QuestionOption[] {
  return orderRankedOptions(question.options);
}

export function pickerLabel(option: QuestionOption, index?: number): string {
  return labelForOption(option, index);
}

export { pickerTitle } from "./question-labels.js";

export function optionReferences(options: QuestionOption[]): string[] {
  return referencesForOptions(options);
}
