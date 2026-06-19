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
import OpsMapPinDetail from "@/components/discover/OpsMapPinDetail";
import type { MapPinSpotlight } from "@/lib/ops/map-pin-spotlight";
import OpsIssTelemetry from "@/components/discover/OpsIssTelemetry";
import { useLiveIssTrack } from "@/hooks/useLiveIssTrack";
import { prepareOrbitSegmentsForLeaflet } from "@/lib/ops/iss-orbit-geo";
import { cn } from "@/lib/cn";
import { issMapPinHtml, ISS_MAP_PIN_HEIGHT, ISS_MAP_PIN_WIDTH } from "@/lib/ops/iss-map-pin-icon";
import { issVisibilityRadiusM } from "@/lib/ops/iss-visibility";
import { opsMapShellClass } from "@/lib/ops/ops-map-shell-class";
import type { OpsIssPosition, OpsMapPin } from "@/lib/ops/types";
import "leaflet/dist/leaflet.css";

/** Bez worldCopyJump — przy poprawnie pociętych segmentach unika poziomego flasha przy ładowaniu. */
const ORBIT_LINE_OPTS = {} as L.PolylineOptions;

type Props = {
  pins: OpsMapPin[];
  iss?: OpsIssPosition | null;
  issOrbit?: { lat: number; lon: number }[][];
  issOrbitPast?: { lat: number; lon: number }[][];
  issOrbitFuture?: { lat: number; lon: number }[][];
  height?: number;
  interactive?: boolean;
  className?: string;
  focusPinId?: string | null;
  onPinSelect?: (pinId: string) => void;
  pinDetail?: {
    pinId: string;
    spotlight: MapPinSpotlight;
    caption?: string;
  } | null;
  onPinDetailClose?: () => void;
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
  if (pin.kind === "cosmodrome" && !pin.scheduled) return narrow ? 3 : 4;
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

/** Na mobile przesuwa mapę, żeby pinezka nie chowała się pod dolnym okienkiem. */
function OverlayPanAdjust({
  focusPinId,
  overlayOpen,
}: {
  focusPinId?: string | null;
  overlayOpen: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusPinId || !overlayOpen) return;
    const narrow =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;
    if (!narrow) return;

    const t = window.setTimeout(() => {
      map.panBy([0, 110], { animate: true });
    }, 120);
    return () => window.clearTimeout(t);
  }, [focusPinId, overlayOpen, map]);

  return null;
}

function MapOrbitReadyGate({ onReady }: { onReady: () => void }) {
  const map = useMap();

  useEffect(() => {
    let done = false;
    const mark = () => {
      if (done) return;
      done = true;
      onReady();
    };

    map.whenReady(() => {
      requestAnimationFrame(() => {
        map.invalidateSize({ animate: false });
        requestAnimationFrame(mark);
      });
    });

    return () => {
      done = true;
    };
  }, [map, onReady]);

  return null;
}

