# Agent Workflow

The injected block in [`index.ts`](index.ts) is the behavior contract. This page
describes its runtime surfaces and persistence; where they disagree, the block
wins.

## Three modes, chosen by the User

- **Ask** aligns and decides. It reads, answers, frames the work, and recommends
  what should happen next. It changes no project files.
- **Spec** researches and designs. It establishes facts, fills the artifact, and
  presents a proposal with `save_plan`. It changes no project files.
- **Vibe** executes. It is the only mode that may edit or write project files.

A session starts in Ask. Nothing in the bundle ever selects a mode on the Agent's
behalf — there is no promotion, escalation, or fallback. The Agent may recommend
a mode; only the User adopts one. The choice survives reloads, forks, and
handoffs, and pre-rename sessions that persisted a phase or a two-value mode fold
onto these three on read.

Close out is a step at the end of a turn, not a fourth mode.

## The mode picker

The picker is the single decision surface, and it is owned by the runtime rather
than by a tool, so the Agent cannot skip it by forgetting a call. It opens on
every settled turn:

- `Continue with the recommended next step` keeps the mode and sends a short
  kickoff. The recommendation itself is the Agent message directly above.
- `Switch to Ask` / `Switch to Spec` / `Switch to Vibe` persist the choice, log
  it in the artifact, and start no turn — the User types the next request.
- `Hand off to a fresh session` prepares `/handoff <name>` in the editor. It
  leads and is marked recommended once the context is no longer lean.
- `Write your own...` and dismissal are the same escape hatch: control returns to
  the editor with the mode untouched.

`/ask`, `/spec`, and `/vibe` switch mode directly when the picker itself is
unavailable, and `/mode` re-opens it. None of them start a turn.

Because the picker is always one turn away, a blocker never needs a mid-turn
dialog. Spec and Vibe stop, write the problem and the recommended resolution into
the artifact, and let the picker carry the decision. There is no `ask` tool.

Picker latency accrues as capped Align time through the checkpoint events, and a
custom answer stays open until the next human input.

## Mode as the edit gate

`edit` and `write` are blocked unless the mode is Vibe. This is what makes "the
Agent never switches mode" enforceable rather than advisory: reaching execution
takes a User choice, not a model decision. Reads and `.pi/plan/` or `.pi/MEMORY.md`
maintenance stay available in every mode.

Shell and unknown custom tools cannot be classified reliably, so running one
outside Vibe produces one visible warning per interval. The contract remains the
primary guard for those tools.

There is no separate plan-approval gate. Switching to Vibe is the approval, which
is why `save_plan` persists and echoes rather than interrupting the turn.

## Artifacts

An unnamed first turn creates a timestamped plan from the flat template plus
`.pi/MEMORY.md` when absent. `start_task` then renames that scaffold once.

**One session owns one plan file.** A later `start_task` with a different name is
refused rather than starting a second record, so the initial goal and every
revision stay in one place across the whole session and its handoffs. A genuinely
new goal belongs in a fresh session. Plan files are never deleted automatically
and `.pi/plan/` accumulates.

The template is flat — Goal, Align, Current state, Findings, Decisions, Desired
state, Approach, Work log, Quirks, Checklist, and Close out with PR summary and
QA steps. Sections stay stubbed until the mode that owns them fills one, so a
session that only ever researched simply never grows a work log.

`save_plan` belongs to Spec. It replaces the draft until the session has entered
Vibe, and appends a dated revision after; once execution has begun, the plan name
is immutable in code and an attempted rename fails before any file move.

## Handoffs

`/handoff [session-name]` continues the same artifact in a fresh session, seeded
with the task name and the current mode.

The replacement session inherits the artifact and nothing else, so `/handoff`
first drives one checkpoint turn in the outgoing session and waits for it. That
turn brings the plan file up to date with everything learned so far. Without it,
a handoff would discard exactly the context it exists to preserve. The picker
suppresses itself for that settlement.

## Timing

Each artifact carries a script-owned `time-spent` block with one bucket per mode:
Ask, Spec, and Vibe, plus unallocated history. Ask holds both Agent work in Ask
mode and capped picker latency. Progress Tracker accrues the active bucket and
closes the interval the moment the mode changes, so a switch mid-run splits the
time correctly.

Markers written before the rename migrate one-to-one — explore becomes Spec,
execute becomes Vibe, decision becomes Ask — so no existing plan loses time.
`stripTimeSpent` excludes the block from plan identity, so a timer write cannot
disturb revision detection.

## Headless

Non-interactive sessions have no picker to answer and no gate to satisfy, so the
contract would describe a workflow that cannot happen. `before_agent_start`
returns the system prompt untouched when there is no UI: no injection, no
scaffold, no picker.

## Evidence policy

Use the smallest useful evidence and review diff. Add tests when they protect a
non-obvious externally observable rule or regression, not to restate prose or
implementation details. Local source and focused tests lead; memory and
historical plans are bounded leads to verify. Pi-core documentation is opened
only for a named host-API question local evidence cannot answer.

## Origin

Bundle-local.
