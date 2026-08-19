import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG_DIR_NAME, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "@sinclair/typebox";
import { agentApiText } from "./agent-api.js";
import { EMPTY_PLAN_TIME, readPlanTiming, timeSpentBlock, withPlanTiming, writePlanAtomically } from "./plan-time.js";

const TIMESTAMP = /^(\d{4}-\d{2}-\d{2}(?:--\d{2}-\d{2}-\d{2}|T\d{2}:\d{2}:\d{2}))(?:-|$)/i;
const SESSION_NAME =
  /^(?:(\d{4}-\d{2}-\d{2}(?:--\d{2}-\d{2}-\d{2}|T\d{2}:\d{2}:\d{2}))-)?(?:([a-z0-9]+-\d+)-)?([a-z0-9]+(?:-[a-z0-9]+)*)$/i;
const TICKET_ID = /\b([a-z0-9]+-\d+)\b/i;
const PLAN_FILE = /^(.+)\.md$/;
const PLAN_FORMAT_MARKER = "<!-- pi-director-plan:v2 -->";
const TEMPORARY_TASK_MARKER = "<!-- task-name:temporary -->";
const PERMANENT_TASK_MARKER = "<!-- task-name:permanent -->";
const TIME_SPENT_PLACEHOLDER = "{{time-spent}}";

const PLAN_TEMPLATE_SOURCE = readFileSync(new URL("./plan-template.md", import.meta.url), "utf8").trimEnd();

/** Current flat artifact scaffold. */
export const PLAN_TEMPLATE = `${PLAN_TEMPLATE_SOURCE.replace(TIME_SPENT_PLACEHOLDER, timeSpentBlock(EMPTY_PLAN_TIME))}\n`;

export const MEMORY_STUB = ["# Project memory", "", "## Orientation", "", "## Quirks", ""].join("\n");
const HANDOFF_USAGE = "Usage: /handoff [session-name].";

const StartTaskParams = Type.Object({
  name: Type.String({ description: agentApiText("tool.start.name") }),
});

type StartTaskInput = Static<typeof StartTaskParams>;

function stamp(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function displayStamp(now: Date): string {
  return stamp(now).replace("T", " ");
}

export function isCurrentPlanFormat(contents: string): boolean {
  return contents.includes(PLAN_FORMAT_MARKER);
}

export function isTemporaryPlan(contents: string): boolean {
  return isCurrentPlanFormat(contents) && contents.includes(TEMPORARY_TASK_MARKER);
}

export function normalizeTaskName(summary: string, currentName?: string): string {
  const suppliedTicket = summary.match(TICKET_ID)?.[1]?.toUpperCase();
  const currentTicket = currentName?.match(TICKET_ID)?.[1]?.toUpperCase();
  const ticket = suppliedTicket ?? currentTicket;
  const words = summary
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b[a-z0-9]+-\d+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) words.push("task", "summary");
  return ticket ? `${ticket}-${words.join("-")}` : words.join("-");
}

export function canonicalTaskName(name: string | undefined): string | undefined {
  const match = name?.trim().match(SESSION_NAME);
  if (!match) return undefined;
  return [match[1], match[2]?.toUpperCase(), match[3].toLowerCase()].filter(Boolean).join("-");
}

export function timestampPrefix(name: string | undefined): string | undefined {
  return name?.trim().match(TIMESTAMP)?.[1];
}

export async function ensurePiState(cwd: string): Promise<void> {
  await mkdir(join(cwd, CONFIG_DIR_NAME, "plan"), { recursive: true });
  const memory = join(cwd, CONFIG_DIR_NAME, "MEMORY.md");
  if (!existsSync(memory)) await writeFile(memory, MEMORY_STUB, { encoding: "utf8", flag: "wx" }).catch(() => {});
}

export async function movePlan(cwd: string, from: string, to: string): Promise<void> {
  if (from === to) return;
  const source = planPath(cwd, from);
  if (!existsSync(source)) return;
  const destination = planPath(cwd, to);
  if (existsSync(destination)) throw new Error(`A plan named ${to} already exists`);
  await rename(source, destination);
}

export interface BeginTaskResult {
  name: string;
  path: string;
  legacySource?: string;
}

