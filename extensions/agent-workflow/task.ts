import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG_DIR_NAME, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "@sinclair/typebox";
import { agentApiText } from "./agent-api.js";
import { hasEnteredVibe, MODE_LABEL, resolveWorkflowMode, type WorkflowMode } from "./mode.js";
import {
  EMPTY_PLAN_TIME,
  readPlanTiming,
  stripTimeSpent,
  timeSpentBlock,
  withPlanTiming,
  writePlanAtomically,
} from "./plan-time.js";

/**
 * A session name is `[timestamp-][TICKET-N-]slug`. The timestamp segment is read
 * first and on its own: without it, `2026-07-24T13:05:01-…` parses as the ticket
 * ID `2026-07` and the rest as the slug. The legacy transformed timestamp is
 * still accepted so existing plan files remain resolvable.
 */
const TIMESTAMP = /^(\d{4}-\d{2}-\d{2}(?:--\d{2}-\d{2}-\d{2}|T\d{2}:\d{2}:\d{2}))(?:-|$)/i;
const SESSION_NAME =
  /^(?:(\d{4}-\d{2}-\d{2}(?:--\d{2}-\d{2}-\d{2}|T\d{2}:\d{2}:\d{2}))-)?(?:([a-z0-9]+-\d+)-)?([a-z0-9]+(?:-[a-z0-9]+)*)$/i;
const TICKET_ID = /\b([a-z0-9]+-\d+)\b/i;
const MAX_SLUG_WORDS = 4;
const PLAN_FILE = /^(.+)\.md$/;

const PLAN_TEMPLATE_SOURCE = readFileSync(new URL("./plan-template.md", import.meta.url), "utf8").trimEnd();
const TIME_SPENT_PLACEHOLDER = "{{time-spent}}";

/** The one artifact shape. A session owns a single plan file for its whole life. */
export const PLAN_TEMPLATE = `${PLAN_TEMPLATE_SOURCE.replace(TIME_SPENT_PLACEHOLDER, timeSpentBlock(EMPTY_PLAN_TIME))}\n`;

/**
 * Scaffolded alongside the first plan. Orientation maps the project; quirks record
 * the non-obvious constraints worth reusing during exploration.
 */
export const MEMORY_STUB = ["# Project memory", "", "## Orientation", "", "## Quirks", ""].join("\n");

const HANDOFF_USAGE = "Usage: /handoff [session-name].";
export const PLAN_SAVED_EVENT = "agent-workflow:plan-saved";

const TASK_NAME_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "be",
  "can",
  "could",
  "for",
  "i",
  "is",
  "it",
  "need",
  "of",
  "or",
  "please",
  "should",
  "that",
  "the",
  "this",
  "to",
  "want",
  "we",
  "with",
  "would",
]);

/** Neutral words used only while a fresh session's task is still unknown. */
const TEMPORARY_NAME_WORDS = [
  "amber",
  "cedar",
  "cobalt",
  "coral",
  "drift",
  "ember",
  "frost",
  "harbor",
  "indigo",
  "juniper",
  "meadow",
  "mist",
  "north",
  "orbit",
  "pebble",
  "pine",
  "quartz",
  "ripple",
  "solar",
  "stone",
  "summit",
  "thistle",
  "tidal",
  "velvet",
  "willow",
  "wren",
  "zephyr",
] as const;
const TEMPORARY_NAME_WORD_COUNT = 2;

export const AUTO_DECISION_EVENT = "agent-workflow:auto-decision";

const AutoDecisionParams = Type.Object({
  decision: Type.String({ description: agentApiText("tool.record-auto-decision.decision") }),
  context: Type.String({ description: agentApiText("tool.record-auto-decision.context") }),
  rationale: Type.String({ description: agentApiText("tool.record-auto-decision.rationale") }),
  impact: Type.String({ description: agentApiText("tool.record-auto-decision.impact") }),
  verificationStatus: Type.Union([Type.Literal("pending"), Type.Literal("verified"), Type.Literal("not-applicable")]),
  verificationDetails: Type.String({ description: agentApiText("tool.record-auto-decision.verification-details") }),
});

const SavePlanParams = Type.Object({
  name: Type.String({
    description: agentApiText("tool.save-plan.name"),
  }),
  plan: Type.Optional(
    Type.String({
      description: agentApiText("tool.save-plan.plan"),
    }),
  ),
});

