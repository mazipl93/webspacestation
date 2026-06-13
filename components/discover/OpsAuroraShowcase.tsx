"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import KpGauge from "@/components/aurora/KpGauge";
import OpsShowcaseBackdrop from "@/components/discover/OpsShowcaseBackdrop";
import { cn } from "@/lib/cn";
import { getBzColor, getDisplayKp, getKpLabel } from "@/lib/aurora/api";
import type { AuroraHomepageSnapshot } from "@/lib/aurora/homepage-snapshot";
import {
  OPS_AURORA_SHOWCASE_IMAGE,
  OPS_SHOWCASE_GLOW,
  OPS_SHOWCASE_SCRIM,
} from "@/lib/ops/ops-showcase-media";

type Props = {
  initialSnapshot: AuroraHomepageSnapshot | null;
  className?: string;
};

const POLL_MS = 60_000;

export default function OpsAuroraShowcase({ initialSnapshot, className }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch("/api/aurora/snapshot");
        if (!res.ok) return;
        const data = (await res.json()) as AuroraHomepageSnapshot;
        if (!cancelled) setSnapshot(data);
      } catch {
        /* keep last snapshot */
      }
    }

    void refresh();
    const id = window.setInterval(refresh, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const live = useMemo(() => {
    if (!snapshot) return null;
    const kp = getDisplayKp(snapshot.kp1m, snapshot.kp3Day);
    return {
      kp,
      label: getKpLabel(kp),
      stormy: kp >= 5,
      bzAtEarth: snapshot.bzAtEarth,
    };
  }, [snapshot]);

  if (!live) return null;

  const bzColor = live.bzAtEarth != null ? getBzColor(live.bzAtEarth) : undefined;

  return (
    <Link
      href="/zorza"
      className={cn(
        "ops-aurora-showcase group block min-w-0",
        live.stormy && "ops-aurora-showcase--stormy",
        className,
      )}
      aria-label={`Zorza na żywo — Kp ${live.kp.toFixed(1)}, ${live.label}. Wejdź do Aurora Terminal.`}
    >
      <OpsShowcaseBackdrop
        src={OPS_AURORA_SHOWCASE_IMAGE}
        scrim={OPS_SHOWCASE_SCRIM.aurora}
        glow={OPS_SHOWCASE_GLOW.aurora}
        sizes="(max-width: 1024px) 100vw, 560px"
        imagePosition="78% 32%"
      >
        <div className="ops-aurora-showcase__inner">
          <div className="ops-aurora-showcase__gauge" aria-hidden>
            <KpGauge kp={live.kp} size={72} showLabel={false} showStormBadge={false} />
          </div>

          <div className="ops-aurora-showcase__content min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#44ff88]">
              <Sparkles size={13} aria-hidden />
              Zorza na żywo
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#44ff88]"
              />
            </p>

            <p className="ops-aurora-showcase__kp">
              Kp {live.kp.toFixed(1)}
              <span className="ops-aurora-showcase__kp-sep"> · </span>
              {live.label}
            </p>

            <div className="ops-aurora-showcase__chips mt-2 flex flex-wrap gap-2">
              {live.bzAtEarth != null && (
                <span
                  className="ops-aurora-showcase__chip"
                  style={{ color: bzColor, borderColor: `${bzColor}55` }}
                >
                  Bz @ Ziemia {live.bzAtEarth > 0 ? "+" : ""}
                  {live.bzAtEarth.toFixed(1)} nT
                </span>
              )}
              {live.stormy && (
                <span className="ops-aurora-showcase__chip ops-aurora-showcase__chip--storm">
                  Burza geomagnetyczna
                </span>
              )}
            </div>

            <p className="ops-aurora-showcase__desc">
              Śledź warunki geomagnetyczne i sprawdź szansę na zorzę u siebie.
            </p>

            <span className="ops-aurora-showcase__cta ops-aurora-showcase__cta--mobile">
              Wejdź do Aurora Terminal
              <ChevronRight size={12} />
            </span>
          </div>

          <span className="ops-aurora-showcase__cta ops-aurora-showcase__cta--slot">
            Wejdź do Aurora Terminal
            <ChevronRight size={12} />
          </span>
        </div>
      </OpsShowcaseBackdrop>
    </Link>
  );
}
