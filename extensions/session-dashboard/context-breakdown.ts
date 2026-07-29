/**
 * Context breakdown — what the window is actually spent on, behind /context.
 *
 * pi reports context usage as one number. This splits it into its sources: pi's
 * own system prompt, each loaded AGENTS.md / CLAUDE.md, the skills block, the
 * tool schemas, and the conversation plus unclassified remainder.
 *
 * Method: the assembled system prompt is the ground truth for the fixed part.
 * Every context file's content is located inside it by substring search, which
 * attributes an exact character span; whatever is left over is pi's base
 * prompt. Nothing is reconstructed from host configuration, so the numbers
 * cannot drift from what was actually sent. Tool schemas travel as a separate
 * provider field rather than inside the prompt, so they are measured on their
 * own and never double-counted. Conversation and anything the estimator cannot
 * classify form the remainder of the provider-reported total — the one figure
 * that is exact — rather than a second estimate stacked on the first.
 *
 * Token counts are estimates — the host itself uses a chars/4 heuristic, and no
 * tokenizer ships with this bundle.
 */

import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import { formatTokens } from "../agent-workflow/context-usage.js";

/** Chars-per-token heuristic, matching the host's own conservative estimate. */
const CHARS_PER_TOKEN = 4;

/** Skills are injected as one XML block; measure its span rather than reloading skills. */
const SKILLS_BLOCK = /<skills>[\s\S]*?<\/skills>/;

export interface Segment {
	label: string;
	tokens: number;
	/** Loaded context files stay visible at zero, so discovery is never mistaken for prompt inclusion. */
	showWhenZero?: boolean;
}

export interface ContextFile {
	path: string;
	content: string;
}

export interface ToolLike {
	name: string;
	description?: string;
	parameters?: unknown;
}

export interface BreakdownInput {
	systemPrompt: string;
	contextFiles: ContextFile[];
	tools: ToolLike[];
	/** Active, compaction-aware entries that can contribute to provider context. */
	entries?: SessionEntry[];
	/** Provider-reported total, or null right after compaction. */
	totalTokens?: number | null;
	contextWindow?: number;
	/** Home directory, for tildifying context-file paths. Injected for tests. */
	home?: string;
}

export interface LargeContributor {
	label: string;
	tokens: number;
}

const LARGE_CONTRIBUTOR_TOKENS = 10_000;

