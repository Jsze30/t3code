import type { EditPredictProvider } from "@pierre/diffs/edit";

const WORD = /[A-Za-z_$][\w$]*/g;
const PREFIX_AT_END = /[A-Za-z_$][\w$]*$/;
const MIN_PREFIX = 2;
const MAX_SCAN_CHARS = 500_000;

/** The rest of the nearest longer name in `text` that starts with the word before `cursor`. */
function completeWord(text: string, cursor: number): string | null {
  const prefix = PREFIX_AT_END.exec(text.slice(Math.max(0, cursor - 100), cursor))?.[0];
  if (!prefix || prefix.length < MIN_PREFIX || /[\w$]/.test(text[cursor] ?? "")) return null;
  const typedStart = cursor - prefix.length;
  let best: { word: string; distance: number } | null = null;
  for (const match of text.matchAll(WORD)) {
    const word = match[0];
    if (word.length <= prefix.length || !word.startsWith(prefix) || match.index === typedStart) {
      continue;
    }
    const distance = Math.abs(match.index - cursor);
    if (best === null || distance < best.distance) best = { word, distance };
  }
  return best ? best.word.slice(prefix.length) : null;
}

/** Suggests names already in the file as grey text that Tab accepts. */
export function createWordCompletion() {
  let source: { getText: () => string } | null = null;
  const getText = () => source?.getText() ?? null;
  const provider: EditPredictProvider = {
    predict: async (request) => {
      const before = request.excerptText.slice(0, request.cursorOffsetInExcerpt);
      const line = request.excerptStartLine + before.split("\n").length - 1;
      const character = before.length - before.lastIndexOf("\n") - 1;
      const full = getText();
      // The whole file finds more names; the excerpt keeps huge files cheap.
      const useFull = full !== null && full.length <= MAX_SCAN_CHARS;
      const text = useFull ? full : request.excerptText;
      const cursor = useFull ? offsetOf(full, line, character) : request.cursorOffsetInExcerpt;
      const rest = cursor === null ? null : completeWord(text, cursor);
      if (!rest) return { edits: [], newCursor: { line, character } };
      const at = { line, character };
      return {
        edits: [{ range: { start: at, end: at }, newText: rest }],
        newCursor: { line, character: character + rest.length },
      };
    },
  };
  return {
    provider,
    /** The editor whose whole text is searched for names, or null when it detaches. */
    attach: (editor: { getText: () => string } | null) => {
      source = editor;
    },
  };
}

function offsetOf(text: string, line: number, character: number): number | null {
  let offset = 0;
  for (let current = 0; current < line; current++) {
    const next = text.indexOf("\n", offset);
    if (next === -1) return null;
    offset = next + 1;
  }
  return offset + character;
}
