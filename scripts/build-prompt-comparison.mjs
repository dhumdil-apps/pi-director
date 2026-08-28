import { readFileSync, writeFileSync } from 'node:fs';
import { WORKFLOW_FSM, formatWorkflowPrompt, formatRuntimeWorkflowPrompt } from '../extensions/agent-workflow/workflow-fsm.ts';

const before = '<pi_workflow>\n' + formatWorkflowPrompt(WORKFLOW_FSM) + '\n</pi_workflow>';
const now = '<pi_workflow>\n' + formatRuntimeWorkflowPrompt(WORKFLOW_FSM) + '\n</pi_workflow>';

const beforeLines = before.split('\n');
const nowLines = now.split('\n');

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateDiffHtml(bLines, nLines) {
  const rows = [];
  const setNow = new Set(nLines.map(l => l.trim()));
  const setBefore = new Set(bLines.map(l => l.trim()));

  for (let i = 0; i < bLines.length; i++) {
    const bl = bLines[i];
    if (setNow.has(bl.trim())) {
      rows.push(`<div class="diff-row normal"><span class="diff-marker"> </span><span class="diff-content">${escapeHtml(bl)}</span></div>`);
    } else {
      rows.push(`<div class="diff-row del"><span class="diff-marker">-</span><span class="diff-content">${escapeHtml(bl)}</span></div>`);
    }
  }

  for (let j = 0; j < nLines.length; j++) {
    const nl = nLines[j];
    if (!setBefore.has(nl.trim())) {
      rows.push(`<div class="diff-row add"><span class="diff-marker">+</span><span class="diff-content">${escapeHtml(nl)}</span></div>`);
    }
  }

  return rows.join('');
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>pi_workflow Prompt: Before vs Now</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d1117;
      --bg-surface: #161b22;
      --bg-surface-raised: #21262d;
      --bg-surface-border: #30363d;
      --text: #f0f6fc;
      --text-muted: #8b949e;
      --text-dim: #6e7681;
      --primary: #58a6ff;
      --primary-glow: rgba(88, 166, 255, 0.15);
      --accent: #3fb950;
      --accent-glow: rgba(63, 185, 80, 0.15);
      --danger: #f85149;
      --danger-glow: rgba(248, 81, 73, 0.15);
      --warning: #d29922;
      --purple: #bc8cff;
      --code-bg: #090d13;
      --border-color: #30363d;
      --diff-add-bg: rgba(46, 160, 67, 0.15);
      --diff-add-text: #56d364;
      --diff-del-bg: rgba(248, 81, 73, 0.15);
      --diff-del-text: #f85149;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
      min-height: 100vh;
    }

    header {
      max-width: 1600px;
      margin: 0 auto 28px auto;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .badge-row {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 12px;
    }

    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 10px;
      border-radius: 9999px;
      background: var(--bg-surface-raised);
      border: 1px solid var(--border-color);
      color: var(--primary);
    }

    .badge.success {
      background: var(--accent-glow);
      color: var(--accent);
      border-color: rgba(63, 185, 80, 0.3);
    }

    h1 {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .subtitle {
      font-size: 15px;
      color: var(--text-muted);
      margin-top: 6px;
      max-width: 900px;
    }

    /* Stats Banner */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      max-width: 1600px;
      margin: 0 auto 28px auto;
    }

    .metric-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
      overflow: hidden;
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--purple));
    }

    .metric-card.success::before {
      background: linear-gradient(90deg, var(--accent), #2ea043);
    }

    .metric-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .metric-value {
      font-size: 28px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: #fff;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .metric-pill {
      font-size: 12px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--accent-glow);
      color: var(--accent);
      border: 1px solid rgba(63, 185, 80, 0.3);
    }

    .metric-desc {
      font-size: 13px;
      color: var(--text-dim);
    }

    /* Architectural changes breakdown */
    .section-cards {
      max-width: 1600px;
      margin: 0 auto 32px auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 16px;
    }

    .change-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 16px;
    }

    .change-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .change-tag {
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .tag-omitted {
      background: var(--danger-glow);
      color: var(--danger);
      border: 1px solid rgba(248, 81, 73, 0.3);
    }

    .tag-condensed {
      background: rgba(210, 153, 34, 0.15);
      color: var(--warning);
      border: 1px solid rgba(210, 153, 34, 0.3);
    }

    .tag-preserved {
      background: var(--accent-glow);
      color: var(--accent);
      border: 1px solid rgba(63, 185, 80, 0.3);
    }

    .change-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
    }

    .change-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.45;
    }

    /* Main comparison container */
    .viewer-container {
      max-width: 1600px;
      margin: 0 auto;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      padding: 12px 18px;
      background: var(--bg-surface-raised);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .nav-tabs {
      display: flex;
      gap: 6px;
      background: var(--bg);
      padding: 4px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .tab-btn:hover {
      color: var(--text);
    }

    .tab-btn.active {
      background: var(--bg-surface-raised);
      color: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }

    .quick-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .action-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .action-btn:hover {
      background: var(--border-color);
    }

    /* Views */
    .view-pane {
      display: none;
    }

    .view-pane.active {
      display: block;
    }

    /* Side-by-side view */
    .split-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .split-col {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .split-col:first-child {
      border-right: 1px solid var(--border-color);
    }

    .col-header {
      padding: 10px 16px;
      background: var(--bg);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
    }

    .col-header .pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: normal;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--bg-surface-raised);
      color: var(--text-muted);
    }

    .code-scroll {
      max-height: 800px;
      overflow: auto;
      background: var(--code-bg);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      line-height: 1.5;
    }

    .code-line {
      display: flex;
      padding: 1px 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .code-line:hover {
      background: rgba(255,255,255,0.03);
    }

    .line-num {
      width: 40px;
      color: var(--text-dim);
      user-select: none;
      text-align: right;
      margin-right: 14px;
      flex-shrink: 0;
    }

    .line-content {
      flex: 1;
      color: #e6edf3;
    }

    .heading-line {
      color: #79c0ff;
      font-weight: bold;
    }

    .section-tag {
      color: #ff7b72;
      font-weight: bold;
    }

    /* Diff View */
    .diff-container {
      max-height: 850px;
      overflow: auto;
      background: var(--code-bg);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      line-height: 1.5;
    }

    .diff-row {
      display: flex;
      padding: 1px 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .diff-row.del {
      background: var(--diff-del-bg);
      color: var(--diff-del-text);
    }

    .diff-row.add {
      background: var(--diff-add-bg);
      color: var(--diff-add-text);
    }

    .diff-row.normal {
      color: var(--text);
    }

    .diff-marker {
      width: 20px;
      text-align: center;
      user-select: none;
      margin-right: 8px;
      flex-shrink: 0;
      font-weight: bold;
    }

    .diff-content {
      flex: 1;
    }

    /* Callout banner */
    .callout-box {
      margin: 24px auto 0 auto;
      max-width: 1600px;
      background: rgba(88, 166, 255, 0.08);
      border: 1px solid rgba(88, 166, 255, 0.25);
      border-radius: 10px;
      padding: 16px 20px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .callout-icon {
      font-size: 20px;
      line-height: 1;
    }

    .callout-text h4 {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 4px;
    }

    .callout-text p {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.45;
    }
  </style>
</head>
<body>

  <header>
    <div class="badge-row">
      <span class="badge">pi-director</span>
      <span class="badge">workflow-fsm.ts</span>
      <span class="badge success">-65.1% Turn Overhead</span>
    </div>
    <h1>workflowPrompt() Architecture & Visual Comparison</h1>
    <p class="subtitle">
      Visual comparison between the full system prompt booklet (<code>formatWorkflowPrompt()</code>) and the new streamlined turn-by-turn operational contract (<code>formatRuntimeWorkflowPrompt()</code>).
    </p>
  </header>

  <!-- Metrics Banner -->
  <section class="metrics-grid">
    <div class="metric-card success">
      <div class="metric-title">System Prompt Payload</div>
      <div class="metric-value">
        11.8 KB
        <span class="metric-pill">-65.1%</span>
      </div>
      <div class="metric-desc">Down from 34.0 KB per turn</div>
    </div>

    <div class="metric-card success">
      <div class="metric-title">Estimated Tokens</div>
      <div class="metric-value">
        ~2,950
        <span class="metric-pill">-5,550 tok</span>
      </div>
      <div class="metric-desc">Down from ~8,500 tokens / request</div>
    </div>

    <div class="metric-card">
      <div class="metric-title">Line Count</div>
      <div class="metric-value">
        193 lines
        <span class="metric-pill">-208 lines</span>
      </div>
      <div class="metric-desc">Down from 401 lines</div>
    </div>

    <div class="metric-card">
      <div class="metric-title">Design Strategy</div>
      <div class="metric-value" style="font-size: 18px;">Split Contract</div>
      <div class="metric-desc">Runtime prompt vs Full documentation booklet</div>
    </div>
  </section>

  <!-- Key Architectural Reductions -->
  <section class="section-cards">
    <div class="change-card">
      <div class="change-card-header">
        <span class="change-title">## States Section</span>
        <span class="change-tag tag-omitted">Omitted in Runtime</span>
      </div>
      <p class="change-desc">
        The massive <code>## States</code> section (envision, evaluate, establish, explore, elaborate, execute, examine with full substates & procedures) was removed from turn injection. <strong>Mode bodies and canonical transitions already provide unambiguous routing.</strong>
      </p>
    </div>

    <div class="change-card">
      <div class="change-card-header">
        <span class="change-title">## Shared Procedures</span>
        <span class="change-tag tag-condensed">1-Line Action Lead</span>
      </div>
      <p class="change-desc">
        Instead of printing 4–6 detailed bullet steps for every procedure (RECORD_DECISION, PROPOSE_SPEC, PLAN_WRITE_BOUNDARY, etc.), each procedure now retains its primary 1st line action lead.
      </p>
    </div>

    <div class="change-card">
      <div class="change-card-header">
        <span class="change-title">## Transitions Table</span>
        <span class="change-tag tag-condensed">Compact Edges</span>
      </div>
      <p class="change-desc">
        Stripped the long natural language explanatory descriptions on every edge. Retained exact node connections, arrow directions, event identifiers, and <code>[agent/procedure]</code> vs <code>[user-mediated]</code> tags.
      </p>
    </div>

    <div class="change-card">
      <div class="change-card-header">
        <span class="change-title">## Tools Specification</span>
        <span class="change-tag tag-condensed">Gate-Focused</span>
      </div>
      <p class="change-desc">
        Preserved all <code>Gate:</code> conditions for <code>start</code>, <code>ask</code>, <code>decide</code>, and <code>next</code> so the agent knows precisely when each tool is valid, but omitted internal execution <code>Mechanics:</code>.
      </p>
    </div>

    <div class="change-card">
      <div class="change-card-header">
        <span class="change-title">## Exceptions & Hatches</span>
        <span class="change-tag tag-condensed">Summary Only</span>
      </div>
      <p class="change-desc">
        Retained command signatures (<code>/mode</code>, <code>/handoff</code>, <code>/clear</code>, <code>/fork</code>) with their crisp 1-line summary; omitted redundant explanatory rules.
      </p>
    </div>

    <div class="change-card">
      <div class="change-card-header">
        <span class="change-title">## Core Rules & Invariants</span>
        <span class="change-tag tag-preserved">100% Preserved</span>
      </div>
      <p class="change-desc">
        Session state variables, Ownership boundaries, Invariants, Always rules, Turn contracts, Session entry, and Mode bodies remain completely intact without any fidelity loss.
      </p>
    </div>
  </section>

  <!-- Interactive Viewer -->
  <main class="viewer-container">
    <div class="toolbar">
      <div class="nav-tabs">
        <button class="tab-btn active" onclick="switchTab(event, 'split')">Side-by-Side View</button>
        <button class="tab-btn" onclick="switchTab(event, 'diff')">Unified Diff</button>
        <button class="tab-btn" onclick="switchTab(event, 'now')">Now (Runtime Only)</button>
        <button class="tab-btn" onclick="switchTab(event, 'before')">Before (Full Booklet)</button>
      </div>

      <div class="quick-actions">
        <button class="action-btn" onclick="copyText('now')">📋 Copy New Prompt</button>
        <button class="action-btn" onclick="copyText('before')">📋 Copy Old Prompt</button>
      </div>
    </div>

    <!-- Side by side view -->
    <div id="tab-split" class="view-pane active">
      <div class="split-grid">
        <div class="split-col">
          <div class="col-header">
            <span>BEFORE: formatWorkflowPrompt() (Full Booklet)</span>
            <span class="pill">401 lines / 34.0 KB</span>
          </div>
          <div class="code-scroll" id="scroll-before">
            ${beforeLines.map((l, i) => `
              <div class="code-line">
                <span class="line-num">${i+1}</span>
                <span class="line-content ${l.startsWith('#') ? 'heading-line' : (l.startsWith('<') ? 'section-tag' : '')}">${escapeHtml(l)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="split-col">
          <div class="col-header">
            <span>NOW: formatRuntimeWorkflowPrompt() (Injected into workflowPrompt)</span>
            <span class="pill" style="color: var(--accent);">193 lines / 11.8 KB</span>
          </div>
          <div class="code-scroll" id="scroll-now">
            ${nowLines.map((l, i) => `
              <div class="code-line">
                <span class="line-num">${i+1}</span>
                <span class="line-content ${l.startsWith('#') ? 'heading-line' : (l.startsWith('<') ? 'section-tag' : '')}">${escapeHtml(l)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Unified Diff view -->
    <div id="tab-diff" class="view-pane">
      <div class="diff-container">
        ${generateDiffHtml(beforeLines, nowLines)}
      </div>
    </div>

    <!-- Full Now view -->
    <div id="tab-now" class="view-pane">
      <div class="col-header">
        <span>formatRuntimeWorkflowPrompt() Output</span>
        <span class="pill">193 lines / 11,861 chars</span>
      </div>
      <div class="code-scroll">
        ${nowLines.map((l, i) => `
          <div class="code-line">
            <span class="line-num">${i+1}</span>
            <span class="line-content ${l.startsWith('#') ? 'heading-line' : (l.startsWith('<') ? 'section-tag' : '')}">${escapeHtml(l)}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Full Before view -->
    <div id="tab-before" class="view-pane">
      <div class="col-header">
        <span>formatWorkflowPrompt() Output</span>
        <span class="pill">401 lines / 34,017 chars</span>
      </div>
      <div class="code-scroll">
        ${beforeLines.map((l, i) => `
          <div class="code-line">
            <span class="line-num">${i+1}</span>
            <span class="line-content ${l.startsWith('#') ? 'heading-line' : (l.startsWith('<') ? 'section-tag' : '')}">${escapeHtml(l)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </main>

  <div class="callout-box">
    <div class="callout-icon">💡</div>
    <div class="callout-text">
      <h4>Why this split matters</h4>
      <p>
        <code>formatWorkflowPrompt()</code> remains available for offline documentation and the <code>npm run build:content</code> pipeline (which outputs <code>dist/workflow.md</code> and <code>dist/workflow-steps.txt</code>).
        Meanwhile, <code>workflowPrompt()</code> in <code>extensions/agent-workflow/index.ts</code> now injects <code>formatRuntimeWorkflowPrompt()</code> into every interactive turn. This eliminates ~5.5k tokens of boilerplate while preserving the exact operational rules, tool gates, and edge constraints needed for execution.
      </p>
    </div>
  </div>

  <script id="raw-before" type="text/plain">${before}</script>
  <script id="raw-now" type="text/plain">${now}</script>

  <script>
    function switchTab(evt, tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.view-pane').forEach(pane => pane.classList.remove('active'));

      evt.currentTarget.classList.add('active');
      document.getElementById('tab-' + tabId).classList.add('active');
    }

    function copyText(which) {
      const elId = which === 'now' ? 'raw-now' : 'raw-before';
      const text = document.getElementById(elId).textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied ' + (which === 'now' ? 'New Runtime Prompt' : 'Old Prompt') + ' to clipboard!');
      });
    }

    // Synchronize scrolling between the two columns in split view
    const scrollBefore = document.getElementById('scroll-before');
    const scrollNow = document.getElementById('scroll-now');

    let isSyncingBefore = false;
    let isSyncingNow = false;

    if (scrollBefore && scrollNow) {
      scrollBefore.addEventListener('scroll', () => {
        if (!isSyncingBefore) {
          isSyncingNow = true;
          const pct = scrollBefore.scrollTop / (scrollBefore.scrollHeight - scrollBefore.clientHeight);
          scrollNow.scrollTop = pct * (scrollNow.scrollHeight - scrollNow.clientHeight);
        }
        isSyncingBefore = false;
      });

      scrollNow.addEventListener('scroll', () => {
        if (!isSyncingNow) {
          isSyncingBefore = true;
          const pct = scrollNow.scrollTop / (scrollNow.scrollHeight - scrollNow.clientHeight);
          scrollBefore.scrollTop = pct * (scrollBefore.scrollHeight - scrollBefore.clientHeight);
        }
        isSyncingNow = false;
      });
    }
  </script>
</body>
</html>
`;

writeFileSync('/Users/martin-peter.lakatos/Github/pi-director/workflow-prompt-comparison.html', html);
console.log('Generated /Users/martin-peter.lakatos/Github/pi-director/workflow-prompt-comparison.html');
