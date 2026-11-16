import type { Editor } from "@pierre/diffs/edit";

const OPENERS: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
const PYTHON_BLOCK_END = /^\s*(return|pass|break|continue|raise)\b/;

/** The file's own indent width, from the most common step between indented lines. */
export function detectIndentSize(contents: string): number | undefined {
  const steps = new Map<number, number>();
  let previous = 0;
  for (const line of contents.split("\n", 5000)) {
    if (line.trim() === "" || line.startsWith("\t")) continue;
    const indent = line.length - line.trimStart().length;
    const step = Math.abs(indent - previous);
    if (step >= 2 && step <= 8) steps.set(step, (steps.get(step) ?? 0) + 1);
    previous = indent;
  }
  let best: number | undefined;
  for (const [step, count] of steps)
    if (best === undefined || count > steps.get(best)!) best = step;
  return best;
}

/** Text and caret column for Enter: keep the line's indent, add one after a block opener. */
function resolveEnterIndent(
  before: string,
  after: string,
  indentSize: number,
  python: boolean,
): { text: string; caretLine: number; caretColumn: number } {
  const indent = /^[ \t]*/.exec(before)![0];
  const unit = indent.startsWith("\t") ? "\t" : " ".repeat(indentSize);
  const last = before.trimEnd().at(-1) ?? "";
  if (last in OPENERS || (python && last === ":")) {
    const inner = indent + unit;
    return after.trimStart().startsWith(OPENERS[last] ?? "\0")
      ? { text: `\n${inner}\n${indent}`, caretLine: 1, caretColumn: inner.length }
      : { text: `\n${inner}`, caretLine: 1, caretColumn: inner.length };
  }
  const next =
    python && PYTHON_BLOCK_END.test(before)
      ? indent.slice(0, Math.max(0, indent.length - unit.length))
      : indent;
  return { text: `\n${next}`, caretLine: 1, caretColumn: next.length };
}

/** Replaces the editor's plain newline on Enter with an indented one. */
export function installFileEditorIndent({
  root,
  editor,
  indentSize,
  python,
}: {
  root: HTMLElement;
  editor: () => Pick<
    Editor<"file">,
    "getViewState" | "getText" | "applyEdits" | "setSelections"
  > | null;
  indentSize: number;
  python: boolean;
}): () => void {
  const handleBeforeInput = (event: InputEvent) => {
    if (event.inputType !== "insertParagraph" && event.inputType !== "insertLineBreak") return;
    const current = editor();
    const selections = current?.getViewState().selections;
    if (!current || selections?.length !== 1 || event.isComposing) return;
    const { start, end } = selections[0]!;
    const lines = current.getText().split("\n", end.line + 1);
    const before = (lines[start.line] ?? "").slice(0, start.character);
    const after = (lines[end.line] ?? "").replace(/\r$/, "").slice(end.character);
    const skipped = after.length - after.trimStart().length;
    const { text, caretLine, caretColumn } = resolveEnterIndent(before, after, indentSize, python);
    event.preventDefault();
    event.stopImmediatePropagation();
    current.applyEdits([
      {
        range: { start, end: { line: end.line, character: end.character + skipped } },
        newText: text,
      },
    ]);
    const caret = { line: start.line + caretLine, character: caretColumn };
    current.setSelections([{ start: caret, end: caret, direction: "none" }]);
  };
  root.addEventListener("beforeinput", handleBeforeInput, true);
  return () => root.removeEventListener("beforeinput", handleBeforeInput, true);
}
