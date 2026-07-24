# The working flow

This is the canonical behavior contract for Pi's workflow. The Agent Workflow
extension injects its operational mirror into every turn; that injected prompt
(in `extensions/agent-workflow/index.ts`) is the operational source of detail.
Behavior changes must update this document, the injected prompt, and its
contract tests together. Project-level `AGENTS.md` files own project-specific
stack and repository conventions.

## Guidance, not rules

The injected block is written as narrative: each guideline sits inside the loop
step it serves, together with the reason it exists, so the agent can tell when
it does not apply. It says so explicitly — these are defaults, and when they
conflict with what the repository, the tests, or the user actually show, the
agent's judgment wins and it says out loud which guidance it set aside and why.
Nothing here is enforced: the bundle ships no permission gate.

There are **no session modes**. One loop runs per task, and position in it is
derived from what has happened, not declared by a mode the model or the user
switches.

## The loop

1. **Goal** — the user says what they want. The request is the scope. Pi reads
   the project's `AGENTS.md`, and `.pi/MEMORY.md` when it exists, before
   touching anything.
2. **Explore** — Pi reads the code before forming an opinion about it: the files
   the task touches, plus their callers and tests, on every task regardless of
   size. Questions are asked only for the genuine open choices exploration
   surfaced, in ordinary messages. When exploration settles everything, the plan
   comes directly.
3. **Plan** — a good plan covers the **current state** (how it works today), the
   **decisions taken** (the questions asked and how they were answered, so the
   reasoning survives into another session), the **desired state** (what it
   should do instead), the **approach** (how to get from one to the other), and
   the **quirks** (non-obvious constraints, gotchas, and key paths worth
   carrying into a handoff). Those are topics worth covering, not a form to fill
   in: the plan is shaped to the task, and `save_plan` accepts any Markdown.
4. **Save, then proceed** — Pi calls `save_plan` *before* presenting the plan, so
   the plan on screen always exists on disk. It presents the same content, ends
   with **Proceed, handoff, or revise?**, and stops. Once a plan is approved,
   execution needs no further approval.
5. **Close out, or plan again** — `save_summary` appends the honest close-out to
   the plan file, and durable takeaways go straight into `.pi/MEMORY.md`. A
   blocker that invalidates the plan goes back to the user at step 1.

Progress Tracker shows where the work is above the editor, as the agent's own
short phrase, next to context usage. The loop text is stable within a session
and the single position line comes last, so provider prefix-cache reuse holds.

## Position is derived, not declared

Two hidden branch facts carry the position, both written by the extension:

- **approved** — the user approved a task's plan (Proceed, or `/handoff` seeding
  the new session).
- **closed** — `save_summary` wrote that task's close-out.

A task with an approval and no matching close-out is being implemented;
otherwise the session is somewhere in steps 1 to 4. This is per *task*, not per
session: a second task in the same session gets its own approval, and a
close-out ends only the task it names. The branch is the only durable store, so
state is re-derived every turn — which is also how a `/handoff`-seeded session
knows its position before its first turn. Sessions started before this rework
carry the retired mode marker instead; an implement-mode marker there is read as
an approval of that session's task.

## The approval prompt

A successful `save_plan` for a task nobody has approved arms a native prompt,
delivered when the turn settles:

- **Proceed** — record the approval and start executing here, immediately. The
  prompt recommends this while the context is lean.
- **Handoff** — prefills `/handoff <task-name>`; Enter spawns a fresh session
  seeded with the approval fact and task name, plus a kickoff naming the plan
  path. Recommended once the context is loaded (past 100k tokens or 40% full).
- **Revise** (or dismissing the prompt) — nothing is approved; revise and save
  again, which overwrites the same file.

Headless runs get a displayed message naming the `/handoff` command instead.

Re-saving a plan for a task that is **already approved** is a normal
mid-implementation correction: it overwrites the file silently and no prompt
appears. A `save_plan` for a *different* task does prompt again — that is a new
loop. There is deliberately no implement-to-plan transition to undo.

Plan files are **never deleted by the agent** — not at close-out, not on
success. `.pi/plan/` is the user's to keep, archive, or prune; because it
accumulates, resolution never assumes a single file: the explicit name wins,
then the session name, and only a lone remaining file is picked implicitly —
otherwise it asks which. Legacy `.pi/goal/` files are ignored and preserved.

## Autonomous runs

There is no managed autonomous mode. To run Pi without this bundle — no workflow
guidance and **no safety guardrails** — start it with `pi --no-extensions`
(`-ne`). This is raw Pi, deliberately not a supervised "keep going" mode.

## Reflection and durable learning

Close-out has two halves. `save_summary` appends `## Implementation summary` to
the plan file — what changed, what verification actually ran and what it
reported, and every check skipped or failed; re-running it replaces that section
rather than stacking another one. Then anything durably true about the project —
a convention learned, a trap hit, a decision worth keeping — is written straight
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
