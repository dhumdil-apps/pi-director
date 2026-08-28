/** Pure FSM graph checks shared by the content build and the Node test suite. */

import type { FsmStateId, WorkflowFsm } from "./workflow-fsm.ts";

const MODE_SWITCH_EVENTS = new Set(["NEXT_SPEC", "NEXT_VIBE", "NEXT_ALIGN", "NEXT_HANDOFF", "RETURN_ALIGN"]);

export function workflowFsmIssues(fsm: WorkflowFsm): string[] {
  const issues: string[] = [];
  const stateIds = Object.keys(fsm.states) as FsmStateId[];
  const stateSet = new Set(stateIds);

  for (const edge of fsm.transitions) {
    if (!stateSet.has(edge.from) || !stateSet.has(edge.to)) {
      issues.push(`FSM transition ${edge.id} references unknown state (${edge.from} → ${edge.to})`);
    }
    if (edge.bidirectional) {
      const fromRole = fsm.states[edge.from]?.role;
      const toRole = fsm.states[edge.to]?.role;
      if (fromRole !== "primary" || toRole !== "secondary") {
        issues.push(`FSM bidirectional ${edge.id} must run primary → secondary (got ${fromRole} → ${toRole})`);
      }
    }
  }

  if (!fsm.sessionEntry) {
    issues.push("FSM missing sessionEntry");
  } else {
    if (fsm.sessionEntry.state !== fsm.initial) {
      issues.push(`FSM sessionEntry.state must equal initial (${fsm.initial})`);
    }
    const entryState = fsm.states[fsm.sessionEntry.state];
    if (!entryState || entryState.role !== "entry") {
      issues.push(`FSM sessionEntry state must have role entry`);
    }
  }

  const bodyStateIds = new Set<FsmStateId>();
  for (const body of fsm.modeBodies) {
    if (body.exitTool !== "next") {
      issues.push(`FSM modeBodies.${body.mode} exitTool must be next`);
    }
    for (const id of body.states) {
      if (!stateSet.has(id)) {
        issues.push(`FSM modeBodies.${body.mode} missing state ${id}`);
        continue;
      }
      bodyStateIds.add(id);
      const st = fsm.states[id];
      if (st.role === "entry") {
        issues.push(`FSM modeBodies.${body.mode} must not include entry state ${id}`);
      }
      if (st.userMode !== body.mode) {
        issues.push(`FSM state ${id} userMode mismatch for body ${body.mode}`);
      }
    }
    if (body.primary && !body.states.includes(body.primary)) {
      issues.push(`FSM modeBodies.${body.mode} primary not in states`);
    }
    if (body.secondary && !body.states.includes(body.secondary)) {
      issues.push(`FSM modeBodies.${body.mode} secondary not in states`);
    }
    if (body.secondary) {
      const modeSwitchOut = fsm.transitions.some(
        (edge) => edge.from === body.secondary && MODE_SWITCH_EVENTS.has(edge.event),
      );
      if (!modeSwitchOut) {
        issues.push(
          `FSM modeBodies.${body.mode} secondary ${body.secondary} needs outbound NEXT_*/RETURN_ALIGN/handoff`,
        );
      }
    }
  }

  for (const id of stateIds) {
    const st = fsm.states[id];
    if (st.role === "entry") {
      if (bodyStateIds.has(id)) {
        issues.push(`FSM entry state ${id} must not appear in modeBodies`);
      }
    } else if (st.role === "primary" || st.role === "secondary") {
      if (!bodyStateIds.has(id)) {
        issues.push(`FSM ${st.role} state ${id} must appear in exactly one modeBody`);
      }
      if (!st.userMode) {
        issues.push(`FSM ${st.role} state ${id} requires userMode`);
      }
    }
  }

  for (const edge of fsm.transitions) {
    if (edge.event === "TO_NEXT") {
      issues.push(`FSM must not use TO_NEXT (got ${edge.id}); next is a tool/procedure, not a state hop`);
    }
    if (MODE_SWITCH_EVENTS.has(edge.event)) {
      const fromRole = fsm.states[edge.from]?.role;
      if (fromRole !== "secondary") {
        issues.push(`FSM mode-switch edge ${edge.id} must start at a secondary (from ${edge.from})`);
      }
    }
  }

  const outbound = Object.fromEntries(stateIds.map((id) => [id, [] as FsmStateId[]])) as Record<
    FsmStateId,
    FsmStateId[]
  >;
  for (const edge of fsm.transitions) {
    if (!stateSet.has(edge.from) || !stateSet.has(edge.to)) continue;
    outbound[edge.from].push(edge.to);
    if (edge.bidirectional) outbound[edge.to].push(edge.from);
  }
  const seen = new Set<FsmStateId>([fsm.initial]);
  const queue: FsmStateId[] = [fsm.initial];
  while (queue.length) {
    const id = queue.shift();
    if (!id) break;
    for (const nextId of outbound[id] ?? []) {
      if (!seen.has(nextId)) {
        seen.add(nextId);
        queue.push(nextId);
      }
    }
  }
  const unreachable = stateIds.filter((id) => !seen.has(id));
  if (unreachable.length) {
    issues.push(`FSM states unreachable from ${fsm.initial}: ${unreachable.join(", ")}`);
  }

  return issues;
}

export function assertWorkflowFsm(fsm: WorkflowFsm): void {
  const issues = workflowFsmIssues(fsm);
  if (issues.length) throw new Error(issues.join("\n"));
}
