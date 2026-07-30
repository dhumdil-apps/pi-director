# Progress Tracker

An always-visible activity indicator above the editor plus a context segment in
Status Bar. It registers no tool and no command: it observes the session and
renders the one thing the transcript cannot show.

## User surface

- Phase indicator — one line above the editor holds the marker plus the mode
  badge or working word. The marker swaps for a braille spinner while the agent
  works. The spinner advances every 120 ms only during active work and is
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
- Idle prompt — `What’s your goal?` (dim) before approval, or `What’s up next?`
  (accent) after an approved execution settles. The first invites the next goal;
  the second invites a review, a refinement, or a clean new session for the next
  task. It is **display only**: Agent Workflow emits `agent-workflow:phase` on
  post-execution human input (`explore`) and approval (`execute`), persisting
  each transition as a custom session entry excluded from model context.
  Historical `plan` entries map to Explore. Reloads and tree changes read the
  latest entry, and `/handoff` seeds `execute` before the replacement session
  initializes; older sessions still fall back to their kickoff message. This is
  not the retired session-mode state machine — the injected loop is one constant
  and never varies with the prompt.
- Working words — while a run is in flight the badge gives way to a word from
  the mode's pool, swapped every 8 s for a different one at random:
  `Aggressively stitching together…`/`Beating into submission…` once approved,
  and `Peeking inside…`/`Sniffing around…` while exploring or preparing a plan.
  The pools do not overlap, so the gate stays readable while the line moves; the
  colour follows the badge. Pools and the pick live in `ui/whimsy.ts`
  (`pickWord` takes its randomness as an argument so rotation is testable).
- Work/cache timer — one compact dim readout trails the active word and counts
  only the current work interval (`5s`, `1m 23s`, `1h 04m`). It resets whenever
  Explore or Execute begins rather than displaying grand-total task time.
  Accumulated totals follow it as
  `· explore 5s · execute 3s · decision 12s`: the current work mode is accent;
  the other work mode and Decision are dim. Explore and Execute are mutually
  exclusive Agent-work buckets. Decision is capped wall-clock latency while an
  Align choice is unresolved, including User thinking or idle time, and is not a
  third work mode.

  Native question and approval dialogs pause active work while the UI belongs to
  the User. Separate persisted checkpoint events measure Decision, keep a custom
  answer open until the next human input, and reconstruct unresolved choices
  after reload. The live Decision bucket advances to a five-minute per-checkpoint
  cap and adds `+` once capped. Resolving a checkpoint persists its capped latency
  best-effort.

  In the leading timer position, idle or waiting shows age from the latest
  provider response: hidden below 1 minute, warning from 1 minute, and error from
  5 minutes as prompt-cache miss risk increases. At that boundary the readout
  stays red at `5m+` and its repaint timer stops. `message_end` starts cache age
  before tool execution, and the latest timestamped assistant message restores
  it across reloads and handoffs. A slow idle repaint advances the age and its
  colors without another Pi event until the cap.

  Active intervals accrue to Explore or Execute, splitting immediately when a
  context-free mode event lands; an initial phase-less interval counts as
  Explore. On settlement the work buckets atomically update the named plan's
  script-owned `time-spent` block. Historical Plan work folds into Explore,
  total-only history migrates to Unallocated, and marker-free legacy plans stay
  byte-identical until their next settled run. Persistence is best-effort if the
  plan is unavailable. Normal row truncation protects narrow terminals.
- `agent-status:update` event — `working`, `phase`, `sessionName`, `contextUsed`,
  `contextMax`, `cacheRead`, `cacheWrite`, `cacheHitRate`, `cwd`, for observers
  such as Pi Inspector Bridge. Inspector displays phase/session context but
  receives no control credentials, mode, or todo state.

## No todo tool

The vendored `manage_todo_list` was removed on 2026-07-24. Pi ships no todo tool
on purpose — its README states plainly that they confuse models — and the
vendored one leaned on nagging to stay used: a `CRITICAL workflow` description,
a "continue to use the todo list" line appended to every write, and a warning
for lists under three items. What the agent is doing is already visible in the
transcript.

## Origin

Vendored from `tintinweb/pi-manage-todo-list` (commit `b75c449`, MIT) — see
[UPSTREAM.md](../../UPSTREAM.md). Only the indicator remains.
