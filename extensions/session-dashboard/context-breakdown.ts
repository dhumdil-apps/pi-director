/**
 * Context breakdown — what the window is actually spent on, behind /context.
 *
 * pi reports context usage as one number. This splits it into its sources: pi's
 * own system prompt, each loaded AGENTS.md / CLAUDE.md, the skills block, the
 * tool schemas, and the conversation.
 *
 * Method: the assembled system prompt is the ground truth for the fixed part.
 * Every context file's content is located inside it by substring search, which
 * attributes an exact character span; whatever is left over is pi's base
 * prompt. Nothing is reconstructed from host configuration, so the numbers
 * cannot drift from what was actually sent. Tool schemas travel as a separate
 * provider field rather than inside the prompt, so they are measured on their
 * own and never double-counted. The conversation is then the remainder of the
 * provider-reported total — the one figure that is exact — rather than a second
 * estimate stacked on the first.
 *
 * Token counts are estimates — the host itself uses a chars/4 heuristic, and no
 * tokenizer ships with this bundle.
 */

import { formatTokens } from "../agent-workflow/context-usage.js";

/** Chars-per-token heuristic, matching the host's own conservative estimate. */
const CHARS_PER_TOKEN = 4;

/** Skills are injected as one XML block; measure its span rather than reloading skills. */
const SKILLS_BLOCK = /<skills>[\s\S]*?<\/skills>/;

export interface Segment {
	label: string;
	tokens: number;
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
	/** Provider-reported total, or null right after compaction. */
	totalTokens?: number | null;
	contextWindow?: number;
	/** Home directory, for tildifying context-file paths. Injected for tests. */
	home?: string;
}

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
		segments.push({ label: shortenPath(file.path, home), tokens: Math.ceil(chars / CHARS_PER_TOKEN) });
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
	const shown = segments.filter((s) => s.tokens > 0).sort((a, b) => b.tokens - a.tokens);
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

/**
 * Full pipeline: measure every fixed source, derive the conversation as the
 * remainder of the reported total, and render the markdown block.
 */
export function buildContextBreakdown(input: BreakdownInput): string {
	const fixed = [
		...measureSystemPrompt(input.systemPrompt, input.contextFiles, input.home),
		measureTools(input.tools),
	];

	const segments = [...fixed];
	if (input.totalTokens != null) {
		// Clamped at zero: our estimate can overshoot a small real total, and a
		// negative conversation would be noise, not information.
		const overhead = fixed.reduce((sum, s) => sum + s.tokens, 0);
		segments.unshift({ label: "conversation", tokens: Math.max(0, input.totalTokens - overhead) });
	}

	return renderBreakdown(segments, input.totalTokens, input.contextWindow);
}
