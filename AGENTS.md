# AGENTS.md — Pi Director

- Ask before destructive or irreversible actions.
- Avoid using markdown tables in `.md` files; prefer simple lists for better readability and cleaner diffs.
- **Workflow**: execution with guidance in [`extensions/agent-workflow/`](extensions/agent-workflow/README.md) - explore, ask, plan, execute, close out. The injected block in its `index.ts` is the contract.
- **User options**: prefer native Pi dialogs (`ctx.ui.select`) over custom `ui.custom` overlays.

## Project memory

`.pi/MEMORY.md` is user-owned and gitignored. It contains orientation (what this repo is, where behavior lives, how to verify) and quirks (non-obvious constraints, work-arounds, and hidden breakage) — never a task log. Read it before broad exploration and verify every entry against its named path, symbol, or command; code wins, and a contradicted entry is corrected in the same turn.

- Record a fact only when rediscovering it would cost the next agent more than reading it costs every agent. Each entry names what breaks and the lead that re-establishes it.
- Capture a costly surprise in the current plan's `## Quirks` when it lands. At close-out, promote only durable orientation or quirks, replacing what they supersede and deleting what stopped being true.
- The hidden `memory-review` marker certifies a deliberate `/memory` audit. Ordinary close-out may revise visible entries but never advances that marker.
- Reusable cross-project work-arounds go to `~/Github/LEARNINGS.md`; do not restate them here.

## Verification

```bash
npm test                          # Vitest extension unit tests
npm run typecheck                 # tsc --noEmit (must pass with 0 errors)
npx vitest run <test-file>        # a single test file
pi -p --no-session --tools '' "Reply exactly HEADLESS_OK" # headless load smoke test
```
