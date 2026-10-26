---
name: update-my-t3
description: Update Jason's T3 Code fork and installed app. Rebases the jason branch onto the official pingdotgg/t3code main, fixes conflicts so his changes keep working, checks, pushes, and reinstalls "T3 Code (Jason)". Use when Jason says "update".
---

# Update my T3

Work in this Mac's checkout (`~/Documents/Coding/t3code` or `~/Documents/t3code`) on the `jason` branch.
Jason uses this on two Macs, so the branch on GitHub may be ahead of this checkout.

## Get the latest code

1. If the working tree has uncommitted changes, stop and ask Jason what to do with them.
2. `git switch jason` and `git pull --rebase` to pick up what the other Mac pushed.
3. Add the official repo if it is missing, then fetch it:

   ```sh
   git remote get-url upstream || git remote add upstream https://github.com/pingdotgg/t3code.git
   git fetch upstream main
   ```

4. If `git merge-base --is-ancestor upstream/main HEAD` succeeds and `HEAD` matches `~/.t3-jason/installed-commit`, say it is up to date and stop.
   If only the first is true, skip to [Install](#install).

## Rebase

Save the starting point with `before=$(git rev-parse HEAD)`, then `git rebase upstream/main`.

When a commit conflicts, Jason's change must keep working on top of the new official code.
[My changes](../../../FORK.md#my-changes) lists what each of his changes does.

- Read his commit (`git show REBASE_HEAD`) to understand what it does for him.
- Read what upstream changed in the same file (`git log -p ORIG_HEAD..upstream/main -- <file>`) to understand why.
- Take upstream's version, then re-apply his behavior to it.
  Follow upstream's new patterns, names, and comments where they changed.
- Never drop one of his changes to make a conflict go away.
  Only `git rebase --skip` a commit when upstream already does the same thing.
- If his change no longer makes sense on the new code, `git rebase --abort` and ask him.

## Check

Upstream changes can break his features without a text conflict, so always check:

1. `vp i`
2. Run `vp run typecheck` in each package his commits touch (see `git diff --name-only upstream/main HEAD`).
3. Run `vp test run` on the tests beside every file that had a conflict.

Fix failures the rebase caused, amending the commit they belong to.
If you cannot fix one, `git reset --hard "$before"`, push nothing, and tell Jason what broke.

## Push

1. `git push --force-with-lease origin jason`.
   If the push is rejected, the other Mac pushed first: start over from [Get the latest code](#get-the-latest-code).
2. Upstream's workflows arrive with every rebase, and they need secrets this fork lacks.
   This fork has no workflows of its own, so disable every active one:

   ```sh
   gh workflow list -R Jsze30/t3code --all --json id,state -q '.[] | select(.state == "active") | .id' \
     | xargs -r -n1 gh workflow disable -R Jsze30/t3code
   ```

## Install

The install quits the app, which ends this thread's turn too.

1. List threads in every project (`t3_project_list`, then `t3_thread_list` with the active statuses).
   If any thread other than this one is preparing, queued, starting, running, or waiting, do not install.
   Tell Jason the code is pushed and which threads are busy.
2. Tell Jason the app is about to restart, with a short summary of what changed and any conflicts you fixed.
3. Start the install in Terminal so it survives the app quitting:

   ```sh
   open -a Terminal "$(git rev-parse --show-toplevel)/scripts/update-my-t3.command"
   ```

   Use `open`, not `osascript ... do script`, which needs a macOS automation permission and times out without it.
