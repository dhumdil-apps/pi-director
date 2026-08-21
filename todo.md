# workflow-fsm improvement todo

Source audit of `extensions/agent-workflow/workflow-fsm.ts` v2.1.1 against runtime
(`workflow-machine.ts`, `ask.ts`, `mode-picker.ts`, `index.ts`, `handoff.ts`).

No code changes from the audit itself — this file captures the verdict for later work.

---

## Verdict

`workflow-fsm.ts` v2.1.1 is **structurally sound** (42 edges, all states reachable, no bad ids) and **mostly matches** Mode×Artifact×Settlement gates in `workflow-machine.ts`. The main problems are **semantic modeling**, not missing mode hops: several edges claim a destination the runtime never enters, and several real runtime outcomes are not edges at all.

Runtime source of truth for what actually happens:

- tools/settlement: `workflow-machine.ts`, `ask.ts`, `mode-picker.ts`, `index.ts`, `handoff.ts`
- agent procedures: same FSM file (prompt contract; not enforced)

---

## Transition audit (by `from`)

### ALIGN (11 out) — mostly OK; CMD/next semantics soft

| id                           | event → to               | Runtime?                    | Notes                                                                                                                                                  |
| ---------------------------- | ------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `align-ask-route-spec`       | `ASK_ROUTED_SPEC` → spec | **Match**                   | `ask` settlement `routed` + `agent_settled` `applyMode` + auto-start                                                                                   |
| `align-ask-route-vibe`       | `ASK_ROUTED_VIBE` → vibe | **Match**                   | same                                                                                                                                                   |
| `align-ask-cancelled`        | `ASK_CANCELLED` → editor | **Match**                   | cancel → `skip_picker`; idle                                                                                                                           |
| `align-next-spec/vibe/align` | `NEXT_*` → mode          | **Partial**                 | Only **recommended + prompt** auto-starts. Unrecommended / no prompt → mode change (if any) and **stay idle** — still drawn as entering the mode body  |
| `align-next-handoff`         | `NEXT_HANDOFF` → handoff | **Mismatch**                | Picker only **prepares** `/handoff`; does not enter handoff. Real handoff is later Enter on `/handoff`                                                 |
| `align-no-work`              | `NO_WORK` → editor       | **Match (agent)**           | Agent omits `next`; no runtime event                                                                                                                   |
| `align-cmd-*`                | `CMD_*` → mode           | **Mismatch vs description** | `/align\|/spec\|/vibe` only `recordWorkflowMode` + notify; **no agent start**. Description says “returns to editor” but `to` is the mode, not `editor` |

Missing ALIGN edges (runtime/procedure exist, table does not):

- **`ASK_ANSWERED` → align** (ask loop stay)
- **picker `RETURN` / dismiss → editor**
- **picker unrecommended → editor** (mode may change as side effect)
- **`/mode` → open picker**
- **direct `/handoff`**
- no `CLOSE_OUT`/`BLOCKED` from ALIGN — **by design** (ALIGN routes via `next` directly)

### SPEC (9 out) — preferred path OK; dual next paths intentional

| id              | event → to              | Runtime?       | Notes                                          |
| --------------- | ----------------------- | -------------- | ---------------------------------------------- |
| `spec-closeout` | `CLOSE_OUT` → closeOut  | **Agent-only** | Procedure; not a runtime state                 |
| `spec-blocked`  | `BLOCKED` → blocked     | **Agent-only** | same                                           |
| `spec-next-*`   | `NEXT_*` → mode/handoff | **Partial**    | Same recommended-vs-idle gap; handoff prep gap |
| `spec-cmd-*`    | `CMD_*` → mode          | **Mismatch**   | same CMD/editor issue                          |

Missing:

- **no `NO_WORK` / idle return** if agent ends without `CLOSE_OUT`/`next` (docs’ “proposal returned → editor” is only via `closeOut`/`ALL_COMPLETE` in the table)
- no ask edges — **correct** (ask is ALIGN-only no-op)

### VIBE (9 out) — same pattern as SPEC

Same matches/partials/mismatches as SPEC. `BLOCKED` on unfixable failure is agent procedure only.

### BLOCKED (1 out)

| id                 | event → to             | Runtime?       | Notes                        |
| ------------------ | ---------------------- | -------------- | ---------------------------- |
| `blocked-closeout` | `CLOSE_OUT` → closeOut | **Agent-only** | Matches `procedures.BLOCKED` |

Gap: procedure allows **`decide` then CONTINUE** when that unblocks — **no edge** back to spec/vibe; chart always drains through closeOut.

### CLOSE_OUT (5 out)

| id                  | event → to              | Runtime?       | Notes                                                                                                  |
| ------------------- | ----------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `closeout-next-*`   | `NEXT_*` → mode/handoff | **Conceptual** | Runtime still sits in **persisted mode**; `next` queues from that mode. closeOut is not a session mode |
| `closeout-complete` | `ALL_COMPLETE` → editor | **Agent-only** | “Do not call next”                                                                                     |

Gap: **duplicate topology** — `spec|vibe|align --NEXT_X-->` and `closeOut --NEXT_X-->` both exist. Notes say preferred path is closeOut-first; table still allows direct next from modes (runtime does too). Fine if intentional; confusing for “current neighborhood” viewers and for agents reading both as equal.

### HANDOFF (1 out)

| id                 | event → to                  | Runtime?  | Notes                                               |
| ------------------ | --------------------------- | --------- | --------------------------------------------------- |
| `handoff-continue` | `SESSION_CONTINUED` → align | **Match** | `openHandoffSession` seeds ALIGN + continue kickoff |

