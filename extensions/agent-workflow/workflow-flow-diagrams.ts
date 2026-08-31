/**
 * Pure multi-diagram projection of WORKFLOW_FSM for tuto-ui canvas.
 * Canonical source remains workflow-fsm.ts.
 *
 * Overview: envision + mode modules only (tools live on Align/Spec/Vibe details)
 * Mode diagrams: body states + call-site procedure chips (same-mode edges)
 * Full: all guided states + all transitions (no procedure boxes)
 */

import type { FsmState, FsmToolSpec, FsmTransition, FsmUserMode, WorkflowFsm } from "./workflow-fsm.ts";
import { WORKFLOW_FSM } from "./workflow-fsm.ts";

export type FlowNodePermission = "readonly" | "planonly" | "write" | "memory" | "standby" | "user-write";

export interface FlowDiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: string;
  summary?: string;
  permission?: FlowNodePermission;
  procedure?: string[];
  substates?: string[];
  targetSubgraph?: string;
  subgraphId?: string;
  customData?: Record<string, unknown>;
}

export interface FlowDiagramEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  event?: string;
  description?: string;
  descriptions?: string[];
  userMediated?: boolean;
  bidirectional?: boolean;
  waypoints?: Array<[number, number]>;
  customData?: Record<string, unknown>;
}

export interface FlowDiagramGraph {
  id: string;
  title: string;
  version?: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  session?: WorkflowFsm["session"];
  ownership?: string[];
  invariants?: string[];
  always?: string[];
  procedures?: Record<string, string[]>;
  tools?: WorkflowFsm["tools"];
  exceptions?: WorkflowFsm["exceptions"];
  artifact?: WorkflowFsm["artifact"];
  notes?: string[];
  initial?: string;
  framing?: boolean;
  states: Record<string, FlowDiagramNode>;
  transitions: FlowDiagramEdge[];
  subgraphs?: Record<string, FlowDiagramGraph>;
  activeSubgraphId?: string | null;
}

export interface DiagramLayoutSlice {
  nodes?: Record<string, { x: number; y: number; w?: number; h?: number }>;
  edges?: Record<string, Array<[number, number]>>;
}

export type WorkflowLayoutInput =
  | {
      diagrams?: Record<string, DiagramLayoutSlice>;
      nodes?: Record<string, { x: number; y: number; w?: number; h?: number }>;
      edges?: Record<string, Array<[number, number]>>;
    }
  | Record<string, { x: number; y: number; w?: number; h?: number }>;

const DEFAULT_NODE = { w: 210, h: 48 } as const;
const DEFAULT_MODULE = { w: 260, h: 120 } as const;
const DEFAULT_PROC = { w: 140, h: 56 } as const;
const DEFAULT_SHARED_PROC = { w: 160, h: 56 } as const;

const DEFAULT_MODE_LAYOUT: Record<FsmUserMode, Record<string, { x: number; y: number; w: number; h: number }>> = {
  align: {
    evaluate: { x: 420, y: 0, w: 210, h: 48 },
    establish: { x: 420, y: 160, w: 210, h: 48 },
    "proc-start": { x: 680, y: -8, w: 140, h: 56 },
    "proc-ask": { x: 680, y: 56, w: 140, h: 56 },
    "proc-next": { x: 680, y: 160, w: 140, h: 56 },
    "proc-capture-turn": { x: 160, y: -8, w: 160, h: 56 },
    "proc-reconcile-scope": { x: 160, y: 56, w: 160, h: 56 },
    "proc-proceed-with-best": { x: 160, y: 160, w: 160, h: 56 },
  },
  spec: {
    explore: { x: 420, y: 320, w: 210, h: 48 },
    elaborate: { x: 420, y: 480, w: 210, h: 48 },
    "proc-decide": { x: 680, y: 320, w: 140, h: 56 },
    "proc-next": { x: 680, y: 480, w: 140, h: 56 },
    "proc-capture-turn": { x: 160, y: 320, w: 160, h: 56 },
    "proc-record-decision": { x: 160, y: 400, w: 160, h: 56 },
    "proc-close-out": { x: 160, y: 480, w: 160, h: 56 },
  },
  vibe: {
    execute: { x: 420, y: 640, w: 210, h: 48 },
    examine: { x: 420, y: 800, w: 210, h: 48 },
    "proc-decide": { x: 680, y: 640, w: 140, h: 56 },
    "proc-next": { x: 680, y: 800, w: 140, h: 56 },
    "proc-capture-turn": { x: 160, y: 640, w: 160, h: 56 },
    "proc-record-decision": { x: 160, y: 720, w: 160, h: 56 },
    "proc-close-out": { x: 160, y: 800, w: 160, h: 56 },
  },
};

