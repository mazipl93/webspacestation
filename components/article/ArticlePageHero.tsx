import type { CSSProperties } from "react";
import { Calendar, Clock, User } from "lucide-react";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import HeroMetaChip from "@/components/article/HeroMetaChip";
import ArticleHeroBreadcrumb from "@/components/article/ArticleHeroBreadcrumb";
import ArticleHeroMobileMeta from "@/components/article/ArticleHeroMobileMeta";
import {
  ARTICLE_HERO_BREADCRUMB_NAV_CLASS,
  ARTICLE_HERO_BREADCRUMB_NAV_DESKTOP_CLASS,
  ARTICLE_HERO_BREADCRUMB_NAV_MOBILE_CLASS,
  ARTICLE_HERO_COPY_INNER_CLASS,
  ARTICLE_HERO_COPY_INNER_DESKTOP_CLASS,
  ARTICLE_HERO_COPY_SHELL_CLASS,
  ARTICLE_HERO_COPY_SHELL_DESKTOP_CLASS,
  ARTICLE_HERO_COPY_SHELL_MOBILE_CLASS,
  ARTICLE_HERO_FRAME_CLASS,
  ARTICLE_HERO_FRAME_DESKTOP_CLASS,
  ARTICLE_HERO_FRAME_MOBILE_CLASS,
  ARTICLE_HERO_GRADIENT_CLASS,
  ARTICLE_HERO_GRADIENT_DESKTOP_CLASS,
  ARTICLE_HERO_GRADIENT_MOBILE_CLASS,
  ARTICLE_HERO_SECTION_CLASS,
  ARTICLE_HERO_SECTION_EMBEDDED_CLASS,
  type ArticleHeroPreviewLayout,
} from "@/lib/ui/article-hero-frame";
import { resolveImageOrFallback } from "@/lib/articles/resolve-image";
import {
  previewCatFallback,
  previewCatMeta,
} from "@/lib/ui/article-preview-meta";
import { cn } from "@/lib/cn";

