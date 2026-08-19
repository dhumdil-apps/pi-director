import { readFile } from "node:fs/promises";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type, type Static } from "@sinclair/typebox";
import { agentApiText } from "./agent-api.js";
import { resolveWorkflowMode } from "./mode.js";
import { isCurrentPlanFormat, planPath } from "./task.js";
import { writePlanAtomically } from "./plan-time.js";
import { QuestionParams, orderedOptions, pickerLabel, type WorkflowQuestion } from "./questions.js";

export const DECISION_EVENT = "agent-workflow:decision";

const DecideParams = Type.Object({
  questions: Type.Array(QuestionParams, { description: agentApiText("tool.decide.questions") }),
});

type DecideInput = Static<typeof DecideParams>;

export interface DecidePick {
  id: string;
  questionId: string;
  value: string;
  label: string;
  confidence: number;
  prompt: string;
  context: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
    confidence: number;
  }>;
}

export interface DecideDetails {
  picks: DecidePick[];
}

function decisionId(questionId: string): string {
  return /^D/i.test(questionId) ? questionId : `D-${questionId}`;
}

function transcriptBlock(pick: DecidePick): string {
  const options = pick.options
    .map((option, index) => {
      const label = pickerLabel(option, index);
      return `  ${label} — ${option.description}`;
    })
    .join("\n");
  return [
    `${pick.id} — ${pick.prompt}`,
    `Context: ${pick.context}`,
    "Options:",
    options,
    `Selected: ${pick.label} (${pick.value}).`,
    "Rationale: auto-picked by decide; highest-confidence option.",
    "Review: unresolved.",
  ].join("\n");
}

async function appendAgentTranscript(cwd: string, name: string, block: string): Promise<void> {
  const path = planPath(cwd, name);
  const contents = await readFile(path, "utf8").catch(() => "");
  if (!contents || !isCurrentPlanFormat(contents)) return;
  await writePlanAtomically(path, `${contents.trimEnd()}\n\n${block}\n`);
}

export function registerDecide(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "decide",
    label: "Decide",
    description: agentApiText("tool.decide.description"),
    promptSnippet: agentApiText("tool.decide.prompt-snippet"),
    parameters: DecideParams,
    executionMode: "sequential",

    async execute(_toolCallId, params: DecideInput, _signal, _onUpdate, ctx) {
      const mode = resolveWorkflowMode(ctx.sessionManager.getBranch());
      if (mode === "align") {
        return {
          content: [
            { type: "text" as const, text: "Decide is SPEC/VIBE-only; no decision was recorded. Use ask in ALIGN." },
          ],
          details: { picks: [] } satisfies DecideDetails,
        };
      }
      if (params.questions.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No questions were supplied; Decide made no changes." }],
          details: { picks: [] } satisfies DecideDetails,
        };
      }
      if (params.questions.some((question) => question.options.length === 0)) {
        return {
          content: [{ type: "text" as const, text: "Decide needs compared options; no decision was recorded." }],
          details: { picks: [] } satisfies DecideDetails,
        };
      }

      const picks: DecidePick[] = params.questions.map((question) => {
        const options = orderedOptions(question);
        const selected = options[0];
        return {
          id: decisionId(question.id),
          questionId: question.id,
          value: selected.value,
          label: selected.label,
          confidence: selected.confidence,
          prompt: question.prompt,
          context: question.context,
          options: options.map((option) => ({
            value: option.value,
            label: option.label,
            description: option.description,
            confidence: option.confidence,
          })),
        };
      });

      pi.appendEntry(DECISION_EVENT, { picks });
      const name = pi.getSessionName();
      if (name) {
        const block = picks.map(transcriptBlock).join("\n\n");
        await appendAgentTranscript(ctx.cwd, name, block).catch(() => {});
      }

      const details: DecideDetails = { picks };
      return {
        content: [
          {
            type: "text" as const,
            text: picks
              .map((pick) => `${pick.id}: auto-picked ${pick.label} (${pick.value}) · review unresolved`)
              .join("\n"),
          },
        ],
        details,
      };
    },

    renderCall(args, theme) {
      const questions = Array.isArray(args.questions) ? (args.questions as WorkflowQuestion[]) : [];
      const lines = [theme.fg("toolTitle", theme.bold("decide"))];
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
      const details = toolResult.details as DecideDetails | undefined;
      if (!details) {
        const first = toolResult.content[0];
        return new Text(first?.type === "text" ? first.text : "", 0, 0);
      }
      if (details.picks.length === 0) {
        const first = toolResult.content[0];
        const text = first?.type === "text" ? first.text : "";
        return new Text(theme.fg("muted", text || "No decisions."), 0, 0);
      }
      const lines = details.picks.map(
        (pick) =>
          `${theme.fg("success", "✓ ")}${theme.fg("accent", pick.id)}: ${pick.label} ${theme.fg("muted", "(auto · unresolved)")}`,
      );
      return new Text(lines.join("\n") || theme.fg("muted", "No decisions."), 0, 0);
    },
  });
}
