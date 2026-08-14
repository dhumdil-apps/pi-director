# Status Bar

Persistent powerline-style status bar with left/right segments updated via
events. The core (`src/powerbar/`) listens for `powerbar:update` events,
maintains a segment store, and renders up to four user-configured lines with
independent left/right alignment. Producer sub-extensions each emit one or more
segments:

- **`src/powerbar-session/`** — `session-name` (mandatory ticket ID + short feature description)
- **`src/powerbar-git/`** — `git-branch` (branch, tracked diff statistics, + dirty marker)
- **`src/powerbar-model/`** — `model` (name + thinking level)
- **`src/powerbar-provider/`** — `provider`
- **`src/powerbar-tokens/`** — `cost`, `tokens`, `agent-stats`
- **`src/powerbar-sub/`** — `sub-hourly`, `sub-weekly` (from Usage Monitor events; missing slots stay as dim `n/a`)
- **`src/powerbar-os/`** — `cpu`, `ram`, `disk`/SSD, `net`
- **Progress Tracker** — `attention-span` (`LLM Attention Span (ctx)`)

Any extension may register a transient segment via powerbar events: it renders
only while active and does not need a configured slot. Workflow mode and phase
remain in Progress Tracker's persistent above-editor indicator; its context
usage is a configurable Status Bar segment. A configured segment id that no
longer exists simply renders nothing.

All Status Bar progress bars use the theme accent normally, changing to warning
and error at their configured usage thresholds. CPU, RAM, and SSD usage render
as one high-contrast, partial-height bar per metric and show a `0%` placeholder
until a sample is available. Subscription countdown bars use weeks at seven or
more days remaining, days below a week, and hours below a day, rounding partial
units up. For a weekly
window with between one day and one week left, the remaining-day blocks show
position against the configured daily allocations: green before completed-day
allocation is consumed, blue while consuming today's allocation, and red only
when usage spills into a future day. The default is five Monday–Friday
allocations; values six and seven include weekends. The suffix keeps total quota
left visible. A configured hourly or weekly slot with no live window stays as
dim `n/a` instead of disappearing. For unmatched providers (xAI, Bedrock), the
weekly slot can use the two Status Bar override fields below.

## User surface

Configured through `/extension-settings` (stored under `powerbar`): a
`Working days per week` number input (default `5`, valid `1`–`7`), unmatched
weekly override fields `Unmatched weekly used %` and `Unmatched weekly reset`,
a `Line gap` on/off setting, and eight ordered pickers, `line1-left` …
`line4-right`, one per line and side. Each picker labels a segment with the line
it defaults to, so an unplaced segment is easy to find. The unmatched weekly
override applies only when Usage Monitor has no quota provider; both fields must
parse (`0`–`100`, optionally with `%`, and ISO-8601 such as `2026-08-21T18:57`)
or weekly stays `n/a`. Natural grok.com dates are rejected. Known providers keep
last-good or `n/a` and never read those fields. Bundle defaults are:

- Line 1 — `git-branch,session-name` left, `provider,model` right
- Line 2 — `cost,agent-stats,tokens` left
- Line 3 — `cpu,ram,disk,net` left, `sub-hourly,sub-weekly` right
- Line 4 — `attention-span` left

The `Git Branch` segment includes its branch, tracked
working-tree statistics (`N files · +A −R`), and dirty marker; moving or omitting
that segment moves or hides all three together.

`Line gap` defaults off. When enabled, one blank row appears between every rendered
Status Bar row. A line left empty between two used lines still renders
as an intentional blank line, so enabling `Line gap` around it creates additional
vertical space; trailing empty lines take no space. A layout stored under the
older `left`/`right` keys is split across these lines once, on first load.
Existing layouts with `tokens` are upgraded once to add `cost` first.

Everything else is fixed rather than configurable, because the visual knobs were
either inert or wrong: separator `·`, blocks-style bars, placement below the
editor, and a 10-block default width for any bar that doesn't declare its own.
The message-count segment renders `💬 … · 👤 … · 🤖 … · 🛠️ …`, and OS
metrics use uppercase `CPU`, `RAM`, `SSD`, and `NET` labels. The token segment
keeps input/output counts dim. The cost segment is accent below $5, warning
from $5, and error from $10.

Agent Workflow owns task naming through `start`: naming the plan sets the
session to a timestamped task slug with an optional ticket ID. This producer
only displays the current name immediately before the git branch and follows
session-name changes and resumes.

## Origin

Vendored from `@juanibiapina/pi-powerbar` (npm 0.12.0, MIT) — see
[UPSTREAM.md](../../UPSTREAM.md).
