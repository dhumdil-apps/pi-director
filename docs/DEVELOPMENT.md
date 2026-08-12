# Development and maintenance

Guide for maintainers developing, verifying, and updating `pi-director`.

## Maintainer Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/dhumdil-apps/pi-director.git
cd pi-director
npm install
```

## Working Model

Consumers install `pi-director` via `pi install` and run the managed copy in `~/.pi/agent/git/`.
Maintainers work from an editable clone of this repository.

Run the working copy — extensions, prompts, and themes, no push required — with discovery
off so the managed copy cannot load alongside it:

```bash
pi -ne -np --no-themes -e ~/GitHub/dev/pi-stack/pi-director
```

`-e` accepts the package directory and reads its `package.json` manifest; `.`
works when the shell is already in the repository root. Use an absolute path to
dogfood a change from inside another project. `-ne` disables extension discovery, while
`-np` and `--no-themes` disable prompt template and theme discovery from installed packages
to avoid collision warnings.

Do **not** `pi install <local path>` while the published package is installed:
both copies register `save_plan`, so the managed extensions fail to load with a
tool-conflict error on every start. `-ne -np --no-themes -e` is
the conflict-free way to run unpublished code.

## Verification

Run the retained automated checks before committing:

```bash
npm run verify
```

`verify` runs formatting, TypeScript, generated-document freshness, and whitespace checks.
Use `npm run format` to apply the repository style. `npm run typecheck` checks every vendored TypeScript extension and must exit zero.

When any Agent Workflow Markdown asset changes, regenerate consolidated documentation
with `npm run docs:workflow`; the retained `npm run verify` command rejects stale
`docs/pi-director.html`.

Interactive review still belongs to visual or lifecycle changes: Status Bar
rendering, the above-editor indicator, the mode picker, and session dashboard.

## After publishing

Push, then refresh the managed copy consumers actually run:

```bash
pi update --extension https://github.com/dhumdil-apps/pi-director && pi list
```

## Change checklist

1. Identify the owning repository, run `git status --short`, inspect relevant diffs, and classify matching continuation versus separate completed or unfinished work before planning changes.
2. Read the relevant focused guide and upstream README/source.
3. Keep extension imports compatible with the active `@earendil-works/pi-*` packages.
4. Update documentation whenever behavior, commands, settings, or paths change.
5. Run the retained automated checks and perform focused interactive review when relevant.
6. Propose clear, concise commit messages. Do not commit secrets or runtime session data.
7. Update `UPSTREAM.md` when importing or updating vendored components.

## Updating vendored components

Treat an upstream update as a merge, not a blind overwrite:

1. Record current local changes for that component.
2. Inspect the upstream changelog/source and license.
3. Import into a temporary location or compare before replacing files.
4. Reapply local compatibility and workflow changes deliberately.
5. Run the retained automated checks and review the component interactively when relevant.
6. Update its snapshot in `UPSTREAM.md`.

High-risk local behavior to preserve includes explicit plan approval (save before presenting), plan-backed project-memory promotion at close-out, and `/init` remaining the only writer of review provenance.
