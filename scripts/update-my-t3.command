#!/bin/zsh
# Double-click to pull the latest fork, rebuild the desktop app, and reinstall it.
set -euo pipefail

app="T3 Code (Beta).app"
cd "${0:A:h}/.."

git switch jason
git pull --rebase
vp i
vp run dist:desktop:dmg

dmg=$(ls -t release/*.dmg | head -1)
mnt=$(mktemp -d)
hdiutil attach -nobrowse -quiet -mountpoint "$mnt" "$dmg"
trap 'hdiutil detach -quiet "$mnt"' EXIT

# Quit only after the build succeeds so running agents keep working until then.
osascript -e "quit app \"${app%.app}\"" || true
while pgrep -xq "${app%.app}"; do sleep 1; done

rm -rf "/Applications/$app"
ditto "$mnt/$app" "/Applications/$app"
open "/Applications/$app"
echo "Updated to $(git log -1 --format='%h %s')"
