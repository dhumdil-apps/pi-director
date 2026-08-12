/**
 * Agent Workflow
 *
 * A compact, constant pseudocode contract plus one tiny session-mode marker.
 * Mode belongs to the User: Q&A aligns, Spec researches and proposes, Vibe
 * executes. The runtime enforces what judgment should not be trusted with — the
 * settled mode picker, the single artifact, and immutable plan names — and
 * leaves mode-specific execution guidance to the contract.
 */

import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { agentApiText } from "./agent-api.js";
import { registerCheckpointInputResolution } from "./checkpoint.js";
import { openHandoffSession } from "./handoff.js";
import { deriveWorkflowMode, recordWorkflowMode, workflowModePrompt, type WorkflowMode } from "./mode.js";
import { applyMode, openModePicker, registerModePicker, startModeContinuation } from "./mode-picker.js";
import { registerWorkflowNotices } from "./notice.js";
import { registerAsk } from "./ask.js";
import {
  autoSlug,
  currentPlanNextAction,
  ensurePiState,
  listPlanNames,
  planPath,
  PLAN_TEMPLATE,
  registerTaskManagement,
} from "./task.js";

/**
 * Constant contract; the selected mode is injected separately.
 *
 * The Markdown is kept as a package-local asset because Pi loads extensions
 * through Jiti rather than a project bundler, so a native text import would not
 * work consistently across source and packaged runtimes.
 */
const WORKFLOW_STEPS = readFileSync(new URL("./workflow-steps.md", import.meta.url), "utf8").trimEnd();
const AGENT_GUIDANCE = readFileSync(new URL("./agent-guidance.md", import.meta.url), "utf8").trimEnd();
const AGENT_API = readFileSync(new URL("./agent-api.md", import.meta.url), "utf8").trimEnd();

/** Constant by design: the large cacheable prefix never varies per turn. */
export function workflowPrompt(): string {
  return `<pi_workflow>\n\n${WORKFLOW_STEPS}\n\n${AGENT_GUIDANCE}\n\n${AGENT_API}\n</pi_workflow>`;
}

export default function createExtension(pi: ExtensionAPI): void {
  registerAsk(pi);
  registerTaskManagement(pi);
  registerCheckpointInputResolution(pi);
  registerWorkflowNotices(pi);
  // Last, so any handler that settles first has already run.
  registerModePicker(pi);

  const setModeCommand = (mode: WorkflowMode) => async (_args: string, ctx: ExtensionCommandContext) => {
    const previous = deriveWorkflowMode(ctx.sessionManager.getBranch());
    await applyMode(pi, ctx, mode, previous);
    if (mode === "questionnaire" || mode === previous) return;

    const planName = pi.getSessionName() ?? ctx.sessionManager.getSessionName?.();
    const nextAction = await currentPlanNextAction(ctx.cwd, planName);
    startModeContinuation(pi, mode, previous, nextAction);
  };
  pi.registerCommand("questionnaire", {
    description: agentApiText("command.questionnaire"),
    handler: setModeCommand("questionnaire"),
  });
  pi.registerCommand("spec", {
    description: agentApiText("command.spec"),
    handler: setModeCommand("spec"),
  });
  pi.registerCommand("vibe", {
    description: agentApiText("command.vibe"),
    handler: setModeCommand("vibe"),
  });
  pi.registerCommand("mode", {
    description: agentApiText("command.mode"),
    handler: async (_args, ctx) => openModePicker(pi, ctx),
  });

  pi.registerCommand("handoff", {
    description: agentApiText("command.handoff"),
    getArgumentCompletions: (prefix: string) => {
      const last = prefix.trim();
      return listPlanNames(process.cwd())
        .filter((name) => name.startsWith(last))
        .map((name) => ({ value: name, label: name }));
    },
    handler: async (args: string, ctx: ExtensionCommandContext) => {
      await openHandoffSession(pi, ctx, args.trim() || undefined);
    },
  });

  pi.on("before_agent_start", async (event, ctx) => {
    // Headless runs have no picker and no gate to answer, so the contract would
    // describe a workflow that cannot happen. Leave those sessions alone.
    if (!ctx.hasUI) return;
    const mode = await ensureWorkflowMode(pi, ctx);
    await scaffoldPlan(pi, ctx, event.prompt ?? "");
    return {
      systemPrompt: `${event.systemPrompt}\n\n${workflowPrompt()}`,
      message: {
        customType: "agent-workflow:mode-context",
        content: [{ type: "text", text: workflowModePrompt(mode) }],
        display: false,
      },
    };
  });
}

/** Initialize an ordinary session in Q&A; later modes require an explicit User action. */
async function ensureWorkflowMode(pi: ExtensionAPI, ctx: ExtensionContext): Promise<WorkflowMode> {
  const existing = deriveWorkflowMode(ctx.sessionManager.getBranch());
  if (existing) return existing;
  recordWorkflowMode(pi, "questionnaire");
  return "questionnaire";
}

/** Best-effort scaffold so timing and handoff have a durable file immediately. */
async function scaffoldPlan(pi: ExtensionAPI, ctx: ExtensionContext, prompt: string): Promise<void> {
  if (pi.getSessionName()) return;
  const name = autoSlug(prompt, new Date());
  try {
    await ensurePiState(ctx.cwd);
    await writeFile(planPath(ctx.cwd, name), PLAN_TEMPLATE.replace("<session-name>", name), {
      encoding: "utf8",
      flag: "wx",
    });
  } catch {
    return;
  }
  pi.setSessionName(name);
}