const DEFAULT_OVERVIEW_LAYOUT: Record<string, { x: number; y: number; w: number; h: number }> = {
  envision: { x: 445, y: -160, w: 210, h: 48 },
  align: { x: 420, y: -20, w: 260, h: 120 },
  spec: { x: 420, y: 220, w: 260, h: 120 },
  vibe: { x: 420, y: 480, w: 260, h: 120 },
  "proc-start": { x: 740, y: -160, w: 140, h: 56 },
  "proc-ask": { x: 740, y: -20, w: 140, h: 56 },
  "proc-decide": { x: 740, y: 220, w: 140, h: 56 },
  "proc-next": { x: 740, y: 480, w: 140, h: 56 },
};

/** Vertical spine — keep in sync with workflow-layout.js diagrams.full */
const DEFAULT_FULL_LAYOUT: Record<string, { x: number; y: number; w: number; h: number }> = {
  envision: { x: 420, y: -160, w: 210, h: 48 },
  evaluate: { x: 420, y: 0, w: 210, h: 48 },
  establish: { x: 420, y: 160, w: 210, h: 48 },
  explore: { x: 420, y: 320, w: 210, h: 48 },
  elaborate: { x: 420, y: 480, w: 210, h: 48 },
  execute: { x: 420, y: 640, w: 210, h: 48 },
  examine: { x: 420, y: 800, w: 210, h: 48 },
};

function mapPermission(p: FsmState["permission"]): FlowNodePermission {
  return p === "write" ? "write" : "planonly";
}

function isLayoutInput(value: unknown): value is WorkflowLayoutInput {
  return Boolean(value) && typeof value === "object";
}

function resolveDiagramLayout(layout: WorkflowLayoutInput | undefined, diagramId: string): DiagramLayoutSlice {
  if (!layout || !isLayoutInput(layout)) return {};
  const asRecord = layout as Record<string, unknown>;
  if (asRecord.diagrams && typeof asRecord.diagrams === "object") {
    return (asRecord.diagrams as Record<string, DiagramLayoutSlice>)[diagramId] || {};
  }
  if (asRecord.nodes || asRecord.edges) {
    return {
      nodes: asRecord.nodes as DiagramLayoutSlice["nodes"],
      edges: asRecord.edges as DiagramLayoutSlice["edges"],
    };
  }
  const maybeNodes = asRecord as Record<string, { x: number; y: number; w?: number; h?: number }>;
  const first = Object.values(maybeNodes)[0];
  if (first && typeof first === "object" && "x" in first && "y" in first) {
    return { nodes: maybeNodes };
  }
  return {};
}

function placeNode(
  id: string,
  defaults: { x: number; y: number; w: number; h: number },
  layoutNodes?: DiagramLayoutSlice["nodes"],
): { x: number; y: number; w: number; h: number } {
  const hit = layoutNodes?.[id];
  if (hit) {
    return {
      x: hit.x,
      y: hit.y,
      w: hit.w ?? defaults.w,
      h: hit.h ?? defaults.h,
    };
  }
  return { ...defaults };
}

function stateToNode(state: FsmState, pos: { x: number; y: number; w: number; h: number }): FlowDiagramNode {
  return {
    id: state.id,
    label: state.label,
    x: pos.x,
    y: pos.y,
    w: pos.w,
    h: pos.h,
    kind: "mode",
    summary: state.summary,
    permission: mapPermission(state.permission),
    procedure: [...state.procedure],
    substates: state.substates ? [...state.substates] : undefined,
    customData: { userMode: state.userMode, role: state.role },
  };
}

function transitionToEdge(t: FsmTransition, waypoints?: Array<[number, number]>): FlowDiagramEdge {
  return {
    id: t.id,
    from: t.from,
    to: t.to,
    label: t.label || t.event,
    event: t.event,
    description: t.description,
    userMediated: Boolean(t.userMediated),
    bidirectional: Boolean(t.bidirectional),
    waypoints: waypoints ? waypoints.map(([x, y]) => [x, y] as [number, number]) : undefined,
  };
}

