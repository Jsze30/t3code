import type { ProviderInstanceEnvironment } from "@t3tools/contracts";
import * as HostProcess from "@t3tools/shared/HostProcess";
import * as Effect from "effect/Effect";

import { expandHomePath } from "./pathExpansion.ts";

export const mergeProviderInstanceEnvironment = Effect.fn(function* (
  environment: ProviderInstanceEnvironment | undefined,
  baseEnv: NodeJS.ProcessEnv = process.env,
) {
  // The desktop app runs the server as Node through this flag. Agents and their shells
  // must not inherit it, or every Electron app they start boots as plain Node. Undefined
  // rather than deleted, so spawns that merge this over process.env still drop it.
  const next: NodeJS.ProcessEnv = { ...baseEnv, ELECTRON_RUN_AS_NODE: undefined };
  if (!environment || environment.length === 0) {
    return next;
  }

  const home = yield* HostProcess.HomeDirectory;
  for (const variable of environment) {
    // An unresolved secret reference carries no value; the registry resolves it for the provider.
    if (typeof variable.value !== "string") continue;
    next[variable.name] =
      variable.name === "CODEX_HOME" || variable.name === "CLAUDE_CONFIG_DIR"
        ? expandHomePath(variable.value, home)
        : variable.value;
  }
  return next;
});
