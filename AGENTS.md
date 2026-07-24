# AGENTS.md — pi-kit

- Ask before destructive or irreversible actions.
- Avoid using markdown tables in `.md` files; prefer simple lists for better readability and cleaner diffs.
- **Workflow**: execution with guidance in [`extensions/agent-workflow/`](extensions/agent-workflow/README.md) - explore, ask, plan, execute, close out. The injected block in its `index.ts` is the contract.
- **User options**: prefer native Pi dialogs (`ctx.ui.select`) over custom `ui.custom` overlays.

## Verification

```bash
npm test                          # Vitest extension unit tests
npm run typecheck                 # tsc --noEmit (must pass with 0 errors)
npx vitest run <test-file>        # a single test file
pi -p --no-session --tools '' "Reply exactly HEADLESS_OK" # headless load smoke test
```
