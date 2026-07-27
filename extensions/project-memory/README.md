# Project Memory

Low-noise freshness reminders for deliberate project-memory maintenance.

Session Dashboard resolves the repository's memory file and compares its hidden
`memory-review` commit cursor with committed Git history while collecting usage
data. Staged, unstaged, and untracked files are intentionally ignored: ordinary
work must not make the dashboard complain or prevent `/init` from refreshing the
marker.

A relevant commit after the marker gets a 24-hour grace period. After that the
dashboard may show one concise `/init` reminder. Reminder state lives under Pi's
global agent cache, outside the repository. The same stale `HEAD` is not repeated;
a later reminder requires both a new `HEAD` and a 24-hour cooldown. Missing,
invalid, or unverifiable markers use the same message.

Shared `AGENTS.md`, Pi-local `.pi/AGENTS.md`, the resolved memory file, and Pi
plan files are knowledge-only paths. Commits limited to those paths do not make
project memory stale.

This extension exports resolution, committed-history inspection, and reminder
cadence helpers. Session Dashboard owns their visible startup presentation;
`prompts/init.md` owns the manual knowledge pass and marker update. The marker is
an advisory audit cursor, not exact repository-state certification.

## Origin

Bundle-local.
