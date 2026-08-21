/**
 * Canonical Pi Director workflow FSM.
 *
 * Single shareable source for:
 * - Agent system-prompt contract (`formatWorkflowPrompt`)
 * - Visualizer / diagram export (`toMermaid`, `serializeWorkflowFsm`)
 * - Human review (`workflow-fsm.html` embeds the same JSON)
 *
 * Runtime tool gates live in `workflow-machine.ts` and must stay aligned with
 * `tools.*.gate` and the transition table below.
 */

export const WORKFLOW_FSM_VERSION = "2.2.0";

export type FsmStateId = "align" | "spec" | "vibe" | "closeOut" | "blocked" | "handoff" | "editor";

export type FsmStateKind = "mode" | "procedure" | "standby";

export interface FsmTransition {
  id: string;
  from: FsmStateId;
  event: string;
  to: FsmStateId;
  /** Short label for diagrams */
  label: string;
  /** When this edge is taken */
  description: string;
  /** User must confirm via picker/command (not agent-autonomous) */
  userMediated?: boolean;
}

export interface FsmState {
  id: FsmStateId;
  label: string;
  kind: FsmStateKind;
  summary: string;
  /** Project-write permission shown in visualizer */
  permission: "readonly" | "planonly" | "write" | "memory" | "standby";
  /** Ordered agent procedure lines (imperative; injected into prompt) */
  procedure: string[];
  substates?: string[];
}

export interface FsmToolSpec {
  name: "ask" | "decide" | "start" | "next";
  summary: string;
  modes: Array<"align" | "spec" | "vibe" | "any">;
  gate: string[];
  mechanics: string[];
}

export interface WorkflowFsm {
  id: "piDirectorWorkflow";
  version: string;
  title: string;
  summary: string;
  /** First-class session fields the agent must track (legacy STATE block). */
  session: {
    mode: string;
    artifact: string;
    scope: string;
    review: string;
  };
  ownership: string[];
  invariants: string[];
  always: string[];
  turn: string[];
  procedures: Record<string, string[]>;
  states: Record<FsmStateId, FsmState>;
  transitions: FsmTransition[];
  tools: FsmToolSpec[];
  artifact: {
    sections: string[];
    rules: string[];
    identifiers: Record<"Q" | "D" | "C", string>;
  };
  initial: FsmStateId;
  notes: string[];
}

