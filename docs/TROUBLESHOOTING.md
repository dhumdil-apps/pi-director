# Troubleshooting

## Pi does not show the bundle

1. Check `packages` in `~/.pi/agent/settings.json` contains
   `https://github.com/dhumdil-apps/pi-kit`.
2. Run `pi list`.
3. Run `pi update --extensions`, then restart Pi.
4. Run the headless smoke from [DEVELOPMENT.md](DEVELOPMENT.md).

## The agent edits before we agreed on a direction

The local-first flow is guidance, not enforcement (see [the agent-workflow README](../extensions/agent-workflow/README.md)).
Say so in chat — "we haven't agreed on an approach yet" — and the agent should
return to exploration. There are no hard gates — the bundle ships no permission
gate, so nothing intercepts a tool call.

## Nothing prompts before destructive commands

Expected. The permission gate was removed on 2026-07-23; agent tool calls run
ungated. If you want confirmation prompts back, use Pi's own permission
configuration or run with a sandbox — this bundle no longer provides one.

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

- Project memory is a user-owned `.pi/MEMORY.md` file holding orientation (what the project is and where behavior lives) and quirks or work-arounds (non-obvious constraints). A sectioned stub is scaffolded when absent; an existing file is never reshaped. When a project's `AGENTS.md` names a different memory file, that file wins — the loop says "project memory", not a fixed path.
- The explore step treats it as a set of leads to verify against the code rather than facts to trust — so nothing goes stale in a way that misleads.
- Both sections are updated during close-out, or during implementation when discoveries are durable. No tool writes the file; the agent edits it directly.
- `.pi/` is ignored by default; projects may customize that Git policy.
