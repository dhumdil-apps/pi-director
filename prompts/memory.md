---
description: Build or refresh selective project memory
argument-hint: "[full]"
---

Run a deliberate project-memory knowledge pass. Requested mode: `${1:-incremental}`.

Use the normal explore, ask, plan, approval, execute, and close-out workflow. This command may create or revise AGENTS.md and project memory, so show the proposed changes before writing them.

1. Resolve the Git repository root. Read its root AGENTS.md first when present.
2. Resolve project memory in this order:
   - A concrete path ending in `MEMORY.md` named by root AGENTS.md.
   - An existing root `MEMORY.md`.
   - `.pi/MEMORY.md`.
3. If AGENTS.md is missing or does not name a usable memory file, create or improve it so every agent knows the path, reads memory before broad file-by-file exploration, verifies it against code, corrects disproved entries immediately, and leaves the hidden review marker to `/memory`.
4. Create missing memory with `# Project memory`, `## Orientation`, and `## Quirks`. Keep any existing unlabeled delegation note below the title. Backends may retain one `## Domain` section when AGENTS.md permits it.
5. Parse this exact hidden marker immediately below the title when present:
   `<!-- memory-review: commit=<full-40-character-sha> reviewed-at=<ISO-8601-UTC> -->`
6. Choose the audit:
   - `full`, a missing/invalid marker, a marker outside current history, or unavailable Git: inspect the repository broadly—README, manifests, verification config, major entrypoints, representative behavior, and existing memory.
   - A valid ancestor marker: inspect commits, changed paths, and relevant working-tree changes since that commit; trace affected behavior and re-verify every memory entry those changes could disprove.
   - A marker at current HEAD with no relevant working-tree changes: report that memory is current and make no padding edit unless `full` was requested.
7. Apply the rediscovery test: retain a fact only when rediscovering it would cost the next agent more than reading it costs every agent. Entries are concise facts with literal path, symbol, or command leads that re-establish them.
8. Put repo orientation in `## Orientation`. Put non-obvious constraints, work-arounds, and hidden “what breaks if changed” coupling in `## Quirks`. Do not inventory files, imports, callers, or dependency edges that search or the compiler answers cheaply.
9. Code wins over memory. Replace contradicted or superseded entries in place, delete obsolete or weak entries, and never add confidence/staleness tags, dated history, task status, decisions, or next steps.
10. Only when Git HEAD exists and the working tree has no changes outside AGENTS.md and the resolved memory file, write or replace the marker with current full HEAD and the current UTC time. Otherwise improve the visible memory but do not advance provenance; report exactly why it remains uncertified.
11. Report whether the pass was full, incremental, current/no-op, or uncertified; name the reviewed commit and every verification command used.

Ordinary task close-out may still revise visible memory entries, but it never advances this marker. Only this command certifies a deliberate knowledge pass.
