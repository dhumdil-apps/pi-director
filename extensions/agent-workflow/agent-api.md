# Agent Workflow API

Exact tool and command descriptions plus runtime-generated messages that the Agent receives. Keys are consumed by `agent-api.ts`; keep every key unique and do not add YAML or other configuration formats.

## command.questionnaire

Align and decide before any work in this session

## command.spec

Research and propose before any change in this session

## command.vibe

Execute the current instruction or proposal in this session

## command.mode

Re-open the mode picker

## command.handoff

Checkpoint the artifact and restart Q&A alignment in a fresh session: /handoff [session-name]

## tool.ask.description

Ask the User 1-4 related alignment questions through native option pickers. Use from any interactive workflow mode when concrete answers are possible; in Vibe, call it only for a genuine blocker so the User can decide what happens next. Explain trade-offs and assign every option a confidence score from 1 through 5. Batch only independent questions whose wording and options remain valid regardless of sibling answers. For dependent follow-ups, make a fresh ask call after incorporating the earlier answer. Ordinary answers return in the same turn; Proceed-with-best routes start their selected mode.

## tool.ask.prompt-snippet

Ask focused alignment questions with confidence-scored selectable answers

## tool.ask.prompt-guidelines

- Use ask instead of ending with prose questions when concrete possible answers can be offered. In Vibe, use ask only for a genuine blocker and ask what the User wants next; an ordinary answer remains in Vibe, while broader alignment is a User-selected Q&A recommendation. Only the User's explicit Proceed-with-best route changes mode.
- Batch only independent questions. If an answer can change a later question's wording or options, stop the batch and make a fresh ask call after incorporating that answer.
- Call ask without sibling tools so an explicit Proceed-with-best route can terminate Q&A cleanly before its selected Spec/Vibe continuation.
- When the answer needs user-supplied detail, do not offer a selectable ‘specify’ option. Set customAnswerLabel to a concise input intent (for example, ‘Describe desired behavior’) so the built-in Write a custom answer entry opens the input field instead.

## tool.ask.option.value

Stable concise value returned for this option.

## tool.ask.option.label

Distinct 2-6 word picker label.

## tool.ask.option.description

One sentence explaining the consequence or trade-off.

## tool.ask.option.confidence

Confidence in this option from 1 (lowest) through 5 (highest).

## tool.ask.question.id

Distinct stable identifier.

## tool.ask.question.context

Why this decision matters and the evidence behind it.

## tool.ask.question.prompt

The focused question, in one sentence.

## tool.ask.question.custom-answer-label

Optional concise intent appended to Write a custom answer, for example ‘Describe desired behavior’. Use it instead of a selectable option that merely asks the User to specify details.

## tool.ask.question.options

2-4 concrete choices, each with a confidence score from 1 through 5.

## tool.ask.questions

1-4 related consequential questions.

## tool.start-task.description

Name this session's one artifact from context, without asking the User. Call once, on the first request of the session. A later call with a different name is refused: a session owns a single plan file for its whole life, and a genuinely new goal belongs in a fresh session.

## tool.start-task.name

A context-informed 2–4 word task name, optionally prefixed with a ticket ID.

## tool.record-auto-decision.description

Record a bounded Vibe-only implementation decision in the current artifact. Use only for reversible, low-risk, in-scope choices already implied by the task; use ask or recommend User-selected Q&A for consequential, ambiguous, irreversible, product-facing, or out-of-scope choices. Include the decision, context, rationale, affected behavior/files, and verification status/details. This records an audit trail, not User approval.

## tool.record-auto-decision.decision

The bounded, reversible implementation choice made in Vibe.

## tool.record-auto-decision.context

The in-scope implementation context that required the choice.

## tool.record-auto-decision.rationale

Why this choice is the safest option already implied by the task.

## tool.record-auto-decision.impact

Affected behavior, files, or compatibility surface.

## tool.record-auto-decision.verification-details

