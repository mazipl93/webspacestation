import {
  isListItemLine,
  stripListItemMarker,
} from "@/lib/articles/content-list";

export type ArticleContentBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

/**
 * Split one stored paragraph (may contain single `\n` lines) into paragraph / list blocks.
 * Fixes legacy CMS input like `-gra1\n-gra2` without blank lines between items.
 */
export function parseParagraphToContentBlocks(paragraph: string): ArticleContentBlock[] {
  const lines = paragraph
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  if (lines.length === 1 && !isListItemLine(lines[0])) {
    return [{ kind: "paragraph", text: lines[0] }];
  }

  const blocks: ArticleContentBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    if (isListItemLine(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && isListItemLine(lines[i])) {
        items.push(stripListItemMarker(lines[i]));
        i += 1;
      }
      if (items.length > 0) {
        blocks.push({ kind: "list", items });
      }
    } else {
      const textLines: string[] = [];
      while (i < lines.length && !isListItemLine(lines[i])) {
        textLines.push(lines[i]);
        i += 1;
      }
      blocks.push({ kind: "paragraph", text: textLines.join("\n") });
    }
  }

  return blocks;
}

export function parseArticleBodyBlocks(paragraphs: string[]): ArticleContentBlock[] {
  return paragraphs.flatMap((p) => parseParagraphToContentBlocks(p));
}