/** Synthetic procedure chips — not FsmStateId, not transition endpoints. */
const MODE_PROCEDURE_TOOLS: Record<FsmUserMode, Array<FsmToolSpec["name"]>> = {
  align: ["start", "ask", "next"],
  spec: ["decide", "next"],
  vibe: ["decide", "next"],
};

const MODE_SHARED_PROCEDURES: Record<FsmUserMode, string[]> = {
  align: ["CAPTURE_TURN", "RECONCILE_SCOPE", "PROCEED_WITH_BEST"],
  spec: ["CAPTURE_TURN", "RECORD_DECISION", "CLOSE_OUT"],
  vibe: ["CAPTURE_TURN", "RECORD_DECISION", "CLOSE_OUT"],
};

const MODE_SYNTHETIC_CALLS: Record<
  FsmUserMode,
  Array<{ from: string; to: string; label: string; event?: string; description?: string }>
> = {
  align: [
    { from: "evaluate", to: "proc-ask", label: "CALL ask", description: "Envision/evaluate prompts question picker" },
    {
      from: "evaluate",
      to: "proc-reconcile-scope",
      label: "RECONCILE_SCOPE",
      description: "Reconciles scope and active Ds",
    },
    {
      from: "evaluate",
      to: "proc-proceed-with-best",
      label: "PWB",
      description: "Proceed-with-best settlement shortcut",
    },
    {
      from: "evaluate",
      to: "proc-capture-turn",
      label: "CAPTURE_TURN",
      description: "Turn intake and transcript recording",
    },
    { from: "establish", to: "proc-next", label: "CALL next", description: "Establish secondary gate queues exit" },
  ],
  spec: [
    { from: "explore", to: "proc-decide", label: "CALL decide", description: "Autonomous rationale logger" },
    {
      from: "explore",
      to: "proc-record-decision",
      label: "RECORD_DECISION",
      description: "Records decision artifact and tags D review",
    },
    {
      from: "explore",
      to: "proc-capture-turn",
      label: "CAPTURE_TURN",
      description: "Turn intake and transcript recording",
    },
    {
      from: "elaborate",
      to: "proc-close-out",
      label: "CLOSE_OUT",
      description: "Spec close-out checklist audit before next",
    },
    { from: "elaborate", to: "proc-next", label: "CALL next", description: "Spec secondary gate queues next actions" },
  ],
  vibe: [
    { from: "execute", to: "proc-decide", label: "CALL decide", description: "Autonomous rationale logger" },
    {
      from: "execute",
      to: "proc-record-decision",
      label: "RECORD_DECISION",
      description: "Records decision artifact and tags D review",
    },
    {
      from: "execute",
      to: "proc-capture-turn",
      label: "CAPTURE_TURN",
      description: "Turn intake and transcript recording",
    },
    {
      from: "examine",
      to: "proc-close-out",
      label: "CLOSE_OUT",
      description: "Vibe close-out verification audit before next",
    },
    { from: "examine", to: "proc-next", label: "CALL next", description: "Vibe secondary gate queues next actions" },
  ],
};

export function buildProcedureStrip(
  fsm: WorkflowFsm,
  layoutNodes?: DiagramLayoutSlice["nodes"],
  defaults: Record<string, { x: number; y: number; w: number; h: number }> = DEFAULT_OVERVIEW_LAYOUT,
  toolNames?: Array<FsmToolSpec["name"]>,
  userMode?: FsmUserMode,
): Record<string, FlowDiagramNode> {
  const out: Record<string, FlowDiagramNode> = {};
  let index = 0;
  const allowed = toolNames ? new Set(toolNames) : null;
  for (const tool of fsm.tools) {
    if (allowed && !allowed.has(tool.name)) continue;
    const id = `proc-${tool.name}`;
    const pos = placeNode(
      id,
      defaults[id] || {
        x: 80 + index * 170,
        y: 420,
        w: DEFAULT_PROC.w,
        h: DEFAULT_PROC.h,
      },
      layoutNodes,
    );
    out[id] = {
      id,
      label: tool.name.toUpperCase(),
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      kind: "procedure",
      summary: tool.summary,
      procedure: [...tool.mechanics],
      customData: {
        procedureTool: tool.name,
        modes: tool.modes,
        gate: tool.gate,
        ...(userMode ? { userMode } : {}),
      },
    };
    index += 1;
  }
  return out;
}

