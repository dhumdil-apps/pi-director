# Contribution guide

## Project

This repository is a private TypeScript extension bundle. `package.json` is the
manifest for extensions, prompts, skills, and themes. Runtime source is under
`extensions/`; maintainer documentation is under `docs/`.

## Development

- Use Node LTS and npm.
- Keep TypeScript strict and ESM-compatible with the repository configuration.
- Read `docs/DEVELOPMENT.md` for setup, local maintenance, and release guidance.
- Update focused documentation when behavior, commands, settings, or paths change.
- Keep imported upstream components aligned with `UPSTREAM.md`.

## Validation

Run these checks from the repository root before sharing changes:

```bash
npm run format:check
npm run typecheck
git diff --check
```

There is currently no executable test script or checked-in `*.test.ts` suite;
use focused source or interactive review for behavior that the retained checks
do not cover.

## Safety and Git

- Inspect status and task-owned diffs before editing, and preserve unrelated user changes.
- Do not commit secrets, runtime session data, or generated artifacts.
- Keep commits focused and reviewable when commits are requested.
- Never rewrite shared history or force-push.
