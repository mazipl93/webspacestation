import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import {
  ARTICLE_HERO_FRAME_CLASS,
  ARTICLE_HERO_FRAME_DESKTOP_CLASS,
  ARTICLE_HERO_FRAME_MOBILE_CLASS,
  ARTICLE_HERO_SECTION_CLASS,
  ARTICLE_HERO_SECTION_EMBEDDED_CLASS,
  type ArticleHeroPreviewLayout,
} from "@/lib/ui/article-hero-frame";
import { resolveImageOrFallback } from "@/lib/articles/resolve-image";
import { previewCatFallback } from "@/lib/ui/article-preview-meta";

export type ArticlePageHeroProps = {
  article: NewsArticle;
  showBreadcrumb?: boolean;
  /** CMS — bez pt pod fixed nav (nav stub w flow nad hero). */
  embedded?: boolean;
  animate?: boolean;
  /** Wymusza układ mobile/desktop w podglądzie CMS (niezależnie od szerokości okna). */
  previewLayout?: ArticleHeroPreviewLayout;
};

/** Okładka bez tekstu na zdjęciu — tytuł i meta zawsze pod obrazem (mobile + desktop). */
export default function ArticlePageHero({
  article,
  embedded = false,
  previewLayout,
}: ArticlePageHeroProps) {
  const frameClass =
    previewLayout === "desktop"
      ? ARTICLE_HERO_FRAME_DESKTOP_CLASS
      : previewLayout === "mobile"
        ? ARTICLE_HERO_FRAME_MOBILE_CLASS
        : ARTICLE_HERO_FRAME_CLASS;

  const heroSrc = resolveImageOrFallback({
    image: article.image,
    category: article.category,
    slug: article.slug,
    contentOrigin: article.contentOrigin,
  });

  return (
    <section
      className={
        embedded ? ARTICLE_HERO_SECTION_EMBEDDED_CLASS : ARTICLE_HERO_SECTION_CLASS
      }
    >
      <div className={frameClass}>
        <div
          className="absolute inset-0 z-0"
          style={{ background: previewCatFallback(article.category) }}
        />

        <CoverImage
          src={heroSrc}
          alt={
            article.imageCredit ??
            (article.source
              ? `Ilustracja — materiał ${article.source}`
              : article.title)
          }
          fill
          priority
          sizes="(max-width: 1320px) 100vw, 1320px"
          className="z-[1] object-cover object-center"
        />
      </div>
    </section>
  );
}
