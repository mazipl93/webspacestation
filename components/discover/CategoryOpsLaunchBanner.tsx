import { Suspense } from "react";
import OpsLaunchShowcase from "@/components/discover/OpsLaunchShowcase";
import OpsQuickNav from "@/components/discover/OpsQuickNav";
import { cn } from "@/lib/cn";
import { isOpsLaunchImminent } from "@/lib/ops/ops-widget-utils";
import { pickPrimaryLaunch } from "@/lib/ops/launch-phase";
import { getHomepageOpsData } from "@/lib/ops/get-ops-data";
import {
  getLaunchWssArticleLinks,
  linkForLaunch,
  type LaunchWssArticleLink,
} from "@/lib/ops/launch-article-bridge";

function CategoryOpsLaunchBannerView({
  launches,
  recentLaunches,
  live,
  wssArticle,
}: {
  launches: Awaited<ReturnType<typeof getHomepageOpsData>>["launches"];
  recentLaunches: Awaited<ReturnType<typeof getHomepageOpsData>>["recentLaunches"];
  live: boolean;
  wssArticle: LaunchWssArticleLink | null;
}) {
  const next = pickPrimaryLaunch(launches);
  if (!next) return null;

  const imminent = isOpsLaunchImminent(next.net);
  const upNext = launches.find((l) => l.id !== next.id);

  return (
    <aside
      className={cn(
        "category-ops-banner mb-8",
        imminent && "category-ops-banner--imminent",
      )}
      aria-label="Harmonogram startów na żywo"
    >
      <div className="ops-widget-shell ops-widget-shell--compact">
        <header className="ops-widget-shell__header ops-widget-shell__header--compact">
          <span className="ops-widget-shell__kicker">Odkrywaj WSS</span>
          <span className="ops-widget-shell__title">Starty na żywo</span>
        </header>

        <OpsLaunchShowcase
          launch={next}
          live={live}
          imminent={imminent}
          upcomingCount={Math.max(0, launches.length - 1)}
          upNext={upNext ?? null}
          recentCompleted={recentLaunches[0] ?? null}
          wssArticle={wssArticle}
        />

        <OpsQuickNav layout="row" className="mt-3" />
      </div>
    </aside>
  );
}

function CategoryOpsLaunchBannerSkeleton() {
  return (
    <div className="category-ops-banner mb-8 animate-pulse" aria-hidden>
      <div className="ops-widget-shell ops-widget-shell--compact ops-widget-shell--skeleton h-[260px] sm:h-[220px]" />
    </div>
  );
}

async function CategoryOpsLaunchBannerLoader() {
  const ops = await getHomepageOpsData();
  if (ops.launches.length === 0) return null;

  const articleLinks = await getLaunchWssArticleLinks(ops.launches);
  const next = pickPrimaryLaunch(ops.launches);

  return (
    <CategoryOpsLaunchBannerView
      launches={ops.launches}
      recentLaunches={ops.recentLaunches}
      live={ops.live}
      wssArticle={next ? linkForLaunch(next.id, articleLinks) : null}
    />
  );
}

export default function CategoryOpsLaunchBanner() {
  return (
    <Suspense fallback={<CategoryOpsLaunchBannerSkeleton />}>
      <CategoryOpsLaunchBannerLoader />
    </Suspense>
  );
}
