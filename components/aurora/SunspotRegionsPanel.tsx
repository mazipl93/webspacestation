"use client";

import { useState } from "react";
import type { SolarRegion } from "@/lib/aurora/api";

interface SunspotRegionsPanelProps {
  regions: SolarRegion[];
}

type MagTier = "extreme" | "high" | "moderate" | "low";

function getMagTier(magClass: string): MagTier {
  const c = magClass.toLowerCase();
  if (c.includes("delta")) return "extreme";
  if (c.includes("gamma")) return "high";
  if (c.includes("beta")) return "moderate";
  return "low";
}

const TIER_STYLES: Record<MagTier, { row: string; badge: string; dot: string; label: string }> = {
  extreme: {
    row: "bg-red-950/30 border-red-900/40 hover:bg-red-900/20",
    badge: "bg-red-900/50 text-red-300 border border-red-700/50",
    dot: "#ff3333",
    label: "Niebezpieczna",
  },
  high: {
    row: "bg-orange-950/30 border-orange-900/40 hover:bg-orange-900/20",
    badge: "bg-orange-900/50 text-orange-300 border border-orange-700/50",
    dot: "#ff8800",
    label: "Wysoka",
  },
  moderate: {
    row: "bg-yellow-950/20 border-yellow-900/30 hover:bg-yellow-900/10",
    badge: "bg-yellow-900/40 text-yellow-300 border border-yellow-700/40",
    dot: "#ffdd00",
    label: "Umiarkowana",
  },
  low: {
    row: "bg-slate-900/40 border-slate-800/40 hover:bg-slate-800/30",
    badge: "bg-slate-800/60 text-slate-400 border border-slate-700/40",
    dot: "#64748b",
    label: "Niska",
  },
};

function formatLocation(lat: number, lon: number): string {
  const latStr = `${Math.abs(lat).toFixed(0)}°${lat >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(lon).toFixed(0)}°${lon >= 0 ? "E" : "W"}`;
  return `${latStr} ${lonStr}`;
}

/** NOAA moze zwracac ten sam numer AR wielokrotnie — zostaw najswiezszy wpis. */
function dedupeRegions(regions: SolarRegion[]): SolarRegion[] {
  const byRegion = new Map<string, SolarRegion>();
  for (const r of regions) {
    const id = String(r.region);
    const existing = byRegion.get(id);
    if (!existing || (r.last_date || "") >= (existing.last_date || "")) {
      byRegion.set(id, r);
    }
  }
  return [...byRegion.values()];
}

function regionRowKey(r: SolarRegion): string {
  return `${r.region}-${r.latitude}-${r.longitude}-${r.last_date}`;
}

const SDO_THUMB = "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_HMIIC.jpg";
const SDO_FULL = "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg";

