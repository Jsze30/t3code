import type { ProviderDriverKind } from "@t3tools/contracts";
import { collectComposerContextReferences } from "@t3tools/shared/composerContextReferences";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// Like the Claude Code CLI, a prompt that starts with `!` runs in the thread's folder and its
// output joins the draft as a terminal excerpt the agent reads with the next message.
const SHELL_COMMAND_DRIVERS: ReadonlySet<string> = new Set(["claudeAgent", "codex"]);

export function supportsComposerShellCommand(driverKind: ProviderDriverKind): boolean {
  return SHELL_COMMAND_DRIVERS.has(driverKind);
}

/**
 * A `!` command may follow chips already in the draft, such as an earlier command's output.
 * `keptPrompt` is that leading part, which stays in the draft when the command runs.
 */
export function parseComposerShellCommand(
  prompt: string,
): { readonly command: string; readonly keptPrompt: string } | null {
  const references = collectComposerContextReferences(prompt);
  let commandStart = 0;
  for (const reference of references) {
    if (prompt.slice(commandStart, reference.start).trim() !== "") break;
    commandStart = reference.end;
  }
  if (references.some((reference) => reference.start >= commandStart)) return null;
  const match = /^\s*!([\s\S]*)$/.exec(prompt.slice(commandStart));
  const command = match?.[1]?.trim();
  return command ? { command, keptPrompt: prompt.slice(0, commandStart) } : null;
}

export function formatComposerShellCommandOutput(input: {
  readonly command: string;
  readonly output: string;
  readonly exitCode: number | null;
  readonly timedOut: boolean;
}): string {
  const status = input.timedOut
    ? "[timed out after 2 minutes]"
    : input.exitCode !== null && input.exitCode !== 0
      ? `[exit ${input.exitCode}]`
      : null;
  return [`$ ${input.command}`, input.output.trimEnd(), status]
    .filter((line) => line !== null && line.length > 0)
    .join("\n");
}

const COMPOSER_SHELL_COMMAND_MARKER_CLASS = "composer-shell-command";

/**
 * Tags a leading `!`. The composer colors the tag only while the selected provider runs it as a
 * shell command, since these extensions are built once and cannot read the selection.
 */
export const composerShellCommandMarker = Extension.create({
  name: "composerShellCommand",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("composerShellCommand"),
        props: {
          decorations(state) {
            // The first visible character, past any leading chips.
            let bang: number | null = null;
            let found = false;
            state.doc.descendants((node, pos) => {
              if (found) return false;
              if (!node.isText) return true;
              const offset = (node.text ?? "").search(/\S/);
              if (offset === -1) return false;
              found = true;
              if (node.text?.[offset] === "!") bang = pos + offset;
              return false;
            });
            return bang === null
              ? null
              : DecorationSet.create(state.doc, [
                  Decoration.inline(bang, bang + 1, { class: COMPOSER_SHELL_COMMAND_MARKER_CLASS }),
                ]);
          },
        },
      }),
    ];
  },
});
