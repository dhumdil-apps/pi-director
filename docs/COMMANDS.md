# Commands and tools

This is the short operational reference. Some vendored extensions expose more
advanced commands; follow their linked README when needed. The working flow is
one loop per task, described in [FLOW.md](FLOW.md); there is no enforced state
machine and no session modes.

## Everyday commands

- **`/handoff [task-name]`** — Human-only session boundary: spawns a fresh session seeded with the task name and a kickoff naming the approved plan's path. Without a task name it uses the session's task, or the lone plan under `.pi/plan/`; with several it asks which one. The approval prompt (Proceed, handoff, or revise) prefills this command on Handoff
- **`/help`** — Full reference: commands, shortcuts, and every active extension
- **`/extension-settings`** — Edit registered global extension settings
- **`/usage`** — Show historical token/cost usage (`/usage-refresh` forces a quota fetch)

## User-facing tools

- **`save_plan`** (Agent Workflow) — Present the task's plan file for the user's decision and rename it to a meaningful name (the leading timestamp is kept). Pass the plan to (over)write `.pi/plan/<task-name>.md`, or omit it to present what the agent already wrote there; either way the file's content is echoed inline

`save_plan` is the bundle's only workflow tool. Close-out is an ordinary edit to
the plan file's `## Implementation summary` section — no tool stands in for it.

## Shell and keyboard reminders

- `! <command>` runs a shell command directly.
- `Esc` cancels the current tool/UI action. While the agent is running, interrupt
  keys first open a confirmation prompt: Enter confirms cancellation, while Esc
  or **Keep running** dismisses it without stopping the agent.
- `Ctrl+J` inserts a newline without submitting, and `Ctrl+Enter` submits. Use
  them where `Shift+Enter` does not reach Pi — VS Code's terminal being the
  common case (see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)).
- `Ctrl+C` clears/cancels; `Ctrl+D` exits from an empty prompt.
- The bundle intercepts no tool calls: agent-issued commands, writes, and `curl`
  run without a permission prompt.
