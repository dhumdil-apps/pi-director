import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WORKFLOW_FSM,
  formatWorkflowPrompt,
  type FsmStateId,
  type WorkflowFsm,
} from "../extensions/agent-workflow/workflow-fsm.ts";
import { assertWorkflowFsm, workflowFsmIssues } from "../extensions/agent-workflow/workflow-fsm-validate.ts";

function cloneFsm(): WorkflowFsm {
  return structuredClone(WORKFLOW_FSM);
}

describe("workflow FSM graph", () => {
  it("accepts the canonical graph", () => {
    assert.deepEqual(workflowFsmIssues(WORKFLOW_FSM), []);
    assert.doesNotThrow(() => assertWorkflowFsm(WORKFLOW_FSM));
  });

  it("rejects unknown transition endpoints", () => {
    const fsm = cloneFsm();
    fsm.transitions.push({
      id: "bogus-edge",
      from: "envision",
      event: "BOGUS",
      to: "not-a-state" as FsmStateId,
      label: "Bogus",
      description: "Unknown endpoint",
    });
    const issues = workflowFsmIssues(fsm);
    assert.match(issues.join("\n"), /bogus-edge.*unknown state/);
  });

  it("requires bidirectional edges to run primary → secondary", () => {
    const fsm = cloneFsm();
    const edge = fsm.transitions.find((item) => item.bidirectional);
    assert.ok(edge);
    edge.from = "establish";
    edge.to = "evaluate";
    const issues = workflowFsmIssues(fsm);
    assert.match(issues.join("\n"), /bidirectional .* primary → secondary/);
  });

  it("checks mode-body ownership and primary/secondary membership", () => {
    const ownership = cloneFsm();
    ownership.states.explore.userMode = "align";
    assert.match(workflowFsmIssues(ownership).join("\n"), /explore userMode mismatch for body spec/);

    const membership = cloneFsm();
    const spec = membership.modeBodies.find((body) => body.mode === "spec");
    assert.ok(spec);
    spec.states = spec.states.filter((id) => id !== "elaborate");
    assert.match(workflowFsmIssues(membership).join("\n"), /modeBodies\.spec secondary not in states/);
  });

  it("requires every guided state to be reachable from envision", () => {
    const fsm = cloneFsm();
    fsm.transitions = fsm.transitions.filter((edge) => edge.to !== "examine" && edge.from !== "examine");
    const issues = workflowFsmIssues(fsm);
    assert.match(issues.join("\n"), /unreachable from envision: examine/);
  });

  it("lets envision ask before start without extra pre-ask file reads", () => {
    const prompt = formatWorkflowPrompt();
    assert.match(prompt, /MAY CALL ask before start/);
    assert.match(prompt, /harness-injected AGENTS\.md/);
    assert.doesNotMatch(prompt, /never ask before start/i);
    assert.doesNotMatch(prompt, /Envision before the first scope ask may READ only root AGENTS\.md/);
  });
});
