# Extension and resource catalog

The load order is defined by the `pi` section of `package.json`. Order matters
when extensions append system prompts or consume events emitted by another
extension.

## Active extensions

- **Extension Preferences** — One global UI for registered extension settings (`/extension-settings`)
- **Interrupt Confirmation** — Confirms interrupt keys before stopping a running agent (native prompt)
- **Agent Workflow** — Session-scoped Vibe/Spec workflow, implementation/investigation artifacts, plan persistence, and native Spec review (`start_task`, `ask`, `save_plan`, `/vibe`, `/spec`, `/execute`, `/handoff`; see [the agent-workflow README](../extensions/agent-workflow/README.md))
- **Project Memory** — Low-noise freshness inspection API for the manual `/init` knowledge pass (reminder cooldown state lives in the agent cache, never the repository)
- **Status Bar** — Footer/status composition (Configured through `/extension-settings`)
- **Usage Monitor** — Live provider quota data for Status Bar
- **Usage History** — Historical token/cost reporting (`/usage`)
- **Progress Tracker** — Persistent VIBE/SPEC badge, above-editor Explore/Align/Execute timing, and the configurable Status Bar context segment. No tool or command: it observes.
- **Pi Inspector Bridge** — Reports display-only Director phase and session status whenever a local Inspector is discoverable
- **Session Dashboard** — Pi-glyph welcome, project-memory freshness notice, 30-day per-model spend chart, and initial context-source snapshot

## Supporting resources

- **Init prompt** (`prompts/init.md`) — Initialize or realign shared/Pi-local instruction layers and selective project memory
- **Pi Inspector skill** (`skills/pi-inspector/SKILL.md`) — Evidence-first local app debugging through a human-authorized Inspector session
- **Bundled themes** (`themes/dark.json`, `themes/github-dark.json`) — Portable bundled themes (`"theme": "github-dark"`)

## Single-agent policy

The bundle runs as one agent, not an orchestrator with children: there is no
subagent tool and no child-process delegation, and the one agent owns user
interaction, commits, and final acceptance. A `/handoff` (see
[the agent-workflow README](../extensions/agent-workflow/README.md)) does not change this — the fresh session is the same single
agent, with the plan file on disk as the only thing carried across.

## Extension Preferences registry

Status Bar is the only registrant, and everything it exposes is layout: a
`Line gap` on/off setting plus `line1-left`, `line1-right` … `line4-right`, eight
ordered segment pickers. The visual style is fixed on purpose — separator, bar
style, bar width, and placement were configurable, and were either inert or
actively misleading.

Defaults reproduce the previous fixed rows: `git-branch,session-name` /
`provider,model` on line 1, `agent-stats,tokens` on line 2,
`cpu,ram,disk,net` / `sub-hourly,sub-weekly` on line 3, with Progress Tracker's
`attention-span` segment on line 4. `Line gap` defaults off; when enabled, one
blank row appears between each rendered row. A line left empty between two used
lines remains an intentional blank line; trailing empty lines take no space.
Unnamed sessions receive `<short-desc>` (or `<ticket>-<short-desc>` when a ticket
is supplied).

Core Pi model/thinking configuration lives in `~/.pi/agent/settings.json`.

## Deliberately absent

- **No workflow skill.** The Align/Explore/Execute/Close-out workflow remains a
  constant injected contract. The optional Pi Inspector skill activates only for
  applicable local browser debugging and verification.
- **No general permission gate.** Spec blocks unapproved source edit/write calls,
  while destructive-action and external-action consent remains conversational.
- **No subagents.** Vibe and Spec are persisted workflow policies for the same
  single agent; `/handoff` remains the human-controlled session boundary.
- **No todo tool.** Pi ships none on purpose ("they confuse models"), and a
  structured list the agent must keep in sync is ceremony rather than progress.
  What the agent is doing is visible in the transcript.
- **No derived loop position in the prompt.** The large injected contract stays
  constant and cacheable. Only a tiny Vibe/Spec marker varies; Explore/Execute
  phase and Align latency remain display-only.

[UPSTREAM.md](../UPSTREAM.md) records what was vendored, what was removed and
when, plus versions and licenses.
