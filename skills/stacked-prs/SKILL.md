---
name: stacked-prs
description: Guide for creating, managing, and rebasing stacked PRs (dependent branches) using the GitHub CLI (gh) and git. Activate when the user chooses or requests a stacked PR approach for multi-phase work, or when managing dependent PR branches.
---

# Stacked PRs with GitHub CLI (`gh`)

Use this skill when the User has explicitly chosen a stacked PR workflow over the classic single-branch PR approach for multi-phase work. Each branch in the stack represents an independently buildable, reviewable milestone.

## Boundaries and User Choice

- **User Preference First**: Stacked PRs are opt-in. Never impose stacked branches when the User prefers the classic single-branch or direct-commit approach.
- **External Action Safety**: Local branching, committing, and local gate verification are routine. Creating remote branches (`git push`) or opening pull requests (`gh pr create`) are external actions requiring explicit User consent.
- **Target Verification**: Each layer in the stack must independently pass local repository validation before the next layer is created.

## 1. Branch Naming & Hierarchy

Use sequential, topic-scoped branch names:

- Base: `main`
- Layer 1: `<topic>/01-<short-name>` (branched from `main`)
- Layer 2: `<topic>/02-<short-name>` (branched from `<topic>/01-<short-name>`)
- Layer 3: `<topic>/03-<short-name>` (branched from `<topic>/02-<short-name>`)

## 2. Creating Stacked PRs

Target each PR against its immediate parent branch using `gh pr create`:

```bash
# For Layer 1 (base is main)
gh pr create --base main --head <topic>/01-<short-name> --title "<Part 1>: <Summary>" --body "<Body with stack table>"

# For Layer 2 (base is Layer 1)
gh pr create --base <topic>/01-<short-name> --head <topic>/02-<short-name> --title "<Part 2>: <Summary>" --body "<Body with stack table>"
```

### Stack Navigation Header

Include a stack navigation overview in the PR body:

```markdown
### PR Stack

- 1. #<pr-num-1> Layer 1 title
- 2. 👉 **#<pr-num-2> Layer 2 title** (this PR)
- 3. #<pr-num-3> Layer 3 title
```

## 3. Propagating Updates Down the Stack

When an earlier branch in the stack is modified (e.g. review comments or bugfixes):

```bash
# 1. Update the parent branch and commit changes
git checkout <topic>/01-<short-name>
# (make edits, run tests, commit)

# 2. Rebase the downstream branch onto the updated parent
git checkout <topic>/02-<short-name>
git rebase --onto <topic>/01-<short-name> <previous-parent-sha> <topic>/02-<short-name>
# Or if branch points directly to parent HEAD: git rebase <topic>/01-<short-name>

# 3. Update the next layer downstream
git checkout <topic>/03-<short-name>
git rebase <topic>/02-<short-name>
```

## 4. Retargeting After Merge

When a parent PR is merged to `main`:

```bash
# 1. Fetch latest main
git checkout main && git pull

# 2. Rebase the next PR branch onto main
git checkout <topic>/02-<short-name>
git rebase main

# 3. Retarget the PR base to main using gh
gh pr edit --base main
```
