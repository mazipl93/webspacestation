import type { NewsArticle } from "@/types";

export type WeekTopicConfig = {
  label: string;
  subtitle: string;
  limit: number;
  accent: string;
};

export function getWeekTopicConfig(): WeekTopicConfig {
  return {
    label:
      process.env.NEXT_PUBLIC_WEEK_TOPIC_LABEL?.trim() || "Temat tygodnia",
    subtitle:
      process.env.NEXT_PUBLIC_WEEK_TOPIC_SUBTITLE?.trim() ||
      "Artykuły z włączonym przełącznikiem w edytorze CMS",
    limit: Math.min(
      8,
      Math.max(2, Number(process.env.WEEK_TOPIC_LIMIT) || 6)
    ),
    accent: "#a855f7",
  };
}

export type WeekTopicPick = {
  articles: NewsArticle[];
};

/** Opublikowane artykuły z `weekTopic === true` (przełącznik CMS). */
export function pickWeekTopicArticles(
  allPublished: NewsArticle[],
  excludeSlugs: Set<string>,
  config = getWeekTopicConfig()
): WeekTopicPick {
  const articles = allPublished
    .filter((a) => a.weekTopic && !excludeSlugs.has(a.slug))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, config.limit);

  return { articles };
}
