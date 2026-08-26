# Agent Workflow

Pi Director has three User-owned modes:

- **ALIGN** is the recommended clarification and decision-review preflight.
- **SPEC** researches and presents an actionable proposal without changing files outside `.pi`.
- **VIBE** implements and verifies the selected direction.

New sessions and handoffs start in Align. Explicit `/align`, `/spec`, and `/vibe` commands remain escape hatches; `/mode` opens the manual picker. Historical `questionnaire`, `explore`, `plan`, and `execute` mode entries still resolve, but `/questionnaire` does not exist.

## Four mechanism-only tools

The runtime exposes only capabilities instructions cannot reproduce:

- `ask` renders native ALIGN questions and returns answers, cancellation, or a Proceed-with-best Spec/Vibe route. Envision uses it for ≥1 goal-scope question after `start`; evaluate uses it for later D-review and clarification. A non-empty Ask errors without a picker if this session has no plan file. It does not write the User transcript.
- `decide` silently auto-picks the highest-confidence option for each SPEC/VIBE question and records that pick as an unresolved decision. It never opens a picker or changes mode.
- `start` creates the named `.pi/plan` artifact or a linked continuation from an immutable legacy plan. No plan file exists until this call.
- `next` records ranked actions for the automatic post-turn picker.

Only an explicit `next` call opens an automatic picker. Every recommended action needs a user-facing subtitle: a short plain-English slug (what the User gets); Q/C/D/G identifiers only as a trailing `[]` or `()`, never the whole subtitle. Runtime rejects a missing, blank, or whitespace-only reason on new `next` calls; older session entries without a reason still read. Spec and Vibe also need a contextual prompt. Align is dual-landing in the graph (`landing:"establish"` ≡ `NEXT_ALIGN` editor standby; `landing:"evaluate"` ≡ `RETURN_ALIGN` D-review ask). Agents should not recommend Align establish idle — static **Return → ❓ ALIGN** already covers cross-mode editor standby (runtime also drops redundant establish rows). Recommend `landing: "evaluate"` only when unresolved D acceptance is required (prompt must include a standalone decision id `D1` or `D-12`; auto-start). Align evaluate is listed last among recommendations (PWB-style). The picker shows `{mode} — {subtitle}` instead of the canned mode phrase; runtime prepends only `Switch from … to …` or `Continue in …` when auto-starting, and handoff omits an instruction. Recommended actions appear first, followed by neutral remaining Spec/Vibe modes, handoff, **Return to editor** (same as ESC), and **Return → ❓ ALIGN** last when not already in Align (static establish switch, no agent start; PWB-shaped). ESC dismisses with no write. Manual mode commands and neutral picker choices change mode and return to the editor; only recommended actions with autostart (Spec/Vibe with prompt, or Align evaluate with prompt) start the agent. Selecting handoff prepares `/handoff <name>` in the editor for explicit User execution. Empty recommendations open nothing; `/mode` remains the manual recovery surface. Proceed-with-best on ask carries structured answers into the Spec/Vibe kickoff so the target mode can synthesize the plan. Ask option rows show the Agent's short label slug only — no letter prefixes or user-facing confidence scores (confidence still ranks options and drives Proceed-with-best / decide).

Question counts, option counts, confidence scale, identifiers, naming quality, and decision completeness are Agent instructions rather than runtime validation. Empty Ask is a harmless no-op; an optionless Ask question retains custom input but cannot Proceed-with-best. A SPEC/VIBE Ask, an ALIGN Decide, or an optionless Decide is a harmless no-op rather than an error.

## Agent-interpreted artifact

One versioned `.pi/plan/<name>.md` follows the task across modes and handoffs. The flat artifact contains Goal, Align, Decisions, Evidence, Proposal, Checklist, Work log, User transcript, and Agent transcript.

The Agent preserves the initial goal, accepted follow-ups, and unresolved outcomes as cumulative scope. Follow-up work may add, defer, supersede, skip, fail, or complete a stable C outcome, but it may not silently erase or rename one. Stable Agent-chosen Q/D/C identifiers make question, decision, and outcome lifecycles reviewable across turns.

