"use client";

import Link from "next/link";
import { ChevronRight, Globe2, Satellite } from "lucide-react";
import IssGlobeCanvas from "@/components/iss-globe/IssGlobeCanvas";
import { cn } from "@/lib/cn";
import { useLiveIssTrack } from "@/hooks/useLiveIssTrack";
import { formatIssStats } from "@/lib/ops/ops-widget-utils";
import type { GlobePoint } from "@/lib/ops/iss-globe-geo";
import type { OpsIssPosition } from "@/lib/ops/types";

type Props = {
  initialIss: OpsIssPosition | null;
  initialGlobePast?: GlobePoint[];
  initialGlobeFuture?: GlobePoint[];
  className?: string;
};

export default function OpsIssGlobeTeaser({
  initialIss,
  initialGlobePast = [],
  initialGlobeFuture = [],
  className,
}: Props) {
  const { iss } = useLiveIssTrack(
    initialIss,
    [],
    [],
    initialGlobePast,
    initialGlobeFuture,
  );
  const { coords, altitude, velocity } = formatIssStats(iss);

  return (
    <div className={cn("iss-globe-teaser group min-w-0", className)}>
      <div className="iss-globe-teaser__shell">
        <div className="iss-globe-teaser__header">
          <Link href="/sledziss" className="iss-globe-teaser__title-link">
            <span className="iss-globe-teaser__title">
              <Globe2 size={14} aria-hidden />
              Globus ISS 3D
              <span className="iss-globe-teaser__live" aria-hidden />
            </span>
          </Link>
          <Link href="/sledziss" className="iss-globe-teaser__cta">
            Pełny widok
            <ChevronRight size={12} />
          </Link>
        </div>

        <div className="iss-globe-teaser__body">
          <div className="iss-globe-teaser__globe">
            <IssGlobeCanvas
              initialIss={initialIss}
              initialGlobePast={initialGlobePast}
              initialGlobeFuture={initialGlobeFuture}
              variant="compact"
              interactive
            />
          </div>

          <div className="iss-globe-teaser__meta">
            <p className="iss-globe-teaser__live-row">
              <span className="iss-globe-teaser__live-chip">
                <span className="iss-globe-teaser__live" aria-hidden />
                ISS · na żywo
              </span>
            </p>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-cyan">
              <Satellite size={12} aria-hidden />
              Pozycja teraz
            </p>
            <p className="iss-globe-teaser__coords">{coords}</p>
            {(altitude || velocity) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {altitude ? (
                  <span className="iss-globe-teaser__chip">{altitude} n.p.m.</span>
                ) : null}
                {velocity ? (
                  <span className="iss-globe-teaser__chip">{velocity}</span>
                ) : null}
              </div>
            )}
            <Link href="/sledziss" className="iss-globe-teaser__hint">
              Obróć globus · orbita na żywo · otwórz pełny tracker
              <ChevronRight size={11} className="inline opacity-70" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