export default function SunspotRegionsPanel({ regions }: SunspotRegionsPanelProps) {
  const [sdoView, setSdoView] = useState<"intensity" | "aia171">("intensity");
  const [imgError, setImgError] = useState(false);

  const sorted = dedupeRegions(regions).sort((a, b) => {
    const tierOrder: MagTier[] = ["extreme", "high", "moderate", "low"];
    return tierOrder.indexOf(getMagTier(a.mag_class)) - tierOrder.indexOf(getMagTier(b.mag_class));
  });

  const thumbSrc =
    sdoView === "intensity"
      ? SDO_THUMB
      : "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0171.jpg";

  const fullSrc =
    sdoView === "intensity"
      ? SDO_FULL
      : "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg";

  const extremeCount = sorted.filter((r) => getMagTier(r.mag_class) === "extreme").length;
  const highCount = sorted.filter((r) => getMagTier(r.mag_class) === "high").length;

  return (
    <div className="rounded-2xl lg:rounded-2xl lg:aurora-panel-desktop border border-slate-800 bg-slate-900/60 lg:bg-slate-900/55 overflow-hidden min-w-0 lg:shadow-[0_4px_28px_rgb(0_0_0_/_0.22)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-4 py-3 lg:py-2.5 border-b border-slate-800 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] lg:text-sm font-bold tracking-widest text-slate-300 uppercase truncate">
            Aktywne Regiony
          </span>
          {sorted.length > 0 && (
            <span className="text-[12px] lg:text-xs font-mono text-slate-500 shrink-0">
              ({sorted.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {extremeCount > 0 && (
            <span className="text-[9px] lg:text-xs font-mono px-1.5 py-0.5 rounded bg-red-900/50 text-red-300 border border-red-700/50 animate-pulse">
              {extremeCount} DELTA
            </span>
          )}
          {highCount > 0 && !extremeCount && (
            <span className="text-[9px] lg:text-xs font-mono px-1.5 py-0.5 rounded bg-orange-900/50 text-orange-300 border border-orange-700/50">
              {highCount} GAMMA
            </span>
          )}
        </div>
      </div>

      {/* SDO Image */}
      <div className="p-3 lg:p-4 border-b border-slate-800/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] lg:text-xs text-slate-500 font-mono">Obraz SDO — NASA</span>
          <div className="flex gap-1">
            {(["intensity", "aia171"] as const).map((v) => (
              <button
                key={v}
                onClick={() => { setSdoView(v); setImgError(false); }}
                className={`text-[9px] lg:text-xs font-mono px-1.5 lg:px-2 py-0.5 rounded border transition-colors ${
                  sdoView === v
                    ? "bg-sky-900/40 text-sky-300 border-sky-700/50"
                    : "text-slate-500 border-slate-700/40 hover:text-slate-300"
                }`}
              >
                {v === "intensity" ? "HMI" : "AIA 171"}
              </button>
            ))}
          </div>
        </div>

        <a href={fullSrc} target="_blank" rel="noopener noreferrer" className="block group relative">
          <div className="relative w-full aspect-square max-h-52 overflow-hidden rounded border border-slate-700/40 bg-black flex items-center justify-center">
            {!imgError ? (
              <img
                src={thumbSrc}
                alt="Obraz Słońca SDO"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                style={{ filter: sdoView === "aia171" ? "hue-rotate(180deg) saturate(1.4)" : "none" }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="text-[10px] lg:text-xs text-slate-600 font-mono text-center p-4">
                Obraz niedostepny<br />
                <a href={fullSrc} className="text-sky-600 underline" target="_blank" rel="noopener noreferrer">
                  Otwórz bezpośrednio
                </a>
              </div>
            )}
            <div className="absolute inset-0 flex items-end justify-end p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] lg:text-xs font-mono bg-black/70 text-slate-300 px-1.5 py-0.5 rounded">
                powieksz
              </span>
            </div>
          </div>
        </a>
        <p className="text-[9px] lg:text-xs text-slate-600 font-mono mt-1 text-center">
          {sdoView === "intensity" ? "HMI Intensitygram" : "AIA 171Å — linia korony"} · kliknij aby powiekszyc
        </p>
      </div>

      {/* Regions table */}
      <div className="overflow-auto max-h-48">
        {sorted.length === 0 ? (
          <div className="px-3 py-4 text-center text-[10px] lg:text-xs text-slate-600 font-mono">
            Brak aktywnych regionów
          </div>
        ) : (
          <table className="w-full text-[12px] lg:text-xs font-mono min-w-[20rem]">
            <thead className="sticky top-0 z-10" style={{ background: "#0d1117" }}>
              <tr className="border-b border-slate-800/60">
                <th className="px-3 py-1.5 lg:py-2 text-left text-slate-500 font-normal">AR</th>
                <th className="px-2 py-1.5 lg:py-2 text-left text-slate-500 font-normal">Lokalizacja</th>
                <th className="px-2 py-1.5 lg:py-2 text-left text-slate-500 font-normal">Klasa</th>
                <th className="px-2 py-1.5 lg:py-2 text-right text-slate-500 font-normal">Plamy</th>
                <th className="px-2 py-1.5 lg:py-2 text-right text-slate-500 font-normal pr-3">MSH</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const tier = getMagTier(r.mag_class);
                const style = TIER_STYLES[tier];
                return (
                  <tr
                    key={regionRowKey(r)}
                    className={`border-b border-slate-800/30 transition-colors ${style.row}`}
                  >
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: style.dot, boxShadow: `0 0 4px ${style.dot}88` }}
                        />
                        <span className="text-slate-200 font-bold">{r.region}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-slate-400">
                      {formatLocation(r.latitude, r.longitude)}
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] lg:text-[11px] ${style.badge}`}>
                        {r.mag_class}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-right text-slate-300">
                      {r.num_spots}
                    </td>
                    <td className="px-2 py-1.5 text-right text-slate-400 pr-3">
                      {r.area > 0 ? r.area : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div className="px-3 lg:px-4 py-2 border-t border-slate-800/60 flex flex-wrap gap-x-3 gap-y-1">
        {(Object.entries(TIER_STYLES) as [MagTier, typeof TIER_STYLES[MagTier]][]).map(([tier, s]) => (
          <div key={tier} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
            <span className="text-[9px] lg:text-xs text-slate-600">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