Gap: **entry** to handoff is wrong (see NEXT_HANDOFF). No edge for handoff **refusal** (no plan, busy turn).

### EDITOR (6 out)

| id              | event → to              | Runtime?    | Notes                                                                 |
| --------------- | ----------------------- | ----------- | --------------------------------------------------------------------- |
| `editor-user-*` | `USER_MESSAGE_*` → mode | **Match**   | Ordinary turn while mode is set                                       |
| `editor-cmd-*`  | `CMD_*` → mode          | **Partial** | Mode recorded; agent does not start — “enter mode body” is overstated |

Missing from editor:

- **`/mode` (force picker)**
- **`/handoff`**
- **picker open from `/mode` then return/dismiss/handoff-prep**
- initial session is really **idle editor + default align**, not “in ALIGN body” until first user message (`ensureWorkflowMode` only stamps align on first agent start)

---

## Cross-cutting gaps (what to improve)

### 1. Highest impact — model **idle vs running** honestly

Today mode nodes mean both “persisted mode” and “agent executing that body.” Runtime often is **idle with mode=X**.

Improve by one of:

- **A.** CMD / unrecommended picker / handoff-prep all go **`→ editor`**, with mode as extended state
- **B.** Split states: `alignIdle` / `alignRun` (heavier)

Without this, the Stately-style viewer will step into “SPEC” on `/spec` even though no turn starts.

### 2. **NEXT_HANDOFF → handoff is false**

Real chain:

1. `next` includes handoff → picker
2. select handoff → **editor** with `/handoff` prepared
3. user runs `/handoff` → new session ALIGN

Table should be something like:
`* --NEXT_HANDOFF--> editor` (prep) and `* --CMD_HANDOFF--> handoff --SESSION_CONTINUED--> align`.

### 3. **Picker outcomes under-specified**

Runtime has five exits; table mostly has “NEXT_X → mode”:

| Outcome              | Runtime           | FSM                       |
| -------------------- | ----------------- | ------------------------- |
| Recommended + prompt | auto-start target | NEXT_* → mode ✓           |
| Unrecommended switch | mode only, idle   | missing (drawn as NEXT_*) |
| Continue, no prompt  | idle              | missing                   |
| Return / dismiss     | idle editor       | missing                   |
| Handoff select       | prep command      | false → handoff           |

### 4. _\*CMD_* `to` vs “returns to editor”_*

Every CMD description promises editor standby; every CMD edge lands on a mode. Pick one and make `to` + label agree (prefer `→ editor` + mode side-effect).

### 5. **closeOut / blocked are not runtime states**

They are agent procedures. Either:

- keep them only in `procedures` + mode substates (not top-level chart nodes), or
- mark edges `agent/procedure` and **stop dual-listing** NEXT from both mode and closeOut unless the viewer filters preferred path.

Right now the chart implies you can be “in closeOut” the same way you are “in SPEC.”

### 6. **ALIGN ask loop edge missing**

`ASK_ANSWERED` (or `ASK_COMPLETED`) self-loop on align is in procedures and in `modes-core` docs, not in the transition table. Harmless for runtime; bad for completeness / diagram stepping.

### 7. **BLOCKED continue-via-decide missing**

Procedure allows decide-and-continue; chart only has blocked→closeOut.

### 8. **SPEC/VIBE idle exit only via closeOut**

If the agent returns without CLOSE_OUT/next, there is no `NO_WORK` edge (ALIGN has one). Docs show “proposal/implementation returned → editor”; table only has `closeOut --ALL_COMPLETE--> editor`.

### 9. **Commands not in the table**

Ownership lists `/mode` and `/handoff`; transitions omit both as first-class events. `/mode` is an important recovery surface (README).

### 10. **Initial state oversells ALIGN body**

`initial: "align"` + `[*] --> align` reads as “session is running ALIGN.” Actual: new session idle, mode defaults to align on first interactive agent start. Better: `initial: "editor"` with mode=align, or a distinct `sessionStart` edge.

### 11. **Already solid (don’t “fix”)**

- Ask gates (ALIGN-only, plan required, cancel/route settlement priority)
- Decide gates (SPEC/VIBE, options, plan)
- Next gates (targets, prompts, plan)
- Ask-route deferred to `agent_settled` (no stale Align marker)
- Tool specs ↔ `receive()` alignment
- No executable tests — still a process gap for regression, not a transition-table bug

### 12. **Viewer / docs drift risk**

`workflow-fsm.html` and `docs/AGENT-WORKFLOW-DIAGRAMS.md` both derive from / claim this table. Fixing edges without `build:content` + diagram pass will re-drift. Current diagram task (neighborhood + click-to-take-event) **amplifies** false edges (especially CMD→mode and NEXT_HANDOFF→handoff).

---

## Priority shortlist

1. **Correct handoff edges** (prep ≠ handoff; add `CMD_HANDOFF`)
2. **Make CMD / unrecommended / return land on `editor`** (or split idle/run)
3. **Split NEXT into auto-start vs idle** (recommended+prompt vs not)
4. **Add `ASK_ANSWERED`, picker dismiss/return, `/mode`**
5. **Clarify closeOut/blocked** as procedure-only or preferred-path-only in the chart
6. **Align initial state** with idle editor
7. Optional: `blocked --UNBLOCKED-->` source mode; SPEC/VIBE `NO_WORK`
