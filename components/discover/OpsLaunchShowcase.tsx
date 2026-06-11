import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import OpsCountdownHero from "@/components/discover/OpsCountdownHero";
import OpsPreviewBadge from "@/components/discover/OpsPreviewBadge";
import LaunchBriefBlock from "@/components/discover/LaunchBriefBlock";
import LaunchWssArticleLink from "@/components/discover/LaunchWssArticleLink";
import { cn } from "@/lib/cn";
import { OPS_LAUNCH_IMAGE_GRADIENT } from "@/lib/ops/discover-data";
import type { LaunchWssArticleLink as WssArticleLink } from "@/lib/ops/launch-article-bridge";
import {
  providerAccent,
  shortenMissionTitle,
  upcomingLaunchLabel,
} from "@/lib/ops/ops-widget-utils";
import type { OpsLaunch } from "@/lib/ops/types";
import { launchPhaseLabel } from "@/lib/ops/launch-phase";

type Props = {
  launch: OpsLaunch;
  live: boolean;
  imminent: boolean;
  upcomingCount?: number;
  upNext?: OpsLaunch | null;
  recentCompleted?: OpsLaunch | null;
  wssArticle?: WssArticleLink | null;
  href?: string;
  className?: string;
};

function countdownCaption(phase: OpsLaunch["phase"]): string {
  if (phase === "window" || phase === "live") return "Status";
  if (phase === "hold") return "Planowany start";
  return "Start za";
}

export default function OpsLaunchShowcase({
  launch,
  live,
  imminent,
  upcomingCount = 0,
  upNext,
  recentCompleted,
  wssArticle,
  href = "/starty",
  className,
}: Props) {
  const accent = providerAccent(launch.hue);
  const showImminent =
    imminent && (launch.phase === "countdown" || launch.phase === "window");

  return (
    <div
      className={cn(
        "ops-launch-showcase group min-w-0",
        showImminent && "ops-launch-showcase--imminent",
        launch.phase === "live" && "ops-launch-showcase--live",
        className,
      )}
    >
      <Link href={href} className="block min-w-0">
        <div
          className="ops-launch-showcase__media"
          style={{ background: OPS_LAUNCH_IMAGE_GRADIENT.launchHue(launch.hue) }}
        >
        <Image
          src={launch.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="ops-launch-showcase__scrim" aria-hidden />
        <div
          aria-hidden
          className="ops-launch-showcase__glow"
          style={{ background: `radial-gradient(circle at 80% 20%, ${accent}55 0%, transparent 55%)` }}
        />

        <div className="ops-launch-showcase__top">
          <div className="flex flex-wrap items-center gap-2">
            {live ? (
              <span className="ops-launch-showcase__live">
                <span className="live-dot shrink-0" aria-hidden />
                Na żywo
              </span>
            ) : (
              <OpsPreviewBadge variant="stale" />
            )}
            {launch.statusLabel ? (
              <span className="ops-launch-showcase__status">{launch.statusLabel}</span>
            ) : null}
          </div>
          {showImminent ? (
            <span className="ops-launch-showcase__imminent">Start w ciągu 24 h</span>
          ) : null}
        </div>

        <div className="ops-launch-showcase__body">
          <div className="min-w-0 flex-1">
            <p className="ops-launch-showcase__provider" style={{ color: accent }}>
              {launch.provider}
            </p>
            <p className="ops-launch-showcase__mission">{launch.mission}</p>
            <p className="ops-launch-showcase__meta">
              {[launch.rocketName, launch.windowLabel].filter(Boolean).join(" · ")}
              {launch.netPrecisionLabel ? (
                <span className="text-white/50"> · NET ±{launch.netPrecisionLabel.toLowerCase()}</span>
              ) : null}
            </p>
            <p className="ops-launch-showcase__site">{launch.site}</p>
            {launch.brief ? (
              <LaunchBriefBlock brief={launch.brief} compact className="mt-2.5 hidden sm:block" />
            ) : null}
          </div>

          <div className="ops-launch-showcase__countdown-wrap shrink-0">
            <p className="ops-launch-showcase__countdown-label">
              {countdownCaption(launch.phase)}
            </p>
            <OpsCountdownHero
              net={launch.net}
              phase={launch.phase}
              imminent={showImminent}
            />
          </div>
        </div>
        </div>
      </Link>

      <div className="ops-launch-showcase__footer">
        <Link
          href={href}
          className="flex min-w-0 items-center gap-1 text-[12px] font-medium text-accent-cyan transition-colors hover:text-text-primary"
        >
          Pełny harmonogram
          {upcomingCount > 0 ? (
            <span className="truncate text-text-muted">
              · {upcomingLaunchLabel(upcomingCount)}
            </span>
          ) : null}
          <ChevronRight
            size={14}
            className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </Link>

        {launch.brief ? (
          <LaunchBriefBlock brief={launch.brief} compact className="mt-2 sm:hidden" />
        ) : null}

        {wssArticle ? (
          <LaunchWssArticleLink article={wssArticle} compact className="mt-2" />
        ) : null}

        {recentCompleted ? (
          <span className="ops-launch-showcase__recent truncate text-[11px] text-text-tertiary">
            Ostatnio:{" "}
            <span className="font-medium text-text-secondary">
              {shortenMissionTitle(recentCompleted, 32)}
            </span>
            {" · "}
            {launchPhaseLabel(recentCompleted.phase)}
          </span>
        ) : upNext ? (
          <span className="hidden min-w-0 truncate text-[11px] text-text-tertiary sm:block">
            Potem:{" "}
            <span className="font-medium text-text-secondary">
              {shortenMissionTitle(upNext, 36)}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
