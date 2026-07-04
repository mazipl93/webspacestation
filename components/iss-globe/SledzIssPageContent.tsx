"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ChevronRight, Map } from "lucide-react";
import IssGlobeCanvas from "@/components/iss-globe/IssGlobeCanvas";
import IssGlobeLegend from "@/components/iss-globe/IssGlobeLegend";
import OpsIssPolandPasses from "@/components/discover/OpsIssPolandPasses";
import OpsIssTelemetry from "@/components/discover/OpsIssTelemetry";
import type { IssLocation } from "@/components/discover/IssLocationPicker";
import { useLiveIssTrack } from "@/hooks/useLiveIssTrack";
import type { GlobePoint } from "@/lib/ops/iss-globe-geo";
import type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";
import type { GlobeLayerStatus } from "@/hooks/useGlobeAtmosphereLayer";
import type { IssGlobeLayerId } from "@/lib/ops/iss-globe-layers";
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
  const [observerLocation, setObserverLocation] = useState<IssLocation | null>(
    null,
  );
  const [atmosphereLayer, setAtmosphereLayer] =
    useState<IssGlobeLayerId>("none");
  const [layerUpdatedAt, setLayerUpdatedAt] = useState<string | null>(null);
  const [layerStatus, setLayerStatus] = useState<GlobeLayerStatus>("off");

  const handleLayerMeta = useCallback(
    (meta: {
      updatedAt: string | null;
      label: string;
      status: GlobeLayerStatus;
    }) => {
      setLayerUpdatedAt(meta.updatedAt);
      setLayerStatus(meta.status);
    },
    [],
  );

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
            observer={observerLocation}
            atmosphereLayer={atmosphereLayer}
            onAtmosphereLayerMeta={handleLayerMeta}
          />

          <IssGlobeLegend
            className="mt-3"
            atmosphereLayer={atmosphereLayer}
            onAtmosphereLayerChange={setAtmosphereLayer}
            layerUpdatedAt={layerUpdatedAt}
            layerStatus={layerStatus}
          />

          <p className="sledziss-page__visibility-note">
            Czerwone koło to zasięg geometryczny (ISS nad horyzontem), nie strefa
            „gołego oka”. Warstwy atmosferyczne (np. chmury satelitarne) pomagają
            ocenić przeszkody w obserwacji — przeloty z oceną widoczności są w
            panelu obok.
          </p>

          {iss ? (
            <div className="sledziss-page__telemetry">
              <OpsIssTelemetry iss={iss} className="!static !shadow-none" />
            </div>
          ) : null}

          <p className="sledziss-page__note">
            Pozycja liczona z elementów orbitalnych TLE (NORAD 25544) i modelu
            SGP4 — ten sam propagator co w mapie 2D. Odświeżanie co ok. 5 s.
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
            location={observerLocation}
            onLocationChange={setObserverLocation}
          />
        </aside>
      </div>
    </div>
  );
}
