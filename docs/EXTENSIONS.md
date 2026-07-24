# Extension and resource catalog

The load order is defined by the `pi` section of `package.json`. Order matters
when extensions append system prompts or consume events emitted by another
extension.

## Active extensions

- **Extension Preferences** — One global UI for registered extension settings (`/extension-settings`)
- **Interrupt Confirmation** — Confirms interrupt keys before stopping a running agent (native prompt)
- **Terminal Keys** — Keeps newline and submit working in every terminal (ctrl+j inserts a newline, ctrl+enter submits)
- **Agent Workflow** — One loop per task, plan persistence, and the approval prompt (`save_plan`, `/handoff`; see [the agent-workflow README](../extensions/agent-workflow/README.md))
- **Status Bar** — Footer/status composition (Configured through `/extension-settings`)
- **Usage Monitor** — Live provider quota data for Status Bar
- **Usage History** — Historical token/cost reporting (`/usage`)
- **Progress Tracker** — Activity and context-usage indicator above the editor. No tool, no command: it observes.
- **Agent Status Bridge** — Off by default; reports display-only workflow status to a configured local observer
- **Session Dashboard** — Pi-glyph welcome, 30-day per-model spend chart, and project-context line

## Supporting resources

- **Init prompt** (`prompts/init.md`) — Analyze a project and propose an `AGENTS.md`
- **Bundled themes** (`themes/dark.json`, `themes/github-dark.json`) — Portable bundled themes (`"theme": "github-dark"`)

## Single-agent policy

The bundle runs as one agent, not an orchestrator with children: there is no
subagent tool and no child-process delegation, and the one agent owns user
interaction, commits, and final acceptance. A `/handoff` (see
[the agent-workflow README](../extensions/agent-workflow/README.md)) does not change this — the fresh session is the same single
agent, with the plan file on disk as the only thing carried across.

## Extension Preferences registry

These are the settings currently exposed through `/extension-settings`:

- **Status Bar** — `left`, `right`, `separator`, `placement`, `bar-style`, `bar-width`
- **Terminal Keys** — `newline-on-ctrl-j` (`auto` / `always` / `off`)
- **Agent Status Bridge** — `enabled` (`false` by default)

Status Bar defaults place
`git-branch,session-name,agent-stats,tokens,cpu,ram,disk,net` on
the left and `provider,model,sub-hourly,sub-weekly` on the right. Context usage
lives in the Progress Tracker indicator above the editor, not in the powerbar. Unnamed
sessions receive `<short-desc>` (or `<ticket>-<short-desc>` when a ticket is supplied). Global extension values are configured via `/extension-settings`.

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
- **No derived loop position.** The injected block is a constant, so the whole
  prompt prefix stays cacheable; where the session stands is visible in the
  transcript rather than restated every turn.

[UPSTREAM.md](../UPSTREAM.md) records what was vendored, what was removed and
when, plus versions and licenses.
