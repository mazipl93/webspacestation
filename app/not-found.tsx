import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEO_NOINDEX } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Strona nie znaleziona",
  robots: SEO_NOINDEX,
};

const QUICK_LINKS = [
  { label: "Aktualności",       href: "/aktualnosci",      accent: "#2f6dff" },
  { label: "Misje",             href: "/misje",            accent: "#2f6dff" },
  { label: "Astronomia",        href: "/astronomia",       accent: "#a855f7" },
  { label: "Technologie",       href: "/technologie",      accent: "#38bdf8" },
  { label: "Ziemia z kosmosu",  href: "/ziemia-z-kosmosu", accent: "#22c55e" },
  { label: "ISS",               href: "/iss",              accent: "#ffb830" },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-280px)] items-center justify-center pt-16">
        <div className="container-site py-20">
          <div className="mx-auto max-w-[620px]">

            {/* 404 numeral */}
            <p
              aria-hidden="true"
              className="mb-2 font-extrabold leading-none text-text-muted"
              style={{ fontSize: "clamp(5rem, 16vw, 9rem)", letterSpacing: "-0.05em" }}
            >
              404
            </p>

            {/* Heading */}
            <h1
              className="mb-3 font-extrabold text-text-primary"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "-0.03em" }}
            >
              Nie znaleziono strony
            </h1>

            <p className="mb-8 max-w-[440px] text-[14px] leading-relaxed text-text-secondary">
              Ta strona nie istnieje lub została przeniesiona. Skorzystaj z nawigacji poniżej,
              żeby wrócić do interesujących Cię treści.
            </p>

            {/* Primary CTAs */}
            <div className="mb-12 flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-accent-blue px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover hover:shadow-[0_8px_24px_-8px_rgba(47,109,255,0.6)] active:scale-[0.97]"
              >
                <ArrowLeft size={14} />
                Strona główna
              </Link>
              <Link
                href="/aktualnosci"
                className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-glass px-5 py-2.5 text-[13px] font-medium text-text-secondary transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover hover:text-text-primary active:scale-[0.97]"
              >
                Aktualności
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Quick section links */}
            <div
              className="h-px mb-6"
              style={{ background: "var(--hairline)" }}
            />
            <p className="overline mb-4 text-text-muted">Przeglądaj sekcje</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 rounded-lg border border-hairline bg-glass px-3.5 py-2 text-[12.5px] font-medium text-text-secondary transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover hover:text-text-primary"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: link.accent }}
                  />
                  {link.label}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
