---
name: agy
description: Offload a spec or research task to the locally installed Antigravity CLI (agy), using the current plan artifact as context. Returns agy's response for synthesis. Manual invocation only.
disable-model-invocation: true
---

# Antigravity CLI Offload

Use this skill when the user explicitly calls `/skill:agy` to delegate a spec, research, or deep-reasoning task to the locally installed `agy` binary. `agy` runs under the user's own Antigravity subscription quota and returns its response as plain text for you to synthesise.

Pi will ask for shell permission once before running `agy`. That is expected — approve it. `agy` then runs to completion non-interactively and returns stdout.

## Two invocation patterns

### Pattern A — Inline context (default)

Use this when the task is reasoning, research, drafting, or analysis that does not require `agy` to navigate project files itself. Pi constructs the full prompt from the plan artifact and passes it as an argument. No workspace exposure required.

```
agy --print "<prompt>"
```

### Pattern B — Workspace-aware

Use this when the task requires `agy` to read project files, run searches, or inspect the codebase directly. Add `--dangerously-skip-permissions` so `agy` can use its own file and shell tools without blocking mid-run on its own confirmation prompts. Pi still gates the outer invocation once.

```
agy --dangerously-skip-permissions --print "<prompt>" --add-dir <cwd>
```

Add additional `--add-dir <path>` flags for paired repos (e.g. a sibling frontend/backend) when the task spans them.

Do **not** use `--mode plan` — it triggers `git status` calls that fail in this environment. Omitting `--mode` defaults to `accept-edits`, which works correctly.

## Step-by-step procedure

### 1. Read the plan artifact

Read the active `.pi/plan/<name>.md` for the current session. It contains the Goal, Align, Decisions, Evidence, and Proposal sections.

If no plan file exists yet (`start` has not been called), use the user's invocation message as the full prompt and skip to step 3.

### 2. Build the prompt

Compose the prompt from the artifact:

- Include the **Goal** section verbatim.
- Include **Align**, **Decisions**, and **Proposal** sections if they have content.
- Include **Evidence** only if directly relevant to the task.
- Append the specific instruction or question from the user's `/skill:agy` invocation message.
- Keep the combined prompt under ~8 000 characters to avoid CLI argument limits. If over, trim Evidence first, then Align details, but always preserve Goal and the user's instruction.

### 3. Choose the pattern and run

- If the task is pure reasoning/research with no file navigation needed → **Pattern A**.
- If the user's instruction requires `agy` to explore the project files itself → **Pattern B**.

Prompt quoting: if the prompt contains single quotes, write it to a temporary file instead of inlining it:

```
# Write prompt to temp file
# Then run:
agy --print "$(cat /tmp/agy-task-<timestamp>.md)"
# or for Pattern B:
agy --dangerously-skip-permissions --print "$(cat /tmp/agy-task-<timestamp>.md)" --add-dir <cwd>
```

Optional flags to consider:

- `--effort low|medium|high` — controls reasoning depth. Default is medium. Use `high` for architecture or deep spec work.
- `--disable-slash-commands` — prevents slash command expansion if the prompt contains `/` characters that should be treated as literal text.
- `--print-timeout <duration>` — override the default 5-minute timeout for long-running tasks (e.g. `--print-timeout 10m`).

### 4. Capture and clean up

- `agy`'s stdout is the result.
- Delete any temporary prompt file after the run.
- If `agy` exits non-zero or produces no output, report the stderr and exit code verbatim. Do not retry automatically — ask the user how to proceed.

### 5. Synthesise

Present `agy`'s response to the user. Integrate useful findings into the current plan artifact:

- New facts or constraints → **Evidence** section.
- A completed proposal or design → **Proposal** section.
- Do not silently discard the output or treat it as a directive — it is evidence you interpret within the current workflow mode.

## Constraints

- **Manual invocation only.** Never call `agy` without explicit user instruction via `/skill:agy`.
- Never include secrets, API keys, or credential values in the prompt.
- `agy` is a subordinate shell tool, not a peer orchestrator. You remain the session owner and single agent. `agy`'s output informs your next action; it does not replace your judgment or override the current workflow mode.
- Only Vibe mode may write files outside `.pi`. If `agy` produces file edits (Pattern B), review and apply them deliberately in Vibe — do not accept them automatically in Align or Spec.
