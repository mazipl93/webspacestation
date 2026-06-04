import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, ChevronRight } from "lucide-react";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import OpsMissionMap from "@/components/discover/OpsMissionMap";
import { getMapOpsData } from "@/lib/ops/get-ops-data";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Mapa startów i ISS",
  description:
    "Gdzie dziś leci Międzynarodowa Stacja Kosmiczna i skąd startują nadchodzące rakiety — mapa Ziemi z danymi Launch Library i trackera ISS.",
  alternates: { canonical: `${getSiteUrl()}/mapa` },
};

export const revalidate = 300;

export default async function MapaPage() {
  const ops = await getMapOpsData();

  return (
    <DiscoverPageShell
      overline="Odkrywaj"
      title="Mapa startów i ISS"
      description="Satelitarna mapa Ziemi: orbita ISS (czerwona linia), pozycja stacji na żywo i platformy startowe nadchodzących rakiet — współrzędne z Launch Library i trackera ISS."
      accent="#a78bfa"
      opsLive={ops.live}
      opsFetchedAt={ops.fetchedAt}
    >
      <div className="ops-mapa-page min-w-0 w-full max-w-full overflow-hidden">
        <OpsMissionMap
          pins={ops.mapPins}
          iss={ops.iss}
          issOrbit={ops.issOrbit}
          layout="stack"
          interactive
          mapClassName="ops-map-page-map"
        />
      </div>

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
            Pełna lista z odliczaniem do startu
          </span>
        </span>
      </Link>
    </DiscoverPageShell>
  );
}
