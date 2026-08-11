# Agent Workflow

The injected contract in [`workflow-steps.md`](workflow-steps.md) is the behavior
contract. [`index.ts`](index.ts) loads it as a package-local asset and injects it.
This page describes its runtime surfaces and persistence; persisted runtime mode
is authoritative when a marker or display is stale. For an interactive view of the contract, open the [workflow state machine](../../docs/workflow-steps.html).

## Three modes, chosen by the User

- **Q&A** is Align: an interactive loop for clarifying goal, scope, constraints,
  trade-offs, and direction. It uses the native `ask` tool
  whenever a consequential choice is open, permits only bounded orientation reads,
  and defers source research and results to Spec. When direction changes, it keeps
  the initial goal and pending outcomes visible until the User explicitly resolves
  them. It changes no project files.
- **Spec** researches and designs. It establishes facts, fills the artifact, and
  presents a proposal with `save_plan`. It changes no project files.
- **Vibe** executes. It is the mode intended for edits and writes; the boundary
  is advisory rather than a runtime permission gate.

A session starts in Q&A. Q&A may proceed directly to Vibe after alignment; Spec
is optional and starts only when the User chooses research or design. Nothing in
the bundle ever selects a mode on the Agent's behalf — there is no promotion,
escalation, or fallback. The Agent may recommend a mode; only the User adopts
one. The choice survives reloads, forks, and
handoffs, and pre-rename sessions that persisted a phase or a two-value mode fold
onto these three on read.

Close out is a step at the end of a turn, not a fourth mode.

## The mode picker

The picker is the post-turn decision surface, and it is owned by the runtime
rather than by a tool, so the Agent cannot skip a needed route by forgetting a
call. Before settling, the Agent can use `recommend_next` to record one or more
mode actions without changing mode. Each Agent-authored action may carry its own
reason and custom kickoff. The runtime renders those actions before manual
mode-switch choices:

- An Agent can list any combination of Q&A, Spec, and Vibe. Each selected listed
  action persists its mode and starts the matching continuation. A listed current
  mode uses its Continue label; a listed Q&A route starts with native `ask`.
- While work remains, an omitted Agent action receives a contextual runtime
  fallback: a saved Spec plan starts Vibe, in-progress Spec/Vibe continues its
  current mode, and context pressure offers a handoff. Only completed work has
  no fallback; its unlisted mode choices return to the editor for a new direction.
- Agent-authored actions use mode-prefixed plain-language labels and can include
  their own concise reason, such as `🚀 Vibe — Start implementing the plan — verify
the API`. They have no `(recommended)` marker; ask-option confidence is separate.
- `🤝 Hand off next phase` is an explicit phase-boundary action. The always
  available `🤝 Hand off to a fresh session` prepares `/handoff <name>` in the
  editor and requires Enter; after checkpointing, the replacement inherits the
  first listed mode action, or the current mode when none was listed.
- The contextual `📝 Write a custom answer...` option and dismissal return to the
  editor with the mode untouched. Manual secondary actions use emoji-prefixed,
  plan-aware labels that include the first pending checklist item.

Agent actions expire at the next User message and never carry into a later turn.
Runtime fallback actions apply only while the artifact has unfinished work.

`/questionnaire`, `/spec`, and `/vibe` switch mode directly when the picker itself is
unavailable, and `/mode` re-opens it. `/questionnaire` waits for the next User input;
`/spec` and `/vibe` start the same extension-generated continuation as picker transitions.