Runtime does not parse checklist or decision status. It does parse the `**Current work:**` line for the Progress Tracker working slot and omits HTML comments so the format marker cannot become that phrase. The Agent interprets the free-form artifact as a whole, keeps Work log and both transcripts append-only, and leaves the artifact resumable without chat history after every turn.

Spec and Vibe call `decide` for every material autonomous decision. That call is RECORD_DECISION: the runtime auto-picks the highest-confidence option and records the unresolved D. Only explicit User acceptance in Align resolves review; implementation and verification do not imply approval.

All modes may update `.pi` workflow state, but only Vibe may change files outside `.pi`. Guided steps carry project permission **read** (plan only) or **write** (project files). Align also has a stricter **pre-ask rule** (Agent, not a runtime sandbox): before the first scope ask, no extra file reads — harness-injected `AGENTS.md` only. After that ask and `start`, Align may read the session plan, then `.pi/AGENTS.md` / `.pi/MEMORY.md`. No `.pi/plan` listing, sibling plans, `README.md`, `package.json`, or codebase exploration (Spec explore owns research). The hidden memory-review marker remains `/init`-only.

## Close-out and handoff

`CLOSE_OUT` is a shared Agent procedure, not an artifact section. It reconciles the initial goal, accepted follow-ups, every C outcome, and every D lifecycle; appends actual changes, verification, omitted checks, limitations, and concerns to Work log; and calls `next` only when a useful choice remains. Unrelated or pre-existing failures are reported without widening scope. Spec then returns a concise proposal summary with the artifact path; Vibe returns a concise implementation result.

Only durable orientation and costly quirks belong in project memory during ordinary close-out. The hidden review marker remains exclusively owned by `/init`.

For current artifacts, `/handoff [session-name]` swaps immediately onto the same already-named file. It refuses active runs, skips a checkpoint turn, and does not invent a plan when `start` has not run. The replacement is already named and in Align, then auto-starts with ordinary Align continue; fresh Align re-enters envision (reuse artifact → ≥1 scope ask → evaluate). Runtime derives no state from its prose. Picker-selected handoff still prepares `/handoff` for explicit Enter. Leftover older temporary plan files stay on disk.

Legacy artifacts remain immutable. Legacy handoff opens fresh Align against the old plan, and `start` creates a linked current-format continuation before the first `.pi` write. Runtime carries recognized historical timing; the Agent converts meaningful goal, evidence, decision, and checklist context while preserving the source file.

## Source ownership

`workflow-fsm.ts` (v2.6.6+) is the sole shareable operational FSM (`modeBodies` with primary/secondary roles, guided states, transitions, procedures, tool mechanics; in-mode body edges ALIGN/SPEC/VIBE bidirectional; `ARTIFACT` envision→evaluate; `RETURN_ALIGN` for Align review). It is injected into the Agent prompt via `formatWorkflowPrompt()`, exported as JSON/Mermaid for diagrams, and embedded into `workflow-fsm.html` for local review. Each User mode has a **primary home** (align→evaluate, spec→explore, vibe→execute) and a **secondary gate** that may CALL `next` (establish/elaborate/examine); `envision` is session entry only (ask ≥1 goal-scope, then start/reuse the named artifact, then evaluate). ALIGN `ask` may run before `start` when no named plan exists. `next` never recommends the current mode (runtime filters next-driven pickers); `/mode` still lists all modes. `workflow-machine.ts` owns Mode × Artifact × Settlement runtime gates used by `ask`, `decide`, `next`, and `agent_settled` and must stay aligned with `WORKFLOW_FSM.tools` and the transition table. The [Agent Workflow diagrams](../../docs/AGENT-WORKFLOW-DIAGRAMS.md) are a derived visual map; when they disagree with the FSM, the FSM wins. Open `workflow-fsm.html` (after `npm run build:content`) for the diagram-only flat XState-style viewer (full FSM graph, event/DO pills, orthogonal flows, double-click instruction sidebar, machine INFO). `agent-api.md` contains only concise UI/API copy and mechanical runtime messages. `plan-template.md` owns the readable artifact scaffold.

Headless sessions receive no interactive workflow prompt, scaffold, or picker because they cannot use its UI.
