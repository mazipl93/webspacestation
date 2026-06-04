import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, ChevronRight } from "lucide-react";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import OpsTimeline from "@/components/discover/OpsTimeline";
import { getOpsData } from "@/lib/ops/get-ops-data";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Harmonogram startów",
  description:
    "Terminarz nadchodzących startów rakiet z Launch Library 2 — rzeczywiste daty NET, nie plan redakcyjny.",
  alternates: { canonical: `${getSiteUrl()}/kalendarz` },
};

export const revalidate = 300;

export default async function KalendarzPage() {
  const ops = await getOpsData();

  return (
    <DiscoverPageShell
      overline="Odkrywaj"
      title="Harmonogram startów"
      description="Terminy nadchodzących startów rakiet z Launch Library (NET, UTC). Każdy wpis to konkretna rakieta i platforma startowa — bez wymyślonych misji redakcyjnych."
      accent="#2f6dff"
      opsLive={ops.live}
      opsFetchedAt={ops.fetchedAt}
    >
      <OpsTimeline events={ops.calendar} variant="page" />

      <section aria-labelledby="events-list-heading" className="mt-8">
        <h2
          id="events-list-heading"
          className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-text-primary"
        >
          Nadchodzące terminy startów
        </h2>
        <ul className="space-y-3">
          {ops.calendar.map((ev) => (
            <li
              key={ev.id}
              className="card-surface flex flex-col gap-2 rounded-xl border border-hairline px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-hairline bg-glass text-[11px] font-bold text-accent-blue"
                  aria-hidden
                >
                  {ev.quarter}
                </span>
                <div>
                  <p className="whitespace-pre-line text-[14px] font-semibold leading-snug text-text-primary">
                    {ev.title}
                  </p>
                  {ev.hint && (
                    <p className="mt-1 text-[12px] text-text-tertiary">{ev.hint}</p>
                  )}
                </div>
              </div>
              {ev.active && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-accent-blue">
                  Najbliższy start
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Link
        href="/starty"
        className="card-surface mt-8 flex items-start gap-4 rounded-xl border border-hairline p-4 transition-colors hover:border-hairline-strong"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline bg-glass text-accent-cyan"
          aria-hidden
        >
          <Rocket size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[14px] font-semibold text-text-primary">
            Starty rakiet
            <ChevronRight size={14} className="opacity-60" />
          </span>
          <span className="mt-1 block text-[12px] leading-relaxed text-text-tertiary">
            Odliczenia do startu w czasie rzeczywistym
          </span>
        </span>
      </Link>
    </DiscoverPageShell>
  );
}
