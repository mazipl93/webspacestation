"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import SocialBrandIcon from "@/components/social/SocialBrandIcon";
import { cn } from "@/lib/cn";
import { WSS_SOCIAL_PRIMARY, getSocialIconColor } from "@/lib/social/wss-social-links";

type Props = {
  /** Ukryj, gdy otwarte są inne overlaye nav (menu, szukaj, powiadomienia). */
  suppressed?: boolean;
};

const SCROLL_TOP_THRESHOLD = 120;

export default function SocialMobileRail({ suppressed = false }: Props) {
  const [peek, setPeek] = useState(true);
  const [canScrollTop, setCanScrollTop] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      setCanScrollTop(y > SCROLL_TOP_THRESHOLD);

      if (y < 48) {
        setPeek(true);
      } else if (delta > 6) {
        setPeek(false);
      } else if (delta < -6) {
        setPeek(true);
      }

      lastScrollY.current = y;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hidden = suppressed || !peek;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[38] lg:hidden",
        hidden && "pointer-events-none",
      )}
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
      }}
      aria-hidden={suppressed}
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full items-center px-5 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          hidden ? "translate-y-[calc(100%+1rem)] opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        <nav
          className="wss-social-mobile-dock-chip flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.08] px-3.5 py-2 shadow-md"
          aria-label="Śledź nas w mediach społecznościowych"
        >
          {WSS_SOCIAL_PRIMARY.map((profile) => (
            <a
              key={profile.id}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={profile.ariaLabel}
              title={profile.label}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05] text-text-tertiary transition-all duration-200 hover:bg-white/[0.09] hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan active:scale-95"
              style={{ color: getSocialIconColor(profile.id) }}
            >
              <SocialBrandIcon platform={profile.id} size={18} />
            </a>
          ))}
        </nav>

        <span className="min-w-6 flex-1" aria-hidden />

        {canScrollTop ? (
          <button
            type="button"
            aria-label="Przewiń do góry strony"
            onClick={scrollToTop}
            className="wss-social-mobile-scroll-top ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-text-muted shadow-md transition-all duration-200 hover:text-text-secondary active:scale-95"
          >
            <ArrowUp size={18} strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
