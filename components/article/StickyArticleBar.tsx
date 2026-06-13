"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BookmarkButton from "@/components/article/BookmarkButton";
import { ARTICLE_SHELL } from "@/lib/ui/article-editorial-layout";
import { cn } from "@/lib/cn";

// Mirrors the map in page.tsx — kept local so the server component is untouched
const CATEGORY_META: Record<string, { label: string; color: string }> = {
  misje:              { label: "Misje",            color: "#2f6dff" },
  astronomia:         { label: "Astronomia",        color: "#a855f7" },
  technologie:        { label: "Technologie",       color: "#38bdf8" },
  "ziemia-z-kosmosu": { label: "Ziemia z kosmosu", color: "#22c55e" },
  iss:                { label: "ISS",               color: "#ffb830" },
};

type Props = {
  title: string;
  category: string;
  slug: string;
};

/**
 * Appears beneath the fixed Navbar once the user scrolls past the article
 * hero (~360px). Shows reading context (back link, category, title) and a
 * category-coloured reading-progress bar along the bottom edge.
 *
 * Progress is measured against the #article-body element so it reflects the
 * actual article text, not the whole page.
 */
export default function StickyArticleBar({ title, category, slug }: Props) {
  const meta = CATEGORY_META[category] ?? { label: category, color: "#2f6dff" };
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const scrollY = window.scrollY;
      setVisible(scrollY > 360);

      const el = document.getElementById("article-body");
      if (!el) return;

      // article body's position in the document
      const elTop = el.getBoundingClientRect().top + scrollY;
      const elHeight = el.offsetHeight;
      const vh = window.innerHeight;

      // Start progressing when top of article body enters the viewport;
      // finish when the bottom of article body reaches viewport bottom.
      const start = elTop - vh * 0.15;
      const end   = elTop + elHeight - vh * 0.85;
      const pct   = end > start
        ? Math.min(100, Math.max(0, ((scrollY - start) / (end - start)) * 100))
        : 0;

      setProgress(pct);
    }

    window.addEventListener("scroll", update, { passive: true });
    update(); // run once on mount
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    /* sits immediately under the navbar (top: 112px = h-28) */
    <div
      className="fixed left-0 right-0 z-40"
      style={{
        top: 112,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-6px)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div
        style={{
          background: "rgba(5,7,9,0.88)",
          borderBottom: "1px solid var(--hairline)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        {/* Context row */}
        <div className={cn(ARTICLE_SHELL, "flex h-10 items-center gap-3 overflow-hidden")}>
          {/* Back link */}
          <Link
            href="/aktualnosci"
            className="flex shrink-0 items-center gap-1.5 rounded-lg py-1 text-[12px] font-medium text-text-tertiary transition-colors duration-200 hover:text-text-primary"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Aktualności</span>
          </Link>

          {/* Divider */}
          <span
            aria-hidden="true"
            className="h-3.5 w-px shrink-0"
            style={{ background: "var(--hairline-strong)" }}
          />

          {/* Category pill */}
          <span
            className="flex shrink-0 items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: meta.color }}
          >
            <span
              className="h-[5px] w-[5px] rounded-full"
              style={{ background: meta.color }}
            />
            <span>{meta.label}</span>
          </span>

          {/* Divider */}
          <span
            aria-hidden="true"
            className="h-3.5 w-px shrink-0"
            style={{ background: "var(--hairline)" }}
          />

          {/* Article title — truncated */}
          <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-text-secondary">
            {title}
          </p>

          <BookmarkButton slug={slug} variant="inline" className="ml-auto shrink-0" />
        </div>

        {/* Reading progress bar */}
        <div
          aria-hidden="true"
          className="h-[2px]"
          style={{ background: "var(--hairline-faint)" }}
        >
          <div
            className="h-full"
            style={{
              width: `${progress}%`,
              background: meta.color,
              boxShadow: `0 0 5px ${meta.color}44`,
              transition: "width 0.18s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