export function buildSharedProcedureStrip(
  fsm: WorkflowFsm,
  layoutNodes?: DiagramLayoutSlice["nodes"],
  defaults: Record<string, { x: number; y: number; w: number; h: number }> = {},
  procedureNames?: string[],
  userMode?: FsmUserMode,
): Record<string, FlowDiagramNode> {
  const out: Record<string, FlowDiagramNode> = {};
  if (!procedureNames) return out;
  let index = 0;
  for (const name of procedureNames) {
    const steps = fsm.procedures[name];
    if (!steps) continue;
    const slug = name.toLowerCase().replace(/_/g, "-");
    const id = `proc-${slug}`;
    const pos = placeNode(
      id,
      defaults[id] || {
        x: 160,
        y: 80 + index * 100,
        w: DEFAULT_SHARED_PROC.w,
        h: DEFAULT_SHARED_PROC.h,
      },
      layoutNodes,
    );
    out[id] = {
      id,
      label: name,
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      kind: "procedure",
      summary: steps[0] || name,
      procedure: [...steps],
      customData: {
        sharedProcedure: name,
        ...(userMode ? { userMode } : {}),
      },
    };
    index += 1;
  }
  return out;
}

function buildModeSubgraph(fsm: WorkflowFsm, mode: FsmUserMode, layout: DiagramLayoutSlice): FlowDiagramGraph {
  const body = fsm.modeBodies.find((b) => b.mode === mode);
  if (!body) throw new Error(`Missing modeBody for ${mode}`);
  const defaults = DEFAULT_MODE_LAYOUT[mode];
  const states: Record<string, FlowDiagramNode> = {};
  for (const stateId of body.states) {
    const st = fsm.states[stateId];
    const pos = placeNode(
      stateId,
      defaults[stateId] || { x: 120, y: 120, w: DEFAULT_NODE.w, h: DEFAULT_NODE.h },
      layout.nodes,
    );
    states[stateId] = stateToNode(st, pos);
  }

  Object.assign(states, buildProcedureStrip(fsm, layout.nodes, defaults, MODE_PROCEDURE_TOOLS[mode], mode));
  Object.assign(states, buildSharedProcedureStrip(fsm, layout.nodes, defaults, MODE_SHARED_PROCEDURES[mode], mode));

  const modeEdges = fsm.transitions.filter((t) => {
    const fromMode = fsm.states[t.from]?.userMode;
    const toMode = fsm.states[t.to]?.userMode;
    return fromMode === mode && toMode === mode;
  });

  const transitions = modeEdges.map((t) => transitionToEdge(t, layout.edges?.[t.id]));

  const syntheticCalls = (MODE_SYNTHETIC_CALLS[mode] || []).map((call) => {
    const edgeId = `${mode}-${call.from}->${call.to}`;
    return {
      id: edgeId,
      from: call.from,
      to: call.to,
      label: call.label,
      event: call.event || call.label,
      description: call.description,
      customData: { synthetic: true, procedureEdge: true },
      waypoints: layout.edges?.[edgeId],
    };
  });

  transitions.push(...syntheticCalls);

  return {
    id: mode,
    title: body.label,
    version: fsm.version,
    summary: body.steps.join(" "),
    framing: false,
    initial: body.primary || body.states[0],
    states,
    transitions,
    tools: fsm.tools,
  };
}

function landingMode(fsm: WorkflowFsm, stateId: string): string {
  if (stateId === "envision") return "envision";
  const st = fsm.states[stateId as keyof typeof fsm.states];
  if (st?.userMode) return st.userMode;
  if (stateId === "explore") return "spec";
  if (stateId === "execute") return "vibe";
  if (stateId === "establish" || stateId === "evaluate") return "align";
  return stateId;
}

