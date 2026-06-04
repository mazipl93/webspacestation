"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import OpsPinList from "@/components/discover/OpsPinList";
import type { OpsIssPosition, OpsMapPin } from "@/lib/ops/types";

const OpsLiveMap = dynamic(() => import("@/components/discover/OpsLiveMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex animate-pulse items-center justify-center rounded-xl border border-hairline-faint bg-[#0a1018] text-[12px] text-text-muted"
      style={{ height: 280 }}
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
  const mapHeight = height;
  const mapInteractive = interactive || Boolean(focusPinId);

  const handleSelectPin = useCallback((pinId: string) => {
    setFocusPinId((prev) => (prev === pinId ? prev : pinId));
  }, []);

  const mapBlock = (
    <OpsLiveMap
      pins={pins}
      iss={iss}
      issOrbit={issOrbit}
      height={mapHeight}
      interactive={mapInteractive}
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
      <div className="grid min-w-0 w-full max-w-full gap-4 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(200px,240px)]">
        <div className="min-h-0 min-w-0 overflow-hidden">{mapBlock}</div>
        {pinList ? (
          <div className="min-w-0 overflow-hidden rounded-xl border border-hairline-faint p-3 sm:p-4">
            {pinList}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-2 overflow-x-clip sm:gap-3">
      {mapBlock}
      {pinList}
    </div>
  );
}
