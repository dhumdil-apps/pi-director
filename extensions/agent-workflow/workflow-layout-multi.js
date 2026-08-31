window.WORKFLOW_LAYOUT_MULTI = {
  diagrams: {
    overview: {
      nodes: {
        envision: {
          x: 420,
          y: -160,
          w: 220,
          h: 48,
        },
        align: {
          x: 400,
          y: -20,
          w: 260,
          h: 100,
        },
        spec: {
          x: 400,
          y: 180,
          w: 260,
          h: 100,
        },
        vibe: {
          x: 400,
          y: 380,
          w: 260,
          h: 100,
        },
      },
      edges: {
        "overview-envision-spec": [
          [650, -136],
          [740, 20],
          [670, 230],
        ],
        "overview-envision-vibe": [
          [660, -136],
          [820, 110],
          [670, 430],
        ],
        "overview-align-vibe": [
          [670, 30],
          [760, 200],
          [670, 430],
        ],
        "overview-spec-align": [
          [390, 230],
          [300, 100],
          [390, 30],
        ],
        "overview-vibe-align": [
          [390, 430],
          [230, 200],
          [390, 30],
        ],
        "overview-vibe-spec": [
          [390, 430],
          [310, 310],
          [390, 230],
        ],
        "overview-align-handoff": [
          [390, 30],
          [180, -60],
          [410, -136],
        ],
        "overview-spec-handoff": [
          [390, 230],
          [140, 50],
          [410, -136],
        ],
        "overview-vibe-handoff": [
          [390, 430],
          [100, 150],
          [410, -136],
        ],
      },
    },
    tools: {
      nodes: {
        "tool-start": {
          x: 160,
          y: -60,
          w: 160,
          h: 52,
        },
        "tool-ask": {
          x: 160,
          y: 30,
          w: 160,
          h: 52,
        },
        "tool-decide": {
          x: 160,
          y: 130,
          w: 160,
          h: 52,
        },
        "tool-next": {
          x: 160,
          y: 230,
          w: 160,
          h: 52,
        },
        "cmd-mode": {
          x: 160,
          y: 330,
          w: 160,
          h: 52,
        },
        "cmd-handoff": {
          x: 160,
          y: 430,
          w: 160,
          h: 52,
        },
        "target-envision": {
          x: 540,
          y: -60,
          w: 260,
          h: 52,
        },
        "target-align": {
          x: 540,
          y: 30,
          w: 260,
          h: 70,
        },
        "target-spec": {
          x: 540,
          y: 130,
          w: 260,
          h: 70,
        },
        "target-vibe": {
          x: 540,
          y: 230,
          w: 260,
          h: 70,
        },
      },
      edges: {},
    },
    align: {
      nodes: {
        evaluate: {
          x: 420,
          y: 0,
          w: 210,
          h: 48,
        },
        establish: {
          x: 420,
          y: 160,
          w: 210,
          h: 48,
        },
        "proc-start": {
          x: 680,
          y: -8,
          w: 140,
          h: 56,
        },
        "proc-ask": {
          x: 680,
          y: 56,
          w: 140,
          h: 56,
        },
        "proc-next": {
          x: 680,
          y: 160,
          w: 140,
          h: 56,
        },
        "proc-capture-turn": {
          x: 160,
          y: -8,
          w: 160,
          h: 56,
        },
        "proc-reconcile-scope": {
          x: 160,
          y: 56,
          w: 160,
          h: 56,
        },
        "proc-proceed-with-best": {
          x: 160,
          y: 160,
          w: 160,
          h: 56,
        },
      },
      edges: {
        "establish-handoff": [
          [360, 184],
          [360, -149],
        ],
      },
    },
    spec: {
      nodes: {
        explore: {
          x: 420,
          y: 320,
          w: 210,
          h: 48,
        },
        elaborate: {
          x: 420,
          y: 480,
          w: 210,
          h: 48,
        },
        "proc-decide": {
          x: 680,
          y: 320,
          w: 140,
          h: 56,
        },
        "proc-next": {
          x: 680,
          y: 480,
          w: 140,
          h: 56,
        },
        "proc-capture-turn": {
          x: 160,
          y: 320,
          w: 160,
          h: 56,
        },
        "proc-record-decision": {
          x: 160,
          y: 400,
          w: 160,
          h: 56,
        },
        "proc-close-out": {
          x: 160,
          y: 480,
          w: 160,
          h: 56,
        },
      },
      edges: {},
    },
    vibe: {
      nodes: {
        execute: {
          x: 420,
          y: 640,
          w: 210,
          h: 48,
        },
        examine: {
          x: 420,
          y: 800,
          w: 210,
          h: 48,
        },
        "proc-decide": {
          x: 680,
          y: 640,
          w: 140,
          h: 56,
        },
        "proc-next": {
          x: 680,
          y: 800,
          w: 140,
          h: 56,
        },
        "proc-capture-turn": {
          x: 160,
          y: 640,
          w: 160,
          h: 56,
        },
        "proc-record-decision": {
          x: 160,
          y: 720,
          w: 160,
          h: 56,
        },
        "proc-close-out": {
          x: 160,
          y: 800,
          w: 160,
          h: 56,
        },
      },
      edges: {},
    },
  },
};
