"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import OpsKpDashboardGauge from "@/components/discover/OpsKpDashboardGauge";
import OpsShowcaseBackdrop from "@/components/discover/OpsShowcaseBackdrop";
import { cn } from "@/lib/cn";
import { getBzColor } from "@/lib/aurora/api";
import KpContextCaption from "@/components/aurora/KpContextCaption";
import type { AuroraHomepageSnapshot } from "@/lib/aurora/homepage-snapshot";
import { useAuroraTerminalCore } from "@/hooks/useAuroraTerminalCore";
import {
  OPS_AURORA_SHOWCASE_IMAGE,
  OPS_SHOWCASE_GLOW,
  OPS_SHOWCASE_SCRIM,
} from "@/lib/ops/ops-showcase-media";

type Props = {
  initialSnapshot: AuroraHomepageSnapshot | null;
  className?: string;
};

export default function OpsAuroraShowcase({ initialSnapshot, className }: Props) {
  const { reading, kp, label, stormy, bzAtEarth } = useAuroraTerminalCore(initialSnapshot);

  if (kp == null || !reading || !label) return null;

  const bzColor = bzAtEarth != null ? getBzColor(bzAtEarth) : undefined;

  return (
    <Link
      href="/zorza"
      className={cn(
        "ops-aurora-showcase group block min-w-0",
        stormy && "ops-aurora-showcase--stormy",
        className,
      )}
      aria-label={`Zorza na żywo — Kp ${kp.toFixed(1)}, ${label}. Wejdź do Aurora Terminal.`}
    >
      <OpsShowcaseBackdrop
        src={OPS_AURORA_SHOWCASE_IMAGE}
        scrim={OPS_SHOWCASE_SCRIM.aurora}
        glow={OPS_SHOWCASE_GLOW.aurora}
        sizes="(max-width: 1024px) 100vw, 560px"
        imagePosition="78% 32%"
      >
        <div className="ops-aurora-showcase__inner">
          <div className="ops-aurora-showcase__content min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#44ff88]">
              <Sparkles size={13} aria-hidden />
              Zorza na żywo
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#44ff88]"
              />
            </p>

            <div className="ops-aurora-showcase__meta-row">
              <p className="ops-aurora-showcase__kp">
                Kp {kp.toFixed(1)}
                <span className="ops-aurora-showcase__kp-sep"> · </span>
                {label}
              </p>
              <div className="ops-aurora-showcase__chips flex flex-wrap gap-2">
                {bzAtEarth != null && (
                  <span
                    className="ops-aurora-showcase__chip"
                    style={{ color: bzColor, borderColor: `${bzColor}55` }}
                  >
                    Bz @ Ziemia {bzAtEarth > 0 ? "+" : ""}
                    {bzAtEarth.toFixed(1)} nT
                  </span>
                )}
                {stormy && (
                  <span className="ops-aurora-showcase__chip ops-aurora-showcase__chip--storm">
                    Burza geomagnetyczna
                  </span>
                )}
              </div>
            </div>

            <OpsKpDashboardGauge kp={kp} className="ops-aurora-showcase__scale" />

            <KpContextCaption reading={reading} variant="compact" className="text-[10px] mt-1 block" />

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
