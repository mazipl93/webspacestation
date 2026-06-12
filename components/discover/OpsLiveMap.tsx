"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import OpsIssTelemetry from "@/components/discover/OpsIssTelemetry";
import { useLiveIssTrack } from "@/hooks/useLiveIssTrack";
import { cn } from "@/lib/cn";
import { issVisibilityRadiusM } from "@/lib/ops/iss-visibility";
import { opsMapShellClass } from "@/lib/ops/ops-map-shell-class";
import type { OpsIssPosition, OpsMapPin } from "@/lib/ops/types";
import "leaflet/dist/leaflet.css";

type Props = {
  pins: OpsMapPin[];
  iss?: OpsIssPosition | null;
  issOrbit?: { lat: number; lon: number }[][];
  height?: number;
  interactive?: boolean;
  className?: string;
  focusPinId?: string | null;
  onPinSelect?: (pinId: string) => void;
  followIss?: boolean;
};

function MapViewController({
  iss,
  pins,
  focusPinId,
  followIss = false,
  onUserMoved,
}: {
  iss?: OpsIssPosition | null;
  pins: OpsMapPin[];
  focusPinId?: string | null;
  followIss?: boolean;
  onUserMoved?: () => void;
}) {
  const map = useMap();
  const initDoneRef = useRef(false);

  useEffect(() => {
    if (!onUserMoved) return;
    const stop = () => onUserMoved();
    map.on("dragstart", stop);
    return () => { map.off("dragstart", stop); };
  }, [map, onUserMoved]);

  useEffect(() => {
    if (focusPinId) return;

    if (!iss) {
      if (!initDoneRef.current && pins.length > 0) {
        const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lon] as [number, number]));
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 3 });
        initDoneRef.current = true;
      }
      return;
    }

    if (!initDoneRef.current) {
      map.setView([iss.latitude, iss.longitude], 3, { animate: false });
      initDoneRef.current = true;
    } else if (followIss) {
      map.panTo([iss.latitude, iss.longitude], { animate: true, duration: 2 });
    }
  }, [iss, pins, map, focusPinId, followIss]);

  return null;
}

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const fix = () => map.invalidateSize({ animate: false });
    fix();
    const t = window.setTimeout(fix, 300);
    return () => window.clearTimeout(t);
  }, [map]);

  useEffect(() => {
    const onOrientation = () => {
      window.setTimeout(() => map.invalidateSize({ animate: false }), 150);
    };
    window.addEventListener("orientationchange", onOrientation);
    return () => window.removeEventListener("orientationchange", onOrientation);
  }, [map]);

  return null;
}

function focusZoomForPin(pin: OpsMapPin): number {
  const narrow =
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  if (pin.kind === "iss") return narrow ? 3 : 4;
  return narrow ? 4 : 5;
}

function PinFocusController({
  focusPinId,
  pins,
}: {
  focusPinId: string | null | undefined;
  pins: OpsMapPin[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusPinId) return;
    const pin = pins.find((p) => p.id === focusPinId);
    if (!pin) return;

    map.setView([pin.lat, pin.lon], focusZoomForPin(pin), { animate: false });
    const t = window.setTimeout(() => map.invalidateSize({ animate: false }), 80);
    return () => window.clearTimeout(t);
  }, [focusPinId, pins, map]);

  return null;
}

