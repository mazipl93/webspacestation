"use client";

import Link from "next/link";
import { ChevronRight, Map } from "lucide-react";
import IssGlobeCanvas from "@/components/iss-globe/IssGlobeCanvas";
import OpsIssPolandPasses from "@/components/discover/OpsIssPolandPasses";
import OpsIssTelemetry from "@/components/discover/OpsIssTelemetry";
import { useLiveIssTrack } from "@/hooks/useLiveIssTrack";
import type { GlobePoint } from "@/lib/ops/iss-globe-geo";
import type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";
import type { OpsIssPosition } from "@/lib/ops/types";

type Props = {
  initialIss: OpsIssPosition | null;
  initialGlobePast: GlobePoint[];
  initialGlobeFuture: GlobePoint[];
  polandPasses: IssPolandPass[];
  passesComputedAt: string | null;
  tleCachedAt: string | null;
};

export default function SledzIssPageContent({
  initialIss,
  initialGlobePast,
  initialGlobeFuture,
  polandPasses,
  passesComputedAt,
  tleCachedAt,
}: Props) {
  const { iss } = useLiveIssTrack(
    initialIss,
    [],
    [],
    initialGlobePast,
    initialGlobeFuture,
  );

  return (
    <div className="sledziss-page">
      <div className="sledziss-page__layout">
        <div className="sledziss-page__main">
          <IssGlobeCanvas
            initialIss={initialIss}
            initialGlobePast={initialGlobePast}
            initialGlobeFuture={initialGlobeFuture}
            variant="full"
            showControls
            liveHud="controls"
            interactive
          />

          <div className="sledziss-page__legend" aria-label="Legenda orbity">
            <span className="sledziss-page__legend-item sledziss-page__legend-item--future">
              Orbita ISS (~408 km nad Ziemią)
            </span>
            <span className="sledziss-page__legend-item sledziss-page__legend-item--visibility">
              Horyzont ISS — gdzie stacja jest nad linią horyzontu
            </span>
          </div>

          <p className="sledziss-page__visibility-note">
            Czerwone koło to zasięg geometryczny (ISS nad horyzontem), nie strefa „gołego oka”.
            Widoczność zależy od pory dnia, oświetlenia Słońcem i chmur — przeloty z oceną
            widoczności są w panelu obok.
          </p>

          {iss ? (
            <div className="sledziss-page__telemetry">
              <OpsIssTelemetry iss={iss} className="!static !shadow-none" />
            </div>
          ) : null}

          <p className="sledziss-page__note">
            Pozycja liczona z elementów orbitalnych TLE (NORAD 25544) i modelu SGP4 —
            ten sam propagator co w mapie 2D. Odświeżanie co ok. 5 s.
            {tleCachedAt ? (
              <>
                {" "}
                TLE:{" "}
                {new Date(tleCachedAt).toLocaleString("pl-PL", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
                .
              </>
            ) : null}
          </p>

          <Link href="/mapa" className="sledziss-page__map-link group">
            <Map size={16} aria-hidden />
            <span>
              Mapa 2D z platformami startowymi
              <ChevronRight
                size={14}
                className="inline opacity-50 transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </div>

        <aside className="sledziss-page__aside">
          <OpsIssPolandPasses
            variant="sidebar"
            limit={10}
            initialPasses={polandPasses}
            initialComputedAt={passesComputedAt}
          />
        </aside>
      </div>
    </div>
  );
}
