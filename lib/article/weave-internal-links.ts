import {
  calculateRelatedScore,
  type RelatableArticle,
} from "@/lib/article/related-articles";
import { weaveCategoryAffinityBonus } from "@/lib/article/weave-category-rules";
import type { ArticleContentBlock } from "@/lib/articles/parse-content-blocks";
import type { NewsArticle } from "@/types";

export type InternalLinkCandidate = Pick<
  NewsArticle,
  "id" | "slug" | "title" | "excerpt" | "category"
>;

export type WovenBodySegment =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "figure"; src: string; caption?: string }
  | { kind: "heading"; level: 2 | 3 | 4; text: string }
  | { kind: "video"; src: string; caption?: string }
  | {
      kind: "internal-link";
      article: InternalLinkCandidate;
      templateIndex: number;
    };

/** Max in-body teasers (never more than 4 — keeps reading flow natural). */
export const MAX_INTERNAL_BODY_LINKS = 4;

/** How many in-body links for a given paragraph count (spread, not stacked). */
export function countInternalLinksForParagraphs(paragraphCount: number): number {
  if (paragraphCount <= 0) return 0;
  if (paragraphCount <= 2) return 1;
  if (paragraphCount <= 5) return 2;
  if (paragraphCount <= 9) return 3;
  return MAX_INTERNAL_BODY_LINKS;
}

export function countParagraphBlocks(blocks: ArticleContentBlock[]): number {
  return blocks.filter((b) => b.kind === "paragraph").length;
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

  // Allow full linkCount when paragraphs exist; gap rule enforced in the loop below.
  const capped = Math.min(linkCount, paragraphCount);
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
  sameDepartment: boolean;
}) => string)[] = [
  ({ categoryLabel }) =>
    `W dziale ${categoryLabel} warto też zajrzeć do materiału`,
  ({ categoryLabel, sameDepartment }) =>
    sameDepartment
      ? `Z tego samego działu (${categoryLabel}) polecamy lekturę`
      : `Z działu ${categoryLabel} polecamy lekturę`,
  () => "Jeśli ten wątek Cię wciąga, sprawdź też",
  () => "W archiwum WSS znajdziesz powiązany tekst",
  ({ categoryLabel }) => `Kontynuacja tematu ${categoryLabel} — artykuł`,
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
  const paragraphCount = countParagraphBlocks(blocks);
  const linkCount = Math.min(
    countInternalLinksForParagraphs(paragraphCount),
    candidates.length
  );
  const insertAfterParagraph = new Set(
    pickInternalLinkInsertIndices(paragraphCount, linkCount)
  );

  const segments: WovenBodySegment[] = [];
  let linkIdx = 0;
  let paragraphIndex = -1;

  for (const block of blocks) {
    if (block.kind === "list") {
      segments.push({ kind: "list", items: block.items });
      continue;
    }

    if (block.kind === "figure") {
      segments.push({
        kind: "figure",
        src: block.src,
        caption: block.caption,
      });
      continue;
    }

    if (block.kind === "video") {
      segments.push({
        kind: "video",
        src: block.src,
        caption: block.caption,
      });
      continue;
    }

    if (block.kind === "heading") {
      segments.push({
        kind: "heading",
        level: block.level,
        text: block.text,
      });
      continue;
    }

    paragraphIndex += 1;
    segments.push({ kind: "paragraph", text: block.text });

    if (
      insertAfterParagraph.has(paragraphIndex) &&
      linkIdx < candidates.length
    ) {
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

const TITLE_STOP = new Set([
  "oraz",
  "przez",
  "jest",
  "jako",
  "tego",
  "tym",
  "dla",
  "nad",
  "pod",
  "bez",
  "przy",
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
]);

function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !TITLE_STOP.has(w))
  );
}

function titleTokenOverlapScore(sourceTitle: string, candidateTitle: string): number {
  const a = titleTokens(sourceTitle);
  const b = titleTokens(candidateTitle);
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  for (const token of b) {
    if (a.has(token)) overlap += 1;
  }
  return Math.min(overlap * 0.6, 2.5);
}

