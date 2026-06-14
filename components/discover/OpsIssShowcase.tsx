"use client";

import Link from "next/link";
import { ChevronRight, Eye, Radio, Satellite } from "lucide-react";
import OpsShowcaseBackdrop from "@/components/discover/OpsShowcaseBackdrop";
import { cn } from "@/lib/cn";
import { useIssPolandPasses } from "@/hooks/useIssPolandPasses";
import { useLiveIssTrack } from "@/hooks/useLiveIssTrack";
import {
  formatPassCompact,
  passBadgeClass,
  passBadgeMeta,
} from "@/lib/ops/format-iss-pass";
import type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";
import {
  OPS_ISS_SHOWCASE_IMAGE,
  OPS_SHOWCASE_GLOW,
  OPS_SHOWCASE_SCRIM,
} from "@/lib/ops/ops-showcase-media";
import { formatIssStats } from "@/lib/ops/ops-widget-utils";
import type { OpsIssPosition } from "@/lib/ops/types";

type Props = {
  initialIss: OpsIssPosition | null;
  passLimit?: number;
  className?: string;
};

function PassBadge({ kind }: { kind: IssPolandPass["observationKind"] }) {
  const meta = passBadgeMeta(kind);
  return (
    <span
      className={cn("ops-iss-passes__badge ops-iss-passes__badge--sm", passBadgeClass(kind))}
      title={meta.hint}
    >
      {kind === "visible" ? <Eye size={9} aria-hidden /> : null}
      {kind === "daylight" ? <Radio size={9} aria-hidden /> : null}
      {meta.label}
    </span>
  );
}

export default function OpsIssShowcase({
  initialIss,
  passLimit = 4,
  className,
}: Props) {
  const { iss } = useLiveIssTrack(initialIss);
  const { coords, altitude, velocity } = formatIssStats(iss);
  const { passes, loading } = useIssPolandPasses({ limit: passLimit });

  return (
    <Link
      href="/mapa"
      className={cn("ops-iss-showcase group block min-w-0", className)}
      aria-label="ISS na żywo i przeloty nad Polską — otwórz mapę"
    >
      <OpsShowcaseBackdrop
        src={OPS_ISS_SHOWCASE_IMAGE}
        scrim={OPS_SHOWCASE_SCRIM.iss}
        glow={OPS_SHOWCASE_GLOW.iss}
      >
        <div className="ops-iss-showcase__inner">
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

          <div className="ops-iss-showcase__passes" aria-label="Przeloty nad Polską">
            <p className="ops-iss-showcase__passes-title">Przeloty nad Polską</p>
            {loading && passes.length === 0 ? (
              <div className="ops-iss-showcase__passes-skeleton" aria-hidden>
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="ops-iss-showcase__passes-skeleton-row" />
                ))}
              </div>
            ) : passes.length === 0 ? (
              <p className="ops-iss-showcase__passes-empty">Brak przelotów w najbliższych 72 h.</p>
            ) : (
              <ol className="ops-iss-showcase__passes-list">
                {passes.map((pass) => (
                  <li key={pass.id} className="ops-iss-showcase__passes-row">
                    <span className="ops-iss-showcase__passes-line">{formatPassCompact(pass)}</span>
                    <PassBadge kind={pass.observationKind} />
                  </li>
                ))}
              </ol>
            )}
          </div>

          <span className="ops-iss-showcase__cta inline-flex items-center gap-1 text-[11px] font-medium text-accent-cyan/90 group-hover:text-accent-cyan">
            Mapa, orbita i przeloty
            <ChevronRight size={12} />
          </span>
        </div>
      </OpsShowcaseBackdrop>
    </Link>
  );
}