function createIssIcon(active: boolean) {
  const ring = active
    ? "box-shadow:0 0 0 3px rgba(56,189,248,0.9), 0 0 20px rgba(56,189,248,0.85);"
    : "box-shadow:0 0 16px rgba(56,189,248,0.85);";
  return L.divIcon({
    className: "ops-leaflet-pin",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:rgba(56,189,248,0.95);border:2px solid #fff;${ring}font-size:14px;">🛰</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createPadIcon(color: string, active: boolean) {
  const ring = active
    ? `box-shadow:0 0 0 3px #fff, 0 0 12px ${color};`
    : `box-shadow:0 0 10px ${color}aa;`;
  return L.divIcon({
    className: "ops-leaflet-pin",
    html: `<span style="display:block;width:12px;height:12px;border-radius:9999px;background:${color};border:2px solid #fff;${ring}"></span>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

const SATELLITE_TILE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const LABELS_TILE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

export default function OpsLiveMap({
  pins,
  iss,
  issOrbit = [],
  height = 320,
  interactive = false,
  className,
  focusPinId = null,
  onPinSelect,
  followIss = false,
}: Props) {
  const [isFollowing, setIsFollowing] = useState(followIss);
  const { iss: liveIss, orbit: liveOrbit } = useLiveIssTrack(
    iss ?? null,
    issOrbit,
  );
  const issPin = pins.find((p) => p.kind === "iss");
  const padPins = pins.filter((p) => p.kind === "pad");

  const issLatLng = useMemo<[number, number] | null>(() => {
    if (liveIss) return [liveIss.latitude, liveIss.longitude];
    if (issPin) return [issPin.lat, issPin.lon];
    return null;
  }, [liveIss, issPin]);

  /** Pin ISS z podmienioną pozycją live — focus / mapa trafiają tam, gdzie marker. */
  const effectivePins = useMemo(() => {
    if (!liveIss) return pins;
    return pins.map((p) =>
      p.kind === "iss"
        ? { ...p, lat: liveIss.latitude, lon: liveIss.longitude }
        : p,
    );
  }, [pins, liveIss]);

  const issIcon = useMemo(
    () => (issPin ? createIssIcon(focusPinId === issPin.id) : null),
    [issPin, focusPinId]
  );
  const padIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    for (const pin of padPins) {
      icons[pin.id] = createPadIcon(pin.color, focusPinId === pin.id);
    }
    return icons;
  }, [padPins, focusPinId]);

  const center = useMemo<[number, number]>(() => {
    if (issLatLng) return issLatLng;
    if (pins[0]) return [pins[0].lat, pins[0].lon];
    return [20, 0];
  }, [issLatLng, pins]);

  const initialCenterRef = useRef<[number, number] | null>(null);
  if (initialCenterRef.current === null) {
    initialCenterRef.current = center;
  }

  const visibilityRadiusM =
    liveIss?.altitudeKm != null
      ? issVisibilityRadiusM(liveIss.altitudeKm)
      : undefined;

  const shellClass = opsMapShellClass(className);
  const useFixedShell =
    Boolean(className?.includes("ops-map-page-map")) ||
    Boolean(className?.includes("ops-map-embed"));

  if (pins.length === 0 && !liveIss) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-hairline-faint bg-[#0a1018] px-6 text-center",
          shellClass,
          className
        )}
        style={useFixedShell ? undefined : { height }}
      >
        <p className="max-w-[32ch] text-[13px] leading-relaxed text-text-tertiary">
          Mapa za chwilę — czekamy na pozycję ISS i współrzędne platform startowych.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "ops-live-map relative w-full max-w-full shrink-0 overflow-hidden rounded-xl border border-hairline-faint",
        shellClass,
        className
      )}
      style={useFixedShell ? undefined : { height }}
    >
      <MapContainer
        center={initialCenterRef.current ?? center}
        zoom={3}
        scrollWheelZoom={interactive}
        dragging
        touchZoom
        doubleClickZoom={interactive}
        className="!h-full !w-full"
        attributionControl={false}
      >
        <TileLayer attribution="" url={SATELLITE_TILE} />
        <TileLayer attribution="" url={LABELS_TILE} opacity={0.55} />
        <MapResizeFix />
        <MapViewController
          iss={liveIss}
          pins={effectivePins}
          focusPinId={focusPinId}
          followIss={isFollowing}
          onUserMoved={followIss ? () => setIsFollowing(false) : undefined}
        />
        <PinFocusController focusPinId={focusPinId} pins={effectivePins} />

        {liveOrbit.map((segment, i) => (
          <Polyline
            key={`orbit-${i}`}
            positions={segment.map((p) => [p.lat, p.lon] as [number, number])}
            pathOptions={{
              color: "#ef4444",
              weight: 2.5,
              opacity: 0.92,
              lineCap: "round",
            }}
          />
        ))}

        {issLatLng && visibilityRadiusM != null && (
          <Circle
            center={issLatLng}
            radius={visibilityRadiusM}
            pathOptions={{
              color: "#ef4444",
              weight: 1,
              opacity: 0.35,
              fillColor: "#ef4444",
              fillOpacity: 0.06,
            }}
          />
        )}

        {issPin && issIcon && issLatLng && (
          <Marker
            position={issLatLng}
            icon={issIcon}
            eventHandlers={{
              click: () => onPinSelect?.(issPin.id),
            }}
          />
        )}

        {padPins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lon]}
            icon={padIcons[pin.id]}
            eventHandlers={{
              click: () => onPinSelect?.(pin.id),
            }}
          />
        ))}
      </MapContainer>

      {liveIss && (
        <div className="pointer-events-none absolute right-2 top-2 z-[1000] hidden max-w-[168px] sm:block">
          <OpsIssTelemetry iss={liveIss} className="px-2.5 py-2 text-[10px]" />
        </div>
      )}

      {followIss && !isFollowing && liveIss && (
        <button
          onClick={() => setIsFollowing(true)}
          className="absolute bottom-3 left-3 z-[1000] flex items-center gap-1.5 rounded-lg border border-accent-cyan/40 bg-[rgba(8,14,24,0.88)] px-3 py-1.5 text-[11px] font-semibold text-accent-cyan backdrop-blur-sm transition-colors hover:bg-[rgba(8,14,24,0.95)]"
        >
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-accent-cyan" />
          Śledź ISS
        </button>
      )}
    </div>
  );
}
