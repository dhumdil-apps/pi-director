# Vendored upstream sources

This repository vendors the MIT-licensed Pi resources listed below. Every
notice they require is consolidated under [Upstream license
notices](#upstream-license-notices).

## Vendored components

- **Extension Settings** (`@juanibiapina/pi-extension-settings`) — npm `0.8.0`
- **Powerbar** (`@juanibiapina/pi-powerbar`) — npm `0.12.0`
- **Pi Usage** (Powerbar dependency, `@juanibiapina/pi-usage`) — npm `0.1.0`
- **Usage Extension** (`@tmustier/pi-usage-extension`) — npm `0.9.1`
- **Manage Todo List** (`tintinweb/pi-manage-todo-list`) — commit `b75c449aa85ce328e9a8b632f62bf642aed40359`.
  The vendored `manage_todo_list` tool is gone; what remains is the Progress
  Tracker indicator derived from it, so the notice still applies.

## Local compatibility changes

- Powerbar imports the vendored Extension Settings module by relative path, and
  ships no `context-usage` producer — that readout lives in the Progress Tracker
  indicator above the editor.
- Manage Todo List imports the current `@earendil-works/pi-*` package scope in
  place of its legacy `@mariozechner/pi-*` scope.
- Headless safeguards keep Session Dashboard from hijacking non-interactive
  processes.

## Upstream license notices

Every vendored component is MIT-licensed. The copyright notices below are
covered by the single shared permission notice that follows.

- Copyright (c) 2026 Juan Ibiapina — `@juanibiapina/pi-powerbar`,
  `@juanibiapina/pi-extension-settings`, `@juanibiapina/pi-usage`
- Copyright (c) 2026 Thomas Mustier — `@tmustier/pi-usage-extension`
- Copyright (c) 2026 tintinweb — `tintinweb/pi-manage-todo-list`

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
