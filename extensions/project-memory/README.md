# Project Memory

Resolution and committed-history inspection for the user-owned project memory
file. This extension does not print a startup warning.

Shared `AGENTS.md`, Pi-local `.pi/AGENTS.md`, the resolved memory file, and Pi
plan files are knowledge-only paths. Commits limited to those paths do not make
project memory stale for inspection helpers.

`prompts/init.md` owns the manual knowledge pass and marker update. The marker is
an advisory audit cursor, not exact repository-state certification.

## Origin

Bundle-local.
