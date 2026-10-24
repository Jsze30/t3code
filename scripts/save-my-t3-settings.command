#!/bin/zsh
# Double-click to save this Mac's T3 Code (Jason) settings into the fork, so new Macs start with them.
set -euo pipefail

cd "${0:A:h}/.."
userdata="$HOME/.t3-jason/userdata"
for file in settings.json client-settings.json keybindings.json; do
  [[ -f "$userdata/$file" ]] && cp "$userdata/$file" my-t3-settings/
done
# Match the commit hook's formatting, or every save would look like a change.
vp fmt my-t3-settings >/dev/null 2>&1

git add my-t3-settings
if git diff --cached --quiet -- my-t3-settings; then
  echo "Settings already saved."
  exit 0
fi
git commit -m "chore: save my T3 settings" -- my-t3-settings
git pull --rebase
git push
echo "Saved settings to the fork."
