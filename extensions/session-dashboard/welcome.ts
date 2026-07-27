export const USAGE_CHART_START = "<!-- session-dashboard-usage-chart -->";
export const USAGE_CHART_END = "<!-- /session-dashboard-usage-chart -->";

export interface WelcomeParts {
	/** De-emphasised working directory, plain markdown. */
	workingDirectory?: string;
	welcome?: string;
	/** Serialized GraphModel (JSON) for the "Last 30 Days" cost chart, or "" to omit. */
	usageChart?: string;
	/** Loaded context-file paths, plain markdown. */
	contextFiles?: string;
	/** Short de-emphasised hint, plain markdown. */
	tip?: string;
	/** Project-memory freshness warning, preformatted as a markdown quote. */
	memoryNotice?: string;
}

/** Assemble the interactive welcome message from its (already-styled) pieces. */
export function renderWelcomeText({ workingDirectory, welcome, usageChart, contextFiles, tip, memoryNotice }: WelcomeParts): string {
	const sections: string[] = [];
	if (workingDirectory) sections.push(workingDirectory);
	if (tip) sections.push(tip);
	if (usageChart) sections.push(`${USAGE_CHART_START}\n${usageChart}\n${USAGE_CHART_END}`);
	if (contextFiles) sections.push(contextFiles);
	if (welcome) sections.push(welcome);
	if (memoryNotice) sections.push(memoryNotice);
	return sections.join("\n\n").trim();
}
