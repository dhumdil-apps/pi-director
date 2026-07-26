# Extension and resource catalog

The load order is defined by the `pi` section of `package.json`. Order matters
when extensions append system prompts or consume events emitted by another
extension.

## Active extensions

- **Extension Preferences** — One global UI for registered extension settings (`/extension-settings`)
- **Interrupt Confirmation** — Confirms interrupt keys before stopping a running agent (native prompt)
- **Agent Workflow** — One loop per task, plan persistence, durable project memory, and the approval prompt (`save_plan`, `/handoff`; see [the agent-workflow README](../extensions/agent-workflow/README.md))
- **Project Memory** — Read-only startup freshness check for the manual `/memory` knowledge pass
- **Status Bar** — Footer/status composition (Configured through `/extension-settings`)
- **Usage Monitor** — Live provider quota data for Status Bar
- **Usage History** — Historical token/cost reporting (`/usage`)
- **Progress Tracker** — Activity, mode badge (`plan`/`auto`) and context-usage indicator above the editor. No tool, no command: it observes.
- **Agent Status Bridge** — Reports display-only workflow status whenever a local observer is discoverable
- **Session Dashboard** — Pi-glyph welcome, 30-day per-model spend chart, and project-context line

## Supporting resources

- **Init prompt** (`prompts/init.md`) — Analyze a project and propose an `AGENTS.md`
- **Memory prompt** (`prompts/memory.md`) — Bootstrap, incrementally refresh, or fully audit selective project memory
- **Bundled themes** (`themes/dark.json`, `themes/github-dark.json`) — Portable bundled themes (`"theme": "github-dark"`)

## Single-agent policy

The bundle runs as one agent, not an orchestrator with children: there is no
subagent tool and no child-process delegation, and the one agent owns user
interaction, commits, and final acceptance. A `/handoff` (see
[the agent-workflow README](../extensions/agent-workflow/README.md)) does not change this — the fresh session is the same single
agent, with the plan file on disk as the only thing carried across.

## Extension Preferences registry

Status Bar is the only registrant, and everything it exposes is layout:
`line1-left`, `line1-right` … `line4-right`, eight ordered segment pickers. The
visual style is fixed on purpose — separator, bar style, bar width, and
placement were configurable, and were either inert or actively misleading.

Defaults reproduce the previous fixed rows: `git-branch,session-name` /
`provider,model` on line 1, `agent-stats,tokens` on line 2,
`cpu,ram,disk,net` / `sub-hourly,sub-weekly` on line 3, line 4 empty. A line
left empty between two used lines renders as a blank line; trailing empty lines
take no space. Context usage lives in the Progress Tracker indicator above the
editor, not in the powerbar. Unnamed sessions receive `<short-desc>` (or
`<ticket>-<short-desc>` when a ticket is supplied).

Core Pi model/thinking configuration lives in `~/.pi/agent/settings.json`.

## Deliberately absent

- **No skills.** The workflow guidance lives inside the injected loop block,
  so nothing depends on the model remembering to invoke anything.
- **No permission gate.** Tool calls are never intercepted; destructive-action
  consent is conversational (see [the agent-workflow README](../extensions/agent-workflow/README.md)).
- **No managed autonomous mode.** To run Pi unsupervised, start raw Pi with
  `pi --no-extensions` — which drops all bundle guidance.
- **No subagents and no state machine.** Single-agent by policy, guidance over
  rules; `/handoff` is a human-only session boundary, not a phase machine.
- **No context segment in the status bar.** Context usage lives in the Progress
  Tracker indicator above the editor, with token counts spelled out.
- **No todo tool.** Pi ships none on purpose ("they confuse models"), and a
  structured list the agent must keep in sync is ceremony rather than progress.
  What the agent is doing is visible in the transcript.
- **No derived loop position in the prompt.** The injected block is a constant,
  so the whole prompt prefix stays cacheable; where the session stands is never
  restated to the model. The `plan`/`auto` badge in the Progress Tracker
  indicator is a readout for the user only — it never enters the context and
  never varies the injected loop.

[UPSTREAM.md](../UPSTREAM.md) records what was vendored, what was removed and
when, plus versions and licenses.
