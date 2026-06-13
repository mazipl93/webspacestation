"use client";

import { useEffect, useRef, useState } from "react";

interface AuroraMapProps {
  kp: number;
  userLat: number;
  userLon: number;
  dataReady?: boolean;
  compact?: boolean;
}

// Approximate aurora oval latitude for each Kp level (geomagnetic latitude)
const KP_OVAL_LAT: Record<number, number> = {
  0: 68, 1: 67, 2: 65, 3: 63, 4: 60, 5: 57, 6: 54, 7: 51, 8: 48, 9: 44,
};

function getOvalLat(kp: number): number {
  const k = Math.min(9, Math.max(0, Math.round(kp)));
  return KP_OVAL_LAT[k] ?? 60;
}

type LeafletContainer = HTMLDivElement & { _leaflet_id?: number };

function clearLeafletContainer(el: LeafletContainer | null) {
  if (!el) return;
  delete el._leaflet_id;
  el.replaceChildren();
}

export default function AuroraMap({ kp, userLat, userLon, dataReady = true, compact = false }: AuroraMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);
  const ovalLayerRef = useRef<unknown>(null);
  const [mapReady, setMapReady] = useState(false);
  const lastKpRef = useRef(kp);

  const effectiveKp =
    Number.isFinite(kp) && kp >= 0 && (dataReady || kp > 0)
      ? kp
      : lastKpRef.current;

  if (Number.isFinite(kp) && kp >= 0 && dataReady) {
    lastKpRef.current = kp;
  }

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    let cancelled = false;

    import("leaflet").then((leaflet) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const L = leaflet.default;

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      clearLeafletContainer(mapRef.current as LeafletContainer);

      const map = L.map(mapRef.current!, {
        center: [60, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 8,
          minZoom: 1,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      clearLeafletContainer(mapRef.current as LeafletContainer | null);
      setMapReady(false);
    };
  }, []);

  // Update aurora ovals when kp changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    let cancelled = false;

    import("leaflet").then((leaflet) => {
      if (cancelled || !mapInstanceRef.current) return;
      const L = leaflet.default;
      const map = mapInstanceRef.current!;
      const displayKp = effectiveKp;

      if (ovalLayerRef.current) {
        map.removeLayer(ovalLayerRef.current as Parameters<typeof map.removeLayer>[0]);
        ovalLayerRef.current = null;
      }

      const layerGroup = L.layerGroup();

      // ── Aurora ovals as latitude polylines (Mercator-safe)
      // L.circle centered at pole breaks in Mercator — use polyline at the oval latitude instead.
      const ovalDefs = [
        { level: 3, label: "Kp≥3", color: "#44ff88" },
        { level: 5, label: "Kp≥5 G1", color: "#ffdd00" },
        { level: 7, label: "Kp≥7 G3", color: "#ff6600" },
        { level: 9, label: "Kp≥9 G5", color: "#ff2222" },
      ] as const;

      ovalDefs.forEach(({ level, label, color }) => {
        const ovalLat = getOvalLat(level);
        const isActive = displayKp >= level;
        const lineColor = isActive ? color : "#2d3f55";
        const lineOpacity = isActive ? 0.85 : 0.4;
        const lineWeight = isActive ? 2.5 : 1;
        const dash = isActive ? undefined : "6 4";

        // Draw oval in Northern hemisphere
        const northPoints: [number, number][] = Array.from({ length: 73 }, (_, i) => [ovalLat, -180 + i * 5]);
        L.polyline(northPoints, {
          color: lineColor,
          weight: lineWeight,
          opacity: lineOpacity,
          dashArray: dash,
        }).addTo(layerGroup);

        // Southern hemisphere mirror
        const southPoints: [number, number][] = northPoints.map(([, lon]) => [-ovalLat, lon]);
        L.polyline(southPoints, {
          color: lineColor,
          weight: lineWeight,
          opacity: lineOpacity * 0.6,
          dashArray: "4 6",
        }).addTo(layerGroup);

        // Active glow fill between oval and 70°N (aurora band)
        if (isActive) {
          const fillPts: [number, number][] = [
            ...Array.from({ length: 73 }, (_, i) => [ovalLat, -180 + i * 5] as [number, number]),
            ...Array.from({ length: 73 }, (_, i) => [Math.min(85, ovalLat + 8), 180 - i * 5] as [number, number]),
          ];
          L.polygon(fillPts, {
            color: "transparent",
            fillColor: color,
            fillOpacity: 0.06,
          }).addTo(layerGroup);
        }

        // Label at right edge
        L.marker([ovalLat, 175], {
          icon: L.divIcon({
            html: `<span style="color:${lineColor};font-family:monospace;font-size:9px;white-space:nowrap;text-shadow:0 1px 3px #000,0 0 6px #000;opacity:${lineOpacity}">${label}</span>`,
            className: "",
            iconSize: [60, 12],
            iconAnchor: [0, 6],
          }),
        }).addTo(layerGroup);
      });

      // ── User location marker
      const minKp = Math.max(1, 10 - Math.abs(userLat) / 9);
      const userIcon = L.divIcon({
        html: `<div style="
          width: 14px; height: 14px; border-radius: 50%;
          background: #60a5fa; border: 2.5px solid #fff;
          box-shadow: 0 0 10px #60a5fa, 0 0 20px #60a5fa44;
        "></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([userLat, userLon], { icon: userIcon })
        .bindPopup(
          `<div style="background:#0a0f1e;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:6px 10px;font-family:monospace;font-size:11px;line-height:1.6">
            Twoja lokalizacja<br>
            ${userLat.toFixed(2)}&deg;N ${userLon.toFixed(2)}&deg;E<br>
            Zorza widoczna od Kp&nbsp;<strong style="color:#ffdd00">${minKp.toFixed(0)}</strong>
          </div>`,
          { className: "aurora-popup" }
        )
        .addTo(layerGroup);

      // ── Terminator (day/night boundary)
      const now = new Date();
      const dayOfYear = Math.floor(
        (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
      );
      const sunDeclination = 23.45 * Math.sin(((284 + dayOfYear) / 365) * 2 * Math.PI);
      const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
      const sunLon = -15 * (utcHour - 12);
      const terminatorPoints: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 3) {
        const relLon = lon - sunLon;
        const relLonRad = (relLon * Math.PI) / 180;
        const decRad = (sunDeclination * Math.PI) / 180;
        const latVal = (Math.atan(-Math.cos(relLonRad) / Math.tan(decRad)) * 180) / Math.PI;
        if (isFinite(latVal)) terminatorPoints.push([latVal, lon]);
      }
      if (terminatorPoints.length > 2) {
        L.polyline(terminatorPoints, {
          color: "#fbbf24",
          weight: 1,
          opacity: 0.3,
          dashArray: "3 6",
        }).addTo(layerGroup);
      }

      layerGroup.addTo(map);
      if (!cancelled) ovalLayerRef.current = layerGroup;
    });

    return () => {
      cancelled = true;
    };
  }, [mapReady, effectiveKp, userLat, userLon]);

  return (
    <div
      className={`relative overflow-hidden ${
        compact ? "h-44 sm:h-48 rounded-none border-0" : "h-52 sm:h-64 lg:h-80 rounded-lg border border-slate-800"
      }`}
    >
      <div ref={mapRef} style={{ width: "100%", height: "100%", background: "#0a0f1e" }} />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 text-sm font-mono">
          Ładowanie mapy…
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-black/70 rounded px-2 py-1 text-[9px] font-mono text-slate-400">
        Owale auroralne NOAA · OVATION Prime model
      </div>
    </div>
  );
}

