import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import type { NewsArticle } from "@/types";
import {
  getArticleBySlug,
  getReadNextArticles,
  getRelatedArticles,
  getWeaveInternalLinkCandidates,
} from "@/lib/articles";
import ReadNextSection from "@/components/article/ReadNextSection";
import ArticleMainColumnShell from "@/components/article/ArticleMainColumnShell";
import JsonLd from "@/components/seo/JsonLd";
import Navbar from "@/components/layout/Navbar";
import { buildArticleJsonLd } from "@/lib/seo/json-ld";
import { SEO_NOINDEX } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/site-url";
import Footer from "@/components/layout/Footer";
import StickyArticleBar from "@/components/article/StickyArticleBar";
import ArticleInteractions from "@/components/article/ArticleInteractions";
import CoverImage from "@/components/article/CoverImage";
import ArticlePageHero from "@/components/article/ArticlePageHero";
import ArticleHeroMobileMeta from "@/components/article/ArticleHeroMobileMeta";
import ArticleInfoPanel from "@/components/article/ArticleInfoPanel";
import ArticlePageBodyMain from "@/components/article/ArticlePageBodyMain";
import {
  ARTICLE_HERO_SHELL_WRAP,
  ARTICLE_PAGE_GRID,
  ARTICLE_PAGE_SIDEBAR_STUB,
  ARTICLE_SHELL,
} from "@/lib/ui/article-editorial-layout";
import { ARTICLE_PAGE_MAIN_OFFSET_CLASS } from "@/lib/ui/article-hero-frame";
import { cn } from "@/lib/cn";

// DB-backed but cacheable: dynamic route with no generateStaticParams means no
// DB access during `next build`; the page is rendered on first request, cached,
// and revalidated every 5 min or on-demand via revalidateTag(articleTag(slug)).
export const revalidate = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug: string }>;
};

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  misje:              { label: "Misje",            color: "#2f6dff" },
  astronomia:         { label: "Astronomia",        color: "#a855f7" },
  technologie:        { label: "Technologie",       color: "#38bdf8" },
  rozrywka:           { label: "Rozrywka",          color: "#f472b6" },
  "ziemia-z-kosmosu": { label: "Ziemia z kosmosu", color: "#22c55e" },
  iss:                { label: "ISS",               color: "#ffb830" },
  ai:                 { label: "AI",                color: "#e879f9" },
};

const CATEGORY_FALLBACK: Record<string, string> = {
  misje: `
    radial-gradient(ellipse at 50% 92%, rgba(255,130,30,0.72) 0%, rgba(225,70,0,0.34) 15%, transparent 40%),
    linear-gradient(180deg, #060c16 0%, #0a1320 52%, #07090c 100%)`,
  astronomia: `
    radial-gradient(ellipse at 56% 46%, rgba(168,20,240,0.46) 0%, rgba(90,10,205,0.22) 28%, transparent 56%),
    linear-gradient(135deg, #05070f 0%, #0b0514 100%)`,
  technologie: `
    radial-gradient(ellipse at 50% 94%, rgba(90,140,255,0.34) 0%, transparent 36%),
    linear-gradient(160deg, #050a13 0%, #070e1a 100%)`,
  rozrywka: `
    radial-gradient(ellipse at 55% 40%, rgba(244,114,182,0.42) 0%, transparent 52%),
    linear-gradient(145deg, #120810 0%, #0a0610 100%)`,
  "ziemia-z-kosmosu": `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
  iss: `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
  ai: `
    radial-gradient(ellipse at 40% 50%, rgba(232,121,249,0.4) 0%, transparent 50%),
    linear-gradient(135deg, #0a0612 0%, #12081a 100%)`,
};

function catMeta(c: string) {
  return CATEGORY_META[c] ?? { label: c, color: "#2f6dff" };
}
function catFallback(c: string) {
  return CATEGORY_FALLBACK[c] ?? CATEGORY_FALLBACK.technologie;
}

