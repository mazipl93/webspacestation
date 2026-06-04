"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import OpsIssTelemetry from "@/components/discover/OpsIssTelemetry";
import { cn } from "@/lib/cn";
import OpsMapPinPopup from "@/components/discover/OpsMapPinPopup";
import { issVisibilityRadiusM } from "@/lib/ops/iss-visibility";
import { resolveMapPinSpotlight } from "@/lib/ops/map-pin-spotlight";
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
};

function MapViewController({
  iss,
  pins,
  focusPinId,
}: {
  iss?: OpsIssPosition | null;
  pins: OpsMapPin[];
  focusPinId?: string | null;
}) {
  const map = useMap();
  const didInitialFit = useRef(false);

  useEffect(() => {
    if (focusPinId) return;
    if (didInitialFit.current) return;
    if (iss) {
      map.setView([iss.latitude, iss.longitude], 3, { animate: false });
      didInitialFit.current = true;
      return;
    }
    if (pins.length === 0) return;
    const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lon] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 3 });
    didInitialFit.current = true;
  }, [iss, pins, map, focusPinId]);

  return null;
}

/** Przesuwa mapę tak, aby otwarty popup był wyśrodkowany i nie był obcinany. */
function panMapToCenterPopup(map: L.Map, padding = 24) {
  const pane = map.getPane("popupPane");
  const el = pane?.querySelector(".leaflet-popup") as HTMLElement | null;
  if (!el) return;

  const container = map.getContainer();
  const cRect = container.getBoundingClientRect();
  const pRect = el.getBoundingClientRect();

  let dx = cRect.left + cRect.width / 2 - (pRect.left + pRect.width / 2);
  let dy = cRect.top + cRect.height / 2 - (pRect.top + pRect.height / 2);

  const leftAfter = pRect.left + dx;
  const rightAfter = pRect.right + dx;
  const topAfter = pRect.top + dy;
  const bottomAfter = pRect.bottom + dy;

  if (leftAfter < cRect.left + padding) {
    dx += cRect.left + padding - leftAfter;
  }
  if (rightAfter > cRect.right - padding) {
    dx -= rightAfter - (cRect.right - padding);
  }
  if (topAfter < cRect.top + padding) {
    dy += cRect.top + padding - topAfter;
  }
  if (bottomAfter > cRect.bottom - padding) {
    dy -= bottomAfter - (cRect.bottom - padding);
  }

  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
    map.panBy(L.point(dx, dy), { animate: true, duration: 0.4 });
  }
}

function schedulePopupCentering(map: L.Map) {
  const run = () => panMapToCenterPopup(map);
  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
  window.setTimeout(run, 120);
  window.setTimeout(run, 380);
}

function PopupCenterOnOpen() {
  const map = useMap();

  useEffect(() => {
    const onOpen = () => schedulePopupCentering(map);
    const onLayout = () => schedulePopupCentering(map);
    map.on("popupopen", onOpen);
    window.addEventListener("ops-map-popup-layout", onLayout);
    return () => {
      map.off("popupopen", onOpen);
      window.removeEventListener("ops-map-popup-layout", onLayout);
    };
  }, [map]);

  return null;
}

function PinFocusController({
  focusPinId,
  pins,
  markerRefs,
}: {
  focusPinId: string | null | undefined;
  pins: OpsMapPin[];
  markerRefs: MutableRefObject<Record<string, L.Marker | null>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusPinId) return;
    const pin = pins.find((p) => p.id === focusPinId);
    if (!pin) return;

    const zoom = pin.kind === "iss" ? 4 : 5;
    map.flyTo([pin.lat, pin.lon], zoom, { duration: 0.55 });

    const marker = markerRefs.current[focusPinId];
    const open = () => {
      marker?.openPopup();
      schedulePopupCentering(map);
    };
    const t = window.setTimeout(open, 520);
    return () => window.clearTimeout(t);
  }, [focusPinId, pins, map, markerRefs]);

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
  const ring = active ? `box-shadow:0 0 0 3px #fff, 0 0 12px ${color};` : `box-shadow:0 0 10px ${color}aa;`;
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

