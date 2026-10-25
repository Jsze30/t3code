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

## Update

When Jason says "update", follow the [update skill](.agents/skills/update-my-t3/SKILL.md).
It rebases `jason` onto the latest official `main`, fixes conflicts so his changes keep working, pushes, and reinstalls the app.
Run it on either Mac: both share the `jason` branch on GitHub.

Running `scripts/update-my-t3.command` by hand, or double-clicking it in Finder, only installs what is already on GitHub's `jason` branch.
It does not pull official changes.

To keep conflicts rare, put fork-only notes in new files like this one instead of editing upstream files.
