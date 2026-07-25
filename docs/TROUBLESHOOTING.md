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

Use **ctrl+j**: the `terminal-keys` extension rewrites it into a newline, with
no configuration. **ctrl+enter** submits.

To get the literal shift+enter key back in VS Code, make it send a sequence Pi
already parses — add this to VS Code's `keybindings.json`:

```json
{
  "key": "shift+enter",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": "\u001b[13;2u" },
  "when": "terminalFocus"
}
```

If your terminal sends a line feed for plain Enter, the ctrl+j rewrite would
make submitting impossible; it is gated for that reason. Set `newline-on-ctrl-j`
to `off` (or `always` for a terminal you have verified) under
`/extension-settings`.

## Full typecheck fails

Run `npm run typecheck`; the bundle expects a zero exit. Treat every reported
error as a regression or compatibility issue to fix.

## Project memory is not being used

- Project memory is a user-owned `.pi/MEMORY.md` file holding orientation (where things live), quirks or work-arounds, and a summary of where the project stands. A sectioned stub is scaffolded when absent; an existing file is never reshaped.
- The explore step opens on it, as leads to verify against the code rather than facts to trust — so nothing goes stale in a way that misleads.
- All three sections are updated during close-out, or during implementation when discovered. No tool writes the file; the agent edits it directly.
- `.pi/` is ignored by default; projects may customize that Git policy.
