import type { NewsArticle } from "@/types";

export type WeekTopicConfig = {
  label: string;
  subtitle: string;
  /** Tag w CMS (pole tagów artykułu) — porównanie bez wielkości liter. */
  tag: string;
  limit: number;
  accent: string;
};

export function getWeekTopicConfig(): WeekTopicConfig {
  return {
    label:
      process.env.NEXT_PUBLIC_WEEK_TOPIC_LABEL?.trim() || "Temat tygodnia",
    subtitle:
      process.env.NEXT_PUBLIC_WEEK_TOPIC_SUBTITLE?.trim() ||
      "Jeden wątek, kilka artykułów — w CMS dodaj tag do wybranych tekstów",
    tag: (process.env.WEEK_TOPIC_TAG || "temat-tygodnia").trim().toLowerCase(),
    limit: Math.min(
      8,
      Math.max(3, Number(process.env.WEEK_TOPIC_LIMIT) || 5)
    ),
    accent: "#a855f7",
  };
}

function articleHasWeekTopicTag(article: NewsArticle, tag: string): boolean {
  if (!tag) return false;
  const tags = article.tags ?? [];
  return tags.some((t) => {
    const n = t.trim().toLowerCase();
    return n === tag || n.includes(tag);
  });
}

export type WeekTopicPick = {
  articles: NewsArticle[];
  /** true = redakcyjny tag; false = automatyczny fallback rankingiem. */
  fromTag: boolean;
};

/**
 * Artykuły tematu tygodnia: najpierw tag z CMS, potem fallback (Ważne teraz / najnowsze).
 */
export function pickWeekTopicArticles(
  allPublished: NewsArticle[],
  excludeSlugs: Set<string>,
  fallbackPool: NewsArticle[],
  config = getWeekTopicConfig()
): WeekTopicPick {
  const pool = allPublished.filter((a) => !excludeSlugs.has(a.slug));
  const tagged = pool
    .filter((a) => articleHasWeekTopicTag(a, config.tag))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, config.limit);

  if (tagged.length >= 2) {
    return { articles: tagged, fromTag: true };
  }

  const fallback = fallbackPool
    .filter((a) => !excludeSlugs.has(a.slug))
    .slice(0, config.limit);

  return { articles: fallback, fromTag: false };
}
