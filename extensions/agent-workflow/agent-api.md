# Agent Workflow API

Runtime copy and tool-schema descriptions. Operational flow belongs only in `workflow-steps.md`.

## command.align

Align goal, scope, constraints, and direction before work

## command.spec

Research and propose before changing project files

## command.vibe

Execute the current instruction or approved proposal

## command.mode

Re-open the ALIGN / SPEC / VIBE picker

## command.handoff

Checkpoint the artifact and continue it in a fresh ALIGN session: /handoff [session-name]

## tool.ask.description

Open native option pickers for Agent-authored questions. The Agent owns question count, option quality, confidence scoring, identifiers, and completed User-transcript persistence. Ordinary answers stay in the current turn; Proceed-with-best routes settle first, then start a correctly modeled Spec or Vibe turn.

## tool.ask.prompt-snippet

Ask focused alignment questions with confidence-scored selectable answers

## tool.ask.prompt-guidelines

- In Align, make ask the first User-facing action. In Spec or Vibe, reserve ask for a genuine consequential or safety-boundary choice.
- Prefer 1-4 independent questions with 2-3 concrete options scored from 1 through 5. Ask dependent follow-ups after incorporating the earlier answer.
- Keep identifiers and labels distinct, and never reuse native action labels.
- Call ask without sibling tools so a direct Spec/Vibe route can terminate cleanly.
- Use customAnswerLabel when the User needs to supply details; do not add a selectable option that merely says “specify”.

## tool.ask.option.value

Stable concise value returned for this option.

## tool.ask.option.label

Distinct concise picker label that does not imitate a native action.

## tool.ask.option.description

One sentence explaining the consequence or trade-off.

## tool.ask.option.confidence

Confidence in this option; use the instructional scale from 1 (lowest) through 5 (highest).

## tool.ask.question.id

Stable artifact-local Q identifier owned by the Agent.

## tool.ask.question.context

Why this decision matters and the evidence behind it.

## tool.ask.question.prompt

The focused question, in one sentence.

## tool.ask.question.custom-answer-label

Optional concise intent appended to Write a custom answer, for example “Describe desired behavior”.

## tool.ask.question.options

Concrete choices; prefer 2-3 options with confidence scores from 1 through 5.

## tool.ask.questions

Independent consequential questions; prefer 1-4 per call.

## tool.start.description

Permanently name this session's temporary artifact once direction is clear, or before substantive Spec/Vibe work when Align was bypassed. For a legacy artifact, create a linked current-format continuation without mutating its source. A genuinely new task belongs in /new.

## tool.start.name

Context-informed task name; prefer 2-4 words and include a ticket ID when applicable.

## tool.next.description

Record ranked Agent-authored actions for the post-turn picker without changing mode. Each listed Align, Spec, or Vibe action starts a focused turn after User selection; handoff checkpoints into a fresh session. The User still chooses.

## tool.next.action.reason

Optional concise reason shown beside this ranked action.

## tool.next.action.prompt

Optional custom kickoff for an Align, Spec, or Vibe action; omit for handoff.

## tool.next.actions

Ranked targets chosen from align, spec, vibe, or handoff. An empty list opens no picker.

## message.ask.direct-route.spec

First reconstruct the completed routed Ask exchange in User transcript and apply its accepted best answers to Decisions and decision-review state, then research the accepted direction and shape it into an actionable proposal.

## message.ask.direct-route.vibe

First reconstruct the completed routed Ask exchange in User transcript and apply its accepted best answers to Decisions and decision-review state, then implement the accepted direction and verify the changed behavior.

## message.ask.cancelled

The User cancelled with these questions unresolved: {{unanswered}}. Do not repeat them in prose.

## message.ask.routed

The User accepted all remaining best-confidence answers and routed directly to {{mode}}.

## message.kickoff.directive.align.align

clarify the most important unresolved decision with the native ask tool before writing prose

## message.kickoff.directive.align.spec

research the open questions and shape the findings into an actionable plan

## message.kickoff.directive.align.vibe

implement the aligned task and verify the changed behavior

## message.kickoff.directive.spec.align

read the artifact and clarify its most important unresolved decision with the native ask tool before writing prose

## message.kickoff.directive.spec.spec

research the remaining questions and complete the proposal

## message.kickoff.directive.spec.vibe

implement the proposal and verify the changed behavior

## message.kickoff.directive.vibe.align

read the artifact and review its most important unresolved choice with the native ask tool before writing prose

## message.kickoff.directive.vibe.spec

research the remaining questions and revise the proposal

## message.kickoff.directive.vibe.vibe

continue the pending implementation and verification

## message.kickoff.transition

Switch from {{source}} to {{target}}. {{directive}}.

## message.kickoff.start

Begin {{target}} for the selected direction. {{directive}}.

## message.kickoff.continue

Continue in {{target}}. {{directive}}.

## message.align.start

Start by calling the native ask tool; do not ask inline.

## message.handoff.checkpoint

Before handoff, append a fresh CLOSE_OUT checkpoint to {{planPath}}. Interpret the whole artifact, reconcile its unresolved work and decision lifecycle, record changed paths, verification, limitations, and concerns, then stop without starting new work.
