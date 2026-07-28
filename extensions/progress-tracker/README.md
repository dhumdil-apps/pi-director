# Progress Tracker

An always-visible activity and context indicator above the editor. It registers
no tool and no command: it observes the session and renders the one thing the
transcript cannot show.

## User surface

- Two-line indicator — line 1 is the marker plus the mode badge or working word,
  line 2 is the indented context readout:

  ```
  › What’s your goal?
    LLM Attention Span (ctx) ▃         84.0k / 1.0M · init tokens 84.0k
  ```

  The context readout owns its own line so it never slides sideways as the word
  above it changes width. The marker swaps for a braille spinner while the agent
  works, and line 2 is omitted entirely while the token count is unknown. After
  the first completed turn, it retains the provider-reported aggregate context
  as dim `init tokens …`; that exact aggregate includes the initial user message,
  so it never claims to measure instructions alone. Five partial-height blocks
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
- Session work timer — a dim elapsed readout trails the word or badge (`5s`,
  `1m 23s`, `1h 04m`). It sums every interval between `agent_start` and
  `agent_settled` for the current in-memory session: the total counts up while
  work is in flight, pauses beside the idle prompt, and resumes with the next
  run. A fresh or reloaded session starts with no timer; elapsed time is not
  persisted or reconstructed. The counter owns no timer of its own — it is
  derived at render time from the settled total and current start stamp held in
  `index.ts`, because Pi re-creates the widget factory on every refresh.
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
