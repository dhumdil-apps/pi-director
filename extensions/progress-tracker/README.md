# Progress Tracker

Replicates GitHub Copilot's `manage_todo_list` and adds an always-visible
context/activity indicator above the editor. Local todos persist through tool
result details and are reconstructed from the current session branch.

## User surface

- `manage_todo_list` tool — `read` and `write` local todos. One todo may be in
  progress at a time.
- Persistent context indicator — shows `› ctx █░░░ 84.0k / 1.0M` while idle and
  swaps the marker for a braille spinner while the agent works. The spinner
  advances every 120 ms only during active work and is cleared when Pi disposes
  the widget. The context readout refreshes at turn boundaries and is colored
  accent / warning / error: warning past 100k tokens or 40% full, error past
  200k or 80%, whichever trips first. The bar carries the proportion, so the
  percentage is not printed. It carries no workflow phase, session mode, or
  transient activity text.
- `/todos` command — reports the context indicator location and toggles the
  independent local todo widget.
- `/todos clear` — clears and hides local todos.

## Origin

Vendored from `tintinweb/pi-manage-todo-list` (commit `b75c449`, MIT) — see
[UPSTREAM.md](../../UPSTREAM.md).
