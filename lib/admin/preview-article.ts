import type { ArticleFormValues, AdminCategory } from "@/lib/admin/types";
import { buildRssImageCredit } from "@/lib/rss/image-credit";
import { previewCategorySlug } from "@/lib/ui/article-preview-meta";
import { hasCitationFields } from "@/lib/ui/article-kind";
import { SEARCH_FALLBACK_IMAGE } from "@/lib/search";
import type { NewsArticle, NewsCategory } from "@/types";

const COVER_BY_CATEGORY: Partial<Record<NewsCategory, string>> = {
  technologie:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=70",
  misje:
    "https://images.unsplash.com/photo-1446776811953-b23d57bd2aa0?auto=format&fit=crop&w=1200&q=70",
  astronomia:
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=70",
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=70",
  "ziemia-z-kosmosu":
    "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=1200&q=70",
  iss: "https://images.unsplash.com/photo-1614728894747-2f457dab2d4c?auto=format&fit=crop&w=1200&q=70",
};

export type PreviewArticleInput = {
  form: ArticleFormValues;
  categories: AdminCategory[];
  contentOrigin?: NewsArticle["contentOrigin"];
  articleId?: string;
  /** Optional subtitle shown in hero (not on public API shape). */
  subtitle?: string;
};

function splitContentParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function parseTags(tagsText: string): string[] {
  return tagsText
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function resolveCoverImage(
  coverImage: string,
  category: NewsCategory
): string {
  const trimmed = coverImage.trim();
  if (trimmed) return trimmed;
  return COVER_BY_CATEGORY[category] ?? SEARCH_FALLBACK_IMAGE;
}

/** Client-side draft → NewsArticle for live CMS preview (no API). */
export function formToPreviewArticle(input: PreviewArticleInput): NewsArticle {
  const { form, categories, contentOrigin, articleId } = input;
  const category = previewCategorySlug(form.categoryId, categories);
  const hasSource = hasCitationFields(form.sourceName, form.sourceUrl);
  const source = form.sourceName.trim() || undefined;
  const originalUrl = form.sourceUrl.trim() || undefined;
  const paragraphs = splitContentParagraphs(form.content);
  const now = new Date().toISOString();

  const imageCredit =
    hasSource && source
      ? buildRssImageCredit(source, originalUrl)
      : undefined;

  return {
    id: articleId ?? "preview-draft",
    slug: form.slug.trim() || "podglad",
    title: form.title.trim() || "Tytuł artykułu",
    excerpt: form.excerpt.trim() || form.subtitle.trim() || "",
    category,
    publishedAt: now,
    createdAt: now,
    timeLabel: "podgląd",
    imageUrl: resolveCoverImage(form.coverImage, category),
    readTime: form.readingTime ?? undefined,
    featured: form.featured,
    content: paragraphs.length > 0 ? paragraphs : undefined,
    contextNote: form.contextNote.trim() || undefined,
    contentOrigin: contentOrigin ?? "EDITORIAL",
    source,
    originalUrl,
    imageCredit,
    tags: parseTags(form.tagsText),
  };
}

/** Hero-only subtitle (form field not on NewsArticle). */
export function previewSubtitle(form: ArticleFormValues): string | null {
  const s = form.subtitle.trim();
  return s || null;
}
