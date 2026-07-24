# Agent Workflow

Injects **one guided loop** into every turn — goal, explore, plan,
save-then-proceed, close — written as narrative rather than a rule list: each
guideline sits inside the step it serves, with the reason it exists, and the
block says plainly that these are defaults the agent may set aside out loud.
There are no session modes. The loop is guidance only; nothing here is enforced.

[`docs/FLOW.md`](../../docs/FLOW.md) is the canonical human-readable behavior
contract; this extension's injected prompt is its operational mirror and the
source of operational detail. Verification commands, git discipline, and
repository conventions come from the project's own `AGENTS.md` — the injected
block defers to it and only supplies a fallback (ask before anything destructive
or irreversible) for projects without one.

## User surface

- `save_plan` (`task.ts`) — called *before* the plan is presented, so the plan on
  screen always exists on disk. Normalizes the task name, names the session, and
  writes `.pi/plan/<task-name>.md`. Any Markdown is accepted: the plan's shape is
  recommended (current state, decisions taken, desired state, approach, quirks),
  not a contract. Re-saving after a revision overwrites the same file. The agent
  never deletes plan files; legacy `.pi/goal/` files are ignored and preserved.
- `save_summary` (`task.ts`) — the close-out. Appends `## Implementation summary`
  to the task's plan file, replacing a previous summary rather than stacking
  another one, and records the close-out fact. It never renames the session.
  Durable project takeaways are written by the agent straight into
  `.pi/MEMORY.md` — no proposal round-trip.
- **The approval prompt** (`approval.ts`) — a successful `save_plan` for a task
  nobody has approved arms it, and it appears when the turn settles, as a native
  `ctx.ui.select`: *Proceed, handoff, or revise?* The context load picks the
  recommendation (lean → Proceed, loaded → Handoff — the same thresholds that
  colour the `ctx` readout). Proceed records the approval and kicks off execution
  immediately; Handoff prefills `/handoff <task-name>` (only a command handler
  can spawn a session); Revise or dismissing approves nothing. Headless sessions
  get a displayed message naming the command instead. Arming keys on the *task*,
  so an approved task re-saving a corrected plan stays silent while a second task
  in the same session prompts again.
- `/handoff [task-name]` — the only registered command (`handoff.ts`). Spawns a
  fresh session seeded with the approval fact and task name before its first
  turn, plus a kickoff naming the plan path; executing from a handoff is
  auto-approved. Because `.pi/plan/` accumulates, resolution never assumes a
  single file: explicit name, then session name, then a lone remaining file —
  several files mean it asks (`resolvePlanTask` in `task.ts`, shared with
  `save_summary` and the approval prompt).

## Position in the loop (`loop.ts`)

Position is derived, never declared. Two hidden branch facts — `approved` and
`closed`, each naming a task — are the whole state; a task with an approval and
no matching close-out is being implemented. Because the branch is the only
durable store, state is re-derived on every turn and never cached at extension
load: a `/handoff`-seeded session's extension instance loads before its fact is
appended. Sessions from before the rework carry the retired
`agent-workflow:mode` marker, and an implement-mode marker there is read as an
approval of that session's task.

## Notes

- The workflow block stays near the start of extension load order for provider
  prefix-cache reuse. The loop text is constant within a session; only the single
  `<position>` line, appended after it, changes — so the cacheable prefix never
  moves.
- The behavior contract is documented in [docs/FLOW.md](../../docs/FLOW.md);
  the injected prompt in `index.ts` carries the full operational detail.

## Origin

Bundle-local.
