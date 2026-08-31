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
    document.body.setAttribute("data-view", viewMode);
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

  document.body.setAttribute("data-view", viewMode);
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

  var refSidebar = document.getElementById("reference");
  var btnRefToggle = document.getElementById("btn-reference-toggle");

  function toggleReferenceSidebar(open) {
    if (!refSidebar) return;
    var isOpen = typeof open === "boolean" ? open : !refSidebar.classList.contains("is-open");
    refSidebar.classList.toggle("is-open", isOpen);
    if (btnRefToggle) {
      btnRefToggle.classList.toggle("active", isOpen);
      btnRefToggle.setAttribute("aria-expanded", String(isOpen));
    }
  }

  if (btnRefToggle) {
    btnRefToggle.addEventListener("click", function () {
      toggleReferenceSidebar();
    });
  }

  window.addEventListener("keydown", function (ev) {
    if (ev.key === "?" && !(ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement)) {
      if (modalShortcuts && modalShortcuts.hasAttribute("hidden")) {
        openShortcutsModal();
      } else {
        closeShortcutsModal();
      }
    } else if (
      (ev.key === "r" || ev.key === "R") &&
      !ev.ctrlKey &&
      !ev.metaKey &&
      !ev.altKey &&
      !(ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement)
    ) {
      toggleReferenceSidebar();
      ev.preventDefault();
    } else if (ev.key === "Escape") {
      if (modalShortcuts && !modalShortcuts.hasAttribute("hidden")) {
        closeShortcutsModal();
        ev.stopPropagation();
      } else if (refSidebar && refSidebar.classList.contains("is-open")) {
        toggleReferenceSidebar(false);
        ev.stopPropagation();
      }
    }
  });

  // ================================================================
  // Reference Panel — populates #reference from WORKFLOW_FSM_DATA
  // ================================================================

  function refEl(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = String(text);
    return e;
  }

  function refEsc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var CHEVRON_SVG =
    '<svg class="ref-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="9 18 15 12 9 6"></polyline></svg>';

  function makeAccordion(title, count) {
    var section = refEl("div", "ref-section");
    var toggle = refEl("button", "ref-toggle");
    toggle.type = "button";
    toggle.innerHTML =
      CHEVRON_SVG +
      '<span class="ref-title">' +
      refEsc(title) +
      "</span>" +
      (count != null ? '<span class="ref-count">' + refEsc(String(count)) + "</span>" : "");
    toggle.addEventListener("click", function () {
      section.classList.toggle("open");
    });
    var body = refEl("div", "ref-body");
    section.appendChild(toggle);
    section.appendChild(body);
    return { section: section, body: body };
  }

  function renderList(items, ordered) {
    var tag = ordered ? "ol" : "ul";
    var list = refEl(tag, "ref-list");
    for (var i = 0; i < items.length; i++) {
      list.appendChild(refEl("li", null, items[i]));
    }
    return list;
  }

  function renderKV(obj) {
    var dl = refEl("dl", "ref-kv");
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      dl.appendChild(refEl("dt", null, keys[i]));
      dl.appendChild(refEl("dd", null, obj[keys[i]]));
    }
    return dl;
  }

  function addListSection(container, title, data, ordered) {
    if (!data) return;
    if (Array.isArray(data)) {
      if (!data.length) return;
      var acc = makeAccordion(title, data.length);
      acc.body.appendChild(renderList(data, ordered));
      container.appendChild(acc.section);
    } else if (typeof data === "object") {
      var keys = Object.keys(data);
      if (!keys.length) return;
      var acc2 = makeAccordion(title, keys.length);
      acc2.body.appendChild(renderKV(data));
      container.appendChild(acc2.section);
    }
  }

  function addSessionEntry(container, entry) {
    if (!entry) return;
    var acc = makeAccordion(
      "Session Entry · " + (entry.label || entry.state || "envision"),
      entry.steps ? entry.steps.length + " steps" : null,
    );
    if (entry.summary) acc.body.appendChild(refEl("p", "ref-summary", entry.summary));
    var meta = refEl("div", "ref-meta");
    meta.innerHTML = '<span class="ref-badge ref-badge-hot">state: ' + refEsc(entry.state) + "</span>";
    acc.body.appendChild(meta);
    if (entry.steps && entry.steps.length) acc.body.appendChild(renderList(entry.steps));
    container.appendChild(acc.section);
  }

  function addModeBodies(container, bodies) {
    if (!bodies || !bodies.length) return;
    var acc = makeAccordion("Mode Bodies", bodies.length + " modes");
    for (var i = 0; i < bodies.length; i++) {
      var b = bodies[i];
      var sub = refEl("div", "ref-sub");

      var title = refEl("div", "ref-sub-title");
      title.innerHTML = "<strong>" + refEsc(b.label || b.mode) + "</strong>";
      sub.appendChild(title);

      var meta = refEl("div", "ref-meta");
      meta.innerHTML =
        '<span class="ref-badge">mode: ' +
        refEsc(b.mode) +
        "</span>" +
        '<span class="ref-badge">states: ' +
        refEsc((b.states || []).join(", ")) +
        "</span>" +
        '<span class="ref-badge ref-badge-hot">primary: ' +
        refEsc(b.primary || "—") +
        "</span>" +
        '<span class="ref-badge ref-badge-hot">secondary: ' +
        refEsc(b.secondary || "—") +
        "</span>" +
        '<span class="ref-badge">exitTool: ' +
        refEsc(b.exitTool || "—") +
        "</span>";
      sub.appendChild(meta);

      if (b.steps && b.steps.length) sub.appendChild(renderList(b.steps));
      acc.body.appendChild(sub);
    }
    container.appendChild(acc.section);
  }

  function addProcedures(container, procs) {
    if (!procs) return;
    var keys = Object.keys(procs);
    if (!keys.length) return;
    var acc = makeAccordion("Shared Procedures", keys.length);
    for (var i = 0; i < keys.length; i++) {
      var name = keys[i];
      var steps = procs[name];
      var sub = refEl("div", "ref-sub");

      var title = refEl("div", "ref-sub-title");
      title.innerHTML =
        "<strong>" + refEsc(name) + "</strong> " + '<span class="ref-count">' + steps.length + "</span>";
      sub.appendChild(title);
      sub.appendChild(renderList(steps));
      acc.body.appendChild(sub);
    }
    container.appendChild(acc.section);
  }

  function addTools(container, tools) {
    if (!tools || !tools.length) return;
    var acc = makeAccordion("Tools", tools.length);
    for (var i = 0; i < tools.length; i++) {
      var t = tools[i];
      var card = refEl("div", "ref-tool-card");

      var header = refEl("div", "ref-tool-header");
      header.innerHTML =
        '<span class="ref-tool-name">' +
        refEsc(t.name.toUpperCase()) +
        "</span>" +
        '<span class="ref-badge">' +
        refEsc((t.modes || []).join(", ")) +
        "</span>";
      card.appendChild(header);

      if (t.summary) card.appendChild(refEl("p", "ref-tool-summary", t.summary));

      if (t.gate && t.gate.length) {
        card.appendChild(refEl("div", "ref-tool-section-title", "Gate"));
        card.appendChild(renderList(t.gate));
      }
      if (t.mechanics && t.mechanics.length) {
        card.appendChild(refEl("div", "ref-tool-section-title", "Mechanics"));
        card.appendChild(renderList(t.mechanics));
      }

      acc.body.appendChild(card);
    }
    container.appendChild(acc.section);
  }

  function addExceptions(container, exc) {
    if (!exc) return;
    var cmdCount = exc.commands ? exc.commands.length : 0;
    var ruleCount = exc.rules ? exc.rules.length : 0;
    var acc = makeAccordion(
      "Exceptions" + (exc.title ? " · " + exc.title : ""),
      cmdCount + " commands, " + ruleCount + " rules",
    );

    if (exc.summary) acc.body.appendChild(refEl("p", "ref-summary", exc.summary));

    if (exc.commands && exc.commands.length) {
      for (var i = 0; i < exc.commands.length; i++) {
        var cmd = exc.commands[i];
        var card = refEl("div", "ref-cmd-card");

        var hdr = refEl("div", "ref-cmd-header");
        hdr.innerHTML =
          '<span class="ref-cmd-name">' +
          refEsc(cmd.command) +
          "</span>" +
          '<span class="ref-cmd-label">' +
          refEsc(cmd.label) +
          "</span>";
        card.appendChild(hdr);

        if (cmd.summary) card.appendChild(refEl("p", "ref-summary", cmd.summary));
        if (cmd.description) card.appendChild(refEl("p", "ref-cmd-desc", cmd.description));
        acc.body.appendChild(card);
      }
    }

    if (exc.rules && exc.rules.length) {
      acc.body.appendChild(refEl("div", "ref-sub-title", "Rules"));
      acc.body.appendChild(renderList(exc.rules));
    }

    container.appendChild(acc.section);
  }

  function addArtifact(container, art) {
    if (!art) return;
    var acc = makeAccordion("Artifact");

    if (art.sections && art.sections.length) {
      var sub1 = refEl("div", "ref-sub");
      sub1.appendChild(refEl("div", "ref-sub-title", "Sections"));
      sub1.appendChild(renderList(art.sections));
      acc.body.appendChild(sub1);
    }

    if (art.identifiers) {
      var sub2 = refEl("div", "ref-sub");
      sub2.appendChild(refEl("div", "ref-sub-title", "Identifiers"));
      sub2.appendChild(renderKV(art.identifiers));
      acc.body.appendChild(sub2);
    }

    if (art.rules && art.rules.length) {
      var sub3 = refEl("div", "ref-sub");
      sub3.appendChild(refEl("div", "ref-sub-title", "Rules"));
      sub3.appendChild(renderList(art.rules));
      acc.body.appendChild(sub3);
    }

    container.appendChild(acc.section);
  }

  function buildReference() {
    var data = window.WORKFLOW_FSM_DATA;
    var ref = document.getElementById("reference");
    if (!ref || !data) return;
    ref.innerHTML = "";

    // Sticky header
    var header = refEl("div", "ref-header");
    header.innerHTML =
      '<span class="ref-header-title">FSM Reference</span>' +
      '<span class="ref-header-version">v' +
      refEsc(data.version || "?") +
      "</span>";
    var btnAll = refEl("button", "ref-header-btn", "Expand All");
    btnAll.type = "button";
    btnAll.id = "btn-ref-toggle-all";
    btnAll.addEventListener("click", function () {
      var sections = ref.querySelectorAll(".ref-section");
      var allOpen = true;
      for (var i = 0; i < sections.length; i++) {
        if (!sections[i].classList.contains("open")) {
          allOpen = false;
          break;
        }
      }
      for (var j = 0; j < sections.length; j++) {
        if (allOpen) sections[j].classList.remove("open");
        else sections[j].classList.add("open");
      }
      btnAll.textContent = allOpen ? "Expand All" : "Collapse All";
    });
    header.appendChild(btnAll);

    var btnCloseRef = refEl("button", "ref-close-btn", "×");
    btnCloseRef.type = "button";
    btnCloseRef.title = "Close Reference Sidebar (Esc)";
    btnCloseRef.setAttribute("aria-label", "Close Reference Sidebar");
    btnCloseRef.addEventListener("click", function () {
      toggleReferenceSidebar(false);
    });
    header.appendChild(btnCloseRef);

    ref.appendChild(header);

    // Content area
    var content = refEl("div", "ref-content");

    // Summary
    if (data.summary) {
      var sumAcc = makeAccordion("Summary");
      sumAcc.body.appendChild(refEl("p", "ref-summary", data.summary));
      content.appendChild(sumAcc.section);
    }

    // Session State
    if (data.session) addListSection(content, "Session State", data.session);

    // Turn
    if (data.turn) addListSection(content, "Turn", data.turn, true);

    // Session Entry
    addSessionEntry(content, data.sessionEntry);

    // Mode Bodies
    addModeBodies(content, data.modeBodies);

    // Shared Procedures
    addProcedures(content, data.procedures);

    // Tools
    addTools(content, data.tools);

    // Ownership
    addListSection(content, "Ownership", data.ownership);

    // Invariants
    addListSection(content, "Invariants", data.invariants);

    // Always
    addListSection(content, "Always", data.always);

    // Exceptions
    addExceptions(content, data.exceptions);

    // Artifact
    addArtifact(content, data.artifact);

    // Notes
    addListSection(content, "Notes", data.notes);

    ref.appendChild(content);
  }

  buildReference();
})();