/** Overview edges: entry hops + cross-mode from secondaries (clean aggregated pairs). */
export function aggregateOverviewEdges(fsm: WorkflowFsm): FlowDiagramEdge[] {
  const bucket = new Map<string, FlowDiagramEdge>();

  function pushAggregate(partial: FlowDiagramEdge & { sourceId: string }) {
    const key = `${partial.from}->${partial.to}`;
    const existing = bucket.get(key);
    if (existing) {
      const sources = (existing.customData?.sources as string[]) || [];
      if (!sources.includes(partial.sourceId)) sources.push(partial.sourceId);
      existing.customData = { ...existing.customData, sources };
      if (partial.description) {
        const descs = existing.descriptions || (existing.description ? [existing.description] : []);
        if (!descs.includes(partial.description)) descs.push(partial.description);
        existing.descriptions = descs;
      }
      return;
    }
    bucket.set(key, {
      id: partial.id,
      from: partial.from,
      to: partial.to,
      label: partial.label,
      event: partial.event,
      description: partial.description,
      userMediated: partial.userMediated,
      customData: {
        aggregate: true,
        sources: [partial.sourceId],
        landing: partial.customData?.landing,
        exception: partial.customData?.exception,
        exceptionCommand: partial.customData?.exceptionCommand,
      },
    });
  }

  for (const t of fsm.transitions) {
    if (t.from === "envision") {
      if (t.event === "CONTINUE") {
        pushAggregate({
          id: "overview-envision-align",
          sourceId: t.id,
          from: "envision",
          to: "align",
          label: "CONTINUE",
          event: "CONTINUE",
          description: t.description,
          customData: { landing: "evaluate" },
        });
      } else if (t.event === "PWB_SPEC") {
        pushAggregate({
          id: "overview-envision-spec",
          sourceId: t.id,
          from: "envision",
          to: "spec",
          label: "PWB_SPEC",
          event: "PWB_SPEC",
          description: t.description,
          userMediated: true,
        });
      } else if (t.event === "PWB_VIBE") {
        pushAggregate({
          id: "overview-envision-vibe",
          sourceId: t.id,
          from: "envision",
          to: "vibe",
          label: "PWB_VIBE",
          event: "PWB_VIBE",
          description: t.description,
          userMediated: true,
        });
      }
      continue;
    }

    if (t.from === "evaluate" && (t.event === "PWB_SPEC" || t.event === "PWB_VIBE")) {
      const dest = t.event === "PWB_SPEC" ? "spec" : "vibe";
      pushAggregate({
        id: `overview-align-${dest}`,
        sourceId: t.id,
        from: "align",
        to: dest,
        label: t.event === "PWB_SPEC" ? "next" : "next / PWB",
        event: "next",
        description: t.description,
        userMediated: true,
      });
      continue;
    }

    const fromMode = fsm.states[t.from]?.userMode;
    const toMode = fsm.states[t.to]?.userMode;
    if (fromMode && toMode && fromMode === toMode) continue;

    const from = fromMode || landingMode(fsm, t.from);
    const to = toMode || landingMode(fsm, t.to);
    if (from === to && t.to !== "envision") continue;

    const dest = t.to === "envision" ? "envision" : to;
    const isHandoff = t.event === "NEXT_HANDOFF" || t.to === "envision";
    const isReturn = t.event === "RETURN_ALIGN" || (dest === "align" && (from === "spec" || from === "vibe"));

    pushAggregate({
      id: `overview-${from}-${dest}`,
      sourceId: t.id,
      from,
      to: dest,
      label: isHandoff ? "/handoff" : isReturn ? "return" : "next",
      event: isHandoff ? "/handoff" : isReturn ? "return" : "next",
      description: t.description,
      userMediated: Boolean(t.userMediated),
      customData: {
        landing: t.to,
        ...(isHandoff ? { exception: true, exceptionCommand: "/handoff" } : {}),
      },
    });
  }

  return Array.from(bucket.values());
}

/** @deprecated kept for callers expecting next-filtered aggregates */
export function aggregateCrossModeEdges(fsm: WorkflowFsm): FlowDiagramEdge[] {
  return aggregateOverviewEdges(fsm).filter((e) => {
    const sources = (e.customData?.sources as string[]) || [];
    return sources.some((id) => {
      const t = fsm.transitions.find((x) => x.id === id);
      return t && fsm.states[t.from]?.role === "secondary";
    });
  });
}

