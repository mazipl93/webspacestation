"use client";

import Link from "next/link";
import { ChevronRight, Satellite } from "lucide-react";
import OpsShowcaseBackdrop from "@/components/discover/OpsShowcaseBackdrop";
import { cn } from "@/lib/cn";
import { useLiveIssTrack } from "@/hooks/useLiveIssTrack";
import {
  OPS_ISS_SHOWCASE_IMAGE,
  OPS_SHOWCASE_GLOW,
  OPS_SHOWCASE_SCRIM,
} from "@/lib/ops/ops-showcase-media";
import { formatIssStats } from "@/lib/ops/ops-widget-utils";
import type { OpsIssPosition } from "@/lib/ops/types";

type Props = {
  initialIss: OpsIssPosition | null;
  className?: string;
};

export default function OpsIssShowcase({ initialIss, className }: Props) {
  const { iss } = useLiveIssTrack(initialIss);
  const { coords, altitude, velocity } = formatIssStats(iss);

  return (
    <Link
      href="/mapa"
      className={cn("ops-iss-showcase group block min-w-0", className)}
    >
      <OpsShowcaseBackdrop
        src={OPS_ISS_SHOWCASE_IMAGE}
        scrim={OPS_SHOWCASE_SCRIM.iss}
        glow={OPS_SHOWCASE_GLOW.iss}
      >
        <div className="ops-iss-showcase__inner">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-cyan">
              <Satellite size={13} aria-hidden />
              ISS teraz
              <span
                aria-hidden
                className="ml-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent-cyan"
              />
            </p>
            <p className="ops-iss-showcase__coords">{coords}</p>
            {(altitude || velocity) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {altitude ? (
                  <span className="ops-iss-showcase__chip">{altitude} n.p.m.</span>
                ) : null}
                {velocity ? (
                  <span className="ops-iss-showcase__chip">{velocity}</span>
                ) : null}
              </div>
            )}
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent-cyan/90 group-hover:text-accent-cyan">
              Orbita na mapie
              <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </OpsShowcaseBackdrop>
    </Link>
  );
}