/** Estimated tokens for a plain string. */
export function estimateTextTokens(text: string): number {
	return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function shortenPath(path: string, home?: string): string {
	const tilded = home && path.startsWith(home) ? `~${path.slice(home.length)}` : path;
	// The last two segments are what distinguishes one AGENTS.md from another.
	const parts = tilded.split("/").filter(Boolean);
	return parts.length <= 2 ? tilded : `…/${parts.slice(-2).join("/")}`;
}

/**
 * Split the assembled system prompt into per-source segments.
 *
 * A context file that does not appear in the prompt is reported as 0 rather
 * than dropped: it was loaded from disk but is not part of this prompt, and
 * that is worth seeing.
 */
export function measureSystemPrompt(prompt: string, contextFiles: ContextFile[], home?: string): Segment[] {
	const segments: Segment[] = [];
	let attributedChars = 0;

	const skills = prompt.match(SKILLS_BLOCK);
	if (skills) attributedChars += skills[0].length;

	for (const file of contextFiles) {
		const present = file.content.length > 0 && prompt.includes(file.content);
		const chars = present ? file.content.length : 0;
		attributedChars += chars;
		segments.push({ label: shortenPath(file.path, home), tokens: Math.ceil(chars / CHARS_PER_TOKEN), showWhenZero: true });
	}

	// Whatever no source claimed is pi's own prompt plus any appended prompt.
	const baseChars = Math.max(0, prompt.length - attributedChars);
	segments.unshift({ label: "base prompt", tokens: Math.ceil(baseChars / CHARS_PER_TOKEN) });

	if (skills) segments.push({ label: "skills", tokens: Math.ceil(skills[0].length / CHARS_PER_TOKEN) });

	return segments;
}

/** Tool schemas as the provider receives them: name, description, and JSON schema. */
export function measureTools(tools: ToolLike[]): Segment {
	let tokens = 0;
	for (const tool of tools) {
		tokens += estimateTextTokens(
			JSON.stringify({ name: tool.name, description: tool.description ?? "", parameters: tool.parameters ?? {} }),
		);
	}
	return { label: `tools (${tools.length})`, tokens };
}

/**
 * Markdown block, one line per segment, largest first. No tables (AGENTS.md).
 * Deliberately plain — `label -> tokens`, no bars or percentages: the ordering
 * already carries the ranking, and the numbers are estimates that a bar would
 * dress up as precision.
 *
 * The footer reports the provider's own total when there is one, so an
 * estimate that has drifted from reality is visible rather than hidden.
 */
export function renderBreakdown(segments: Segment[], totalTokens?: number | null, contextWindow?: number): string {
	const shown = segments.filter((s) => s.tokens > 0 || s.showWhenZero).sort((a, b) => b.tokens - a.tokens);
	if (shown.length === 0) return "";

	const sum = shown.reduce((total, s) => total + s.tokens, 0);
	const lines = shown.map((s) => `${s.label} -> ${formatTokens(s.tokens)}`);

	const total = totalTokens ?? sum;
	const ofWindow =
		contextWindow && contextWindow > 0
			? ` / ${formatTokens(contextWindow)} · ${Math.round((total / contextWindow) * 100)}%`
			: "";
	// "≈" only when the total is our own sum; an unmarked figure is the provider's.
	const source = totalTokens == null ? "≈ " : "";
	lines.push("", `total -> ${source}${formatTokens(total)}${ofWindow}`);

	return ["*context breakdown (estimated)*", "```", ...lines, "```"].join("\n");
}

function contentTokens(content: unknown): number {
	if (typeof content === "string") return estimateTextTokens(content);
	if (!Array.isArray(content)) return 0;
	return estimateTextTokens(JSON.stringify(content));
}

function usefulToolArgument(args: unknown, home?: string): string | undefined {
	if (!args || typeof args !== "object") return undefined;
	const values = args as Record<string, unknown>;
	for (const key of ["path", "command", "query", "pattern"]) {
		if (typeof values[key] !== "string" || !values[key]) continue;
		const value = key === "path" ? shortenPath(values[key], home) : values[key].replace(/\s+/g, " ");
		return value.length > 80 ? `${value.slice(0, 77)}…` : value;
	}
	return undefined;
}

/** Estimate individually actionable messages and tool results in active context. */
export function measureLargeContributors(entries: SessionEntry[], home?: string): LargeContributor[] {
	const toolCalls = new Map<string, { name: string; argument?: string }>();
	for (const entry of entries) {
		if (entry.type !== "message" || entry.message.role !== "assistant") continue;
		for (const item of entry.message.content) {
			if (item.type !== "toolCall") continue;
			toolCalls.set(item.id, { name: item.name, argument: usefulToolArgument(item.arguments, home) });
		}
	}

	const contributors: LargeContributor[] = [];
	for (const entry of entries) {
		let label: string | undefined;
		let tokens = 0;
		if (entry.type === "message") {
			const message = entry.message;
			if (message.role === "toolResult") {
				tokens = contentTokens(message.content);
				const call = toolCalls.get(message.toolCallId);
				const name = call?.name ?? message.toolName;
				label = `tool result: ${name}${call?.argument ? ` ${call.argument}` : ""}`;
			} else if (message.role === "user" || message.role === "assistant" || message.role === "custom") {
				tokens = contentTokens(message.content);
				label = `${message.role} message`;
			} else if (message.role === "bashExecution" && !message.excludeFromContext) {
				tokens = estimateTextTokens(`${message.command}\n${message.output}`);
				label = "bash execution";
			} else if (message.role === "compactionSummary" || message.role === "branchSummary") {
				tokens = estimateTextTokens(message.summary);
				label = message.role === "compactionSummary" ? "compaction summary" : "branch summary";
			}
		} else if (entry.type === "custom_message") {
			tokens = contentTokens(entry.content);
			label = `${entry.customType} message`;
		} else if (entry.type === "compaction" || entry.type === "branch_summary") {
			tokens = estimateTextTokens(entry.summary);
			label = entry.type === "compaction" ? "compaction summary" : "branch summary";
		}
		if (label && tokens >= LARGE_CONTRIBUTOR_TOKENS) contributors.push({ label, tokens });
	}
	return contributors.sort((a, b) => b.tokens - a.tokens);
}

function renderLargeContributors(contributors: LargeContributor[]): string {
	if (contributors.length === 0) return "";
	return [
		"*large contributors (>=10k estimated)*",
		"```",
		...contributors.map((item) => `${item.label} -> ${formatTokens(item.tokens)}`),
		"```",
	].join("\n");
}

/** Full fixed-source breakdown plus opt-in details for unusually large entries. */
export function buildContextBreakdown(input: BreakdownInput): string {
	const fixed = [
		...measureSystemPrompt(input.systemPrompt, input.contextFiles, input.home),
		measureTools(input.tools),
	];

	const segments = [...fixed];
	if (input.totalTokens != null) {
		// Clamped at zero: our estimate can overshoot a small real total, and a
		// negative remainder would be noise, not information.
		const overhead = fixed.reduce((sum, s) => sum + s.tokens, 0);
		segments.unshift({ label: "conversation / unclassified", tokens: Math.max(0, input.totalTokens - overhead) });
	}

	const breakdown = renderBreakdown(segments, input.totalTokens, input.contextWindow);
	const large = renderLargeContributors(measureLargeContributors(input.entries ?? [], input.home));
	return [breakdown, large].filter(Boolean).join("\n\n");
}
