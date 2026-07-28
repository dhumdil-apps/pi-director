import { randomUUID } from "node:crypto";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG_DIR_NAME, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "@sinclair/typebox";
import { hasApprovedPlan } from "./phase.js";

/**
 * A session name is `[timestamp-][TICKET-N-]slug`. The timestamp segment is read
 * first and on its own: without it, `2026-07-24--13-05-01-…` parses as the ticket
 * ID `2026-07` and the rest as the slug.
 */
const TIMESTAMP = /^(\d{4}-\d{2}-\d{2}--\d{2}-\d{2}-\d{2})(?:-|$)/;
const SESSION_NAME = /^(?:(\d{4}-\d{2}-\d{2}--\d{2}-\d{2}-\d{2})-)?(?:([a-z0-9]+-\d+)-)?([a-z0-9]+(?:-[a-z0-9]+)*)$/i;
const TICKET_ID = /\b([a-z0-9]+-\d+)\b/i;
const MAX_SLUG_WORDS = 4;
const PLAN_FILE = /^(.+)\.md$/;

/** Scaffolded at session start; the topics mirror the plan step of the loop. */
export const PLAN_TEMPLATE = [
	"# <session-name>",
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
	"## Checklist",
	"- [ ] <task>",
	"",
].join("\n");

/**
 * Scaffolded alongside the first plan. Orientation maps the project; quirks record
 * the non-obvious constraints worth reusing during exploration.
 */
export const MEMORY_STUB = [
	"# Project memory",
	"",
	"## Orientation",
	"",
	"## Quirks",
	"",
].join("\n");

const HANDOFF_USAGE = "Usage: /handoff [session-name].";

const STOP_WORDS = new Set([
	"a", "an", "and", "are", "as", "be", "can", "could", "for", "i", "is", "it", "need",
	"of", "or", "please", "should", "that", "the", "this", "to", "want", "we", "with", "would",
]);

const SavePlanParams = Type.Object({
	name: Type.String({ description: "The new session name: a concise 2–4 meaningful-word summary of the work, optionally prefixed with a ticket ID (e.g. TEST-1234)." }),
	plan: Type.Optional(Type.String({ description: "The plan as Markdown, under the headings the plan file was scaffolded with: Current state, Decisions, Desired state, Approach, Quirks, Checklist. Before approval, provide the complete current proposal and it replaces the draft; after execution begins, provide only changes and they append as a dated revision. Omit it to present what the Agent already wrote there with the edit tool." })),
});

const REVISION_HEADING = /^## Revision (\d+)\b/gm;

function revisionStamp(now: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** True while the file still holds nothing but the scaffold the session started with. */
export function isScaffold(existing: string): boolean {
	const body = existing.replace(/^# .*$/m, "").replace(/<[^>\n]+>/g, "").replace(/- \[ \]/g, "");
	return !body.replace(/^#+ .*$/gm, "").trim();
}

/**
 * Before approval, the plan is one proposal the User can read and correct, so
 * every save replaces it. Once execution starts, a changed plan becomes a dated
 * revision, preserving the approved proposal and the reason it changed.
 */
export function composePlan(existing: string, body: string, now: Date, appendRevision = false): string {
	const next = body.trim();
	const previous = existing.trim();
	if (!next) return `${previous}\n`;
	if (!previous || isScaffold(previous) || !appendRevision) return `${next}\n`;
	// Already the tail of the file: a re-presentation, not a revision.
	if (previous.endsWith(next)) return `${previous}\n`;
	const count = previous.match(REVISION_HEADING)?.length ?? 0;
	return `${previous}\n\n---\n\n## Revision ${count + 2} — ${revisionStamp(now)}\n\n${next}\n`;
}

type SavePlanInput = Static<typeof SavePlanParams>;

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

/** The leading `YYYY-MM-DD--HH-MM-SS` segment of an auto-scaffolded name, if any. */
export function timestampPrefix(name: string | undefined): string | undefined {
	return name?.trim().match(TIMESTAMP)?.[1];
}

function stamp(now: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	const date = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join("-");
	const time = [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join("-");
	return `${date}--${time}`;
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
export function resolvePlanTask(cwd: string, requested: string | undefined, sessionName: string | undefined): PlanResolution {
	if (requested) {
		const name = canonicalTaskName(requested);
		if (!name) return { error: `"${requested}" is not a session name. ${HANDOFF_USAGE}` };
		return taskFor(cwd, name);
	}

	// The session name is the plan file's name once save_plan named it.
	const current = canonicalTaskName(sessionName);
	if (current && existsSync(planPath(cwd, current))) return taskFor(cwd, current);

	const names = listPlanNames(cwd);
	if (names.length === 1) return taskFor(cwd, names[0]);
	if (names.length > 1) return { error: `Several plans under ${CONFIG_DIR_NAME}/plan/: ${names.join(", ")} — run /handoff <session-name>.` };
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
		description: "Present the plan at .pi/plan/<session-name>.md for the User's decision, renaming the session to a meaningful name — the leading timestamp is kept, so plans stay time-ordered. Before approval, a complete plan replaces the draft; after execution begins, a passed change appends as a dated revision. Omit the plan to present what the Agent already wrote there. Plan files belong to the User: never delete one.",
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
					const existing = await readFile(path, "utf8").catch(() => "");
					const approved = hasApprovedPlan(ctx.sessionManager.getBranch(), name);
					contents = composePlan(existing, params.plan, new Date(), approved);
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
				// Echoed inline so the decision is made against exactly what is on disk,
				// and closed with the one instruction that only lands at this exact point:
				// the approval prompt fires when the turn settles, so the turn must end here.
				content: [
					{
						type: "text" as const,
						text: `Plan at ${path}:\n\n${contents.trim() || "(empty)"}\n\nPlan presented — the Agent ends its turn now and awaits the User's decision. Approval arrives as a message naming this plan path.`,
					},
				],
				details: { name, path },
			};
		},
	});
}