export function buildToolsSubgraph(fsm: WorkflowFsm, layout: DiagramLayoutSlice): FlowDiagramGraph {
  const defaults: Record<string, { x: number; y: number; w: number; h: number }> = {
    "tool-start": { x: 180, y: -60, w: 160, h: 52 },
    "tool-ask": { x: 180, y: 30, w: 160, h: 52 },
    "tool-decide": { x: 180, y: 120, w: 160, h: 52 },
    "tool-next": { x: 180, y: 210, w: 160, h: 52 },
    "cmd-mode": { x: 180, y: 300, w: 160, h: 52 },
    "cmd-handoff": { x: 180, y: 390, w: 160, h: 52 },
    "target-envision": { x: 560, y: -60, w: 260, h: 52 },
    "target-align": { x: 560, y: 30, w: 260, h: 68 },
    "target-spec": { x: 560, y: 130, w: 260, h: 68 },
    "target-vibe": { x: 560, y: 230, w: 260, h: 68 },
  };

  const states: Record<string, FlowDiagramNode> = {};

  for (const tool of fsm.tools) {
    const id = `tool-${tool.name}`;
    const pos = placeNode(id, defaults[id] || { x: 180, y: 100, w: 160, h: 52 }, layout.nodes);
    states[id] = {
      id,
      label: `CALL ${tool.name.toUpperCase()}`,
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      kind: "procedure",
      summary: tool.summary,
      procedure: [...tool.mechanics],
      customData: { procedureTool: tool.name, modes: tool.modes, gate: tool.gate },
    };
  }

  states["cmd-mode"] = {
    id: "cmd-mode",
    label: "/mode",
    x: placeNode("cmd-mode", defaults["cmd-mode"] || { x: 180, y: 300, w: 160, h: 52 }, layout.nodes).x,
    y: placeNode("cmd-mode", defaults["cmd-mode"] || { x: 180, y: 300, w: 160, h: 52 }, layout.nodes).y,
    w: 160,
    h: 52,
    kind: "procedure",
    summary: "Universal manual mode switch option picker",
    procedure: ["Escape hatch: opens the mode picker anywhere, without completing current steps."],
  };

  states["cmd-handoff"] = {
    id: "cmd-handoff",
    label: "/handoff",
    x: placeNode("cmd-handoff", defaults["cmd-handoff"] || { x: 180, y: 390, w: 160, h: 52 }, layout.nodes).x,
    y: placeNode("cmd-handoff", defaults["cmd-handoff"] || { x: 180, y: 390, w: 160, h: 52 }, layout.nodes).y,
    w: 160,
    h: 52,
    kind: "procedure",
    summary: "Session restart continue into fresh Align",
    procedure: ["Leaves current format artifact intact and starts fresh session at envision."],
  };

  states["target-envision"] = {
    id: "target-envision",
    label: "ENVISION (entry)",
    x: placeNode("target-envision", defaults["target-envision"] || { x: 560, y: -60, w: 260, h: 52 }, layout.nodes).x,
    y: placeNode("target-envision", defaults["target-envision"] || { x: 560, y: -60, w: 260, h: 52 }, layout.nodes).y,
    w: 260,
    h: 52,
    kind: "mode",
    summary: "Session entry: initial scope ask + artifact start",
  };

  states["target-align"] = {
    id: "target-align",
    label: "ALIGN",
    x: placeNode("target-align", defaults["target-align"] || { x: 560, y: 30, w: 260, h: 68 }, layout.nodes).x,
    y: placeNode("target-align", defaults["target-align"] || { x: 560, y: 30, w: 260, h: 68 }, layout.nodes).y,
    w: 260,
    h: 68,
    kind: "mode",
    summary: "evaluate (primary, CALL ask) ⇄ establish (secondary, CALL next)",
  };

  states["target-spec"] = {
    id: "target-spec",
    label: "SPEC",
    x: placeNode("target-spec", defaults["target-spec"] || { x: 560, y: 130, w: 260, h: 68 }, layout.nodes).x,
    y: placeNode("target-spec", defaults["target-spec"] || { x: 560, y: 130, w: 260, h: 68 }, layout.nodes).y,
    w: 260,
    h: 68,
    kind: "mode",
    summary: "explore (primary, CALL decide) ⇄ elaborate (secondary, CALL next)",
  };

  states["target-vibe"] = {
    id: "target-vibe",
    label: "VIBE",
    x: placeNode("target-vibe", defaults["target-vibe"] || { x: 560, y: 230, w: 260, h: 68 }, layout.nodes).x,
    y: placeNode("target-vibe", defaults["target-vibe"] || { x: 560, y: 230, w: 260, h: 68 }, layout.nodes).y,
    w: 260,
    h: 68,
    kind: "mode",
    summary: "execute (primary, CALL decide) ⇄ examine (secondary, CALL next)",
  };

  const transitions: FlowDiagramEdge[] = [
    {
      id: "tools-start-envision",
      from: "tool-start",
      to: "target-envision",
      label: "entry start",
      description: "Creates/names artifact on session entry after first scope ask",
      waypoints: layout.edges?.["tools-start-envision"],
    },
    {
      id: "tools-ask-envision",
      from: "tool-ask",
      to: "target-envision",
      label: "goal-scope",
      description: "One batch scope ask on session entry before start",
      waypoints: layout.edges?.["tools-ask-envision"],
    },
    {
      id: "tools-ask-align",
      from: "tool-ask",
      to: "target-align",
      label: "evaluate only",
      description: "User clarification, D-review, and RECONCILE_SCOPE (never from establish)",
      waypoints: layout.edges?.["tools-ask-align"],
    },
    {
      id: "tools-decide-spec",
      from: "tool-decide",
      to: "target-spec",
      label: "explore",
      description: "Autonomous decision logging during research (RECORD_DECISION)",
      waypoints: layout.edges?.["tools-decide-spec"],
    },
    {
      id: "tools-decide-vibe",
      from: "tool-decide",
      to: "target-vibe",
      label: "execute",
      description: "Autonomous decision logging during implementation (RECORD_DECISION)",
      waypoints: layout.edges?.["tools-decide-vibe"],
    },
    {
      id: "tools-next-align",
      from: "tool-next",
      to: "target-align",
      label: "establish only",
      description: "Secondary gate exit recommendation (never from evaluate)",
      waypoints: layout.edges?.["tools-next-align"],
    },
    {
      id: "tools-next-spec",
      from: "tool-next",
      to: "target-spec",
      label: "elaborate only",
      description: "Secondary gate exit recommendation (never from explore)",
      waypoints: layout.edges?.["tools-next-spec"],
    },
    {
      id: "tools-next-vibe",
      from: "tool-next",
      to: "target-vibe",
      label: "examine only",
      description: "Secondary gate exit recommendation (never from execute)",
      waypoints: layout.edges?.["tools-next-vibe"],
    },
    {
      id: "tools-mode-bypass",
      from: "cmd-mode",
      to: "target-align",
      label: "bypass all",
      description: "Manual escape hatch available across all modes without gate conditions",
      waypoints: layout.edges?.["tools-mode-bypass"],
    },
    {
      id: "tools-handoff-envision",
      from: "cmd-handoff",
      to: "target-envision",
      label: "restart",
      description: "Restarts session in fresh ALIGN keeping existing plan intact",
      waypoints: layout.edges?.["tools-handoff-envision"],
    },
  ];

  return {
    id: "tools",
    title: "Tools & Gates",
    version: fsm.version,
    summary:
      "Procedure tools (start, ask, decide, next) and manual command bypasses (/mode, /handoff) mapped to caller mode permissions and primary/secondary gate rules.",
    framing: false,
    initial: "tool-start",
    states,
    transitions,
    tools: fsm.tools,
  };
}

