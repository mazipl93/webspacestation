import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Map, ChevronRight } from "lucide-react";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import LaunchCard from "@/components/discover/LaunchCard";
import { getOpsData } from "@/lib/ops/get-ops-data";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Starty rakiet",
  description:
    "Harmonogram nadchodzących startów rakiet — dane Launch Library 2, odliczenia na żywo.",
  alternates: { canonical: `${getSiteUrl()}/starty` },
};

export const revalidate = 300;

const DISCOVER_LINKS = [
  {
    href: "/kalendarz",
    label: "Kalendarz wydarzeń",
    description: "Terminy startów z API",
    icon: Calendar,
  },
  {
    href: "/mapa",
    label: "Mapa misji",
    description: "ISS i wyrzutnie startowe",
    icon: Map,
  },
] as const;

export default async function StartyPage() {
  const ops = await getOpsData();

  return (
    <DiscoverPageShell
      overline="Odkrywaj"
      title="Starty rakiet"
      description="Nadchodzące starty z Launch Library 2 — operator, okno NET (UTC) i odliczenie aktualizowane co sekundę w przeglądarce."
      accent="#38bdf8"
      opsLive={ops.live}
      opsFetchedAt={ops.fetchedAt}
    >
      <section aria-labelledby="launches-heading">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="launches-heading"
            className="text-[13px] font-bold uppercase tracking-[0.12em] text-text-primary"
          >
            Nadchodzące starty
          </h2>
          <p className="text-[11px] text-text-muted">
            {ops.launches.length} pozycji · cache 5 min
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {ops.launches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} variant="featured" />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {DISCOVER_LINKS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="card-surface flex items-start gap-4 rounded-xl border border-hairline p-4 transition-colors hover:border-hairline-strong"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline bg-glass text-accent-cyan"
              aria-hidden
            >
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-[14px] font-semibold text-text-primary">
                {label}
                <ChevronRight size={14} className="opacity-60" />
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-text-tertiary">
                {description}
              </span>
            </span>
          </Link>
        ))}
      </section>
    </DiscoverPageShell>
  );
}
