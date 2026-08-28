window.WORKFLOW_LAYOUT = {
  diagrams: {
    overview: {
      nodes: {
        envision: { x: 80, y: 40, w: 260, h: 100 },
        align: { x: 80, y: 220, w: 260, h: 120 },
        spec: { x: 420, y: 220, w: 260, h: 120 },
        vibe: { x: 760, y: 220, w: 260, h: 120 },
        "proc-start": { x: 80, y: 420, w: 140, h: 56 },
        "proc-ask": { x: 250, y: 420, w: 140, h: 56 },
        "proc-decide": { x: 420, y: 420, w: 140, h: 56 },
        "proc-next": { x: 590, y: 420, w: 140, h: 56 },
      },
      edges: {},
    },
    align: {
      nodes: {
        evaluate: { x: 200, y: 80, w: 280, h: 100 },
        establish: { x: 200, y: 280, w: 280, h: 100 },
        "proc-start": { x: 560, y: 40, w: 140, h: 56 },
        "proc-ask": { x: 720, y: 40, w: 140, h: 56 },
        "proc-decide": { x: 560, y: 140, w: 140, h: 56 },
        "proc-next": { x: 720, y: 140, w: 140, h: 56 },
      },
      edges: {},
    },
    spec: {
      nodes: {
        explore: { x: 200, y: 80, w: 280, h: 110 },
        elaborate: { x: 200, y: 300, w: 280, h: 110 },
        "proc-start": { x: 560, y: 40, w: 140, h: 56 },
        "proc-ask": { x: 720, y: 40, w: 140, h: 56 },
        "proc-decide": { x: 560, y: 160, w: 140, h: 56 },
        "proc-next": { x: 720, y: 160, w: 140, h: 56 },
      },
      edges: {},
    },
    vibe: {
      nodes: {
        execute: { x: 200, y: 80, w: 280, h: 110 },
        examine: { x: 200, y: 300, w: 280, h: 110 },
        "proc-start": { x: 560, y: 40, w: 140, h: 56 },
        "proc-ask": { x: 720, y: 40, w: 140, h: 56 },
        "proc-decide": { x: 560, y: 160, w: 140, h: 56 },
        "proc-next": { x: 720, y: 160, w: 140, h: 56 },
      },
      edges: {},
    },
    // Full view: vertical spine (7 guided states) + secondary cross-mode rails
    full: {
      nodes: {
        envision: { x: 420, y: -160, w: 210, h: 48 },
        evaluate: { x: 420, y: 0, w: 210, h: 48 },
        establish: { x: 420, y: 160, w: 210, h: 48 },
        explore: { x: 420, y: 320, w: 210, h: 48 },
        elaborate: { x: 420, y: 480, w: 210, h: 48 },
        execute: { x: 420, y: 640, w: 210, h: 48 },
        examine: { x: 420, y: 800, w: 210, h: 48 },
      },
      edges: {
        "envision-ask-route-spec": [
          [760, 20],
          [760, 280],
        ],
        "envision-ask-route-vibe": [
          [780, 0],
          [780, 540],
        ],
        "evaluate-ask-route-spec": [
          [700, 100],
          [700, 280],
        ],
        "evaluate-ask-route-vibe": [
          [720, 100],
          [720, 520],
        ],
        "establish-next-spec": [
          [680, 180],
          [680, 300],
        ],
        "establish-next-vibe": [
          [680, 260],
          [680, 540],
        ],
        "establish-handoff": [
          [380, 120],
          [380, -20],
        ],
        "elaborate-next-align": [
          [380, 400],
          [380, 240],
        ],
        "elaborate-return-align": [
          [360, 400],
          [360, 100],
        ],
        "elaborate-handoff": [
          [340, 400],
          [340, -20],
        ],
        "elaborate-next-vibe": [[520, 560]],
        "examine-next-align": [
          [280, 640],
          [280, 240],
        ],
        "examine-return-align": [
          [260, 640],
          [260, 120],
        ],
        "examine-next-spec": [
          [300, 620],
          [300, 360],
        ],
        "examine-handoff": [
          [220, 640],
          [220, -20],
        ],
      },
    },
  },
};
