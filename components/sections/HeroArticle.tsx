import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { categoryFallbackBg, getCategoryInfo } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import HeroMetaChip from "@/components/article/HeroMetaChip";

function fadeIn(delay = 0, duration = 0.75): CSSProperties {
  return {
    animation: `reveal-fade ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
  };
}

/** Lead-story hero — editorial cover + headline within the news grid. */
export default function HeroArticle({
  article,
  topPriority = false,
}: {
  article: NewsArticle;
  topPriority?: boolean;
}) {
  const meta = getCategoryInfo(article.category);
  const date = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section
      className="flex min-h-[min(68vh,640px)] flex-col overflow-hidden rounded-xl border sm:rounded-2xl lg:min-h-[540px]"
      style={
        topPriority
          ? {
              borderColor: "rgba(255,69,58,0.55)",
              boxShadow:
                "0 0 0 1px rgba(255,149,0,0.25), 0 12px 48px -12px rgba(255,69,58,0.35)",
            }
          : { borderColor: "var(--hairline)" }
      }
    >
      <div
        className="img-sheen relative min-h-[44vh] flex-1 overflow-hidden sm:min-h-[38vh] lg:min-h-[360px]"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,9,0.98) 0%, rgba(5,7,9,0.72) 38%, rgba(5,7,9,0.28) 68%, rgba(5,7,9,0.12) 100%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
          <div className="mb-3" style={fadeIn(0.04)}>
            {topPriority || article.isTopPriority ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #ff453a 0%, #ff9500 100%)",
                  boxShadow: "0 0 16px rgba(255,69,58,0.5)",
                }}
              >
                <span className="live-dot" style={{ background: "#fff" }} />
                Główny temat
              </span>
            ) : article.isBreaking ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-live px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:text-[11px]">
                <span className="live-dot" style={{ background: "#fff" }} />
                Ważne
              </span>
            ) : null}
          </div>

          <div
            className="mb-3 flex flex-wrap items-center gap-2"
            style={fadeIn(0.08)}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] shadow-[0_2px_12px_rgba(0,0,0,0.45)] backdrop-blur-md"
              style={{
                color: meta.color,
                borderColor: `${meta.color}55`,
                background: "rgba(0,0,0,0.55)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: meta.color }}
              />
              {meta.label}
            </span>
            <HeroMetaChip icon={Calendar}>{date}</HeroMetaChip>
            <HeroMetaChip icon={Clock}>
              {article.readTime ?? 3} min czytania
            </HeroMetaChip>
          </div>

          <Link
            href={`/aktualnosci/${article.slug}`}
            className="group block"
            style={fadeIn(0.12)}
          >
            <h1
              className="line-clamp-4 max-w-[min(100%,42rem)] break-words text-balance font-extrabold text-text-primary transition-colors duration-300 group-hover:text-accent-cyan sm:line-clamp-3"
              style={{
                fontSize: "clamp(1.25rem, 3.5vw, 2.125rem)",
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
                textShadow: "0 2px 40px rgba(0,0,0,0.6)",
              }}
            >
              {article.title}
            </h1>
          </Link>
        </div>
      </div>

      <div className="border-t border-hairline bg-space-card px-4 py-5 sm:px-7 sm:py-6">
        <p
          className="mb-5 max-w-none leading-relaxed text-text-secondary sm:max-w-[920px]"
          style={{
            fontSize: "clamp(1.0625rem, 2.8vw, 1.125rem)",
            lineHeight: 1.65,
            ...fadeIn(0.2),
          }}
        >
          {article.excerpt}
        </p>

        <div style={fadeIn(0.28)}>
          <Link
            href={`/aktualnosci/${article.slug}`}
            className="group flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-accent-blue px-5 py-3.5 text-[16px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover hover:shadow-[0_8px_30px_-8px_rgba(47,109,255,0.7)] active:scale-[0.97] sm:inline-flex sm:w-auto sm:text-[15px]"
          >
            Czytaj artykuł
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-0.5 sm:h-4 sm:w-4"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
