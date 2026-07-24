# Session Dashboard

Startup banner for interactive parent sessions.

The dashboard ends with one concise prompt: `❓ /help`. `extensions.ts` still
supplies the grouped metadata and descriptions for `/help`; its focused test
requires an exact one-to-one match with the active extension manifest.

One concise, plain-markdown context line appears first: the working directory
(italic / de-emphasised). Loaded context files and git branch/status are
intentionally not repeated here.

A "Last 30 Days · Per bucket cost · by model" usage chart follows when usage is
available: a non-interactive braille line chart built from `usage-history`'s
`buildGraphModel` and `renderChart`, showing the last 30 days' spend by model
(with a "No usage in the last 30 days" fallback). Its x-axis uses date labels. The
Total series is hidden here — `renderChart` draws it last so it wins contested
cells, which on a card this small overdraws the per-model lines it summarizes; the
legend closes with it as a dim, markerless summary row instead. `/usage` is
unaffected: there the Total stays visible and its legend can toggle it.

The sole `❓ /help` prompt follows at the bottom.

`❓ /help` remains the full reference for commands, shortcuts, and every active
extension with its complete description.
The help document is built by `help.ts` from the same
`EXTENSION_PRESENTATIONS` manifest and rendered in the banner's themed box.

The dashboard does not duplicate the Progress Tracker phase ribbon.

## `/context`

`/context` breaks the window down by source — conversation, base prompt, each
loaded `AGENTS.md`/`CLAUDE.md`, the skills block, and the tool schemas — into
the same themed box `/help` uses. It is on demand rather than part of the
banner: at session start there is no conversation to measure, and the
conversation is the segment that actually moves.

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

The command handler is the only place with `getSystemPromptOptions()`, which
hands back exactly the context files the host used; that is why this lives
behind a command and not an event. Counts are estimates: the host itself uses a
chars/4 heuristic and no tokenizer ships with this bundle.

## User surface

Automatic on interactive session start. Shows the working directory, recent
usage, and the closing `❓ /help` prompt, which opens a reference of the bundle's
commands, shortcuts, and extensions. `/context` is available on demand.

## Origin

Bundle-local.