const POPUP_OPTIONS = {
  maxWidth: 380,
  minWidth: 260,
  className: "ops-map-leaflet-popup",
  closeButton: true,
  autoPan: true,
  keepInView: true,
  autoPanPaddingTopLeft: L.point(56, 64),
  autoPanPaddingBottomRight: L.point(56, 64),
};

export default function OpsLiveMap({
  pins,
  iss,
  issOrbit = [],
  height = 320,
  interactive = false,
  className,
  focusPinId = null,
  onPinSelect,
}: Props) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const issPin = pins.find((p) => p.kind === "iss");
  const padPins = pins.filter((p) => p.kind === "pad");

  const center = useMemo<[number, number]>(() => {
    if (iss) return [iss.latitude, iss.longitude];
    if (pins[0]) return [pins[0].lat, pins[0].lon];
    return [20, 0];
  }, [iss, pins]);

  const visibilityRadiusM =
    iss?.altitudeKm != null ? issVisibilityRadiusM(iss.altitudeKm) : undefined;

  const bindMarker = (pinId: string) => (ref: L.Marker | null) => {
    markerRefs.current[pinId] = ref;
  };

  if (pins.length === 0 && !iss) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-hairline-faint bg-[#0a1018] px-6 text-center"
        style={{ height }}
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
        "ops-live-map relative min-h-0 min-w-0 w-full max-w-full overflow-hidden rounded-xl border border-hairline-faint",
        className
      )}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={3}
        scrollWheelZoom={interactive}
        dragging
        touchZoom
        doubleClickZoom={interactive}
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> · imagery'
          url={SATELLITE_TILE}
        />
        <TileLayer attribution="" url={LABELS_TILE} opacity={0.55} />
        <MapViewController iss={iss} pins={pins} focusPinId={focusPinId} />
        <PinFocusController
          focusPinId={focusPinId}
          pins={pins}
          markerRefs={markerRefs}
        />
        <PopupCenterOnOpen />

        {issOrbit.map((segment, i) => (
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

        {iss && visibilityRadiusM != null && (
          <Circle
            center={[iss.latitude, iss.longitude]}
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

        {issPin && (
          <Marker
            position={[issPin.lat, issPin.lon]}
            icon={createIssIcon(focusPinId === issPin.id)}
            ref={bindMarker(issPin.id)}
            eventHandlers={{
              click: () => onPinSelect?.(issPin.id),
            }}
          >
            <Popup {...POPUP_OPTIONS}>
              <OpsMapPinPopup
                spotlight={resolveMapPinSpotlight(issPin)}
                caption={
                  iss?.altitudeKm != null
                    ? `Na żywo · ${iss.altitudeKm} km nad Ziemią${
                        iss.velocityKmh != null ? ` · ${iss.velocityKmh} km/h` : ""
                      }`
                    : "Pozycja na żywo z trackera ISS"
                }
              />
            </Popup>
          </Marker>
        )}

        {padPins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lon]}
            icon={createPadIcon(pin.color, focusPinId === pin.id)}
            ref={bindMarker(pin.id)}
            eventHandlers={{
              click: () => onPinSelect?.(pin.id),
            }}
          >
            <Popup {...POPUP_OPTIONS}>
              <OpsMapPinPopup
                spotlight={resolveMapPinSpotlight(pin)}
                caption={pin.sublabel}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {iss && (
        <div className="pointer-events-none absolute right-2 top-2 z-[1000] hidden max-w-[168px] sm:block">
          <OpsIssTelemetry iss={iss} className="px-2.5 py-2 text-[10px]" />
        </div>
      )}

      <p className="pointer-events-none absolute bottom-2 left-2 z-[1000] max-w-[min(100%,280px)] rounded bg-black/50 px-2 py-1 text-[9px] leading-snug text-white/70">
        Pinezki i legenda poniżej · orbita ISS (czerwona)
      </p>
    </div>
  );
}
