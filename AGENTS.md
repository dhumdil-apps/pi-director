# AGENTS.md — Pi Director

- Ask before destructive or irreversible actions.
- Avoid using markdown tables in `.md` files; prefer simple lists for better readability and cleaner diffs.
- **Workflow**: three User-owned modes in [`extensions/agent-workflow/`](extensions/agent-workflow/README.md) — Ask aligns, Spec researches and proposes, Vibe executes. Only Vibe may change project files, and only the User switches mode. The injected block in its `index.ts` is the contract.
- **User options**: prefer native Pi dialogs (`ctx.ui.select`) over custom `ui.custom` overlays.

## Focused exploration

- Start with an exact source search and read the owning implementation plus directly relevant local evidence before expanding to surrounding documentation. For dashboard, workflow, or extension behavior, this repository is the source of truth; consult Pi-core docs only for unresolved host API behavior or when higher-priority instructions require them.
- Keep tool output proportional to the task: bound reads to relevant sections, exclude `node_modules` and generated files from discovery, and do not repeat output already in the transcript.
- Use `git diff --stat` before reviewing a diff, then name only task-owned paths. Do not inspect lockfiles or generated artifacts unless the task explicitly changes them.
- After completing a task, use a fresh session or `/handoff` for independent follow-up work when context is already substantial.

## Project memory

`.pi/MEMORY.md` is user-owned and gitignored. It contains orientation (what this repo is, where behavior lives, how to verify) and quirks (non-obvious constraints, work-arounds, and hidden breakage) — never a task log. Read it before broad exploration and verify every entry against its named path, symbol, or command; code wins, and a contradicted entry is corrected in the same turn.

- Record a fact only when rediscovering it would cost the next agent more than reading it costs every agent. Each entry names what breaks and the lead that re-establishes it.
- Capture a costly surprise in the current plan's `## Quirks` when it lands. At close-out, promote only durable orientation or quirks, replacing what they supersede and deleting what stopped being true.
- The hidden `memory-review` marker certifies a deliberate `/init` audit. Ordinary close-out may revise visible entries but never advances that marker.
- Reusable cross-project environment gotchas go to `~/Github/.pi/MEMORY.md`; do not restate them here.

## Verification

```bash
npm run typecheck # tsc --noEmit (must pass with 0 errors)
git diff --check
```

Use focused interactive review for visual or lifecycle behavior.
