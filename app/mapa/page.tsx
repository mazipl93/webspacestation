import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, ChevronRight } from "lucide-react";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import OpsMissionMap from "@/components/discover/OpsMissionMap";
import { getOpsData } from "@/lib/ops/get-ops-data";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Mapa kosmosu",
  description:
    "Pozycja ISS na orbicie i wyrzutnie nadchodzących startów — dane na żywo i Launch Library.",
  alternates: { canonical: `${getSiteUrl()}/mapa` },
};

export const revalidate = 300;

export default async function MapaPage() {
  const ops = await getOpsData();
  const issLabel = ops.iss
    ? `${ops.iss.latitude.toFixed(2)}°, ${ops.iss.longitude.toFixed(2)}°`
    : undefined;

  return (
    <DiscoverPageShell
      overline="Odkrywaj"
      title="Mapa kosmosu"
      description="Uproszczona mapa orbitalna: pozycja Międzynarodowej Stacji Kosmicznej (Where the ISS at) oraz wyrzutnie z harmonogramu startów."
      accent="#a78bfa"
      opsLive={ops.live}
      opsFetchedAt={ops.fetchedAt}
    >
      <OpsMissionMap pins={ops.mapPins} issCoords={issLabel} height={380} />

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {ops.mapPins.map((pin) => (
          <li
            key={pin.id}
            className="flex items-center gap-2 rounded-lg border border-hairline-faint px-3 py-2 text-[12px]"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: pin.color }}
            />
            <span className="font-semibold text-text-primary">{pin.label}</span>
            <span className="text-text-muted">— {pin.sublabel}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/starty"
        className="card-surface mt-8 flex items-start gap-4 rounded-xl border border-hairline p-4"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline bg-glass text-accent-cyan">
          <Rocket size={18} />
        </span>
        <span>
          <span className="flex items-center gap-1 text-[14px] font-semibold text-text-primary">
            Harmonogram startów
            <ChevronRight size={14} />
          </span>
          <span className="mt-1 block text-[12px] text-text-tertiary">
            Pełna lista nadchodzących startów
          </span>
        </span>
      </Link>
    </DiscoverPageShell>
  );
}
