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
 *
 * v2.6.1 — primary homes + secondary gates:
 * - ALIGN: envision (entry: start then ≥1 scope ask) → evaluate (primary, later asks) ⇄ establish (secondary / next; never ask)
 * - SPEC: explore (primary) ⇄ elaborate (secondary / next)
 * - VIBE: execute (primary) ⇄ examine (secondary / next)
 * - In-mode body edges are bidirectional mode-named events (ALIGN / SPEC / VIBE)
 * - next only from secondaries; never recommend current mode
 * - Align dual landing: NEXT_ALIGN → establish (idle); RETURN_ALIGN → evaluate (D-review ask)
 */

export const WORKFLOW_FSM_VERSION = "2.6.1";

export type FsmStateId = "envision" | "establish" | "explore" | "elaborate" | "execute" | "examine" | "evaluate";

export type FsmUserMode = "align" | "spec" | "vibe";

/** Guided graph node (not a persisted User mode). */
export type FsmStateKind = "guided";

/** Project-file permission. All modes may update `.pi` plan state; only write may change project files. */
export type FsmPermission = "read" | "write";

/** Role within a User mode body (envision is entry-only, not a repeating home). */
export type FsmStateRole = "entry" | "primary" | "secondary";

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
  /** In-mode primary⇄secondary body loop; both directions are valid (from=primary, to=secondary). */
  bidirectional?: boolean;
}

export interface FsmState {
  id: FsmStateId;
  label: string;
  kind: FsmStateKind;
  /** Persisted User mode this guided step belongs to. */
  userMode: FsmUserMode;
  /** entry = session/handoff once (start + scope ask); primary = mode home; secondary = gate (verify/next). */
  role: FsmStateRole;
  summary: string;
  /**
   * Project-file permission:
   * - read: may update `.pi` plan only; do not change project files
   * - write: may change project files (VIBE)
   */
  permission: FsmPermission;
  /** Ordered agent procedure lines (imperative; injected into prompt) */
  procedure: string[];
  substates?: string[];
}

export interface FsmModeBody {
  mode: FsmUserMode;
  label: string;
  /** Ordered guided state ids that compose this User mode body. */
  states: FsmStateId[];
  /** Primary home landed after next→this mode (omitted for entry-only steps). */
  primary?: FsmStateId;
  /** Secondary gate that may CALL next (omitted when none). */
  secondary?: FsmStateId;
  /** How to run when this mode is active. */
  steps: string[];
}

export interface FsmToolSpec {
  name: "ask" | "decide" | "start" | "next";
  summary: string;
  modes: Array<"align" | "spec" | "vibe" | "any">;
  gate: string[];
  mechanics: string[];
}

