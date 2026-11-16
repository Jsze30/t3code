import type { EnvironmentId } from "@t3tools/contracts";
import { runAtomCommand } from "@t3tools/client-runtime/state/runtime";

import { appAtomRegistry } from "~/rpc/atomRegistry";
import { projectEnvironment } from "~/state/projects";

import {
  confirmProjectFileQueryData,
  getUnsavedProjectFileQueryData,
} from "./projectFilesQueryState";

const RUNNERS: Readonly<Record<string, string>> = {
  py: "python3",
  js: "node",
  mjs: "node",
  cjs: "node",
  ts: "node",
  mts: "node",
  cts: "node",
  sh: "bash",
  bash: "bash",
  zsh: "zsh",
  rb: "ruby",
  go: "go run",
  pl: "perl",
  php: "php",
  lua: "lua",
  swift: "swift",
  r: "Rscript",
};

/** The terminal command that runs this file, or null when it is not a script. */
export function fileRunCommand(absolutePath: string): string | null {
  const name = absolutePath.slice(absolutePath.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  const runner = dot > 0 ? RUNNERS[name.slice(dot + 1).toLowerCase()] : undefined;
  return runner ? `${runner} '${absolutePath.replaceAll("'", `'\\''`)}'` : null;
}

/** Writes edits the autosave has not written yet, so a run sees the latest code. */
export async function saveFileBeforeRun(
  environmentId: EnvironmentId,
  cwd: string,
  relativePath: string,
): Promise<boolean> {
  const contents = getUnsavedProjectFileQueryData(environmentId, cwd, relativePath)?.contents;
  if (contents === undefined) return true;
  const result = await runAtomCommand(appAtomRegistry, projectEnvironment.writeFile, {
    environmentId,
    input: { cwd, relativePath, contents },
  });
  if (result._tag === "Failure") return false;
  confirmProjectFileQueryData(environmentId, cwd, relativePath, contents);
  return true;
}
