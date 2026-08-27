/**
 * Client bootstrap script for Pi Director Workflow FSM visualizer.
 * Reads window.WORKFLOW_FSM_DATA and window.WORKFLOW_LAYOUT_DATA.
 * Named workflow-visualizer.js so it does not shadow workflow-fsm.ts when
 * the extension loader resolves `./workflow-fsm.js`.
 */
(function () {
  const fsmData = window.WORKFLOW_FSM_DATA || {};
  const layoutConfig = window.WORKFLOW_LAYOUT || window.WORKFLOW_LAYOUT_DATA || {};
  const canvas = document.getElementById("flow-canvas");

  // 7-"E" Lifecycle Step Node Layout from workflow-layout.json
  const defaultNodes = layoutConfig.nodes || {
    envision: { x: 40, y: 310, w: 200, h: 48 },
    evaluate: { x: 420, y: 70, w: 210, h: 48 },
    establish: { x: 420, y: 540, w: 210, h: 48 },
    explore: { x: 920, y: 70, w: 210, h: 48 },
    elaborate: { x: 920, y: 540, w: 210, h: 48 },
    execute: { x: 1420, y: 70, w: 210, h: 48 },
    examine: { x: 1420, y: 540, w: 210, h: 48 },
  };

  // Edge Custom Waypoints from workflow-layout.json
  const defaultEdges = layoutConfig.edges || {};

  let activeLayout = defaultNodes;
  try {
    const saved = localStorage.getItem("pi_workflow_layout_override");
    if (saved) {
      activeLayout = { ...defaultNodes, ...JSON.parse(saved) };
    }
  } catch {}

  let activeEdges = { ...defaultEdges };
  try {
    const savedEdges = localStorage.getItem("pi_workflow_edge_override");
    if (savedEdges) {
      activeEdges = JSON.parse(savedEdges);
    }
  } catch {}

  const states = {};
  for (const [id, pos] of Object.entries(activeLayout)) {
    const raw = (fsmData.states && fsmData.states[id]) || {};
    states[id] = {
      ...raw,
      ...pos,
      id,
    };
  }

  const transitions = (fsmData.transitions || []).map((t, idx) => {
    const edgeId = t.id || t.from + "->" + t.to + "-" + idx;
    if (activeEdges[edgeId]) {
      return { ...t, id: edgeId, waypoints: activeEdges[edgeId] };
    }
    return { ...t, id: edgeId };
  });

  if (canvas) {
    canvas.graph = {
      ...fsmData,
      framing: false,
      title: "Pi Director Agent Workflow",
      subtitle: "ARTIFACT · PWB · TO_GATE / TO_HOME · NEXT",
      groups: [],
      states,
      transitions,
    };
  }

  // Set footer version badge
  const footerVersion = document.getElementById("footer-version");
  if (footerVersion && fsmData.version) {
    footerVersion.textContent = `v${fsmData.version}`;
  }

  // Copy install command button
  const btnCopy = document.getElementById("btn-copy-cmd");
  const cmdText =
    document.getElementById("cmd-install")?.textContent || "pi install https://github.com/dhumdil-apps/pi-director";
  if (btnCopy) {
    btnCopy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(cmdText);
        btnCopy.classList.add("copied");
        setTimeout(() => {
          btnCopy.classList.remove("copied");
        }, 1600);
      } catch {}
    });
  }

  // Theme toggle
  const btnTheme = document.getElementById("btn-theme");
  if (btnTheme) {
    try {
      const savedTheme = localStorage.getItem("pi_workflow_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", savedTheme);
        if (canvas) canvas.theme = savedTheme;
      }
    } catch {}

    btnTheme.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      if (canvas) canvas.theme = next;
      try {
        localStorage.setItem("pi_workflow_theme", next);
      } catch {}
    });
  }
})();
