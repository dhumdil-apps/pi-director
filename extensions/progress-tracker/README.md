# Progress Tracker

An always-visible activity and context indicator above the editor. It registers
no tool and no command: it observes the session and renders the one thing the
transcript cannot show.

## User surface

- Two-line indicator — line 1 is the marker plus the mode badge or working word,
  line 2 is the indented context readout:

  ```
  › plan
    LLM Attention Span (ctx) ▃▁▁▁▁ 84.0k / 1.0M
  ```

  The context readout owns its own line so it never slides sideways as the word
  above it changes width. The marker swaps for a braille spinner while the agent
  works, and line 2 is omitted entirely while the token count is unknown. The bar is the
  powerbar's blocks meter, ten blocks wide. The spinner
  advances every 120 ms only during active work and is cleared when Pi disposes
  the widget. The context readout refreshes at turn boundaries and is colored
  accent / warning / error: warning past 100k tokens or 40% full, error past
  200k or 80%, whichever trips first. The bar carries the proportion, so the
  percentage is not printed. Pi's own transient activity row stays hidden.
- Mode badge — `plan` (dim) or `auto` (accent) on line 1. It is never absent: a
  session with no plan in play yet is still planning, so it reads `plan`, and
  the badge brightens to `auto` once approval means work may start. It is
  **display only**: Agent Workflow emits `agent-workflow:phase` on save (`plan`)
  and on approval (`execute`), a `/handoff`-seeded or reloaded session re-derives it
  from the kickoff message on the branch, and nothing is written to the session
  or shown to the model. This is not the retired session-mode state machine —
  the injected loop is one constant and never varies with the badge.
- Working words — while a run is in flight the badge gives way to a word from
  the phase's pool, swapped every 4 s for a different one at random:
  `Pondering…`/`Scheming…` while planning, `Forging…`/`Wrangling…` once
  approved, and `Rummaging…`/`Spelunking…` while exploring before any plan
  exists. The pools do not overlap, so the gate stays readable while the line
  moves; the colour follows the badge. Pools and the pick live in `ui/whimsy.ts`
  (`pickWord` takes its randomness as an argument so the rotation is testable).
- `agent-status:update` event — `working`, `contextUsed`, `contextMax`,
  `cacheRead`, `cacheWrite`, `cacheHitRate`, `cwd`, for observers such as Agent
  Status Bridge. This list is the whole contract: Wingman's status strip accepts
  exactly these fields, and nothing carries mode or todos.

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
