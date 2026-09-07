# Troubleshooting

## Theme not found: github-dark

`github-dark` is bundled in this package, not in Pi itself. Settings `theme` is
`github-dark`, so the TUI falls back to `dark` when the package path is missing.

`pi list` must show `~/dev/pi-director`. A stale `~/Github/pi-director` entry
will not load themes. Fix `packages` in `~/.pi/agent/settings.json`, or run
`pi install /Users/martin-peter.lakatos/dev/pi-director`.

Dogfood with `-e ~/dev/pi-director`. `--no-themes` still loads themes from that
`-e` path; it only skips discovered packages.

## Pi does not show the bundle

1. Check `packages` in `~/.pi/agent/settings.json` contains
   `https://github.com/dhumdil-apps/pi-director`.
2. Run `pi list`.
3. Run `pi update --extensions`, then restart Pi.

## The agent edits before we agreed on a direction

Align and Spec are advisory. The runtime does not block project edits. If the
agent acts too early, say so in chat and point it at workspace `AGENTS.md`.
Destructive and external-action consent remains conversational.

## Nothing prompts before destructive commands

Expected. This package does not intercept commands by mode.
Destructive and external-action consent remains conversational. Use
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
- Interactive startup does not warn about project-memory freshness. `/init` remains the deliberate audit.
- Ordinary exploration treats entries as leads to verify against code. Code wins; correct a disproved entry immediately. Capture a costly surprise in the plan's `## Decisions`, then promote only durable facts at close-out without advancing the review marker.
- Retain a fact only when rediscovering it costs more than reading it. Every entry names hidden breakage when relevant and the path, symbol, or command that re-establishes the fact.
- `.pi/` is ignored by default; projects may customize that Git policy.
