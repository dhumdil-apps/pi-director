# Pi Director

> π Measure twice, cut once.

A [Pi](https://pi.dev) package that directs deliberate coding sessions: explore,
ask, plan, execute, and close out with approvals, durable memory, handoffs, and
visible status. When a human-authorized Pi Inspector session is available,
Director can verify browser behavior through shared semantic state and flows.

## Quick Start

### Prerequisites

- Node LTS + npm and Git.
- Install Pi CLI: `npm install -g @earendil-works/pi` (see [pi.dev](https://pi.dev) for details).

### Installation

Install the package directly into Pi:

```bash
pi install https://github.com/dhumdil-apps/pi-director
```

Pi manages the package installation automatically. To update to the latest release at any time, run:

```bash
pi update --extensions
```

### Configuration & Preferences

- **Provider & Model**: Configured through Pi or in `~/.pi/agent/settings.json`.
- **Extension Settings**: Managed via `/extension-settings` in your chat session.
- **Project Memory**: `.pi/MEMORY.md` is scaffolded with selective orientation and quirks; a project whose `AGENTS.md` names a different file wins. Ordinary work verifies it against code, captures costly surprises in the plan, and promotes durable facts at close-out. `/memory` bootstraps or audits it on demand and stamps the reviewed Git commit; Pi only shows a non-blocking startup notice when that review may be stale.

### Verification

Verify the package is loaded cleanly in your Pi installation:

```bash
pi list
```

## Included Features

- **agent-workflow** — One loop per task: explore, ask, plan, execute, close out. Two guarantees carry it — nothing in the working tree changes before an approved plan, and questions are cheap. Every session scaffolds `.pi/plan/<timestamp-slug>.md` on its first message as the agent's living document; `ask` puts choices in a native picker, `save_plan` presents the plan (renaming the session, timestamp kept) and arms the approval picker — Proceed executes here, Handoff (`/handoff`) spawns a fresh seeded session, Revise approves nothing. The injected block is a constant, so the prompt prefix stays cacheable. See [the agent-workflow README](extensions/agent-workflow/README.md).
- **project-memory** — Read-only startup check for the hidden `memory-review` marker. It stays silent when current and suggests manual `/memory` maintenance when memory is missing, dirty, stale, or unverifiable; it never writes or triggers a turn.
- **progress-tracker** — Above-editor activity, mode badge (`plan`/`auto`, worded while working) and context-usage indicator on its own line. No tool, no command: it observes.
- **pi-inspector skill & bridge** — Detects an authorized Pi Inspector session for browser debugging and verification, while reporting Director phase and session context back to Inspector over its display-only channel.
- **session-dashboard** — Interactive welcome banner, spend visualization chart, and context indicators (`/help`, `/context`).
- **status-bar & usage-monitor** — Real-time quota and usage metrics in the status bar (`/usage`).
- **bundled themes** — `dark` and `github-dark`.

## Documentation

- [Extension and resource catalog](docs/EXTENSIONS.md)
- [The working flow](extensions/agent-workflow/README.md)
- [Commands and tools](docs/COMMANDS.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Vendored upstream inventory](UPSTREAM.md)

## Contributing & Maintenance

If you want to modify, test, or contribute to `pi-director` locally, see the [Development & Maintenance Guide](docs/DEVELOPMENT.md).
