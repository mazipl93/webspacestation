import { Suspense } from "react";
import OpsAuroraShowcase from "@/components/discover/OpsAuroraShowcase";
import OpsIssGlobeTeaser from "@/components/iss-globe/OpsIssGlobeTeaser";
import OpsIssShowcase from "@/components/discover/OpsIssShowcase";
import OpsLaunchFeedPaused from "@/components/discover/OpsLaunchFeedPaused";
import OpsLaunchShowcase from "@/components/discover/OpsLaunchShowcase";
import OpsQuickNav from "@/components/discover/OpsQuickNav";
import { getHomepageAuroraSnapshot } from "@/lib/aurora/homepage-snapshot";
import type { AuroraHomepageSnapshot } from "@/lib/aurora/homepage-snapshot";
import { cn } from "@/lib/cn";
import { isOpsLaunchImminent } from "@/lib/ops/ops-widget-utils";
import { pickPrimaryLaunch } from "@/lib/ops/launch-phase";
import { getHomepageOpsData } from "@/lib/ops/get-ops-data";
import { computeIssLiveTrack } from "@/lib/ops/iss-orbit";
import type { GlobePoint } from "@/lib/ops/iss-globe-geo";
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
  aurora,
  globePast,
  globeFuture,
}: {
  launches: Awaited<ReturnType<typeof getHomepageOpsData>>["launches"];
  recentLaunches: Awaited<ReturnType<typeof getHomepageOpsData>>["recentLaunches"];
  iss: Awaited<ReturnType<typeof getHomepageOpsData>>["iss"];
  live: boolean;
  wssArticle: LaunchWssArticleLink | null;
  aurora: AuroraHomepageSnapshot | null;
  globePast: GlobePoint[];
  globeFuture: GlobePoint[];
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
          <span className="ops-widget-shell__title">Centrum operacyjne</span>
          {live && (
            <span className="ops-widget-shell__live-pill">
              <span className="live-dot shrink-0" aria-hidden />
              Na żywo
            </span>
          )}
        </header>

        <div className="ops-widget-grid">
          <div className="ops-widget-main">
            {next ? (
              <OpsLaunchShowcase
                launch={next}
                live={live}
                imminent={imminent}
                upcomingCount={Math.max(0, launches.length - 1)}
                upNext={upNext ?? null}
                recentCompleted={recentLaunches[0] ?? null}
                wssArticle={wssArticle}
                hideLiveBadge
              />
            ) : (
              <OpsLaunchFeedPaused />
            )}

            <OpsAuroraShowcase
              initialSnapshot={aurora}
              className="ops-aurora-showcase--slot"
            />
          </div>

          <aside className="ops-widget-side">
            <OpsIssShowcase initialIss={iss} passLimit={4} />
            <OpsQuickNav exclude={["/mapa", "/sledziss"]} />
          </aside>
        </div>

        {iss ? (
          <OpsIssGlobeTeaser
            initialIss={iss}
            initialGlobePast={globePast}
            initialGlobeFuture={globeFuture}
            className="mt-3"
          />
        ) : null}
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
  const [ops, aurora] = await Promise.all([
    getHomepageOpsData(),
    getHomepageAuroraSnapshot(),
  ]);
  const hasLaunches = ops.launches.length > 0;
  const hasIss = ops.iss != null;
  if (!hasLaunches && !hasIss) return null;

  const track = hasIss
    ? await computeIssLiveTrack({
        minutesBefore: 28,
        minutesAfter: 28,
        stepSeconds: 55,
      }).catch(() => null)
    : null;

  const articleLinks = hasLaunches
    ? await getLaunchWssArticleLinks(ops.launches)
    : new Map<string, LaunchWssArticleLink>();
  const next = hasLaunches ? pickPrimaryLaunch(ops.launches) : null;
  /** Ta sama pozycja co ground track — marker i kamera startują bez skoku. */
  const iss = track?.iss ?? ops.iss;

  return (
    <HomepageOpsStripView
      launches={ops.launches}
      recentLaunches={ops.recentLaunches}
      iss={iss}
      live={ops.live}
      wssArticle={next ? linkForLaunch(next.id, articleLinks) : null}
      aurora={aurora}
      globePast={track?.globePast ?? []}
      globeFuture={track?.globeFuture ?? []}
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
