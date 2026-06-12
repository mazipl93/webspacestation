import { Suspense } from "react";
import OpsIssShowcase from "@/components/discover/OpsIssShowcase";
import OpsLaunchFeedPaused from "@/components/discover/OpsLaunchFeedPaused";
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

function HomepageOpsStripView({
  launches,
  recentLaunches,
  iss,
  live,
  wssArticle,
}: {
  launches: Awaited<ReturnType<typeof getHomepageOpsData>>["launches"];
  recentLaunches: Awaited<ReturnType<typeof getHomepageOpsData>>["recentLaunches"];
  iss: Awaited<ReturnType<typeof getHomepageOpsData>>["iss"];
  live: boolean;
  wssArticle: LaunchWssArticleLink | null;
}) {
  const next = pickPrimaryLaunch(launches);
  const imminent = next ? isOpsLaunchImminent(next.net) : false;
  const upNext = next ? launches.find((l) => l.id !== next.id) : null;

  return (
    <section
      className={cn(
        "homepage-ops-strip reveal mt-4 sm:mt-5",
        imminent && "homepage-ops-strip--imminent",
      )}
      aria-label="Centrum operacyjne, starty i ISS"
    >
      <div className="ops-widget-shell">
        <header className="ops-widget-shell__header">
          <span className="ops-widget-shell__kicker">Na żywo z kosmosu</span>
          <span className="ops-widget-shell__title">Centrum operacyjne</span>
        </header>

        <div className="ops-widget-grid">
          {next ? (
            <OpsLaunchShowcase
              launch={next}
              live={live}
              imminent={imminent}
              upcomingCount={Math.max(0, launches.length - 1)}
              upNext={upNext ?? null}
              recentCompleted={recentLaunches[0] ?? null}
              wssArticle={wssArticle}
            />
          ) : (
            <OpsLaunchFeedPaused />
          )}

          <aside className="ops-widget-side">
            <OpsIssShowcase initialIss={iss} />
            <OpsQuickNav exclude={["/mapa"]} />
          </aside>
        </div>
      </div>
    </section>
  );
}

export function HomepageOpsStripSkeleton() {
  return (
    <div className="homepage-ops-strip mt-4 animate-pulse sm:mt-5" aria-hidden>
      <div className="ops-widget-shell ops-widget-shell--skeleton h-[320px] sm:h-[280px]" />
    </div>
  );
}

async function HomepageOpsStripLoader() {
  const ops = await getHomepageOpsData();
  const hasLaunches = ops.launches.length > 0;
  const hasIss = ops.iss != null;
  if (!hasLaunches && !hasIss) return null;

  const articleLinks = hasLaunches
    ? await getLaunchWssArticleLinks(ops.launches)
    : new Map<string, LaunchWssArticleLink>();
  const next = hasLaunches ? pickPrimaryLaunch(ops.launches) : null;

  return (
    <HomepageOpsStripView
      launches={ops.launches}
      recentLaunches={ops.recentLaunches}
      iss={ops.iss}
      live={ops.live}
      wssArticle={next ? linkForLaunch(next.id, articleLinks) : null}
    />
  );
}

export default function HomepageOpsStrip() {
  return (
    <Suspense fallback={<HomepageOpsStripSkeleton />}>
      <HomepageOpsStripLoader />
    </Suspense>
  );
}
