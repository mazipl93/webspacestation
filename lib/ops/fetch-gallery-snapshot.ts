import { prisma } from "@/lib/prisma";
import { PUBLISHED_ARTICLE_WHERE } from "@/lib/server/published-only";
import { rankLatest } from "@/lib/home/rank-articles";
import {
  fetchNasaApod,
  fetchNasaGalleryImages,
} from "@/lib/ops/nasa-media";
import type { OpsGalleryItem } from "@/lib/ops/types";
import type { OpsGalleryPayload } from "@/lib/ops/payloads";
import { resolveImageOrFallback } from "@/lib/articles/resolve-image";

async function fetchAstronomiaGalleryRows() {
  return prisma.article.findMany({
    where: {
      ...PUBLISHED_ARTICLE_WHERE,
      category: { slug: "astronomia" },
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 24,
    select: {
      slug: true,
      title: true,
      coverImage: true,
      publishedAt: true,
      createdAt: true,
      score: true,
      source: true,
      contentOrigin: true,
    },
  });
}

/** NASA APOD + Image Library + redakcyjne okładki astronomia. */
export async function fetchGalleryOpsSnapshot(): Promise<OpsGalleryPayload> {
  const isDev = process.env.NODE_ENV === "development";

  const [apod, nasaImages, astroRows] = await Promise.all([
    isDev ? Promise.resolve(null) : fetchNasaApod().catch(() => null),
    isDev
      ? Promise.resolve([])
      : fetchNasaGalleryImages(10).catch(() => []),
    isDev
      ? Promise.resolve([])
      : fetchAstronomiaGalleryRows().catch(() => []),
  ]);

  const astroArticles = astroRows.map((row) => ({
    slug: row.slug,
    title: row.title,
    publishedAt: row.publishedAt?.toISOString() ?? row.createdAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    score: row.score,
    image: resolveImageOrFallback({
      coverImage: row.coverImage,
      category: "astronomia",
      slug: row.slug,
      contentOrigin: row.contentOrigin,
    }),
    source: row.source ?? undefined,
  }));

  const gallery: OpsGalleryItem[] = [];
  if (apod) gallery.push(apod);
  gallery.push(...nasaImages);

  const editorial = rankLatest(astroArticles, 6)
    .filter((a) => a.image)
    .map((a) => ({
      id: `article-${a.slug}`,
      title: a.title,
      imageUrl: a.image!,
      credit: a.source ?? "Web Space Station",
      date: a.publishedAt?.slice(0, 10),
      href: `/aktualnosci/${a.slug}`,
      source: "Redakcja WSS",
    }));
  gallery.push(...editorial);

  const live = gallery.length > 0;

  return {
    gallery,
    live,
    fetchedAt: new Date().toISOString(),
  };
}
