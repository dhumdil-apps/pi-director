# Progress Tracker

An always-visible activity and context indicator above the editor. It registers
no tool and no command: it observes the session and renders the one thing the
transcript cannot show.

## User surface

- Two-line indicator — line 1 is the marker plus the mode badge or working word,
  line 2 is the indented context readout:

  ```
  › What’s your goal?
    LLM Attention Span (ctx) ▃         84.0k / 1.0M · 📦 init 84.0k
  ```

  The context readout owns its own line so it never slides sideways as the word
  above it changes width. The marker swaps for a braille spinner while the agent
  works, and line 2 is omitted entirely while the token count is unknown. After
  the first completed turn, it retains the first provider response's own
  `usage.totalTokens` as `📦 init …`; reading the response directly avoids a
  post-tool context snapshot that already includes results for the next request.
  That aggregate includes the initial user message, so it never claims to measure
  instructions alone. Initial tokens use their own
  absolute colors (dim below 10k, warning at 10k, error at 20k), independent
  of whole-context pressure. Five partial-height blocks
  carry the context-window percentage. The spinner advances every 120 ms only
  during active work and is cleared when Pi disposes the widget. The context
  readout refreshes at turn boundaries and is colored accent / warning / error:
  warning above 20% full and error above 40% full. The bar carries the
  proportion, so the percentage is not printed. Pi's own transient activity row
  stays hidden.
- Idle prompt — `What’s your goal?` (dim) before approval, or `What’s up next?`
  (accent) after an approved execution settles. The first
  invites the next goal; the second invites a review, a refinement, or a clean
  new session for the next task. It is **display only**: Agent Workflow emits
  `agent-workflow:phase` on post-execution user input (`explore`), save (`plan`),
  and approval (`execute`). Agent Workflow also persists each transition as a
  custom session entry excluded from model
  context. Reloads and tree changes read the latest entry, and `/handoff` seeds
  `execute` before the replacement session initializes; older sessions still
  fall back to their kickoff message. This is not the retired session-mode state
  machine — the injected loop is one
  constant and never varies with the prompt.
- Working words — while a run is in flight the badge gives way to a word from
  the phase's pool, swapped every 8 s for a different one at random:
  `Scheming…`/`Sketching…` while planning, `Aggressively stitching together…`/
  `Beating into submission…` once approved, and `Peeking inside…`/
  `Sniffing around…` while exploring before or between planning cycles. The
  pools do not overlap, so the gate stays readable while the line
  moves; the colour follows the badge. Pools and the pick live in `ui/whimsy.ts`
  (`pickWord` takes its randomness as an argument so the rotation is testable).
- Work/cache timer — one compact dim readout trails the active word and
  counts only the current phase interval (`5s`, `1m 23s`, `1h 04m`). It resets
  whenever Explore, Plan, or Execute begins rather than displaying grand-total
  task time. Full accumulated phase totals follow it as
  `· explore 5s · plan 12s · execute 3s`: the current phase is accent and the
  others are dim. The active bucket advances live; all three remain visible and
  static while idle or waiting. Native question and plan approval dialogs pause
  task timing because the Agent is waiting on the User, and the indicator
  switches to the phase-specific static prompt while the dialog is open. In the
  leading timer position, idle or waiting instead shows age from the latest
  provider response: accent below 1 minute, warning from 1 minute, and error
  from 5 minutes as prompt-cache miss risk increases. `message_end` starts cache
  age before tool execution, and the latest timestamped assistant message
  restores it across reloads and handoffs. A slow idle repaint advances the age
  and its colors without another Pi event. Active intervals accrue to Explore,
  Plan, or Execute, splitting immediately when a context-free phase event lands;
  an initial phase-less interval counts as Explore. On settlement the total and
  phase buckets atomically update the named plan's script-owned `time-spent`
  block. Existing total-only history migrates to Unallocated, while marker-free
  legacy plans remain byte-identical until their next settled run. Persistence
  is best-effort if the plan is unavailable. The active phase-local timer and
  bucket update are derived from the current segment stamp; the idle-only timer
  is disposed with the widget. Normal row truncation protects narrow terminals.
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
