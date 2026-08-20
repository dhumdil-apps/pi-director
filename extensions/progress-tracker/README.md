# Progress Tracker

An always-visible activity indicator above the editor plus a context segment in
Status Bar. It registers no tool and no command: it observes the session and
renders the one thing the transcript cannot show.

## User surface

- Phase indicator — one line above the editor holds the marker and the idle
  prompt or active timing. The marker swaps for a braille spinner while the
  agent works. The spinner advances every 120 ms only during active work and is
  cleared when Pi disposes the widget. Pi's own transient activity row stays
  hidden.
- Attention segment — `LLM Attention Span (ctx)` is a normal configurable Status
  Bar segment, defaulting to line 4 left. `/extension-settings` can reorder it,
  move it to any of the four left/right slots, or hide it. The segment is omitted
  while token count is unknown. After the first completed turn, it retains the
  first provider response's own `usage.totalTokens` as `📦 init …`; reading the
  response directly avoids a post-tool context snapshot that already includes
  results for the next request. That aggregate includes the initial user message,
  so it never claims to measure instructions alone. Initial tokens use their own
  absolute colors (dim below 10k, warning at 10k, error at 20k), independent of
  whole-context pressure. Five partial-height blocks carry the context-window
  percentage. The readout refreshes at turn boundaries and is colored accent /
  warning / error: warning above 20% full and error above 40% full. The bar
  carries the proportion, so the percentage is not printed.
- Idle prompt — `What’s your goal?` (dim) in ALIGN or SPEC, or `What’s up next?`
  (warning) once execution settles in VIBE. The first invites the next goal; the
  second invites a review, a refinement, or a clean new session for the next
  task. It is **display only**: the prompt follows the session's
  workflow mode, which only the User changes through the mode picker, `/align`,
  `/spec`, `/vibe`, or `/handoff`. `/align`, `/spec`, and `/vibe` auto-start a
  continuation, matching picker transitions. `/handoff` auto-starts ordinary Align continue. Mode changes are persisted as custom
  session entries excluded from model context, and legacy `questionnaire`, `explore`,
  `plan`, and `execute` entries fold onto Align, Spec, Spec, and Vibe. Reloads and tree changes
  read the latest entry. The large injected contract stays constant while only a
  tiny per-turn mode message varies.
- Working state — while a run is in flight the idle prompt gives way to the
  spinner and accent-colored active timing. The plan's `**Current work:**`
  phrase follows the timer in dim (`⠋ 12s C5 seed current-work line`) when
  non-empty. Idle, waiting, missing plans, and empty lines omit it. The tracker
  re-reads the named plan on adopt, `agent_start`, `tool_execution_end`, and
  `agent_settled`; it does not parse Checklist prose or expose a todo tool.
- Work/cache timer — one compact accent-colored readout follows the active
  spinner and counts only the current work interval (`5s`, `1m 23s`, `1h 04m`). It resets whenever
  ALIGN, SPEC, or VIBE work begins rather than displaying grand-total task time.
  Accumulated totals follow it as
  `· ❓ ALIGN 5s · 🔎 SPEC 12s · 🚀 VIBE 3s`: the current mode is warning and the
  other modes are dim. ALIGN, SPEC, and VIBE are mutually exclusive Agent-work buckets;
  human latency never enters them.

  Native question and mode dialogs pause active work while the UI belongs to
  the User, and an Agent-recommended picker opens after settlement, so time spent choosing or
  typing is accrued nowhere. Persisted checkpoint events still keep a custom
  answer open until the next human input and reconstruct unresolved choices after
  reload; they no longer carry timing.

  In the leading timer position, idle or waiting shows age from the latest
  provider response: hidden below 1 minute, warning from 1 minute, and error from
  5 minutes as prompt-cache miss risk increases. This readout is the one place
  idle time is visible; it displays risk and accrues nothing. At that boundary the
  readout stays red at `5m+` and its repaint timer stops. `message_end` starts cache age
  before tool execution, and the latest timestamped assistant message restores
  it across reloads and handoffs. A slow idle repaint advances the age and its
  colors without another Pi event until the cap.

  Active intervals accrue to ALIGN, SPEC, or VIBE, splitting immediately when a
  mode event lands; an initial mode-less interval counts as Align. On settlement
  the buckets atomically update the named plan's script-owned `time-spent` block.
  Pre-rename explore/execute markers migrate to Spec/Vibe and their retired
  decision bucket folds into Unallocated, older
  Plan work folds into Spec, total-only history migrates to Unallocated, and
  legacy plans remain byte-identical and contribute timing only after the Agent creates a current-format continuation.
  Persistence is best-effort if the plan is unavailable. Normal row truncation
  protects narrow terminals.

- `agent-status:update` event — `working`, `mode`, `sessionName`, `contextUsed`,
  `contextMax`, `cacheRead`, `cacheWrite`, `cacheHitRate`, `cwd`, for observers
  such as Pi Inspector Bridge. Inspector receives display context but no control
  credentials or todo state.

## No todo tool

The vendored `manage_todo_list` was removed on 2026-07-24. Pi ships no todo tool
on purpose — its README states plainly that they confuse models — and the
vendored one leaned on nagging to stay used: a `CRITICAL workflow` description,
a "continue to use the todo list" line appended to every write, and a warning
for lists under three items. The working row may show one Agent-owned
`**Current work:**` phrase from the plan; that is display-only, not a list the
model must keep in tool state.

## Origin

Vendored from `tintinweb/pi-manage-todo-list` (commit `b75c449`, MIT) — see
[UPSTREAM.md](../../UPSTREAM.md). Only the indicator remains.
