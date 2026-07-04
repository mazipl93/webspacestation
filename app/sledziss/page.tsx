import type { Metadata } from "next";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import SledzIssPageBelowFold from "@/components/iss-globe/SledzIssPageBelowFold";
import SledzIssPageContent from "@/components/iss-globe/SledzIssPageContent";
import { ToolPageJsonLd } from "@/components/seo/InteractiveToolSeo";
import { getInteractiveTool, getRelatedTools } from "@/lib/seo/interactive-tools";
import { buildToolPageMetadata } from "@/lib/seo/tool-metadata";
import { computeIssLiveTrack, getIssTleCachedAt } from "@/lib/ops/iss-orbit";
import { computeIssPolandPasses } from "@/lib/ops/iss-poland-passes";
import { fetchN2yoVisualPasses } from "@/lib/ops/iss-passes-n2yo";

const TOOL = getInteractiveTool("iss-globe-tracker");

export const metadata: Metadata = buildToolPageMetadata(TOOL);

export const revalidate = 300;

export default async function SledzIssPage() {
  const [track, n2yoPasses] = await Promise.all([
    computeIssLiveTrack().catch(() => null),
    fetchN2yoVisualPasses(10, 10, 10).catch(() => null),
  ]);
  const polandPasses =
    n2yoPasses ?? (await computeIssPolandPasses(10, 240, true).catch(() => []));
  const passesComputedAt = getIssTleCachedAt() ?? new Date().toISOString();
  const related = getRelatedTools("iss-globe-tracker");

  return (
    <>
      <ToolPageJsonLd tool={TOOL} />
      <DiscoverPageShell
        overline="Odkrywaj"
        title={TOOL.headline}
        description={TOOL.longDescription}
        accent="#22d3ee"
      >
        <div className="min-w-0 w-full max-w-full overflow-hidden">
          <SledzIssPageContent
            initialIss={track?.iss ?? null}
            initialGlobePast={track?.globePast ?? []}
            initialGlobeFuture={track?.globeFuture ?? []}
            polandPasses={polandPasses}
            passesComputedAt={passesComputedAt}
            tleCachedAt={getIssTleCachedAt()}
          />
        </div>

        <SledzIssPageBelowFold tool={TOOL} related={related} />
      </DiscoverPageShell>
    </>
  );
}