export function toFlowDiagrams(fsm: WorkflowFsm = WORKFLOW_FSM, layout?: WorkflowLayoutInput): FlowDiagramGraph {
  const overviewLayout = resolveDiagramLayout(layout, "overview");
  const legacy = resolveDiagramLayout(layout, "legacy");
  const mergeLegacy = (slice: DiagramLayoutSlice): DiagramLayoutSlice => ({
    nodes: { ...(legacy.nodes || {}), ...(slice.nodes || {}) },
    edges: { ...(legacy.edges || {}), ...(slice.edges || {}) },
  });

  const subgraphs: Record<string, FlowDiagramGraph> = {
    align: buildModeSubgraph(fsm, "align", mergeLegacy(resolveDiagramLayout(layout, "align"))),
    spec: buildModeSubgraph(fsm, "spec", mergeLegacy(resolveDiagramLayout(layout, "spec"))),
    vibe: buildModeSubgraph(fsm, "vibe", mergeLegacy(resolveDiagramLayout(layout, "vibe"))),
    tools: buildToolsSubgraph(fsm, mergeLegacy(resolveDiagramLayout(layout, "tools"))),
  };

  const overviewStates: Record<string, FlowDiagramNode> = {};

  const envision = fsm.states.envision;
  if (envision) {
    const pos = placeNode("envision", DEFAULT_OVERVIEW_LAYOUT.envision!, overviewLayout.nodes);
    overviewStates.envision = stateToNode(envision, pos);
  }

  for (const body of fsm.modeBodies) {
    const pos = placeNode(
      body.mode,
      DEFAULT_OVERVIEW_LAYOUT[body.mode] || { x: 120, y: 120, w: DEFAULT_MODULE.w, h: DEFAULT_MODULE.h },
      overviewLayout.nodes,
    );
    overviewStates[body.mode] = {
      id: body.mode,
      label: body.label,
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      kind: "mode",
      summary: `${body.states.join(" ⇄ ")} · exitTool ${body.exitTool || "next"}`,
      permission: body.mode === "vibe" ? "write" : "planonly",
      procedure: [...body.steps],
      targetSubgraph: body.mode,
      subgraphId: body.mode,
      customData: {
        modeBody: true,
        userMode: body.mode,
        states: body.states,
        primary: body.primary,
        secondary: body.secondary,
        exitTool: body.exitTool,
      },
    };
  }

  const overviewTransitions = aggregateOverviewEdges(fsm).map((edge) => {
    const wps = overviewLayout.edges?.[edge.id];
    return wps ? { ...edge, waypoints: wps } : edge;
  });

  return {
    id: fsm.id,
    title: fsm.title,
    version: fsm.version,
    subtitle: "Multi diagrams",
    summary: fsm.summary,
    session: fsm.session,
    ownership: [...fsm.ownership],
    invariants: [...fsm.invariants],
    always: [...fsm.always],
    procedures: { ...fsm.procedures },
    tools: fsm.tools,
    exceptions: fsm.exceptions,
    artifact: fsm.artifact,
    notes: [...fsm.notes],
    framing: false,
    initial: "envision",
    states: overviewStates,
    transitions: overviewTransitions,
    subgraphs,
  };
}

