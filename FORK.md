# Jason's T3 Code fork

This is Jason's fork of [pingdotgg/t3code](https://github.com/pingdotgg/t3code).
It installs as its own app, "T3 Code (Jason)", next to the official one, with its own data in `~/.t3-jason`.
Work happens on the `jason` branch, not `main`.

## Install on a new Mac

1. Install the command line tools (for git): `xcode-select --install`
2. Install Vite+, which also provides the pinned Node version: `curl -fsSL https://vite.plus | bash`, then open a new terminal.
3. Clone the fork on the `jason` branch:

   ```sh
   git clone -b jason https://github.com/Jsze30/t3code.git ~/Documents/Coding/t3code
   ```

4. Build and install the app: `~/Documents/Coding/t3code/scripts/update-my-t3.command`

The script builds the desktop app, puts "T3 Code (Jason)" in /Applications with the saved [settings](#settings), and opens it.
It only works on macOS.

## Settings

`my-t3-settings/` holds Jason's settings, appearance, fonts and keybindings.
The update script copies them in on a Mac that does not have them yet, and never overwrites existing ones.
When Jason says "save my settings", run `scripts/save-my-t3-settings.command`, which copies this Mac's settings into that folder, commits and pushes.
Threads, projects, open tabs and provider logins (Claude, Codex, GitHub) stay on each Mac.

## Stop Keychain password prompts

Each Mac needs its own local signing certificate, or macOS asks for the Keychain password after every update.
In Keychain Access, open Certificate Assistant, then Create a Certificate.
Name it exactly `T3 Code Jason Local Signing` and set the certificate type to Code Signing.
The update script signs with it automatically once it exists.

## My changes

What this fork does differently from the official app, one line each.
When you add, change or drop one of Jason's changes, update this list in the same commit.

Sidebar:

- A lead's workers are grouped under it, behind a chevron with a worker count.
  Clicking the open lead again shows or hides them, with an animation.
- Settling a lead asks whether to settle its workers too.
- Standalone leads (`standalone: true` on launch) are not workers of the thread that launched them.
- Worker rows are slim and say Working or Done, and finished workers rise above running ones.
- Lead cards have a network icon.
- Cards have no branch line (branch, diff counts and provider icons).
- Pinned threads sit under Pinned and Active dividers instead of showing a pin icon.
- Next and previous thread wrap around at the ends.
- Ctrl+` opens the first thread that finished since you last opened it, so pressing it again works through them all.

Chat:

- Esc stops the running turn, unless a popup is open.
- `!command` in the composer turns into a chip, runs when the message is sent, and attaches its output for Claude and Codex threads.
- Cmd+Shift+R restarts the agent session, so the desktop menu's Force Reload has no shortcut.
- New threads start with the thread panel closed.
- Every model defaults to high effort and fast mode when it offers them.

App and server:

- Installs as "T3 Code (Jason)" with its data in `~/.t3-jason`, signed with a fixed local certificate.
- Agents and `!` commands do not inherit `ELECTRON_RUN_AS_NODE` from the desktop app.
- Tests expect this build's name, data folder and defaults.

Fork tooling: this file, the update skill, `scripts/update-my-t3.command`, `scripts/save-my-t3-settings.command` and `my-t3-settings/` (which also holds the Ctrl+1-9, Ctrl+Tab, Ctrl+` and Cmd+Shift+R keybindings).

## Update

When Jason says "update", follow the [update skill](.agents/skills/update-my-t3/SKILL.md).
It rebases `jason` onto the latest official `main`, fixes conflicts so his changes keep working, pushes, and reinstalls the app.
Run it on either Mac: both share the `jason` branch on GitHub.

Running `scripts/update-my-t3.command` by hand, or double-clicking it in Finder, only installs what is already on GitHub's `jason` branch.
It does not pull official changes.

To keep conflicts rare, put fork-only notes in new files like this one instead of editing upstream files.
