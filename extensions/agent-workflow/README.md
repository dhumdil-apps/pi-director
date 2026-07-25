# Agent Workflow

The injected block in [`index.ts`](index.ts) is the behavior contract. This page
only describes it; where they disagree, the block wins.

## The loop

Injected into every turn: **explore, ask, plan, execute, close out**. Two
guarantees carry it — nothing in the working tree changes until the user has
approved a plan, and questions are cheap. The loop is scale-invariant: a
one-line change gets a one-line plan, so "too small to plan" is not an exit.
Each step names an action; the mechanics live in the tool that performs it.
Nothing is enforced.

## Tools

- `ask` (`ask.ts`) — a question and two to four options, each a short headline
  plus a one-sentence description, recommendation first. A final "Write custom answer..."
  option is appended to the picker so the user can close the picker and type an answer directly
  without triggering a new model call. The full Q&A is printed in the transcript by `renderCall`;
  the dialog below is a plain `ctx.ui.select` over the headlines alone, so answering is one keypress.
  Headlines must be distinct — `ui.select` returns the label, not an index. Dismissing is not an
  error; headless is refused before the dialog, since a non-TUI `select()` resolves `undefined` and
  would look the same.
- `save_plan` (`task.ts`) — presents the plan and renames the session, keeping
  the leading timestamp so `.pi/plan/` stays time-ordered. Pass `plan` to
  overwrite the file, or omit it to present what the agent already wrote there;
  either way the content is echoed inline, so the decision is made against
  exactly what is on disk.

Close-out has no tool. The outcome is reported in the turn and durable orientation
and quirks land in project memory, which the agent writes directly — the plan
file stays focused on the task. Close-out says *revise*, not *update*: a new fact
replaces the entry it supersedes, so memory stays a map instead of growing into a
changelog that git already keeps.

## Starting from what is already known

Explore opens on project memory — `.pi/MEMORY.md`, or wherever the project's
`AGENTS.md` says it lives — orientation and quirks, so discovery begins
with a map rather than from zero. It is framed as *leads to verify, not
facts*: there is no staleness marker, because one keyed on a commit would read
stale on commits nowhere near the mapped area, and a marker that rots is worse
than none. Close-out is the other half — it leaves behind exactly what the next
explore step reads.

## Surfaces

- **Auto-scaffold** (`index.ts`) — an unnamed session's first turn creates
  `.pi/plan/<timestamp>-<first-prompt-words>.md` from `PLAN_TEMPLATE` and a
  `.pi/MEMORY.md` stub — orientation and quirks — then names the session after
  it. The stub is written only when the file is absent, so an
  existing memory is never reshaped. Best-effort: an unwritable cwd is ignored
  rather than failing the turn.
- **The approval picker** (`approval.ts`) — a successful `save_plan` for a task
  nobody has approved arms it; it opens when the turn settles: *Proceed,
  handoff, or revise?* Context load picks the recommendation (lean → Proceed,
  loaded → Handoff). Proceed kicks off execution; Handoff prefills
  `/handoff <session-name>`; Revise or dismissing approves nothing. Headless
  sessions get a displayed message naming the command instead. Which task was
  approved is held in memory only, so a reload costs one extra prompt.
- `/handoff [session-name]` (`handoff.ts`) — spawns a fresh session seeded with
  the name and a kickoff naming the plan path. Resolution: explicit name, then
  session name, then a lone remaining plan — several mean it asks which.

Plan files are never deleted by the agent; `.pi/plan/` is the user's to keep,
archive, or prune, and legacy `.pi/goal/` files are ignored and preserved.

## Origin

Bundle-local.
