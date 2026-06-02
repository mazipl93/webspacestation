import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import type { NewsArticle } from "@/types";
import {
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/articles";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StickyArticleBar from "@/components/article/StickyArticleBar";
import ArticleInteractions from "@/components/article/ArticleInteractions";
import ArticleEditButton from "@/components/article/ArticleEditButton";
import SourceAttribution from "@/components/article/SourceAttribution";
import WssContextBox from "@/components/article/WssContextBox";
import CoverImageCredit from "@/components/article/CoverImageCredit";
import { getArticleBodyParagraphs } from "@/lib/articles/display-content";

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

// Reusable animation shorthand — reuses the reveal-fade @keyframes from globals.css
function fadeIn(delay = 0, duration = 0.75): CSSProperties {
  return {
    animation: `reveal-fade ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
  };
}

// ─── Per-article SEO ─────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artykuł nie znaleziony" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.imageUrl, width: 1280, height: 720 }],
      type: "article",
      locale: "pl_PL",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.imageUrl],
    },
  };
}

// ─── Article Hero ─────────────────────────────────────────────────────────────
// Layout mirrors the homepage Hero: same layering system (base → photo →
// gradient scrims), same container, same token usage. The content stagger
// (0.05 → 0.1 → 0.18 → 0.28s) creates the editorial "materialise" entry feel.

function ArticleHero({ article }: { article: NewsArticle }) {
  const meta = catMeta(article.category);
  const date = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative flex min-h-[68vh] items-end overflow-hidden">
      {/* Layer 0 — deep space base */}
      <div
        className="absolute inset-0 -z-40"
        style={{
          background:
            "linear-gradient(160deg, #04080f 0%, #060c18 35%, #050a16 60%, #04080d 100%)",
        }}
      />

      {/* Layer 1 — article photograph (same reveal technique as homepage hero) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30"
        style={{ background: catFallback(article.category) }}
      >
        <Image
          src={article.imageUrl}
          alt={
            article.imageCredit ??
            (article.source
              ? `Ilustracja — materiał ${article.source}`
              : article.title)
          }
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {article.imageCredit ? (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[rgba(5,7,9,0.92)] to-transparent px-4 pb-3 pt-10 sm:px-6">
            <CoverImageCredit
              credit={article.imageCredit}
              source={article.source}
              originalUrl={article.originalUrl}
            />
          </div>
        ) : null}
      </div>

      {/* Layer 2 — cinematic depth scrims */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(to top, rgba(5,7,9,0.97) 0%, rgba(5,7,9,0.82) 26%, rgba(5,7,9,0.46) 52%, rgba(5,7,9,0.16) 100%)",
        }}
      />
      {/* Left-side scrim for headline legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 -z-20 w-4/5"
        style={{
          background:
            "linear-gradient(to right, rgba(4,7,12,0.72) 0%, transparent 100%)",
        }}
      />

      {/* Content — staggered fade-in on entry */}
      <div className="container-site relative w-full pb-12 pt-28">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-[11px] text-text-tertiary"
          style={fadeIn(0.04)}
        >
          <Link
            href="/"
            className="transition-colors duration-200 hover:text-text-primary"
          >
            WSS
          </Link>
          <ChevronRight size={11} className="opacity-40" />
          <Link
            href="/aktualnosci"
            className="transition-colors duration-200 hover:text-text-primary"
          >
            Aktualności
          </Link>
          <ChevronRight size={11} className="opacity-40" />
          <span style={{ color: meta.color }}>{meta.label}</span>
        </nav>

        {/* Breaking badge */}
        {article.isBreaking && (
          <div className="mb-4" style={fadeIn(0.08)}>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-live px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
              <span className="live-dot" style={{ background: "#fff" }} />
              Ważne
            </span>
          </div>
        )}
        {!article.isBreaking && article.originalUrl && article.source && (
          <div className="mb-4" style={fadeIn(0.08)}>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-glass px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-text-secondary">
              Ze świata
            </span>
          </div>
        )}

        {/* Headline */}
        <h1
          className="mb-5 max-w-[820px] break-words text-balance font-extrabold text-text-primary"
          style={{
            fontSize: "clamp(1.375rem, 3.5vw, 2.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            textShadow: "0 2px 40px rgba(0,0,0,0.6)",
            ...fadeIn(0.12),
          }}
        >
          {article.title}
        </h1>

        {/* Deck — the editorial standfirst that bridges card excerpt → article */}
        <p
          className="mb-6 max-w-[620px] leading-relaxed text-text-secondary"
          style={{
            fontSize: "var(--text-title-sm)",
            lineHeight: 1.55,
            textShadow: "0 1px 20px rgba(0,0,0,0.5)",
            ...fadeIn(0.2),
          }}
        >
          {article.excerpt}
        </p>

        {/* Meta row */}
        <div
          className="flex flex-wrap items-center gap-3"
          style={fadeIn(0.28)}
        >
          <span
            className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: meta.color }}
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: meta.color }}
            />
            {meta.label}
          </span>

          <span
            aria-hidden="true"
            className="h-3 w-px"
            style={{ background: "var(--hairline-strong)" }}
          />

          <span className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
            <Calendar size={11} />
            {date}
          </span>

          <span
            aria-hidden="true"
            className="h-3 w-px"
            style={{ background: "var(--hairline-strong)" }}
          />

          <span className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
            <Clock size={11} />
            {article.readTime ?? 3} min czytania
          </span>
        </div>
      </div>
    </section>
  );
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
        className="img-sheen relative w-[80px] shrink-0 overflow-hidden"
        style={{ background: catFallback(article.category) }}
      >
        <Image
          src={article.imageUrl}
          alt={article.title}
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
        <Image
          src={article.imageUrl}
          alt={article.title}
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

function ArticleBody({
  article,
  sidebarRelated,
}: {
  article: NewsArticle;
  sidebarRelated: NewsArticle[];
}) {
  const meta = catMeta(article.category);
  const fullDate = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const bodyParagraphs = getArticleBodyParagraphs(article);
  const isExternal = Boolean(article.originalUrl && article.source);
  const lead = isExternal ? null : bodyParagraphs[0] ?? article.excerpt;
  const rest = isExternal ? bodyParagraphs : bodyParagraphs.slice(lead ? 1 : 0);

  return (
    <div id="article-body" className="container-site py-10 reveal">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">

        {/* ── Main article text ── */}
        <article className="card-surface p-7 sm:p-10">
          {/*
            Prose max-width: 72ch ≈ 65-70 chars/line at 15px.
            This is the optimal editorial measure for long-form reading.
            The card padding + prose width still leave right-side breathing room
            on wide screens — intentional whitespace, not wasted space.
          */}
          <div className="max-w-[72ch]">
            {!isExternal && lead ? (
              <p
                className="mb-7 border-l-[3px] pl-5 font-medium text-text-primary"
                style={{
                  fontSize: "var(--text-body)",
                  lineHeight: 1.78,
                  borderColor: meta.color,
                }}
              >
                {lead}
              </p>
            ) : null}

            {rest.map((paragraph, i) => (
              <p
                key={i}
                className="mb-6 text-text-secondary"
                style={{ fontSize: "var(--text-body)", lineHeight: 1.8 }}
              >
                {paragraph}
              </p>
            ))}

            {isExternal && article.contextNote ? (
              <WssContextBox text={article.contextNote} />
            ) : null}

            {isExternal ? (
              <SourceAttribution article={article} />
            ) : null}
          </div>

          {/* Article end mark — full card width */}
          <div className="mt-10 flex items-center gap-4">
            <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
            <span className="overline text-text-muted">Web Space Station</span>
            <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
          </div>

          {/* Back navigation */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/aktualnosci"
              className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-glass px-4 py-2.5 text-[12.5px] font-medium text-text-secondary transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover hover:text-text-primary active:scale-[0.97]"
            >
              <ArrowLeft size={14} />
              Wróć do aktualności
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-hairline px-4 py-2.5 text-[12.5px] font-medium text-text-tertiary transition-all duration-300 hover:border-hairline-strong hover:text-text-secondary active:scale-[0.97]"
            >
              Strona główna
            </Link>
            {/* Edit affordance is resolved on the client (useAuth + CMS check)
                so this page stays statically cacheable for anonymous visitors. */}
            <ArticleEditButton articleId={article.id} />
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-4">
          {/* Article metadata */}
          <div className="card-surface p-5">
            <h2 className="overline mb-4 text-text-tertiary">Informacje</h2>
            <dl className="flex flex-col gap-3.5">
              <div>
                <dt className="mb-1 text-[10px] uppercase tracking-[0.1em] text-text-muted">
                  Kategoria
                </dt>
                <dd
                  className="flex items-center gap-1.5 text-[13px] font-semibold"
                  style={{ color: meta.color }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: meta.color }}
                  />
                  {meta.label}
                </dd>
              </div>

              <span className="h-px" style={{ background: "var(--hairline)" }} />

              <div>
                <dt className="mb-1 text-[10px] uppercase tracking-[0.1em] text-text-muted">
                  Opublikowano
                </dt>
                <dd className="capitalize text-[12px] text-text-secondary">
                  {fullDate}
                </dd>
              </div>

              <span className="h-px" style={{ background: "var(--hairline)" }} />

              <div>
                <dt className="mb-1 text-[10px] uppercase tracking-[0.1em] text-text-muted">
                  Czas czytania
                </dt>
                <dd className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                  <Clock size={12} className="text-text-muted" />
                  {article.readTime ?? 3} min
                </dd>
              </div>
            </dl>
          </div>

          {/* Sidebar related — same-category-first priority */}
          {sidebarRelated.length > 0 && (
            <div className="card-surface p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <span
                  className="h-3.5 w-[3px] shrink-0 rounded-full bg-accent-blue"
                  style={{ boxShadow: "0 0 10px rgba(47,109,255,0.45)" }}
                />
                <h2 className="overline text-text-secondary">Powiązane</h2>
              </div>
              <div className="flex flex-col gap-3">
                {sidebarRelated.map((a) => (
                  <RelatedMiniCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          )}
        </aside>
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
    <div className="container-site mb-5">
      <div
        className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-hairline px-6 py-5 sm:flex-row sm:items-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0) 100%)",
        }}
      >
        <div>
          <p
            className="overline mb-1 text-text-muted"
          >
            Koniec artykułu
          </p>
          <p className="text-[14px] font-medium text-text-secondary">
            Więcej z kategorii{" "}
            <span
              className="font-semibold"
              style={{ color: meta.color }}
            >
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
    </div>
  );
}

// ─── "Czytaj również" strip ───────────────────────────────────────────────────
// Uses `reveal` class so it scroll-animates in — reinforces the spatial loop.

function ReadAlso({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;
  return (
    <div className="container-site pb-14 reveal">
      <div className="card-surface p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="h-3.5 w-[3px] shrink-0 rounded-full"
              style={{
                background: "#38bdf8",
                boxShadow: "0 0 10px rgba(56,189,248,0.45)",
              }}
            />
            <h2 className="overline text-text-secondary">Czytaj również</h2>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {articles.map((article) => (
            <RelatedCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Fetch 6 related — sidebar takes 0-2, strip takes 3-5 (different articles
  // where possible, falls back to same 3 when < 4 related exist).
  const allRelated = await getRelatedArticles(article, 6);
  const sidebarRelated = allRelated.slice(0, 3);
  const stripRelated =
    allRelated.length > 3 ? allRelated.slice(3, 6) : allRelated.slice(0, 3);

  return (
    <>
      <Navbar />
      {/* Reading context bar — appears after hero scroll, tracks article progress */}
      <StickyArticleBar title={article.title} category={article.category} slug={article.slug} />
      <main>
        <ArticleHero article={article} />
        <ArticleBody article={article} sidebarRelated={sidebarRelated} />
        <ArticleInteractions slug={article.slug} title={article.title} />
        <ReturnBand category={article.category} />
        <ReadAlso articles={stripRelated} />
      </main>
      <Footer />
    </>
  );
}
