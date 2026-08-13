# Commands and tools

This is the short operational reference. Some vendored extensions expose more
advanced commands; follow their linked README when needed. The working flow is
one loop per task, described in [the agent-workflow README](../extensions/agent-workflow/README.md), with a persisted Align, Spec, or Vibe session mode the User owns.

## Everyday commands

- **`/align`** / **`/spec`** / **`/vibe`** — Change the session mode. Align is the recommended clarification/review preflight, Spec researches and proposes, and Vibe executes. Repeating the current mode does not start another turn; `/questionnaire` does not exist.
- **`/mode`** — Open the manual mode picker. Agent-recommended actions appear first when present, followed by every remaining mode, handoff, and `Return to editor`. Selecting handoff prepares `/handoff <name>` in the editor; press Enter to execute it.
- **`/handoff [session-name]`** — Continue the artifact in a fresh Align session. It refuses active runs, verifies a semantic checkpoint with one retry, and spawns nothing when persistence cannot be confirmed.
- **`/init [full]`** — Initializes or realigns tool-agnostic shared and Pi-local instruction layers, then refreshes project memory and review provenance. It proposes approval-gated drift repairs, incrementally audits memory since the hidden reviewed commit by default, and performs a repository-wide audit with `full`.
- **`/help`** — Full reference: commands, shortcuts, and every active extension
- **`/extension-settings`** — Edit registered global extension settings
- **`/usage`** — Show historical token/cost usage (`/usage-refresh` forces a quota fetch)

## User-facing tools

- **`ask`** (Agent Workflow) — Render native Agent-authored questions. The 1–4 question, 2–3 option, confidence, and identifier conventions are instructions rather than runtime limits; Proceed-with-best settles Align before starting Spec or Vibe.
- **`start`** (Agent Workflow) — Permanently name the temporary artifact or create a linked current-format continuation from an immutable legacy plan.
- **`next`** (Agent Workflow) — Record ranked actions for the post-turn picker. An empty action list is a harmless no-op; a selected handoff action prepares the explicit `/handoff` command.
  Close-out has no tool: durable orientation or quirks captured in the artifact may be promoted into project memory, while only `/init` advances the review marker.

## Shell and keyboard reminders

- `! <command>` runs a shell command directly.
- `Esc` cancels the current tool/UI action. While the agent is running, interrupt
  keys first open a confirmation prompt: Enter confirms cancellation, while Esc
  or **Keep running** dismisses it without stopping the agent.
- `Ctrl+J` inserts a newline without submitting, and `Ctrl+Enter` submits. Use
  them where `Shift+Enter` does not reach Pi — VS Code's terminal being the
  common case (see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)).
- `Ctrl+C` clears/cancels; `Ctrl+D` exits from an empty prompt.
- Align/Spec/Vibe execution guidance is advisory; action-specific permission remains conversational.
