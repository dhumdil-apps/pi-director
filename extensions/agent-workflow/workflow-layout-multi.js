window.WORKFLOW_LAYOUT_MULTI = {
  diagrams: {
    overview: {
      nodes: {
        envision: {
          x: 445,
          y: -160,
          w: 210,
          h: 48,
        },
        align: {
          x: 420,
          y: -20,
          w: 260,
          h: 120,
        },
        spec: {
          x: 420,
          y: 220,
          w: 260,
          h: 120,
        },
        vibe: {
          x: 420,
          y: 480,
          w: 260,
          h: 120,
        },
        "proc-start": {
          x: 740,
          y: -160,
          w: 140,
          h: 56,
        },
        "proc-ask": {
          x: 740,
          y: -20,
          w: 140,
          h: 56,
        },
        "proc-decide": {
          x: 740,
          y: 220,
          w: 140,
          h: 56,
        },
        "proc-next": {
          x: 740,
          y: 480,
          w: 140,
          h: 56,
        },
      },
      edges: {
        "envision-ask-route-spec": [
          [740, -149],
          [740, 280],
        ],
        "envision-ask-route-vibe": [
          [836, -123],
          [836, 574],
        ],
        "evaluate-ask-route-vibe": [
          [772, 6],
          [772, 506],
        ],
        "establish-next-vibe": [
          [804, 74],
          [804, 540],
        ],
        "elaborate-next-align": [
          [360, 246],
          [360, 6],
        ],
        "elaborate-return-align": [
          [328, 280],
          [328, 29],
        ],
        "elaborate-handoff": [
          [264, 314],
          [264, -149],
        ],
        "examine-next-align": [
          [232, 529],
          [232, 51],
        ],
        "examine-return-align": [
          [200, 551],
          [200, 74],
        ],
        "examine-next-spec": [
          [296, 506],
          [296, 280],
        ],
        "examine-handoff": [
          [168, 574],
          [168, -123],
        ],
      },
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