/** Flat full FSM (all guided states) for Multi|Full toggle. */
export function toFullFlowDiagram(fsm: WorkflowFsm = WORKFLOW_FSM, layout?: WorkflowLayoutInput): FlowDiagramGraph {
  const fullLayout = resolveDiagramLayout(layout, "full");
  const legacy = resolveDiagramLayout(layout, "legacy");
  const nodesLayout = { ...(legacy.nodes || {}), ...(fullLayout.nodes || {}) };
  const edgesLayout = { ...(legacy.edges || {}), ...(fullLayout.edges || {}) };

  const states: Record<string, FlowDiagramNode> = {};
  for (const st of Object.values(fsm.states)) {
    const pos = placeNode(
      st.id,
      DEFAULT_FULL_LAYOUT[st.id] || { x: 100, y: 100, w: DEFAULT_NODE.w, h: DEFAULT_NODE.h },
      nodesLayout,
    );
    states[st.id] = stateToNode(st, pos);
  }

  const transitions = fsm.transitions.map((t) => transitionToEdge(t, edgesLayout[t.id]));

  return {
    id: `${fsm.id}-full`,
    title: `${fsm.title} · Full FSM`,
    version: fsm.version,
    subtitle: "All guided states",
    summary: fsm.summary,
    session: fsm.session,
    framing: false,
    initial: fsm.initial,
    states,
    transitions,
    tools: fsm.tools,
    exceptions: fsm.exceptions,
    notes: [...fsm.notes],
  };
}

export function flowDiagramCoverage(fsm: WorkflowFsm = WORKFLOW_FSM): {
  missing: string[];
  modeEdgeIds: string[];
  overviewSourceIds: string[];
} {
  const graph = toFlowDiagrams(fsm);
  const modeEdgeIds: string[] = [];
  for (const sub of Object.values(graph.subgraphs || {})) {
    for (const t of sub.transitions) modeEdgeIds.push(t.id);
  }
  const overviewSourceIds: string[] = [];
  for (const t of graph.transitions) {
    const sources = (t.customData?.sources as string[] | undefined) || [];
    overviewSourceIds.push(...sources);
  }
  const covered = new Set([...modeEdgeIds, ...overviewSourceIds]);
  const missing = fsm.transitions.map((t) => t.id).filter((id) => !covered.has(id));
  return { missing, modeEdgeIds, overviewSourceIds };
}
