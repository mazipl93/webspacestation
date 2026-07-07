"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Map } from "lucide-react";
import IssGlobeCanvas from "@/components/iss-globe/IssGlobeCanvas";
import OpsIssPolandPasses from "@/components/discover/OpsIssPolandPasses";
import type { IssLocation } from "@/components/discover/IssLocationPicker";
import type { GlobePoint } from "@/lib/ops/iss-globe-geo";
import type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";
import type { OpsIssPosition } from "@/lib/ops/types";

type Props = {
  initialIss: OpsIssPosition | null;
  initialGlobePast: GlobePoint[];
  initialGlobeFuture: GlobePoint[];
  polandPasses: IssPolandPass[];
  passesComputedAt: string | null;
};

export default function SledzIssPageContent({
  initialIss,
  initialGlobePast,
  initialGlobeFuture,
  polandPasses,
  passesComputedAt,
}: Props) {
  const [observerLocation, setObserverLocation] = useState<IssLocation | null>(
    null,
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
          />

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
