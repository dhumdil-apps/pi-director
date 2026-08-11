import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const sourcePath = new URL("extensions/agent-workflow/workflow-steps.md", root);
const htmlPath = new URL("docs/workflow-steps.html", root);
const startMarker = "<!-- workflow-reference:start -->";
const endMarker = "<!-- workflow-reference:end -->";
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

const [source, html] = await Promise.all([readFile(sourcePath, "utf8"), readFile(htmlPath, "utf8")]);
const expression = new RegExp(`(${startMarker})([\\s\\S]*?)(${endMarker})`);
const matches = html.match(new RegExp(expression.source, "g"));
if (matches?.length !== 1) {
  throw new Error(`Expected exactly one workflow reference block in ${fileURLToPath(htmlPath)}.`);
}

const updated = html.replace(expression, `$1${escapeHtml(source)}$3`);
if (updated === html) {
  console.log(`Workflow reference is synchronized: ${fileURLToPath(htmlPath)}`);
} else if (check) {
  console.error(`Workflow reference is stale: run npm run docs:workflow`);
  process.exitCode = 1;
} else {
  await writeFile(htmlPath, updated, "utf8");
  console.log(`Updated workflow reference: ${fileURLToPath(htmlPath)}`);
}
