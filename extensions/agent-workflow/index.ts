/**
 * Agent Workflow
 *
 * A compact, constant pseudocode contract plus one tiny session-mode marker.
 * Mode belongs to the User: Align clarifies, Spec researches and proposes, Vibe
 * executes. Runtime owns persistence and UI mechanics; the Agent-owned contract
 * owns interpretation, artifact meaning, and next-step guidance.
 */

import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { agentApiText } from "./agent-api.js";
import { registerCheckpointInputResolution } from "./checkpoint.js";
import { openHandoffSession } from "./handoff.js";
import {
  deriveWorkflowMode,
  recordWorkflowMode,
  resolveWorkflowMode,
  workflowModePrompt,
  type WorkflowMode,
} from "./mode.js";
import { applyMode, openModePicker, registerModePicker, startModeContinuation } from "./mode-picker.js";
import { registerWorkflowNotices } from "./notice.js";
import { registerAsk } from "./ask.js";
import { autoSlug, ensurePiState, listPlanNames, planPath, PLAN_TEMPLATE, registerTaskManagement } from "./task.js";

/**
 * Constant contract; the selected mode is injected separately.
 *
 * The Markdown is kept as a package-local asset because Pi loads extensions
 * through Jiti rather than a project bundler, so a native text import would not
 * work consistently across source and packaged runtimes.
 */
const WORKFLOW_STEPS = readFileSync(new URL("./workflow-steps.md", import.meta.url), "utf8").trimEnd();
/** Constant by design: the large cacheable prefix never varies per turn. */
export function workflowPrompt(): string {
  return `<pi_workflow>\n\n${WORKFLOW_STEPS}\n</pi_workflow>`;
}

export default function createExtension(pi: ExtensionAPI): void {
  registerAsk(pi);
  registerTaskManagement(pi);
  registerCheckpointInputResolution(pi);
  registerWorkflowNotices(pi);
  // Last, so any handler that settles first has already run.
  registerModePicker(pi);

  const setModeCommand = (mode: WorkflowMode) => async (_args: string, ctx: ExtensionCommandContext) => {
    const previous = resolveWorkflowMode(ctx.sessionManager.getBranch());
    await applyMode(pi, ctx, mode, previous);
    startModeContinuation(pi, mode, previous);
  };
  pi.registerCommand("align", {
    description: agentApiText("command.align"),
    handler: setModeCommand("align"),
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
    handler: async (_args, ctx) => openModePicker(pi, ctx, true),
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

/** Initialize an ordinary session in Align; explicit User actions may select another mode. */
async function ensureWorkflowMode(pi: ExtensionAPI, ctx: ExtensionContext): Promise<WorkflowMode> {
  const existing = deriveWorkflowMode(ctx.sessionManager.getBranch());
  if (existing) return existing;
  recordWorkflowMode(pi, "align");
  return "align";
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
