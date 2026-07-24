# Commands and tools

This is the short operational reference. Some vendored extensions expose more
advanced commands; follow their linked README when needed. The working flow is
one loop per task, described in [the agent-workflow README](../extensions/agent-workflow/README.md); there is no enforced state
machine and no session modes.

## Everyday commands

- **`/handoff [session-name]`** — Human-only session boundary: spawns a fresh session seeded with the name and a kickoff naming the approved plan's path. Without a name it uses the current session's, or the lone plan under `.pi/plan/`; with several it asks which one. The approval picker (Proceed, handoff, or revise) prefills this command on Handoff
- **`/help`** — Full reference: commands, shortcuts, and every active extension
- **`/extension-settings`** — Edit registered global extension settings
- **`/usage`** — Show historical token/cost usage (`/usage-refresh` forces a quota fetch)

## User-facing tools

- **`ask`** (Agent Workflow) — Put a choice to the user as a native picker: two to four options, each a headline plus a one-sentence description, recommendation first. The full question and descriptions print in the transcript; the picker lists the headlines, so answering is one keypress
- **`save_plan`** (Agent Workflow) — Present the plan file for the user's decision and rename the session to a meaningful name (the leading timestamp is kept). Pass the plan to (over)write `.pi/plan/<session-name>.md`, or omit it to present what the agent already wrote there; either way the file's content is echoed inline
- **`close_out`** (Agent Workflow) — Record how the task went in the plan file's `## Implementation summary`, replacing any previous summary rather than stacking. Work-arounds or other quirks go to `.pi/MEMORY.md`, which the agent writes directly

These three are the bundle's only workflow tools.

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
