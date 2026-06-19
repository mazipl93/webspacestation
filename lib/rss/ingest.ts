import { ArticleContentKind, ArticleContentOrigin, ArticleStatus, Prisma, Role } from "@prisma/client";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

import { fetchFeeds } from "@/lib/rss/fetchFeeds";

import {

  buildAggregatorContent,

  normalizeTitleKey,

} from "@/lib/rss/normalize";

import { editorialCategoryToSlug } from "@/lib/rss/categorize";
import { buildRawRssSubtitle } from "@/lib/rss/pipeline";

import type { IngestResult, NormalizedRssItem } from "@/lib/rss/types";



const NEWS_ENGINE_EMAIL = "news-engine@wss.space";



async function getNewsEngineAuthorId(): Promise<string> {

  const existing = await prisma.user.findUnique({

    where: { email: NEWS_ENGINE_EMAIL },

    select: { id: true },

  });

  if (existing) return existing.id;



  const passwordHash = await bcrypt.hash(

    process.env.SEED_NEWS_ENGINE_PASSWORD ?? "wss-news-engine-internal",

    12

  );



  const user = await prisma.user.create({

    data: {

      email: NEWS_ENGINE_EMAIL,

      name: "WSS News Engine",

      role: Role.AUTHOR,

      passwordHash,

    },

    select: { id: true },

  });

  return user.id;

}



async function loadDedupeSets(): Promise<{

  urls: Set<string>;

  titles: Set<string>;

  slugs: Set<string>;

}> {

  const rows = await prisma.article.findMany({

    select: { originalUrl: true, title: true, slug: true },

  });



  const urls = new Set<string>();

  const titles = new Set<string>();

  const slugs = new Set<string>();



  for (const row of rows) {

    if (row.originalUrl) urls.add(row.originalUrl);

    titles.add(normalizeTitleKey(row.title));

    slugs.add(row.slug);

  }



  return { urls, titles, slugs };

}



async function resolveCategoryId(slug: string): Promise<string | null> {

  const category = await prisma.category.findUnique({

    where: { slug },

    select: { id: true },

  });

  return category?.id ?? null;

}



async function persistItem(

  item: NormalizedRssItem,

  authorId: string,

  categoryId: string,

  dedupe: { urls: Set<string>; titles: Set<string>; slugs: Set<string> }

): Promise<"created" | "skippedUrl" | "skippedTitle" | "skippedSlug"> {

  if (dedupe.urls.has(item.originalUrl)) return "skippedUrl";



  const titleKey = normalizeTitleKey(item.title);

  if (titleKey && dedupe.titles.has(titleKey)) return "skippedTitle";



  const slug = item.slug;

  if (dedupe.slugs.has(slug)) return "skippedSlug";



  try {
  await prisma.article.create({

    data: {

      slug,

      title: item.title,

      subtitle: buildRawRssSubtitle(item.source),

      excerpt: item.excerpt,

      content: buildAggregatorContent(item.source, item.originalUrl),

      coverImage: item.coverImage ?? null,

      source: item.source,

      originalUrl: item.originalUrl,

      // HARD RULE: contentOrigin is immutable after create — RSS ingest always RSS.
      contentOrigin: ArticleContentOrigin.RSS,
      contentKind: ArticleContentKind.NEWS,

      status: ArticleStatus.DRAFT,

      featured: false,

      score: 0,

      readingTime: 1,

      categoryId,

      authorId,

      publishedAt: null,

    },

  });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return "skippedUrl";
    }
    throw err;
  }



  dedupe.urls.add(item.originalUrl);

  if (titleKey) dedupe.titles.add(titleKey);

  dedupe.slugs.add(slug);



  return "created";

}



/**

 * Ingestion only: fetch RSS → save DRAFT (raw EN metadata). No AI, no publish, no cache bust.

 * Run `runRssDraftProcessing` separately for translation → REVIEW.

 */

export async function runNewsEngineIngest(): Promise<IngestResult> {

  const result: IngestResult = {

    fetched: 0,

    created: 0,

    skippedUrl: 0,

    skippedTitle: 0,

    skippedSlug: 0,

    errors: [],

  };



  const { items, errors: fetchErrors } = await fetchFeeds();

  result.fetched = items.length;

  result.errors.push(

    ...fetchErrors.map((e) => `${e.feedId}: ${e.message}`)

  );



  if (items.length === 0) return result;



  const authorId = await getNewsEngineAuthorId();

  const dedupe = await loadDedupeSets();

  const categoryCache = new Map<string, string>();



  for (const item of items) {

    const catSlug = editorialCategoryToSlug(item.category);

    let categoryId = categoryCache.get(catSlug);

    if (!categoryId) {

      const resolved = await resolveCategoryId(catSlug);

      if (!resolved) {

        result.errors.push(`Brak kategorii w DB: ${catSlug}`);

        continue;

      }

      categoryId = resolved;

      categoryCache.set(catSlug, categoryId);

    }



    try {

      const outcome = await persistItem(item, authorId, categoryId, dedupe);

      if (outcome === "created") result.created += 1;

      else if (outcome === "skippedUrl") result.skippedUrl += 1;

      else if (outcome === "skippedTitle") result.skippedTitle += 1;

      else if (outcome === "skippedSlug") result.skippedSlug += 1;

    } catch (err) {

      const message = err instanceof Error ? err.message : String(err);

      result.errors.push(`${item.originalUrl}: ${message}`);

    }

  }



  return result;

}


