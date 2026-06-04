import type { ArticleFormValues, AdminCategory } from "@/lib/admin/types";
import { resolveImageCreditFromForm } from "@/lib/articles/image-credit";
import { previewCategorySlug } from "@/lib/ui/article-preview-meta";
import type { NewsArticle } from "@/types";

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

type FormWithImageAliases = ArticleFormValues & {
  imageUrl?: string;
  image?: string;
};

/** User-provided cover URL only (no category fallback). */
export function resolvePreviewImageFromForm(
  form: ArticleFormValues
): string | null {
  const f = form as FormWithImageAliases;
  const raw =
    f.imageUrl?.trim() || form.coverImage.trim() || f.image?.trim() || "";
  return raw || null;
}

/** Client-side draft → NewsArticle for live CMS preview (no API). */
export function formToPreviewArticle(input: PreviewArticleInput): NewsArticle {
  const { form, categories, contentOrigin, articleId } = input;
  const category = previewCategorySlug(form.categoryId, categories);
  const source = form.sourceName.trim() || undefined;
  const originalUrl = form.sourceUrl.trim() || undefined;
  const paragraphs = splitContentParagraphs(form.content);
  const now = new Date().toISOString();
  const slug = form.slug.trim() || "podglad";
  // CMS preview = only the cover URL field (no RSS/category/stock fallbacks).
  const image = resolvePreviewImageFromForm(form) ?? "";

  const imageCredit = resolveImageCreditFromForm(form);

  return {
    id: articleId ?? "preview-draft",
    slug,
    title: form.title.trim() || "Tytuł artykułu",
    excerpt: form.excerpt.trim() || form.subtitle.trim() || "",
    category,
    publishedAt: now,
    createdAt: now,
    timeLabel: "podgląd",
    image,
    readTime: form.readingTime ?? undefined,
    featured: form.featured,
    heroPosition: form.heroPosition,
    content: paragraphs.length > 0 ? paragraphs : undefined,
    contextNote: form.contextNote.trim() || undefined,
    contentOrigin: contentOrigin ?? "EDITORIAL",
    source,
    originalUrl,
    imageCredit,
    authorByline: form.authorByline.trim() || undefined,
    tags: parseTags(form.tagsText),
  };
}

/** Hero-only subtitle (form field not on NewsArticle). */
export function previewSubtitle(form: ArticleFormValues): string | null {
  const s = form.subtitle.trim();
  return s || null;
}
