#!/usr/bin/env node

/**
 * Build the pi-director content package for downstream consumers (e.g. lakatos-fe /pi-stack).
 *
 * Reads the canonical workflow sources:
 *   - docs/AGENT-WORKFLOW-DIAGRAMS.md     → dist/workflow-diagrams.json
 *   - extensions/agent-workflow/workflow-fsm.ts
 *       → dist/workflow-fsm.json
 *       → dist/workflow-fsm.mmd
 *       → dist/workflow-steps.txt (agent prompt body)
 *       → dist/workflow.md
 *       → embeds JSON into extensions/agent-workflow/workflow-fsm.html
 *
 * Requires Node with --experimental-strip-types (Node 22+).
 * Then produces a minimal package tarball under dist/.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

// ---------------------------------------------------------------------------
// 1. Parse AGENT-WORKFLOW-DIAGRAMS.md
// ---------------------------------------------------------------------------

const diagramsMarkdown = readFileSync(join(ROOT, "docs/AGENT-WORKFLOW-DIAGRAMS.md"), "utf-8");

/**
 * @typedef {{ id: string, title: string, description: string, source: string }} Diagram
 * @typedef {{ id: string, label: string, title: string, description: string, diagrams: Diagram[] }} Layer
 */

/** @returns {Layer[]} */
function parseDiagramLayers(markdown) {
  const layers = [];

  // Split into layer sections on `## L{n} — {title}`.
  // Stop before `## Source-symbol coverage` or any non-layer `##` heading.
  const layerPattern = /^## (L\d+) — (.+)$/gm;
  const layerStarts = [];
  let match;

  while ((match = layerPattern.exec(markdown)) !== null) {
    layerStarts.push({
      label: match[1],
      title: match[2].trim(),
      index: match.index,
      headerEnd: match.index + match[0].length,
    });
  }

  for (let i = 0; i < layerStarts.length; i++) {
    const start = layerStarts[i];
    // Slice to next layer heading or to the next `##` that is NOT a layer (e.g. Source-symbol coverage).
    const nextBoundary =
      i + 1 < layerStarts.length ? layerStarts[i + 1].index : markdown.indexOf("\n## ", start.headerEnd);
    const sectionEnd = nextBoundary > start.headerEnd ? nextBoundary : markdown.length;
    const section = markdown.slice(start.headerEnd, sectionEnd);

    // Extract layer description: text between the layer heading and the first ### heading.
    const firstDiagramHeading = section.search(/^### /m);
    const layerPreamble = firstDiagramHeading > 0 ? section.slice(0, firstDiagramHeading).trim() : section.trim();
    const layerDescription = layerPreamble
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .join(" ");

    // Derive a stable layer id from the title (lowercase, no special chars).
    const layerId = start.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "");

    const diagrams = parseDiagrams(section);

    layers.push({
      id: layerId,
      label: start.label,
      title: start.title,
      description: layerDescription,
      diagrams,
    });
  }

  return layers;
}

/** @returns {Diagram[]} */
function parseDiagrams(section) {
  const diagrams = [];
  // Match `### {id} — {title}`.
  const diagramPattern = /^### (\S+) — (.+)$/gm;
  const diagramStarts = [];
  let match;

  while ((match = diagramPattern.exec(section)) !== null) {
    diagramStarts.push({
      id: match[1],
      title: match[2].trim(),
      index: match.index,
      headerEnd: match.index + match[0].length,
    });
  }

  for (let i = 0; i < diagramStarts.length; i++) {
    const start = diagramStarts[i];
    const end = i + 1 < diagramStarts.length ? diagramStarts[i + 1].index : section.length;
    const body = section.slice(start.headerEnd, end);

    // Extract mermaid source from fenced block.
    const fenceMatch = body.match(/```mermaid\n([\s\S]*?)```/);
    if (!fenceMatch) {
      throw new Error(`No mermaid fence found for diagram "${start.id}"`);
    }
    const source = fenceMatch[1].trimEnd();

    // Description is everything between heading and the mermaid fence, trimmed.
    const beforeFence = body.slice(0, body.indexOf("```mermaid")).trim();
    const description = beforeFence
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .join(" ");

    diagrams.push({
      id: start.id,
      title: start.title,
      description,
      source,
    });
  }

  return diagrams;
}

// ---------------------------------------------------------------------------
// 2. Build dist/
// ---------------------------------------------------------------------------

mkdirSync(DIST, { recursive: true });

// Workflow diagrams
const layers = parseDiagramLayers(diagramsMarkdown);

const totalDiagrams = layers.reduce((n, l) => n + l.diagrams.length, 0);
console.log(`Parsed ${layers.length} layers, ${totalDiagrams} diagrams`);

writeFileSync(join(DIST, "workflow-diagrams.json"), JSON.stringify(layers, null, 2) + "\n");

