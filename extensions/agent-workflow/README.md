# Agent Workflow

The injected block in [`index.ts`](index.ts) is the behavior contract. This page
describes its runtime surfaces and persistence; where they disagree, the block
wins.

## Three modes, chosen by the User

- **Ask** aligns and decides. For every new task it uses the native
  `questionnaire` tool at least once to establish consequential choices before
  recommending Spec or Vibe. It changes no project files.
- **Spec** researches and designs. It establishes facts, fills the artifact, and
  presents a proposal with `save_plan`. It changes no project files.
- **Vibe** executes. It is the mode intended for edits and writes; the boundary
  is advisory rather than a runtime permission gate.

A session starts in Ask. Ask may proceed directly to Vibe after alignment; Spec
is optional and starts only when the User chooses research or design. Nothing in
the bundle ever selects a mode on the Agent's behalf — there is no promotion,
escalation, or fallback. The Agent may recommend a mode; only the User adopts
one. The choice survives reloads, forks, and
handoffs, and pre-rename sessions that persisted a phase or a two-value mode fold
onto these three on read.

Close out is a step at the end of a turn, not a fourth mode.

## The mode picker

The picker is the single decision surface, and it is owned by the runtime rather
than by a tool, so the Agent cannot skip it by forgetting a call. Before settling,
the Agent can use `recommend_next` to record the turn's outcome without changing
mode. The runtime combines that outcome with live plan and context state to make
one action explicit and recommended:

- Ask offers `Continue alignment`, `Proceed to Spec`, or `Start Vibe` according
  to whether questions remain and the aligned task's risk and uncertainty.
- Spec offers `Continue research and planning` or `Return to Ask`; a successful
  `save_plan` offers `Approve plan and start Vibe`.
- Vibe offers `Continue implementation`, `Return to Ask`, or `Proceed to Spec`.
  A marked phase boundary becomes `Hand off next phase` only when checklist work
  remains and context is loaded; context pressure alone never leads to handoff.
- Selecting any cross-mode action persists the User's mode choice. Spec and Vibe
  destinations immediately send their kickoff; Ask returns to the editor and
  waits for input. Secondary actions use `Start Ask` / `Start Spec` / `Start Vibe`
  labels to make the destination explicit.
- `Hand off to a fresh session` remains available while work is open and prepares
  `/handoff <name>` in the editor. Handoff still requires Enter and starts the
  replacement session in Ask mode.
- After closeout, Continue and Handoff are omitted; the picker recommends a new
  Ask or Spec direction.
- `Write your own...` and dismissal are the same escape hatch: control returns to
  the editor with the mode untouched.

If the Agent omits `recommend_next`, the runtime still opens the picker and
conservatively recommends continuing the current mode. Recommendations expire at
the next User message and never carry into a later turn.

`/ask`, `/spec`, and `/vibe` switch mode directly when the picker itself is
unavailable, and `/mode` re-opens it. None of them start a turn.

The mode picker routes work after a turn; `questionnaire` gathers Ask alignment
inside a turn. It presents 1–4 native option pickers, shows the Agent's recommended
answer first, and returns selections or custom input to the Agent before settlement.
Spec blockers and Vibe decision blockers still stop, write the problem and
recommended resolution into the artifact, record Ask as the next step, and let
the picker carry the decision. Vibe resolves implementation research in place rather than
treating Spec as an execution prerequisite.

Picker and questionnaire latency accrue as capped Align time through checkpoint
events.

## Mode as execution guidance

Ask and Spec describe read-only work, while Vibe is the mode for execution. This
boundary is advisory: the runtime does not block `edit`/`write` calls or warn
about shell and custom tools based on mode. The User still owns the mode choice,
and the injected contract remains the primary behavioral guide.

There is no separate plan-approval gate. Switching to Vibe is the approval, which
is why `save_plan` persists and echoes rather than interrupting the turn.

## Artifacts

An unnamed first turn creates a timestamped plan from the flat template plus
`.pi/MEMORY.md` when absent. Its temporary filename uses randomly selected
neutral words from a prepared vocabulary rather than the prompt. `start_task`
then renames that scaffold once.

**One session owns one plan file.** A later `start_task` with a different name is
refused rather than starting a second record, so the initial goal and every
revision stay in one place across the whole session and its handoffs. A genuinely
new goal belongs in a fresh session. Plan files are never deleted automatically
and `.pi/plan/` accumulates.

The template is flat — Goal, Align, Current state, Findings, Decisions, Desired
state, Approach, Work log, Quirks, Checklist, and Close out with PR summary and
QA steps. Sections stay stubbed until the mode that owns them fills one, so a
session that only ever researched simply never grows a work log.

Checklist boxes are live completion metadata: closeout updates every completed
box, including boxes in earlier revisions, while historical narrative remains
append-only.

`save_plan` belongs to Spec. It replaces only an untouched pre-execution draft
and appends a dated revision after execution history exists. Once a plan has
execution history or a Close out, follow-up work belongs in a dated `## Revision
N` at the bottom; earlier narrative remains historical, while live checklist
status may be updated. Once execution has begun, the plan name is immutable in code and an
attempted rename fails before any file move.

## Handoffs

`/handoff [session-name]` continues the same artifact in a fresh session, seeded
with the task name and Ask mode so the next direction is aligned before work
resumes.

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

## Focused exploration

After the scaffold exists, start with one exact symbol or path search before
opening files. Keep search output bounded with limited matches and line width.
Read only the owning implementation and directly relevant evidence, using small
`offset`/`limit` windows (about 200 lines at a time unless a concrete reason
requires more). Exclude `node_modules`, generated/vendor/cache trees, and source
maps unless they are the explicit target. Stop when the question is answered;
broaden only for a concrete unresolved reason.

Before any tool call, match the operation to its schema. If validation rejects a
call, correct the tool and arguments and retry once; do not switch tool names
mid-call or claim a rejected mutation succeeded.

## Evidence policy

Use the smallest useful evidence and review diff. Local source and directly
relevant runtime or documentation evidence lead; memory and historical plans are
bounded leads to verify. Pi-core documentation is opened only for a named host-API
question local evidence cannot answer.

## Origin

Bundle-local.
