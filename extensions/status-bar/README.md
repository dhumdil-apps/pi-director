# Status Bar

Persistent powerline-style status bar with left/right segments updated via
events. The core (`src/powerbar/`) listens for `powerbar:update` events,
maintains a segment store, and renders four fixed lines with independent
left/right alignment. Producer sub-extensions each emit one or more
segments:

- **`src/powerbar-session/`** — `session-name` (pretty `8 Aug 16:53` plus remaining ticket/slug; current clock before `start`)
- **`src/powerbar-git/`** — `git-branch` (branch, tracked diff statistics, + dirty marker)
- **`src/powerbar-model/`** — `model` (name + thinking level)
- **`src/powerbar-provider/`** — `provider`
- **`src/powerbar-tokens/`** — `cost`, `tokens`, `agent-stats` (always shown, including `$0.00` and `↑0 ↓0`)
- **`src/powerbar-sub/`** — `sub-hourly`, `sub-weekly` (from Usage Monitor events; a missing sibling is omitted, both missing show one dim `n/a`)
- **`src/powerbar-os/`** — `cpu`, `ram`, `disk`/SSD, `net`
- **Progress Tracker** — `attention-span` (`LLM Attention Span (ctx)`)

Any extension may register a transient segment via powerbar events: it renders
only while active and does not need a configured slot. Workflow mode and phase
remain in Progress Tracker's persistent above-editor indicator; its context
usage is the line-3 `attention-span` Status Bar segment. A configured segment id
that no longer exists simply renders nothing.

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
left visible. A configured hourly or weekly slot with no live window is omitted when the other
slot has data; only when both are missing does the pair show one dim `n/a`.
For unmatched providers (xAI, Bedrock), the weekly slot can use the two Status
Bar override fields below.

## User surface

Configured through `/extension-settings` (stored under `powerbar`): a
`Working days per week` number input (default `5`, valid `1`–`7`) and unmatched
weekly override fields `Unmatched weekly used %` and `Unmatched weekly reset`.
The unmatched weekly override applies only when Usage Monitor has no quota
provider; both fields must parse (`0`–`100`, optionally with `%`, and ISO-8601
such as `2026-08-21T18:57`) or weekly is omitted (or the pair shows one `n/a` if
hourly is also missing). Natural grok.com dates are rejected. Known providers
keep last-good data or the hide / single-`n/a` rule and never read those fields.
Layout is fixed in `FIXED_SETTINGS` (`extensions/status-bar/src/powerbar/settings.ts`):

- Line 1 — `git-branch` left, `provider` right
- Line 2 — `cost,agent-stats,tokens` left, `model` right
- Line 3 — `attention-span` left, `sub-hourly,sub-weekly` right
- Line 4 — `session-name` left, `cpu,ram,disk,net` right

The `Git Branch` segment includes its branch, tracked
working-tree statistics (`N files · +A −R`), and dirty marker.

One blank row appears between every rendered Status Bar row. A line left empty
between two used lines still renders as an intentional blank line; trailing
empty lines take no space. Leftover `line1-left` … `line4-right` and `line-gap`
keys in `settings-extensions.json` are ignored.

Everything else is fixed rather than configurable, because the visual knobs were
either inert or wrong: separator `·`, blocks-style bars, placement below the
editor, and a 10-block default width for any bar that doesn't declare its own.
The message-count segment renders `💬 … · 👤 … · 🤖 … · 🛠️ …`, and OS
metrics use uppercase `CPU`, `RAM`, `SSD`, and `NET` labels. The token segment
keeps input/output counts dim. The cost segment is accent below $5, warning
from $5, and error from $10.

Agent Workflow owns task naming through `start`: naming the plan sets the
session to a timestamped task slug with an optional ticket ID. This producer
parses that stamp into `8 Aug 16:53`, appends the remaining slug, and
follows session-name changes and resumes. Before `start` it snapshots the
current local clock so line 4 left is never empty.

## Origin

Vendored from `@juanibiapina/pi-powerbar` (npm 0.12.0, MIT) — see
[UPSTREAM.md](../../UPSTREAM.md).