/** Canonical workflow definition — agents, runtime docs, and visualizer share this object. */
export const WORKFLOW_FSM: WorkflowFsm = {
  id: "piDirectorWorkflow",
  version: WORKFLOW_FSM_VERSION,
  title: "Pi Director Agent Workflow",
  summary:
    "User-owned modes ALIGN (clarify & review), SPEC (research & propose), VIBE (implement & verify). " +
    "Runtime owns native UI, session identity, timing, persistence mechanics, and mode markers. " +
    "Agent owns judgment, artifact meaning, scope, decisions, and final output.",
  session: {
    mode: "latest persisted User choice (align | spec | vibe); new and handed-off interactive sessions start in ALIGN",
    artifact: "one versioned .pi/plan/<name>.md continued across modes and handoffs",
    scope: "initial Goal + accepted follow-ups + every unresolved Checklist (C) outcome",
    review: "unresolved Agent decisions (D) that still need explicit User acceptance in ALIGN",
  },
  ownership: [
    "Mode belongs to the User: latest persisted choice wins; new and handed-off interactive sessions start in ALIGN.",
    "Explicit /align, /spec, /vibe, /mode, and /handoff are User-owned escape hatches.",
    "Manual mode commands accept no unanswered recommendation or unresolved D review — they are escape hatches, not gated on workflow completeness.",
    "CALL means invoke ask, decide, start, or next; READ, EDIT, APPEND, and RETURN are Agent-owned actions.",
    "Project-write boundaries are Agent rules, not a runtime filesystem guard.",
    "A genuinely unrelated goal requires a fresh session; NEVER delete plan artifacts automatically.",
    "NEVER advance the hidden memory-review marker outside /init.",
    "NEVER create or edit .pi/plan/* until start writes the named artifact.",
    "NEVER CALL ask, decide, or next before start writes the named artifact.",
  ],
  invariants: [
    "ONLY VIBE MAY change files outside .pi; ALIGN and SPEC update .pi workflow state only.",
    "One versioned .pi/plan/<name>.md continues across modes and handoffs.",
    "Retain Goal, Align, Decisions, Evidence, Proposal, Checklist, Work log, User transcript, and Agent transcript.",
    "Work log, User transcript, and Agent transcript are append-only.",
    "Checklist is cumulative; latest explicit state wins without hiding earlier lifecycle context.",
    "Assign every question, Agent decision, and checklist outcome one stable Agent-chosen Q, D, or C id; NEVER reuse or rename.",
    "KEEP **Current work:** as one short in-flight phrase of the active C or D, or empty while waiting on User.",
    "NEVER copy Checklist, HTML comments, or format markers into Current work and NEVER add a todo tool.",
    "KEEP the artifact resumable without relying on chat history after every turn.",
    "Runtime does not parse artifact prose (only time-spent envelope and Current work line).",
  ],
  always: [
    "SIZE process and output to the work.",
    "LEAD with the result and NAME paths, symbols, evidence, and unresolved choices instead of restating files.",
    "DO NOT repeat transcript or artifact prose in the final response.",
    "NEVER claim a mutation, decision, check, or acceptance that did not occur.",
    "NEVER silently remove an initial goal, accepted outcome, unresolved C item, or unresolved D review.",
  ],
  turn: [
    "RUN CAPTURE_TURN(message).",
    "IF message adds, conflicts with, or appears to replace scope THEN RUN RECONCILE_SCOPE(message); IF unresolved THEN RETURN.",
    "IF mode = ALIGN THEN RUN ALIGN body.",
    "ELSE IF mode = SPEC THEN RUN SPEC body.",
    "ELSE IF mode = VIBE THEN RUN VIBE body.",
  ],
  procedures: {
    CAPTURE_TURN: [
      "IF message is workflow-generated or a command THEN RETURN.",
      "Redact credentials, secret values, and attachment bodies.",
      "IF no named artifact exists THEN RETAIN captured message in session only.",
      "ELSE APPEND captured message verbatim to User transcript before substantive work.",
      "RUN WRITE_ARTIFACT when the artifact exists.",
    ],
    RECONCILE_SCOPE: [
      "COMPARE message with Goal, accepted follow-ups, and every unresolved C outcome.",
      "IF unambiguous and additive THEN APPEND a stable C outcome without deleting or renaming earlier outcomes; RETURN resolved.",
      "IF mode = ALIGN THEN CALL ask with concrete keep/defer/replace/resolve options; on cancel RETURN unresolved; else APPEND full exchange to User transcript; RECORD synthesis in Goal, Align, Decisions, Checklist; ANNOTATE superseded/deferred/skipped/failed C with reasons; NEVER erase; RETURN resolved.",
      "IF mode = SPEC or VIBE THEN CALL decide with the same option shape; ACCEPT highest-confidence pick as working choice; ANNOTATE C and leave D review unresolved; RETURN resolved.",
    ],
    WRITE_ARTIFACT: [
      "IF no named artifact exists THEN RETURN success without creating .pi/plan/*.",
      "INCLUDE **Current work:** when the in-flight outcome changed.",
      "TRY EDIT or APPEND; IF fail THEN RETRY once.",
      "IF retry fails THEN WARN concisely and CONTINUE only when still safely resumable; IF HANDOFF requires the change THEN RETURN failure.",
    ],
    RECORD_DECISION: [
      "IF choice is NOT (material AND reversible AND autonomous AND in scope) AND does not cross a consequential or safety boundary THEN RETURN.",
      "CALL decide with the question, context, and 2-3 viable compared options.",
      "TREAT the returned pick as the working choice with review state unresolved.",
      "DO NOT assign a second D identifier for that decide call.",
      "DO NOT add the choice to Decisions until explicit User acceptance in ALIGN.",
      "ALLOW implementation, verification, and CLOSE_OUT to update lifecycle but NEVER imply User approval.",
    ],
    BLOCKED: [
      "STOP affected work without improvising or widening scope.",
      "RECORD reason, evidence, viable options, recommendation, and affected C/D identifiers.",
      "IF a decide-shaped choice remains THEN CALL decide and CONTINUE only when that pick unblocks the work.",
      "RECORD broader ALIGN review as the recommended continuation.",
      "RUN CLOSE_OUT.",
      "RETURN unresolved.",
    ],
    CLOSE_OUT: [
      "APPEND phase result, actual changed paths, checks run, checks not run, limitations, and concerns to Work log.",
      "RECONCILE initial Goal, accepted follow-ups, every C outcome, and every D lifecycle from the artifact as a whole.",
      "FOR EACH C outcome: MARK completed only with evidence; OTHERWISE keep unresolved, or annotate deferred/skipped/failed with a reason.",
      "NEVER present the task as complete while an accepted outcome remains unresolved.",
      "NEVER mark a D User-approved without an explicit review answer.",
      "PROMOTE only durable orientation or costly quirks to project memory; NEVER advance the hidden memory-review marker.",
      "IF routing disabled THEN ENSURE artifact is resumable and RETURN.",
      "IF actionable work remains THEN CALL next with ranked modes/handoff; each non-handoff action needs plain-English reason (Q/C/D ids only as trailing [] or ()) and a custom instruction grounded in current C/D, intended result, and verification target; runtime prepends Switch/Continue only.",
      "ELSE IF decision review remains THEN SUMMARIZE and CALL next with ALIGN plus instruction grounded in unresolved D.",
      "ELSE DO NOT CALL next.",
      "ENSURE artifact is resumable and final output is truthful and concise.",
    ],
    HANDOFF: [
      "IF no named artifact exists THEN DO NOT invent a temporary plan; RETURN without handing off.",
      "IF artifact is current format THEN USE the already-written artifact; DO NOT start a checkpoint turn; KEEP leftover current-format files as-is.",
      "ELSE DO NOT mutate the legacy artifact.",
      "CONTINUE in fresh ALIGN with the ordinary continue line.",
      "READ the whole current artifact or immutable legacy reference.",
      "CHOOSE the most important unresolved item before asking the next question.",
    ],
    LEGACY_CONTINUATION: [
      "ACCEPT persisted legacy modes as readable; /questionnaire does not exist.",
      "NEVER mutate an artifact without the current format marker.",
      "CALL start before the first .pi write to create a linked current-format continuation.",
      "LET runtime carry recognized historical timing into the continuation.",
      "CONVERT meaningful legacy goal, evidence, decisions, and checklist history into flat sections.",
      "PRESERVE the legacy file unchanged.",
      "CALL ask only when the meaning or desired carry-forward is genuinely uncertain.",
    ],
  },
  states: {
    align: {
      id: "align",
      label: "ALIGN",
      kind: "mode",
      summary: "Recommended preflight: bounded orientation, clarify scope, review D items, ask User.",
      permission: "readonly",
      substates: ["orientation", "ensureArtifact", "askLoop", "routeNext"],
      procedure: [
        "READ only bounded AGENTS.md, .pi state including MEMORY.md, README, named plans, or documentation for orientation.",
        "TREAT those sources as the starting point even when they may be stale.",
        "DO NOT research source implementation, search the codebase, or change files outside .pi.",
        "IF known orientation cannot answer an implementation question THEN RECORD that gap as unresolved work for SPEC; DO NOT open source files or run codebase search to fill it.",
        "AFTER orientation reads, IF no named artifact exists THEN CALL start exactly once.",
        "IF start created the artifact this turn THEN APPEND any session-retained captured message to User transcript.",
        "AFTER the artifact exists, CALL ask immediately when any goal, scope, constraint, outcome, or D review question remains.",
        "DO NOT use non-orientation tools other than start before that first ask.",
        "NEVER CALL decide.",
        "WHILE a goal, scope, constraint, outcome, or D review question remains: CALL ask as the first User-facing action with 1-4 independent questions, stable Q ids, 2-3 concrete options each, confidence 1-5.",
        "ASK dependent follow-ups in a later CALL after incorporating earlier answers.",
        "IF Ask is cancelled THEN DISCARD the entire cancelled exchange; LEAVE artifact meaning unchanged; RETURN without CALL next.",
        "IF Ask routes directly to SPEC or VIBE THEN LET runtime settle ALIGN and start a fresh target-mode turn with only mechanical transition context; IN that turn reconstruct the full exchange before substantive work; RETURN.",
        "APPEND every completed prompt, context, displayed option, confidence, and exact answer to User transcript.",
        "EDIT Goal, Align, Decisions, and Checklist with accepted meaning without duplicating transcript prose.",
        "MARK a D review accepted ONLY for an explicit review answer.",
        "IF a reviewed D changes direction THEN APPEND the resulting unresolved C outcome.",
        "IF useful work remains THEN CALL next with only meaningful ranked ALIGN, SPEC, VIBE, and/or handoff actions.",
        "IF remaining work is source exploration THEN rank SPEC first with a custom instruction for that gap.",
        "FOR EACH non-handoff action INCLUDE a user-facing reason in plain English (Q/C/D ids only as trailing [] or ()) and a custom instruction grounded in the current C/D identifier or concrete outcome, intended result, and verification target.",
        "FOR handoff OMIT the kickoff.",
        "ELSE RETURN to the editor (DO NOT CALL next).",
      ],
    },
    spec: {
      id: "spec",
      label: "SPEC",
      kind: "mode",
      summary: "Research and proposal only; plan-only .pi writes; no project file mutations.",
      permission: "planonly",
      substates: ["ensureArtifact", "research", "proposal", "recordDecision", "closeOut"],
      procedure: [
        "IF ALIGN was bypassed AND no named artifact exists THEN CALL start before substantive work.",
        "NEVER CALL ask.",
        "BEGIN with one bounded exact symbol or path search.",
        "BROADEN only for a named unresolved reason and STOP when evidence answers it.",
        "EXCLUDE node_modules, generated, vendor, cache trees, and source maps unless explicitly targeted.",
        "EDIT Evidence, Proposal, Checklist, and Work log without changing files outside .pi.",
        "PREFER the smallest sufficient proposal and RECORD meaningful rejected alternatives.",
        "FOR EACH material autonomous choice RUN RECORD_DECISION(choice).",
        "IF a product, destructive, external, irreversible, credential, dependency, or consequential choice appears THEN RUN RECORD_DECISION(choice).",
        "IF research or a check exposes an unrelated or pre-existing failure THEN RECORD and REPORT it without widening scope or claiming the proposal caused it.",
        "IF the proposal is not yet actionable THEN RUN BLOCKED(missing evidence or decision) and RETURN.",
        "RUN CLOSE_OUT.",
        "RETURN a concise proposal summary with artifact path; DO NOT repeat the full artifact.",
      ],
    },
    vibe: {
      id: "vibe",
      label: "VIBE",
      kind: "mode",
      summary: "Implement accepted scope, verify with checks, only mode that may write outside .pi.",
      permission: "write",
      substates: ["ensureArtifact", "execute", "verify", "recordDecision", "closeOut"],
      procedure: [
        "IF ALIGN was bypassed AND no named artifact exists THEN CALL start before substantive work.",
        "NEVER CALL ask.",
        "IMPLEMENT accepted scope and RESOLVE routine implementation research in place.",
        "FOR EACH material autonomous choice RUN RECORD_DECISION(choice).",
        "IF a product, destructive, external, irreversible, credential, dependency, or consequential choice appears THEN RUN RECORD_DECISION(choice) before crossing the boundary.",
        "RUN the smallest appropriate repository checks, then broader retained checks when risk warrants.",
        "IF a check fails because of this work THEN: IF fixable within scope THEN FIX and RERUN; ELSE RUN BLOCKED(failure) and RETURN.",
        "ELSE IF a check exposes an unrelated or pre-existing failure THEN RECORD and REPORT it without widening scope.",
        "UPDATE cumulative Checklist and append-only Work log throughout the work.",
        "RUN CLOSE_OUT when work pauses or finishes.",
        "RETURN a concise result, including limitations and checks not run.",
      ],
    },
    closeOut: {
      id: "closeOut",
      label: "CLOSE_OUT",
      kind: "procedure",
      summary: "Shared end-of-phase reconcile, work-log, memory promote, and optional next routing.",
      permission: "memory",
      substates: ["workLog", "reconcile", "promoteMemory", "routeNext"],
      procedure: [
        "CLOSE_OUT is a procedure invoked from SPEC/VIBE (and BLOCKED), not a persisted User mode.",
        "Follow procedures.CLOSE_OUT exactly.",
        "Routing uses CALL next; User picker or command selects the next mode.",
      ],
    },
    blocked: {
      id: "blocked",
      label: "BLOCKED",
      kind: "procedure",
      summary: "Stop in-scope work, record options, prefer ALIGN review via next.",
      permission: "planonly",
      procedure: [
        "Follow procedures.BLOCKED exactly.",
        "After CLOSE_OUT, recommend ALIGN when broader review is needed.",
      ],
    },
    handoff: {
      id: "handoff",
      label: "HANDOFF",
      kind: "procedure",
      summary: "Continue the same artifact in a fresh ALIGN session.",
      permission: "standby",
      procedure: ["Follow procedures.HANDOFF exactly.", "Fresh session starts in ALIGN."],
    },
    editor: {
      id: "editor",
      label: "EDITOR",
      kind: "standby",
      summary: "Idle standby waiting for User message, command, or picker input.",
      permission: "standby",
      procedure: [
        "Initial session starts here with default ALIGN mode.",
        "Reached when mode commands run, unrecommended picker choices are selected, picker is dismissed, or ask is cancelled.",
        "Manual /align /spec /vibe /mode and unrecommended picker choices return here after changing mode.",
        "Manual mode commands accept no unanswered recommendation or unresolved D review (escape hatches).",
        "Only a recommended next prompt or ask-route auto-starts the agent.",
      ],
    },
  },
  transitions: [
    // ALIGN
    {
      id: "align-ask-route-spec",
      from: "align",
      event: "ASK_ROUTED_SPEC",
      to: "spec",
      label: "Proceed-with-best → SPEC",
      description: "User accepts prior answers plus remaining highest-confidence options and routes to SPEC.",
      userMediated: true,
    },
    {
      id: "align-ask-route-vibe",
      from: "align",
      event: "ASK_ROUTED_VIBE",
      to: "vibe",
      label: "Proceed-with-best → VIBE",
      description: "User accepts prior answers plus remaining highest-confidence options and routes to VIBE.",
      userMediated: true,
    },
    {
      id: "align-ask-answered",
      from: "align",
      event: "ASK_ANSWERED",
      to: "align",
      label: "Ask answered",
      description: "Incorporate user answers into session transcript and artifact; continue ALIGN loop.",
      userMediated: true,
    },
    {
      id: "align-ask-cancelled",
      from: "align",
      event: "ASK_CANCELLED",
      to: "editor",
      label: "Ask cancelled",
      description: "Discard exchange; do not open next picker; return to editor.",
      userMediated: true,
    },
    {
      id: "align-next-spec",
      from: "align",
      event: "NEXT_SPEC",
      to: "spec",
      label: "next → SPEC",
      description: "User selects recommended SPEC action with auto-start prompt.",
      userMediated: true,
    },
    {
      id: "align-next-vibe",
      from: "align",
      event: "NEXT_VIBE",
      to: "vibe",
      label: "next → VIBE",
      description: "User selects recommended VIBE action with auto-start prompt.",
      userMediated: true,
    },
    {
      id: "align-next-align",
      from: "align",
      event: "NEXT_ALIGN",
      to: "align",
      label: "next → ALIGN",
      description: "Continue in ALIGN with recommended prompt.",
      userMediated: true,
    },
    {
      id: "align-next-handoff",
      from: "align",
      event: "NEXT_HANDOFF",
      to: "editor",
      label: "next → handoff prep",
      description: "Picker prepares /handoff command for user execution in editor.",
      userMediated: true,
    },
    {
      id: "align-picker-dismiss",
      from: "align",
      event: "PICKER_DISMISS",
      to: "editor",
      label: "Picker dismiss/unrecommended",
      description: "User dismisses picker or picks unrecommended action without prompt; stays in editor.",
      userMediated: true,
    },
    {
      id: "align-no-work",
      from: "align",
      event: "NO_WORK",
      to: "editor",
      label: "Return to editor",
      description: "No useful work remains; do not call next.",
    },
    {
      id: "align-cmd-align",
      from: "align",
      event: "CMD_ALIGN",
      to: "editor",
      label: "/align",
      description: "Manual mode command escape hatch; records ALIGN mode; returns to editor standby.",
      userMediated: true,
    },
    {
      id: "align-cmd-spec",
      from: "align",
      event: "CMD_SPEC",
      to: "editor",
      label: "/spec",
      description: "Manual mode command escape hatch; switches to SPEC mode; returns to editor standby.",
      userMediated: true,
    },
    {
      id: "align-cmd-vibe",
      from: "align",
      event: "CMD_VIBE",
      to: "editor",
      label: "/vibe",
      description: "Manual mode command escape hatch; switches to VIBE mode; returns to editor standby.",
      userMediated: true,
    },
    {
      id: "align-cmd-mode",
      from: "align",
      event: "CMD_MODE",
      to: "editor",
      label: "/mode",
      description: "Manual mode picker command; opens picker in editor standby.",
      userMediated: true,
    },
    {
      id: "align-cmd-handoff",
      from: "align",
      event: "CMD_HANDOFF",
      to: "handoff",
      label: "/handoff",
      description: "Explicit handoff command; swaps session onto named plan.",
      userMediated: true,
    },
    // SPEC
    {
      id: "spec-closeout",
      from: "spec",
      event: "CLOSE_OUT",
      to: "closeOut",
      label: "CLOSE_OUT",
      description: "Preferred end-of-phase path: reconcile and optionally CALL next.",
    },
    {
      id: "spec-blocked",
      from: "spec",
      event: "BLOCKED",
      to: "blocked",
      label: "BLOCKED",
      description: "Missing evidence or decision; stop without widening scope.",
    },
    {
      id: "spec-no-work",
      from: "spec",
      event: "NO_WORK",
      to: "editor",
      label: "Proposal returned",
      description: "Agent completes proposal without CALL next; returns to editor.",
    },
    {
      id: "spec-next-align",
      from: "spec",
      event: "NEXT_ALIGN",
      to: "align",
      label: "next → ALIGN",
      description: "Direct next from SPEC; preferred agent path still runs CLOSE_OUT first.",
      userMediated: true,
    },
    {
      id: "spec-next-spec",
      from: "spec",
      event: "NEXT_SPEC",
      to: "spec",
      label: "next → SPEC",
      description: "Continue SPEC via recommended next prompt.",
      userMediated: true,
    },
    {
      id: "spec-next-vibe",
      from: "spec",
      event: "NEXT_VIBE",
      to: "vibe",
      label: "next → VIBE",
      description: "User selects recommended SPEC→VIBE next action.",
      userMediated: true,
    },
    {
      id: "spec-next-handoff",
      from: "spec",
      event: "NEXT_HANDOFF",
      to: "editor",
      label: "next → handoff prep",
      description: "Picker prepares /handoff command for user execution.",
      userMediated: true,
    },
    {
      id: "spec-picker-dismiss",
      from: "spec",
      event: "PICKER_DISMISS",
      to: "editor",
      label: "Picker dismiss/unrecommended",
      description: "User dismisses picker or picks unrecommended action without prompt; stays in editor.",
      userMediated: true,
    },
    {
      id: "spec-cmd-align",
      from: "spec",
      event: "CMD_ALIGN",
      to: "editor",
      label: "/align",
      description: "User escape hatch to ALIGN; returns to editor standby.",
      userMediated: true,
    },
    {
      id: "spec-cmd-spec",
      from: "spec",
      event: "CMD_SPEC",
      to: "editor",
      label: "/spec",
      description: "Manual re-assert SPEC; returns to editor standby.",
      userMediated: true,
    },
    {
      id: "spec-cmd-vibe",
      from: "spec",
      event: "CMD_VIBE",
      to: "editor",
      label: "/vibe",
      description: "User escape hatch to VIBE; returns to editor standby after mode change.",
      userMediated: true,
    },
    {
      id: "spec-cmd-mode",
      from: "spec",
      event: "CMD_MODE",
      to: "editor",
      label: "/mode",
      description: "Manual mode picker command; opens picker in editor standby.",
      userMediated: true,
    },
    {
      id: "spec-cmd-handoff",
      from: "spec",
      event: "CMD_HANDOFF",
      to: "handoff",
      label: "/handoff",
      description: "Explicit handoff command; swaps session onto named plan.",
      userMediated: true,
    },
    // VIBE
    {
      id: "vibe-closeout",
      from: "vibe",
      event: "CLOSE_OUT",
      to: "closeOut",
      label: "CLOSE_OUT",
      description: "Preferred end-of-phase path: reconcile and optionally CALL next.",
    },
    {
      id: "vibe-blocked",
      from: "vibe",
      event: "BLOCKED",
      to: "blocked",
      label: "BLOCKED",
      description: "Unfixable in-scope failure or consequential stop.",
    },
    {
      id: "vibe-no-work",
      from: "vibe",
      event: "NO_WORK",
      to: "editor",
      label: "Implementation returned",
      description: "Agent completes work without CALL next; returns to editor.",
    },
    {
      id: "vibe-next-align",
      from: "vibe",
      event: "NEXT_ALIGN",
      to: "align",
      label: "next → ALIGN",
      description: "Decision review or re-clarify via next (prefer after CLOSE_OUT).",
      userMediated: true,
    },
    {
      id: "vibe-next-spec",
      from: "vibe",
      event: "NEXT_SPEC",
      to: "spec",
      label: "next → SPEC",
      description: "More research needed via next (prefer after CLOSE_OUT).",
      userMediated: true,
    },
    {
      id: "vibe-next-vibe",
      from: "vibe",
      event: "NEXT_VIBE",
      to: "vibe",
      label: "next → VIBE",
      description: "Continue VIBE via recommended next prompt.",
      userMediated: true,
    },
    {
      id: "vibe-next-handoff",
      from: "vibe",
      event: "NEXT_HANDOFF",
      to: "editor",
      label: "next → handoff prep",
      description: "Picker prepares /handoff from VIBE.",
      userMediated: true,
    },
    {
      id: "vibe-picker-dismiss",
      from: "vibe",
      event: "PICKER_DISMISS",
      to: "editor",
      label: "Picker dismiss/unrecommended",
      description: "User dismisses picker or picks unrecommended action without prompt; stays in editor.",
      userMediated: true,
    },
    {
      id: "vibe-cmd-align",
      from: "vibe",
      event: "CMD_ALIGN",
      to: "editor",
      label: "/align",
      description: "User escape hatch to ALIGN; returns to editor standby.",
      userMediated: true,
    },
    {
      id: "vibe-cmd-spec",
      from: "vibe",
      event: "CMD_SPEC",
      to: "editor",
      label: "/spec",
      description: "User escape hatch to SPEC; returns to editor standby after mode change.",
      userMediated: true,
    },
    {
      id: "vibe-cmd-vibe",
      from: "vibe",
      event: "CMD_VIBE",
      to: "editor",
      label: "/vibe",
      description: "Manual re-assert VIBE; returns to editor standby.",
      userMediated: true,
    },
    {
      id: "vibe-cmd-mode",
      from: "vibe",
      event: "CMD_MODE",
      to: "editor",
      label: "/mode",
      description: "Manual mode picker command; opens picker in editor standby.",
      userMediated: true,
    },
    {
      id: "vibe-cmd-handoff",
      from: "vibe",
      event: "CMD_HANDOFF",
      to: "handoff",
      label: "/handoff",
      description: "Explicit handoff command; swaps session onto named plan.",
      userMediated: true,
    },
    // BLOCKED
    {
      id: "blocked-closeout",
      from: "blocked",
      event: "CLOSE_OUT",
      to: "closeOut",
      label: "CLOSE_OUT",
      description: "Record blockage then close out with ALIGN often recommended.",
    },
    {
      id: "blocked-unblock-spec",
      from: "blocked",
      event: "DECIDE_CONTINUE_SPEC",
      to: "spec",
      label: "Decide unblocks → SPEC",
      description: "Decide auto-picks working choice that unblocks research; continue SPEC.",
    },
    {
      id: "blocked-unblock-vibe",
      from: "blocked",
      event: "DECIDE_CONTINUE_VIBE",
      to: "vibe",
      label: "Decide unblocks → VIBE",
      description: "Decide auto-picks working choice that unblocks execution; continue VIBE.",
    },
    // CLOSE_OUT routing
    {
      id: "closeout-next-align",
      from: "closeOut",
      event: "NEXT_ALIGN",
      to: "align",
      label: "next → ALIGN",
      description: "Actionable review or follow-up clarification; or unresolved D review.",
      userMediated: true,
    },
    {
      id: "closeout-next-spec",
      from: "closeOut",
      event: "NEXT_SPEC",
      to: "spec",
      label: "next → SPEC",
      description: "More research/proposal work remains.",
      userMediated: true,
    },
    {
      id: "closeout-next-vibe",
      from: "closeOut",
      event: "NEXT_VIBE",
      to: "vibe",
      label: "next → VIBE",
      description: "Implementation work remains.",
      userMediated: true,
    },
    {
      id: "closeout-next-handoff",
      from: "closeOut",
      event: "NEXT_HANDOFF",
      to: "editor",
      label: "next → handoff prep",
      description: "Picker prepares /handoff from post-turn picker.",
      userMediated: true,
    },
    {
      id: "closeout-picker-dismiss",
      from: "closeOut",
      event: "PICKER_DISMISS",
      to: "editor",
      label: "Picker dismiss/unrecommended",
      description: "User dismisses picker or picks unrecommended action without prompt; stays in editor.",
      userMediated: true,
    },
    {
      id: "closeout-complete",
      from: "closeOut",
      event: "ALL_COMPLETE",
      to: "editor",
      label: "Complete",
      description: "No next call; return to editor.",
    },
    // HANDOFF
    {
      id: "handoff-continue",
      from: "handoff",
      event: "SESSION_CONTINUED",
      to: "align",
      label: "Fresh ALIGN",
      description: "Replacement session starts in ALIGN on the same artifact.",
    },
    // EDITOR re-entry & commands
    {
      id: "editor-user-align",
      from: "editor",
      event: "USER_MESSAGE_ALIGN",
      to: "align",
      label: "User message (ALIGN)",
      description: "User sends message while mode is ALIGN (or initial default).",
      userMediated: true,
    },
    {
      id: "editor-user-spec",
      from: "editor",
      event: "USER_MESSAGE_SPEC",
      to: "spec",
      label: "User message (SPEC)",
      description: "User sends message while mode is SPEC.",
      userMediated: true,
    },
    {
      id: "editor-user-vibe",
      from: "editor",
      event: "USER_MESSAGE_VIBE",
      to: "vibe",
      label: "User message (VIBE)",
      description: "User sends message while mode is VIBE.",
      userMediated: true,
    },
    {
      id: "editor-cmd-align",
      from: "editor",
      event: "CMD_ALIGN",
      to: "editor",
      label: "/align",
      description: "Manual mode command switches mode to ALIGN; stays in editor.",
      userMediated: true,
    },
    {
      id: "editor-cmd-spec",
      from: "editor",
      event: "CMD_SPEC",
      to: "editor",
      label: "/spec",
      description: "Manual mode command switches mode to SPEC; stays in editor.",
      userMediated: true,
    },
    {
      id: "editor-cmd-vibe",
      from: "editor",
      event: "CMD_VIBE",
      to: "editor",
      label: "/vibe",
      description: "Manual mode command switches mode to VIBE; stays in editor.",
      userMediated: true,
    },
    {
      id: "editor-cmd-mode",
      from: "editor",
      event: "CMD_MODE",
      to: "editor",
      label: "/mode",
      description: "Manual mode command opens mode picker; stays in editor.",
      userMediated: true,
    },
    {
      id: "editor-cmd-handoff",
      from: "editor",
      event: "CMD_HANDOFF",
      to: "handoff",
      label: "/handoff",
      description: "User runs /handoff; initiates session handoff on named plan.",
      userMediated: true,
    },
  ],
  tools: [
    {
      name: "ask",
      summary: "Native ALIGN questions; answers, cancel, or Proceed-with-best SPEC/VIBE route.",
      modes: ["align"],
      gate: [
        "ALIGN-only; SPEC/VIBE ask is a harmless no-op (no picker).",
        "Empty ask is a harmless no-op.",
        "Non-empty ask requires a named session plan file; otherwise error without picker.",
        "Interactive UI required only when questions will be shown.",
      ],
      mechanics: [
        "CALL ask without sibling tools so cancellation or a direct SPEC/VIBE route can settle cleanly.",
        "KEEP question identifiers, option values, and option labels distinct.",
        "NEVER imitate native action labels.",
        "USE customAnswerLabel for User-supplied detail; NEVER offer a selectable option that merely says specify.",
        "BATCH only independent questions; dependent follow-ups in a later CALL.",
        "An optionless ask question offers custom input but no Proceed-with-best route.",
        "Proceed-with-best accepts prior answers plus remaining highest-confidence answers and starts fresh SPEC/VIBE.",
        "Agent persists User-transcript meaning; runtime does not write the User transcript.",
      ],
    },
    {
      name: "decide",
      summary: "SPEC/VIBE auto-pick highest-confidence option; that call IS RECORD_DECISION.",
      modes: ["spec", "vibe"],
      gate: [
        "SPEC/VIBE-only; ALIGN decide is a harmless no-op.",
        "Empty decide is a harmless no-op.",
        "Optionless decide is a harmless no-op.",
        "Non-empty decide with options requires a named session plan file; otherwise error.",
      ],
      mechanics: [
        "Never opens a picker and never changes mode.",
        "Auto-picks the highest-confidence option per question.",
        "Records agent-workflow:decision and appends Agent transcript after start.",
        "Leaves D review unresolved until explicit ALIGN acceptance.",
      ],
    },
    {
      name: "start",
      summary: "First .pi/plan write: named artifact or linked legacy continuation.",
      modes: ["any"],
      gate: ["Creates or continues the named plan; no plan file exists until start succeeds."],
      mechanics: [
        "CALL start with a context-informed 2-4 word task name; include a ticket ID when applicable.",
        "start is the first CALL tool when no named artifact exists.",
        "Legacy artifacts stay immutable; start forks a linked current-format continuation.",
      ],
    },
    {
      name: "next",
      summary: "Queue ranked post-turn actions; runtime opens picker only for explicit next.",
      modes: ["any"],
      gate: [
        "Empty next records no recommendation and opens no picker.",
        "Non-empty next requires valid targets and prompts; requires named session plan.",
        "Every ALIGN/SPEC/VIBE action needs contextual prompt; handoff must omit prompt.",
      ],
      mechanics: [
        "Agent-authored actions REQUIRE a user-facing reason (plain English; Q/C/D ids only as trailing [] or ()) and contextual instructions for ALIGN/SPEC/VIBE; OMIT instruction for handoff.",
        "Runtime PREPENDS only Switch or Continue context and NEVER authors substantive direction.",
        "Recommended row with a reason shows {mode} — {reason}.",
        "Prefer CALL next from CLOSE_OUT; runtime still opens the picker if next is called from ALIGN/SPEC/VIBE directly.",
        "Manual ALIGN/SPEC/VIBE commands and unrecommended picker choices return to the editor.",
        "Manual mode commands accept no unanswered recommendation or unresolved D review (escape hatches).",
        "Only a recommended next prompt starts the agent.",
        "Duplicate next modes collapse; picker-selected handoff prepares /handoff for explicit User execution.",
        "Ask-routed SPEC/VIBE and /handoff still auto-start.",
      ],
    },
  ],
  artifact: {
    sections: [
      "Goal",
      "Align",
      "Decisions",
      "Evidence",
      "Proposal",
      "Checklist",
      "Work log",
      "User transcript",
      "Agent transcript",
    ],
    identifiers: {
      Q: "Stable immutable question id (e.g. Q1)",
      D: "Stable immutable decision id (e.g. D1)",
      C: "Stable immutable checklist outcome id (e.g. C1)",
    },
    rules: [
      "PRESERVE historical prose and APPEND lifecycle developments instead of rewriting history.",
      "KEEP Decisions as the concise accepted synthesis of User answers and reviewed Agent choices.",
      "INTERPRET status from the artifact as a whole.",
      "TREAT CLOSE_OUT as a procedure, not an artifact section.",
    ],
  },
  initial: "editor",
  notes: [
    "Persisted User mode is only align|spec|vibe. closeOut, blocked, handoff, and editor are procedural/standby states for the shared flow chart.",
    "session.scope and session.review are Agent-tracked meaning, not runtime-parsed fields.",
    "Transition table covers the runtime surface (next and CMD_* from each mode). Preferred agent path still ends SPEC/VIBE via CLOSE_OUT before CALL next.",
    "Counts, confidence, uniqueness, concise text, identifiers, and naming quality are Agent responsibilities.",
    "IF a tool call is rejected THEN CORRECT it, RETRY once, and NEVER claim the rejected action succeeded.",
    "tools validate required shapes and protocol enums, not workflow quality.",
  ],
};