const StartTaskParams = Type.Object({
  name: Type.String({
    description: agentApiText("tool.start-task.name"),
  }),
});

const REVISION_HEADING = /^## Revision (\d+)\b/gm;

function hasExecutionHistory(existing: string): boolean {
  if (/^## Close out$/m.test(existing) || /^## Revision \d+\b/m.test(existing)) {
    return true;
  }
  const workLogStart = existing.indexOf("## Work log");
  if (workLogStart === -1) return false;
  const bodyStart = workLogStart + "## Work log".length;
  const nextSection = existing.indexOf("\n## ", bodyStart);
  const workLog = existing.slice(bodyStart, nextSection === -1 ? existing.length : nextSection);
  return workLog.replace("<requested increments and what landed>", "").trim() !== "";
}

function revisionStamp(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** True while the file still holds nothing but the scaffold the session started with. */
export function isScaffold(existing: string): boolean {
  const body = stripTimeSpent(existing)
    .replace(/^# .*$/m, "")
    .replace(/<[^>\n]+>/g, "")
    .replace(/- \[ \]/g, "");
  return !body.replace(/^#+ .*$/gm, "").trim();
}

/**
 * Checklist status is cumulative across revisions. Repeated task text is one live
 * task, and the latest checkbox state wins so a resolved task is not resurrected
 * by an older revision. Labels are the identity, so status-only updates must keep
 * them verbatim across revisions.
 */
export function pendingChecklistItems(existing: string): string[] {
  const tasks = new Map<string, { label: string; completed: boolean }>();
  const sections = [...existing.matchAll(/^## Checklist\s*$/gm)];
  for (const section of sections) {
    const start = (section.index ?? 0) + section[0].length;
    const nextSection = existing.slice(start).search(/^## /m);
    const end = nextSection === -1 ? existing.length : start + nextSection;
    for (const match of existing.slice(start, end).matchAll(/^\s*- \[([ xX])\] (.+?)\s*$/gm)) {
      const label = match[2].replace(/\s+/g, " ").trim();
      if (!label || /^<[^>]+>$/.test(label)) continue;
      const key = label.toLocaleLowerCase();
      tasks.delete(key);
      tasks.set(key, { label, completed: match[1].toLowerCase() === "x" });
    }
  }
  return [...tasks.values()].filter((task) => !task.completed).map((task) => task.label);
}

function currentPlanSegmentStart(existing: string): number {
  const revisions = [...existing.matchAll(/^## Revision \d+\b[^\r\n]*$/gm)];
  const latest = revisions.at(-1);
  return latest && latest.index !== undefined ? latest.index + latest[0].length : 0;
}

function currentPlanSegment(existing: string): string {
  return existing.slice(currentPlanSegmentStart(existing));
}

/** Read only the latest close-out status; an older revision cannot close new work. */
export function currentCloseoutStatus(existing: string): "complete" | undefined {
  const segment = currentPlanSegment(existing);
  const closeouts = [...segment.matchAll(/^## Close out\s*$/gm)];
  const closeout = closeouts.at(-1);
  if (!closeout || closeout.index === undefined) return undefined;

  const closeoutBody = segment.slice(closeout.index + closeout[0].length);
  const statuses = [...closeoutBody.matchAll(/^### Status\s*$/gm)];
  const status = statuses.at(-1);
  if (!status || status.index === undefined) return undefined;
  const valueStart = status.index + status[0].length;
  const nextSubsection = closeoutBody.slice(valueStart).search(/^### /m);
  const value = closeoutBody.slice(
    valueStart,
    nextSubsection === -1 ? closeoutBody.length : valueStart + nextSubsection,
  );
  return value.trim().toLocaleLowerCase() === "complete" ? "complete" : undefined;
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function autoDecisionEntry(decision: AutoDecision): string {
  return [
    `- **Decision:** ${oneLine(decision.decision)}`,
    `  - Context: ${oneLine(decision.context)}`,
    `  - Rationale: ${oneLine(decision.rationale)}`,
    `  - Impact: ${oneLine(decision.impact)}`,
    `  - Verification: ${decision.verificationStatus} — ${oneLine(decision.verificationDetails)}`,
  ].join("\n");
}

function appendAutoDecisionSection(existing: string, entry: string): string {
  const segmentStart = currentPlanSegmentStart(existing);
  const segment = existing.slice(segmentStart);
  const closeout = [...segment.matchAll(/^## Close out\s*$/gm)].at(-1);
  if (!closeout || closeout.index === undefined) {
    return `${existing.trimEnd()}\n\n## Close out\n\n### Auto-mode decisions\n${entry}\n`;
  }

  const closeoutBodyStart = segmentStart + closeout.index + closeout[0].length;
  const closeoutBody = existing.slice(closeoutBodyStart);
  const autoSection = [...closeoutBody.matchAll(/^### Auto-mode decisions\s*$/gm)].at(-1);
  if (!autoSection || autoSection.index === undefined) {
    const firstSubsection = closeoutBody.search(/^### /m);
    const insertAt = closeoutBodyStart + (firstSubsection === -1 ? closeoutBody.length : firstSubsection);
    return `${existing.slice(0, insertAt)}\n### Auto-mode decisions\n${entry}\n${existing.slice(insertAt)}`;
  }

  const bodyStart = closeoutBodyStart + autoSection.index + autoSection[0].length;
  const remaining = existing.slice(bodyStart);
  const nextSubsection = remaining.search(/^### /m);
  const bodyEnd = nextSubsection === -1 ? existing.length : bodyStart + nextSubsection;
  const currentBody = existing
    .slice(bodyStart, bodyEnd)
    .replace(/^\s*<none unless Vibe recorded an autonomous decision>\s*$/m, "")
    .trim();
  const nextBody = `${currentBody ? `${currentBody}\n` : ""}${entry}\n`;
  return `${existing.slice(0, bodyStart)}\n${nextBody}${existing.slice(bodyEnd)}`;
}

/** Append one structured autonomous-decision record without rewriting the plan history. */
export async function appendAutoDecision(path: string, decision: AutoDecision): Promise<boolean> {
  const existing = await readFile(path, "utf8").catch(() => "");
  if (!existing) return false;
  await writePlanAtomically(path, appendAutoDecisionSection(existing, autoDecisionEntry(decision)));
  return true;
}

/** A scaffold still needs alignment; after that, pending checklist items are live work. */
export function planHasOpenWork(existing: string): boolean {
  if (currentCloseoutStatus(existing) === "complete") return false;
  return isScaffold(existing) || pendingChecklistItems(existing).length > 0;
}

/** Resolve the current artifact's live status without assuming a lone plan file. */
export async function currentPlanHasOpenWork(cwd: string, name: string | undefined): Promise<boolean> {
  if (!name) return true;
  const existing = await readFile(planPath(cwd, name), "utf8").catch(() => "");
  return !existing || planHasOpenWork(existing);
}

/** Surface the first pending task across all revisions as picker context. */
export function firstOpenChecklistItem(existing: string): string | undefined {
  if (currentCloseoutStatus(existing) === "complete") return undefined;
  return pendingChecklistItems(existing)[0];
}

export async function currentPlanNextAction(cwd: string, name: string | undefined): Promise<string | undefined> {
  if (!name) return undefined;
  const existing = await readFile(planPath(cwd, name), "utf8").catch(() => "");
  return firstOpenChecklistItem(existing);
}

/**
 * Before approval, an untouched draft is one proposal the User can read and
 * correct, so every save replaces it. Once execution starts or the artifact has
 * execution history, a changed plan becomes a dated revision, preserving the
 * original proposal and the reason it changed.
 */
export function composePlan(existing: string, body: string, now: Date, appendRevision = false): string {
  const next = body.trim();
  const previous = existing.trim();
  if (!next) return `${previous}\n`;
  const preserveHistory = appendRevision || hasExecutionHistory(previous);
  if (!previous || isScaffold(previous) || !preserveHistory) return `${next}\n`;
  // Already the tail of the file: a re-presentation, not a revision.
  if (previous.endsWith(next)) return `${previous}\n`;
  const count = previous.match(REVISION_HEADING)?.length ?? 0;
  return `${previous}\n\n---\n\n## Revision ${count + 2} — ${revisionStamp(now)}\n\n${next}\n`;
}

type AutoDecisionInput = Static<typeof AutoDecisionParams>;
type SavePlanInput = Static<typeof SavePlanParams>;
type StartTaskInput = Static<typeof StartTaskParams>;

export type AutoDecision = AutoDecisionInput;

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
    .filter((word) => word && !TASK_NAME_STOP_WORDS.has(word))
    .slice(0, MAX_SLUG_WORDS);
  if (words.length === 0) words.push("task", "summary");
  if (words.length === 1) words.push("task");
  const slug = words.join("-");
  return ticket ? `${ticket}-${slug}` : slug;
}

export function canonicalTaskName(name: string | undefined): string | undefined {
  const match = name?.trim().match(SESSION_NAME);
  if (!match) return undefined;
  const parts = [match[1], match[2]?.toUpperCase(), match[3].toLowerCase()];
  return parts.filter(Boolean).join("-");
}

/** The leading `YYYY-MM-DD--HH-MM-SS` segment of an auto-scaffolded name, if any. */
export function timestampPrefix(name: string | undefined): string | undefined {
  return name?.trim().match(TIMESTAMP)?.[1];
}

function stamp(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/**
 * The name a fresh session gets before anyone knows what the task really is:
 * the local timestamp keeps `.pi/plan/` lexically time-ordered, while the
 * prepared words avoid leaking an unfinished prompt into the plan filename.
 */
export function autoSlug(prompt: string, now: Date, random: () => number = Math.random): string {
  const ticket = prompt.match(TICKET_ID)?.[1]?.toUpperCase();
  const available = [...TEMPORARY_NAME_WORDS];
  const words: string[] = [];
  for (let i = 0; i < TEMPORARY_NAME_WORD_COUNT; i += 1) {
    const index = Math.min(available.length - 1, Math.floor(random() * available.length));
    words.push(available.splice(index, 1)[0]);
  }
  const ticketPart = ticket ? `-${ticket}` : "";
  return `${stamp(now)}${ticketPart}-${words.join("-")}`;
}

/** Create `.pi/plan/` and, when absent, a `.pi/MEMORY.md` stub. Idempotent. */
export async function ensurePiState(cwd: string): Promise<void> {
  await mkdir(join(cwd, CONFIG_DIR_NAME, "plan"), { recursive: true });
  const memory = join(cwd, CONFIG_DIR_NAME, "MEMORY.md");
  if (!existsSync(memory)) {
    await writeFile(memory, MEMORY_STUB, {
      encoding: "utf8",
      flag: "wx",
    }).catch(() => {});
  }
}

/** Carry a plan file over to its new name; a missing source is not an error. */
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
}

/**
 * Name this session's one artifact. The temporary raw-prompt scaffold is renamed
 * in place; a session owns a single plan file for its whole life, so a later
 * differing name is refused rather than quietly starting a second record.
 */
export async function beginTask(cwd: string, current: string | undefined, summary: string): Promise<BeginTaskResult> {
  await ensurePiState(cwd);
  const prefix = timestampPrefix(current);
  const previous = prefix && current ? current.slice(prefix.length + 1) : current;
  const slug = normalizeTaskName(summary, previous || undefined);
  const name = prefix ? `${prefix}-${slug}` : slug;
  const sourceContents = current ? await readFile(planPath(cwd, current), "utf8").catch(() => "") : "";

  if (current && current !== name && sourceContents && !isScaffold(sourceContents)) {
    throw new Error(
      `${current} already owns this session's plan — keep extending it, or start a fresh session for a new goal`,
    );
  }

  const path = planPath(cwd, name);
  if (current) await movePlan(cwd, current, name);
  const existing = await readFile(path, "utf8").catch(() => "");
  if (!existing || isScaffold(existing)) {
    const timing = readPlanTiming(existing) ?? EMPTY_PLAN_TIME;
    await writePlanAtomically(path, withPlanTiming(PLAN_TEMPLATE.replace("<session-name>", name), name, timing));
  }
  return { name, path };
}

export function planPath(cwd: string, name: string): string {
  return join(cwd, CONFIG_DIR_NAME, "plan", `${name}.md`);
}

/** Record an explicit mode switch so the artifact alone explains how work proceeded. */
export async function recordModeTransition(
  cwd: string,
  name: string,
  mode: WorkflowMode,
  now = new Date(),
): Promise<boolean> {
  const path = planPath(cwd, name);
  const existing = await readFile(path, "utf8").catch(() => "");
  if (!existing) return false;
  const section = existing.includes("## Work log")
    ? "Work log"
    : existing.includes("## Decisions")
      ? "Decisions"
      : existing.includes("## Align")
        ? "Align"
        : undefined;
  if (!section) return false;
  const heading = `## ${section}`;
  const bodyStart = existing.indexOf(heading) + heading.length;
  const nextSection = existing.indexOf("\n## ", bodyStart);
  const insertAt = nextSection === -1 ? existing.length : nextSection;
  const before = existing.slice(0, insertAt).trimEnd();
  const after = existing.slice(insertAt);
  const entry = `- ${revisionStamp(now)} — Workflow mode changed to ${MODE_LABEL[mode]}.`;
  await writePlanAtomically(path, `${before}\n\n${entry}\n${after}`);
  return true;
}

/** Unique canonical session names that own a plan file under .pi/plan/. */
export function listPlanNames(cwd: string): string[] {
  let files: string[];
  try {
    files = readdirSync(join(cwd, CONFIG_DIR_NAME, "plan"));
  } catch {
    return [];
  }
  const names = new Set<string>();
  for (const file of files) {
    const match = file.match(PLAN_FILE);
    if (!match) continue;
    const name = canonicalTaskName(match[1]);
    if (name) names.add(name);
  }
  return [...names].sort();
}

export interface PlanTask {
  name: string;
  /** Repo-relative, so it reads the same in a prompt as in the user's editor. */
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
  if (!existsSync(planPath(cwd, name))) {
    return { error: `No plan for ${name} under ${CONFIG_DIR_NAME}/plan/.` };
  }
  return { task: { name, planPath: relativePlanPath(name) } };
}

/**
 * Which plan a plan-consuming operation (/handoff, the approval prompt) is
 * about. .pi/plan/ accumulates — plan files are never deleted by the agent — so
 * resolution never assumes a single file: the explicit name wins, then the
 * session name, and only a lone remaining file is picked implicitly.
 */
export function resolvePlanTask(
  cwd: string,
  requested: string | undefined,
  sessionName: string | undefined,
): PlanResolution {
  if (requested) {
    const name = canonicalTaskName(requested);
    if (!name)
      return {
        error: `"${requested}" is not a session name. ${HANDOFF_USAGE}`,
      };
    return taskFor(cwd, name);
  }

  // The session name is the plan file's name once save_plan named it.
  const current = canonicalTaskName(sessionName);
  if (current && existsSync(planPath(cwd, current))) return taskFor(cwd, current);

  const names = listPlanNames(cwd);
  if (names.length === 1) return taskFor(cwd, names[0]);
  if (names.length > 1)
    return {
      error: `Several plans under ${CONFIG_DIR_NAME}/plan/: ${names.join(", ")} — run /handoff <session-name>.`,
    };
  return { error: `No plan under ${CONFIG_DIR_NAME}/plan/ — plan first.` };
}

export function registerTaskManagement(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "start_task",
    label: "Start Task",
    description: agentApiText("tool.start-task.description"),
    parameters: StartTaskParams,
    async execute(_toolCallId, params: StartTaskInput, _signal, _onUpdate, ctx) {
      try {
        const started = await beginTask(ctx.cwd, pi.getSessionName(), params.name);
        pi.setSessionName(started.name);
        return {
          content: [{ type: "text" as const, text: `Task started at ${started.path}.` }],
          details: { ...started },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: could not start task: ${(error as Error).message}.`,
            },
          ],
          details: { error: (error as Error).message },
          isError: true,
        };
      }
    },
  });

  pi.registerTool({
    name: "record_auto_decision",
    label: "Record Auto-mode Decision",
    description: agentApiText("tool.record-auto-decision.description"),
    parameters: AutoDecisionParams,
    executionMode: "sequential",
    async execute(_toolCallId, params: AutoDecisionInput, _signal, _onUpdate, ctx) {
      const mode = resolveWorkflowMode(ctx.sessionManager.getBranch());
      const values = [params.decision, params.context, params.rationale, params.impact, params.verificationDetails];
      if (mode !== "vibe") {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: record_auto_decision belongs to Vibe; persisted runtime mode is ${MODE_LABEL[mode]}. Use ask or a User-selected Q&A transition for decisions outside bounded implementation work.`,
            },
          ],
          details: { mode, error: "auto-decision recording is Vibe-only" },
          isError: true,
        };
      }
      if (values.some((value) => !value.trim())) {
        return {
          content: [
            { type: "text" as const, text: "Error: every auto-decision field must contain a non-empty value." },
          ],
          details: { mode, error: "empty auto-decision field" },
          isError: true,
        };
      }
      const name = pi.getSessionName() ?? ctx.sessionManager.getSessionName?.();
      if (!name) {
        return {
          content: [
            { type: "text" as const, text: "Error: no current plan is available for the auto-decision audit." },
          ],
          details: { mode, error: "missing plan name" },
          isError: true,
        };
      }
      const recorded = await appendAutoDecision(planPath(ctx.cwd, name), params).catch(() => false);
      if (!recorded) {
        return {
          content: [
            { type: "text" as const, text: `Error: could not append the auto-decision to .pi/plan/${name}.md.` },
          ],
          details: { mode, name, error: "plan write failed" },
          isError: true,
        };
      }
      const event = { ...params, name };
      pi.appendEntry(AUTO_DECISION_EVENT, event);
      pi.events.emit?.(AUTO_DECISION_EVENT, event);
      return {
        content: [{ type: "text" as const, text: "Recorded the Vibe auto-mode decision in the current artifact." }],
        details: { mode, name, ...params },
      };
    },
  });

  pi.registerTool({
    name: "save_plan",
    label: "Save Plan",
    description: agentApiText("tool.save-plan.description"),
    parameters: SavePlanParams,
    async execute(_toolCallId, params: SavePlanInput, _signal, _onUpdate, ctx) {
      const branch = ctx.sessionManager.getBranch();
      const mode = resolveWorkflowMode(branch);
      if (mode !== "spec") {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: save_plan belongs to Spec; persisted runtime mode is ${MODE_LABEL[mode]}. ${MODE_LABEL[mode]} keeps the artifact current by editing it directly.`,
            },
          ],
          details: {
            error: `save_plan is unavailable in ${MODE_LABEL[mode]} mode`,
          },
          isError: true,
        };
      }
      // The session is auto-named at start, so a rename swaps the slug and keeps
      // the timestamp: plan files stay in the order their tasks were started.
      const current = pi.getSessionName();
      const prefix = timestampPrefix(current);
      const previous = prefix && current ? current.slice(prefix.length + 1) : current;
      const slug = normalizeTaskName(params.name, previous || undefined);
      const requestedName = prefix ? `${prefix}-${slug}` : slug;
      const executed = hasEnteredVibe(branch);
      if (executed && current && current !== requestedName) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: plan names are immutable once execution has begun; keep ${current}.`,
            },
          ],
          details: { name: current, error: "plan name is immutable" },
          isError: true,
        };
      }
      const name = executed && current ? current : requestedName;

      const path = planPath(ctx.cwd, name);
      let contents: string;
      try {
        await ensurePiState(ctx.cwd);
        if (current) await movePlan(ctx.cwd, current, name);
        const existing = await readFile(path, "utf8").catch(() => "");
        const timing = readPlanTiming(existing) ?? EMPTY_PLAN_TIME;
        if (params.plan?.trim()) {
          contents = withPlanTiming(composePlan(existing, params.plan, new Date(), executed), name, timing);
        } else {
          // Omitted body: present the file the agent has been keeping current,
          // lazily upgrading a legacy plan to the script-owned time envelope.
          contents = withPlanTiming(existing, name, timing);
        }
        await writePlanAtomically(path, contents);
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: could not save plan: ${(error as Error).message}.`,
            },
          ],
          details: { name, error: (error as Error).message },
          isError: true,
        };
      }
      pi.appendEntry(PLAN_SAVED_EVENT, { name });
      pi.setSessionName(name);
      return {
        // Echoed inline so the User reviews exactly what is on disk, directly
        // above the mode picker that opens when the turn settles.
        content: [
          {
            type: "text" as const,
            text: `Plan at ${path}:\n\n${contents.trim() || "(empty)"}\n\nProposal presented. The Agent stops here; the User's mode choice follows after the turn settles.`,
          },
        ],
        details: { name, path },
      };
    },
  });
}
