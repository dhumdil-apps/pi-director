import { randomUUID } from "node:crypto";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG_DIR_NAME, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "@sinclair/typebox";
import { markClosed } from "./loop.js";

/**
 * A task name is `[timestamp-][TICKET-N-]slug`. The timestamp segment is read
 * first and on its own: without it, `2026-07-24-13-05-01-…` parses as the ticket
 * ID `2026-07` and the rest as the slug.
 */
const TIMESTAMP = /^(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})(?:-|$)/;
const SESSION_NAME = /^(?:(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})-)?(?:([a-z0-9]+-\d+)-)?([a-z0-9]+(?:-[a-z0-9]+)*)$/i;
const TICKET_ID = /\b([a-z0-9]+-\d+)\b/i;
const MAX_SLUG_WORDS = 4;
const PLAN_FILE = /^(.+)\.md$/;

/** Scaffolded at session start; the topics mirror the plan step of the loop. */
export const PLAN_TEMPLATE = [
	"# <task-name>",
	"",
	"## Current state",
	"<how it works today>",
	"",
	"## Decisions",
	"<questions asked and how they were answered>",
	"",
	"## Desired state",
	"<what it should do instead>",
	"",
	"## Approach",
	"<how to get from current to desired>",
	"",
	"## Quirks",
	"<non-obvious constraints, gotchas, key paths>",
	"",
	"## Implementation summary",
	"<filled at close-out — what changed, what verification ran, what was skipped>",
	"",
].join("\n");

const MEMORY_STUB = "# Project memory\n\nDurable facts about this project — conventions learned, traps hit, decisions worth keeping.\n";

/** Heading save_summary appends under; a re-run replaces the section instead of stacking. */
const SUMMARY_HEADING = "## Implementation summary";
const HANDOFF_USAGE = "Usage: /handoff [task-name].";

const STOP_WORDS = new Set([
	"a", "an", "and", "are", "as", "be", "can", "could", "for", "i", "is", "it", "need",
	"of", "or", "please", "should", "that", "the", "this", "to", "want", "we", "with", "would",
]);

const SavePlanParams = Type.Object({
	name: Type.String({ description: "A concise 2–4 meaningful-word task summary, optionally prefixed with a ticket ID (e.g. TEST-1234)." }),
	plan: Type.Optional(Type.String({ description: "The complete plan as Markdown, shaped to the task — usually current state, decisions taken, desired state, approach, and quirks. Omit to present the plan file as you have already written it." })),
});

type SavePlanInput = Static<typeof SavePlanParams>;

const SaveSummaryParams = Type.Object({
	summary: Type.String({ description: "The close-out as Markdown: what changed, what verification ran and what it reported, and every check skipped or failed." }),
	name: Type.Optional(Type.String({ description: "Task whose plan file receives the summary. Defaults to this session's task." })),
});

type SaveSummaryInput = Static<typeof SaveSummaryParams>;

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
		.filter((word) => word && !STOP_WORDS.has(word))
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

/** The leading `YYYY-MM-DD-HH-MM-SS` segment of an auto-scaffolded name, if any. */
export function timestampPrefix(name: string | undefined): string | undefined {
	return name?.trim().match(TIMESTAMP)?.[1];
}

function stamp(now: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return [
		now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()),
		pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds()),
	].join("-");
}

/**
 * The name a fresh session gets before anyone knows what the task really is:
 * the local timestamp keeps `.pi/plan/` lexically time-ordered, and the words
 * from the first prompt make the file recognisable until save_plan renames it.
 */
export function autoSlug(prompt: string, now: Date): string {
	return `${stamp(now)}-${normalizeTaskName(prompt)}`;
}

/** Create `.pi/plan/` and, when absent, a `.pi/MEMORY.md` stub. Idempotent. */
export async function ensurePiState(cwd: string): Promise<void> {
	await mkdir(join(cwd, CONFIG_DIR_NAME, "plan"), { recursive: true });
	const memory = join(cwd, CONFIG_DIR_NAME, "MEMORY.md");
	if (!existsSync(memory)) {
		await writeFile(memory, MEMORY_STUB, { encoding: "utf8", flag: "wx" }).catch(() => {});
	}
}

/** Carry a plan file over to its new name; a missing source is not an error. */
export async function movePlan(cwd: string, from: string, to: string): Promise<void> {
	if (from === to) return;
	const source = planPath(cwd, from);
	if (!existsSync(source)) return;
	await rename(source, planPath(cwd, to));
}

export function planPath(cwd: string, name: string): string {
	return join(cwd, CONFIG_DIR_NAME, "plan", `${name}.md`);
}

/** Unique canonical task names that own a plan file under .pi/plan/. */
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
 * Which task a plan-consuming operation (/handoff, save_summary, the approval
 * prompt) is about. .pi/plan/ accumulates — plan files are never deleted by the
 * agent — so resolution never assumes a single file: the explicit name wins,
 * then the session name, and only a lone remaining file is picked implicitly.
 */
