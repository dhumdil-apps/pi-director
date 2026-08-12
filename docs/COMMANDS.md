# Commands and tools

This is the short operational reference. Some vendored extensions expose more
advanced commands; follow their linked README when needed. The working flow is
one loop per task, described in [the agent-workflow README](../extensions/agent-workflow/README.md), with a persisted Q&A, Spec, or Vibe session mode the User owns.

## Everyday commands

- **`/questionnaire`** / **`/spec`** / **`/vibe`** — Change the session mode. With a pending artifact, a picker selection starts its focused continuation; Q&A is interactive alignment, Spec researches and proposes, Vibe executes; the boundary is advisory.
- **`/mode`** — Re-open the mode picker. It opens automatically when a settled turn has a route to choose; a completed native Ask also opens it if the Agent omitted its recommendation, while unresolved or cancelled Q&A returns to the editor. The picker offers the tailored next step, the other two modes, a handoff, and a `Write your own...` escape hatch.
- **`/handoff [session-name]`** — Continue the same artifact in a fresh Q&A session. It first drives one checkpoint turn that brings the plan file up to date, then seeds Q&A alignment with the first pending artifact item. Without a name it uses the current session plan, or the lone plan under `.pi/plan/`.
- **`/init [full]`** — Initializes or realigns tool-agnostic shared and Pi-local instruction layers, then refreshes project memory and review provenance. It proposes approval-gated drift repairs, incrementally audits memory since the hidden reviewed commit by default, and performs a repository-wide audit with `full`.
- **`/help`** — Full reference: commands, shortcuts, and every active extension
- **`/extension-settings`** — Edit registered global extension settings
- **`/usage`** — Show historical token/cost usage (`/usage-refresh` forces a quota fetch)

## User-facing tools

- **`ask`** (Agent Workflow) — Ask 1–4 related alignment questions through native option pickers, with possible answers, explicit trade-offs, and confidence scores. Ordinary answers stay in the same turn; `Proceed with best → Spec` and `Proceed with best → Vibe` preserve answers already chosen, accept the highest-confidence answers for the rest, and immediately start the selected mode. In Vibe, use Ask only for a genuine blocker so the User can choose a direct resolution, broader Q&A, or another route. Batch only independent questions and use a fresh call for dependent follow-ups.
- **`start_task`** (Agent Workflow) — Name this session's one artifact from context, without another User prompt. A later call with a different name is refused; a new goal belongs in a fresh session.
- **`record_auto_decision`** (Agent Workflow) — In Vibe only, record a bounded reversible implementation choice with its context, rationale, impact, and verification status. It is an audit trail, not User approval; consequential choices belong in `ask` or User-selected Q&A.
- **`save_plan`** (Agent Workflow) — Persist and echo the Spec proposal, then end the turn so the state-aware mode picker carries the decision. It replaces only an untouched pre-execution draft and appends dated revisions after execution history exists. Q&A and Vibe keep the artifact current by editing it directly.
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
- Q&A/Spec/Vibe execution guidance is advisory; action-specific permission remains conversational.
