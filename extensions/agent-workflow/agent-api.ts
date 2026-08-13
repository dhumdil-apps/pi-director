import { readFileSync } from "node:fs";

const SOURCE = readFileSync(new URL("./agent-api.md", import.meta.url), "utf8").trim();

const REQUIRED_KEYS = [
  "command.align",
  "command.spec",
  "command.vibe",
  "command.mode",
  "command.handoff",
  "tool.ask.description",
  "tool.ask.prompt-snippet",
  "tool.ask.prompt-guidelines",
  "tool.ask.option.value",
  "tool.ask.option.label",
  "tool.ask.option.description",
  "tool.ask.option.confidence",
  "tool.ask.question.id",
  "tool.ask.question.context",
  "tool.ask.question.prompt",
  "tool.ask.question.custom-answer-label",
  "tool.ask.question.options",
  "tool.ask.questions",
  "tool.start.description",
  "tool.start.name",
  "tool.next.description",
  "tool.next.action.reason",
  "tool.next.action.prompt",
  "tool.next.actions",
  "message.ask.direct-route.spec",
  "message.ask.direct-route.vibe",
  "message.ask.cancelled",
  "message.ask.routed",
  ...["align", "spec", "vibe"].flatMap((source) =>
    ["align", "spec", "vibe"].map((target) => `message.kickoff.directive.${source}.${target}`),
  ),
  "message.kickoff.transition",
  "message.kickoff.start",
  "message.kickoff.continue",
  "message.align.start",
  "message.handoff.checkpoint",
] as const;

function parseSections(source: string): ReadonlyMap<string, string> {
  const sections = new Map<string, string>();
  for (const section of source.split(/^## /m).slice(1)) {
    const newline = section.indexOf("\n");
    if (newline === -1) throw new Error("Every Agent API section needs a body.");
    const key = section.slice(0, newline).trim();
    const body = section.slice(newline + 1).trim();
    if (!/^[a-z0-9.-]+$/.test(key) || !body || sections.has(key)) {
      throw new Error(`Invalid, empty, or duplicate Agent API section: ${key || "<unknown>"}.`);
    }
    sections.set(key, body);
  }
  return sections;
}

const sections = parseSections(SOURCE);
const requiredKeys = new Set<string>(REQUIRED_KEYS);
for (const key of REQUIRED_KEYS) {
  if (!sections.has(key)) throw new Error(`Missing required Agent API section: ${key}.`);
}
for (const key of sections.keys()) {
  if (!requiredKeys.has(key)) throw new Error(`Unknown Agent API section: ${key}.`);
}

export function agentApiText(key: string): string {
  const value = sections.get(key);
  if (!value) throw new Error(`Missing Agent API section: ${key}.`);
  return value;
}

export function agentApiList(key: string): string[] {
  return agentApiText(key)
    .split("\n")
    .map((line) => {
      const match = line.match(/^- (.+)$/);
      if (!match) throw new Error(`Agent API list ${key} must contain only Markdown list items.`);
      return match[1];
    });
}

/** Substitute only declared placeholders so new Agent messages cannot silently use inline copy. */
export function agentApiTemplate(key: string, values: Record<string, string | undefined>): string {
  const used = new Set<string>();
  const rendered = agentApiText(key).replace(/{{([a-zA-Z][a-zA-Z0-9]*)}}/g, (_placeholder, name: string) => {
    const value = values[name];
    if (value === undefined) throw new Error(`Missing ${name} for Agent API template ${key}.`);
    used.add(name);
    return value;
  });
  for (const name of Object.keys(values)) {
    if (!used.has(name)) throw new Error(`Unknown ${name} for Agent API template ${key}.`);
  }
  if (/{{|}}/.test(rendered)) throw new Error(`Invalid placeholder in Agent API template ${key}.`);
  return rendered;
}