// Canonical FSM (same object agents and the HTML visualizer use)
const fsmModuleUrl = pathToFileURL(join(ROOT, "extensions/agent-workflow/workflow-fsm.ts")).href;
const { WORKFLOW_FSM, formatWorkflowPrompt, serializeWorkflowFsm, toMermaid } = await import(fsmModuleUrl);
const validateModuleUrl = pathToFileURL(join(ROOT, "extensions/agent-workflow/workflow-fsm-validate.ts")).href;
const { assertWorkflowFsm } = await import(validateModuleUrl);

assertWorkflowFsm(WORKFLOW_FSM);

const promptBody = formatWorkflowPrompt(WORKFLOW_FSM);
const fsmJson = serializeWorkflowFsm();
const mermaid = toMermaid();

writeFileSync(join(DIST, "workflow-fsm.json"), fsmJson);
writeFileSync(join(DIST, "workflow-fsm.mmd"), mermaid.endsWith("\n") ? mermaid : `${mermaid}\n`);
writeFileSync(join(DIST, "workflow-steps.txt"), `${promptBody}\n`);
writeFileSync(
  join(DIST, "workflow.md"),
  [
    "# Workflow",
    "",
    "Canonical operational FSM from `extensions/agent-workflow/workflow-fsm.ts`.",
    "Agent prompt, runtime gate docs, and visualizer transitions share this definition.",
    "",
    promptBody,
    "",
    "## Mermaid",
    "",
    "```mermaid",
    mermaid.replace(/\n+$/, ""),
    "```",
    "",
  ].join("\n"),
);

// Generate external workflow-fsm.data.js for visualizer (file:// and server safe)
const agentWorkflowDir = join(ROOT, "extensions/agent-workflow");
const layoutJsPath = join(agentWorkflowDir, "workflow-layout.js");
let layoutJson = {};
if (existsSync(layoutJsPath)) {
  const layoutJsContent = readFileSync(layoutJsPath, "utf-8");
  const match = layoutJsContent.match(/window\.WORKFLOW_LAYOUT\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (match) {
    try {
      layoutJson = Function(`return (${match[1]});`)();
    } catch {}
  }
}
writeFileSync(join(DIST, "workflow-layout.json"), JSON.stringify(layoutJson, null, 2) + "\n");

const dataJsContent = `// Auto-generated by scripts/build-content.mjs — do not edit directly.
window.WORKFLOW_FSM_DATA = ${JSON.stringify(WORKFLOW_FSM, null, 2)};
`;

writeFileSync(join(agentWorkflowDir, "workflow-fsm.data.js"), dataJsContent);
writeFileSync(join(DIST, "workflow-fsm.data.js"), dataJsContent);

// Copy visualizer static assets into dist/
const visualizerFiles = [
  "workflow-fsm.html",
  "workflow-fsm.css",
  "workflow-visualizer.js",
  "workflow-layout.js",
  "theme.css",
  "tuto-ui.iife.js",
];
for (const file of visualizerFiles) {
  const src = join(agentWorkflowDir, file);
  if (existsSync(src)) {
    writeFileSync(join(DIST, file), readFileSync(src));
  }
}

console.log(
  `FSM v${WORKFLOW_FSM.version}: ${Object.keys(WORKFLOW_FSM.states).length} states, ${WORKFLOW_FSM.transitions.length} transitions`,
);

// Minimal package.json
const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
const contentPkg = {
  name: "@dhumdil-apps/pi-director-content",
  version: rootPkg.version,
  type: "module",
  description: "Derived workflow content from pi-director for downstream UI consumers.",
  exports: {
    "./package.json": "./package.json",
    "./workflow-diagrams.json": "./workflow-diagrams.json",
    "./workflow-fsm.json": "./workflow-fsm.json",
    "./workflow-fsm.mmd": "./workflow-fsm.mmd",
    "./workflow-fsm.html": "./workflow-fsm.html",
    "./workflow-fsm.css": "./workflow-fsm.css",
    "./workflow-visualizer.js": "./workflow-visualizer.js",
    "./workflow-layout.js": "./workflow-layout.js",
    "./workflow-fsm.data.js": "./workflow-fsm.data.js",
    "./theme.css": "./theme.css",
    "./tuto-ui.iife.js": "./tuto-ui.iife.js",
    "./workflow-layout.json": "./workflow-layout.json",
    "./workflow.md": "./workflow.md",
    "./workflow-steps.txt": "./workflow-steps.txt",
  },
};
writeFileSync(join(DIST, "package.json"), JSON.stringify(contentPkg, null, 2) + "\n");

// ---------------------------------------------------------------------------
// 3. Pack into a tgz
// ---------------------------------------------------------------------------

const tgzName = `pi-director-content-${rootPkg.version}.tgz`;
execSync("npm pack --pack-destination .", { cwd: DIST, stdio: "pipe" });

// npm pack produces `dhumdil-apps-pi-director-content-{version}.tgz` (scoped name).
// Rename to our simpler convention.
const scopedTgzName = `dhumdil-apps-pi-director-content-${rootPkg.version}.tgz`;
const { renameSync } = await import("node:fs");
try {
  renameSync(join(DIST, scopedTgzName), join(DIST, tgzName));
} catch {
  // If the name already matches, no rename needed.
}

console.log(`Content package ready: dist/${tgzName}`);
