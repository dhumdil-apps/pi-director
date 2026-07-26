---
name: pi-inspector
description: Debug and verify a local web application through a human-authorized Pi Inspector session using semantic app state, captured evidence, screenshots, and replayable flows. Use for local SPA/browser debugging, reproducing UI bugs, validating browser-facing changes, or collecting evidence after implementation. Do not use for ordinary code-only tests or when no browser behavior is involved.
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
2. Observe before acting:
   - `pi-inspector app` for compact `app:state` semantic state.
   - `pi-inspector events`, `network`, `body`, or `screenshot` only as needed.
   - Use DOM, accessibility, storage, or Vue/Pinia state as debugging fallbacks,
     not as the first interpretation of app behavior.
3. Run `pi-inspector flows` and prefer a named journey with
   `pi-inspector flow run <name> --param k=v`.
4. Use raw navigate/click/type/scroll/eval only when no flow fits. If the same
   journey needs repeated ad-hoc actions, propose or add a target-repo flow.
5. Record the flow name, outcome, relevant semantic state, and captured evidence
   in the task close-out. If Inspector was unavailable, say browser verification
   was not run.

## Boundaries

- Never bypass Human/Agent/Paused/Take Back ownership.
- Never print or persist discovery tokens.
- Treat network bodies, storage, screenshots, and framework state as sensitive.
- A failing flow is either a regression or an intentional behavior change that
  requires the flow to change in the same work.
- Flows wait on `app:state`; do not replace semantic waits with sleeps or DOM
  settling heuristics.
