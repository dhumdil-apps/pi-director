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

## User surface

Automatic on interactive session start. Shows the working directory, recent
usage, and the closing `❓ /help` prompt, which opens a reference of the bundle's
commands, shortcuts, and extensions.

## Origin

Bundle-local.
