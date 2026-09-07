# Pi Director

> π Measure twice, cut once.

A [Pi](https://pi.dev) package that keeps a strong CLI: status bar, usage,
session dashboard, and a progress widget. Session lifecycle is not in this
runtime. Align, Spec, and Vibe live in the portable kernel at `setup/AGENTS.md`.
A multi-repo workspace keeps this clone as a sibling and links that file.

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

That updates Pi extensions under `~/.pi/agent/git/`. It does not refresh the
workspace kernel.

### Workspace kernel

Author Align / Spec / Vibe in `setup/AGENTS.md`. Consumer workspaces clone this
repository as `pi-director` next to their other repos, then attach:

```bash
./pi-director/scripts/apply-kit.sh .
```

The script links `AGENTS.md`, `.agents/AGENTS.md`, and `.agents/templates` into
`setup/`. It seeds missing MEMORY, WORKSPACE, gitignore, and `run/` stubs. It
never overwrites live MEMORY, WORKSPACE, plans, projects, or skills.

After the first apply, `git -C pi-director pull` is the kernel update. New
machine: clone this repo as a sibling, run apply-kit, paste `setup/SETUP.md`.

### Configuration & Preferences

- **Provider & Model**: Configured through Pi or in `~/.pi/agent/settings.json`.
- **Extension Settings**: Managed via `/extensions` in your chat session.
- **Project Memory**: `.pi/MEMORY.md` is scaffolded with selective orientation and quirks; a project whose `AGENTS.md` names a different file wins. Ordinary work verifies it against code, captures costly surprises in the plan, and promotes durable facts at close-out. `/init` bootstraps or audits it on demand and stamps the reviewed Git commit. Uncommitted work is ignored; relevant commits get a one-day grace period and a low-noise startup reminder.

### Verification

Verify the package is loaded cleanly in your Pi installation:

```bash
pi list
```

## Included Features

- **status-bar & usage-monitor** — Real-time quota metrics in the status bar.
- **usage-history** — Historical token/cost reporting (`/usage`).
- **session-dashboard** — Interactive welcome banner, spend visualization chart, and context indicators (`/help`, `/context`).
- **progress-tracker** — Above-editor activity and context widget, plus the configurable Status Bar context segment. No tool, no command: it observes.
- **project-memory** — Low-noise startup check for the hidden `memory-review` commit cursor. It ignores uncommitted work, gives relevant commits a one-day grace period, and suppresses repeated reminders until both `HEAD` changes and 24 hours pass; cooldown state stays outside the repository.
- **pi-inspector-bridge** — Reports session context back to a discoverable Pi Inspector over its display-only channel.
- **interrupt-confirmation** — Confirms interrupt keys before stopping a running agent.
- **extension-preferences** — One global UI for registered extension settings (`/extensions`).
- **bundled themes** — `dark` and `github-dark`.

## Documentation

- [Extension and resource catalog](docs/EXTENSIONS.md)
- [Commands](docs/COMMANDS.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Vendored upstream inventory](UPSTREAM.md)

## Contributing & Maintenance

If you want to modify, verify, or contribute to `pi-director` locally, see the [Development & Maintenance Guide](docs/DEVELOPMENT.md).
