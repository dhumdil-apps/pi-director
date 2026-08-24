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

export type FsmStateId = "envision" | "establish" | "explore" | "elaborate" | "execute" | "examine" | "evaluate";

export type FsmStateKind = "mode";

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
  permission: "readonly" | "planonly" | "write";
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
    envision: {
      id: "envision",
      label: "ENVISION",
      kind: "mode",
      summary:
        "Cold start and preflight: capture initial user goal, bounded orientation, and initialize named artifact via start.",
      permission: "readonly",
      substates: ["goalCapture", "orientation", "ensureArtifact"],
      procedure: [
        "Session story starts here: capture user goal and intent.",
        "READ only bounded AGENTS.md, .pi state including MEMORY.md, README, named plans, or documentation for orientation.",
        "AFTER orientation reads, IF no named artifact exists THEN CALL start exactly once.",
        "PROCEED to ESTABLISH for scope alignment questions.",
      ],
    },
    establish: {
      id: "establish",
      label: "ESTABLISH",
      kind: "mode",
      summary: "Clarify scope, constraints, and requirements via native ask Q&A loop; anchor baseline plan.",
      permission: "readonly",
      substates: ["askLoop", "anchorScope", "routeTarget"],
      procedure: [
        "WHILE a goal, scope, constraint, or outcome question remains: CALL ask as the first User-facing action with 1-4 independent questions.",
        "ASK dependent follow-ups in a later CALL after incorporating earlier answers.",
        "IF Ask routes directly to SPEC or VIBE THEN proceed to EXPLORE or EXECUTE.",
        "APPEND every completed prompt, context, displayed option, confidence, and exact answer to User transcript.",
      ],
    },
    explore: {
      id: "explore",
      label: "EXPLORE",
      kind: "mode",
      summary: "Read-only codebase research, symbol tracing, and fact-finding without project file mutations.",
      permission: "planonly",
      substates: ["symbolSearch", "evidenceGathering"],
      procedure: [
        "BEGIN with one bounded exact symbol or path search.",
        "BROADEN only for a named unresolved reason and STOP when evidence answers it.",
        "EXCLUDE node_modules, generated, vendor, cache trees, and source maps unless explicitly targeted.",
        "RECORD findings in Evidence section; DO NOT mutate files outside .pi.",
      ],
    },
    elaborate: {
      id: "elaborate",
      label: "ELABORATE",
      kind: "mode",
      summary: "Synthesize findings, detail checklist outcomes (C), and draft technical proposal.",
      permission: "planonly",
      substates: ["draftProposal", "checklistSynthesis", "closeOut"],
      procedure: [
        "EDIT Proposal and Checklist with the recommended approach.",
        "FOR EACH material autonomous choice RUN RECORD_DECISION(choice).",
        "RUN CLOSE_OUT.",
        "RETURN a concise proposal summary with artifact path.",
      ],
    },
    execute: {
      id: "execute",
      label: "EXECUTE",
      kind: "mode",
      summary: "Implement approved scope; make scoped autonomous decisions (D); project file mutations.",
      permission: "write",
      substates: ["codeMutation", "recordDecision"],
      procedure: [
        "IMPLEMENT accepted scope in project files outside .pi.",
        "FOR EACH material autonomous choice RUN RECORD_DECISION(choice).",
        "UPDATE cumulative Checklist and append-only Work log throughout implementation.",
      ],
    },
    examine: {
      id: "examine",
      label: "EXAMINE",
      kind: "mode",
      summary: "Run checks, test suite, record evidence in Work log, and run CLOSE_OUT.",
      permission: "write",
      substates: ["runChecks", "recordEvidence", "closeOut"],
      procedure: [
        "RUN the smallest appropriate repository checks, then broader retained checks when risk warrants.",
        "IF a check fails within scope THEN FIX and RERUN; ELSE RUN BLOCKED(failure) and route to EVALUATE.",
        "RECORD check evidence in Work log.",
        "RUN CLOSE_OUT and proceed to EVALUATE for review.",
      ],
    },
    evaluate: {
      id: "evaluate",
      label: "EVALUATE",
      kind: "mode",
      summary: "Review unconfirmed decisions (D), evaluate completed milestones, and call next to pick the next phase.",
      permission: "readonly",
      substates: ["reviewDecisions", "reconcileScope", "routeNext"],
      procedure: [
        "REVIEW unconfirmed D items with the user when actionable choices require feedback.",
        "RECONCILE checklist outcomes against completed work.",
        "CALL next with ranked recommended actions (EXPLORE, EXECUTE, ESTABLISH, or HANDOFF).",
      ],
    },
  },
  transitions: [
    // ALIGN: Envision -> Establish
    {
      id: "envision-to-establish",
      from: "envision",
      event: "GOAL_SET",
      to: "establish",
      label: "Goal Captured → ESTABLISH",
      description: "Initial user goal captured and named artifact created; proceed to scope clarification.",
    },
    // ALIGN: Establish
    {
      id: "establish-ask-loop",
      from: "establish",
      event: "ASK_LOOP",
      to: "establish",
      label: "Ask follow-up",
      description: "Dependent follow-up questions stay in ESTABLISH until ready for next mode.",
    },
    {
      id: "establish-to-explore",
      from: "establish",
      event: "ASK_ROUTED_SPEC",
      to: "explore",
      label: "Proceed-with-best → EXPLORE",
      description: "User accepts scope and routes to SPEC research.",
      userMediated: true,
    },
    {
      id: "establish-to-execute",
      from: "establish",
      event: "ASK_ROUTED_VIBE",
      to: "execute",
      label: "Proceed-with-best → EXECUTE",
      description: "User accepts scope and routes directly to VIBE implementation.",
      userMediated: true,
    },
    // SPEC: Explore -> Elaborate
    {
      id: "explore-to-elaborate",
      from: "explore",
      event: "RESEARCH_DONE",
      to: "elaborate",
      label: "Research complete → ELABORATE",
      description: "Evidence gathered; synthesize technical approach and checklist outcomes.",
    },
    // SPEC: Elaborate -> Execute / Evaluate
    {
      id: "elaborate-to-execute",
      from: "elaborate",
      event: "NEXT_VIBE",
      to: "execute",
      label: "CLOSE_OUT → next → EXECUTE",
      description: "Proposal ready; user confirms and proceeds to implementation.",
      userMediated: true,
    },
    {
      id: "elaborate-to-evaluate",
      from: "elaborate",
      event: "NEXT_ALIGN",
      to: "evaluate",
      label: "CLOSE_OUT → next → EVALUATE",
      description: "Proposal ready for user review and decision confirmation.",
      userMediated: true,
    },
    // VIBE: Execute -> Examine
    {
      id: "execute-to-examine",
      from: "execute",
      event: "RUN_CHECKS",
      to: "examine",
      label: "Changes Made → EXAMINE",
      description: "Code implemented; run repository checks and test suites.",
    },
    // VIBE: Examine -> Evaluate / Explore
    {
      id: "examine-to-evaluate",
      from: "examine",
      event: "CLOSE_OUT",
      to: "evaluate",
      label: "CLOSE_OUT → EVALUATE",
      description: "Verification passed; reconcile checklist and review unconfirmed decisions.",
      userMediated: true,
    },
    {
      id: "examine-to-explore",
      from: "examine",
      event: "NEXT_SPEC",
      to: "explore",
      label: "CLOSE_OUT → next → EXPLORE",
      description: "Verification revealed need for deeper architectural research.",
      userMediated: true,
    },
    // ALIGN: Evaluate routes
    {
      id: "evaluate-to-explore",
      from: "evaluate",
      event: "NEXT_SPEC",
      to: "explore",
      label: "next → EXPLORE",
      description: "User chooses SPEC research for next milestone.",
      userMediated: true,
    },
    {
      id: "evaluate-to-execute",
      from: "evaluate",
      event: "NEXT_VIBE",
      to: "execute",
      label: "next → EXECUTE",
      description: "User chooses VIBE execution for next milestone.",
      userMediated: true,
    },
    {
      id: "evaluate-to-establish",
      from: "evaluate",
      event: "NEXT_ALIGN",
      to: "establish",
      label: "next → ESTABLISH",
      description: "Scope expansion or new requirements require further Q&A.",
      userMediated: true,
    },
    {
      id: "evaluate-handoff",
      from: "evaluate",
      event: "NEXT_HANDOFF",
      to: "envision",
      label: "CLOSE_OUT → handoff (restart ENVISION)",
      description: "Fresh context window on same artifact, restarting from ENVISION.",
      userMediated: true,
    },
  ],
  exceptions: {
    title: "Manual Bypass & Escape Hatches",
    summary:
      "The /mode command is the universal manual bypass. Running /mode opens the option picker at any time so the User can choose what to do next (jump to ALIGN, SPEC, VIBE, or hand off) without being gated by agent completion.",
    commands: [
      {
        command: "/mode",
        label: "Open Option Picker (Universal Bypass)",
        summary: "Opens the mode option picker to choose any target mode or action.",
        description:
          "User-triggered escape hatch. Opens the interactive option picker in editor standby so the User can choose what to do next (switch mode, hand off, or return).",
      },
      {
        command: "/handoff [name]",
        label: "Direct Handoff Shortcut",
        summary: "Swaps active session onto a named plan in fresh ALIGN.",
        description:
          "Direct shortcut for session continuation on a named plan artifact, seeding a fresh ALIGN session.",
      },
    ],
    rules: [
      "The /mode command is the canonical User-owned bypass to open the option picker and choose what to do next.",
      "Manual bypass transitions are never gated on workflow completeness, pending recommendations, or unresolved D items.",
      "Selecting an unrecommended mode in the picker switches the session mode in editor standby.",
      "Direct /handoff swaps the plan file and seeds a fresh session in ALIGN.",
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
      summary: "Native ALIGN question loop; clarifies scope while staying in ALIGN until ready for next mode.",
      modes: ["align"],
      gate: [
        "ALIGN-only; SPEC/VIBE ask is a harmless no-op (no picker).",
        "Empty ask is a harmless no-op.",
        "Non-empty ask requires a named session plan file; otherwise error without picker.",
        "Interactive UI required only when questions will be shown.",
      ],
      mechanics: [
        "ALIGN triggers ask to clarify scope, constraints, and decisions before moving to SPEC/VIBE.",
        "Answers stay in ALIGN (ask loop) to process follow-up questions.",
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
      summary: "Agent autonomous decision logger; records rationale and unblocks execution without prompt.",
      modes: ["spec", "vibe"],
      gate: ["Non-empty decide with options requires a named session plan file; otherwise error."],
      mechanics: [
        "Never opens a picker and never changes mode.",
        "Auto-picks the highest-confidence option per question.",
        "Records agent-workflow:decision and appends Agent transcript after start.",
        "Leaves D review unresolved until explicit ALIGN acceptance.",
      ],
    },
    {
      name: "next",
      summary: "Queue ranked post-turn actions; user chooses the next mode (SPEC, VIBE, ALIGN, or handoff).",
      modes: ["any"],
      gate: [
        "Empty next records no recommendation and opens no picker.",
        "Non-empty next requires valid targets and prompts; requires named session plan.",
        "Every ALIGN/SPEC/VIBE action needs contextual prompt; handoff must omit prompt.",
      ],
      mechanics: [
        "After alignment or phase completion, CALL next so the user chooses the next mode.",
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
  initial: "envision",
  notes: [
    "Guided session story: Align (start tool + ask) begins; Spec/Vibe do work; Close-out finishes a phase; Handoff = fresh context, same artifact, restart at Align. Idle product UI when nothing is running is not a graph node.",
    "Persisted User mode is only align|spec|vibe. closeOut, blocked, and handoff are procedural helpers on the shared flow chart.",
    "session.scope and session.review are Agent-tracked meaning, not runtime-parsed fields.",
    "Transition table is the guided graph only. Stay-in-mode continue, picker dismiss, ask cancel, end-without-next, and idle UI are runtime — not graph edges. Manual /align /spec /vibe /mode bypasses live under Exceptions. Preferred agent path still ends SPEC/VIBE via CLOSE_OUT before CALL next.",
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
