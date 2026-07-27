# Session Dashboard

Startup banner for interactive parent sessions.

The dashboard includes one concise quick reference: `🧠 /init · 📊 /usage · ⚙️
/extension-settings · ❓ /help`. `extensions.ts` still supplies the grouped
metadata and descriptions for `/help`; its focused test requires an exact
one-to-one match with the active extension manifest.

When the low-noise project-memory cadence allows a reminder, the dashboard
places its concise `/init` prompt last, after the context-file list. Uncommitted
work is ignored; relevant committed work gets a one-day grace period, and the
same stale `HEAD` is not repeated. This check and usage collection start
concurrently, then render once as one ordered card; a cold usage cache can
therefore keep the loading widget visible longer.

A "Last 30 Days · Per bucket cost · by model" usage chart follows when usage is
available: a non-interactive braille line chart built from `usage-history`'s
`buildGraphModel` and `renderChart`, showing the last 30 days' spend by model
(with a "No usage in the last 30 days" fallback). Its x-axis uses date labels. The
Total series is hidden here — `renderChart` draws it last so it wins contested
cells, which on a card this small overdraws the per-model lines it summarizes; the
legend closes with it as a dim, markerless summary row instead. `/usage` is
unaffected: there the Total stays visible and its legend can toggle it.

At the top, the welcome shows the working directory (italic /
de-emphasised), followed by the shortcuts and usage chart. A path-only list of
the `AGENTS.md`/`CLAUDE.md` files Pi actually included follows the chart. It
uses Pi's standard context-file resolver and confirms each non-empty file's
content is present in the startup prompt, so discovery alone never claims a
file was loaded. Git branch/status are intentionally not repeated here.

`❓ /help` remains the full reference for commands, shortcuts, and every active
extension with its complete description.
The help document is built by `help.ts` from the same
`EXTENSION_PRESENTATIONS` manifest and rendered in the banner's themed box.

The dashboard does not duplicate the Progress Tracker phase ribbon.

## Context breakdown

`/context` renders the detailed current breakdown on demand: estimated tokens
for the base prompt, each loaded `AGENTS.md`/`CLAUDE.md`, skills, tool schemas,
and conversation. There is no automatic detailed card, because its conversation
figure would immediately become stale and sending it as a custom message would
add it to model context.

Progress Tracker independently retains the provider-reported aggregate context
from the first completed turn. It is intentionally not presented here as an
initial-instructions count: that aggregate also includes the first user message.

`context-breakdown.ts` measures against reality instead of re-deriving it. The
assembled system prompt (`ctx.getSystemPrompt()`) is the ground truth for the
fixed part: each context file's content is located inside it by substring
search, which yields an exact character span, and whatever no source claims is
pi's base prompt. A file that was loaded but is absent from the prompt reports
0 rather than disappearing. Tool schemas travel as a separate provider field,
not inside the prompt, so they are sized from `pi.getAllTools()` and cannot
double-count. The conversation is then the remainder of the provider-reported
total, not a second estimate stacked on the first — and the footer shows that
total, so a drifted estimate is visible rather than hidden.

The command handler uses `getSystemPromptOptions()`, which hands back exactly
the context files the host used. Counts are estimates: the host itself uses a
chars/4 heuristic and no tokenizer ships with this bundle.

## User surface

Automatic on interactive session start. Starts with the working directory,
followed by shortcuts to `/init`, `/usage`, `/extension-settings`, and `/help`,
then recent usage and loaded context-file paths; any project-memory freshness
notice is last in the same card. `/help` opens a reference
of the bundle's commands, shortcuts, and extensions; `/context` refreshes the
detailed breakdown on demand.

## Origin

Bundle-local.
