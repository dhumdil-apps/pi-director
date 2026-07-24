# AGENTS.md — pi-kit

- Ask before destructive or irreversible actions.
- Avoid using markdown tables in `.md` files; prefer simple lists for better readability and cleaner diffs.
- **Workflow**: execution with guidance in `extensions/agent-workflow/` (see [`docs/FLOW.md`](docs/FLOW.md)) - goal, explore, ask, plan, execute, close out.
- **User options**: prefer native Pi dialogs (`ctx.ui.select`) over custom `ui.custom` overlays.

## Verification

```bash
npm test                          # Vitest extension unit tests
npm run typecheck                 # tsc --noEmit (must pass with 0 errors)
npx vitest run <test-file>        # a single test file
pi -p --no-session --tools '' "Reply exactly HEADLESS_OK" # headless load smoke test
```
