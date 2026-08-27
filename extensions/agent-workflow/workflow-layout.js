window.WORKFLOW_LAYOUT = {
  nodes: {
    envision: {
      x: 450,
      y: -160,
      w: 200,
      h: 48,
    },
    evaluate: {
      x: 440,
      y: 10,
      w: 210,
      h: 48,
    },
    establish: {
      x: 430,
      y: 160,
      w: 210,
      h: 48,
    },
    explore: {
      x: 420,
      y: 320,
      w: 210,
      h: 48,
    },
    elaborate: {
      x: 410,
      y: 460,
      w: 210,
      h: 48,
    },
    execute: {
      x: 420,
      y: 640,
      w: 210,
      h: 48,
    },
    examine: {
      x: 410,
      y: 780,
      w: 210,
      h: 48,
    },
  },
  edges: {
    "envision-ask-route-spec": [
      [750, 20],
      [750, 280],
    ],
    "envision-ask-route-vibe": [
      [770, 10],
      [770, 540],
    ],
    "evaluate-ask-loop": [
      [700, -10],
      [580, -10],
    ],
    "evaluate-ask-route-spec": [
      [690, 110],
      [700, 280],
    ],
    "evaluate-ask-route-vibe": [
      [710, 100],
      [720, 510],
    ],
    "establish-next-vibe": [
      [670, 270],
      [670, 540],
    ],
    "establish-handoff": [
      [390, 120],
      [390, -20],
    ],
    "elaborate-next-align": [
      [370, 390],
      [380, 240],
    ],
    "elaborate-return-align": [
      [360, 390],
      [360, 100],
    ],
    "elaborate-handoff": [
      [340, 390],
      [340, -10],
    ],
    "examine-next-align": [
      [280, 630],
      [280, 240],
    ],
    "examine-return-align": [
      [250, 630],
      [250, 120],
    ],
    "examine-next-spec": [
      [310, 620],
      [310, 370],
    ],
    "examine-handoff": [
      [220, 630],
      [220, -10],
    ],
    "explore-decide-loop": [
      [570, 290],
      [650, 310],
    ],
    "execute-decide-loop": [
      [550, 610],
      [640, 610],
    ],
    "elaborate-next-vibe": [[520, 560]],
  },
};
