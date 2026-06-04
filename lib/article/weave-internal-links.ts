import type { NewsArticle } from "@/types";
import type { ArticleContentBlock } from "@/lib/articles/parse-content-blocks";

export type InternalLinkCandidate = Pick<
  NewsArticle,
  "id" | "slug" | "title" | "excerpt" | "category"
>;

export type WovenBodySegment =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | {
      kind: "internal-link";
      article: InternalLinkCandidate;
      templateIndex: number;
    };

/** How many in-body links for a given paragraph count (spread, not stacked). */
export function countInternalLinksForParagraphs(paragraphCount: number): number {
  if (paragraphCount <= 0) return 0;
  if (paragraphCount <= 2) return 1;
  if (paragraphCount <= 5) return 2;
  if (paragraphCount <= 9) return 3;
  if (paragraphCount <= 14) return 4;
  return 5;
}

const MIN_GAP_BETWEEN_LINKS = 2;

/**
 * 0-based paragraph indices after which a teaser is inserted.
 * First link never before the 2nd paragraph; gaps ≥ MIN_GAP_BETWEEN_LINKS.
 */
export function pickInternalLinkInsertIndices(
  paragraphCount: number,
  linkCount: number
): number[] {
  if (paragraphCount <= 0 || linkCount <= 0) return [];

  const capped = Math.min(linkCount, Math.floor(paragraphCount / (MIN_GAP_BETWEEN_LINKS + 1)) + 1);
  if (capped <= 0) return [];

  const firstAfter = Math.min(1, paragraphCount - 1);
  const indices: number[] = [];
  let cursor = firstAfter;

  while (indices.length < capped && cursor < paragraphCount) {
    indices.push(cursor);
    const remaining = capped - indices.length;
    const paragraphsLeft = paragraphCount - cursor - 1;
    if (remaining <= 0 || paragraphsLeft <= 0) break;
    const step = Math.max(
      MIN_GAP_BETWEEN_LINKS,
      Math.ceil(paragraphsLeft / remaining)
    );
    cursor += step;
  }

  return indices;
}

export const INTERNAL_LINK_TEASER_OPENERS: readonly ((ctx: {
  categoryLabel: string;
  title: string;
}) => string)[] = [
  ({ categoryLabel }) =>
    `W temacie ${categoryLabel} warto też zajrzeć do materiału`,
  ({ categoryLabel }) =>
    `Z tego samego działu (${categoryLabel}) polecamy lekturę`,
  () => "Jeśli ten wątek Cię wciąga, sprawdź też",
  () => "W archiwum WSS znajdziesz powiązany tekst",
  ({ categoryLabel }) =>
    `Kontynuacja tematu ${categoryLabel} — artykuł`,
];

/** Short hint after the link (excerpt trim). */
export function internalLinkHint(excerpt: string, maxLen = 72): string {
  const t = excerpt.trim().replace(/\s+/g, " ");
  if (!t) return "";
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${base}…`;
}

export function buildWovenBodySegments(
  blocks: ArticleContentBlock[],
  candidates: InternalLinkCandidate[]
): WovenBodySegment[] {
  const linkCount = Math.min(
    countInternalLinksForParagraphs(blocks.length),
    candidates.length
  );
  const insertAfter = new Set(
    pickInternalLinkInsertIndices(blocks.length, linkCount)
  );

  const segments: WovenBodySegment[] = [];
  let linkIdx = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.kind === "list") {
      segments.push({ kind: "list", items: block.items });
    } else {
      segments.push({ kind: "paragraph", text: block.text });
    }
    if (insertAfter.has(i) && linkIdx < candidates.length) {
      segments.push({
        kind: "internal-link",
        article: candidates[linkIdx],
        templateIndex: linkIdx % INTERNAL_LINK_TEASER_OPENERS.length,
      });
      linkIdx += 1;
    }
  }

  return segments;
}

/** Dedupe by id, preserve order. */
export function mergeInternalLinkCandidates(
  ...lists: InternalLinkCandidate[][]
): InternalLinkCandidate[] {
  const seen = new Set<string>();
  const out: InternalLinkCandidate[] = [];
  for (const list of lists) {
    for (const a of list) {
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      out.push(a);
    }
  }
  return out;
}
