# Troubleshooting

## Pi does not show the bundle

1. Check `packages` in `~/.pi/agent/settings.json` contains
   `https://github.com/dhumdil-apps/pi-director`.
2. Run `pi list`.
3. Run `pi update --extensions`, then restart Pi.
4. Run the headless smoke from [DEVELOPMENT.md](DEVELOPMENT.md).

## The agent edits before we agreed on a direction

Check the mode badge first. Vibe intentionally implements without workflow
approval; run `/spec` before the next request when review is wanted. In Spec,
project `edit` and `write` calls are blocked until the current plan increment is
approved. Shell and unknown custom mutations can only be warned about because
their effects are not generically classifiable; interrupt and return to review
if one crosses the boundary.

## Nothing prompts before destructive commands

Expected. Spec approval is a workflow gate, not a general command permission
system. Destructive and external-action consent remains conversational. Use
Pi's permission configuration or a sandbox when every command needs enforcement.

## Shift+enter submits instead of inserting a newline

Pi binds `tui.input.newLine` to shift+enter and ctrl+j, but the terminal has to
report those keys distinctly. Ghostty does, through the Kitty keyboard
protocol. VS Code's terminal supports neither Kitty nor Pi's `modifyOtherKeys`
fallback, so shift+enter arrives as a bare `\r` and ctrl+j as a bare `\n`, and
Pi reads a bare `\n` as Enter — both collapse onto submit.

Fix it in the editor, which is the only layer that sees the key: make
shift+enter send a sequence Pi already parses. Add this to VS Code's
`keybindings.json` (Antigravity and other VS Code forks take the same entry):

```json
{
  "key": "shift+enter",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": "\u001b[13;2u" },
  "when": "terminalFocus"
}
```

The bundle used to ship a `terminal-keys` extension that rewrote a bare ctrl+j
into a newline. It was removed on 2026-07-25: ctrl+j never reaches Pi in the
VS Code family of terminals, so none of its settings changed anything there,
and the keybinding above solves the actual key people press.

## Full typecheck fails

Run `npm run typecheck`; the bundle expects a zero exit. Treat every reported
error as a regression or compatibility issue to fix.

## Project memory is not being used

- Project memory is a user-owned `.pi/MEMORY.md` file holding selective orientation and quirks; a concrete portable path in shared root `AGENTS.md` wins. `/init` can bootstrap shared and Pi-local instruction layers plus the memory file in a new project.
- Run `/init` for an incremental audit since the hidden reviewed commit, or `/init full` for a repository-wide pass. A completed audit advances `<!-- memory-review: commit=<sha> reviewed-at=<time> -->` even when ordinary uncommitted work exists.
- At interactive startup, `project-memory` ignores staged, unstaged, and untracked files. Relevant commits after the marker get a 24-hour grace period; the same stale `HEAD` is not repeated, and another reminder requires both a new `HEAD` and a 24-hour cooldown. Missing or unverifiable markers use the same advisory `Project memory may be stale. Run /init to refresh it.` message.
- Ordinary exploration treats entries as leads to verify against code. Code wins; correct a disproved entry immediately. Capture a costly surprise in the plan's `## Quirks`, then promote only durable facts at close-out without advancing the review marker.
- Retain a fact only when rediscovering it costs more than reading it. Every entry names hidden breakage when relevant and the path, symbol, or command that re-establishes the fact.
- `.pi/` is ignored by default; projects may customize that Git policy.
