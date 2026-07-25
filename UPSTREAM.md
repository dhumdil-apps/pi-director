# Vendored upstream sources

This repository vendors the MIT-licensed Pi resources listed below. Every
notice they require is consolidated under [Upstream license
notices](#upstream-license-notices).

## Vendored components

- **Extension Settings** (`@juanibiapina/pi-extension-settings`) — npm `0.8.0`
- **Powerbar** (`@juanibiapina/pi-powerbar`) — npm `0.12.0`
- **Pi Usage** (Powerbar dependency, `@juanibiapina/pi-usage`) — npm `0.1.0`
- **Usage Extension** (`@tmustier/pi-usage-extension`) — npm `0.9.1`

## Local divergence

- **Extension Settings** — the `/extension-settings` overlay is framed like the
  bundle's other full-screen overlays (spacer + dynamic border, closing rule),
  hides the fuzzy-search input for short lists, and drops the per-extension
  header row and label indent while only one extension is registered
  (2026-07-25). The settings registry, storage format, and list/multi-select
  components are unmodified.
- **Powerbar** — settings are eight per-line segment pickers instead of
  `left`/`right`, and separator, bar style, bar width, and placement are fixed
  constants rather than settings (2026-07-25).

## Upstream license notices

Every vendored component is MIT-licensed. The copyright notices below are
covered by the single shared permission notice that follows.

- Copyright (c) 2026 Juan Ibiapina — `@juanibiapina/pi-powerbar`,
  `@juanibiapina/pi-extension-settings`, `@juanibiapina/pi-usage`
- Copyright (c) 2026 Thomas Mustier — `@tmustier/pi-usage-extension`

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
