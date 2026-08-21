/**
 * Agent Workflow
 *
 * Shareable FSM contract (`workflow-fsm.ts`) plus session mode marker and tools.
 * Mode belongs to the User: Align clarifies, Spec researches and proposes, Vibe
 * executes. Runtime owns persistence, UI mechanics, and Mode×Artifact gates;
 * the Agent-owned contract owns interpretation, artifact meaning, and routing judgment.
 */

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
import { applyMode, openModePicker, registerModePicker } from "./mode-picker.js";
import { registerWorkflowNotices } from "./notice.js";
import { registerAsk } from "./ask.js";
import { registerDecide } from "./decide.js";
import { listPlanNames, registerTaskManagement } from "./task.js";
import { workflowPrompt } from "./workflow-machine.js";

export { workflowPrompt };

export default function createExtension(pi: ExtensionAPI): void {
  registerAsk(pi);
  registerDecide(pi);
  registerTaskManagement(pi);
  registerCheckpointInputResolution(pi);
  registerWorkflowNotices(pi);
  // Last, so any handler that settles first has already run.
  registerModePicker(pi);

  const setModeCommand = (mode: WorkflowMode) => async (_args: string, ctx: ExtensionCommandContext) => {
    const previous = resolveWorkflowMode(ctx.sessionManager.getBranch());
    await applyMode(pi, ctx, mode, previous);
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
