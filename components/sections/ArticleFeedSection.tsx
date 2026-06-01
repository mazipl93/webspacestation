import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAllArticles, getArticlesByCategory } from "@/lib/articles";
import ArticleCard from "@/components/article/ArticleCard";
import { cn } from "@/lib/cn";

// ─── Shared category metadata ─────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  misje:              { label: "Misje",            color: "#2f6dff" },
  astronomia:         { label: "Astronomia",        color: "#a855f7" },
  technologie:        { label: "Technologie",       color: "#38bdf8" },
  "ziemia-z-kosmosu": { label: "Ziemia z kosmosu", color: "#22c55e" },
  iss:                { label: "ISS",               color: "#ffb830" },
};

// Category filter strip — each entry routes to a real page
const FEED_FILTERS = [
  { label: "Wszystkie",        href: "/aktualnosci",      key: null               },
  { label: "Misje",            href: "/misje",            key: "misje"            },
  { label: "Astronomia",       href: "/astronomia",       key: "astronomia"       },
  { label: "Technologie",      href: "/technologie",      key: "technologie"      },
  { label: "Ziemia z kosmosu", href: "/ziemia-z-kosmosu", key: "ziemia-z-kosmosu" },
  { label: "ISS",              href: "/iss",              key: "iss"              },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  /** Omit for the "all articles" feed; pass a category slug for filtered views. */
  category?: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default async function ArticleFeedSection({ category }: Props) {
  const articles = category
    ? await getArticlesByCategory(category)
    : await getAllArticles();

  const meta   = category ? (CATEGORY_META[category] ?? null) : null;
  const accent = meta?.color ?? "#2f6dff";
  const title  = meta?.label ?? "Aktualności";

  const subtitle = category
    ? `Wszystkie artykuły z kategorii ${meta?.label}`
    : "Najnowsze informacje ze świata kosmosu i astronomii";

  return (
    <>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div
        className="border-b border-hairline"
        style={{
          background: `radial-gradient(ellipse 70% 140% at 0% 0%, ${accent}12 0%, transparent 56%), var(--color-space-bg)`,
        }}
      >
        <div className="container-site pb-5 pt-[96px]">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-1.5 text-[11px] text-text-tertiary"
          >
            <Link href="/" className="transition-colors duration-200 hover:text-text-primary">
              WSS
            </Link>
            <ChevronRight size={11} className="opacity-40" />
            {category ? (
              <>
                <Link
                  href="/aktualnosci"
                  className="transition-colors duration-200 hover:text-text-primary"
                >
                  Aktualności
                </Link>
                <ChevronRight size={11} className="opacity-40" />
                <span style={{ color: accent }}>{meta?.label}</span>
              </>
            ) : (
              <span className="text-text-secondary">Aktualności</span>
            )}
          </nav>

          {/* Title row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {category && (
                <span
                  className="overline mb-2 block"
                  style={{ color: accent }}
                >
                  Kategoria
                </span>
              )}
              <h1
                className="font-extrabold text-text-primary"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.06,
                }}
              >
                {title}
              </h1>
              <p className="mt-2 text-[13px] text-text-tertiary">{subtitle}</p>
            </div>

            {/* Article count badge */}
            <div
              className="flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5"
              style={{ background: "var(--glass-fill)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: accent }}
              />
              <span className="text-[12px] font-medium text-text-secondary">
                {articles.length} {articles.length === 1 ? "artykuł" : "artykułów"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Category filter strip ─────────────────────────────────────── */}
        <div className="container-site">
          <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
            {FEED_FILTERS.map((f) => {
              const isActive = f.key === (category ?? null);
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  className={cn(
                    "flex shrink-0 items-center rounded-lg px-3.5 py-2 mb-3 mt-1 text-[12.5px] font-semibold transition-all duration-300",
                    isActive
                      ? "text-white"
                      : "text-text-secondary hover:bg-glass-hover hover:text-text-primary"
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: accent,
                          boxShadow: `0 4px 16px -6px ${accent}99`,
                        }
                      : {}
                  }
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Article grid ─────────────────────────────────────────────────── */}
      <div className="container-site py-9">
        {articles.length === 0 ? (
          <div className="card-surface px-8 py-16 text-center">
            <p className="text-[14px] text-text-secondary">
              Brak artykułów w tej kategorii.
            </p>
            <Link
              href="/aktualnosci"
              className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-medium text-accent-cyan hover:underline"
            >
              Zobacz wszystkie artykuły
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
