---
description: Create a commit for the changes made
argument-hint: The commit message
allowed-tools: Bash(git add :*), Bash(git status:*), Bash(git commit -m :*), Bash(git push :*)
---

# Context

- Current git status: !`git status`
- Stage changes !`git add .`

# User Input
The user has provided a simple message as argument in **$ARGUMENT** , if no input is provided stop execution.

# Step 1

Follow the commit message standards below and improve the **$ARGUMENT** message.
- feature: A new feature for the project
- fix: A bug fix for the project
- docs: Documentation added or updated
- style: Code style changes (no functional changes)
- refactor: Refactoring of existing code (no functional changes)
- test: Test added or updated
- chore: Changes to build process or auxiliary tools and libraries

# Step 2
Run git commit with the improved message, then git push.