/**
 * Pure multi-diagram projection of WORKFLOW_FSM for tuto-ui canvas.
 * Canonical source remains workflow-fsm.ts.
 *
 * Overview: envision + mode modules + shared procedure strip (start/ask/decide/next)
 * Mode diagrams: body states only (same-mode edges)
 * Full: all guided states + all transitions (no procedure boxes)
 */

import type { FsmState, FsmTransition, FsmUserMode, WorkflowFsm } from "./workflow-fsm.ts";
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

const DEFAULT_MODE_LAYOUT: Record<FsmUserMode, Record<string, { x: number; y: number; w: number; h: number }>> = {
  align: {
    evaluate: { x: 200, y: 80, w: 280, h: 100 },
    establish: { x: 200, y: 280, w: 280, h: 100 },
    "proc-start": { x: 560, y: 40, w: 140, h: 56 },
    "proc-ask": { x: 720, y: 40, w: 140, h: 56 },
    "proc-decide": { x: 560, y: 140, w: 140, h: 56 },
    "proc-next": { x: 720, y: 140, w: 140, h: 56 },
  },
  spec: {
    explore: { x: 200, y: 80, w: 280, h: 110 },
    elaborate: { x: 200, y: 300, w: 280, h: 110 },
    "proc-start": { x: 560, y: 40, w: 140, h: 56 },
    "proc-ask": { x: 720, y: 40, w: 140, h: 56 },
    "proc-decide": { x: 560, y: 160, w: 140, h: 56 },
    "proc-next": { x: 720, y: 160, w: 140, h: 56 },
  },
  vibe: {
    execute: { x: 200, y: 80, w: 280, h: 110 },
    examine: { x: 200, y: 300, w: 280, h: 110 },
    "proc-start": { x: 560, y: 40, w: 140, h: 56 },
    "proc-ask": { x: 720, y: 40, w: 140, h: 56 },
    "proc-decide": { x: 560, y: 160, w: 140, h: 56 },
    "proc-next": { x: 720, y: 160, w: 140, h: 56 },
  },
};

const DEFAULT_OVERVIEW_LAYOUT: Record<string, { x: number; y: number; w: number; h: number }> = {
  envision: { x: 80, y: 40, w: 260, h: 100 },
  align: { x: 80, y: 220, w: 260, h: 120 },
  spec: { x: 420, y: 220, w: 260, h: 120 },
  vibe: { x: 760, y: 220, w: 260, h: 120 },
  "proc-start": { x: 80, y: 420, w: 140, h: 56 },
  "proc-ask": { x: 250, y: 420, w: 140, h: 56 },
  "proc-decide": { x: 420, y: 420, w: 140, h: 56 },
  "proc-next": { x: 590, y: 420, w: 140, h: 56 },
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
export function buildProcedureStrip(
  fsm: WorkflowFsm,
  layoutNodes?: DiagramLayoutSlice["nodes"],
  defaults: Record<string, { x: number; y: number; w: number; h: number }> = DEFAULT_OVERVIEW_LAYOUT,
): Record<string, FlowDiagramNode> {
  const out: Record<string, FlowDiagramNode> = {};
  let index = 0;
  for (const tool of fsm.tools) {
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

  Object.assign(states, buildProcedureStrip(fsm, layout.nodes, defaults));

  const modeEdges = fsm.transitions.filter((t) => {
    const fromMode = fsm.states[t.from]?.userMode;
    const toMode = fsm.states[t.to]?.userMode;
    return fromMode === mode && toMode === mode;
  });

  const transitions = modeEdges.map((t) => transitionToEdge(t, layout.edges?.[t.id]));

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

/** Overview edges: entry hops + cross-mode from secondaries (aggregated). */
export function aggregateOverviewEdges(fsm: WorkflowFsm): FlowDiagramEdge[] {
  const edges: FlowDiagramEdge[] = [];
  const bucket = new Map<string, FlowDiagramEdge>();

  function pushAggregate(partial: FlowDiagramEdge & { sourceId: string }) {
    const key = `${partial.from}|${partial.to}|${partial.event || partial.label}`;
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
      },
    });
  }

  for (const t of fsm.transitions) {
    if (t.from === "envision") {
      if (t.event === "CONTINUE") {
        pushAggregate({
          id: t.id,
          sourceId: t.id,
          from: "envision",
          to: "align",
          label: t.label || t.event,
          event: t.event,
          description: t.description,
          customData: { landing: "evaluate" },
        });
      } else if (t.event === "PWB_SPEC") {
        pushAggregate({
          id: t.id,
          sourceId: t.id,
          from: "envision",
          to: "spec",
          label: t.label || t.event,
          event: t.event,
          description: t.description,
          userMediated: true,
        });
      } else if (t.event === "PWB_VIBE") {
        pushAggregate({
          id: t.id,
          sourceId: t.id,
          from: "envision",
          to: "vibe",
          label: t.label || t.event,
          event: t.event,
          description: t.description,
          userMediated: true,
        });
      }
      continue;
    }

    if (t.from === "evaluate" && (t.event === "PWB_SPEC" || t.event === "PWB_VIBE")) {
      pushAggregate({
        id: t.id,
        sourceId: t.id,
        from: "align",
        to: t.event === "PWB_SPEC" ? "spec" : "vibe",
        label: t.label || t.event,
        event: t.event,
        description: t.description,
        userMediated: true,
      });
      continue;
    }

    const fromMode = fsm.states[t.from]?.userMode;
    const toMode = fsm.states[t.to]?.userMode;
    // Same-mode body edges stay on mode diagrams only
    if (fromMode && toMode && fromMode === toMode) continue;

    // Cross-mode (including handoff to envision)
    const from = fromMode || landingMode(fsm, t.from);
    const to = toMode || landingMode(fsm, t.to);
    if (from === to && t.to !== "envision") continue;

    pushAggregate({
      id: t.id,
      sourceId: t.id,
      from,
      to: t.to === "envision" ? "envision" : to,
      label: t.label || t.event,
      event: t.event,
      description: t.description,
      userMediated: Boolean(t.userMediated),
      customData: { landing: t.to },
    });
  }

  edges.push(...bucket.values());
  return edges;
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
        states: body.states,
        primary: body.primary,
        secondary: body.secondary,
        exitTool: body.exitTool,
      },
    };
  }

  Object.assign(overviewStates, buildProcedureStrip(fsm, overviewLayout.nodes, DEFAULT_OVERVIEW_LAYOUT));

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
