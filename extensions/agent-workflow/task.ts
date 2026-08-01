import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG_DIR_NAME, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "@sinclair/typebox";
import { hasApprovedPlan } from "./phase.js";
import { EMPTY_PLAN_TIME, readPlanTiming, stripTimeSpent, timeSpentBlock, withPlanTiming, writePlanAtomically } from "./plan-time.js";

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
const ARTIFACT_MARKER = /^<!-- agent-workflow:artifact kind=(implementation|investigation)(?: source=([^\s]+))? -->$/m;

export type TaskIntent = "implementation" | "investigation";
export const TASK_STARTED_EVENT = "agent-workflow:task-started";

export interface TaskStartedEvent {
	/** A distinct follow-up artifact starts its own timing history. */
	resetTiming: boolean;
}

export interface ArtifactMetadata {
	kind: TaskIntent;
	/** The preserved investigation record that led to an implementation plan. */
	source?: string;
}

function artifactMarker(metadata: ArtifactMetadata): string {
	return `<!-- agent-workflow:artifact kind=${metadata.kind}${metadata.source ? ` source=${metadata.source}` : ""} -->`;
}

function template(metadata: ArtifactMetadata, sections: string[]): string {
	return [
		"# <session-name>",
		"",
		timeSpentBlock(EMPTY_PLAN_TIME),
		"",
		artifactMarker(metadata),
		"",
		...sections,
		"",
	].join("\n");
}

const IMPLEMENTATION_SECTIONS = [
	"## Current state", "<how it works today>", "", "## Align", "<questions asked and how they were answered>", "",
	"## Desired state", "<what it should do instead>", "", "## Approach", "<how to get from current to desired>", "",
	"## Quirks", "<non-obvious constraints, gotchas, key paths>", "", "## Checklist", "- [ ] <task>",
];

const INVESTIGATION_SECTIONS = [
	"## Question", "<what the investigation needs to answer>", "", "## Align", "<questions asked and how they were answered>", "",
	"## Scope", "<what is and is not being investigated>", "", "## Findings", "<verified evidence and observations>", "",
	"## Conclusion", "<answer and recommended next step>", "", "## Quirks", "<non-obvious constraints, gotchas, key paths>", "",
	"## Checklist", "- [ ] <task>",
];

function templateFor(metadata: ArtifactMetadata): string {
	return template(metadata, metadata.kind === "investigation" ? INVESTIGATION_SECTIONS : IMPLEMENTATION_SECTIONS);
}

/** Scaffolded at session start; the topics mirror the implementation path. */
export const PLAN_TEMPLATE = templateFor({ kind: "implementation" });

/** Read-only work keeps evidence and conclusions, not an execution proposal. */
export const INVESTIGATION_TEMPLATE = templateFor({ kind: "investigation" });

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
	plan: Type.Optional(Type.String({ description: "The plan as Markdown, under the headings the plan file was scaffolded with: Current state, Align, Desired state, Approach, Quirks, Checklist. Before approval, provide the complete current proposal and it replaces the draft. After execution begins, pass only material re-plan changes; they append as a dated revision and reopen approval. Use the edit tool instead for routine checklist, Quirks, and completion updates, and do not call save_plan at close-out. Omit plan to present what the Agent already wrote there." })),
});

const REVISION_HEADING = /^## Revision (\d+)\b/gm;

