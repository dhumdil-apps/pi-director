# Commands and tools

This is the short operational reference. Some vendored extensions expose more
advanced commands; follow their linked README when needed. The working flow is
one loop per task, described in [the agent-workflow README](../extensions/agent-workflow/README.md), with a persisted Ask, Spec, or Vibe session mode the User owns.

## Everyday commands

- **`/ask`** / **`/spec`** / **`/vibe`** — Change the session mode for future work without triggering a model turn. Ask aligns, Spec researches and proposes, Vibe executes; the boundary is advisory.
- **`/mode`** — Re-open the mode picker. It normally opens on its own after every settled turn, offering the recommended next step, the other two modes, a handoff, and a `Write your own...` escape hatch.
- **`/handoff [session-name]`** — Continue the same artifact in a fresh session, starting in Ask mode so the next direction is aligned first. It first drives one checkpoint turn that brings the plan file up to date, so nothing is lost at the boundary. Without a name it uses the current session plan, or the lone plan under `.pi/plan/`.
- **`/init [full]`** — Initializes or realigns tool-agnostic shared and Pi-local instruction layers, then refreshes project memory and review provenance. It proposes approval-gated drift repairs, incrementally audits memory since the hidden reviewed commit by default, and performs a repository-wide audit with `full`.
- **`/help`** — Full reference: commands, shortcuts, and every active extension
- **`/extension-settings`** — Edit registered global extension settings
- **`/usage`** — Show historical token/cost usage (`/usage-refresh` forces a quota fetch)

## User-facing tools

- **`questionnaire`** (Agent Workflow) — Ask 1–4 related alignment questions through native option pickers, with possible answers, explicit trade-offs, and one marked recommendation each. Custom answers and selections return to Agent in the same turn, before the workflow mode picker appears.
- **`start_task`** (Agent Workflow) — Name this session's one artifact from context, without another User prompt. A later call with a different name is refused; a new goal belongs in a fresh session.
- **`save_plan`** (Agent Workflow) — Persist and echo the Spec proposal, then end the turn so the state-aware mode picker carries the decision. It replaces only an untouched pre-execution draft and appends dated revisions after execution history exists. Ask and Vibe keep the artifact current by editing it directly.
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
- Ask/Spec/Vibe execution guidance is advisory; action-specific permission remains conversational.
