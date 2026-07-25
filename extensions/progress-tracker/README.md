# Progress Tracker

An always-visible activity and context indicator above the editor. It registers
no tool and no command: it observes the session and renders the one thing the
transcript cannot show.

## User surface

- Persistent context indicator — shows `› ctx <bar> 84.0k / 1.0M` while idle and
  swaps the marker for a braille spinner while the agent works. The bar reuses
  the powerbar's configured continuous/blocks style and width. The spinner
  advances every 120 ms only during active work and is cleared when Pi disposes
  the widget. The context readout refreshes at turn boundaries and is colored
  accent / warning / error: warning past 100k tokens or 40% full, error past
  200k or 80%, whichever trips first. The bar carries the proportion, so the
  percentage is not printed. It carries no workflow phase, session mode, or
  transient activity text.
- `agent-status:update` event — `working`, `contextUsed`, `contextMax`, `cwd`,
  for observers such as Agent Status Bridge.

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
