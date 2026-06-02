import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { categoryFallbackBg, getCategoryInfo } from "@/lib/categories";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";

function fadeIn(delay = 0, duration = 0.75): CSSProperties {
  return {
    animation: `reveal-fade ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
  };
}

/** Lead-story hero — editorial cover + headline within the news grid. */
export default function HeroArticle({ article }: { article: NewsArticle }) {
  const meta = getCategoryInfo(article.category);
  const date = new Date(article.publishedAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="flex min-h-[min(68vh,640px)] flex-col overflow-hidden rounded-xl border border-hairline sm:rounded-2xl lg:min-h-[540px]">
      <div
        className="img-sheen relative min-h-[44vh] flex-1 overflow-hidden sm:min-h-[38vh] lg:min-h-[360px]"
        style={{ background: categoryFallbackBg(article.category) }}
      >
        <CoverImage
          src={article.imageUrl}
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
              "linear-gradient(to top, rgba(5,7,9,0.95) 0%, rgba(5,7,9,0.35) 45%, rgba(5,7,9,0.15) 100%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
          <div className="mb-3" style={fadeIn(0.04)}>
            {article.isBreaking ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-live px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:text-[11px]">
                <span className="live-dot" style={{ background: "#fff" }} />
                Ważne
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-blue/90 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:text-[11px]">
                Główny temat
              </span>
            )}
          </div>

          <div
            className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2"
            style={fadeIn(0.08)}
          >
            <span
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] sm:text-[11px]"
              style={{ color: meta.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: meta.color }}
              />
              {meta.label}
            </span>
            <span
              aria-hidden="true"
              className="hidden h-3 w-px sm:block"
              style={{ background: "var(--hairline-strong)" }}
            />
            <span className="flex items-center gap-1.5 text-[14px] text-text-tertiary sm:text-[14px]">
              <Calendar size={14} className="sm:h-3 sm:w-3" />
              {date}
            </span>
            <span
              aria-hidden="true"
              className="hidden h-3 w-px sm:block"
              style={{ background: "var(--hairline-strong)" }}
            />
            <span className="flex items-center gap-1.5 text-[14px] text-text-tertiary sm:text-[14px]">
              <Clock size={14} className="sm:h-3 sm:w-3" />
              {article.readTime ?? 3} min czytania
            </span>
          </div>

          <Link
            href={`/aktualnosci/${article.slug}`}
            className="group block"
            style={fadeIn(0.12)}
          >
            <h1
              className="font-extrabold text-text-primary transition-colors duration-300 group-hover:text-accent-cyan"
              style={{
                fontSize: "clamp(1.875rem, 6vw, 3.75rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
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
