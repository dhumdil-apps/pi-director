# Extension and resource catalog

The load order is defined by the `pi` section of `package.json`. Order matters
when extensions append system prompts or consume events emitted by another
extension.

## Active extensions

- **Extension Preferences** — One global UI for registered extension settings (`/extension-settings`)
- **Interrupt Confirmation** — Confirms interrupt keys before stopping a running agent (native prompt)
- **Agent Workflow** — User-owned ALIGN / SPEC / VIBE modes, recommended native-Ask preflight, silent Spec/Vibe `decide`, Agent-interpreted artifacts and decisions, ranked routing, and same-artifact handoffs (`ask`, `decide`, `start`, `next`, `/align`, `/spec`, `/vibe`, `/mode`, `/handoff`; see [the agent-workflow README](../extensions/agent-workflow/README.md))
- **Project Memory** — Low-noise freshness inspection API for the manual `/init` knowledge pass (reminder cooldown state lives in the agent cache, never the repository)
- **Status Bar** — Footer/status composition (Configured through `/extension-settings`)
- **Usage Monitor** — Live provider quota data for Status Bar
- **Usage History** — Historical token/cost reporting (`/usage`)
- **Progress Tracker** — Persistent above-editor prompts and per-mode timing, plus the configurable Status Bar context segment. No tool or command: it observes.
- **Pi Inspector Bridge** — Reports display-only Director mode and session status whenever a local Inspector is discoverable
- **Session Dashboard** — Pi-glyph welcome, project-memory freshness notice, 30-day per-model spend chart, and initial context-source snapshot

## Supporting resources

- **Init prompt** (`prompts/init.md`) — Initialize or realign shared/Pi-local instruction layers and selective project memory
- **Bundled themes** (`themes/dark.json`, `themes/github-dark.json`) — Portable bundled themes (`"theme": "github-dark"`)

## Single-agent policy

The bundle runs as one agent, not an orchestrator with children: there is no
subagent tool and no child-process delegation, and the one agent owns user
interaction, commits, and final acceptance. A `/handoff` (see
[the agent-workflow README](../extensions/agent-workflow/README.md)) does not change this — the fresh session is the same single
agent, with the plan file on disk as the only thing carried across.

## Extension Preferences registry

Status Bar is the only registrant. It exposes a `Working days per week` number
setting (default `5`, valid `1`–`7`), unmatched weekly override fields
(`unmatched-weekly-used-percent`, `unmatched-weekly-reset`), plus layout
settings: a `Line gap` on/off setting and `line1-left`, `line1-right` …
`line4-right`, eight ordered segment pickers. Weekly values of `6`–`7` include
weekends in subscription-bar pacing. The unmatched weekly override fills
`sub-weekly` only when Usage Monitor reports no quota provider; both fields must
be valid (`0`–`100` and ISO-8601) or that slot stays `n/a`.
The visual style is fixed on purpose — separator, bar style, bar width, and
placement were configurable, and were either inert or actively misleading.

Defaults reproduce the previous fixed rows: `git-branch,session-name` /
`provider,model` on line 1, `cost,agent-stats,tokens` on line 2,
`cpu,ram,disk,net` / `sub-hourly,sub-weekly` on line 3, with Progress Tracker's
`attention-span` segment on line 4. `Line gap` defaults off; when enabled, one
blank row appears between each rendered row. A line left empty between two used
lines remains an intentional blank line; trailing empty lines take no space.
Unnamed sessions receive `<short-desc>` (or `<ticket>-<short-desc>` when a ticket
is supplied).

Core Pi model/thinking configuration lives in `~/.pi/agent/settings.json`.

## Deliberately absent

- **No workflow skill.** The Align/Spec/Vibe workflow and its close-out step remain a
  constant injected contract.
- **No Pi Inspector skill (deferred / TODO).** Pi Inspector agent skills are deferred
  until Inspector is fully tested, validated, and integrated with the workflow; only the
  display-only bridge extension is currently loaded.
- **No general permission gate.** Align/Spec/Vibe execution boundaries are
  advisory; destructive-action and external-action consent remains conversational.
- **No subagents.** Align, Spec, and Vibe are persisted modes for the same single
  agent; `/handoff` remains the human-controlled session boundary.
- **No todo tool.** Pi ships none on purpose ("they confuse models"), and a
  structured list the agent must keep in sync is ceremony rather than progress.
  What the agent is doing is visible in the transcript.
- **No derived loop position in the prompt.** The large injected contract stays
  constant and cacheable. Only a tiny per-turn mode message varies; per-mode
  timing is display-only, and picker latency is not tracked at all.

[UPSTREAM.md](../UPSTREAM.md) records what was vendored, what was removed and
when, plus versions and licenses.
