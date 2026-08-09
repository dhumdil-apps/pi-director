# Pi Director

> π Measure twice, cut once.

A [Pi](https://pi.dev) package that directs deliberate coding sessions through
three modes the human owns — Ask to align, Spec to research and propose, Vibe to
execute — with durable memory, checkpointing handoffs, and visible status. When a
human-authorized Pi Inspector session is available, Director can verify browser
behavior through shared semantic state and flows.

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
- **Project Memory**: `.pi/MEMORY.md` is scaffolded with selective orientation and quirks; a project whose `AGENTS.md` names a different file wins. Ordinary work verifies it against code, captures costly surprises in the plan, and promotes durable facts at close-out. `/init` bootstraps or audits it on demand and stamps the reviewed Git commit. Uncommitted work is ignored; relevant commits get a one-day grace period and a low-noise startup reminder.

### Verification

Verify the package is loaded cleanly in your Pi installation:

```bash
pi list
```

## Included Features

- **agent-workflow** — Three modes the User owns: Ask aligns and decides, Spec researches and proposes with `save_plan`, and Vibe is the only mode that may change project files. The Agent never switches mode; a native picker opens after every settled turn offering the recommended next step, the other modes, a handoff, and a free-text escape hatch. Every session scaffolds one `.pi/plan/<timestamp-slug>.md` and extends it for life, including across `/handoff`, which checkpoints the file before spawning. The injected block is constant, so the prompt prefix stays cacheable. See [the agent-workflow README](extensions/agent-workflow/README.md).
- **project-memory** — Low-noise startup check for the hidden `memory-review` commit cursor. It ignores uncommitted work, gives relevant commits a one-day grace period, and suppresses repeated reminders until both `HEAD` changes and 24 hours pass; cooldown state stays outside the repository.
- **progress-tracker** — Above-editor per-mode Ask/Spec/Vibe timing, plus the configurable Status Bar context segment. No tool, no command: it observes.
- **pi-inspector skill & bridge** — Detects an authorized Pi Inspector session for browser debugging and verification, while reporting Director mode and session context back to Inspector over its display-only channel.
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