export function resolvePlanTask(cwd: string, requested: string | undefined, sessionName: string | undefined): PlanResolution {
	if (requested) {
		const name = canonicalTaskName(requested);
		if (!name) return { error: `"${requested}" is not a task name. ${HANDOFF_USAGE}` };
		return taskFor(cwd, name);
	}

	// The session name is the task name once save_plan named it.
	const current = canonicalTaskName(sessionName);
	if (current && existsSync(planPath(cwd, current))) return taskFor(cwd, current);

	const names = listPlanNames(cwd);
	if (names.length === 1) return taskFor(cwd, names[0]);
	if (names.length > 1) return { error: `Several plans under ${CONFIG_DIR_NAME}/plan/: ${names.join(", ")} — run /handoff <task-name>.` };
	return { error: `No plan under ${CONFIG_DIR_NAME}/plan/ — plan first.` };
}

async function writeAtomically(path: string, contents: string): Promise<void> {
	const temporaryPath = `${path}.${randomUUID()}.tmp`;
	try {
		await writeFile(temporaryPath, contents, { encoding: "utf8", flag: "wx" });
		await rename(temporaryPath, path);
	} catch (error) {
		await rm(temporaryPath, { force: true });
		throw error;
	}
}

export function registerTaskManagement(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "save_plan",
		label: "Save Plan",
		description: "Present the plan at .pi/plan/<task-name>.md for the user's decision, renaming the session's task to a meaningful name. Pass plan to (over)write the file, or omit it to present what you already wrote there.",
		parameters: SavePlanParams,
		async execute(_toolCallId, params: SavePlanInput, _signal, _onUpdate, ctx) {
			// The session is auto-named at start, so a rename swaps the slug and keeps
			// the timestamp: plan files stay in the order their tasks were started.
			const current = pi.getSessionName();
			const prefix = timestampPrefix(current);
			const previous = prefix && current ? current.slice(prefix.length + 1) : current;
			const slug = normalizeTaskName(params.name, previous || undefined);
			const name = prefix ? `${prefix}-${slug}` : slug;

			const path = planPath(ctx.cwd, name);
			let contents: string;
			try {
				await ensurePiState(ctx.cwd);
				if (current) await movePlan(ctx.cwd, current, name);
				if (params.plan?.trim()) {
					contents = `${params.plan.trim()}\n`;
					await writeAtomically(path, contents);
				} else {
					// Omitted body: present the file the agent has been keeping current.
					contents = await readFile(path, "utf8").catch(() => "");
				}
			} catch (error) {
				return {
					content: [{ type: "text" as const, text: `Error: could not save plan: ${(error as Error).message}.` }],
					details: { name, error: (error as Error).message },
					isError: true,
				};
			}
			pi.setSessionName(name);
			return {
				// Echoed inline so the decision is made against exactly what is on disk.
					content: [{ type: "text" as const, text: `Plan at ${path}:\n\n${contents.trim() || "(empty)"}` }],
				details: { name, path },
			};
		},
	});

	pi.registerTool({
		name: "save_summary",
		label: "Save Summary",
		description: "Close the task out: append an honest implementation summary to its plan file at .pi/plan/<task-name>.md. Re-running replaces the previous summary rather than stacking another one.",
		parameters: SaveSummaryParams,
		async execute(_toolCallId, params: SaveSummaryInput, _signal, _onUpdate, ctx) {
			if (!params.summary.trim()) {
				return {
					content: [{ type: "text" as const, text: "Error: summary is required." }],
					details: { error: "summary is required" },
					isError: true,
				};
			}

			const { task, error } = resolvePlanTask(ctx.cwd, params.name?.trim() || undefined, pi.getSessionName());
			if (error || !task) {
				return {
					content: [{ type: "text" as const, text: `Error: ${error ?? HANDOFF_USAGE}` }],
					details: { error: error ?? HANDOFF_USAGE },
					isError: true,
				};
			}

			const path = planPath(ctx.cwd, task.name);
			try {
				const existing = await readFile(path, "utf8");
				await writeAtomically(path, `${withoutSummary(existing)}\n\n${SUMMARY_HEADING}\n\n${params.summary.trim()}\n`);
			} catch (caught) {
				return {
					content: [{ type: "text" as const, text: `Error: could not save summary: ${(caught as Error).message}.` }],
					details: { name: task.name, error: (caught as Error).message },
					isError: true,
				};
			}

			// The plan file is written first: the close-out fact should only exist
			// once the summary it refers to is actually on disk.
			markClosed(pi, task.name);
			return {
				content: [{ type: "text" as const, text: `Summary appended to ${path}:\n\n${params.summary.trim()}` }],
				details: { name: task.name, path },
			};
		},
	});
}

/** Drop a previous summary section so a re-run replaces it instead of stacking. */
function withoutSummary(plan: string): string {
	const index = plan.startsWith(SUMMARY_HEADING) ? 0 : plan.lastIndexOf(`\n${SUMMARY_HEADING}`);
	return (index === -1 ? plan : plan.slice(0, index)).trimEnd();
}
