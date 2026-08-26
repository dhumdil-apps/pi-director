/** Pure FSM graph checks shared by the content build and the Node test suite. */

import type { FsmStateId, WorkflowFsm } from "./workflow-fsm.ts";

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

  for (const body of fsm.modeBodies) {
    for (const id of body.states) {
      if (!stateSet.has(id)) {
        issues.push(`FSM modeBodies.${body.mode} missing state ${id}`);
        continue;
      }
      if (fsm.states[id].userMode !== body.mode) {
        issues.push(`FSM state ${id} userMode mismatch for body ${body.mode}`);
      }
    }
    if (body.primary && !body.states.includes(body.primary)) {
      issues.push(`FSM modeBodies.${body.mode} primary not in states`);
    }
    if (body.secondary && !body.states.includes(body.secondary)) {
      issues.push(`FSM modeBodies.${body.mode} secondary not in states`);
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
    for (const next of outbound[id] ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
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
