import { getRssImageCreditForArticle } from "@/lib/rss/image-credit";

/** CMS / public — manual DB caption first, then RSS auto-caption. */
export function resolveArticleImageCredit(article: {
  coverImageCredit?: string | null;
  source?: string | null;
  originalUrl?: string | null;
  subtitle?: string | null;
  contentOrigin?: string;
}): string | undefined {
  const manual = article.coverImageCredit?.trim();
  if (manual) return manual;
  return getRssImageCreditForArticle(article) ?? undefined;
}

/** Live preview from form — manual caption only (source attribution comes from DB on published articles). */
export function resolveImageCreditFromForm(form: {
  coverImageCredit: string;
}): string | undefined {
  return form.coverImageCredit.trim() || undefined;
}
