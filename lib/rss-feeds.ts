import { CATEGORY_INFO, type CategorySlug } from "@/lib/categories";

export type RssFeedDefinition = {
  id: string;
  title: string;
  description: string;
  /** Path on site, e.g. /feed.xml or /feed/misje */
  path: string;
  /** Page the feed belongs to (for humans) */
  pageHref: string;
};

export const RSS_MAIN_FEED: RssFeedDefinition = {
  id: "all",
  title: "Wszystkie aktualności",
  description:
    "Pełny strumień newsów z Web Space Station — misje, astronomia, technologie, ISS i Ziemia z kosmosu.",
  path: "/feed.xml",
  pageHref: "/aktualnosci",
};

export const RSS_CATEGORY_FEEDS: RssFeedDefinition[] = (
  Object.keys(CATEGORY_INFO) as CategorySlug[]
).map((slug) => {
  const meta = CATEGORY_INFO[slug];
  return {
    id: slug,
    title: meta.label,
    description: meta.description,
    path: `/feed/${slug}`,
    pageHref: meta.href,
  };
});

export const RSS_ALL_FEEDS: RssFeedDefinition[] = [
  RSS_MAIN_FEED,
  ...RSS_CATEGORY_FEEDS,
];

export function isCategorySlug(value: string): value is CategorySlug {
  return value in CATEGORY_INFO;
}
