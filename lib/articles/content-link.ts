export type CaretInsertResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

/** Wrap selection (or placeholder) in `[label](url)` markdown link syntax. */
export function insertLinkAtCaret(
  content: string,
  caretStart: number,
  caretEnd: number,
  url = "https://"
): CaretInsertResult {
  const start = Math.min(caretStart, caretEnd);
  const end = Math.max(caretStart, caretEnd);
  const before = content.slice(0, start);
  const selected = content.slice(start, end);
  const after = content.slice(end);

  const label = selected.trim() || "tekst linku";
  const insertion = `[${label}](${url})`;
  const value = before + insertion + after;
  const linkStart = before.length + 1;
  const linkEnd = linkStart + label.length;

  return {
    value,
    selectionStart: selected.trim() ? before.length + insertion.length : linkStart,
    selectionEnd: selected.trim() ? before.length + insertion.length : linkEnd,
  };
}
