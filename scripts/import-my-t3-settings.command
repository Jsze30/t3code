#!/bin/zsh
# Double-click to load "T3 Settings.zip" from the Desktop, made by export-my-t3-settings.command.
# Pass a path to use a zip somewhere else. Replaced files are kept in a backup folder.
set -euo pipefail

app="T3 Code (Jason)"
userdata="$HOME/.t3-jason/userdata"
browser_data="$HOME/Library/Application Support/t3code-jason"
zip="${1:-$HOME/Desktop/T3 Settings.zip}"

[[ -f "$zip" ]] || { echo "No settings zip at $zip"; exit 1; }
# The running app would overwrite the imported files when it quits.
if [[ $(osascript -e "application \"$app\" is running") == true ]]; then
  echo "Quit $app first, then run this again."
  exit 1
fi

staged=$(mktemp -d)
trap 'rm -rf "$staged"' EXIT
ditto -x -k "$zip" "$staged"

backup="$HOME/.t3-jason/settings-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup" "$userdata" "$browser_data"
for item in "$staged/userdata"/*(N); do
  name=${item:t}
  [[ -e "$userdata/$name" ]] && mv "$userdata/$name" "$backup/"
  cp -R "$item" "$userdata/"
done
if [[ -d "$staged/app-support/Local Storage" ]]; then
  [[ -e "$browser_data/Local Storage" ]] && mv "$browser_data/Local Storage" "$backup/"
  cp -R "$staged/app-support/Local Storage" "$browser_data/"
fi

echo "Imported settings. Old files, if any, are in $backup."
