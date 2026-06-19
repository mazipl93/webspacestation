import type { Metadata } from "next";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import MapaPageBelowFold from "@/components/discover/MapaPageBelowFold";
import OpsMissionMap from "@/components/discover/OpsMissionMap";
import { ToolPageJsonLd } from "@/components/seo/InteractiveToolSeo";
import { getInteractiveTool, getRelatedTools } from "@/lib/seo/interactive-tools";
import { buildToolPageMetadata } from "@/lib/seo/tool-metadata";
import { getMapOpsData } from "@/lib/ops/get-ops-data";
import { computeIssPolandPasses } from "@/lib/ops/iss-poland-passes";
import { getIssTleCachedAt } from "@/lib/ops/iss-orbit";

const TOOL = getInteractiveTool("iss-tracker");

export const metadata: Metadata = buildToolPageMetadata(TOOL);

export const revalidate = 300;

export default async function MapaPage() {
  const [ops, polandPasses] = await Promise.all([
    getMapOpsData(),
    computeIssPolandPasses(10, 72).catch(() => []),
  ]);
  const passesComputedAt = getIssTleCachedAt() ?? new Date().toISOString();
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
            issOrbitPast={ops.issOrbitPast}
            issOrbitFuture={ops.issOrbitFuture}
            layout="map-page"
            interactive
            showPolandPasses
            mapClassName="ops-map-page-map"
            followIss={!!ops.iss}
            polandPasses={polandPasses}
            polandPassesComputedAt={passesComputedAt}
          />
        </div>

        <MapaPageBelowFold tool={TOOL} related={related} />
      </DiscoverPageShell>
    </>
  );
}
