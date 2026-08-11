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
call. Before settling, the Agent can use `recommend_next` to record the turn's
outcome and a concise reason without changing mode. Spec/Vibe actions may also
carry a custom kickoff when they start an Agent turn. The runtime combines that
outcome with live plan and context state to make one action explicit and recommended:

- Q&A asks every unresolved question in the current turn through `ask`; unresolved
  or cancelled alignment settles directly back to the editor without a redundant
  Q&A-to-Q&A picker. Once alignment is complete, `recommend_next` opens tailored
  `🔎 Spec — Research the open questions` or `🚀 Vibe — Start implementing the request`
  routing. Explicit `/mode` remains available and leaves Q&A unmarked when there
  is no task-specific route.
- Spec offers `🔎 Spec — Keep researching the plan` or `❓ Q&A — Clarify the next
decision`; a successful `save_plan` offers `🚀 Vibe — Start implementing the plan`.
  Spec transitions use the Agent's custom kickoff when supplied, so the next turn
  starts with the specific research already identified.
- Vibe offers `🚀 Vibe — Keep implementing`, `❓ Q&A — Clarify the next decision`, or
  `🔎 Spec — Research the remaining questions`. A marked phase boundary becomes
  `🤝 Hand off next phase` from Q&A, Spec, or Vibe when checklist work remains;
  context pressure can also recommend the User-selected handoff from any mode.
- Selecting any cross-mode action persists the User's mode choice. Spec and Vibe
  destinations trigger an extension-generated continuation; an Agent-authored
  kickoff is included when supplied, otherwise the runtime derives an
  option-aligned kickoff from the selected mode and the first pending artifact
  item. Cross-mode Q&A returns to the editor and waits for input without a hidden
  kickoff. Continuing Q&A does the same. Secondary actions use emoji-prefixed,
  plan-aware labels that include the first pending checklist item.
- `🤝 Hand off to a fresh session` remains available while work is open and prepares
  `/handoff <name>` in the editor. Handoff still requires Enter and checkpoints
  the artifact before replacement. It then inherits the selected action: an
  explicit Spec/Vibe route wins, a just-saved Spec plan advances to Vibe, and
  in-progress Spec or Vibe continues in place with the latest pending item.
- After all cumulative checklist items are complete, Continue and Handoff are
  omitted; the picker offers only cross-mode new-direction routes without marking
  one recommended because no task-specific next step exists. `📝 Write a custom
answer... (🚀 Vibe)` is the only same-mode path: it returns to the editor with the
  mode untouched so the User can tailor the next instruction. While work remains,
  its suffix includes the active continuation intent, such as `(🔎 Spec — Keep
researching the plan)`.
- The contextual `📝 Write a custom answer...` option and dismissal are the same
  escape hatch: control returns to the editor with the mode untouched.

Recommended options use a mode-prefixed plain-language action and may include the
Agent's concise reason, such as `🚀 Vibe — Start implementing the plan — verify the
API`, with the recommendation marker appended. If the Agent omits `recommend_next`,
the runtime uses the first pending cumulative checklist item as context when
available; otherwise it conservatively recommends continuing Spec or Vibe while
work is open. Q&A requires an explicit completed-alignment route. When no work
remains, no generic action is marked recommended. Recommendations expire at the
next User message and never carry into a later turn.

`/questionnaire`, `/spec`, and `/vibe` switch mode directly when the picker itself is
unavailable, and `/mode` re-opens it. `/questionnaire` waits for the next User input;
`/spec` and `/vibe` start the same extension-generated continuation as picker transitions.

The mode picker routes work after a turn; `ask` gathers concrete alignment
questions inside a turn from any interactive mode. It presents 1–4 native option
pickers, shows the Agent's recommended answer first, and identifies its displayed
choices as A, B, C, or D in that order. Ordinary selections retain their stable
values and original labels; custom input includes the displayed letter-to-label key
so the Agent can interpret references such as “combine A and B” before settlement.
When a decision needs a user-supplied value, authors direct the User to the built-in
`📝 Write a custom answer...` entry rather than adding a selectable “specify” option
that cannot open an input field. The public schema requires
`recommended: true` on exactly one option per question and permits omission on the
others. Every picker also offers `Use recommended → Spec` and `Use recommended →
Vibe`. Either explicit User action preserves prior manual answers, accepts the
remaining recommendations, persists the selected mode, and queues a target-mode
turn that records the accepted decisions before working. Batch only independent
questions whose wording and options remain valid regardless of sibling answers;
dependent follow-ups require a fresh `ask` call after the earlier answer. Q&A
should keep this exchange conversational and question-first; a recommendation is
guidance only, not permission to skip unresolved alignment.
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
