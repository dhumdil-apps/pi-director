# Agent Workflow

The injected block in [`index.ts`](index.ts) is the behavior contract. This page
describes its runtime surfaces and persistence; where they disagree, the block
wins.

## Two independent axes

The first prompt of a new interactive session opens a native mode picker:

- **Vibe** builds continuously and keeps a compact work log. It has no workflow
  approval step.
- **Spec** explores and presents every requested implementation increment for
  Proceed/Handoff/Revise approval.

The choice is session-wide and survives reloads, forks, new goals, and handoffs.
Only `/vibe` and `/spec` change it. Those commands update future behavior and
the persistent activity badge without triggering a model turn. Dismissed,
headless, and legacy mode-less sessions default to Spec.

Mode is separate from artifact kind:

- **Implementation** changes the project and has close-out PR/QA evidence.
- **Investigation** maintains Question, Align, Scope, Findings, Conclusion,
  Quirks, and Checklist, then reports without execution approval.

The common loop remains **Context pass → Align → Explore ↔ Align → Execute ↔
Align → Close out**. Explore and Execute are work phases; Align is a timed
User-visible checkpoint, not another mode.

## Starting and asking

Before source discovery, the Agent is limited to the request, loaded
instructions, existing session context, bounded orientation memory, and exact
likely historical-plan lookups. It then calls `start_task` with a
context-informed name and implementation/investigation intent. The tool renames
the temporary scaffold, applies the selected template, and preserves the prior
artifact when a distinct goal starts. Implementation following an investigation
keeps and cites the investigation as before.

`ask` owns consequential decisions only. It renders evidence, recommendation,
why the choice matters, and two to four distinct options before opening a native
headline picker. Vibe asks nothing by default and permits at most one direction
question per work interval when the visible outcome would materially differ.
Spec uses one compact initial Align and adaptive asks only when the next work
interval, scope, ownership, acceptance, or an irreversible choice changes.

Question, approval, and initial-mode pickers create persisted checkpoint events.
Their User wait pauses active work and accrues capped Align latency. Custom
answers remain open until the next human input.

## Vibe

Vibe implementation artifacts contain Goal, Direction, Work log, Quirks,
Checklist, and Close out with PR summary and QA steps. The Agent edits this log
directly, implements, verifies, and closes out in the same turn. It never calls
`save_plan` and the tool rejects accidental Vibe use.

Every later User request inherits Vibe regardless of size until `/spec`. Normal
destructive-action, dependency, credential, or external-write permission still
applies; it authorizes the action rather than changing workflow mode. Human
input records Explore and the first edit/write records Execute.

In Vibe, `/execute [session-name]` immediately continues the resolved work log.
`/handoff [session-name]` creates a fresh Vibe session with the same task name,
log path, and Execute display phase. Neither command opens plan approval.

## Spec

Spec implementation artifacts retain Goal, Current state, Align, Decisions,
Desired state, Approach, Quirks, Checklist, and Close out. `save_plan` persists
and echoes the complete proposal, aborts the Agent turn, and opens the settlement
picker:

- `Proceed — execute this plan` authorizes and executes in the current session.
- `Handoff — execute in a fresh session` transfers the authorized plan and Spec
  mode to a lean replacement session.
- `Revise — return to Explore` keeps source changes blocked.

Every ordinary User input starts a new Spec authorization interval. Read-only
exploration and direct `.pi/plan/` or `.pi/MEMORY.md` maintenance remain
available, but project `edit` and `write` calls are blocked until the current
proposal is approved. Shell or unknown custom mutation cannot be classified
reliably, so it produces one visible warning per unapproved interval. The model
contract remains the primary guard for those tools.

After a Spec run settles, any later User-requested mutation—small polish
included—must be a dated revision and receive fresh approval. Fixes found during
the uninterrupted approved run that are necessary to satisfy its contract stay
automatic. Once approved, a plan name is immutable in code; attempted renames
fail before any file move or rewrite.

`/execute` and `/handoff` reopen the same native review for Spec. The former
recommends current-session Proceed when context is lean; the latter recommends
Handoff. A loaded context or an implementation derived from an investigation
also recommends Handoff.

## Artifacts, timing, and memory

An unnamed first turn creates a timestamped temporary plan plus `.pi/MEMORY.md`
when absent. `start_task` replaces only an untouched scaffold; a genuinely
distinct existing task stays in the accumulating User-owned `.pi/plan/` archive.
Plan files are never deleted automatically.

Each artifact includes a script-owned `time-spent` block. Progress Tracker
records mutually exclusive Explore/Execute work and capped Align latency.
`save_plan` and approval hashing exclude timing changes, so a timer write cannot
reopen review. Starting a distinct artifact resets live timing while preserving
the earlier file.

Close-out edits the current artifact directly and never calls `save_plan`.
Implementation fills PR summary and QA steps; investigation fills findings and
conclusion. The final report names verification, limitations, unresolved
concerns, and skipped or failed checks without deciding acceptance for the User.
Only durable orientation or costly quirks are promoted to project memory, and
ordinary close-out never advances the hidden `memory-review` marker.

## Evidence policy

Use the smallest useful evidence and review diff. Add tests when they protect a
non-obvious externally observable rule or regression, not to restate prose or
implementation details. Local source and focused tests lead; memory and
historical plans are bounded leads to verify. Pi-core documentation is opened
only for a named host-API question local evidence cannot answer.

## Origin

Bundle-local.
