"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { categoryFallbackBg, getCategoryInfo } from "@/lib/categories";
import { HERO_AUTO_MS } from "@/lib/home/hero-slides";
import type { NewsArticle } from "@/types";
import CoverImage from "@/components/article/CoverImage";
import { cn } from "@/lib/cn";

const SWIPE_THRESHOLD_PX = 48;

type Props = {
  articles: NewsArticle[];
};

export default function HomepageHeroSlider({ articles }: Props) {
  const count = articles.length;
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const pausedUntil = useRef(0);

  const goTo = useCallback(
    (next: number) => {
      if (count <= 0) return;
      const wrapped = ((next % count) + count) % count;
      setIndex(wrapped);
    },
    [count]
  );

  const pauseAuto = useCallback(() => {
    pausedUntil.current = Date.now() + HERO_AUTO_MS * 2;
  }, []);

  const step = useCallback(
    (dir: -1 | 1) => {
      pauseAuto();
      goTo(index + dir);
    },
    [goTo, index, pauseAuto]
  );

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setIndex((i) => (i + 1) % count);
    }, HERO_AUTO_MS);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  const active = articles[index]!;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-hairline",
        "max-lg:-mx-3 max-lg:rounded-none max-lg:border-x-0",
        "sm:max-lg:mx-0 sm:max-lg:rounded-2xl sm:max-lg:border"
      )}
      aria-roledescription="karuzela"
      aria-label="Wyróżnione artykuły"
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? null;
        pauseAuto();
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (start == null || count <= 1) return;
        const end = e.changedTouches[0]?.clientX ?? start;
        const delta = end - start;
        if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
        goTo(index + (delta < 0 ? 1 : -1));
      }}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",

          // 🔥 MOBILE — większy hero
"max-lg:h-[clamp(42svh,46svh,50svh)] max-lg:max-h-[50svh] max-lg:min-h-[40svh]",
"lg:aspect-[16/9] lg:h-auto lg:max-h-[min(78vh,820px)] lg:min-h-[420px]"
        )}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {articles.map((article, slideIndex) => (
            <HeroSlide
              key={article.id}
              article={article}
              showImage={slideIndex === index}
              priority={slideIndex === 0 && index === 0}
            />
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Poprzedni slajd"
              className="absolute left-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-space-card/90 text-text-primary shadow-lg backdrop-blur-md transition-colors hover:border-accent-cyan/40 hover:text-accent-cyan sm:flex"
              onClick={() => step(-1)}
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              aria-label="Następny slajd"
              className="absolute right-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-space-card/90 text-text-primary shadow-lg backdrop-blur-md transition-colors hover:border-accent-cyan/40 hover:text-accent-cyan sm:flex"
              onClick={() => step(1)}
            >
              <ChevronRight size={20} />
            </button>

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center gap-2 pb-4 pt-16 lg:pb-5"
              style={{
                background:
                  "linear-gradient(to top, rgba(5,7,9,0.92) 0%, rgba(5,7,9,0.45) 45%, transparent 100%)",
              }}
            >
              {articles.map((article, i) => (
                <button
                  key={article.id}
                  type="button"
                  aria-label={`Slajd ${i + 1}: ${article.title}`}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "pointer-events-auto rounded-full transition-all duration-300",
                    i === index
                      ? "h-1 w-7 bg-white shadow-[0_0_12px_rgba(255,255,255,0.35)]"
                      : "h-1.5 w-1.5 bg-white/35 hover:bg-white/55"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    pauseAuto();
                    goTo(i);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <span className="sr-only" aria-live="polite">
        {active.title}
      </span>
    </section>
  );
}

function HeroSlide({
  article,
  showImage = true,
  priority = false,
}: {
  article: NewsArticle;
  showImage?: boolean;
  priority?: boolean;
}) {
  const meta = getCategoryInfo(article.category);

  return (
    <Link
      href={`/aktualnosci/${article.slug}`}
      className="group relative block h-full min-w-full shrink-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{ background: categoryFallbackBg(article.category) }}
      />

      {showImage && (
        <CoverImage
          src={article.image}
          alt=""
          fill
          priority={priority}
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(5,7,9,0.98) 0%, rgba(5,7,9,0.75) 32%, rgba(5,7,9,0.2) 58%, rgba(5,7,9,0.08) 100%)",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <h2 className="font-extrabold text-text-primary">
          {article.title}
        </h2>

        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-text-secondary">
          <Clock size={13} />
          {article.readTime ?? 3} min czytania
        </p>
      </div>
    </Link>
  );
}
