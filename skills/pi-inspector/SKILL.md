---
name: pi-inspector
description: Debug and verify a local web application through a human-authorized or explicitly plan-approved full-auto Pi Inspector session using semantic app state, captured evidence, screenshots, and replayable flows. Use for local SPA/browser debugging, reproducing UI bugs, validating browser-facing changes, or collecting evidence after implementation. Do not use for ordinary code-only tests or when no browser behavior is involved.
---

# Pi Inspector

Use Pi Inspector as browser truth while repository tools remain the source of
code, backend, and process truth.

## Workflow

1. Establish authorization.
   - If the approved implementation plan explicitly includes full-auto browser work,
     start the target first with its documented repository shell command, then run
     `pi-inspector launch --full-auto --project <id>`. The launcher must start the
     source-beta GUI and return a fresh session without a human click.
   - Otherwise, run `pi-inspector session status`. On exit `3`, ask the human to start
     Pi Inspector and enable Agent Mode; do not launch it autonomously.
   - Exit `4`: the Kill switch was activated. Stop and wait for a new prompt; never relaunch
     or re-arm full-auto authority from the old approval.
   - Exit `5`: actions are paused. Continue read-only observation, but do not act or
     relaunch to bypass Pause.
2. Observe before acting:
   - `pi-inspector app` for compact `app:state` semantic state.
   - `pi-inspector events`, `network`, `body`, or `screenshot` only as needed.
   - Use storage, Eval, or the run bundle as debugging fallbacks, not as the first
     interpretation of app behavior.
3. Run `pi-inspector flows` and prefer a named journey with
   `pi-inspector flow run <name> --param k=v`. Flow suites are Human-only;
   an Agent must run named flows rather than sweep `--all` or a tag.
4. Read `pi-inspector run show last` for the verdict, the API requests the run triggered
   (attributed to the step that caused them), console output, and backend log lines.
5. Use raw navigate/click/type/scroll/eval only when no flow fits. If the journey is worth
   repeating, draft it with `pi-inspector flow scaffold <name> -o <flows-dir>/<name>.json`.
6. Record the flow name, outcome, relevant semantic state, and captured evidence
   in the task close-out. If Inspector was unavailable, say browser verification
   was not run.

## Boundaries

- Never bypass Human/Agent/Paused/Kill switch ownership. Full-auto is permitted only
  when the current approved plan explicitly names unattended browser work.
- Full-auto authorizes browser control only. Start targets through ordinary approved
  repository shell commands; Inspector never owns target, shell, or Docker processes.
- Quitting or killing Inspector is the external full-auto kill switch. Do not add or
  use an Agent-side stop/re-arm path, and do not restart after the Kill switch is turned OFF.
- Never print or persist discovery tokens.
- Treat network bodies, storage, screenshots, and framework state as sensitive.
- A failing flow is either a regression or an intentional behavior change that
  requires the flow to change in the same work.
- Flows wait on `app:state`; do not replace semantic waits with sleeps or DOM
  settling heuristics.
