import { buildRssImageCredit, getRssImageCreditForArticle } from "@/lib/rss/image-credit";
import { hasCitationFields } from "@/lib/ui/article-kind";

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

/** Live preview from form — same priority as public. */
export function resolveImageCreditFromForm(form: {
  coverImageCredit: string;
  sourceName: string;
  sourceUrl: string;
}): string | undefined {
  const manual = form.coverImageCredit.trim();
  if (manual) return manual;
  if (hasCitationFields(form.sourceName, form.sourceUrl)) {
    return buildRssImageCredit(
      form.sourceName.trim(),
      form.sourceUrl.trim() || undefined
    );
  }
  return undefined;
}
