import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, ChevronRight } from "lucide-react";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import OpsMissionMap from "@/components/discover/OpsMissionMap";
import {
  InteractiveToolsCrossLinks,
  ToolPageJsonLd,
  ToolSeoContent,
} from "@/components/seo/InteractiveToolSeo";
import { getInteractiveTool, getRelatedTools } from "@/lib/seo/interactive-tools";
import { buildToolPageMetadata } from "@/lib/seo/tool-metadata";
import { getMapOpsData } from "@/lib/ops/get-ops-data";

const TOOL = getInteractiveTool("iss-tracker");

export const metadata: Metadata = buildToolPageMetadata(TOOL);

export const revalidate = 300;

export default async function MapaPage() {
  const ops = await getMapOpsData();
  const related = getRelatedTools("iss-tracker");

  return (
    <>
      <ToolPageJsonLd tool={TOOL} />
      <DiscoverPageShell
        overline="Odkrywaj"
        title={TOOL.headline}
        description={TOOL.longDescription}
        accent="#a78bfa"
      >
        <div className="ops-mapa-page min-w-0 w-full max-w-full overflow-hidden">
          <OpsMissionMap
            pins={ops.mapPins}
            iss={ops.iss}
            issOrbit={ops.issOrbit}
            layout="stack"
            interactive
            mapClassName="ops-map-page-map"
            followIss={!!ops.iss}
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
              Harmonogram startów rakiet
              <ChevronRight size={14} />
            </span>
            <span className="mt-1 block text-[12px] text-text-tertiary">
              Odliczanie do startu i pełna lista misji
            </span>
          </span>
        </Link>

        <InteractiveToolsCrossLinks
          tools={related}
          currentPath={TOOL.path}
          className="mt-10"
        />

        <ToolSeoContent tool={TOOL} className="mt-10 border-t border-hairline pt-8" />
      </DiscoverPageShell>
    </>
  );
}