/** JSON snapshot for visualizers, build content, and external diagram tools. */
export function serializeWorkflowFsm(space = 2): string {
  return `${JSON.stringify(WORKFLOW_FSM, null, space)}\n`;
}

/** Mermaid stateDiagram-v2 from the same transition table agents follow. */
export function toMermaid(): string {
  const lines: string[] = ["stateDiagram-v2", `  [*] --> ${WORKFLOW_FSM.initial}`];
  for (const state of Object.values(WORKFLOW_FSM.states)) {
    lines.push(`  ${state.id}: ${state.label}`);
  }
  for (const edge of WORKFLOW_FSM.transitions) {
    const tag = edge.userMediated ? `${edge.event} / user` : edge.event;
    lines.push(`  ${edge.from} --> ${edge.to}: ${tag}`);
  }
  return `${lines.join("\n")}\n`;
}

/** Agent-facing contract: readable procedures + the shareable transition table. */
export function formatWorkflowPrompt(fsm: WorkflowFsm = WORKFLOW_FSM): string {
  const lines: string[] = [
    `# ${fsm.title} (FSM v${fsm.version})`,
    "",
    fsm.summary,
    "",
    "## Session state",
    `- mode := ${fsm.session.mode}`,
    `- artifact := ${fsm.session.artifact}`,
    `- scope := ${fsm.session.scope}`,
    `- review := ${fsm.session.review}`,
    "",
    "## Ownership",
    ...fsm.ownership.map((item) => `- ${item}`),
    "",
    "## Invariants",
    ...fsm.invariants.map((item) => `- ${item}`),
    "",
    "## Always",
    ...fsm.always.map((item) => `- ${item}`),
    "",
    "## Turn",
    ...fsm.turn.map((item) => `- ${item}`),
    "",
    "## Shared procedures",
  ];

  for (const [name, steps] of Object.entries(fsm.procedures)) {
    lines.push("", `### ${name}`, ...steps.map((step) => `- ${step}`));
  }

  lines.push("", "## States", "");
  for (const state of Object.values(fsm.states)) {
    lines.push(`### ${state.label} (${state.id}, ${state.kind}, ${state.permission})`, state.summary, "");
    if (state.substates?.length) {
      lines.push(`Substates: ${state.substates.join(" → ")}`, "");
    }
    lines.push(...state.procedure.map((step) => `- ${step}`), "");
  }

  lines.push("## Transitions", "Canonical edges (visualizer and agent use this table):", "");
  for (const edge of fsm.transitions) {
    const who = edge.userMediated ? "user-mediated" : "agent/procedure";
    lines.push(`- ${edge.from} --${edge.event}--> ${edge.to} [${who}]: ${edge.description}`);
  }

  lines.push("", "## Tools");
  for (const tool of fsm.tools) {
    lines.push(
      "",
      `### ${tool.name}`,
      tool.summary,
      "",
      "Gate:",
      ...tool.gate.map((g) => `- ${g}`),
      "",
      "Mechanics:",
      ...tool.mechanics.map((m) => `- ${m}`),
    );
  }

  lines.push(
    "",
    "## Artifact",
    `Sections: ${fsm.artifact.sections.join(", ")}.`,
    `Identifiers: Q=${fsm.artifact.identifiers.Q}; D=${fsm.artifact.identifiers.D}; C=${fsm.artifact.identifiers.C}.`,
    ...fsm.artifact.rules.map((rule) => `- ${rule}`),
    "",
    "## Notes",
    ...fsm.notes.map((note) => `- ${note}`),
  );

  return lines.join("\n").trimEnd();
}

export function workflowPrompt(): string {
  return `<pi_workflow>\n${formatWorkflowPrompt()}\n</pi_workflow>`;
}
