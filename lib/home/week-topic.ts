import type { NewsArticle } from "@/types";
import { rankLatest } from "@/lib/home/rank-articles";

export type WeekTopicConfig = {
  label: string;
  /** Opcjonalny podtytuł sekcji (pusty = bez opisu pod nagłówkiem). */
  subtitle?: string;
  limit: number;
  accent: string;
};

export const WEEK_TOPIC_SLOT_MAX = 4;

export function getWeekTopicConfig(): WeekTopicConfig {
  return {
    label:
      process.env.NEXT_PUBLIC_WEEK_TOPIC_LABEL?.trim() || "W centrum uwagi",
    limit: Math.min(
      8,
      Math.max(2, Number(process.env.WEEK_TOPIC_LIMIT) || 6)
    ),
    accent: "#8b5cf6",
  };
}

export type WeekTopicPick = {
  articles: NewsArticle[];
};

/**
 * CMS slots (weekTopicPosition 1–4, ASC) lub legacy `weekTopic` bez slotu.
 * Nie wyklucza slugów z hero — ta sama pozycja może być w obu sekcjach.
 */
export function buildHomepageWeekTopicSlides(
  cmsOrdered: NewsArticle[],
  legacyFlagged: NewsArticle[],
  max = WEEK_TOPIC_SLOT_MAX
): WeekTopicPick {
  if (cmsOrdered.length > 0) {
    const sorted = [...cmsOrdered].sort(
      (a, b) => (a.weekTopicPosition ?? 0) - (b.weekTopicPosition ?? 0)
    );
    return { articles: sorted.slice(0, max) };
  }

  const legacy = rankLatest(
    legacyFlagged.filter((a) => a.weekTopic && (a.weekTopicPosition ?? 0) === 0),
    max
  );
  return { articles: legacy };
}

/** @deprecated Use buildHomepageWeekTopicSlides — kept for tests. */
export function pickWeekTopicArticles(
  allPublished: NewsArticle[],
  _excludeSlugs: Set<string>,
  config = getWeekTopicConfig()
): WeekTopicPick {
  const cms = [...allPublished]
    .filter((a) => (a.weekTopicPosition ?? 0) >= 1)
    .sort(
      (a, b) => (a.weekTopicPosition ?? 0) - (b.weekTopicPosition ?? 0)
    );
  return buildHomepageWeekTopicSlides(cms, allPublished, config.limit);
}