function fadeIn(delay = 0, duration = 0.75): CSSProperties {
  return {
    animation: `reveal-fade ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
  };
}

function ArticleCategoryBadge({
  label,
  color,
  className,
}: {
  label: string;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-[0_2px_12px_rgba(0,0,0,0.45)] backdrop-blur-md",
        className
      )}
      style={{
        color,
        borderColor: `${color}55`,
        background: "rgba(0,0,0,0.55)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export type ArticlePageHeroProps = {
  article: NewsArticle;
  showBreadcrumb?: boolean;
  /** CMS — bez pt pod fixed nav (nav stub w flow nad hero). */
  embedded?: boolean;
  animate?: boolean;
  /** Wymusza układ mobile/desktop w podglądzie CMS (niezależnie od szerokości okna). */
  previewLayout?: ArticleHeroPreviewLayout;
};

export default function ArticlePageHero({
  article,
  showBreadcrumb = true,
  embedded = false,
  animate = true,
  previewLayout,
}: ArticlePageHeroProps) {
  const meta = previewCatMeta(article.category);
  const date = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const motion = (delay: number) => (animate ? fadeIn(delay) : undefined);

  const frameClass =
    previewLayout === "desktop"
      ? ARTICLE_HERO_FRAME_DESKTOP_CLASS
      : previewLayout === "mobile"
        ? ARTICLE_HERO_FRAME_MOBILE_CLASS
        : ARTICLE_HERO_FRAME_CLASS;

  const gradientClass =
    previewLayout === "desktop"
      ? ARTICLE_HERO_GRADIENT_DESKTOP_CLASS
      : previewLayout === "mobile"
        ? ARTICLE_HERO_GRADIENT_MOBILE_CLASS
        : ARTICLE_HERO_GRADIENT_CLASS;

  const copyShellClass =
    previewLayout === "desktop"
      ? ARTICLE_HERO_COPY_SHELL_DESKTOP_CLASS
      : previewLayout === "mobile"
        ? ARTICLE_HERO_COPY_SHELL_MOBILE_CLASS
        : ARTICLE_HERO_COPY_SHELL_CLASS;

  const copyInnerClass =
    previewLayout === "desktop"
      ? ARTICLE_HERO_COPY_INNER_DESKTOP_CLASS
      : ARTICLE_HERO_COPY_INNER_CLASS;

  const breadcrumbClass =
    previewLayout === "desktop"
      ? ARTICLE_HERO_BREADCRUMB_NAV_DESKTOP_CLASS
      : previewLayout === "mobile"
        ? ARTICLE_HERO_BREADCRUMB_NAV_MOBILE_CLASS
        : ARTICLE_HERO_BREADCRUMB_NAV_CLASS;

  const excerptClass =
    previewLayout === "desktop"
      ? "max-w-[620px] line-clamp-3 text-[15px] leading-relaxed text-text-secondary/95"
      : previewLayout === "mobile"
        ? "hidden"
        : "hidden max-w-[620px] text-text-secondary/95 lg:line-clamp-3 lg:block lg:text-[15px] lg:leading-relaxed";

  const creditClass =
    previewLayout === "desktop"
      ? "block pt-0.5"
      : previewLayout === "mobile"
        ? "hidden"
        : "hidden pt-0.5 lg:block";

  const hideMobileMeta = previewLayout === "desktop";

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
          sizes="100vw"
          className="z-[1] object-cover object-center"
        />

        <div
          aria-hidden="true"
          className={gradientClass}
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.97) 0%, rgba(5,7,9,0.78) 28%, rgba(5,7,9,0.22) 62%, transparent 100%)",
          }}
        />

        {showBreadcrumb ? (
          <div className={breadcrumbClass} style={motion(0.04)}>
            <ArticleHeroBreadcrumb
              categorySlug={article.category}
              variant="overlay"
            />
          </div>
        ) : null}

        <div className={copyShellClass}>
          <div className={copyInnerClass}>
            <div className="flex max-w-[820px] flex-col gap-1 max-sm:gap-1 sm:gap-2.5">
              {article.isBreaking ? (
                <div style={motion(0.06)}>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-live px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                    <span className="live-dot" style={{ background: "#fff" }} />
                    Ważne
                  </span>
                </div>
              ) : null}

              <div style={motion(0.1)}>
                <ArticleCategoryBadge label={meta.label} color={meta.color} />
              </div>

              <h1
                className="break-words text-balance font-extrabold text-text-primary max-sm:line-clamp-2 sm:line-clamp-none"
                style={{
                  fontSize: "clamp(1.05rem, 4.2vw, 2.5rem)",
                  lineHeight: 1.12,
                  letterSpacing: "-0.025em",
                  textShadow: "0 2px 32px rgba(0,0,0,0.65)",
                  ...motion(0.14),
                }}
              >
                {article.title}
              </h1>

              <div
                className="flex flex-wrap items-center gap-1 sm:gap-1.5"
                style={motion(0.22)}
              >
                <HeroMetaChip icon={Calendar} compact>
                  <span className="max-sm:hidden">{date}</span>
                  <span className="sm:hidden">
                    {new Date(article.publishedAt).toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </HeroMetaChip>
                <HeroMetaChip icon={Clock} compact>
                  {article.readTime ?? 3} min
                </HeroMetaChip>
                {article.authorByline ? (
                  <span className="hidden sm:contents">
                    <HeroMetaChip icon={User}>{article.authorByline}</HeroMetaChip>
                  </span>
                ) : null}
              </div>

              {article.excerpt ? (
                <p
                  className={excerptClass}
                  style={{
                    textShadow: "0 1px 16px rgba(0,0,0,0.5)",
                    ...motion(0.28),
                  }}
                >
                  {article.excerpt}
                </p>
              ) : null}

              {article.imageCredit ? (
                <div className={creditClass} style={motion(0.32)}>
                  <CoverImageCredit
                    credit={article.imageCredit}
                    source={article.source}
                    originalUrl={article.originalUrl}
                    variant="overlay"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {hideMobileMeta ? null : (
        <ArticleHeroMobileMeta
          article={article}
          categoryLabel={meta.label}
          categoryColor={meta.color}
          showBreadcrumb={showBreadcrumb}
          forceBelowImage={previewLayout === "mobile"}
        />
      )}
    </section>
  );
}
