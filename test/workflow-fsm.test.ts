import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  WORKFLOW_FSM,
  formatRuntimeWorkflowPrompt,
  formatWorkflowPrompt,
  workflowPrompt,
  type FsmStateId,
  type WorkflowFsm,
} from "../extensions/agent-workflow/workflow-fsm.ts";
import { assertWorkflowFsm, workflowFsmIssues } from "../extensions/agent-workflow/workflow-fsm-validate.ts";
import { pickerLabel, pickerTitle, shortenDescription } from "../extensions/agent-workflow/question-labels.ts";

function cloneFsm(): WorkflowFsm {
  return structuredClone(WORKFLOW_FSM);
}

describe("workflow FSM graph", () => {
  it("accepts the canonical graph", () => {
    assert.deepEqual(workflowFsmIssues(WORKFLOW_FSM), []);
    assert.doesNotThrow(() => assertWorkflowFsm(WORKFLOW_FSM));
  });

  it("is v2.8 with sessionEntry and no guided next state", () => {
    assert.equal(WORKFLOW_FSM.version, "2.8.0");
    assert.equal(WORKFLOW_FSM.sessionEntry.state, "envision");
    assert.ok(!("next" in WORKFLOW_FSM.states));
    assert.ok(!WORKFLOW_FSM.modeBodies.some((b) => b.states.includes("envision")));
    for (const body of WORKFLOW_FSM.modeBodies) {
      assert.equal(body.exitTool, "next");
    }
    assert.ok(WORKFLOW_FSM.tools.some((t) => t.name === "next"));
  });

  it("routes mode switch only from secondaries", () => {
    for (const edge of WORKFLOW_FSM.transitions) {
      if (
        edge.event === "NEXT_SPEC" ||
        edge.event === "NEXT_VIBE" ||
        edge.event === "NEXT_ALIGN" ||
        edge.event === "NEXT_HANDOFF" ||
        edge.event === "RETURN_ALIGN"
      ) {
        assert.equal(WORKFLOW_FSM.states[edge.from]?.role, "secondary", edge.id);
      }
      assert.notEqual(edge.event, "TO_NEXT", edge.id);
    }
  });

  it("keeps stay-on-primary tools off the transition table", () => {
    const selfEdges = WORKFLOW_FSM.transitions.filter((edge) => edge.from === edge.to);
    assert.deepEqual(selfEdges, []);
    const loopEvents = WORKFLOW_FSM.transitions.filter(
      (edge) => edge.event === "ASK_LOOP" || edge.event === "DECIDE_LOOP",
    );
    assert.deepEqual(loopEvents, []);
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
    assert.match(prompt, /NEVER add a todo tool/);
    assert.match(prompt, /Show plan displays only Digest/);
    assert.match(prompt, /MAY CALL ask before start|before start when no named artifact/);
    assert.match(prompt, /harness-injected AGENTS\.md/);
    assert.match(prompt, /## Session entry/);
    assert.match(prompt, /exitTool=next|CALL next|secondary gates/i);
    assert.doesNotMatch(prompt, /\bTO_NEXT\b/);
  });

  it("uses CONTINUE envision→evaluate and documents PWB ensure-start", () => {
    const edge = WORKFLOW_FSM.transitions.find((item) => item.id === "envision-to-evaluate");
    assert.ok(edge);
    assert.equal(edge.event, "CONTINUE");
    assert.match(edge.label, /CONTINUE/);
    const prompt = formatWorkflowPrompt();
    assert.match(prompt, /Q1-goal-scope/);
    assert.match(prompt, /runtime ensures named artifact|runtime settlement calls beginTask|ensure start/i);
  });

  it("injects a compact runtime booklet instead of the full FSM prompt", () => {
    const full = formatWorkflowPrompt();
    const runtime = formatRuntimeWorkflowPrompt();
    assert.match(runtime, /## Mode bodies/);
    assert.match(runtime, /NEVER add a todo tool/);
    assert.match(runtime, /exitTool=next|CALL next/i);
    assert.doesNotMatch(runtime, /## Notes/);
    assert.doesNotMatch(runtime, /### ENVISION \(envision/);
    assert.doesNotMatch(runtime, /\nMechanics:/);
    assert.ok(runtime.length < full.length);
    assert.ok(runtime.length < 28000);
    const wrapped = workflowPrompt();
    assert.match(wrapped, /<pi_workflow>/);
    assert.ok(wrapped.includes(runtime));
    assert.doesNotMatch(wrapped, /## Notes/);
  });

  it("does not shadow workflow-fsm.ts with a browser workflow-fsm.js", () => {
    const dir = join(dirname(fileURLToPath(import.meta.url)), "../extensions/agent-workflow");
    assert.equal(existsSync(join(dir, "workflow-fsm.js")), false);
    assert.equal(existsSync(join(dir, "workflow-visualizer.js")), true);
  });
});

describe("ask/decide picker labels", () => {
  it("shows A. value slug rows and prompt-only title", () => {
    assert.equal(
      pickerLabel(
        { value: "keep-scope", label: "keep scope", description: "Do not replace the goal", confidence: 5 },
        0,
      ),
      "A. keep-scope",
    );
    assert.equal(pickerTitle("Accept this decision?", "It changes who can write files."), "Accept this decision?");
    assert.ok(shortenDescription("x".repeat(100)).endsWith("…"));
  });
});

describe("workflow flow diagrams projection", () => {
  it("covers every transition via mode edges or overview sources", async () => {
    const { toFlowDiagrams, toFullFlowDiagram, flowDiagramCoverage } =
      await import("../extensions/agent-workflow/workflow-flow-diagrams.ts");
    const coverage = flowDiagramCoverage(WORKFLOW_FSM);
    assert.deepEqual(coverage.missing, [], coverage.missing.join(", "));

    const graph = toFlowDiagrams(WORKFLOW_FSM);
    assert.ok(graph.states.envision);
    assert.ok(!("next" in graph.states));
    assert.ok(!graph.states["proc-next"]);
    assert.ok(!graph.states["proc-start"]);
    assert.ok(graph.subgraphs?.align);
    assert.ok(!("next" in (graph.subgraphs?.align.states || {})));
    assert.ok(graph.subgraphs?.align.states["proc-next"]);
    assert.ok(graph.subgraphs?.align.states["proc-ask"]);
    assert.ok(!graph.subgraphs?.align.states["proc-decide"]);
    assert.ok(graph.subgraphs?.spec.states["proc-decide"]);
    assert.ok(!graph.subgraphs?.spec.states["proc-ask"]);
    assert.ok(graph.subgraphs?.align.transitions.every((t) => t.event !== "TO_NEXT"));

    assert.ok(graph.transitions.some((t) => t.event === "next"));
    assert.ok(graph.transitions.every((t) => !String(t.event || "").startsWith("NEXT_")));

    const full = toFullFlowDiagram(WORKFLOW_FSM);
    assert.equal(Object.keys(full.states).length, Object.keys(WORKFLOW_FSM.states).length);
    assert.ok(!("next" in full.states));
    assert.equal(full.transitions.length, WORKFLOW_FSM.transitions.length);
    assert.ok(full.transitions.some((t) => String(t.event || "").startsWith("NEXT_")));
  });
});
