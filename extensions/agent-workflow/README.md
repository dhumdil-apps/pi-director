# Agent Workflow

Pi Director has three User-owned modes:

- **ALIGN** is the recommended clarification and decision-review preflight.
- **SPEC** researches and presents an actionable proposal without changing files outside `.pi`.
- **VIBE** implements and verifies the selected direction.

New sessions and handoffs start in Align. Explicit `/align`, `/spec`, and `/vibe` commands remain escape hatches; `/mode` opens the manual picker. Historical `questionnaire`, `explore`, `plan`, and `execute` mode entries still resolve, but `/questionnaire` does not exist.

## Three mechanism-only tools

The runtime exposes only capabilities instructions cannot reproduce:

- `ask` renders native questions and owns cancellation plus direct Spec/Vibe settlement.
- `start` permanently names the session artifact or creates a linked continuation from an immutable legacy plan.
- `next` records ranked actions for the automatic post-turn picker.

Only an explicit `next` call opens an automatic picker. Every recommended Align, Spec, or Vibe action carries a distinct Agent-authored instruction grounded in the current artifact; runtime prepends only `Switch from … to …` or `Continue in …`, and handoff omits an instruction. Recommended actions appear first, followed by neutral remaining modes, handoff, and `Return to editor`. Manual mode commands and neutral picker choices auto-start with only the mechanical transition line. Selecting handoff prepares `/handoff <name>` in the editor for explicit User execution. Empty recommendations open nothing; `/mode` remains the manual recovery surface.

Question counts, option counts, confidence scale, identifiers, naming quality, and decision completeness are Agent instructions rather than runtime validation. Empty Ask is a harmless no-op; an optionless question retains custom input but cannot Proceed-with-best.

## Agent-interpreted artifact

One versioned `.pi/plan/<name>.md` follows the task across modes and handoffs. The flat artifact contains Goal, Align, Decisions, Evidence, Proposal, Checklist, Work log, User transcript, and Agent transcript.

The Agent preserves the initial goal, accepted follow-ups, and unresolved outcomes as cumulative scope. Follow-up work may add, defer, supersede, skip, fail, or complete a stable C outcome, but it may not silently erase or rename one. Stable Agent-chosen Q/D/C identifiers make question, decision, and outcome lifecycles reviewable across turns.

Runtime does not parse checklist or decision status. The Agent interprets the free-form artifact as a whole, keeps Work log and both transcripts append-only, and leaves the artifact resumable without chat history after every turn.

Spec and Vibe record every material autonomous decision directly in Agent transcript with its question, context, 2–3 compared options, selection, rationale, impact, verification, review state, and lifecycle events. Only explicit User acceptance in Align or Proceed-with-best resolves review; implementation and verification do not imply approval.

All modes may update `.pi` workflow state, but only Vibe may change files outside `.pi`. This remains an Agent rule rather than a runtime sandbox. The hidden memory-review marker remains `/init`-only.

## Close-out and handoff

`CLOSE_OUT` is a shared Agent procedure, not an artifact section. It reconciles the initial goal, accepted follow-ups, every C outcome, and every D lifecycle; appends actual changes, verification, omitted checks, limitations, and concerns to Work log; and calls `next` only when a useful choice remains. Unrelated or pre-existing failures are reported without widening scope. Spec then returns a concise proposal summary with the artifact path; Vibe returns a concise implementation result.

Only durable orientation and costly quirks belong in project memory during ordinary close-out. The hidden review marker remains exclusively owned by `/init`.

For current artifacts, `/handoff [session-name]` swaps immediately onto the same file, including a temporary plan. It refuses active runs and does not start a checkpoint turn. The replacement is already named and in Align, then auto-starts with ordinary Align continue; fresh Align reads the whole artifact and chooses the most important unresolved item. Runtime derives no state from its prose. Picker-selected handoff still prepares `/handoff` for explicit Enter.

Legacy artifacts remain immutable. Legacy handoff opens fresh Align against the old plan, and `start` creates a linked current-format continuation before the first `.pi` write. Runtime carries recognized historical timing; the Agent converts meaningful goal, evidence, decision, and checklist context while preserving the source file.

## Source ownership

`workflow-steps.md` is the sole operational pseudocode injected into the Agent prompt. The [Agent Workflow diagrams](../../docs/AGENT-WORKFLOW-DIAGRAMS.md) provide a derived visual map of that contract. `agent-api.md` contains only concise UI/API copy and mechanical runtime messages. `plan-template.md` owns the readable artifact scaffold.

Headless sessions receive no interactive workflow prompt, scaffold, or picker because they cannot use its UI.
