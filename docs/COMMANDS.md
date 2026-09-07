# Commands

This is the short operational reference. Session workflow (Align / Spec / Vibe)
is in workspace `AGENTS.md`, not in this runtime.

## Everyday commands

- **`/init [full]`** — Initializes or realigns tool-agnostic shared and Pi-local instruction layers, then refreshes project memory and review provenance. It proposes approval-gated drift repairs, incrementally audits memory since the hidden reviewed commit by default, and performs a repository-wide audit with `full`.
- **`/help`** — Full reference: commands, shortcuts, and every active extension
- **`/context`** — Break the context window down by source: prompt, context files, skills, tools, conversation
- **`/extensions`** — Edit registered global extension settings
- **`/usage`** — Show historical token/cost usage (`/usage-refresh` forces a quota fetch)

## Shell and keyboard reminders

- `! <command>` runs a shell command directly.
- `Esc` cancels the current tool/UI action. While the agent is running, interrupt
  keys first open a confirmation prompt: Enter confirms cancellation, while Esc
  or **Keep running** dismisses it without stopping the agent.
- `Ctrl+J` inserts a newline without submitting, and `Ctrl+Enter` submits. Use
  them where `Shift+Enter` does not reach Pi — VS Code's terminal being the
  common case (see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)).
- `Ctrl+C` clears/cancels; `Ctrl+D` exits from an empty prompt.
