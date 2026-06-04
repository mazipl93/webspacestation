/** Marker inserted by CMS „Dodaj punkt listy” — stored in DB as plain text. */
export const ARTICLE_LIST_MARKER = "• ";

/** Lines recognized as list items (CMS marker or legacy `-item` / markdown `- item`). */
export const LIST_LINE_RE = /^(?:•\s|·\s|[-*]\s+|-)/;

export function isListItemLine(line: string): boolean {
  return LIST_LINE_RE.test(line.trim());
}

export function stripListItemMarker(line: string): string {
  return line.trim().replace(/^(?:•\s*|·\s*|[-*]\s+|-)/, "").trim();
}

export type ListItemInsertResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

/** Insert a new list line at caret (or append at end when no textarea ref). */
export function insertListItemAtCaret(
  content: string,
  caretStart: number,
  caretEnd: number
): ListItemInsertResult {
  const start = Math.min(caretStart, caretEnd);
  const end = Math.max(caretStart, caretEnd);
  const before = content.slice(0, start);
  const after = content.slice(end);

  let insertion: string;
  if (before.length === 0 && after.length === 0) {
    insertion = ARTICLE_LIST_MARKER;
  } else if (
    before.endsWith("\n") &&
    after.length > 0 &&
    !after.startsWith("\n")
  ) {
    // Caret at the start of a line — bullet above, keep the line below.
    insertion = `${ARTICLE_LIST_MARKER}\n`;
  } else if (before.endsWith("\n")) {
    insertion = ARTICLE_LIST_MARKER;
  } else {
    insertion = `\n${ARTICLE_LIST_MARKER}`;
  }
  const value = before + insertion + after;
  const pos = before.length + insertion.length;

  return { value, selectionStart: pos, selectionEnd: pos };
}
