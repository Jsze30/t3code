import { isMacPlatform } from "@t3tools/shared/keybindingMatching";

import { isElectron } from "./env";

/** The desktop menu leaves Cmd/Ctrl+R to the page, so the file panel can run scripts with it. */
export function installDesktopReloadShortcut() {
  if (!isElectron) return;
  const mac = isMacPlatform(navigator.platform);
  window.addEventListener("keydown", (event) => {
    if (
      event.defaultPrevented ||
      event.key.toLowerCase() !== "r" ||
      !(mac ? event.metaKey : event.ctrlKey) ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    window.location.reload();
  });
}
