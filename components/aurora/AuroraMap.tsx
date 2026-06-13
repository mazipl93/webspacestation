"use client";

import { useEffect, useRef, useState } from "react";

interface AuroraMapProps {
  kp: number;
  userLat: number;
  userLon: number;
}

// Approximate aurora oval latitude for each Kp level (geomagnetic latitude)
const KP_OVAL_LAT: Record<number, number> = {
  0: 68, 1: 67, 2: 65, 3: 63, 4: 60, 5: 57, 6: 54, 7: 51, 8: 48, 9: 44,
};

function getOvalLat(kp: number): number {
  const k = Math.min(9, Math.max(0, Math.round(kp)));
  return KP_OVAL_LAT[k] ?? 60;
}

export default function AuroraMap({ kp, userLat, userLon }: AuroraMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);
  const ovalLayerRef = useRef<unknown>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let L: typeof import("leaflet");
    import("leaflet").then((leaflet) => {
      L = leaflet.default;

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [60, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark tile layer
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
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update aurora ovals when kp changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    import("leaflet").then((leaflet) => {
      const L = leaflet.default;
      const map = mapInstanceRef.current!;

      // Remove old layers
      if (ovalLayerRef.current) {
        map.removeLayer(ovalLayerRef.current as Parameters<typeof map.removeLayer>[0]);
      }

      const layerGroup = L.layerGroup();

      // Draw aurora ovals for different Kp levels
      const levelsToShow = [3, 5, 7, 9];
      levelsToShow.forEach((level) => {
        const lat = getOvalLat(level);
        const isActive = kp >= level;
        const col = kp >= 7 ? "#ff4444" : kp >= 5 ? "#ff8800" : kp >= 3 ? "#44ff88" : "#00aaff";
        const activeCol = level <= Math.round(kp) ? col : "#334155";

        // North pole oval
        for (const poleLat of [lat, -lat]) {
          const circle = L.circle([poleLat > 0 ? 90 : -90, 0], {
            radius: (90 - Math.abs(poleLat)) * 111320,
            color: activeCol,
            weight: isActive && level <= Math.round(kp) ? 2 : 1,
            opacity: isActive && level <= Math.round(kp) ? 0.8 : 0.25,
            fillColor: activeCol,
            fillOpacity: isActive && level <= Math.round(kp) ? 0.08 : 0.02,
            dashArray: level <= Math.round(kp) ? undefined : "4 6",
          });
          layerGroup.addLayer(circle);

          if (level === 5 && isActive) {
            L.circle([poleLat > 0 ? 90 : -90, 0], {
              radius: (90 - Math.abs(poleLat)) * 111320 * 0.9,
              color: activeCol,
              weight: 0,
              fillColor: activeCol,
              fillOpacity: 0.06,
            }).addTo(layerGroup);
          }
        }
      });

      // User location marker
      const userIcon = L.divIcon({
        html: `<div style="
          width: 16px; height: 16px; border-radius: 50%;
          background: #60a5fa; border: 3px solid #fff;
          box-shadow: 0 0 12px #60a5fa;
        "></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userLat, userLon], { icon: userIcon })
        .bindPopup(
          `<div style="background:#0a0f1e;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:6px 10px;font-family:monospace;font-size:11px">
            📍 Twoja lokalizacja<br>
            ${userLat.toFixed(2)}°N ${userLon.toFixed(2)}°E<br>
            Wymagane Kp: ${Math.max(1, 10 - Math.abs(userLat) / 9).toFixed(0)}
          </div>`,
          { className: "aurora-popup" }
        )
        .addTo(layerGroup);

      // Terminator (simplified day/night line)
      const now = new Date();
      const dayOfYear = Math.floor(
        (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
      );
      const sunDeclination = 23.45 * Math.sin(((284 + dayOfYear) / 365) * 2 * Math.PI);
      const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
      const sunLon = -15 * (utcHour - 12);
      const terminatorPoints: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 5) {
        const relLon = lon - sunLon;
        const relLonRad = (relLon * Math.PI) / 180;
        const decRad = (sunDeclination * Math.PI) / 180;
        const lat = (Math.atan(-Math.cos(relLonRad) / Math.tan(decRad)) * 180) / Math.PI;
        terminatorPoints.push([lat, lon]);
      }
      if (terminatorPoints.length > 2) {
        L.polyline(terminatorPoints, {
          color: "#fbbf24",
          weight: 1,
          opacity: 0.35,
          dashArray: "3 5",
        }).addTo(layerGroup);
      }

      // Kp scale legend
      const kpLines = [
        { kp: 3, label: "Kp3", lat: getOvalLat(3) },
        { kp: 5, label: "Kp5 G1", lat: getOvalLat(5) },
        { kp: 7, label: "Kp7 G3", lat: getOvalLat(7) },
      ];
      kpLines.forEach(({ kp: k, label, lat }) => {
        const col = getKpColorSimple(k);
        L.marker([lat, 170], {
          icon: L.divIcon({
            html: `<span style="color:${col};font-family:monospace;font-size:9px;white-space:nowrap;text-shadow:0 0 4px #000">${label}</span>`,
            className: "",
            iconSize: [50, 12],
          }),
        }).addTo(layerGroup);
      });

      layerGroup.addTo(map);
      ovalLayerRef.current = layerGroup;
    });
  }, [mapReady, kp, userLat, userLon]);

  return (
    <div className="relative rounded-lg border border-slate-800 overflow-hidden" style={{ height: 320 }}>
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

function getKpColorSimple(kp: number): string {
  if (kp >= 7) return "#ff4444";
  if (kp >= 5) return "#ff8800";
  if (kp >= 3) return "#44ff88";
  return "#00aaff";
}
