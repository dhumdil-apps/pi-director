/**
 * Client bootstrap for multi-diagram + full FSM toggle.
 * Reads WORKFLOW_FSM_DATA, WORKFLOW_FLOW_GRAPH, WORKFLOW_LAYOUT.
 */
(function () {
  const fsmData = window.WORKFLOW_FSM_DATA || {};
  const layoutConfig = window.WORKFLOW_LAYOUT || window.WORKFLOW_LAYOUT_DATA || {};
  const prebuilt = window.WORKFLOW_FLOW_GRAPH || null;
  const canvas = document.getElementById("flow-canvas");
  const viewTablist = document.getElementById("view-tablist");
  const viewTabs = viewTablist
    ? Array.prototype.slice.call(viewTablist.querySelectorAll('[role="tab"][data-view]'))
    : [];

  function isMultiLayout(layout) {
    return layout && layout.diagrams && typeof layout.diagrams === "object";
  }

  function applyNodeLayout(states, nodeLayout) {
    if (!states || !nodeLayout) return;
    for (const [id, pos] of Object.entries(nodeLayout)) {
      if (!states[id] || !pos || typeof pos !== "object") continue;
      if (typeof pos.x === "number") states[id].x = pos.x;
      if (typeof pos.y === "number") states[id].y = pos.y;
      if (typeof pos.w === "number") states[id].w = pos.w;
      if (typeof pos.h === "number") states[id].h = pos.h;
    }
  }

  function applyEdgeLayout(transitions, edgeLayout) {
    if (!transitions || !edgeLayout) return transitions;
    return transitions.map(function (t, idx) {
      const edgeId = t.id || t.from + "->" + t.to + "-" + idx;
      if (edgeLayout[edgeId]) {
        return Object.assign({}, t, { id: edgeId, waypoints: edgeLayout[edgeId] });
      }
      return Object.assign({}, t, { id: edgeId });
    });
  }

  function cloneGraph(graph) {
    return JSON.parse(JSON.stringify(graph));
  }

  function applyLayoutToGraph(graph, layout, diagramKey) {
    if (!graph) return graph;
    const g = cloneGraph(graph);
    const multi = isMultiLayout(layout);

    function sliceFor(id) {
      if (multi) return layout.diagrams[id] || { nodes: {}, edges: {} };
      return { nodes: layout.nodes || layout, edges: layout.edges || {} };
    }

    if (diagramKey === "full" || !g.subgraphs) {
      const slice = sliceFor("full");
      const legacyNodes = !multi ? layout.nodes || layout : {};
      applyNodeLayout(g.states, Object.assign({}, legacyNodes, slice.nodes || {}));
      g.transitions = applyEdgeLayout(
        g.transitions || [],
        Object.assign({}, !multi ? layout.edges || {} : {}, slice.edges || {}),
      );
      return g;
    }

    const overviewSlice = sliceFor("overview");
    applyNodeLayout(g.states, overviewSlice.nodes);
    g.transitions = applyEdgeLayout(g.transitions || [], overviewSlice.edges || {});

    if (g.subgraphs) {
      for (const [subId, sub] of Object.entries(g.subgraphs)) {
        const slice = sliceFor(subId);
        const legacyNodes = !multi ? layout.nodes || layout : {};
        applyNodeLayout(sub.states, Object.assign({}, legacyNodes, slice.nodes || {}));
        sub.transitions = applyEdgeLayout(
          sub.transitions || [],
          Object.assign({}, !multi ? layout.edges || {} : {}, slice.edges || {}),
        );
      }
    }
    return g;
  }

  function buildFullFromFsm(layout) {
    // Keep in sync with workflow-layout.js diagrams.full + DEFAULT_FULL_LAYOUT
    const defaultNodes = {
      envision: { x: 420, y: -160, w: 210, h: 48 },
      evaluate: { x: 420, y: 0, w: 210, h: 48 },
      establish: { x: 420, y: 160, w: 210, h: 48 },
      explore: { x: 420, y: 320, w: 210, h: 48 },
      elaborate: { x: 420, y: 480, w: 210, h: 48 },
      execute: { x: 420, y: 640, w: 210, h: 48 },
      examine: { x: 420, y: 800, w: 210, h: 48 },
    };
    let nodes = defaultNodes;
    if (isMultiLayout(layout) && layout.diagrams.full && layout.diagrams.full.nodes) {
      nodes = Object.assign({}, defaultNodes, layout.diagrams.full.nodes);
    } else if (layout.nodes) {
      nodes = Object.assign({}, defaultNodes, layout.nodes);
    }
    const edgeLayout =
      (isMultiLayout(layout) && layout.diagrams.full && layout.diagrams.full.edges) || layout.edges || {};

    const states = {};
    for (const [id, pos] of Object.entries(nodes)) {
      if (!pos || typeof pos.x !== "number") continue;
      const raw = (fsmData.states && fsmData.states[id]) || {};
      states[id] = Object.assign({}, raw, pos, { id: id });
    }
    const transitions = (fsmData.transitions || []).map(function (t, idx) {
      const edgeId = t.id || t.from + "->" + t.to + "-" + idx;
      if (edgeLayout[edgeId]) {
        return Object.assign({}, t, { id: edgeId, waypoints: edgeLayout[edgeId] });
      }
      return Object.assign({}, t, { id: edgeId });
    });

    return {
      id: "full-fsm",
      title: (fsmData.title || "Workflow") + " · Full FSM",
      version: fsmData.version,
      framing: false,
      initial: fsmData.initial || "envision",
      states: states,
      transitions: transitions,
      tools: fsmData.tools,
      exceptions: fsmData.exceptions,
      summary: fsmData.summary,
    };
  }

  let viewMode = "multi";
  try {
    const saved = localStorage.getItem("pi_workflow_view");
    if (saved === "full" || saved === "multi") viewMode = saved;
  } catch {}

  function currentLayout() {
    let layout = window.WORKFLOW_LAYOUT || layoutConfig;
    if (viewMode === "full" && window.WORKFLOW_LAYOUT_FULL) {
      layout = window.WORKFLOW_LAYOUT_FULL;
    } else if (viewMode === "multi" && window.WORKFLOW_LAYOUT_MULTI) {
      layout = window.WORKFLOW_LAYOUT_MULTI;
    }

    try {
      const saved = localStorage.getItem("pi_workflow_layout_override_v28");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (viewMode === "full" && (parsed.nodes || parsed.edges)) {
          layout = parsed;
        } else if (viewMode === "multi" && (parsed.diagrams || parsed.overview || parsed.align)) {
          layout = { diagrams: parsed.diagrams || parsed };
        }
      }
    } catch {}
    return layout;
  }

  function paint() {
    if (!canvas) return;
    const layout = currentLayout();
    let graph;
    if (viewMode === "full") {
      graph = window.WORKFLOW_FULL_GRAPH
        ? applyLayoutToGraph(window.WORKFLOW_FULL_GRAPH, layout, "full")
        : buildFullFromFsm(layout);
      graph.framing = false;
      if (typeof canvas.showSubgraphNav !== "undefined") canvas.showSubgraphNav = false;
    } else if (prebuilt && prebuilt.subgraphs) {
      graph = applyLayoutToGraph(prebuilt, layout, "overview");
      graph.framing = false;
      if (typeof canvas.showSubgraphNav !== "undefined") canvas.showSubgraphNav = true;
    } else {
      graph = buildFullFromFsm(layout);
    }
    canvas.graph = graph;
  }

  function setViewMode(next) {
    if (next !== "full" && next !== "multi") return;
    if (next === viewMode) {
      syncViewTabs();
      return;
    }
    viewMode = next;
    try {
      localStorage.setItem("pi_workflow_view", viewMode);
    } catch {}
    syncViewTabs();
    paint();
  }

  function syncViewTabs() {
    viewTabs.forEach(function (tab) {
      const selected = tab.getAttribute("data-view") === viewMode;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
    });
  }

  if (viewTablist && viewTabs.length) {
    viewTablist.addEventListener("click", function (ev) {
      const tab = ev.target && ev.target.closest ? ev.target.closest('[role="tab"][data-view]') : null;
      if (!tab || !viewTablist.contains(tab)) return;
      setViewMode(tab.getAttribute("data-view"));
    });
    viewTablist.addEventListener("keydown", function (ev) {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (keys.indexOf(ev.key) === -1) return;
      const order = viewTabs;
      if (!order.length) return;
      let idx = order.findIndex(function (t) {
        return t.getAttribute("aria-selected") === "true";
      });
      if (idx < 0) idx = 0;
      if (ev.key === "ArrowLeft") idx = (idx - 1 + order.length) % order.length;
      if (ev.key === "ArrowRight") idx = (idx + 1) % order.length;
      if (ev.key === "Home") idx = 0;
      if (ev.key === "End") idx = order.length - 1;
      ev.preventDefault();
      order[idx].focus();
      setViewMode(order[idx].getAttribute("data-view"));
    });
  }

  syncViewTabs();
  paint();

  if (canvas) {
    canvas.addEventListener("flow:export-fsm-patch", function (ev) {
      try {
        console.info("[workflow-visualizer] FSM patch", ev.detail && ev.detail.patch);
      } catch {}
    });
  }

  const footerVersion = document.getElementById("footer-version");
  if (footerVersion && fsmData.version) {
    footerVersion.textContent = "v" + fsmData.version;
  }

  const btnCopy = document.getElementById("btn-copy-cmd");
  const cmdText =
    (document.getElementById("cmd-install") && document.getElementById("cmd-install").textContent) ||
    "pi install https://github.com/dhumdil-apps/pi-director";
  if (btnCopy) {
    btnCopy.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(cmdText);
        btnCopy.classList.add("copied");
        setTimeout(function () {
          btnCopy.classList.remove("copied");
        }, 1600);
      } catch {}
    });
  }

  const btnTheme = document.getElementById("btn-theme");
  if (btnTheme) {
    try {
      const savedTheme = localStorage.getItem("pi_workflow_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", savedTheme);
        if (canvas) canvas.theme = savedTheme;
      }
    } catch {}
    btnTheme.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      if (canvas) canvas.theme = next;
      try {
        localStorage.setItem("pi_workflow_theme", next);
      } catch {}
    });
  }

  // ---------------- Shortcuts & Legend Modal ----------------
  const modalShortcuts = document.getElementById("modal-shortcuts");
  const btnShortcuts = document.getElementById("btn-shortcuts");
  const btnCloseShortcuts = document.getElementById("btn-close-shortcuts");

  function openShortcutsModal() {
    if (!modalShortcuts) return;
    modalShortcuts.removeAttribute("hidden");
  }

  function closeShortcutsModal() {
    if (!modalShortcuts) return;
    modalShortcuts.setAttribute("hidden", "");
  }

  if (btnShortcuts) {
    btnShortcuts.addEventListener("click", openShortcutsModal);
  }
  if (btnCloseShortcuts) {
    btnCloseShortcuts.addEventListener("click", closeShortcutsModal);
  }
  if (modalShortcuts) {
    modalShortcuts.addEventListener("click", function (ev) {
      if (ev.target === modalShortcuts) {
        closeShortcutsModal();
      }
    });
  }

  window.addEventListener("keydown", function (ev) {
    if (ev.key === "?" && !(ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement)) {
      if (modalShortcuts && modalShortcuts.hasAttribute("hidden")) {
        openShortcutsModal();
      } else {
        closeShortcutsModal();
      }
    } else if (ev.key === "Escape" && modalShortcuts && !modalShortcuts.hasAttribute("hidden")) {
      closeShortcutsModal();
      ev.stopPropagation();
    }
  });
})();
