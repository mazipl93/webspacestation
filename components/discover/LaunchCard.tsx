import Image from "next/image";
import Link from "next/link";
import LaunchCountdown from "@/components/discover/LaunchCountdown";
import LaunchBriefBlock from "@/components/discover/LaunchBriefBlock";
import LaunchWssArticleLink from "@/components/discover/LaunchWssArticleLink";
import { OPS_LAUNCH_IMAGE_GRADIENT } from "@/lib/ops/discover-data";
import type { LaunchWssArticleLink as WssArticleLink } from "@/lib/ops/launch-article-bridge";
import type { OpsLaunch } from "@/lib/ops/types";
import { cn } from "@/lib/cn";

type Props = {
  launch: OpsLaunch;
  variant?: "compact" | "featured";
  href?: string;
  wssArticle?: WssArticleLink | null;
};

export default function LaunchCard({ launch, variant = "compact", href, wssArticle }: Props) {
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
        "flex flex-col overflow-hidden rounded-xl border border-hairline bg-space-card",
        href || !featured ? "surface-interactive group" : "surface-interactive"
      )}
    >
      <div
        className={`img-sheen relative shrink-0 overflow-hidden ${featured ? "h-[140px] sm:h-[160px]" : "h-[84px]"}`}
        style={{ background: OPS_LAUNCH_IMAGE_GRADIENT.launchHue(hue) }}
      >
        <Image
          src={image}
          alt={`${provider} — ${mission}`}
          fill
          sizes={featured ? "(max-width:640px) 100vw, 320px" : "260px"}
          className={
            featured
              ? "object-cover opacity-85"
              : "object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.08]"
          }
          style={
            featured ? undefined : { transitionTimingFunction: "var(--ease-out-soft)" }
          }
        />
        <span className="absolute bottom-2 left-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white/75">
          {provider}
        </span>
        {statusLabel && (
          <span className="absolute right-2 top-2 rounded-md border border-white/20 bg-black/50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-white/90">
            {statusLabel}
          </span>
        )}
      </div>
      <div className={`flex flex-1 flex-col justify-between ${featured ? "p-4 sm:p-5" : "p-3"}`}>
        <div>
          <p
            className={
              featured
                ? "text-[15px] font-bold leading-snug text-text-primary sm:text-[16px]"
                : "mb-3 text-[12.5px] font-bold leading-snug text-text-primary transition-colors duration-300 group-hover:text-accent-cyan"
            }
          >
            {mission}
          </p>
          {rocketName && (
            <p
              className={
                featured
                  ? "mt-1 text-[11px] font-medium text-text-tertiary"
                  : "mt-0.5 text-[10px] text-text-muted"
              }
            >
              {rocketName}
            </p>
          )}
          {windowLabel && featured && (
            <p className="mt-1 text-[10px] text-text-muted">{windowLabel}</p>
          )}
          {launch.brief && featured ? (
            <LaunchBriefBlock brief={launch.brief} className="mt-3" />
          ) : null}
        </div>
        <div className={featured ? "mt-4" : undefined}>
          {launch.phase === "countdown" || launch.phase === "hold" ? (
            <>
              <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.14em] text-text-muted">
                Start za
              </p>
              <LaunchCountdown net={net} featured={featured} phase={launch.phase} />
            </>
          ) : (
            <p className={`font-bold text-accent-cyan ${featured ? "text-[14px]" : "text-[12px]"}`}>
              {launch.statusLabel}
            </p>
          )}
          <p
            className={`truncate text-text-muted ${featured ? "mt-2 text-[11px]" : "mt-1.5 text-[9.5px]"}`}
          >
            {site}
          </p>
          {detailUrl && featured && !href && (
            <a
              href={detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-[10px] font-medium text-accent-cyan hover:underline"
            >
              Szczegoly misji
            </a>
          )}
          {wssArticle ? (
            <LaunchWssArticleLink article={wssArticle} className="mt-3" />
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