The mode picker routes work after a turn; Q&A begins every interaction with
`ask`, and `ask` gathers concrete alignment questions inside a turn from any
interactive mode. It presents 1–4 native option
pickers, ranks their options by descending numeric confidence (1–5), and identifies
its displayed choices as A, B, C, or D in that order. Ties preserve the Agent-supplied
order. Ordinary selections retain their stable values and original labels; custom
input includes the displayed letter-to-label key so the Agent can interpret references
such as “combine A and B” before settlement. When a decision needs user-supplied
detail, authors set `customAnswerLabel` to a concise input intent, such as “Describe
desired behavior”. The picker then shows `📝 Write a custom answer... → Describe
desired behavior`, rather than adding a selectable “specify” option that cannot open
an input field.
Every picker also offers `Proceed with best → Spec` and `Proceed with best → Vibe`.
Either explicit User action preserves prior manual answers, accepts each remaining
highest-confidence answer, persists the selected mode, and queues a target-mode turn
that records the accepted decisions before working. Batch only independent questions
whose wording and options remain valid regardless of sibling answers; dependent
follow-ups require a fresh `ask` call after the earlier answer. Q&A should keep this
exchange conversational and question-first; confidence is guidance only, not
permission to skip unresolved alignment.
Spec blockers and Vibe decision blockers still stop, write the problem and
recommended resolution into the artifact, record Q&A as the next step, and let
the picker carry the decision. Vibe resolves implementation research in place rather than
treating Spec as an execution prerequisite.

Picker and native ask-tool latency is the User's time: it pauses the active mode
clock and accrues to no bucket.

## Mode as execution guidance

Q&A and Spec describe read-only work, while Vibe is the mode for execution. This
boundary is advisory: the runtime does not block `edit`/`write` calls or warn
about shell and custom tools based on mode. The User still owns the mode choice,
and the injected contract remains the primary behavioral guide. Vibe may use
`record_auto_decision` only for reversible, low-risk, in-scope choices already
implied by the task; the artifact carries its rationale, impact, and verification
for close-out review.

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
state, Approach, Work log, Quirks, Checklist, and Close out with Status, optional
Auto-mode decisions, PR summary, and QA steps. Sections stay stubbed until the
mode that owns them fills one, so a session that only ever researched simply never
grows a work log.

Checklist boxes are cumulative live completion metadata: repeated task text is
one task, the latest checkbox state wins, and unique pending tasks from older
revisions remain actionable. Keep the initial Goal and checklist labels verbatim
when changing only completion state; do not rename or split a pending item without
explicitly resolving the original. Before closeout, reconcile every requested
outcome from the initial goal, accepted proposals, and follow-up instructions
against the cumulative checklist. Closeout updates completed boxes across revisions
while historical narrative remains append-only. Write `### Status` / `complete` only
after every requested outcome is reconciled, including any renamed historical item.
The runtime reads that marker only from the latest revision's close-out and then
suppresses stale open-work context; a later revision reopens normal checklist
tracking until it is closed again. Every `### Auto-mode decisions` entry must be
reviewed with verification details before completion.

`save_plan` belongs to Spec. It replaces only an untouched pre-execution draft
and appends a dated revision after execution history exists. Once a plan has
execution history or a Close out, follow-up work belongs in a dated `## Revision
N` at the bottom; earlier narrative remains historical, while live checklist
status may be updated. Once execution has begun, the plan name is immutable in code and an
attempted rename fails before any file move.

## Handoffs

`/handoff [session-name]` continues the same artifact in a fresh session, seeded
with the task name and the actionable mode inherited from the outgoing branch.

The replacement session inherits the artifact and nothing else, so `/handoff`
first derives the continuation while current-turn routing signals still exist,
then drives one checkpoint turn in the outgoing session and waits for it. That
turn brings the plan file up to date with everything learned so far. Without it,
a handoff would discard exactly the context it exists to preserve. After the
checkpoint, the replacement reads the latest pending artifact item and starts the
inherited action using only its fresh session context. A just-saved Spec plan
continues in Vibe; active research or implementation keeps its mode. The picker
suppresses itself for the outgoing checkpoint settlement.

## Timing

Each artifact carries a script-owned `time-spent` block with one bucket per mode:
Q&A, Spec, and Vibe, plus unallocated history. Every bucket is Agent work only;
time spent waiting on the User is never billed to a mode. Progress Tracker accrues
the active bucket and closes the interval the moment the mode changes, so a switch
mid-run splits the time correctly.

Markers written before the rename migrate one-to-one — explore becomes Spec and
execute becomes Vibe — while the retired decision bucket folds into unallocated,
so no existing plan loses time.
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