/** Permanently name a temporary v2 plan, or fork an immutable legacy source. */
export async function beginTask(cwd: string, current: string | undefined, summary: string): Promise<BeginTaskResult> {
  await ensurePiState(cwd);
  const prefix = timestampPrefix(current) ?? stamp(new Date());
  const slug = normalizeTaskName(summary, current);
  const name = `${prefix}-${slug}`;
  const sourceContents = current ? await readFile(planPath(cwd, current), "utf8").catch(() => "") : "";
  const resolvedName =
    sourceContents && !isCurrentPlanFormat(sourceContents) && name === current ? `${name}-continued` : name;
  const path = planPath(cwd, resolvedName);

  if (sourceContents && isCurrentPlanFormat(sourceContents) && !isTemporaryPlan(sourceContents)) {
    if (current !== resolvedName) throw new Error(`${current} already permanently names this session's artifact`);
    return { name: resolvedName, path };
  }

  if (sourceContents && !isCurrentPlanFormat(sourceContents)) {
    if (existsSync(path)) throw new Error(`A plan named ${resolvedName} already exists`);
    const source = `${CONFIG_DIR_NAME}/plan/${current}.md`;
    const continuation = withPlanTiming(
      PLAN_TEMPLATE.replace("<session-name>", resolvedName),
      resolvedName,
      EMPTY_PLAN_TIME,
    )
      .replace(TEMPORARY_TASK_MARKER, PERMANENT_TASK_MARKER)
      .replace(
        "<current facts, findings, constraints, and lifecycle context>",
        `### ${displayStamp(new Date())}\n\nLegacy source: \`${source}\`. Preserve it unchanged and convert its meaningful content here before substantive work.`,
      );
    await writePlanAtomically(path, continuation);
    return { name: resolvedName, path, legacySource: source };
  }

  if (current && current !== resolvedName) await movePlan(cwd, current, resolvedName);
  const existing = await readFile(path, "utf8").catch(() => "");
  const timing = readPlanTiming(existing) ?? EMPTY_PLAN_TIME;
  const named = withPlanTiming(
    (existing || PLAN_TEMPLATE).replace("<session-name>", resolvedName),
    resolvedName,
    timing,
  ).replace(TEMPORARY_TASK_MARKER, PERMANENT_TASK_MARKER);
  await writePlanAtomically(path, named);
  return { name: resolvedName, path };
}

export function planPath(cwd: string, name: string): string {
  return join(cwd, CONFIG_DIR_NAME, "plan", `${name}.md`);
}

export function listPlanNames(cwd: string): string[] {
  let files: string[];
  try {
    files = readdirSync(join(cwd, CONFIG_DIR_NAME, "plan"));
  } catch {
    return [];
  }
  return files
    .map((file) => file.match(PLAN_FILE)?.[1])
    .map(canonicalTaskName)
    .filter((name): name is string => Boolean(name))
    .sort();
}

export interface PlanTask {
  name: string;
  planPath: string;
}

export interface PlanResolution {
  task?: PlanTask;
  error?: string;
}

function relativePlanPath(name: string): string {
  return `${CONFIG_DIR_NAME}/plan/${name}.md`;
}

function taskFor(cwd: string, name: string): PlanResolution {
  return existsSync(planPath(cwd, name))
    ? { task: { name, planPath: relativePlanPath(name) } }
    : { error: `No plan for ${name} under ${CONFIG_DIR_NAME}/plan/.` };
}

export function resolvePlanTask(
  cwd: string,
  requested: string | undefined,
  sessionName: string | undefined,
): PlanResolution {
  if (requested) {
    const name = canonicalTaskName(requested);
    return name ? taskFor(cwd, name) : { error: `"${requested}" is not a session name. ${HANDOFF_USAGE}` };
  }
  const current = canonicalTaskName(sessionName);
  if (current && existsSync(planPath(cwd, current))) return taskFor(cwd, current);
  const names = listPlanNames(cwd);
  if (names.length === 1) return taskFor(cwd, names[0]);
  if (names.length > 1)
    return {
      error: `Several plans under ${CONFIG_DIR_NAME}/plan/: ${names.join(", ")} — run /handoff <session-name>.`,
    };
  return { error: `No plan under ${CONFIG_DIR_NAME}/plan/ — start a task first.` };
}

export function registerTaskManagement(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "start",
    label: "Start",
    description: agentApiText("tool.start.description"),
    parameters: StartTaskParams,
    async execute(_toolCallId, params: StartTaskInput, _signal, _onUpdate, ctx) {
      try {
        const started = await beginTask(ctx.cwd, pi.getSessionName(), params.name);
        pi.setSessionName(started.name);
        const legacy = started.legacySource ? ` Legacy source preserved at ${started.legacySource}.` : "";
        return {
          content: [{ type: "text" as const, text: `Task started at ${started.path}.${legacy}` }],
          details: started,
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: could not start task: ${(error as Error).message}.` }],
          details: { error: (error as Error).message },
          isError: true,
        };
      }
    },
  });
}
