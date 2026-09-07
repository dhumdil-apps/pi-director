# Progress Tracker

An always-visible activity indicator above the editor plus a context segment in
Status Bar. It registers no tool and no command: it observes the session and
renders the one thing the transcript cannot show.

## User surface

- Phase indicator — one line above the editor holds the marker and the active
  or idle timing. The marker swaps for a braille spinner while the agent works.
  The spinner advances every 120 ms only during active work and is cleared when
  Pi disposes the widget. Pi's own transient activity row stays hidden.
- Attention segment — `LLM Attention Span (ctx)` is a normal configurable Status
  Bar segment, defaulting to line 4 left. `/extensions` can reorder it,
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
- Working state — while a run is in flight the idle marker gives way to the
  spinner and accent-colored active timing. The tracker does not parse plan
  prose or expose a todo tool.
- Work/cache timer — one compact accent-colored readout follows the active
  spinner and counts only the current work interval (`5s`, `1m 23s`, `1h 04m`).
  It resets when a new run starts rather than displaying grand-total task time.

  In the leading timer position, idle shows age from the latest
  provider response: hidden below 1 minute, warning from 1 minute, and error from
  5 minutes as prompt-cache miss risk increases. This readout is the one place
  idle time is visible; it displays risk and accrues nothing. At that boundary the
  readout stays red at `5m+` and its repaint timer stops. `message_end` starts cache age
  before tool execution, and the latest timestamped assistant message restores
  it across reloads and handoffs. A slow idle repaint advances the age and its
  colors without another Pi event until the cap.

  Normal row truncation protects narrow terminals.

- `agent-status:update` event — `working`, `sessionName`, `contextUsed`,
  `contextMax`, `cacheRead`, `cacheWrite`, `cacheHitRate`, `cwd`, for observers
  such as Pi Inspector Bridge. Inspector receives display context but no control
  credentials or todo state.

## No todo tool

The vendored `manage_todo_list` was removed on 2026-07-24. Pi ships no todo tool
on purpose — its README states plainly that they confuse models — and the
vendored one leaned on nagging to stay used: a `CRITICAL workflow` description,
a "continue to use the todo list" line appended to every write, and a warning
for lists under three items. The working row is spinner and interval timer only — not a todo list.

## Origin

Vendored from `tintinweb/pi-manage-todo-list` (commit `b75c449`, MIT) — see
[UPSTREAM.md](../../UPSTREAM.md). Only the indicator remains.
