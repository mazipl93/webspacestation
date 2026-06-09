import type { NewsArticle } from "@/types";

export type WeekTopicConfig = {
  label: string;
  /** Opcjonalny podtytuł sekcji (pusty = bez opisu pod nagłówkiem). */
  subtitle?: string;
  limit: number;
  accent: string;
};

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

export type WeekTopicPickOptions = {
  /** Pula już z DB (`weekTopic=true`) — nie filtruj ponownie po fladze. */
  prefiltered?: boolean;
};

/** Opublikowane artykuły z `weekTopic === true` (przełącznik CMS). */
export function pickWeekTopicArticles(
  allPublished: NewsArticle[],
  excludeSlugs: Set<string>,
  config = getWeekTopicConfig(),
  options: WeekTopicPickOptions = {}
): WeekTopicPick {
  const candidates = options.prefiltered
    ? allPublished
    : allPublished.filter((a) => a.weekTopic);
  const sortByPublished = (list: NewsArticle[]) =>
    [...list].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  const withoutExcluded = sortByPublished(
    candidates.filter((a) => !excludeSlugs.has(a.slug))
  ).slice(0, config.limit);

  if (withoutExcluded.length > 0) {
    return { articles: withoutExcluded };
  }

  // Jedyny artykuł z flagą jest już w hero — pokaż slider zamiast pustej sekcji.
  if (candidates.length > 0) {
    return { articles: sortByPublished(candidates).slice(0, config.limit) };
  }

  return { articles: [] };
}
