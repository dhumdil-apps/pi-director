---
name: pi-inspector
description: Debug and verify a local web application through a human-authorized Pi Inspector session using regression suites, semantic app state, and step-scoped evidence. Use for local SPA/browser debugging, running repo-owned QA journeys, validating browser-facing changes, or collecting evidence after implementation. Do not use for ordinary code-only tests or when no browser behavior is involved.
---

# Pi Inspector

Use Pi Inspector as browser truth while repository tools remain the source of
code, backend, and process truth.

## Workflow

1. Detect authorization with `pi-inspector session status`.
   - Exit `3`: no active session. Ask the human to start Pi Inspector and enable
     Agent Mode; do not attempt to start it yourself.
   - Exit `4`: the human took control. Stop and wait for a new prompt.
   - Exit `5`: actions are paused. Continue read-only observation, but do not act.
2. Read `pi-inspector flows` and `pi-inspector suites`, then run the smallest
   relevant catalog entry:
   - `pi-inspector flow run <name> --param k=v`
   - `pi-inspector suite run <name>`
3. Diagnose the returned run report first. Use `pi-inspector run show <id>` to
   revisit its step-scoped screenshots, semantic before/after state,
   console/network findings, and failure artifacts.
4. Use `pi-inspector app`, `events`, `network`, `body`, `interactive`,
   `storage-summary`, or `screenshot` only when the run packet is insufficient.
5. Use raw navigate/click/type/fill/scroll/eval only when no flow fits. If the same
   journey needs repeated ad-hoc actions, propose or add a target-repo flow.
6. Record the suite/flow name, run ID, outcome, failed step, relevant semantic
   state, and captured evidence
   in the task close-out. If Inspector was unavailable, say browser verification
   was not run.

## Boundaries

- Never bypass Human/Agent/Paused/Take Back ownership.
- Never print or persist discovery tokens.
- Treat network bodies, storage, screenshots, and framework state as sensitive.
- A failing flow is either a regression or an intentional behavior change that
  requires the flow to change in the same work.
- Flows wait on journaled `app:state`; do not replace semantic outcomes with
  sleeps or DOM-settling heuristics.
