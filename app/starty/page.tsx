import type { Metadata } from "next";
import Link from "next/link";
import { Map, ChevronRight, Sparkles } from "lucide-react";
import {
  OPS_LAUNCH_FEED_PAUSED_BODY,
  OPS_LAUNCH_FEED_PAUSED_TITLE,
} from "@/lib/ops/ops-outage-copy";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import OpsTimeline from "@/components/discover/OpsTimeline";
import StartyLaunchFeed from "@/components/discover/StartyLaunchFeed";
import StartyLaunchNewsSection from "@/components/discover/StartyLaunchNewsSection";
import {
  InteractiveToolsCrossLinks,
  ToolPageJsonLd,
  ToolSeoContent,
} from "@/components/seo/InteractiveToolSeo";
import { getInteractiveTool, getRelatedTools } from "@/lib/seo/interactive-tools";
import { buildToolPageMetadata } from "@/lib/seo/tool-metadata";
import { getCoreOpsData } from "@/lib/ops/get-ops-data";
import { getLaunchWssArticleLinks } from "@/lib/ops/launch-article-bridge";
import { pickPrimaryLaunch } from "@/lib/ops/launch-phase";
import { getPublishedLaunchNewsArticles } from "@/lib/server/articles";

const TOOL = getInteractiveTool("rocket-launches");

export const metadata: Metadata = buildToolPageMetadata(TOOL);

export const revalidate = 300;

const DISCOVER_LINKS = [
  {
    href: "/mapa",
    label: "ISS tracker na żywo",
    description: "Pozycja stacji kosmicznej i mapa startów",
    icon: Map,
  },
  {
    href: "/zorza",
    label: "Terminal zorzy polarnej",
    description: "Indeks Kp i prognoza zorzy na żywo",
    icon: Sparkles,
  },
] as const;

export default async function StartyPage() {
  const ops = await getCoreOpsData();
  const [articleLinks, launchNews] = await Promise.all([
    getLaunchWssArticleLinks(ops.launches),
    getPublishedLaunchNewsArticles(6),
  ]);
  const primary = pickPrimaryLaunch(ops.launches);

  return (
    <>
      <ToolPageJsonLd tool={TOOL} />
      <DiscoverPageShell
        overline="Odkrywaj"
        title={TOOL.headline}
        description={TOOL.longDescription}
        accent="#38bdf8"
      >
        {ops.launches.length === 0 ? (
          <div className="card-surface rounded-xl border border-hairline p-6 sm:p-8">
            <p className="text-[13px] font-semibold text-text-primary">
              {OPS_LAUNCH_FEED_PAUSED_TITLE}
            </p>
            <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-text-tertiary">
              {OPS_LAUNCH_FEED_PAUSED_BODY}
            </p>
          </div>
        ) : (
          <StartyLaunchFeed
            launches={ops.launches}
            primaryId={primary?.id}
            articleLinks={articleLinks}
          />
        )}

        <section
          id="harmonogram"
          className="mt-10 scroll-mt-28"
          aria-labelledby="starty-harmonogram-heading"
        >
          <h2
            id="starty-harmonogram-heading"
            className="mb-4 text-[18px] font-semibold text-text-primary sm:text-[20px]"
          >
            Harmonogram startów
          </h2>
          <OpsTimeline events={ops.calendar} variant="page" />
        </section>

        <StartyLaunchNewsSection articles={launchNews} />

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

        <InteractiveToolsCrossLinks
          tools={getRelatedTools("rocket-launches")}
          currentPath={TOOL.path}
          className="mt-10"
        />

        <ToolSeoContent tool={TOOL} className="mt-10 border-t border-hairline pt-8" />
      </DiscoverPageShell>
    </>
  );
}
