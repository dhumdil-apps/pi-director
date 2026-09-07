# Workspace map

This file is local to this tree. It is not part of the copy-paste `AGENTS.md` kernel.
The setup agent fills every section from disk. Delete this sentence when the map is real.

## Layout

- Each child folder is an independent git repository.
- Workspace memory is `.agents/MEMORY.md`. The root repository whitelists and tracks `.agents/` and `run/`.
- Project memory is `<project>/.agents/MEMORY.md`. Child repositories use an ignored relative `.agents` symlink into `.agents/projects/<project>/`.
- Launchers: `run/dev/<project>.sh` for the development environment, `run/test/<project>.sh` for the compact full suite.
- `pi-director` is a sibling git repository in this workspace. Kernel files are relative symlinks into `pi-director/setup/`.

## Verify

- Inner loop: (fill from child repo docs or package scripts)
- Milestone: (fill)
- Backend: (fill)

## Local policy

- Never open a browser to screenshot or visually QA UI changes. The user does visual QA. Browser subagents are only for functional automation the user explicitly requests.

## Shared pattern family

When changing a shared pattern, inspect every applicable sibling before closing.

- (fill from disk, or omit this section if there is no shared family)

## Repository index

- (one bullet per child repo or product pair, filled from disk)
