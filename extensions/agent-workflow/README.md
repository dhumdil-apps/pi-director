# Agent Workflow

Injects **one guided loop** into every turn — goal, explore, ask, plan, execute,
close out — as a flow contract rather than a rule list. Two guarantees carry the
weight: nothing in the working tree changes before an approved plan, and
questions are cheap. There are no session modes, no derived loop position, and
nothing here is enforced.

[`docs/FLOW.md`](../../docs/FLOW.md) is the canonical human-readable behavior
contract; the injected prompt in `index.ts` is its operational mirror. Generic
craft advice deliberately lives in the project's own `AGENTS.md` — verification
commands, git discipline, and repository conventions all come from there, and
the injected block only tells the agent to read it.

## User surface

- **Auto-scaffold** (`index.ts`, `task.ts`) — an unnamed session's first turn
  creates `.pi/plan/<timestamp>-<first-prompt-words>.md` from `PLAN_TEMPLATE`
  and a `.pi/MEMORY.md` stub, then names the session after it. Best-effort: an
  unwritable cwd is ignored rather than failing the turn, and a resumed or
  `/handoff`-seeded session already has a name and is skipped.
- `ask` (`ask.ts`) — step 3 as a keypress. Takes a question and two to four
  options, each a short **headline** plus a one-sentence **description**, the
  recommendation first. `renderCall` prints the question with every headline and
  its full description into the transcript as the call streams in; the dialog
  itself is a plain `ctx.ui.select` over the headlines alone, so the user reads
  the trade-offs above and only picks a letter. Headlines must be distinct —
  `ui.select` returns the chosen label, not an index. Dismissing is *not* an
  error: the result tells the agent to fall back to asking in prose. Headless
  sessions are refused before the dialog opens, since a non-TUI `select()`
  resolves `undefined` and would look like a dismissal.
- `save_plan` (`task.ts`) — the only workflow tool, called *before* the plan is
  presented. Renames the task to a meaningful name, keeping the leading
  timestamp so plan files stay time-ordered, and moves the file with it. The
  `plan` body is optional: passed, it overwrites the file; omitted, the file the
  agent has been editing is used as-is. Either way the content is echoed in the
  tool result, so the user's decision is made against exactly what is on disk.
  Any Markdown is accepted: the plan's shape is recommended (current state,
  decisions taken, desired state, approach, quirks), not a contract. The agent
  never deletes plan files; legacy `.pi/goal/` files are ignored and preserved.
- **Close-out** is an ordinary edit to the plan file's `## Implementation
  summary` — no tool stands in for it, and nothing marks a task "closed".
  Durable project takeaways are written by the agent straight into
  `.pi/MEMORY.md` — no proposal round-trip.
- **The approval prompt** (`approval.ts`) — a successful `save_plan` for a task
  nobody has approved arms it, and it appears when the turn settles, as a native
  `ctx.ui.select`: *Proceed, handoff, or revise?* The context load picks the
  recommendation (lean → Proceed, loaded → Handoff — the same thresholds that
  colour the `ctx` readout in `context-usage.ts`). Proceed records the approval
  and kicks off execution immediately; Handoff prefills `/handoff <task-name>`
  (only a command handler can spawn a session); Revise or dismissing approves
  nothing. Headless sessions get a displayed message naming the command instead.
  Arming keys on the *task*, so an approved task re-saving a corrected plan stays
  silent while a second task in the same session prompts again. Which task was
  approved is held in memory only: a reload costs one extra prompt, which is
  cheaper than a durable fact plus the derivation that reads it back.
- `/handoff [task-name]` — the only registered command (`handoff.ts`). Spawns a
  fresh session seeded with the task name, plus a kickoff naming the plan path.
  Because `.pi/plan/` accumulates, resolution never assumes a single file:
  explicit name, then session name, then a lone remaining file — several files
  mean it asks (`resolvePlanTask` in `task.ts`, shared with the approval prompt).

## Notes

- The workflow block stays near the start of extension load order for provider
  prefix-cache reuse, and is a module constant with no per-turn interpolation —
  nothing varies, so the whole prompt prefix stays cacheable. `index.test.ts`
  asserts byte-identity across differing first prompts.
- The behavior contract is documented in [docs/FLOW.md](../../docs/FLOW.md);
  the injected prompt in `index.ts` carries the full operational detail. Behavior
  changes must update both plus the contract tests together.

## Origin

Bundle-local.
