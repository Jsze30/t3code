#!/bin/zsh
# Double-click to pull the latest fork, rebuild the desktop app, and reinstall it.
set -euo pipefail

app="T3 Code (Jason).app"
cd "${0:A:h}/.."

git switch jason
git pull --rebase
vp i
vp run dist:desktop:dmg

dmg=$(ls -t release/*.dmg | head -1)
mnt=$(mktemp -d)
hdiutil attach -nobrowse -quiet -mountpoint "$mnt" "$dmg"
staged=$(mktemp -d)
trap 'hdiutil detach -quiet "$mnt"; rm -rf "$staged"' EXIT
ditto "$mnt/$app" "$staged/$app"

# Ad-hoc builds get a new identity each time, so macOS asks for the Keychain password after
# every update. A fixed local certificate keeps the identity stable across builds.
signing_identity="T3 Code Jason Local Signing"
if security find-identity -p codesigning | grep -q "\"$signing_identity\""; then
  codesign --force --deep --sign "$signing_identity" "$staged/$app"
fi

# Quit only after the build succeeds so running agents keep working until then.
osascript -e "quit app \"${app%.app}\"" || true
while [[ $(osascript -e "application \"${app%.app}\" is running") == true ]]; do sleep 1; done

rm -rf "/Applications/$app"
mv "$staged/$app" "/Applications/$app"
# Shells started inside T3 Code set this, which makes the app boot as plain Node and exit.
env -u ELECTRON_RUN_AS_NODE open "/Applications/$app"
echo "Updated to $(git log -1 --format='%h %s')"