export interface FsmException {
  command: string;
  label: string;
  summary: string;
  description: string;
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
  /** User mode → guided steps (injected into the agent prompt). */
  modeBodies: FsmModeBody[];
  procedures: Record<string, string[]>;
  states: Record<FsmStateId, FsmState>;
  transitions: FsmTransition[];
  exceptions: {
    title: string;
    summary: string;
    commands: FsmException[];
    rules: string[];
  };
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
    "Each mode has a primary home and a secondary gate: primaries do the work; secondaries capture/verify and CALL next. " +
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
    "The /mode command is the universal manual bypass to open the option picker and choose what to do next.",
    "Manual /mode bypass transitions are User-owned escape hatches — never gated on workflow completeness or unresolved D reviews.",
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
    "ONLY secondary gates (establish, elaborate, examine) may CALL next; primaries never CALL next.",
    "NEVER recommend the current persisted mode in next actions; same-mode stay is ESC, Return to editor, or /mode.",
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
    "RUN the modeBodies entry for the persisted User mode (align | spec | vibe).",
  ],
  modeBodies: [
    {
      mode: "align",
      label: "ALIGN",
      states: ["envision", "evaluate", "establish"],
      primary: "evaluate",
      secondary: "establish",
      steps: [
        "IF session entry (new interactive session, handoff continue, or envision not yet run): RUN envision once — orientation, start/reuse artifact, then CALL ask ≥1 goal-scope question; never ask before start.",
        "IF envision Ask routes directly to SPEC or VIBE THEN settle into that mode's primary (explore or execute); on cancel RETURN without evaluate.",
        "AFTER envision scope is answered (not routed): PROCEED to evaluate.",
        "RUN evaluate (primary home): check artifact for unresolved D review, Checklist gaps, residuals; CALL ask for D-review, User-requested clarification, RECONCILE_SCOPE, or follow-ups — do not re-fish entry scope already captured in envision; NEVER CALL next from evaluate.",
        "IF evaluate Ask routes directly to SPEC or VIBE THEN settle into that mode's primary (explore or execute).",
        "WHEN ready to leave Align or to confirm routing after ask: RUN establish (secondary gate).",
        "establish: NEVER CALL ask; either RETURN to evaluate (more primary/ask work) or CALL next with other modes + handoff only (never align).",
        "Same-mode stay: do not CALL next with align; User uses ESC/Return or /mode.",
      ],
    },
    {
      mode: "spec",
      label: "SPEC",
      states: ["explore", "elaborate"],
      primary: "explore",
      secondary: "elaborate",
      steps: [
        "Land on and RUN explore (primary): bounded research into Evidence; decide for material autonomous choices when needed.",
        "WHEN ready to propose or route: RUN elaborate (secondary).",
        'elaborate: draft Proposal/Checklist, RECORD_DECISION as needed, RUN CLOSE_OUT, then either RETURN to explore (more research) or CALL next with other modes only (never spec). Default Align landing is establish (editor standby, landing:"establish", no auto-start). Only when unresolved D ids exist: Align landing evaluate (landing:"evaluate", prompt lists D ids, auto-start ask).',
      ],
    },
    {
      mode: "vibe",
      label: "VIBE",
      states: ["execute", "examine"],
      primary: "execute",
      secondary: "examine",
      steps: [
        "Land on and RUN execute (primary): implement accepted scope; decide for material autonomous choices when needed.",
        "WHEN ready to verify or route: RUN examine (secondary).",
        "examine: run checks, RECORD evidence, RUN CLOSE_OUT, then either RETURN to execute (more implementation) or CALL next with other modes only (never vibe). Default Align landing is establish (editor standby). Only when unresolved D ids exist: Align landing evaluate with those D ids in prompt (auto-start ask).",
      ],
    },
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
      "IF mode = ALIGN THEN CALL ask from evaluate with concrete keep/defer/replace/resolve options; on cancel RETURN unresolved; else APPEND full exchange to User transcript; RECORD synthesis in Goal, Align, Decisions, Checklist; ANNOTATE superseded/deferred/skipped/failed C with reasons; NEVER erase; RETURN resolved.",
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
      "IF actionable work remains THEN CALL next from the current secondary gate with ranked other modes and handoff only — NEVER include the current persisted mode.",
      'Align dual landing (C12): default align action uses landing "establish" (editor standby, prompt optional, no auto-start). Only if unresolved D items need acceptance: a separate align action with landing "evaluate", prompt that LISTS those D ids, auto-start ask — do not invent extra questions.',
      "Spec/Vibe actions still need plain-English reason and contextual prompt; handoff omits prompt. Runtime prepends Switch context only when auto-starting.",
      "ELSE IF more work remains in the current mode THEN RETURN to the mode primary (do not CALL next with the current mode).",
      "ELSE DO NOT CALL next.",
      "ENSURE artifact is resumable and final output is truthful and concise.",
    ],
    HANDOFF: [
      "IF no named artifact exists THEN DO NOT invent a temporary plan; RETURN without handing off.",
      "IF artifact is current format THEN USE the already-written artifact; DO NOT start a checkpoint turn; KEEP leftover current-format files as-is.",
      "ELSE DO NOT mutate the legacy artifact.",
      "CONTINUE in fresh ALIGN with the ordinary continue line (envision: artifact ready → ≥1 scope ask → evaluate).",
      "READ the whole current artifact or immutable legacy reference.",
      "Envision still CALL ask ≥1 about goal scope ahead after reusing the artifact; choose the most important unresolved scope item for that question.",
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
    envision: {
      id: "envision",
      label: "ENVISION",
      kind: "guided",
      userMode: "align",
      role: "entry",
      summary:
        "Session entry only: capture goal, bounded orientation, start/reuse artifact, then CALL ask ≥1 about goal scope ahead before evaluate.",
      permission: "read",
      substates: ["goalCapture", "orientation", "ensureArtifact", "scopeAsk"],
      procedure: [
        "Run once per new interactive session or handoff continue — not a repeating Align loop peer.",
        "Capture user goal and intent when present.",
        "READ only bounded AGENTS.md, .pi state including MEMORY.md, README, named plans, or documentation for orientation.",
        "AFTER orientation reads, IF no named artifact exists THEN CALL start exactly once; ELSE reuse the existing named artifact.",
        "AFTER the named artifact exists: CALL ask with at least one independent question about goal scope ahead (outcomes, constraints, boundaries). NEVER ask before start.",
        "APPEND every completed prompt, context, displayed option, confidence, and exact answer to User transcript.",
        "SYNTHESIZE into Goal, Align, Decisions, and Checklist after answers.",
        "ASK dependent follow-ups in a later CALL only when still required before leaving envision.",
        "IF Ask routes directly to SPEC or VIBE THEN proceed to EXPLORE or EXECUTE (skip evaluate).",
        "On ask cancel: RETURN without evaluate and without calling next; do not invent scope.",
        "WHEN ≥1 scope ask is answered and not routed: PROCEED to EVALUATE (Align primary home).",
      ],
    },
    evaluate: {
      id: "evaluate",
      label: "EVALUATE",
      kind: "guided",
      userMode: "align",
      role: "primary",
      summary:
        "Align primary home: artifact check and later asks (D-review, User-driven, reconcile); PWB routes; never CALL next.",
      permission: "read",
      substates: ["artifactCheck", "askLoop", "synthesize"],
      procedure: [
        "Land here after envision scope ask is answered, after RETURN_ALIGN (landing evaluate), and after establish returns via the ALIGN body edge.",
        "READ Goal, Decisions (unresolved D), Checklist, Work log residuals, Current work, and the kickoff prompt if any.",
        "IF kickoff/review lists specific D ids: CALL ask ONLY to accept/change/defer those Ds — do not invent new scope questions.",
        "ELSE IF the User message explicitly requests clarification: CALL ask for that request only.",
        "ELSE IF RECONCILE_SCOPE needs User keep/defer/replace/resolve options: CALL ask for that only.",
        "ELSE IF no User answers are required: do NOT CALL ask; summarize briefly and PROCEED to ESTABLISH or RETURN idle.",
        "NEVER re-fish entry goal-scope questions already captured in envision; NEVER invent fishing questions on entry.",
        "ASK dependent follow-ups in a later CALL only when still required after answers.",
        "APPEND every completed prompt, context, displayed option, confidence, and exact answer to User transcript.",
        "SYNTHESIZE into Goal, Align, Decisions, and Checklist after answers.",
        "IF Ask routes directly to SPEC or VIBE THEN proceed to EXPLORE or EXECUTE.",
        "On ask cancel: RETURN without calling next.",
        "NEVER CALL next from evaluate — when ready to leave Align or confirm routing, PROCEED to ESTABLISH.",
      ],
    },
    establish: {
      id: "establish",
      label: "ESTABLISH",
      kind: "guided",
      userMode: "align",
      role: "secondary",
      summary:
        "Align secondary gate and idle landing from Spec/Vibe next (editor standby); return to evaluate or CALL next/handoff — never ask.",
      permission: "read",
      substates: ["gateCheck", "routeNext"],
      procedure: [
        "Land here after next Align idle (NEXT_ALIGN, landing establish, no auto-start) and after evaluate proceeds on the ALIGN body edge.",
        "NEVER CALL ask from establish — entry scope ask is envision; other Align asks run in evaluate.",
        "IF more Align primary or ask work remains THEN RETURN to EVALUATE.",
        "WHEN ready to leave Align: CALL next with ranked other modes and handoff only — NEVER include align.",
        "Idle landing: wait for User message or next; do not invent work.",
      ],
    },
    explore: {
      id: "explore",
      label: "EXPLORE",
      kind: "guided",
      userMode: "spec",
      role: "primary",
      summary:
        "Spec primary home: codebase research and fact-finding; update the plan only — no project file mutations.",
      permission: "read",
      substates: ["symbolSearch", "evidenceGathering"],
      procedure: [
        "Land here after next→Spec, ask-route→Spec, and after elaborate returns for more research.",
        "BEGIN with one bounded exact symbol or path search.",
        "BROADEN only for a named unresolved reason and STOP when evidence answers it.",
        "EXCLUDE node_modules, generated, vendor, cache trees, and source maps unless explicitly targeted.",
        "RECORD findings in Evidence section; DO NOT mutate files outside .pi.",
        "FOR material autonomous choices RUN RECORD_DECISION (decide) while researching when needed.",
        "NEVER CALL next from explore — WHEN ready to propose or route, PROCEED to ELABORATE.",
      ],
    },
    elaborate: {
      id: "elaborate",
      label: "ELABORATE",
      kind: "guided",
      userMode: "spec",
      role: "secondary",
      summary: "Spec secondary gate: synthesize proposal, CLOSE_OUT, return to explore or CALL next (not Spec).",
      permission: "read",
      substates: ["draftProposal", "checklistSynthesis", "closeOut"],
      procedure: [
        "EDIT Proposal and Checklist with the recommended approach.",
        "FOR EACH material autonomous choice RUN RECORD_DECISION(choice).",
        "RUN CLOSE_OUT.",
        "IF more research is required THEN RETURN to EXPLORE (do not CALL next with spec).",
        "ELSE CALL next with other modes only (never spec); prefer Align when D review is open; include handoff when useful.",
        "RETURN a concise proposal summary with artifact path.",
      ],
    },
    execute: {
      id: "execute",
      label: "EXECUTE",
      kind: "guided",
      userMode: "vibe",
      role: "primary",
      summary: "Vibe primary home: implement approved scope; scoped autonomous decisions (D); project file mutations.",
      permission: "write",
      substates: ["codeMutation", "recordDecision"],
      procedure: [
        "Land here after next→Vibe, ask-route→Vibe, and after examine returns for more implementation.",
        "IMPLEMENT accepted scope in project files outside .pi.",
        "FOR EACH material autonomous choice RUN RECORD_DECISION(choice).",
        "UPDATE cumulative Checklist and append-only Work log throughout implementation.",
        "NEVER CALL next from execute — WHEN ready to verify or route, PROCEED to EXAMINE.",
      ],
    },
    examine: {
      id: "examine",
      label: "EXAMINE",
      kind: "guided",
      userMode: "vibe",
      role: "secondary",
      summary: "Vibe secondary gate: checks, CLOSE_OUT, return to execute or CALL next (not Vibe).",
      permission: "write",
      substates: ["runChecks", "recordEvidence", "closeOut"],
      procedure: [
        "RUN the smallest appropriate repository checks, then broader retained checks when risk warrants.",
        "IF a check fails within scope THEN RETURN to EXECUTE to fix and continue; ELSE RUN BLOCKED(failure) and prefer next→Align.",
        "RECORD check evidence in Work log.",
        "RUN CLOSE_OUT.",
        "IF more implementation remains THEN RETURN to EXECUTE (do not CALL next with vibe).",
        "ELSE CALL next with other modes only (never vibe); prefer Align when D review or acceptance is needed; include handoff when useful.",
      ],
    },
  },
  transitions: [
    {
      id: "envision-ask-loop",
      from: "envision",
      event: "ASK_LOOP",
      to: "envision",
      label: "Scope ask follow-up",
      description:
        "Dependent entry scope questions stay in ENVISION until ≥1 scope ask is answered or ask routes away.",
    },
    {
      id: "envision-ask-route-spec",
      from: "envision",
      event: "PWB_SPEC",
      to: "explore",
      label: "PWB → EXPLORE",
      description: "Proceed-with-best from envision scope ask routes to SPEC primary (skips evaluate).",
      userMediated: true,
    },
    {
      id: "envision-ask-route-vibe",
      from: "envision",
      event: "PWB_VIBE",
      to: "execute",
      label: "PWB → EXECUTE",
      description: "Proceed-with-best from envision scope ask routes to VIBE primary (skips evaluate).",
      userMediated: true,
    },
    {
      id: "envision-to-evaluate",
      from: "envision",
      event: "ARTIFACT",
      to: "evaluate",
      label: "ARTIFACT → EVALUATE",
      description:
        "Named artifact exists and ≥1 goal-scope ask was answered after start/reuse; enter Align primary home.",
    },
    {
      id: "evaluate-ask-loop",
      from: "evaluate",
      event: "ASK_LOOP",
      to: "evaluate",
      label: "Ask follow-up",
      description: "Dependent follow-up questions stay in EVALUATE until answers are captured or ask routes away.",
    },
    {
      id: "evaluate-ask-route-spec",
      from: "evaluate",
      event: "PWB_SPEC",
      to: "explore",
      label: "PWB → EXPLORE",
      description: "Proceed-with-best from evaluate ask routes to SPEC primary.",
      userMediated: true,
    },
    {
      id: "evaluate-ask-route-vibe",
      from: "evaluate",
      event: "PWB_VIBE",
      to: "execute",
      label: "PWB → EXECUTE",
      description: "Proceed-with-best from evaluate ask routes to VIBE primary.",
      userMediated: true,
    },
    {
      id: "align-body",
      from: "evaluate",
      event: "ALIGN",
      to: "establish",
      label: "ALIGN",
      description:
        "Align mode body: primary ⇄ secondary gate — proceed to establish when ready for next/handoff; return to evaluate when more primary or ask work remains.",
      bidirectional: true,
    },
    {
      id: "establish-next-spec",
      from: "establish",
      event: "NEXT_SPEC",
      to: "explore",
      label: "next → EXPLORE",
      description: "User chooses SPEC from establish gate; lands on explore (primary). next never includes align.",
      userMediated: true,
    },
    {
      id: "establish-next-vibe",
      from: "establish",
      event: "NEXT_VIBE",
      to: "execute",
      label: "next → EXECUTE",
      description: "User chooses VIBE from establish gate; lands on execute (primary).",
      userMediated: true,
    },
    {
      id: "establish-handoff",
      from: "establish",
      event: "NEXT_HANDOFF",
      to: "envision",
      label: "next → handoff (new session ENVISION)",
      description:
        "Picker prepares /handoff; after the User runs it, a fresh session restarts at ENVISION on the same artifact.",
      userMediated: true,
    },
    {
      id: "spec-body",
      from: "explore",
      event: "SPEC",
      to: "elaborate",
      label: "SPEC",
      description:
        "Spec mode body: primary ⇄ secondary gate — proceed to elaborate when ready to propose/close out/route; return to explore when more research remains.",
      bidirectional: true,
    },
    {
      id: "elaborate-next-align",
      from: "elaborate",
      event: "NEXT_ALIGN",
      to: "establish",
      label: "next Align idle → ESTABLISH",
      description: "Default Align after proposal: editor standby on establish gate; no auto-start ask.",
      userMediated: true,
    },
    {
      id: "elaborate-return-align",
      from: "elaborate",
      event: "RETURN_ALIGN",
      to: "evaluate",
      label: "RETURN_ALIGN → EVALUATE",
      description: "Align return when unresolved D ids are listed; auto-start evaluate ask for those Ds only.",
      userMediated: true,
    },
    {
      id: "elaborate-next-vibe",
      from: "elaborate",
      event: "NEXT_VIBE",
      to: "execute",
      label: "CLOSE_OUT → next → EXECUTE",
      description: "User chooses VIBE after proposal; lands on execute (primary). next never includes spec.",
      userMediated: true,
    },
    {
      id: "elaborate-handoff",
      from: "elaborate",
      event: "NEXT_HANDOFF",
      to: "envision",
      label: "next → handoff (new session ENVISION)",
      description:
        "Picker prepares /handoff from Spec gate; after the User runs it, a fresh session restarts at ENVISION on the same artifact.",
      userMediated: true,
    },
    {
      id: "vibe-body",
      from: "execute",
      event: "VIBE",
      to: "examine",
      label: "VIBE",
      description:
        "Vibe mode body: primary ⇄ secondary gate — proceed to examine when ready for checks/close out/route; return to execute when more implementation or in-scope fixes remain.",
      bidirectional: true,
    },
    {
      id: "examine-next-align",
      from: "examine",
      event: "NEXT_ALIGN",
      to: "establish",
      label: "next Align idle → ESTABLISH",
      description: "Default Align after verification: editor standby on establish gate; no auto-start ask.",
      userMediated: true,
    },
    {
      id: "examine-return-align",
      from: "examine",
      event: "RETURN_ALIGN",
      to: "evaluate",
      label: "RETURN_ALIGN → EVALUATE",
      description: "Align return when unresolved D ids are listed; auto-start evaluate ask for those Ds only.",
      userMediated: true,
    },
    {
      id: "examine-next-spec",
      from: "examine",
      event: "NEXT_SPEC",
      to: "explore",
      label: "CLOSE_OUT → next → EXPLORE",
      description: "User chooses SPEC after verification; lands on explore (primary). next never includes vibe.",
      userMediated: true,
    },
    {
      id: "examine-handoff",
      from: "examine",
      event: "NEXT_HANDOFF",
      to: "envision",
      label: "next → handoff (new session ENVISION)",
      description:
        "Picker prepares /handoff from Vibe gate; after the User runs it, a fresh session restarts at ENVISION on the same artifact.",
      userMediated: true,
    },
  ],
  exceptions: {
    title: "Manual Bypass & Escape Hatches",
    summary:
      "The /mode command is the universal manual bypass. Running /mode opens the option picker at any time so the User can choose what to do next (jump to ALIGN, SPEC, VIBE, or hand off) without being gated by agent completion. next-driven pickers omit the current mode; /mode still lists all modes.",
    commands: [
      {
        command: "/mode",
        label: "Open Option Picker (Universal Bypass)",
        summary: "Opens the mode option picker to choose any target mode or action, including the current mode.",
        description:
          "User-triggered escape hatch. Opens the interactive option picker in editor standby with the full mode list (not cross-mode-filtered) so the User can switch mode, hand off, or return.",
      },
      {
        command: "/align",
        label: "Switch to ALIGN (standby)",
        summary: "Records ALIGN mode and returns to the editor without starting a turn.",
        description: "Manual escape hatch. Sets persisted mode to ALIGN and notifies; does not auto-start the agent.",
      },
      {
        command: "/spec",
        label: "Switch to SPEC (standby)",
        summary: "Records SPEC mode and returns to the editor without starting a turn.",
        description: "Manual escape hatch. Sets persisted mode to SPEC and notifies; does not auto-start the agent.",
      },
      {
        command: "/vibe",
        label: "Switch to VIBE (standby)",
        summary: "Records VIBE mode and returns to the editor without starting a turn.",
        description: "Manual escape hatch. Sets persisted mode to VIBE and notifies; does not auto-start the agent.",
      },
      {
        command: "/handoff [name]",
        label: "Direct Handoff Shortcut",
        summary: "Swaps active session onto a named plan in fresh ALIGN.",
        description:
          "Direct shortcut for session continuation on a named plan artifact, seeding a fresh ALIGN session at envision.",
      },
    ],
    rules: [
      "The /mode command is the canonical User-owned bypass to open the option picker and choose what to do next.",
      "Manual bypass transitions are never gated on workflow completeness, pending recommendations, or unresolved D items.",
      "next-driven pickers never offer the current mode; ESC and Return to editor stay in the current mode without starting the agent.",
      "Selecting an unrecommended mode in the picker switches the session mode in editor standby.",
      "Manual /align /spec /vibe only record mode and return to the editor; they do not start the agent.",
      "Direct /handoff swaps the plan file and seeds a fresh session in ALIGN (envision: artifact → scope ask → evaluate).",
    ],
  },
  tools: [
    {
      name: "start",
      summary: "First .pi/plan write triggered by user input on start: named artifact or linked legacy continuation.",
      modes: ["any"],
      gate: ["Creates or continues the named plan; no plan file exists until start succeeds."],
      mechanics: [
        "User input triggers start tool to create the named artifact before substantive ALIGN work.",
        "CALL start with a context-informed 2-4 word task name; include a ticket ID when applicable.",
        "start is the first CALL tool when no named artifact exists.",
        "Legacy artifacts stay immutable; start forks a linked current-format continuation.",
      ],
    },
    {
      name: "ask",
      summary: "Native ALIGN question loop; used from envision (entry scope after start) and evaluate (later asks).",
      modes: ["align"],
      gate: [
        "ALIGN-only; SPEC/VIBE ask is a harmless no-op (no picker).",
        "Empty ask is a harmless no-op.",
        "Non-empty ask requires a named session plan file; otherwise error without picker.",
        "Interactive UI required only when questions will be shown.",
      ],
      mechanics: [
        "NEVER CALL ask before start writes the named artifact.",
        "CALL ask from envision after start/reuse with ≥1 question about goal scope ahead; on answered (not routed) PROCEED to evaluate; on cancel RETURN.",
        "CALL ask from evaluate for D acceptance, User-requested clarification, RECONCILE_SCOPE, and follow-ups — not to re-fish entry scope.",
        "Answers stay in ALIGN; after evaluate capture continue evaluate or PROCEED to establish for next/handoff; NEVER CALL next from envision or evaluate.",
        "CALL ask without sibling tools so cancellation or a direct SPEC/VIBE route can settle cleanly.",
        "KEEP question identifiers, option values, and option labels distinct.",
        "NEVER imitate native action labels.",
        "USE customAnswerLabel for User-supplied detail; NEVER offer a selectable option that merely says specify.",
        "BATCH only independent questions; dependent follow-ups in a later CALL.",
        "An optionless ask question offers custom input but no Proceed-with-best route.",
        "Proceed-with-best accepts prior answers plus remaining highest-confidence answers and starts fresh SPEC/VIBE at that mode's primary.",
        "Agent persists User-transcript meaning; runtime does not write the User transcript.",
      ],
    },
    {
      name: "decide",
      summary: "Agent autonomous decision logger; records rationale and unblocks execution without prompt.",
      modes: ["spec", "vibe"],
      gate: [
        "SPEC/VIBE-only; ALIGN decide is a harmless no-op (no decision recorded).",
        "Empty decide is a harmless no-op.",
        "Optionless decide is a harmless no-op (compared options required).",
        "Non-empty decide with options requires a named session plan file; otherwise error.",
      ],
      mechanics: [
        "Never opens a picker and never changes mode.",
        "Auto-picks the highest-confidence option per question.",
        "Records agent-workflow:decision and appends under Agent transcript after start.",
        "Leaves D review unresolved until explicit ALIGN acceptance.",
      ],
    },
    {
      name: "next",
      summary:
        "Queue ranked post-turn actions from a secondary gate; user chooses another mode or handoff (never the current mode).",
      modes: ["any"],
      gate: [
        "Empty next records no recommendation and opens no picker.",
        "Non-empty next requires valid targets; requires named session plan.",
        "Spec/Vibe actions need contextual prompt; Align evaluate/review needs prompt listing D ids; Align establish/idle prompt optional; handoff must omit prompt.",
      ],
      mechanics: [
        "CALL next only from secondary gates (establish, elaborate, examine) after capture/verify/CLOSE_OUT as appropriate.",
        "NEVER include an action whose mode equals the current persisted mode; runtime filters those out on next-driven pickers.",
        'Align dual landing: landing "establish" (default) = editor standby, no auto-start; landing "evaluate" = auto-start ask review — prompt MUST list D ids only.',
        "Default post-Spec/Vibe Align recommendation is landing establish; use landing evaluate only when unresolved D acceptance is required.",
        "Agent-authored actions SHOULD include a user-facing reason; Spec/Vibe REQUIRE prompt; handoff OMITs prompt.",
        "Runtime PREPENDS only Switch context when auto-starting and NEVER authors substantive direction.",
        "Recommended row with a reason shows {mode} — {reason}. Two Align rows may appear (review vs editor).",
        "next→Align idle lands establish; next→Align review lands evaluate; next→Spec lands explore; next→Vibe lands execute.",
        "ESC dismiss and Return to editor stay in the current mode without starting the agent.",
        "/mode force picker still lists all modes including the current mode (bypass).",
        "Manual ALIGN/SPEC/VIBE commands return to the editor without auto-start.",
        "Only recommended actions with autostart (prompt + non-idle Align) start the agent.",
        "Picker-selected handoff prepares /handoff for explicit User execution.",
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
  initial: "envision",
  notes: [
    "Guided session story: envision (start → ≥1 scope ask) → mode primary ⇄ secondary gate → next to another mode's primary; Handoff = fresh session at envision on the same artifact. Idle product UI is not a graph node.",
    "Persisted User mode is only align|spec|vibe. Guided states compose modeBodies with roles entry|primary|secondary. closeOut, blocked, and handoff are procedural helpers — not peer session modes.",
    "Project permission is read|write only: read may update `.pi` plan state; write may change project files. All modes may edit the plan artifact.",
    "Only secondary gates establish/elaborate/examine CALL next. envision CALL ask ≥1 after start then ARTIFACT→evaluate (or PWB); evaluate CALL later asks and PWB; establish never asks. Spec/Vibe→Align: NEXT_ALIGN→establish (idle editor), RETURN_ALIGN→evaluate (ask). next never recommends the current mode. NEXT_HANDOFF from establish, elaborate, and examine → envision (/handoff prep).",
    "session.scope and session.review are Agent-tracked meaning, not runtime-parsed fields.",
    "Transition table is the guided graph only. Stay-in-mode via mode-body edges (ALIGN/SPEC/VIBE), ESC, Return to editor, ask cancel, and /mode are not same-mode NEXT edges. Manual /align /spec /vibe /mode bypasses live under Exceptions.",
    "Preferred agent path ends SPEC/VIBE via CLOSE_OUT on the secondary before CALL next.",
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
    const arrow = edge.bidirectional ? "<-->" : "-->";
    lines.push(`  ${edge.from} ${arrow} ${edge.to}: ${tag}`);
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
    "## Mode bodies",
    "Persisted User mode selects one body. Each body has an optional entry step, a primary home, and a secondary gate (next only from gates).",
  ];

  for (const body of fsm.modeBodies) {
    const roleBits = [
      body.primary ? `primary=${body.primary}` : undefined,
      body.secondary ? `secondary=${body.secondary}` : undefined,
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(
      "",
      `### ${body.label} (${body.mode})`,
      `Guided states: ${body.states.join(" → ")}${roleBits ? ` (${roleBits})` : ""}`,
      "",
      ...body.steps.map((step) => `- ${step}`),
    );
  }

  lines.push("", "## Shared procedures");

  for (const [name, steps] of Object.entries(fsm.procedures)) {
    lines.push("", `### ${name}`, ...steps.map((step) => `- ${step}`));
  }

  lines.push("", "## States", "");
  for (const state of Object.values(fsm.states)) {
    lines.push(
      `### ${state.label} (${state.id}, ${state.userMode}, ${state.role}, project ${state.permission})`,
      state.summary,
      "",
    );
    if (state.substates?.length) {
      lines.push(`Substates: ${state.substates.join(" → ")}`, "");
    }
    lines.push(...state.procedure.map((step) => `- ${step}`), "");
  }

  lines.push("## Transitions", "Canonical edges (visualizer and agent use this table):", "");
  for (const edge of fsm.transitions) {
    const who = edge.userMediated ? "user-mediated" : "agent/procedure";
    const link = edge.bidirectional
      ? `${edge.from} <--${edge.event}--> ${edge.to}`
      : `${edge.from} --${edge.event}--> ${edge.to}`;
    lines.push(`- ${link} [${who}]: ${edge.description}`);
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

  if (fsm.exceptions) {
    lines.push("", "## Exceptions & Escape Hatches", fsm.exceptions.summary, "");
    for (const cmd of fsm.exceptions.commands) {
      lines.push(`### ${cmd.command} (${cmd.label})`, cmd.description, "");
    }
    for (const rule of fsm.exceptions.rules) {
      lines.push(`- ${rule}`);
    }
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
