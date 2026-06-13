import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Map, ChevronRight, Sparkles } from "lucide-react";
import {
  OPS_LAUNCH_FEED_PAUSED_BODY,
  OPS_LAUNCH_FEED_PAUSED_TITLE,
} from "@/lib/ops/ops-outage-copy";
import DiscoverPageShell from "@/components/discover/DiscoverPageShell";
import LaunchCard from "@/components/discover/LaunchCard";
import {
  InteractiveToolsCrossLinks,
  ToolPageJsonLd,
  ToolSeoContent,
} from "@/components/seo/InteractiveToolSeo";
import { getInteractiveTool, getRelatedTools } from "@/lib/seo/interactive-tools";
import { buildToolPageMetadata } from "@/lib/seo/tool-metadata";
import { getCoreOpsData } from "@/lib/ops/get-ops-data";
import { getLaunchWssArticleLinks, linkForLaunch } from "@/lib/ops/launch-article-bridge";
import { pickPrimaryLaunch } from "@/lib/ops/launch-phase";

const TOOL = getInteractiveTool("rocket-launches");

export const metadata: Metadata = buildToolPageMetadata(TOOL);

export const revalidate = 300;

const DISCOVER_LINKS = [
  {
    href: "/kalendarz",
    label: "Harmonogram startów",
    description: "Oś czasu terminów startów rakiet",
    icon: Calendar,
  },
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
  const articleLinks = await getLaunchWssArticleLinks(ops.launches);
  const primary = pickPrimaryLaunch(ops.launches);
  const related = getRelatedTools("rocket-launches");

  return (
    <>
      <ToolPageJsonLd tool={TOOL} />
      <DiscoverPageShell
        overline="Odkrywaj"
        title={TOOL.headline}
        description={TOOL.longDescription}
        accent="#38bdf8"
      >
        <section aria-labelledby="launches-heading">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id="launches-heading"
              className="text-[13px] font-bold uppercase tracking-[0.12em] text-text-primary"
            >
              Nadchodzące starty
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ops.launches.length === 0 ? (
              <div className="card-surface col-span-full rounded-xl border border-hairline p-6 sm:p-8">
                <p className="text-[13px] font-semibold text-text-primary">
                  {OPS_LAUNCH_FEED_PAUSED_TITLE}
                </p>
                <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-text-tertiary">
                  {OPS_LAUNCH_FEED_PAUSED_BODY}
                </p>
              </div>
            ) : (
              ops.launches.map((launch) => {
                const isHero = launch.id === primary?.id;
                return (
                  <div
                    key={launch.id}
                    className={isHero ? "sm:col-span-2" : undefined}
                  >
                    <LaunchCard
                      launch={launch}
                      variant="featured"
                      wssArticle={linkForLaunch(launch.id, articleLinks)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          tools={related}
          currentPath={TOOL.path}
          className="mt-10"
        />

        <ToolSeoContent tool={TOOL} className="mt-10 border-t border-hairline pt-8" />
      </DiscoverPageShell>
    </>
  );
}
