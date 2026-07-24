# AGENTS.md — pi-kit repository instructions

Vendored Pi package repository. Active code lives under `extensions/`, declared in `package.json` (`pi.extensions`, `pi.prompts`, `pi.themes`). The bundle ships no skills.

## Operating Model & Workflow

- **Single Agent**: Single-agent execution with guidance in `extensions/agent-workflow/` (see [`docs/FLOW.md`](docs/FLOW.md)).
- **Safety**: No enforced guardrails — the bundle runs ungated; destructive-action consent is conversational, per the workflow flows.
- **Task Start**: Read `.pi/MEMORY.md` when present in the target project before modifying code.
- **Task Planning**: Follow [`docs/FLOW.md`](docs/FLOW.md) — one loop per task (goal, explore, ask, plan, execute, close out), with the plan saved before it is presented and nothing in the tree changed before it is approved.
- **Commit Discipline**: Never commit, stash, or push. Committing is the user's; leave the tree for them to review.
- **Documentation Style**: Avoid using markdown tables in `.md` files; prefer simple lists for better readability and cleaner diffs.

## Extension Architecture Rules

1. **User Options**: Prefer native Pi dialogs (`ctx.ui.select`) or conversational turns over custom `ui.custom` overlays.
2. **Event Updates**: Emit `powerbar:update` and status events unconditionally (never gate behind `ctx.hasUI`).
3. **Headless Fallback**: When `ctx.hasUI` is false, fall back to `pi.sendMessage` so non-interactive sessions receive status messages.
4. **Imports**: Use relative `.js` specifiers for local TypeScript imports (`import ... from "./foo.js"`).
5. **Session Entries**: `sessionManager.getBranch()` returns raw entries — a `pi.sendMessage` marker is `{type: "custom_message", customType, details}`, while tool results are `{type: "message", message: {role: "toolResult"}}`. Check a real session JSONL before writing a matcher.

## Verification

```bash
npm test                          # Run Vitest extension unit tests
npm run typecheck                 # Run tsc --noEmit (must pass with 0 errors)
npx vitest run <test-file>        # Run a single test file
pi -p --no-session --tools '' "Reply exactly HEADLESS_OK" # Headless load smoke test
```

## Safety & Secrets

- Ask before destructive or irreversible actions.
- Update [`UPSTREAM.md`](UPSTREAM.md) whenever importing or updating vendored components.
