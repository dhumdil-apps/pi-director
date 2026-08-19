# Pi Director

> π Measure twice, cut once.

A [Pi](https://pi.dev) package that directs deliberate coding sessions through
three modes the human owns — Align to clarify, Spec to research and propose, Vibe to
execute — with durable memory, instant same-artifact handoffs, and visible status.

## Quick Start

### Prerequisites

- Node LTS + npm and Git.
- Install Pi CLI: `npm install -g @earendil-works/pi` (see [pi.dev](https://pi.dev) for details).

### Installation

Install the package directly into Pi:

```bash
pi install https://github.com/dhumdil-apps/pi-director
```

Pi manages the package installation automatically. To refresh every installed
extension package, including this one, run:

```bash
pi update --extensions
```

To refresh only this package after a maintainer push, run
`pi update --extension https://github.com/dhumdil-apps/pi-director`.

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

- **agent-workflow** — User-owned ALIGN / SPEC / VIBE modes with four mechanism-only tools (`ask`, `decide`, `start`, `next`), Agent-interpreted task artifacts, explicit ranked routing, reviewable Spec/Vibe decisions, and verified fresh-session handoffs. See [the agent-workflow README](extensions/agent-workflow/README.md).
- **project-memory** — Low-noise startup check for the hidden `memory-review` commit cursor. It ignores uncommitted work, gives relevant commits a one-day grace period, and suppresses repeated reminders until both `HEAD` changes and 24 hours pass; cooldown state stays outside the repository.
- **progress-tracker** — Above-editor per-mode Align/Spec/Vibe timing, plus the configurable Status Bar context segment. No tool, no command: it observes.
- **pi-inspector-bridge** — Reports Director mode and session context back to a discoverable Pi Inspector over its display-only channel.
- **session-dashboard** — Interactive welcome banner, spend visualization chart, and context indicators (`/help`, `/context`).
- **status-bar & usage-monitor** — Real-time quota metrics in the status bar.
- **usage-history** — Historical token/cost reporting (`/usage`).
- **interrupt-confirmation** — Confirms interrupt keys before stopping a running agent.
- **extension-preferences** — One global UI for registered extension settings (`/extension-settings`).
- **bundled themes** — `dark` and `github-dark`.

## Documentation

- [Extension and resource catalog](docs/EXTENSIONS.md)
- [The working flow](extensions/agent-workflow/README.md)
- [Commands and tools](docs/COMMANDS.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Vendored upstream inventory](UPSTREAM.md)

## Contributing & Maintenance

If you want to modify, verify, or contribute to `pi-director` locally, see the [Development & Maintenance Guide](docs/DEVELOPMENT.md).
