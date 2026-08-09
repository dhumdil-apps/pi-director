# Commands and tools

This is the short operational reference. Some vendored extensions expose more
advanced commands; follow their linked README when needed. The working flow is
one loop per task, described in [the agent-workflow README](../extensions/agent-workflow/README.md), with a persisted Vibe or Spec session mode.

## Everyday commands

- **`/vibe`** / **`/spec`** — Change the session workflow for future work without triggering a model turn. The above-editor badge shows the active choice.
- **`/execute [session-name]`** — Resolve the current plan. Vibe continues its work log immediately; Spec opens Proceed/Handoff/Revise review.
- **`/handoff [session-name]`** — Resolve the current plan in a fresh session. Vibe transfers directly; Spec opens review with Handoff recommended. Without a name both commands use the current session plan, or the lone plan under `.pi/plan/`.
- **`/init [full]`** — Initializes or realigns tool-agnostic shared and Pi-local instruction layers, then refreshes project memory and review provenance. It proposes approval-gated drift repairs, incrementally audits memory since the hidden reviewed commit by default, and performs a repository-wide audit with `full`.
- **`/help`** — Full reference: commands, shortcuts, and every active extension
- **`/extension-settings`** — Edit registered global extension settings
- **`/usage`** — Show historical token/cost usage (`/usage-refresh` forces a quota fetch)

## User-facing tools

- **`start_task`** (Agent Workflow) — Apply context-informed task naming and implementation/investigation classification without another User prompt.
- **`ask`** (Agent Workflow) — Put a consequential choice to the User as a native recommendation-first picker.
- **`save_plan`** (Agent Workflow) — Present a Spec proposal for approval. Before initial approval it replaces the draft; later requested changes append dated revisions. Vibe updates its compact log directly and cannot call this tool.
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
- Spec blocks project `edit`/`write` calls until the current requested increment is approved. Shell and unknown custom mutation receive a warning because they cannot be classified reliably; action-specific permission remains conversational.
