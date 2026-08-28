# Agent Workflow API

Concise UI/API copy and mechanical runtime messages. Operational guidance belongs only in `workflow-fsm.ts` (shareable FSM + agent prompt).

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

Open native option pickers and return completed answers, cancellation, or a selected Spec/Vibe route. ALIGN-only.

## tool.ask.prompt-snippet

Ask focused alignment questions with confidence-scored selectable answers

## tool.ask.option.value

Stable value returned for this option.

## tool.ask.option.label

Short everyday name for this option (2–5 words). Shown as the lead text on the picker row.

## tool.ask.option.description

One-sentence consequence or trade-off. Runtime shows it on the picker row after the label.

## tool.ask.option.confidence

Integer used to rank this option; 1 is lowest and 5 is highest.

## tool.ask.question.id

Stable question slug returned with its answer (Q1-goal-scope). User and Agent share this string.

## tool.ask.question.context

One short why-it-matters sentence. Runtime includes it under the prompt in the picker title.

## tool.ask.question.prompt

Plain question for the picker title (keep it short).

## tool.ask.question.options

Options offered for this question.

## tool.ask.questions

Questions presented sequentially; an empty list is a no-op.

## tool.decide.description

Auto-pick the highest-confidence option for each question, record it as an unresolved decision, and continue. SPEC/VIBE-only; never opens a picker or changes mode.

## tool.decide.prompt-snippet

Record a Spec/Vibe decision by auto-picking the highest-confidence option

## tool.decide.questions

Questions to auto-decide; compared options are required to record a decision. An empty list is a no-op.

## tool.start.description

Create the named .pi/plan artifact, or create a linked current-format continuation from a legacy artifact.

## tool.start.name

Task name used for the session and artifact.

## tool.next.description

Record ranked actions for the post-turn picker without changing mode.

## tool.next.action.reason

Required user-facing picker subtitle. Runtime rejects blank or whitespace-only values after normalization. Short plain-English slug (what the User gets); plan slugs (Q-topic/C-topic/D-topic) only as a trailing [] or (), never the whole subtitle. Shown as `{mode} — {reason}` in place of the canned mode subtitle.

## tool.next.action.prompt

Follow-up instruction appended after the runtime transition. Required for Spec, Vibe, and Align review (landing evaluate). Align evaluate must include a standalone decision slug (D1-tighten-writes). Optional for Align idle (landing establish). Forbidden for handoff.

## tool.next.action.landing

Align only: `establish` (default) = editor standby, no auto-start; `evaluate` = auto-start review ask for Ds named in prompt.

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
