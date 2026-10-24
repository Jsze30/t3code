# Jason's T3 Code fork

This is Jason's fork of [pingdotgg/t3code](https://github.com/pingdotgg/t3code).
It installs as its own app, "T3 Code (Jason)", next to the official one, with its own data in `~/.t3-jason`.
Work happens on the `jason` branch, not `main`.

## Install on a new Mac

1. Install the command line tools (for git): `xcode-select --install`
2. Install Vite+, which also provides the pinned Node version: `curl -fsSL https://vite.plus | bash`, then open a new terminal.
3. Clone the fork on the `jason` branch:

   ```sh
   git clone -b jason https://github.com/Jsze30/t3code.git ~/Documents/t3code
   ```

4. Build and install the app: `~/Documents/t3code/scripts/update-my-t3.command`

The script builds the desktop app, puts "T3 Code (Jason)" in /Applications, and opens it.
It only works on macOS.

## Stop Keychain password prompts

Each Mac needs its own local signing certificate, or macOS asks for the Keychain password after every update.
In Keychain Access, open Certificate Assistant, then Create a Certificate.
Name it exactly `T3 Code Jason Local Signing` and set the certificate type to Code Signing.
The update script signs with it automatically once it exists.

## Update

Run `scripts/update-my-t3.command` again, or double-click it in Finder.
It pulls the latest `jason` branch, rebuilds, quits the running app, and swaps in the new one.

When Jason says "update" to an agent running inside T3 Code:

1. Run `git fetch origin` and `git log --oneline HEAD..origin/jason`.
   If there is nothing new and the installed app already has the latest local commits, say it is up to date and stop.
2. Check that no other T3 threads are mid-task, since the update quits the app.
3. Run the script in Terminal.app, not in the agent's own shell, or it dies when the app quits:

   ```sh
   osascript -e 'tell application "Terminal" to do script "env -u ELECTRON_RUN_AS_NODE ~/Documents/t3code/scripts/update-my-t3.command"'
   ```

## Staying in sync with upstream

`.github/workflows/sync-upstream.yml` rebases `jason` onto `upstream/main` daily and pushes it, so new official changes arrive as new commits on `origin/jason`.
It needs the `SYNC_TOKEN` repository secret.
If a rebase conflicts, the workflow fails and the conflict must be resolved by hand.
To keep conflicts rare, put fork-only notes in new files like this one instead of editing upstream files.
