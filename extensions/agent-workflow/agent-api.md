# Agent Workflow API

Concise UI/API copy and mechanical runtime messages. Operational guidance belongs only in `workflow-steps.md`.

## command.align

Align goal, scope, constraints, and direction before work

## command.spec

Research and propose before changing project files

## command.vibe

Execute the current instruction or approved proposal

## command.mode

Re-open the ALIGN / SPEC / VIBE picker

## command.handoff

Continue the same artifact in a fresh ALIGN session: /handoff [session-name]

## tool.ask.description

Open native option pickers and return completed answers, cancellation state, or a selected Spec/Vibe route.

## tool.ask.prompt-snippet

Ask focused alignment questions with confidence-scored selectable answers

## tool.ask.option.value

Stable value returned for this option.

## tool.ask.option.label

Picker label shown for this option.

## tool.ask.option.description

One-sentence consequence or trade-off shown for this option.

## tool.ask.option.confidence

Integer used to rank this option; 1 is lowest and 5 is highest.

## tool.ask.question.id

Stable question identifier returned with its answer.

## tool.ask.question.context

Supporting context shown beneath the question.

## tool.ask.question.prompt

Question shown in the picker title.

## tool.ask.question.custom-answer-label

Optional intent appended to the Write a custom answer entry.

## tool.ask.question.options

Options offered for this question.

## tool.ask.questions

Questions presented sequentially; an empty list is a no-op.

## tool.start.description

Permanently name the current temporary artifact, or create a linked current-format continuation from a legacy artifact.

## tool.start.name

Task name used for the session and artifact.

## tool.next.description

Record ranked actions for the post-turn picker without changing mode.

## tool.next.action.reason

Optional text shown beside this action.

## tool.next.action.prompt

Follow-up instruction appended after the runtime transition; required for Align, Spec, or Vibe and forbidden for handoff.

## tool.next.actions

Ranked Align, Spec, Vibe, or handoff actions; an empty list opens no picker.

## message.ask.cancelled

The User cancelled with these questions unresolved: {{unanswered}}. Do not repeat them in prose.

## message.ask.routed

The User accepted all remaining best-confidence answers and routed directly to {{mode}}.

## message.kickoff.switch

Switch from {{source}} to {{target}}.

## message.kickoff.continue

Continue in {{target}}.