function createIssIcon(active: boolean) {
  const w = ISS_MAP_PIN_WIDTH;
  const h = ISS_MAP_PIN_HEIGHT;
  return L.divIcon({
    className: "ops-leaflet-pin",
    html: issMapPinHtml(active),
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
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

function createCosmodromeIcon(
  color: string,
  scheduled: boolean,
  active: boolean,
) {
  const size = scheduled ? 12 : 10;
  const ring = active
    ? `box-shadow:0 0 0 3px #fff, 0 0 12px ${color};`
    : scheduled
      ? `box-shadow:0 0 10px ${color}cc;`
      : "box-shadow:0 0 6px rgba(100,116,139,0.45);";
  const border = scheduled ? "2px solid #fff" : "1.5px solid rgba(255,255,255,0.75)";
  const opacity = scheduled ? 1 : 0.88;
  return L.divIcon({
    className: "ops-leaflet-pin",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:${border};opacity:${opacity};${ring}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
  issOrbitPast,
  issOrbitFuture,
  height = 320,
  interactive = false,
  className,
  focusPinId = null,
  onPinSelect,
  pinDetail = null,
  onPinDetailClose,
  followIss = false,
}: Props) {
  const overlayOpen = Boolean(pinDetail);
  const [isFollowing, setIsFollowing] = useState(followIss);
  const [orbitReady, setOrbitReady] = useState(false);
  const { iss: liveIss, orbitPast, orbitFuture } = useLiveIssTrack(
    iss ?? null,
    issOrbitPast ?? issOrbit,
    issOrbitFuture ?? [],
  );

  const refLon = liveIss?.longitude ?? iss?.longitude;
  const displayPast = useMemo(
    () =>
      refLon == null
        ? []
        : prepareOrbitSegmentsForLeaflet(orbitPast, refLon),
    [orbitPast, refLon],
  );
  const displayFuture = useMemo(
    () =>
      refLon == null
        ? []
        : prepareOrbitSegmentsForLeaflet(orbitFuture, refLon),
    [orbitFuture, refLon],
  );
  const showOrbit =
    orbitReady && refLon != null && (displayPast.length > 0 || displayFuture.length > 0);
  const issPin = pins.find((p) => p.kind === "iss");
  const cosmodromePins = pins.filter((p) => p.kind === "cosmodrome");
  const extraPadPins = pins.filter((p) => p.kind === "pad");

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
  const siteIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    for (const pin of [...cosmodromePins, ...extraPadPins]) {
      const active = focusPinId === pin.id;
      icons[pin.id] =
        pin.kind === "cosmodrome"
          ? createCosmodromeIcon(pin.color, Boolean(pin.scheduled), active)
          : createPadIcon(pin.color, active);
    }
    return icons;
  }, [cosmodromePins, extraPadPins, focusPinId]);

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

  useEffect(() => {
    if (!overlayOpen || !onPinDetailClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onPinDetailClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, onPinDetailClose]);

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
          Mapa za chwilę. Czekamy na pozycję ISS i współrzędne platform startowych.
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
        <MapOrbitReadyGate onReady={() => setOrbitReady(true)} />
        <MapViewController
          iss={liveIss}
          pins={effectivePins}
          focusPinId={focusPinId}
          followIss={isFollowing}
          onUserMoved={followIss ? () => setIsFollowing(false) : undefined}
        />
        <PinFocusController focusPinId={focusPinId} pins={effectivePins} />
        {overlayOpen ? (
          <OverlayPanAdjust focusPinId={focusPinId} overlayOpen={overlayOpen} />
        ) : null}

        {showOrbit
          ? displayPast.map((segment, i) => (
          <Polyline
            key={`orbit-past-${i}`}
            positions={segment.map((p) => [p.lat, p.lon] as [number, number])}
            pathOptions={{
              ...ORBIT_LINE_OPTS,
              color: "#f87171",
              weight: 2.75,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        ))
          : null}

        {showOrbit
          ? displayFuture.map((segment, i) => (
          <Polyline
            key={`orbit-future-${i}`}
            positions={segment.map((p) => [p.lat, p.lon] as [number, number])}
            pathOptions={{
              ...ORBIT_LINE_OPTS,
              color: "#ef4444",
              weight: 2,
              opacity: 0.55,
              lineCap: "round",
              lineJoin: "round",
              dashArray: "6 8",
            }}
          />
        ))
          : null}

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

        {cosmodromePins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lon]}
            icon={siteIcons[pin.id]}
            eventHandlers={{
              click: () => onPinSelect?.(pin.id),
            }}
          />
        ))}

        {extraPadPins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lon]}
            icon={siteIcons[pin.id]}
            eventHandlers={{
              click: () => onPinSelect?.(pin.id),
            }}
          />
        ))}
      </MapContainer>

      {liveIss && (
        <div className="pointer-events-none absolute right-1.5 top-1.5 z-10 max-w-[min(168px,46vw)] sm:right-2 sm:top-2">
          <OpsIssTelemetry
            iss={liveIss}
            className="px-2 py-1.5 text-[9px] sm:px-2.5 sm:py-2 sm:text-[10px]"
          />
        </div>
      )}

      {followIss && !isFollowing && liveIss && !overlayOpen && (
        <button
          onClick={() => setIsFollowing(true)}
          className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-lg border border-accent-cyan/40 bg-[rgba(8,14,24,0.88)] px-3 py-1.5 text-[11px] font-semibold text-accent-cyan backdrop-blur-sm transition-colors hover:bg-[rgba(8,14,24,0.95)]"
        >
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-accent-cyan" />
          Śledź ISS
        </button>
      )}

      {pinDetail && onPinDetailClose ? (
        <>
          <button
            type="button"
            className="ops-map-pin-overlay-backdrop absolute inset-0 z-10 bg-black/30 md:pointer-events-none md:bg-transparent"
            aria-label="Zamknij okienko"
            onClick={onPinDetailClose}
          />
          <div
            className="ops-map-pin-overlay pointer-events-auto absolute inset-x-2 bottom-2 z-20 md:inset-x-auto md:bottom-3 md:left-3 md:right-auto md:w-[min(100%,380px)]"
            role="dialog"
            aria-modal="true"
            aria-live="polite"
          >
            <OpsMapPinDetail
              key={pinDetail.pinId}
              pinId={pinDetail.pinId}
              spotlight={pinDetail.spotlight}
              caption={pinDetail.caption}
              variant="overlay"
              onClose={onPinDetailClose}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
