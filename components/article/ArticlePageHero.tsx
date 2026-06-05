import type { NewsArticle } from "@/types";
import ArticleHeroMedia from "@/components/article/ArticleHeroMedia";
import {
  ARTICLE_HERO_SECTION_CLASS,
  ARTICLE_HERO_SECTION_EMBEDDED_CLASS,
  type ArticleHeroPreviewLayout,
} from "@/lib/ui/article-hero-frame";
import { HERO_FRAME_MAX_HEIGHT } from "@/lib/ui/article-hero-aspect";
import { resolveHeroDisplayUrl } from "@/lib/articles/resolve-image";
import { previewCatFallback } from "@/lib/ui/article-preview-meta";

export type ArticlePageHeroProps = {
  article: NewsArticle;
  showBreadcrumb?: boolean;
  /** CMS — bez pt pod fixed nav (nav stub w flow nad hero). */
  embedded?: boolean;
  /** CMS live preview — tylko cover z formularza/DB, bez editorial override. */
  preview?: boolean;
  animate?: boolean;
  /** Wymusza układ mobile/desktop w podglądzie CMS (niezależnie od szerokości okna). */
  previewLayout?: ArticleHeroPreviewLayout;
};

function heroMaxHeight(previewLayout?: ArticleHeroPreviewLayout): number {
  if (previewLayout === "mobile") return HERO_FRAME_MAX_HEIGHT.mobile;
  if (previewLayout === "desktop") return HERO_FRAME_MAX_HEIGHT.desktop;
  return HERO_FRAME_MAX_HEIGHT.pageDesktop;
}

/** Okładka bez tekstu na zdjęciu — tytuł i meta zawsze pod obrazem (mobile + desktop). */
export default function ArticlePageHero({
  article,
  embedded = false,
  preview = false,
  previewLayout,
}: ArticlePageHeroProps) {
  const heroSrc = preview
    ? resolveHeroDisplayUrl({ image: article.image, coverImage: article.image })
    : article.image;

  const background = previewCatFallback(article.category);

  return (
    <section
      className={
        embedded ? ARTICLE_HERO_SECTION_EMBEDDED_CLASS : ARTICLE_HERO_SECTION_CLASS
      }
    >
      {heroSrc ? (
        <ArticleHeroMedia
          src={heroSrc}
          alt={
            article.coverImageCredit ??
            (article.source
              ? `Ilustracja — materiał ${article.source}`
              : article.title)
          }
          slug={article.slug}
          category={article.category}
          suppressFallback={preview}
          maxHeight={heroMaxHeight(previewLayout)}
          background={background}
          imageCredit={article.coverImageCredit}
        />
      ) : (
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: "16 / 9",
            maxHeight: heroMaxHeight(previewLayout),
            background,
          }}
        />
      )}
    </section>
  );
}
