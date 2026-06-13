import type { Metadata } from "next";
import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SITE_CONTAINER } from "@/lib/site-layout";
import { RSS_ALL_FEEDS } from "@/lib/rss-feeds";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Subskrypcje",
  description:
    "Subskrybuj aktualności Web Space Station — cały portal lub wybrany dział — w ulubionym czytniku newsów.",
};

export default function RssIndexPage() {
  const siteUrl = getSiteUrl();

  return (
    <>
      <Navbar />
      <main className={cn(SITE_CONTAINER, "pb-16 pt-[96px]")}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "rgba(255, 149, 0, 0.15)",
                color: "#ff9500",
              }}
            >
              <Bell size={24} aria-hidden />
            </span>
            <div>
              <h1
                className="font-extrabold text-text-primary"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.08,
                }}
              >
                Subskrypcje
              </h1>
              <p className="mt-2 text-[16px] leading-relaxed text-text-secondary md:text-[15px]">
                Otrzymuj nowe artykuły Web Space Station w Feedly, Inoreaderze
                lub aplikacji na telefonie — bez newslettera i bez logowania.
              </p>
            </div>
          </div>

          <section className="card-surface mb-8 space-y-4 p-6">
            <h2 className="text-[15px] font-bold text-text-primary">
              Jak subskrybować?
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-text-secondary">
              <li>Wybierz kanał: cały portal albo jeden dział (np. Misje).</li>
              <li>Skopiuj link subskrypcji i wklej go w czytniku jako „Dodaj subskrypcję”.</li>
              <li>Nowe artykuły pojawią się automatycznie w Twojej liście.</li>
            </ol>
            <p className="text-[13px] text-text-tertiary">
              Kanały odświeżają się co około 5 minut — tak jak strona główna.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
              Dostępne kanały
            </h2>
            <ul className="space-y-3">
              {RSS_ALL_FEEDS.map((feed) => {
                const feedUrl = `${siteUrl}${feed.path}`;
                return (
                  <li
                    key={feed.id}
                    className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary">
                        {feed.title}
                      </p>
                      <p className="mt-0.5 text-[13px] text-text-tertiary">
                        {feed.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        href={feed.path}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-hairline bg-glass px-3.5 text-[13px] font-medium text-text-primary transition-colors hover:border-accent-cyan/40"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Subskrybuj
                      </Link>
                      <Link
                        href={feed.pageHref}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-[13px] text-text-secondary transition-colors hover:text-text-primary"
                      >
                        Strona działu
                        <ExternalLink size={13} />
                      </Link>
                    </div>
                    <span className="sr-only">{feedUrl}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
