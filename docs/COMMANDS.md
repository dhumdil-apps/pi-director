# Commands and tools

This is the short operational reference. Some vendored extensions expose more
advanced commands; follow their linked README when needed. The working flow is
one loop per task, described in [the agent-workflow README](../extensions/agent-workflow/README.md), with a persisted Align, Spec, or Vibe session mode the User owns.

## Everyday commands

- **`/align`** / **`/spec`** / **`/vibe`** — Change the session mode and auto-start with only a neutral switch line; repeating the current mode starts with a neutral continue line. Align is the recommended clarification/review preflight, Spec researches and proposes, and Vibe executes. `/questionnaire` does not exist.
- **`/mode`** — Open the manual mode picker. Agent-recommended actions appear first when present, followed by every remaining mode, handoff, and `Return to editor`. Selecting handoff prepares `/handoff <name>` in the editor; press Enter to execute it.
- **`/handoff [session-name]`** — Continue the same artifact in a fresh Align session. It refuses active runs, skips a checkpoint turn, and auto-starts ordinary Align continue.
- **`/init [full]`** — Initializes or realigns tool-agnostic shared and Pi-local instruction layers, then refreshes project memory and review provenance. It proposes approval-gated drift repairs, incrementally audits memory since the hidden reviewed commit by default, and performs a repository-wide audit with `full`.
- **`/help`** — Full reference: commands, shortcuts, and every active extension
- **`/context`** — Break the context window down by source: prompt, context files, skills, tools, conversation
- **`/extension-settings`** — Edit registered global extension settings
- **`/usage`** — Show historical token/cost usage (`/usage-refresh` forces a quota fetch)

## User-facing tools

- **`ask`** (Agent Workflow) — Render native ALIGN questions and return answers, cancellation, or a Proceed-with-best Spec/Vibe route. The 1–4 question, 2–3 option, confidence, and identifier conventions are instructions rather than runtime limits. A SPEC/VIBE Ask is a harmless no-op.
- **`decide`** (Agent Workflow) — SPEC/VIBE sibling of Ask. Same question shape, no picker: auto-picks the highest-confidence option and records it as an unresolved decision. An ALIGN or optionless Decide is a harmless no-op.
- **`start`** (Agent Workflow) — Create the named `.pi/plan` artifact, or create a linked current-format continuation from an immutable legacy plan. No plan file exists until this call.
- **`next`** (Agent Workflow) — Record ranked actions for the post-turn picker. Each recommended Align, Spec, or Vibe action includes its own Agent-authored contextual instruction after the neutral runtime transition; handoff omits one. An empty action list is a harmless no-op; a selected handoff action prepares the explicit `/handoff` command.
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
