"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import OpsMapPinDetail from "@/components/discover/OpsMapPinDetail";
import OpsPinList from "@/components/discover/OpsPinList";
import { cn } from "@/lib/cn";
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
  layout?: "stack" | "split";
  showPinList?: boolean;
  interactive?: boolean;
  mapClassName?: string;
};

export default function OpsMissionMap({
  pins,
  iss,
  issOrbit = [],
  height = 320,
  layout = "stack",
  showPinList = true,
  interactive = false,
  mapClassName,
}: Props) {
  const [focusPinId, setFocusPinId] = useState<string | null>(null);
  const isSplit = layout === "split";

  const handleSelectPin = useCallback((pinId: string) => {
    setFocusPinId((prev) => (prev === pinId ? null : pinId));
  }, []);

  const focusedPin = useMemo(
    () => (focusPinId ? pins.find((p) => p.id === focusPinId) : undefined),
    [focusPinId, pins]
  );

  const detailPanel =
    focusedPin != null ? (
      <OpsMapPinDetail
        spotlight={resolveMapPinSpotlight(focusedPin)}
        caption={captionForMapPin(focusedPin, iss)}
        onClose={() => setFocusPinId(null)}
      />
    ) : null;

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
    />
  );

  const pinList =
    showPinList && pins.length > 0 ? (
      <OpsPinList
        pins={pins}
        compact
        activePinId={focusPinId}
        onSelectPin={handleSelectPin}
      />
    ) : null;

  if (isSplit) {
    return (
      <div className="flex min-w-0 w-full max-w-full flex-col gap-3 sm:gap-4">
        <div
          className={cn(
            "grid min-w-0 w-full gap-3 sm:gap-4",
            "lg:grid-cols-[minmax(0,1fr)_minmax(180px,220px)] lg:items-start"
          )}
        >
          <div className="min-w-0 w-full shrink-0">{mapBlock}</div>
          {pinList ? (
            <div className="min-w-0 rounded-xl border border-hairline-faint p-3 sm:p-4 lg:max-h-[420px] lg:overflow-y-auto">
              {pinList}
            </div>
          ) : null}
        </div>
        {detailPanel}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-3 overflow-hidden sm:gap-4">
      {mapBlock}
      {pinList}
      {detailPanel}
    </div>
  );
}
