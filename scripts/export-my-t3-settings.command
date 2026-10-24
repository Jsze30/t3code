#!/bin/zsh
# Double-click to save T3 Code (Jason) settings and UI state to "T3 Settings.zip" on the Desktop.
# Threads, logs and secrets stay behind; secrets are this Mac's identity and must not be copied.
set -euo pipefail

app="T3 Code (Jason)"
userdata="$HOME/.t3-jason/userdata"
browser_data="$HOME/Library/Application Support/t3code-jason"
out="$HOME/Desktop/T3 Settings.zip"

# Local Storage is only flushed to disk when the app quits.
if [[ $(osascript -e "application \"$app\" is running") == true ]]; then
  echo "Quit $app first, then run this again."
  exit 1
fi

staged=$(mktemp -d)
trap 'rm -rf "$staged"' EXIT
mkdir -p "$staged/userdata" "$staged/app-support"
for item in settings.json client-settings.json keybindings.json keybindings-migrations themes; do
  [[ -e "$userdata/$item" ]] && cp -R "$userdata/$item" "$staged/userdata/"
done
[[ -d "$browser_data/Local Storage" ]] && cp -R "$browser_data/Local Storage" "$staged/app-support/"

rm -f "$out"
ditto -c -k "$staged" "$out"
echo "Saved $out. Move it to the other Mac and run scripts/import-my-t3-settings.command there."
