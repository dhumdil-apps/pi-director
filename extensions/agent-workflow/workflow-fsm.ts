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
 * v2.4.0 — primary homes + secondary gates:
 * - ALIGN: envision (entry) → evaluate (primary) ⇄ establish (secondary / next)
 * - SPEC: explore (primary) ⇄ elaborate (secondary / next)
 * - VIBE: execute (primary) ⇄ examine (secondary / next)
 * - next only from secondaries; never recommend current mode; land on target primary
 */

export const WORKFLOW_FSM_VERSION = "2.4.0";

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
}

export interface FsmState {
  id: FsmStateId;
  label: string;
  kind: FsmStateKind;
  /** Persisted User mode this guided step belongs to. */
  userMode: FsmUserMode;
  /** entry = session/handoff once; primary = mode home; secondary = gate (ask/verify/next). */
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
        "IF session entry (new interactive session, handoff continue, or envision not yet run): RUN envision once (orientation + start/reuse artifact), then evaluate.",
        "RUN evaluate (primary home): check artifact for unresolved D review, Checklist gaps, scope gaps, and residuals; NEVER CALL next or ask from evaluate.",
        "IF User answers or routing are needed: RUN establish (secondary gate).",
        "establish: CALL ask to capture answers when needed; synthesize Goal/Align/Decisions/Checklist/User transcript; then either RETURN to evaluate (more primary work) or CALL next with other modes + handoff only (never align).",
        "IF Ask routes directly to SPEC or VIBE THEN settle into that mode's primary (explore or execute).",
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
        "elaborate: draft Proposal/Checklist, RECORD_DECISION as needed, RUN CLOSE_OUT, then either RETURN to explore (more research) or CALL next with other modes only (never spec); prefer Align when D review is open.",
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
        "examine: run checks, RECORD evidence, RUN CLOSE_OUT, then either RETURN to execute (more implementation) or CALL next with other modes only (never vibe); prefer Align when D review or acceptance is needed.",
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
      "IF mode = ALIGN THEN ensure establish (secondary) will capture: CALL ask with concrete keep/defer/replace/resolve options; on cancel RETURN unresolved; else APPEND full exchange to User transcript; RECORD synthesis in Goal, Align, Decisions, Checklist; ANNOTATE superseded/deferred/skipped/failed C with reasons; NEVER erase; RETURN resolved.",
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
      "IF actionable work remains THEN CALL next from the current secondary gate with ranked other modes and handoff only — NEVER include the current persisted mode; each non-handoff action needs plain-English reason (Q/C/D ids only as trailing [] or ()) and a custom instruction grounded in current C/D, intended result, and verification target; runtime prepends Switch context only.",
      "ELSE IF decision review remains AND current mode is not ALIGN THEN SUMMARIZE and CALL next with ALIGN plus instruction grounded in unresolved D.",
      "ELSE IF more work remains in the current mode THEN RETURN to the mode primary (do not CALL next with the current mode).",
      "ELSE DO NOT CALL next.",
      "ENSURE artifact is resumable and final output is truthful and concise.",
    ],
    HANDOFF: [
      "IF no named artifact exists THEN DO NOT invent a temporary plan; RETURN without handing off.",
      "IF artifact is current format THEN USE the already-written artifact; DO NOT start a checkpoint turn; KEEP leftover current-format files as-is.",
      "ELSE DO NOT mutate the legacy artifact.",
      "CONTINUE in fresh ALIGN with the ordinary continue line (envision entry then evaluate).",
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
    envision: {
      id: "envision",
      label: "ENVISION",
      kind: "guided",
      userMode: "align",
      role: "entry",
      summary:
        "Session entry only: capture initial user goal, bounded orientation, and initialize or reuse the named artifact via start.",
      permission: "read",
      substates: ["goalCapture", "orientation", "ensureArtifact"],
      procedure: [
        "Run once per new interactive session or handoff continue — not a repeating Align loop peer.",
        "Capture user goal and intent when present.",
        "READ only bounded AGENTS.md, .pi state including MEMORY.md, README, named plans, or documentation for orientation.",
        "AFTER orientation reads, IF no named artifact exists THEN CALL start exactly once; ELSE reuse the existing named artifact.",
        "PROCEED to EVALUATE (Align primary home).",
      ],
    },
    evaluate: {
      id: "evaluate",
      label: "EVALUATE",
      kind: "guided",
      userMode: "align",
      role: "primary",
      summary:
        "Align primary home: check the artifact (D review, Checklist, scope gaps, residuals) and decide capture vs further primary work — never CALL next or ask here.",
      permission: "read",
      substates: ["artifactCheck", "routeCapture", "primaryWork"],
      procedure: [
        "Land here after envision, after next→Align, and after establish returns.",
        "READ Goal, Decisions (unresolved D), Checklist, Work log residuals, and Current work.",
        "NEVER CALL ask from evaluate — when User answers are needed, PROCEED to ESTABLISH.",
        "NEVER CALL next from evaluate — when ready to leave Align, PROCEED to ESTABLISH so the secondary gate may CALL next.",
        "IF more Align primary synthesis remains without User input THEN continue evaluate work, then ESTABLISH when capture or routing is required.",
      ],
    },
    establish: {
      id: "establish",
      label: "ESTABLISH",
      kind: "guided",
      userMode: "align",
      role: "secondary",
      summary:
        "Align secondary gate: capture answers via ask and/or CALL next to other modes or handoff; may return to evaluate.",
      permission: "read",
      substates: ["askLoop", "synthesize", "routeNext"],
      procedure: [
        "WHILE User answers are needed: CALL ask as the first User-facing action with 1-4 independent questions.",
        "ASK dependent follow-ups in a later CALL after incorporating earlier answers.",
        "APPEND every completed prompt, context, displayed option, confidence, and exact answer to User transcript.",
        "SYNTHESIZE into Goal, Align, Decisions, and Checklist after answers.",
        "IF Ask routes directly to SPEC or VIBE THEN proceed to EXPLORE or EXECUTE.",
        "IF more Align primary work remains THEN RETURN to EVALUATE.",
        "WHEN ready to leave Align: CALL next with ranked other modes and handoff only — NEVER include align.",
        "On ask cancel: RETURN without calling next.",
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
        "Land here after next→Spec and after elaborate returns for more research.",
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
        "Land here after next→Vibe and after examine returns for more implementation.",
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
      id: "envision-to-evaluate",
      from: "envision",
      event: "ENTRY_DONE",
      to: "evaluate",
      label: "Entry complete → EVALUATE",
      description: "Session entry finished (orientation + start/reuse); enter Align primary home.",
    },
    {
      id: "evaluate-to-establish",
      from: "evaluate",
      event: "NEED_SECONDARY",
      to: "establish",
      label: "Need capture or route → ESTABLISH",
      description: "Artifact check needs User answers and/or mode routing via the Align secondary gate.",
    },
    {
      id: "establish-ask-loop",
      from: "establish",
      event: "ASK_LOOP",
      to: "establish",
      label: "Ask follow-up",
      description: "Dependent follow-up questions stay in ESTABLISH until capture is complete or routing is ready.",
    },
    {
      id: "establish-to-evaluate",
      from: "establish",
      event: "RETURN_PRIMARY",
      to: "evaluate",
      label: "Return → EVALUATE",
      description: "After capture or when more Align primary work remains; re-enter evaluate.",
    },
    {
      id: "establish-ask-route-spec",
      from: "establish",
      event: "ASK_ROUTED_SPEC",
      to: "explore",
      label: "Proceed-with-best → EXPLORE",
      description: "User accepts scope/review answers and routes to SPEC primary.",
      userMediated: true,
    },
    {
      id: "establish-ask-route-vibe",
      from: "establish",
      event: "ASK_ROUTED_VIBE",
      to: "execute",
      label: "Proceed-with-best → EXECUTE",
      description: "User accepts scope/review answers and routes to VIBE primary.",
      userMediated: true,
    },
    {
      id: "establish-next-spec",
      from: "establish",
      event: "NEXT_SPEC",
      to: "explore",
      label: "next → EXPLORE",
      description: "User chooses SPEC; lands on explore (primary). next never includes current mode (align).",
      userMediated: true,
    },
    {
      id: "establish-next-vibe",
      from: "establish",
      event: "NEXT_VIBE",
      to: "execute",
      label: "next → EXECUTE",
      description: "User chooses VIBE; lands on execute (primary).",
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
      id: "explore-to-elaborate",
      from: "explore",
      event: "TO_SECONDARY",
      to: "elaborate",
      label: "Research ready → ELABORATE",
      description: "Evidence gathered enough to propose, close out, or route.",
    },
    {
      id: "elaborate-to-explore",
      from: "elaborate",
      event: "RETURN_PRIMARY",
      to: "explore",
      label: "Return → EXPLORE",
      description: "More research needed; return to Spec primary without using next.",
    },
    {
      id: "elaborate-next-align",
      from: "elaborate",
      event: "NEXT_ALIGN",
      to: "evaluate",
      label: "CLOSE_OUT → next → EVALUATE",
      description: "User chooses ALIGN after proposal; lands on evaluate (primary).",
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
      id: "execute-to-examine",
      from: "execute",
      event: "TO_SECONDARY",
      to: "examine",
      label: "Implement ready → EXAMINE",
      description: "Implementation ready for checks, close-out, or routing.",
    },
    {
      id: "examine-to-execute",
      from: "examine",
      event: "RETURN_PRIMARY",
      to: "execute",
      label: "Return → EXECUTE",
      description: "More implementation or in-scope fixes; return to Vibe primary without using next.",
    },
    {
      id: "examine-next-align",
      from: "examine",
      event: "NEXT_ALIGN",
      to: "evaluate",
      label: "CLOSE_OUT → next → EVALUATE",
      description: "User chooses ALIGN after verification; lands on evaluate (primary).",
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
      "Direct /handoff swaps the plan file and seeds a fresh session in ALIGN (envision → evaluate).",
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
      summary: "Native ALIGN question loop; used from establish (secondary) to capture answers.",
      modes: ["align"],
      gate: [
        "ALIGN-only; SPEC/VIBE ask is a harmless no-op (no picker).",
        "Empty ask is a harmless no-op.",
        "Non-empty ask requires a named session plan file; otherwise error without picker.",
        "Interactive UI required only when questions will be shown.",
      ],
      mechanics: [
        "CALL ask from establish to capture scope, constraints, outcomes, and D acceptance answers.",
        "Answers stay in ALIGN; after capture return to evaluate or CALL next from establish.",
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
        "Non-empty next requires valid targets and prompts; requires named session plan.",
        "Every ALIGN/SPEC/VIBE action needs contextual prompt; handoff must omit prompt.",
      ],
      mechanics: [
        "CALL next only from secondary gates (establish, elaborate, examine) after capture/verify/CLOSE_OUT as appropriate.",
        "NEVER include an action whose mode equals the current persisted mode; runtime filters those out on next-driven pickers.",
        "Agent-authored actions SHOULD include a user-facing reason (plain English; Q/C/D ids only as trailing [] or ()) and REQUIRE contextual instructions for ALIGN/SPEC/VIBE; OMIT instruction for handoff.",
        "Runtime PREPENDS only Switch context and NEVER authors substantive direction.",
        "Recommended row with a reason shows {mode} — {reason}.",
        "next→Align lands evaluate; next→Spec lands explore; next→Vibe lands execute.",
        "ESC dismiss and Return to editor stay in the current mode without starting the agent.",
        "/mode force picker still lists all modes including the current mode (bypass).",
        "Manual ALIGN/SPEC/VIBE commands and unrecommended picker choices return to the editor.",
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
  initial: "envision",
  notes: [
    "Guided session story: envision entry → mode primary ⇄ secondary gate → next to another mode's primary; Handoff = fresh session at envision on the same artifact. Idle product UI is not a graph node.",
    "Persisted User mode is only align|spec|vibe. Guided states compose modeBodies with roles entry|primary|secondary. closeOut, blocked, and handoff are procedural helpers — not peer session modes.",
    "Project permission is read|write only: read may update `.pi` plan state; write may change project files. All modes may edit the plan artifact.",
    "Only secondary gates establish/elaborate/examine CALL next. next never recommends the current mode. Handoff is establish + /handoff prep (or /handoff direct).",
    "session.scope and session.review are Agent-tracked meaning, not runtime-parsed fields.",
    "Transition table is the guided graph only. Stay-in-mode via RETURN_PRIMARY, ESC, Return to editor, ask cancel, and /mode are not same-mode NEXT edges. Manual /align /spec /vibe /mode bypasses live under Exceptions.",
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
