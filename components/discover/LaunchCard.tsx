import Image from "next/image";
import Link from "next/link";
import LaunchCountdown from "@/components/discover/LaunchCountdown";
import LaunchBriefBlock from "@/components/discover/LaunchBriefBlock";
import LaunchWssArticleLink from "@/components/discover/LaunchWssArticleLink";
import { OPS_LAUNCH_IMAGE_GRADIENT } from "@/lib/ops/discover-data";
import { resolveLaunchBrief } from "@/lib/ops/launch-brief-fallback";
import type { LaunchWssArticleLink as WssArticleLink } from "@/lib/ops/launch-article-bridge.shared";
import type { OpsLaunch } from "@/lib/ops/types";
import { cn } from "@/lib/cn";

type Props = {
  launch: OpsLaunch;
  variant?: "compact" | "featured";
  className?: string;
  href?: string;
  wssArticle?: WssArticleLink | null;
};

export default function LaunchCard({
  launch,
  variant = "compact",
  className,
  href,
  wssArticle,
}: Props) {
  const featured = variant === "featured";
  const {
    provider,
    mission,
    rocketName,
    net,
    site,
    hue,
    image,
    windowLabel,
    statusLabel,
    detailUrl,
  } = launch;

  const card = (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-space-card",
        href || featured ? "surface-interactive group" : "",
        className,
      )}
    >
      <div
        className={`img-sheen relative shrink-0 overflow-hidden ${featured ? "h-[140px] sm:h-[156px]" : "h-[84px]"}`}
        style={{ background: OPS_LAUNCH_IMAGE_GRADIENT.launchHue(hue) }}
      >
        <Image
          src={image}
          alt={`${provider} — ${mission}`}
          fill
          unoptimized
          sizes={featured ? "(max-width:640px) 100vw, 360px" : "260px"}
          className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ transitionTimingFunction: "var(--ease-out-soft)" }}
        />
        <span className="absolute bottom-2 left-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/80 sm:text-[12px]">
          {provider}
        </span>
        {statusLabel && (
          <span className="absolute right-2 top-2 rounded-md border border-white/20 bg-black/45 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/90 backdrop-blur-sm">
            {statusLabel}
          </span>
        )}
      </div>
      <div className={`flex min-h-0 flex-1 flex-col ${featured ? "p-4 sm:p-5" : "p-3"}`}>
        <div className="min-h-0 flex-1">
          <p
            className={
              featured
                ? "text-[16px] font-bold leading-snug text-text-primary sm:text-[17px]"
                : "mb-3 text-[12.5px] font-bold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan"
            }
          >
            {mission}
          </p>
          {(rocketName || windowLabel) && featured && (
            <p className="mt-1.5 text-[12px] leading-relaxed text-text-muted sm:text-[13px]">
              {[rocketName, windowLabel].filter(Boolean).join(" · ")}
            </p>
          )}
          {rocketName && !featured && (
            <p className="mt-0.5 text-[10px] text-text-muted">{rocketName}</p>
          )}
          {featured ? (
            <LaunchBriefBlock
              brief={resolveLaunchBrief(launch)}
              inline
              compact
              maxLines={4}
              className="mt-2.5"
            />
          ) : null}
        </div>
        <div className={cn("shrink-0", featured ? "mt-4 border-t border-hairline/80 pt-3.5" : undefined)}>
          {launch.phase === "countdown" || launch.phase === "hold" ? (
            <>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted sm:text-[11px]">
                Start za
              </p>
              <LaunchCountdown net={net} featured={featured} phase={launch.phase} />
            </>
          ) : (
            <p className={`font-bold text-accent-cyan ${featured ? "text-[16px]" : "text-[12px]"}`}>
              {launch.statusLabel}
            </p>
          )}
          <p
            className={`truncate text-text-muted ${featured ? "mt-2 text-[13px] sm:text-[14px]" : "mt-1.5 text-[9.5px]"}`}
          >
            {site}
          </p>
          {detailUrl && featured && !href && (
            <a
              href={detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-block text-[12px] font-medium text-accent-cyan hover:underline sm:text-[13px]"
            >
              Szczegoly misji
            </a>
          )}
          {wssArticle ? (
            <LaunchWssArticleLink article={wssArticle} className="mt-2.5" compact />
          ) : null}
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
}
