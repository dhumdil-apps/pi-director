# Agent Workflow

The injected block in [`index.ts`](index.ts) is the behavior contract. This page
only describes it; where they disagree, the block wins.

## The loop

Injected into every turn: **Align → Explore ↔ Align → Execute ↔ Align → Close
out**. Explore and Execute are the sustained work modes. Align is a short,
User-visible checkpoint that confirms intent, records consequential decisions,
and chooses the next mode. Two guarantees carry the loop — nothing in the
working tree changes until the User has approved a plan, and decisions are
cheap. It is scale-invariant: a one-line change gets a one-line plan.
Nothing is enforced.

Execute keeps the plan file current rather than only the transcript: checklist
boxes are ticked as they land and deviations are written into the plan, because
the plan file is the only thing a `/handoff` or a later session carries. Close-out
starts from that file — every box ticked, or marked skipped or failed, saying the
same thing the report says. A costly surprise goes into its `## Quirks` when it
lands, before long context or compaction can erase it.

## Tools

- `ask` (`ask.ts`) — the cheap initial or adaptive Align checkpoint. Initial
  Align happens before source discovery and confirms the smallest useful scope;
  adaptive Align is reserved for decisions that materially change the next work
  interval. The tool offers two to four options, each a short headline plus a
  one-sentence description, recommendation first. Presenting the picker opens a
  context-free checkpoint entry; normal selection, dismissal, or failure closes
  it. User response latency accrues to Decision while active work is paused.
  A final "Write custom answer..."
  option is appended to the picker so the User can close it and type directly
  without triggering a new model call. That checkpoint remains open until the
  next human input supplies or cancels the answer, including after reload. The
  full Q&A is printed in the transcript by `renderCall`; the dialog below is a
  plain `ctx.ui.select` over the headlines alone, so answering is one keypress.
  Headlines must be distinct — `ui.select` returns the label, not an index.
  Dismissing is not an error; headless is refused before the dialog, since a
  non-TUI `select()` resolves `undefined` and would look the same.
- `save_plan` (`task.ts`) — presents the plan and renames the session, keeping
  the leading timestamp so `.pi/plan/` stays time-ordered. Before approval, a
  passed complete `plan` replaces the draft so the User always reviews one
  coherent proposal. Once the approval kickoff appears on the session branch,
  passed changes append under `## Revision <n> — <date>`, preserving the approved
  plan and the material scope change. An empty file or pristine scaffold takes
  the body outright, and an already-present approved revision changes nothing.
  Omit `plan` to present what the agent wrote there with `edit`; either way the
  content is echoed inline, so the decision is made against exactly what is on disk.

Close-out has no tool. It promotes durable orientation and quirks captured in the
plan into project memory, which the agent writes directly. Close-out consolidates;
it does not try to recall a whole session at the end. A new fact replaces the entry
it supersedes, so memory stays a map instead of growing into a changelog. Ordinary
close-out never advances the hidden `memory-review` marker; only `/init` certifies
a deliberate knowledge pass.

## Starting from what is already known

Initial Align uses the request, loaded instructions, existing session context,
and at most one bounded project-memory read where the project's `AGENTS.md`
requires it. Source discovery waits until the scope checkpoint resolves. Explore
then verifies memory's orientation and quirks rather than starting from zero.
For Pi behavior, Explore checks local source and focused tests before Pi-core
documentation; opening host docs requires a named API question that local
evidence did not answer. Entries are *leads to verify, not facts* and carry no
per-entry confidence or staleness tags that can rot. The single hidden review
marker has a narrower role: it records only a deliberate `/init` audit.
The read-only project-memory extension ignores knowledge-only commits and warns
when relevant Git state has moved. Code remains authoritative, and an entry
disproved during ordinary work is corrected immediately rather than waiting for
the next audit.

## Surfaces

- **Auto-scaffold** (`index.ts`) — an unnamed session's first turn creates
  `.pi/plan/<timestamp>-<first-prompt-words>.md` from `PLAN_TEMPLATE` and a
  `.pi/MEMORY.md` stub — orientation and quirks — then names the session after
  it. The plan includes a script-owned `time-spent` block below its title;
  Progress Tracker updates exact Explore and Execute work plus aggregate capped
  Decision latency whenever a run settles or checkpoint resolves. The visible
  block prints the same breakdown for human review. `save_plan` preserves that
  block while replacing Agent-authored sections, and approval identity excludes
  it so a timer tick cannot trigger a new decision. Historical `planMs` is folded
  into Explore; legacy total-only blocks migrate into Unallocated; marker-free
  plans start at zero when next saved or settled. The memory stub is written only
  when absent, so an existing memory is never reshaped. Best-effort: an
  unwritable cwd is ignored rather than failing the turn.
- **The approval picker** (`approval.ts`) — a successful `save_plan` whose plan
  file differs from the last approved contents arms it (a SHA-256 digest, since
  the session name is immutable and keying on it would allow only one decision
  per session; an unchanged re-save is a mid-implementation correction and stays
  silent); it opens when the turn settles: *Proceed,
  handoff, or revise?* Context load picks the recommendation (lean → Proceed,
  loaded → Handoff). Proceed kicks off execution; Handoff prefills
  `/handoff <session-name>`; Revise or dismissing approves nothing. The picker
  is an `approval` checkpoint with Proceed/Handoff/Revise/dismissed outcomes.
  Headless sessions get a context-free notice entry naming the command instead,
  also written to stderr in print mode. Which task was approved — and the digest
  of what was approved — is held in memory only, so a reload costs one extra
  prompt. Display mode is separate: post-execution human
  input records `explore` and approval records `execute`; these are custom
  session entries excluded from model context. Historical `plan` entries map to
  Explore. Reloads recover the latest revision cycle rather than treating the
  first approval as permanent.
- `/handoff [session-name]` (`handoff.ts`) — spawns a fresh session seeded with
  the name, a display-only `execute` phase entry, and a kickoff naming the plan
  path. The phase is seeded before replacement-session extensions initialize;
  the kickoff remains the model's instruction. Resolution: explicit name, then
  session name, then a lone remaining plan — several mean it asks which. Headless
  resolution errors use the same context-free notice path and print-mode stderr.

Plan files are never deleted by the agent; `.pi/plan/` is the user's to keep,
archive, or prune, and legacy `.pi/goal/` files are ignored and preserved.

## Origin

Bundle-local.