Checks run, or why verification is not applicable.

## tool.save-plan.description

Persist and echo the Spec proposal at .pi/plan/<session-name>.md, then end the turn so the User's mode picker carries the decision. It replaces only an untouched pre-execution draft, and appends a dated revision after execution history exists. Follow-up work after execution history or Close out belongs in a bottom revision; do not rewrite earlier narrative, while live checklist status may be updated. Only Spec calls save_plan; Q&A and Vibe keep the artifact current by editing it directly. Plan names are immutable once execution has begun, and plan files are never deleted.

## tool.save-plan.name

The new session name: a concise 2–4 meaningful-word summary of the work, optionally prefixed with a ticket ID (e.g. TEST-1234).

## tool.save-plan.plan

The proposal as Markdown under Goal, Current state, Findings, Decisions, Desired state, Approach, Quirks, and Checklist. It replaces only an untouched pre-execution draft, and appends a dated revision after execution history exists. Omit plan to present the on-disk proposal.

## tool.recommend-next.description

Record one or more Agent-authored mode actions for the post-turn picker. Each listed mode starts a focused Agent turn after User selection; modes not listed only switch mode and return to the editor. Include concise per-action reasons or kickoffs when useful. A phase-boundary handoff may not include a kickoff. This records intent only; the User still selects the action.

## tool.recommend-next.action.reason

Optional concise reason shown beside this action; omit when no reason is useful.

## tool.recommend-next.action.prompt

Optional custom kickoff for this Agent-starting mode action; omit for phase-boundary handoff.

## tool.recommend-next.actions

One or more distinct mode actions for the post-turn picker. Every listed mode starts Agent after User selection.

## message.ask.direct-route.spec

Record every User-accepted answer from the completed ask result in the artifact, then research the aligned direction and shape it into an actionable proposal.

## message.ask.direct-route.vibe

Record every User-accepted answer from the completed ask result in the artifact, then implement the aligned direction and verify the changed behavior.

## message.ask.cancelled

The User cancelled with these questions unresolved: {{unanswered}}. Do not repeat them in prose.

## message.ask.routed

The User accepted all remaining best-confidence answers and routed directly to {{mode}}.

## message.kickoff.directive.questionnaire.questionnaire

clarify the next unresolved decision with the native ask tool before writing prose

## message.kickoff.directive.questionnaire.spec

research the open questions and shape the findings into an actionable plan

## message.kickoff.directive.questionnaire.vibe

implement the pending task and verify the changed behavior

## message.kickoff.directive.spec.questionnaire

clarify the next unresolved decision with the native ask tool before writing prose

## message.kickoff.directive.spec.spec

research the remaining open questions and shape the findings into an actionable plan

## message.kickoff.directive.spec.vibe

implement the pending task and verify the changed behavior

## message.kickoff.directive.vibe.questionnaire

clarify the next unresolved decision with the native ask tool before writing prose

## message.kickoff.directive.vibe.spec

research the remaining open questions and shape the findings into an actionable plan

## message.kickoff.directive.vibe.vibe

implement the pending task and verify the changed behavior

## message.kickoff.transition

Switch from {{source}} to {{target}}. {{directive}}.{{context}}

## message.kickoff.start

Begin {{target}} mode for the selected direction. {{directive}}.{{context}}

## message.kickoff.continue

Continue in {{target}} mode. {{directive}}.{{context}}

## message.kickoff.pending-action

Prioritize this pending artifact item: “{{nextAction}}”.

## message.questionnaire.reason

Clarify this unresolved decision: {{reason}}.{{context}}

## message.questionnaire.start

Start by calling the native ask tool; do not ask inline.

## message.handoff.checkpoint

Before this session hands off, bring {{planPath}} fully up to date with everything learned so far, so a fresh session can resume from it alone. Reconcile the cumulative checklist across every revision: mark completed tasks where their original labels occur, preserve unresolved labels, and record the current status. Update the file and stop; do not start new work.