// ─── Per-article SEO ─────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return { title: "Artykuł nie znaleziony", robots: SEO_NOINDEX };
  }
  const canonical = `${getSiteUrl()}/aktualnosci/${slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image, width: 1280, height: 720 }],
      type: "article",
      locale: "pl_PL",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

// ─── Sidebar: related mini-card ───────────────────────────────────────────────

function RelatedMiniCard({ article }: { article: NewsArticle }) {
  const meta = catMeta(article.category);
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group flex overflow-hidden rounded-xl border border-hairline bg-space-card"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div>
          <span
            className="mb-1.5 flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: meta.color }}
          >
            <span className="h-1 w-1 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </span>
          <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan">
            {article.title}
          </p>
        </div>
        <span className="mt-2 text-[10px] text-text-muted">{article.timeLabel}</span>
      </div>
      <div
        className="img-sheen relative w-[80px] shrink-0 self-stretch overflow-hidden min-h-[80px]"
        style={{ background: catFallback(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt={article.title}
          fallbackSeed={article.slug}
          fallbackCategory={article.category}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />
      </div>
    </Link>
  );
}

// ─── Bottom strip: full editorial card ───────────────────────────────────────

function RelatedCard({ article }: { article: NewsArticle }) {
  const meta = catMeta(article.category);
  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="surface-interactive group relative flex flex-col overflow-hidden rounded-xl border border-hairline"
    >
      <div
        className="img-sheen relative h-[148px] shrink-0 overflow-hidden"
        style={{ background: catFallback(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt={article.title}
          fallbackSeed={article.slug}
          fallbackCategory={article.category}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: "linear-gradient(to top, #0c1018 6%, transparent 100%)" }}
        />
      </div>
      <div className="-mt-px border-t border-hairline bg-space-card px-3.5 pb-4 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <span
            className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: meta.color }}
          >
            <span className="h-1 w-1 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </span>
          <span className="text-[10px] text-text-muted">{article.timeLabel}</span>
        </div>
        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

// ─── Article body + sidebar ───────────────────────────────────────────────────
// id="article-body" is used by StickyArticleBar to measure reading progress.

function SidebarRelatedArticles({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="article-panel card-surface p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="h-3.5 w-[3px] shrink-0 rounded-full bg-accent-blue"
          style={{ boxShadow: "0 0 10px rgba(47,109,255,0.45)" }}
        />
        <h2 className="overline text-text-secondary">Powiązane artykuły</h2>
      </div>
      <div className="flex flex-col gap-3">
        {articles.map((a) => (
          <RelatedMiniCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}

function ArticleBody({
  article,
  sidebarRelated,
  weaveCandidates,
}: {
  article: NewsArticle;
  sidebarRelated: NewsArticle[];
  weaveCandidates: import("@/lib/article/weave-internal-links").InternalLinkCandidate[];
}) {
  const meta = catMeta(article.category);

  const sidebar = (
    <>
      <ArticleInfoPanel
        article={article}
        categoryLabel={meta.label}
        categoryColor={meta.color}
      />
      <SidebarRelatedArticles articles={sidebarRelated} />
    </>
  );

  return (
    <div className="border-b border-hairline bg-[#05070d]">
      <div className={cn(ARTICLE_SHELL, "py-5 sm:py-7 lg:py-8")}>
        <div className={ARTICLE_PAGE_GRID}>
          <div className="min-w-0">
            <ArticleHeroMobileMeta
              article={article}
              showBreadcrumb
              breadcrumbOnly
            />
            <ArticleHeroMobileMeta
              article={article}
              showBreadcrumb={false}
              className="mt-4 xl:mt-5"
            />
            <ArticleInfoPanel
              article={article}
              categoryLabel={meta.label}
              categoryColor={meta.color}
              className="mt-5 xl:hidden"
            />

            <div
              id="article-body"
              className="reveal py-6 max-sm:py-5 sm:py-8 xl:pt-8"
            >
              <ArticlePageBodyMain
                article={article}
                weaveCandidates={weaveCandidates}
                layout="in-grid"
                articleId={article.id}
              />
              <div className="mt-6 xl:hidden">
                <SidebarRelatedArticles articles={sidebarRelated} />
              </div>
            </div>
          </div>

          <aside className="hidden flex-col gap-4 xl:flex xl:sticky xl:top-[5.25rem] xl:max-h-[calc(100vh-5.5rem)] xl:overflow-y-auto xl:overscroll-contain">
            {sidebar}
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Return-loop band ─────────────────────────────────────────────────────────
// Visual "chapter break" between article body and the next-read strip.
// Reinforces the feed → article → feed loop.

function ReturnBand({ category }: { category: string }) {
  const meta = catMeta(category);
  return (
    <ArticleMainColumnShell shellClassName="mb-5">
      <div
        className="article-panel flex flex-col items-start justify-between gap-4 rounded-2xl border border-hairline px-6 py-5 sm:flex-row sm:items-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0) 100%)",
        }}
      >
        <div>
          <p className="overline mb-1 text-text-muted">Koniec artykułu</p>
          <p className="text-[14px] font-medium text-text-secondary">
            Więcej z kategorii{" "}
            <span className="font-semibold" style={{ color: meta.color }}>
              {meta.label}
            </span>{" "}
            i inne tematy
          </p>
        </div>

        <Link
          href="/aktualnosci"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-blue px-5 py-2.5 text-[12.5px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover hover:shadow-[0_8px_24px_-8px_rgba(47,109,255,0.7)] active:scale-[0.97]"
        >
          <ArrowLeft size={13} />
          Wróć do kanału
        </Link>
      </div>
    </ArticleMainColumnShell>
  );
}

// ─── "Powiązane artykuły" strip ───────────────────────────────────────────────
// Uses `reveal` class so it scroll-animates in — reinforces the spatial loop.

function RelatedArticlesStrip({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;
  return (
    <ArticleMainColumnShell shellClassName="pb-14 reveal">
      <div className="article-panel card-surface p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="h-3.5 w-[3px] shrink-0 rounded-full"
              style={{
                background: "#38bdf8",
                boxShadow: "0 0 10px rgba(56,189,248,0.45)",
              }}
            />
            <h2 className="overline text-text-secondary">Powiązane artykuły</h2>
          </div>
          <Link
            href="/aktualnosci"
            className="group flex items-center gap-1 text-[12px] font-medium text-text-tertiary transition-colors duration-300 hover:text-text-primary"
          >
            Wszystkie artykuły
            <ChevronRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <RelatedCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </ArticleMainColumnShell>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // In-body links use their own ranking — do NOT exclude „Czytaj dalej” (same pool
  // was leaving long articles with 0–1 weave candidate on prod).
  const readNextList = await getReadNextArticles(article);

  const [allRelated, weaveCandidates] = await Promise.all([
    getRelatedArticles(article, 6),
    getWeaveInternalLinkCandidates(article),
  ]);

  const reservedIds = new Set<string>([article.id]);
  for (const a of weaveCandidates) reservedIds.add(a.id);
  for (const a of readNextList) reservedIds.add(a.id);

  const sidebarRelated = allRelated
    .filter((a) => !reservedIds.has(a.id))
    .slice(0, 3);
  for (const a of sidebarRelated) reservedIds.add(a.id);

  const stripRelated = allRelated.filter((a) => !reservedIds.has(a.id));

  return (
    <>
      <JsonLd data={buildArticleJsonLd(article)} />
      <Navbar />
      {/* Reading context bar — appears after hero scroll, tracks article progress */}
      <StickyArticleBar title={article.title} category={article.category} slug={article.slug} />
      <main className={cn("relative z-[1]", ARTICLE_PAGE_MAIN_OFFSET_CLASS)}>
        <div className={cn(ARTICLE_SHELL, "mt-1")}>
          <div className={ARTICLE_HERO_SHELL_WRAP}>
            <ArticlePageHero article={article} embedded />
          </div>
        </div>
        <ArticleBody
          article={article}
          sidebarRelated={sidebarRelated}
          weaveCandidates={weaveCandidates}
        />
        <ArticleInteractions slug={article.slug} title={article.title} />
        <ReturnBand category={article.category} />
        <ReadNextSection articles={readNextList} category={article.category} />
        <RelatedArticlesStrip articles={stripRelated} />
      </main>
      <Footer />
    </>
  );
}
