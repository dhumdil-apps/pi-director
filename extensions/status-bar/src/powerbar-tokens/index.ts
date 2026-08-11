/**
 * Powerbar Tokens Producer
 *
 * Shows cumulative token/cost stats and active-branch message counts.
 * Segment IDs: "cost", "tokens", "agent-stats"
 */

import type { ExtensionAPI, ExtensionContext, Theme, ThemeColor } from "@earendil-works/pi-coding-agent";

function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  if (count < 1000000) return `${Math.round(count / 1000)}k`;
  if (count < 10000000) return `${(count / 1000000).toFixed(1)}M`;
  return `${Math.round(count / 1000000)}M`;
}

function costColor(cost: number): ThemeColor {
  if (cost >= 10) return "error";
  if (cost >= 5) return "warning";
  return "accent";
}

function emitSessionStats(pi: ExtensionAPI, ctx: ExtensionContext): void {
  let totalInput = 0;
  let totalOutput = 0;
  let totalCost = 0;
  let messages = 0;
  let user = 0;
  let agent = 0;
  let tools = 0;

  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type !== "message") continue;
    messages++;
    switch (entry.message.role) {
      case "user":
        user++;
        break;
      case "assistant":
        agent++;
        totalInput += entry.message.usage.input;
        totalOutput += entry.message.usage.output;
        totalCost += entry.message.usage.cost.total;
        break;
      case "toolResult":
        tools++;
        break;
    }
  }

  pi.events.emit("powerbar:update", {
    id: "agent-stats",
    text: `💬 ${formatTokens(messages)} · 👤 ${formatTokens(user)} · 🤖 ${formatTokens(agent)} · 🛠️ ${formatTokens(tools)}`,
    color: "dim",
    row: 2,
  });

  if (totalInput === 0 && totalOutput === 0) {
    pi.events.emit("powerbar:update", { id: "cost", text: undefined });
    pi.events.emit("powerbar:update", { id: "tokens", text: undefined });
    return;
  }

  const tokenText = `↑${formatTokens(totalInput)} ↓${formatTokens(totalOutput)}`;
  pi.events.emit("powerbar:update", { id: "tokens", text: tokenText, color: "dim", row: 2 });
  if (totalCost > 0) {
    pi.events.emit("powerbar:update", {
      id: "cost",
      row: 2,
      render: (theme: Theme) => theme.fg(costColor(totalCost), `$${totalCost.toFixed(2)}`),
    });
  } else {
    pi.events.emit("powerbar:update", { id: "cost", text: undefined });
  }
}

function resetSessionStats(pi: ExtensionAPI): void {
  pi.events.emit("powerbar:update", { id: "cost", text: undefined });
  pi.events.emit("powerbar:update", { id: "tokens", text: undefined });
  pi.events.emit("powerbar:update", { id: "agent-stats", text: undefined });
}

export default function createExtension(pi: ExtensionAPI): void {
  pi.events.emit("powerbar:register-segment", { id: "cost", label: "Cost", row: 2 });
  pi.events.emit("powerbar:register-segment", { id: "tokens", label: "Tokens", row: 2 });
  pi.events.emit("powerbar:register-segment", { id: "agent-stats", label: "Agent Stats", row: 2 });

  pi.on("session_start", async (_event, ctx) => {
    resetSessionStats(pi);
    emitSessionStats(pi, ctx);
  });
  pi.on("session_tree", async (_event, ctx) => emitSessionStats(pi, ctx));
  pi.on("tool_result", async (_event, ctx) => emitSessionStats(pi, ctx));
  pi.on("turn_end", async (_event, ctx) => emitSessionStats(pi, ctx));
}
