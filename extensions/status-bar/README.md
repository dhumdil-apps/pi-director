# Status Bar

Persistent powerline-style status bar with left/right segments updated via
events. The core (`src/powerbar/`) listens for `powerbar:update` events,
maintains a segment store, and renders up to four user-configured lines with
independent left/right alignment. Producer sub-extensions each emit one or more
segments:

- **`src/powerbar-session/`** — `session-name` (mandatory ticket ID + short feature description)
- **`src/powerbar-git/`** — `git-branch` (+ dirty marker)
- **`src/powerbar-model/`** — `model` (name + thinking level)
- **`src/powerbar-provider/`** — `provider`
- **`src/powerbar-tokens/`** — `tokens`, `agent-stats`
- **`src/powerbar-sub/`** — `sub-hourly`, `sub-weekly` (from Usage Monitor events)
- **`src/powerbar-os/`** — `cpu`, `ram`, `disk`/SSD, `net`

Any extension may register a transient segment via powerbar events: it renders
only while active and does not need a configured slot. Workflow mode, phase,
and context usage are deliberately outside Status Bar; Progress Tracker renders
them in a persistent above-editor indicator. A configured segment id that no
longer exists simply renders nothing.

All Status Bar progress bars use the theme accent normally, changing to warning
and error at their configured usage thresholds. CPU, RAM, and SSD usage render
as one high-contrast, partial-height bar per metric and show a `0%` placeholder
until a sample is available. Subscription countdown bars use weeks at seven or
more days remaining, days below a week, and hours below a day, rounding partial
units up and capping the countdown at five bars.

## User surface

Configured through `/extension-settings` → `line1-left` … `line4-right` (stored
under `powerbar`): eight ordered pickers, one per line and side. Each picker
labels a segment with the line it defaults to, so an unplaced segment is easy to
find. Bundle defaults are:

- Line 1 — `git-branch,session-name` left, `provider,model` right
- Line 2 — `agent-stats,tokens` left
- Line 3 — `cpu,ram,disk,net` left, `sub-hourly,sub-weekly` right
- Line 4 — empty

A line left empty between two used lines renders as a blank line, which is how a
deliberate gap is configured; trailing empty lines take no space. A layout stored
under the older `left`/`right` keys is split across these lines once, on first
load.

Everything else is fixed rather than configurable, because the knobs were either
inert or wrong: separator `·`, blocks-style bars, placement below the editor,
and a 10-block default width for any bar that doesn't declare its own.

Agent Workflow owns task naming through `save_plan`: saving a plan names the
session after the task (a concise `SI-<ticket>-<summary>` form). This producer
only displays the current name immediately before the git branch and follows
session-name changes and resumes.

## Origin

Vendored from `@juanibiapina/pi-powerbar` (npm 0.12.0, MIT) — see
[UPSTREAM.md](../../UPSTREAM.md).
