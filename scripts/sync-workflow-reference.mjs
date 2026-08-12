import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const templatePath = new URL("docs/pi-director.template.html", root);
const htmlPath = new URL("docs/pi-director.html", root);
const referenceBlocks = [
  {
    id: "workflow",
    title: "Workflow contract — workflow-steps.md",
    sourcePath: new URL("extensions/agent-workflow/workflow-steps.md", root),
  },
  {
    id: "guidance",
    title: "General guidance — agent-guidance.md",
    sourcePath: new URL("extensions/agent-workflow/agent-guidance.md", root),
  },
  {
    id: "api",
    title: "Agent API and message templates — agent-api.md",
    sourcePath: new URL("extensions/agent-workflow/agent-api.md", root),
  },
  {
    id: "plan-template",
    title: "Plan scaffold — plan-template.md",
    sourcePath: new URL("extensions/agent-workflow/plan-template.md", root),
  },
  {
    id: "runtime-context",
    title: "Operational runtime context — README.md",
    sourcePath: new URL("extensions/agent-workflow/README.md", root),
  },
];
const referenceBlocksMarker = "<!-- pi-director:reference-blocks -->";
const check = process.argv.includes("--check");

if (
  process.argv.some(
    (argument) => argument !== process.argv[0] && argument !== process.argv[1] && argument !== "--check",
  )
) {
  throw new Error("Usage: node scripts/sync-workflow-reference.mjs [--check]");
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

const [template, ...sources] = await Promise.all([
  readFile(templatePath, "utf8"),
  ...referenceBlocks.map(({ sourcePath }) => readFile(sourcePath, "utf8")),
]);
const ids = referenceBlocks.map(({ id }) => id);
if (new Set(ids).size !== ids.length) {
  throw new Error("Every generated reference block needs a unique id.");
}
if (template.split(referenceBlocksMarker).length !== 2) {
  throw new Error(`Expected exactly one ${referenceBlocksMarker} marker in ${fileURLToPath(templatePath)}.`);
}
if (/<!-- pi-director:[\w-]+ -->/.test(template.replace(referenceBlocksMarker, ""))) {
  throw new Error(`Unexpected Pi Director marker in ${fileURLToPath(templatePath)}.`);
}

const renderedBlocks = referenceBlocks
  .map(
    ({ id, title }, index) =>
      `<details id="${id}">\n          <summary>${title}</summary>\n          <pre><code>${escapeHtml(sources[index])}</code></pre>\n        </details>`,
  )
  .join("\n        ");
const updated = template.replace(referenceBlocksMarker, renderedBlocks);

const existing = await readFile(htmlPath, "utf8").catch(() => undefined);
if (updated === existing) {
  console.log(`Pi Director documentation is synchronized: ${fileURLToPath(htmlPath)}`);
} else if (check) {
  console.error("Pi Director documentation is stale: run npm run docs:workflow");
  process.exitCode = 1;
} else {
  await writeFile(htmlPath, updated, "utf8");
  console.log(`Updated Pi Director documentation: ${fileURLToPath(htmlPath)}`);
}
