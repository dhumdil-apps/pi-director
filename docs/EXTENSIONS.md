# Extension and resource catalog

The load order is defined by the `pi` section of `package.json`. Order matters
when extensions consume events emitted by another extension.

## Active extensions

- **Extension Preferences** — One global UI for registered extension settings (`/extensions`)
- **Interrupt Confirmation** — Confirms interrupt keys before stopping a running agent (native prompt)
- **Project Memory — Low-noise freshness inspection API for the manual `/init` knowledge pass (reminder cooldown state lives in the agent cache, never the repository)
- **Status Bar** — Footer/status composition (Configured through `/extensions`)
- **Usage Monitor** — Live provider quota data for Status Bar
- **Usage History** — Historical token/cost reporting (`/usage`)
- **Progress Tracker** — Persistent above-editor work/wait timer, plus the configurable Status Bar context segment. No tool or command: it observes.
- **Pi Inspector Bridge** — Reports display-only session status whenever a local Inspector is discoverable
- **Session Dashboard** — Pi-glyph welcome, project-memory freshness notice, 30-day per-model spend chart, initial context-source snapshot, and host-loaded skill names

## Active skills

- **ui-design** (`skills/ui-design/SKILL.md`) — Atomic Design for UI systems, plus a deep-module lane when that UI work hits a code seam (interface, seam, adapter, leverage).
- **code-review** (`skills/code-review/SKILL.md`) — Manual-invocation review skill for unusually strict maintainability audits, plus Standards vs Spec axes on a pinned git range.
- **cli-agents** (`skills/cli-agents/SKILL.md`) — User-picked CLI child offload (`agy`, `pi --print`, `claude`, or `codex`). Writes under `.pi`; the parent session stays the owner.

Tracked skills live under `skills/` (`package.json` `pi.skills`). Director `.pi/skills/<name>` is a relative symlink to `../../skills/<name>` so project discovery matches the package tree.

## Supporting resources

- **Init prompt** (`prompts/init.md`) — Initialize or realign shared/Pi-local instruction layers and selective project memory
- **Bundled themes** (`themes/dark.json`, `themes/github-dark.json`) — Portable bundled themes (`"theme": "github-dark"`)

## Single-agent policy

The bundle runs as one agent, not an orchestrator with children: there is no
Pi `subagent` tool. A User-consented CLI child (`agy`, `pi --print`, `claude`, or `codex` via
`cli-agents`) may write under `.pi`; the parent session still owns
user interaction, commits, and final acceptance.

## Extension Preferences registry

Status Bar is the only registrant. It exposes a `Working days per week` number
setting (default `5`, valid `1`–`7`) and unmatched weekly override fields
(`unmatched-weekly-used-percent`, `unmatched-weekly-reset`). Weekly values of
`6`–`7` include weekends in subscription-bar pacing. The unmatched weekly
override fills `sub-weekly` only when Usage Monitor reports no quota provider;
both fields must be valid (`0`–`100` and ISO-8601) or that slot is omitted (one `n/a` only if hourly is also missing).
Layout and visual style are fixed in code — line pickers, Line gap, separator,
bar style, bar width, and placement were configurable, and were either unused
or actively misleading.

Full is three rows with a blank row between them: `git-branch` / `model,provider`;
`cost,agent-stats,tokens` / `sub-weekly,sub-hourly`; `attention-span` /
`cpu,ram,disk,net`. Auto is two rows (no git, no OS). Compact is one row with
numbers-only context. A line left empty between two used lines remains an
intentional blank line; trailing empty lines take no space. Git and OS stats
appear only in full.

Core Pi model/thinking configuration lives in `~/.pi/agent/settings.json`.

## Deliberately absent

- **No workflow skill and no FSM.** Align / Spec / Vibe live in `setup/AGENTS.md`. This package does not inject a second booklet or register `ask` / `decide` / `start` / `next`.
- **No Pi Inspector skill (deferred / TODO).** Pi Inspector agent skills are deferred
  until Inspector is fully tested and validated; only the
  display-only bridge extension is currently loaded. Local sibling skills `diagnosing-bugs`
  and `tdd` live in inspector `.pi/skills` (`~/Github/.pi/projects/pi-inspector/skills/`),
  not in this package, until that mix is ready.
- **No general permission gate.** Destructive-action and external-action consent remains conversational.
- **No Pi subagent tool.** A CLI child after Align yes is the local `subagent` skill, not a nested agent tool.
- **No todo tool.** Pi ships none on purpose ("they confuse models"), and a
  structured list the agent must keep in sync is ceremony rather than progress.

[UPSTREAM.md](../UPSTREAM.md) records what was vendored, what was removed and
when, plus versions and licenses.
