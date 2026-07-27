# Project Memory

Read-only freshness detection for deliberate project-memory maintenance.

On interactive session start, the extension resolves the repository's memory
file and compares its hidden `memory-review` marker with Git. It stays silent
when current. Missing, dirty, stale, or unverifiable memory gets one
non-blocking notice suggesting `/memory`; headless sessions get nothing.

`AGENTS.md` and the resolved memory file are knowledge-only paths. Commits or
working-tree changes limited to those files do not invalidate the marker, so
committing an audit does not immediately make it stale.

The extension never writes, injects model context, or triggers a turn.
`prompts/memory.md` owns the manual knowledge pass and marker update.

## Origin

Bundle-local.
