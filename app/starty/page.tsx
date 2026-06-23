import type { Metadata } from "next";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import StartyLaunchFeed from "@/components/discover/StartyLaunchFeed";
import StartyPageBelowFold from "@/components/discover/StartyPageBelowFold";
import StartyPageTabsClient from "@/components/discover/StartyPageTabsClient";
import { ToolPageJsonLd } from "@/components/seo/InteractiveToolSeo";
import {
  OPS_LAUNCH_FEED_PAUSED_BODY,
  OPS_LAUNCH_FEED_PAUSED_TITLE,
} from "@/lib/ops/ops-outage-copy";
import { getInteractiveTool, getRelatedTools } from "@/lib/seo/interactive-tools";
import { buildToolPageMetadata } from "@/lib/seo/tool-metadata";
import { getCoreOpsData } from "@/lib/ops/get-ops-data";
import { getLaunchWssArticleLinks } from "@/lib/ops/launch-article-bridge";
import { pickPrimaryLaunch } from "@/lib/ops/launch-phase";
import { getPublishedLaunchNewsArticles } from "@/lib/server/articles";

const TOOL = getInteractiveTool("rocket-launches");

export const metadata: Metadata = buildToolPageMetadata(TOOL);

export const revalidate = 300;

export default async function StartyPage() {
  const ops = await getCoreOpsData();
  const [articleLinks, launchNews] = await Promise.all([
    getLaunchWssArticleLinks(ops.launches),
    getPublishedLaunchNewsArticles(6),
  ]);
  const primary = pickPrimaryLaunch(ops.launches);

  const listaPanel =
    ops.launches.length === 0 ? (
      <div className="card-surface rounded-xl border border-hairline p-6 sm:p-8">
        <p className="text-[15px] font-semibold text-text-primary">
          {OPS_LAUNCH_FEED_PAUSED_TITLE}
        </p>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-text-tertiary">
          {OPS_LAUNCH_FEED_PAUSED_BODY}
        </p>
      </div>
    ) : (
      <StartyLaunchFeed
        launches={ops.launches}
        primaryId={primary?.id}
        articleLinks={articleLinks}
      />
    );

  return (
    <>
      <ToolPageJsonLd tool={TOOL} />
      <DiscoverPageShell
        overline="Odkrywaj"
        title={TOOL.headline}
        description={TOOL.longDescription}
        accent="#38bdf8"
      >
        <StartyPageTabsClient listaPanel={listaPanel} />

        <StartyPageBelowFold
          tool={TOOL}
          related={getRelatedTools("rocket-launches")}
          launchNews={launchNews}
        />
      </DiscoverPageShell>
    </>
  );
}
