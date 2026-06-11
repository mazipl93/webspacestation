import "server-only";

import {
  getArticlesByCategory,
  type ArticleListItem,
} from "@/lib/server/articles";
import {
  buildLaunchArticleMap,
  pickLaunchForArticle,
  toLaunchArticleHref,
  type BridgeArticle,
} from "@/lib/ops/match-launch-articles";
import type { OpsLaunch } from "@/lib/ops/types";

const BRIDGE_CATEGORIES = ["misje", "iss", "technologie"] as const;
const POOL_LIMIT_PER_CATEGORY = 40;

export type LaunchWssArticleLink = {
  slug: string;
  title: string;
  href: string;
};

function toBridgeArticle(article: ArticleListItem): BridgeArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    tags: Array.isArray(article.tags) ? article.tags : [],
    categorySlug: article.category.slug,
    publishedAt: article.publishedAt?.toISOString() ?? null,
  };
}

async function fetchBridgeArticlePool(): Promise<BridgeArticle[]> {
  const batches = await Promise.all(
    BRIDGE_CATEGORIES.map((slug) =>
      getArticlesByCategory(slug, { limit: POOL_LIMIT_PER_CATEGORY }),
    ),
  );

  const byId = new Map<string, BridgeArticle>();
  for (const batch of batches) {
    for (const row of batch) {
      byId.set(row.id, toBridgeArticle(row));
    }
  }

  return [...byId.values()].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
}

/** launchId → related WSS news article (for /starty cards, ops strip). */
export async function getLaunchWssArticleLinks(
  launches: OpsLaunch[],
): Promise<Map<string, LaunchWssArticleLink>> {
  if (launches.length === 0) return new Map();

  const pool = await fetchBridgeArticlePool();
  if (pool.length === 0) return new Map();

  const raw = buildLaunchArticleMap(launches, pool);
  const links = new Map<string, LaunchWssArticleLink>();

  for (const [launchId, article] of raw) {
    links.set(launchId, {
      slug: article.slug,
      title: article.title,
      href: toLaunchArticleHref(article.slug),
    });
  }

  return links;
}

export function linkForLaunch(
  launchId: string,
  links: Map<string, LaunchWssArticleLink>,
): LaunchWssArticleLink | null {
  return links.get(launchId) ?? null;
}

/** Best upcoming launch for a Misje/ISS/Tech article (article page widget). */
export async function matchLaunchForArticle(input: {
  id: string;
  slug: string;
  title: string;
  tags?: string[] | null;
  categorySlug: string;
  publishedAt?: string | null;
  launches: OpsLaunch[];
}): Promise<OpsLaunch | null> {
  if (input.launches.length === 0) return null;
  if (
    input.categorySlug !== "misje" &&
    input.categorySlug !== "iss" &&
    input.categorySlug !== "technologie"
  ) {
    return null;
  }

  const article: BridgeArticle = {
    id: input.id,
    slug: input.slug,
    title: input.title,
    tags: input.tags ?? [],
    categorySlug: input.categorySlug,
    publishedAt: input.publishedAt ?? null,
  };

  return pickLaunchForArticle(article, input.launches);
}
