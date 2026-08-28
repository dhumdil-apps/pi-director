# Maintainer notes

Operational workflow contract: `extensions/agent-workflow/workflow-fsm.ts` (see `WORKFLOW_FSM_VERSION`).

The old v2.1.1 transition audit that previously lived here is retired. For the v2.2.0→v2.3.0 full-stack review and accepted fix set, see:

`.pi/plan/2026-08-25T11:10:01-review-director-fsm.md`

After FSM edits: `npm run build:content` and open `extensions/agent-workflow/workflow-fsm.html`. Residual optional work (not scheduled): executable `receive`/`dispatchSettlement` tests.