function revisionStamp(now: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** True while the file still holds nothing but the scaffold the session started with. */
export function isScaffold(existing: string): boolean {
	const body = stripTimeSpent(existing)
		.replace(/^# .*$/m, "")
		.replace(ARTIFACT_MARKER, "")
		.replace(/<[^>\n]+>/g, "")
		.replace(/- \[ \]/g, "");
	return !body.replace(/^#+ .*$/gm, "").trim();
}

export function readArtifactMetadata(contents: string): ArtifactMetadata | undefined {
	const match = contents.match(ARTIFACT_MARKER);
	if (!match) return undefined;
	return { kind: match[1] as TaskIntent, ...(match[2] ? { source: match[2] } : {}) };
}

/** Keep script-owned artifact identity even when save_plan replaces the proposal body. */
function withArtifactMetadata(contents: string, metadata: ArtifactMetadata | undefined): string {
	if (!metadata) return contents;
	const clean = contents.replace(ARTIFACT_MARKER, "").trim();
	const firstLineEnd = clean.indexOf("\n");
	const firstLine = firstLineEnd === -1 ? clean : clean.slice(0, firstLineEnd);
	if (!/^# (?!#)/.test(firstLine)) return `${artifactMarker(metadata)}${clean ? `\n\n${clean}` : ""}\n`;
	const body = clean.slice(firstLineEnd === -1 ? clean.length : firstLineEnd + 1).trim();
	return `${firstLine}\n\n${artifactMarker(metadata)}${body ? `\n\n${body}` : ""}\n`;
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
	const destination = planPath(cwd, to);
	if (existsSync(destination)) throw new Error(`A plan named ${to} already exists`);
	await rename(source, destination);
}

export interface BeginTaskResult {
	name: string;
	path: string;
	metadata: ArtifactMetadata;
}

/**
 * Apply the context-informed identity chosen for an initial/new-task Align.
 * A follow-up implementation preserves its source investigation as a separate
 * record; ordinary initial setup renames the temporary raw-prompt scaffold.
 */
export async function beginTask(cwd: string, current: string | undefined, summary: string, intent: TaskIntent): Promise<BeginTaskResult> {
	await ensurePiState(cwd);
	const prefix = timestampPrefix(current);
	const previous = prefix && current ? current.slice(prefix.length + 1) : current;
	const slug = normalizeTaskName(summary, previous || undefined);
	const name = prefix ? `${prefix}-${slug}` : slug;
	const sourcePath = current ? planPath(cwd, current) : undefined;
	const sourceContents = sourcePath ? await readFile(sourcePath, "utf8").catch(() => "") : "";
	const sourceMetadata = readArtifactMetadata(sourceContents);
	const followsInvestigation = sourceMetadata?.kind === "investigation" && intent === "implementation";

	if (followsInvestigation && current === name) {
		throw new Error("A follow-up implementation needs a distinct name so the investigation record is preserved");
	}

	const metadata: ArtifactMetadata = followsInvestigation
		? { kind: "implementation", source: current }
		: { kind: intent };
	const path = planPath(cwd, name);

	if (followsInvestigation) {
		if (existsSync(path)) throw new Error(`A plan named ${name} already exists`);
		const contents = templateFor(metadata).replace("<session-name>", name);
		await writeFile(path, contents, { encoding: "utf8", flag: "wx" });
		return { name, path, metadata };
	}

	if (current) await movePlan(cwd, current, name);
	const existing = await readFile(path, "utf8").catch(() => "");
	if (!existing || isScaffold(existing)) {
		const base = intent === "investigation" ? INVESTIGATION_TEMPLATE : PLAN_TEMPLATE;
		const timing = readPlanTiming(existing) ?? EMPTY_PLAN_TIME;
		await writePlanAtomically(path, withPlanTiming(base.replace("<session-name>", name), name, timing));
	}
	return { name, path, metadata: readArtifactMetadata(await readFile(path, "utf8")) ?? metadata };
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

export function registerTaskManagement(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "save_plan",
		label: "Save Plan",
		description: "Present the plan at .pi/plan/<session-name>.md for the User's decision, renaming the session to a meaningful name — the leading timestamp is kept, so plans stay time-ordered. Before approval, a complete plan replaces the draft. After execution begins, call save_plan only for a material re-plan that needs renewed approval: passed changes append as a dated revision and reopen the approval picker. Directly edit routine checklist, Quirks, and completion updates; do not call save_plan at close-out. Omit plan to present what the Agent already wrote there. Plan files belong to the User: never delete one.",
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
				const existing = await readFile(path, "utf8").catch(() => "");
				const timing = readPlanTiming(existing) ?? EMPTY_PLAN_TIME;
				const metadata = readArtifactMetadata(existing);
				if (params.plan?.trim()) {
					const approved = hasApprovedPlan(ctx.sessionManager.getBranch(), name);
					const composed = composePlan(existing, params.plan, new Date(), approved);
					contents = withPlanTiming(withArtifactMetadata(composed, metadata), name, timing);
				} else {
					// Omitted body: present the file the agent has been keeping current,
					// lazily upgrading a legacy plan to the script-owned time envelope.
					contents = withPlanTiming(existing, name, timing);
				}
				await writePlanAtomically(path, contents);
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
				details: { name, path, ...(readArtifactMetadata(contents) ?? { kind: "implementation" as const }) },
			};
		},
	});
}
