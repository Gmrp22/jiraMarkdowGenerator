---
description: Create a feature spec file and branch for a new feature based on ***ARGUMENT***.
argument-hint: feature/<name-of-branch> <Actual feature> description
allowed-tools: Bash(git checkout -b :*), Bash(git push origin :*)
---

# User Input
The user has provided the input as **$ARGUMENT** in the format:
`<branch-name> "<short description>"`
Extract from $ARGUMENT:
- $BRANCH_NAME: the first word, kebab-case, no spaces (e.g. `feature/filter-by-status`)
- $DESCRIPTION: everything after the first space


# Context

- Current git branch: !`git rev-parse --abbrev-ref HEAD`

# Step 1
Run `git pull` to pull the latest changes from the remote repository.

# Step 2
Run `git checkout -b $BRANCH_NAME` to create a new branch.

# Step 3
Run `git push origin $BRANCH_NAME` to push the new branch to the remote repository.

# Step 4
Generate feature spec file under /docs/specs/[FEATURE_SPEC_NAME] using plan mode.

# Step 5
Provide a short summary following:
Branch: <branch-name>
Description: <description>
Context: <files changed or created>