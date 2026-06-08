export type ScoreArticleInput = {
  title: string;
  excerpt?: string | null;
  source?: string | null;
  publishedAt?: Date | string | null;
};

const SPACE_PREMIUM_SOURCES = ["NASA", "ESA", "SpaceNews"] as const;
const TECH_PREMIUM_SOURCES = [
  "TechCrunch",
  "The Verge",
  "Ars Technica",
] as const;
const SCIENCE_SOURCES = ["Phys.org", "ScienceDaily"] as const;

const KEYWORD_BOOST =
  /\b(breakthrough|first|launch|discovery|discover|historic|record)\b/i;
const AI_BOOST =
  /\b(ai|artificial intelligence|openai|google|microsoft|chatgpt|llm|machine learning)\b/i;
const TRENDING_BOOST = /\b(hacker news|hacker\s*news|trending|viral)\b/i;

function normalizeSource(source?: string | null): string {
  return (source ?? "").trim();
}

function haystack(input: ScoreArticleInput): string {
  return `${input.title} ${input.excerpt ?? ""}`.toLowerCase();
}

function sourcePoints(source: string): number {
  if (!source) return 0;
  if (SPACE_PREMIUM_SOURCES.some((s) => source.includes(s))) return 5;
  if (TECH_PREMIUM_SOURCES.some((s) => source.includes(s))) return 4;
  if (SCIENCE_SOURCES.some((s) => source.includes(s))) return 1;
  return 0;
}

function agePenalty(publishedAt?: Date | string | null): number {
  if (!publishedAt) return 0;
  const when = new Date(publishedAt);
  if (Number.isNaN(when.getTime())) return 0;
  const hours = (Date.now() - when.getTime()) / (1000 * 60 * 60);
  return hours > 48 ? -2 : 0;
}

/**
 * Editorial importance score for homepage ranking.
 * Higher = more likely to appear in “Ważne teraz”.
 */
export function calculateScore(article: ScoreArticleInput): number {
  let score = 0;
  const source = normalizeSource(article.source);
  const text = haystack(article);

  score += sourcePoints(source);

  if (AI_BOOST.test(text) || AI_BOOST.test(source)) {
    score += 4;
  }

  if (TRENDING_BOOST.test(text) || /hacker\s*news/i.test(source)) {
    score += 3;
  }

  if (KEYWORD_BOOST.test(text)) {
    score += 2;
  }

  score += agePenalty(article.publishedAt);

  return Math.max(0, score);
}