/** Prefer resurfacing solid archive pieces (SEO + „stare artykuły nie umierają”). */
export function archiveResurfaceBias(
  publishedAt: string | undefined,
  nowMs = Date.now()
): number {
  if (!publishedAt) return 0;
  const t = new Date(publishedAt).getTime();
  if (!Number.isFinite(t)) return 0;
  const ageDays = Math.max(0, (nowMs - t) / 86_400_000);
  if (ageDays < 21) return 0;
  if (ageDays <= 120) return 1.25;
  if (ageDays <= 400) return 0.85;
  if (ageDays <= 730) return 0.35;
  return 0;
}

function articleTimestamp(article: RelatableArticle): number {
  const raw = article.publishedAt ?? article.createdAt;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

function isArchiveWindow(article: RelatableArticle, nowMs: number): boolean {
  const raw = article.publishedAt ?? article.createdAt;
  const t = new Date(raw).getTime();
  if (!Number.isFinite(t)) return false;
  const ageDays = (nowMs - t) / 86_400_000;
  return ageDays >= 30 && ageDays <= 540;
}

/**
 * Rule-based relevance for in-body links (no OpenAI / .env).
 * Tags + category + recency + title overlap + archive resurfacing.
 */
export function scoreWeaveInternalLinkCandidate(
  source: RelatableArticle & { title: string },
  candidate: RelatableArticle & { title: string },
  nowMs = Date.now()
): number {
  const base = calculateRelatedScore(source, candidate, nowMs);
  const titleBonus = titleTokenOverlapScore(source.title, candidate.title);
  const archive = archiveResurfaceBias(
    candidate.publishedAt ?? candidate.createdAt,
    nowMs
  );
  const categoryBonus = weaveCategoryAffinityBonus(
    source.category,
    candidate.category
  );
  return base + titleBonus + archive + categoryBonus;
}

export type PickWeaveCandidatesOptions = {
  excludeIds?: Iterable<string>;
};

function rankWeavePool<T extends InternalLinkCandidate & RelatableArticle>(
  source: T,
  pool: T[],
  nowMs: number
): { article: T; score: number }[] {
  return pool
    .map((article) => ({
      article,
      score: scoreWeaveInternalLinkCandidate(source, article, nowMs),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return articleTimestamp(b.article) - articleTimestamp(a.article);
    });
}

function maybeSwapArchivePick<T extends InternalLinkCandidate & RelatableArticle>(
  source: T,
  result: T[],
  ranked: { article: T; score: number }[],
  max: number,
  nowMs: number
): T[] {
  if (max < 2 || result.length < 2) return result;

  const hasArchive = result.some((a) => isArchiveWindow(a, nowMs));
  if (hasArchive) return result;

  const used = new Set(result.map((a) => a.id));
  const topScore = ranked[0]?.score ?? 0;
  const archiveRow = ranked.find(
    (row) =>
      !used.has(row.article.id) &&
      isArchiveWindow(row.article, nowMs) &&
      row.score >= topScore * 0.4
  );
  if (!archiveRow) return result;

  const replaced = [...result];
  replaced[replaced.length - 1] = archiveRow.article;
  return replaced;
}

/**
 * Best articles to weave into body copy — same department first, then fallback
 * tiers (Astronomia/Misje for Nauka). Never Rozrywka in science departments.
 */
export function pickWeaveInternalLinkCandidates<
  T extends InternalLinkCandidate & RelatableArticle,
>(
  source: T,
  pool: T[],
  limit: number,
  options: PickWeaveCandidatesOptions = {}
): T[] {
  const max = Math.max(0, Math.min(limit, MAX_INTERNAL_BODY_LINKS));
  if (max === 0) return [];

  const exclude = new Set(options.excludeIds ?? []);
  exclude.add(source.id);

  const eligible = pool.filter(
    (a) => !exclude.has(a.id) && a.category === source.category,
  );
  if (eligible.length === 0) return [];

  const nowMs = Date.now();
  const ranked = rankWeavePool(source, eligible, nowMs);
  const result = ranked.slice(0, max).map((row) => row.article);
  return maybeSwapArchivePick(source, result, ranked, max, nowMs);
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
