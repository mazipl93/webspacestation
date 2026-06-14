"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import OpsPinList from "@/components/discover/OpsPinList";
import OpsIssPolandPasses from "@/components/discover/OpsIssPolandPasses";
import { captionForMapPin } from "@/lib/ops/map-pin-caption";
import { resolveMapPinSpotlight } from "@/lib/ops/map-pin-spotlight";
import type { OpsIssPosition, OpsMapPin } from "@/lib/ops/types";

const OpsLiveMap = dynamic(() => import("@/components/discover/OpsLiveMap"), {
  ssr: false,
  loading: () => (
    <div
      className="ops-map-embed flex h-[min(48dvh,400px)] min-h-[280px] animate-pulse items-center justify-center rounded-xl border border-hairline-faint bg-[#0a1018] text-[12px] text-text-muted"
    >
      Ładowanie mapy satelitarnej…
    </div>
  ),
});

type Props = {
  pins: OpsMapPin[];
  iss?: OpsIssPosition | null;
  issOrbit?: { lat: number; lon: number }[][];
  height?: number;
  layout?: "stack" | "split" | "map-page";
  showPinList?: boolean;
  showPolandPasses?: boolean;
  interactive?: boolean;
  mapClassName?: string;
  followIss?: boolean;
};

export default function OpsMissionMap({
  pins,
  iss,
  issOrbit = [],
  height = 320,
  layout = "stack",
  showPinList = true,
  showPolandPasses = false,
  interactive = false,
  mapClassName,
  followIss = false,
}: Props) {
  const [focusPinId, setFocusPinId] = useState<string | null>(null);
  const isSplit = layout === "split";
  const isMapPage = layout === "map-page";

  const handleSelectPin = useCallback((pinId: string) => {
    setFocusPinId((prev) => (prev === pinId ? null : pinId));
  }, []);

  const focusedPin = useMemo(
    () => (focusPinId ? pins.find((p) => p.id === focusPinId) : undefined),
    [focusPinId, pins],
  );

  const pinDetail = useMemo(() => {
    if (!focusPinId || !focusedPin) return null;
    return {
      pinId: focusPinId,
      spotlight: resolveMapPinSpotlight(focusedPin),
      caption: captionForMapPin(focusedPin, iss),
    };
  }, [focusPinId, focusedPin, iss]);

  const mapBlock = (
    <OpsLiveMap
      pins={pins}
      iss={iss}
      issOrbit={issOrbit}
      height={height}
      interactive={interactive}
      className={mapClassName}
      focusPinId={focusPinId}
      onPinSelect={handleSelectPin}
      pinDetail={pinDetail}
      onPinDetailClose={() => setFocusPinId(null)}
      followIss={followIss}
    />
  );

  const pinList =
    showPinList && pins.length > 0 ? (
      <OpsPinList
        pins={pins}
        compact
        hideIss={isMapPage}
        layout={isMapPage ? "map-grid" : "stack"}
        activePinId={focusPinId}
        onSelectPin={handleSelectPin}
      />
    ) : null;

  if (isMapPage) {
    return (
      <div className="ops-mission-map-page">
        <div className="ops-mission-map-page__map">{mapBlock}</div>
        {pinList ? <div className="ops-mission-map-page__pins">{pinList}</div> : null}
        {showPolandPasses ? (
          <aside className="ops-mission-map-page__passes">
            <OpsIssPolandPasses variant="sidebar" limit={10} />
          </aside>
        ) : null}
      </div>
    );
  }

  if (isSplit) {
    return (
      <div className="flex min-w-0 w-full max-w-full flex-col gap-3 sm:gap-4">
        <div className="grid min-w-0 w-full gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(180px,220px)] lg:items-start">
          <div className="min-w-0 w-full shrink-0">{mapBlock}</div>
          {pinList ? (
            <div className="min-w-0 rounded-xl border border-hairline-faint p-3 sm:p-4 lg:max-h-[420px] lg:overflow-y-auto">
              {pinList}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-3 overflow-hidden sm:gap-4">
      {mapBlock}
      {pinList}
    </div>
  );
}
