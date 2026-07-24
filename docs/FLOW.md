# The working flow

This is the canonical behavior contract for Pi's workflow. The Agent Workflow
extension injects its operational mirror into every turn; that injected prompt
(in `extensions/agent-workflow/index.ts`) is the operational source of detail.
Behavior changes must update this document, the injected prompt, and its
contract tests together. Project-level `AGENTS.md` files own project-specific
stack and repository conventions.

## Two guarantees

The flow exists because unplanned changes and silent assumptions produce bad
outcomes. Everything below serves two promises:

- **Nothing in the working tree changes until the user has approved a plan.**
- **Questions are cheap.** The agent asks even when the answer looks obvious,
  because obvious-to-the-agent is exactly where the expensive misreads live.

Every other line in the injected block has to earn its place against those two.
Generic craft advice — smallest change, prefer existing utilities, read callers
first, baseline checks, portable commands, secrets — deliberately does **not**
live here. It belongs in the project's `AGENTS.md`, which the injected block
already tells the agent to read, so it is stated once rather than duplicated.

What cannot live in `AGENTS.md` is the loop itself: the shape of the session,
and the promise that the user gets asked before anything happens.

Nothing here is enforced: the bundle ships no permission gate. There are also
**no session modes** and no derived loop position — the injected block is a
constant, so the whole prompt prefix stays cacheable.

## The loop

1. **Goal** — the user says what they want. The request is the scope. Pi reads
   the project's `AGENTS.md`, and `.pi/MEMORY.md` when it exists, before
   touching anything. The first message of a fresh session also scaffolds
   `.pi/plan/<timestamp>-<first-prompt-words>.md` from a placeholder template
   (and a `.pi/MEMORY.md` stub when absent), so the task has a living document
   from the start rather than one that appears at the planning step.
2. **Explore** — Pi reads the code before forming an opinion about it: the files
   the task touches, plus their callers and tests, on every task regardless of
   size.
3. **Ask** — Pi surfaces every choice it would otherwise make on the user's
   behalf, in ordinary messages, naming concrete options and a recommendation
   rather than asking open-ended questions. A question costs a sentence; a wrong
   plan costs the whole task.
4. **Plan, then stop** — a good plan covers the **current state** (how it works
   today), the **decisions taken** (the questions asked and how they were
   answered, so the reasoning survives into another session), the **desired
   state**, the **approach**, and the **quirks** (non-obvious constraints,
   gotchas, and key paths worth carrying into a handoff). Those are topics worth
   covering, not a form to fill in. `save_plan` writes the plan when one is
   passed (omitting it presents the file as the agent already wrote it), renames
   the task to something meaningful — keeping the leading timestamp, so
   `.pi/plan/` stays time-ordered — and **echoes the file's content inline** so
   the decision is made against exactly what is on disk. Pi presents the same
   content, ends with **Proceed, handoff, or revise?**, and stops.
5. **Execute** — once approved, Pi carries the plan out without asking again. A
   blocker nobody knew about at planning time is reported rather than guessed
   past. Re-saving a corrected plan mid-implementation is normal.
6. **Close out** — Pi writes into the plan file's `## Implementation summary`
   what changed, what verification actually ran and what it reported, and every
   check skipped or failed. Then anything durably true about the project goes
   into `.pi/MEMORY.md`. A blocker that invalidates the plan goes back to step 1.

`save_plan` is the bundle's only workflow tool. Close-out is an ordinary edit to
the plan file — no tool stands in for it, and nothing marks a task "closed".

Progress Tracker shows whether a run is in flight and how loaded the context is,
above the editor. It ships no todo tool: Pi has none on purpose ("they confuse
models"), and what the agent is doing is already visible in the transcript.

## The approval prompt

A successful `save_plan` for a task nobody has approved arms a native prompt,
delivered when the turn settles:

- **Proceed** — start executing here, immediately, with a kickoff message naming
  the concrete plan path. The prompt recommends this while the context is lean.
- **Handoff** — prefills `/handoff <task-name>`; Enter spawns a fresh session
  seeded with the task name plus a kickoff naming the plan path. Recommended
  once the context is loaded (past 100k tokens or 40% full).
- **Revise** (or dismissing the prompt) — nothing is approved; revise and save
  again, which overwrites the same file.

Headless runs get a displayed message naming the `/handoff` command instead.

Which task the user approved is held **in memory**, in the extension instance,
for one purpose only: re-saving a plan for an already-approved task is a normal
mid-implementation correction and must not prompt again. A `save_plan` for a
*different* task does prompt — that is a new loop. Because the record is
in-memory, a reload or `/tree` navigation costs one extra prompt; that is
cheaper than a durable fact plus the derivation that reads it back. There is
deliberately no implement-to-plan transition to undo.

Because every session scaffolds a file, `.pi/plan/` accumulates skeletons for
sessions that went nowhere; nothing is auto-pruned, and the chronological names
make manual pruning easy. Plan files are **never deleted by the agent** — not at
close-out, not on success. `.pi/plan/` is the user's to keep, archive, or prune;
because it accumulates, resolution never assumes a single file: the explicit
name wins, then the session name, and only a lone remaining file is picked
implicitly — otherwise it asks which. Legacy `.pi/goal/` files are ignored and
preserved.

## Autonomous runs

There is no managed autonomous mode. To run Pi without this bundle — no workflow
guidance and **no safety guardrails** — start it with `pi --no-extensions`
(`-ne`). This is raw Pi, deliberately not a supervised "keep going" mode.

## Reflection and durable learning

Close-out has two halves. The plan file's `## Implementation summary` records
what changed, what verification actually ran and what it reported, and every
check skipped or failed; re-writing it replaces that section rather than
stacking another one. Then anything durably true about the project — a
convention learned, a trap hit, a decision worth keeping — is written straight
into `.pi/MEMORY.md`, with no permission round-trip. When the task produced
nothing durable, Pi writes nothing and says so: a one-off event is not a
learning.

For a deeper review, ask for one in plain chat — no command or extension is
involved:

> Reconstruct a causal timeline of this session: what I asked, what you did,
> where friction or rework happened, and why. Cite the specific turns and tool
> calls you can see, then surface any durable takeaway worth recording in
> `.pi/MEMORY.md`.

Pi reasons over the session it can see in context, so this is a qualitative
reconstruction, not an instrumented report.
