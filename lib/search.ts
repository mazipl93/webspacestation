import type { AdminArticle } from "@/lib/admin/types";
import { resolveImageOrFallback } from "@/lib/articles/resolve-image";
import { DEFAULT_COVER_FALLBACK } from "@/lib/cover-fallbacks";
import type { NewsArticle } from "@/types";

// Graceful cover fallback so a result card never renders an empty <Image>.
export const SEARCH_FALLBACK_IMAGE = DEFAULT_COVER_FALLBACK;

function formatPl(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Map the API article shape onto the NewsArticle shape ArticleCard expects.
export function toNewsCard(a: AdminArticle): NewsArticle {
  const when = a.publishedAt ?? a.createdAt;
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? "",
    category: a.category.slug as NewsArticle["category"],
    publishedAt: when,
    timeLabel: formatPl(when),
    image: resolveImageOrFallback({
      coverImage: a.coverImage,
      category: a.category.slug,
      slug: a.slug,
    }),
    isBreaking: false,
    readTime: a.readingTime ?? undefined,
  };
}

// Case-insensitive substring match across the article's searchable fields.
// `q` is expected to already be lowercased + trimmed by the caller.
export function matchesArticle(a: AdminArticle, q: string): boolean {
  const haystack = [a.title, a.subtitle, a.excerpt, a.content, a.category.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
