# Agent Workflow diagrams

This guide is a derived visual map of the Agent Workflow contract. The sole operational source is [`extensions/agent-workflow/workflow-steps.md`](../extensions/agent-workflow/workflow-steps.md); when a diagram and that pseudocode disagree, the pseudocode wins.

Read the layers in order to build a mental model: **Map → Modes → Machinery → Full picture**. Each view summarizes rules instead of duplicating the complete contract. Use the [coverage index](#source-symbol-coverage) to jump from a pseudocode symbol to its visual home.

Stable diagram ids (for anchors and downstream copies): `map-overview`, `ownership`, `modes-core`, `mode-align`, `mode-spec`, `mode-vibe`, `turn-spine`, `artifact`, `review`, `tools`, `handoff`, `full-turn`.

## L0 — Map

Start here. After this layer you should be able to say: three modes, one durable artifact, the User picks mode, only Vibe writes project files, and every turn captures then dispatches.

### map-overview — Session mental model

```mermaid
flowchart LR
    Goal[User goal] --> Align[ALIGN<br/>clarify and review]
    Align --> Spec[SPEC<br/>research and propose]
    Spec --> Vibe[VIBE<br/>implement and verify]
    Vibe --> Close[CLOSE_OUT<br/>evidence and routing]
    Close --> Next{Useful work<br/>or review?}
    Next -- yes --> Align
    Next -- yes --> Spec
    Next -- yes --> Vibe
    Next -- none --> Editor[Return to editor]
    Close --> Handoff[Handoff exit]
    Align -.-> Tools[ask / decide / start / next]
    Spec -.-> Tools
    Vibe -.-> Tools
    Align --> Artifact[(Versioned .pi/plan)]
    Spec --> Artifact
    Vibe --> Artifact
    Vibe --> Project[(Project files<br/>Vibe only)]
```

### ownership — Authority and tools

The User owns mode selection. The runtime owns UI and persistence mechanisms, while the Agent interprets the contract and owns the artifact's meaning. The Vibe-only project-write boundary is an Agent rule, not a filesystem sandbox.

```mermaid
flowchart LR
    User[User] -->|goal, answers, mode choice| Agent[Agent]
    Agent -->|CALL ask, decide, start, or next| Runtime[Pi runtime]
    Runtime -->|native questions and pickers| User
    Runtime -->|mode markers, timing, session identity| Session[(Session state)]

    Agent -->|all modes may update| Artifact[(Versioned .pi/plan artifact)]
    Agent -->|VIBE only| Project[(Project files)]
    Agent -.->|ALIGN and SPEC: no project writes| Project
    Agent -->|judgment, scope, decisions, final output| Result[Task result]

    Runtime --> AskTool[ask]
    Runtime --> DecideTool[decide]
    Runtime --> StartTool[start]
    Runtime --> NextTool[next]
    AskTool -->|answer, cancel, or direct route| Agent
    DecideTool -->|auto-pick unresolved D| Agent
    StartTool -->|first named artifact or linked continuation| Artifact
    NextTool -->|ranked post-turn actions| User
```

## L1 — Modes

Everyday mode hops and one procedure chart per mode. Continuity exits (handoff, fresh session, unrelated goal) live under Machinery → handoff.

### modes-core — Everyday mode lifecycle

Modes persist as User choices. New and handed-off interactive sessions enter Align; picker selections settle the current turn before a fresh target-mode turn begins.

```mermaid
stateDiagram-v2
    [*] --> Align: new interactive session

    state "ALIGN" as Align
    state "SPEC" as Spec
    state "VIBE" as Vibe
    state "Return to editor" as Editor

    Align --> Align: completed ask / dependent follow-up
    Align --> Spec: ask direct route or selected next action
    Align --> Vibe: ask direct route or selected next action
    Spec --> Align: explicit command or selected next action
    Spec --> Vibe: explicit command or selected next action
    Vibe --> Align: explicit command or decision review
    Vibe --> Spec: explicit command or selected next action
    Align --> Editor: no useful work or picker return
    Spec --> Editor: proposal returned
    Vibe --> Editor: implementation result returned
    Editor --> Align: explicit /align
    Editor --> Spec: explicit /spec
    Editor --> Vibe: explicit /vibe
```

### mode-align — ALIGN procedure

Bounded known orientation only. Do not search source. Ask immediately after those reads. Missing implementation facts go to SPEC via next. Cancel discards the exchange and does not open `next`.

```mermaid
flowchart TD
    Enter([ALIGN message]) --> Orient[Bounded AGENTS.md, .pi state,<br/>README, named plans, docs]
    Orient --> Unresolved{Unresolved goal, scope,<br/>constraint, outcome, or D review?}
    Unresolved -- yes --> Ask[Call ask<br/>1-4 independent Qs]
    Ask --> Result{Ask result}
    Result -- cancelled --> Stop([RETURN<br/>no next])
    Result -- routed Spec/Vibe --> Settle([RETURN<br/>fresh target turn])
    Result -- answered --> Synthesize[Append exchange<br/>update Goal/Align/Decisions/Checklist]
    Synthesize --> Unresolved
    Unresolved -- no --> Named{No named artifact<br/>and direction clear?}
    Named -- yes --> Start[Call start once]
    Named -- no --> Useful
    Start --> Useful{Useful work remains?}
    Useful -- yes --> Next["Call next; rank SPEC first<br/>when exploration remains"]
    Useful -- no --> Stop
    Next --> Done([RETURN])
```

### mode-spec — SPEC procedure

```mermaid
flowchart TD
    Enter([SPEC message]) --> Prep{ALIGN bypassed and<br/>no named artifact?}
    Prep -- yes --> Start[Call start before research]
    Prep -- no --> Research
    Start --> Research[Bounded symbol or path search<br/>build Evidence and Proposal]
    Research --> Decision[Call decide / RECORD_DECISION<br/>for material autonomous choice]
    Decision --> Boundary{Consequential or<br/>unsafe boundary?}
    Boundary -- yes --> Decide[Call decide]
    Decide --> Actionable
    Boundary -- no --> Actionable{Proposal actionable?}
    Actionable -- no --> Blocked[BLOCKED]
    Actionable -- yes --> Close[CLOSE_OUT]
    Blocked --> Stop([RETURN unresolved])
    Close --> Done([RETURN proposal summary])
```

### mode-vibe — VIBE procedure

```mermaid
flowchart TD
    Enter([VIBE message]) --> Prep{ALIGN bypassed and<br/>no named artifact?}
    Prep -- yes --> Start[Call start before work]
    Prep -- no --> Implement
    Start --> Implement[Implement accepted scope<br/>resolve routine research]
    Implement --> Decision[Call decide / RECORD_DECISION when needed]
    Decision --> Boundary{Consequential or<br/>unsafe boundary?}
    Boundary -- yes --> Decide[Call decide before crossing]
    Decide --> Checks
    Boundary -- no --> Checks[Smallest checks,<br/>then broader by risk]
    Checks --> Failure{Failure caused<br/>by this work?}
    Failure -- fixable in scope --> Implement
    Failure -- not fixable --> Blocked[BLOCKED]
    Failure -- no or pre-existing --> Close[CLOSE_OUT]
    Blocked --> Stop([RETURN unresolved])
    Close --> Done([RETURN result])
```

## L2 — Machinery

Shared systems after the mode story: turn spine, artifact, review, tools, and continuity.

### turn-spine — Shared turn control flow

Mode bodies are collapsed here; expand them in L1. Rejoin points are `BLOCKED`, `CLOSE_OUT`, and `next`.

```mermaid
flowchart TD
    Turn([TURN message]) --> Capture[CAPTURE_TURN<br/>redact and append User message]
    Capture --> Scope{Scope added, conflicted,<br/>or apparently replaced?}
    Scope -- yes --> Reconcile[RECONCILE_SCOPE]
    Reconcile --> Resolved{Relationship resolved?}
    Resolved -- no or cancelled --> Return([RETURN])
    Resolved -- yes --> Dispatch
    Scope -- no --> Dispatch{Persisted mode}
    Dispatch -- ALIGN --> AlignNode[ALIGN procedure]
    Dispatch -- SPEC --> SpecNode[SPEC procedure]
    Dispatch -- VIBE --> VibeNode[VIBE procedure]
    AlignNode --> Join[Mode exit:<br/>next, return, or close-out path]
    SpecNode --> Join
    VibeNode --> Join
    Join --> Blocked[BLOCKED when stuck]
    Join --> Close[CLOSE_OUT]
    Blocked --> Close
    Close --> Remaining{Actionable work<br/>or decision review?}
    Remaining -- actionable --> Next[Call next]
    Remaining -- decision review --> ReviewNext[Call next with ALIGN<br/>and D-grounded instruction]
    Remaining -- none --> Return
    Next --> Return
    ReviewNext --> Return
```

### artifact — Artifact model

The artifact is append-oriented, cumulative, and interpreted as a whole. Runtime does not parse free-form checklist or review status.

```mermaid
classDiagram
    class Artifact {
        +versionMarker
        +taskName
        +timing
        +interpretAsWhole()
        +remainResumable()
    }
    class Goal {
        +initialGoal
        +acceptedFollowups
    }
    class Align {
        +acceptedDirection
        +constraints
    }
    class Decisions {
        +acceptedAnswers
        +reviewedChoices
    }
    class Evidence
    class Proposal
    class Checklist {
        +cumulativeOutcomes
        +latestExplicitStateWins
    }
    class WorkLog {
        +appendOnly
    }
    class UserTranscript {
        +appendOnly
    }
    class AgentTranscript {
        +appendOnly
    }
    class Identifier {
        +stableQ
        +stableD
        +stableC
        +neverReuseOrRename
    }

    Artifact *-- Goal
    Artifact *-- Align
    Artifact *-- Decisions
    Artifact *-- Evidence
    Artifact *-- Proposal
    Artifact *-- Checklist
    Artifact *-- WorkLog
    Artifact *-- UserTranscript
    Artifact *-- AgentTranscript
    Artifact o-- Identifier
```

### review — Outcome and decision lifecycle

Checklist outcomes require evidence to complete. Agent decisions may be implemented while review remains unresolved, but only an explicit Align review answer makes them approved.

```mermaid
stateDiagram-v2
    state "Checklist outcome C" as C {
        [*] --> Unresolved
        Unresolved --> Completed: evidence proves outcome
        Unresolved --> Deferred: accepted deferral and reason
        Unresolved --> Skipped: explicit reason
        Unresolved --> Failed: failure and evidence
        Deferred --> Unresolved: accepted scope resumes
        Completed --> [*]
        Skipped --> [*]
        Failed --> [*]
    }

    state "Agent decision D" as D {
        [*] --> ReviewUnresolved: record options, choice, and rationale
        ReviewUnresolved --> ReviewUnresolved: implementation or verification does not approve
        ReviewUnresolved --> Accepted: explicit Align review answer
        Accepted --> DirectionChanged: review changes direction
        DirectionChanged --> [*]: append unresolved C outcome
        Accepted --> [*]: lifecycle reconciled
    }
```

### tools — Tool and picker interaction

The tools provide mechanisms only. The Agent supplies semantic questions, artifact content, and contextual recommendations; runtime settles UI and prepends only mechanical transition context.

```mermaid
sequenceDiagram
    actor User
    participant Agent
    participant Artifact
    participant Runtime
    participant Picker

    User->>Agent: task message
    Agent->>Artifact: append redacted User transcript

    opt unresolved alignment question
        Agent->>Runtime: CALL ask alone
        Runtime->>User: native question picker
        alt cancelled
            User-->>Runtime: cancel
            Runtime-->>Agent: cancelled
            Agent-->>User: stop without next
        else answered in Align
            User-->>Runtime: answer
            Runtime-->>Agent: completed answer
            Agent->>Artifact: append full exchange and synthesis
        else direct Spec or Vibe route
            User-->>Runtime: answer plus route
            Runtime-->>Agent: routed after Align settles
            Runtime->>Agent: fresh target turn with mechanical context
            Agent->>Artifact: reconstruct and append exchange
        end
    end

    opt Spec or Vibe decision
        Agent->>Runtime: CALL decide
        Runtime-->>Agent: highest-confidence pick as unresolved D
        Runtime->>Artifact: append Agent-transcript block when named
    end

    opt no named artifact and direction clear
        Agent->>Runtime: CALL start with stable task name
        Runtime->>Artifact: first named file or linked continuation
    end

    opt useful post-turn choice remains
        Agent->>Runtime: CALL next with ranked actions
        Note right of Agent: Non-handoff recommendations include<br/>C/D-grounded intent and verification
        Runtime->>Picker: deduplicate and display actions
        Picker->>User: recommended, neutral, handoff, editor
        alt recommended mode selected
            User-->>Runtime: select mode
            Runtime->>Agent: fresh turn with mechanical prefix plus Agent instruction
        else neutral or manual mode selected
            User-->>Runtime: select mode
            Runtime->>Agent: fresh turn with mechanical context only
        else handoff selected
            User-->>Runtime: select handoff
            Runtime-->>User: prepare /handoff for explicit execution
        else return to editor
            User-->>Runtime: return
        end
    end

    opt tool call rejected
        Runtime-->>Agent: validation rejection
        Agent->>Runtime: correct and retry once
    end
```

### handoff — Continuity, handoff, and legacy

Includes continuity edges kept out of `modes-core`: session swap after `/handoff`, fresh session after handoff, and genuinely unrelated goals. Current artifacts swap immediately onto the already-written file. Legacy artifacts remain immutable and convert only through a linked current-format continuation.

```mermaid
flowchart TD
    subgraph Continuity exits from any mode
        Mode[ALIGN / SPEC / VIBE] -->|selected handoff then /handoff| Request
        Mode -->|genuinely unrelated goal| FreshSession[Fresh session required]
    end

    Request([HANDOFF requested]) --> Current{Current-format artifact?}

    Current -- yes --> Ready[Use already-written named artifact]
    Ready --> Fresh[Continue in fresh ALIGN]

    Current -- no, legacy --> NoMutation[Do not mutate<br/>legacy artifact]
    NoMutation --> Fresh

    Fresh --> Continue[Auto-start ordinary<br/>Align continue]
    Continue --> Read{Artifact format}
    Read -- current --> ReadCurrent[Read whole current artifact]
    ReadCurrent --> Priority[Choose most important<br/>unresolved item]
    Priority --> AskOrWork[Ask or route from fresh ALIGN]

    Read -- legacy --> ReadLegacy[Read immutable legacy reference]
    ReadLegacy --> Start[Call start before first .pi write]
    Start --> Linked[Create linked v2 continuation]
    Linked --> Timing[Carry recognized historical timing]
    Timing --> Convert[Convert meaningful goal, evidence,<br/>decisions, and checklist history]
    Convert --> Uncertain{Meaning genuinely uncertain?}
    Uncertain -- yes --> Ask[Call ask]
    Uncertain -- no --> Priority
    Ask --> Priority
    FreshSession --> NewAlign[New interactive session enters ALIGN]
```

## L3 — Full picture

Synthesis only. Read this after L0–L2; it composes the spine and mode branches without adding new contract facts.

### full-turn — Composed turn dispatcher

```mermaid
flowchart TD
    Turn([TURN message]) --> Capture[CAPTURE_TURN<br/>redact and append User message]
    Capture --> Scope{Scope added, conflicted,<br/>or apparently replaced?}
    Scope -- yes --> Reconcile[RECONCILE_SCOPE]
    Reconcile --> AskScope{Relationship resolved?}
    AskScope -- no or cancelled --> Return([RETURN])
    AskScope -- yes --> Dispatch{Persisted mode}
    Scope -- no --> Dispatch

    Dispatch -- ALIGN --> Align[Bounded orientation<br/>ask unresolved Q or D review]
    Align --> AlignRoute{Direction clear?}
    AlignRoute -- no --> Return
    AlignRoute -- yes --> Name[Call start once<br/>if no named artifact]
    Name --> Useful{Useful work remains?}
    Useful -- yes --> Next[Call next with contextual<br/>ranked actions]
    Useful -- no --> Return
    Next --> Return

    Dispatch -- SPEC --> Spec[Bounded symbol or path research<br/>build actionable proposal]
    Spec --> Decision[Call decide / RECORD_DECISION<br/>for material autonomous choice]
    Decision --> Boundary{Consequential or<br/>unsafe boundary?}
    Boundary -- yes --> AskBoundary[Call decide]
    AskBoundary --> Actionable{Proposal actionable?}
    Boundary -- no --> Actionable
    Actionable -- no --> Blocked[BLOCKED]
    Actionable -- yes --> Close[CLOSE_OUT]

    Dispatch -- VIBE --> Vibe[Implement accepted scope<br/>and routine research]
    Vibe --> VibeDecision[Call decide when needed]
    VibeDecision --> VibeBoundary{Consequential or<br/>unsafe boundary?}
    VibeBoundary -- yes --> AskVibe[Call decide before crossing]
    AskVibe --> Checks[Smallest checks,<br/>then broader checks by risk]
    VibeBoundary -- no --> Checks
    Checks --> Failure{Failure caused<br/>by this work?}
    Failure -- fixable in scope --> Vibe
    Failure -- not fixable in scope --> Blocked
    Failure -- no or pre-existing --> Close

    Blocked --> Close

    Close --> Remaining{Actionable work<br/>or decision review?}
    Remaining -- actionable work --> Next
    Remaining -- decision review --> ReviewNext[Call next with ALIGN<br/>and D-grounded instruction]
    Remaining -- none --> Return
    ReviewNext --> Return
```

## Source-symbol coverage

- `MODES`, `STATE` (everyday mode hops): L0 `map-overview`, L1 `modes-core`.
- `TOOLS`, write-boundary `INVARIANTS`: L0 `ownership`, L2 `tools`.
- `ALWAYS` and source-of-truth rules: introduction, L0, and the operational pseudocode link.
- `TURN`, `CAPTURE_TURN`, `RECONCILE_SCOPE`, `WRITE_ARTIFACT`: L2 `turn-spine`, L2 `tools`, L3 `full-turn`.
- `ALIGN`, `SPEC`, `VIBE`: L1 `mode-align` / `mode-spec` / `mode-vibe`, plus L3 `full-turn`.
- `ARTIFACT`, `RECORD_DECISION`: L2 `artifact` and `review`; decision gates also in L1 Spec/Vibe and L3.
- `BLOCKED`, `CLOSE_OUT`: L1 Spec/Vibe, L2 `turn-spine`, L3 `full-turn`; picker-ready close-out before L2 `handoff`.
- `HANDOFF`, `LEGACY_CONTINUATION`, continuity exits: L2 `handoff` (L0 shows handoff only as an exit node).
- `TOOL_MECHANICS`: L2 `tools` and L0 `ownership`.

When changing a covered symbol, update the relevant view and rerun the Mermaid render checks alongside `npm run verify`.
