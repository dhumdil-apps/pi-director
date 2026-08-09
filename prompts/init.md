---
description: Initialize or realign repository instructions and project memory
argument-hint: "[full]"
---

Run a deliberate repository setup, instruction-layer, and project-memory pass. Requested mode: `${1:-incremental}`.

Use the normal Ask, Spec, and Vibe workflow. This command may create or revise shared `AGENTS.md`, Pi-local `.pi/AGENTS.md`, and project memory, so show the proposed changes before writing them.

1. Resolve the current Git repository root. Read its shared root `AGENTS.md` first, then `.pi/AGENTS.md` when present. The shared file is portable contributor guidance; the Pi-local extension owns Pi workflow, project memory, and local tooling.
2. Determine instruction-audit scope:
   - At a workspace root whose guide establishes nested repository layers, audit the root guide plus every nested Git repository's shared `<repo>/AGENTS.md` and Pi-local `<repo>/.pi/AGENTS.md`.
   - In a nested repository, audit only that repository's shared guide and Pi-local extension.
   - The workspace-root run structurally audits nested instruction layers but retains its own Git-root memory review and provenance. Each nested repository's `/init` run owns its own memory review and marker.
3. Explore the current repository: README, manifests, build/test configuration, directory layout, representative source, and existing memory. For a workspace-root audit, inspect nested repositories only as needed to validate their instruction layers unless a memory audit specifically requires their source.
4. Check every audited layer before touching memory:
   - The workspace-root guide contains only workspace context, routing, and Pi-specific workflow.
   - Each shared repository guide is a regular file, contains portable repository context, development, validation, safety, and Git guidance, and contains no Pi, `.pi`, or workspace-root tooling paths.
   - Each Pi-local extension is local/ignored metadata, tells readers to load the shared guide first, and contains Pi workflow, project-memory, or local integration context only.
   - Detect missing files, symlink substitution, duplicate or misplaced rules, and contradictory layer declarations. Propose the smallest layer-correct repair; never silently move or write content.
5. Resolve the current repository's project memory in this order:
   - A concrete portable path ending in `MEMORY.md` named by shared root `AGENTS.md`.
   - An existing root `MEMORY.md`.
   - `.pi/MEMORY.md`.
6. If a shared guide is missing, create or improve it as a concise, tool-agnostic contributor guide without Pi paths or memory-maintenance rules. If the Pi-local extension is missing or does not name the memory workflow, create or improve it so Pi users know the path, read memory before broad file-by-file exploration, verify it against code, correct disproved entries immediately, and leave the hidden review marker to `/init`.
7. Create missing memory with `# Project memory`, `## Orientation`, and `## Quirks`. Keep any existing unlabeled delegation note below the title. Backends may retain one `## Domain` section when the local extension permits it.
8. Parse this exact hidden marker immediately below the title when present:
   `<!-- memory-review: commit=<full-40-character-sha> reviewed-at=<ISO-8601-UTC> -->`
9. Choose the memory audit:
   - `full`, a missing/invalid marker, a marker outside current history, or unavailable Git: inspect the repository broadly—README, manifests, verification config, major entrypoints, representative behavior, and existing memory.
   - A valid ancestor marker: inspect commits, changed paths, and relevant working-tree changes since that commit; trace affected behavior and re-verify every memory entry those changes could disprove.
   - A marker at current HEAD with no relevant committed or working-tree changes: report that memory is current and make no padding edit unless `full` was requested.
   - Treat staged, unstaged, and untracked files as material to inspect, not as a certification failure. Ordinary uncommitted work is expected.
10. Apply the rediscovery test: retain a fact only when rediscovering it would cost the next agent more than reading it costs every agent. Entries are concise facts with literal path, symbol, or command leads that re-establish them.
11. Put repo orientation in `## Orientation`. Put non-obvious constraints, work-arounds, and hidden “what breaks if changed” coupling in `## Quirks`. Do not inventory files, imports, callers, or dependency edges that search or the compiler answers cheaply.
12. Code wins over memory. Replace contradicted or superseded entries in place, delete obsolete or weak entries, and never add confidence/staleness tags, dated history, task status, decisions, or next steps.
13. When Git HEAD exists and the audit completes, write or replace the marker with current full HEAD and the current UTC time. Uncommitted changes never block this update: the marker is an advisory cursor for committed history, while the audit still accounts for relevant working-tree content. Without a Git HEAD, improve visible memory but do not write a marker.
14. Report whether the pass was full, incremental, current/no-op, or unmarked because no Git HEAD exists; name the reviewed commit when available, instruction-layer findings, proposed or applied repairs, and every verification command used.

Ordinary task close-out may still revise visible memory entries, but it never advances this marker. Only this command certifies a deliberate knowledge pass.
