"use client";

import { useEffect, useState } from "react";
import { getMoonPhase, calculateObservingScore } from "@/lib/aurora/api";
import type { WeatherData } from "./useLocation";

interface AuxPanelProps {
  kp: number;
  weather: WeatherData;
  lat: number;
  lon: number;
  bz?: number;
  bt?: number;
  speed?: number;
}

function getScoreColor(score: number): string {
  if (score >= 8) return "#44ff88";
  if (score >= 6) return "#88ff44";
  if (score >= 4) return "#ffdd00";
  if (score >= 2) return "#ff6600";
  return "#64748b";
}

function isDarkNow(sunrise: string, sunset: string): boolean {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const nowMins = h * 60 + m;

  const parse = (s: string) => {
    const parts = s.split(":");
    return parseInt(parts[0] || "0") * 60 + parseInt(parts[1] || "0");
  };

  if (!sunrise.includes(":") || !sunset.includes(":")) return h >= 20 || h < 6;
  const riseMins = parse(sunrise);
  const setMins = parse(sunset);
  return nowMins < riseMins || nowMins > setMins;
}

export default function AuxPanel({ kp, weather, lat, lon, bz = 0, bt = 0, speed = 0 }: AuxPanelProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const moon = getMoonPhase(now);
  const dark = isDarkNow(weather.sunrise, weather.sunset);

  const score = calculateObservingScore({
    kp,
    cloudCover: weather.cloudCover,
    isDark: dark,
    moonIllumination: moon.illumination,
    bz,
    bt,
    speed,
  });

  const scoreColor = getScoreColor(score);

  const localTime = now.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const utcTime = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });

  // Can user see aurora?
  const kpRequiredAtLat = Math.max(1, 10 - Math.abs(lat) / 9);
  const canSee = kp >= kpRequiredAtLat && dark && weather.cloudCover < 70;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      <h3 className="text-sm lg:text-xs font-bold tracking-widest text-slate-200 uppercase">
        Warunki obserwacyjne
      </h3>

      {/* Observing score */}
      <div className="text-center py-2">
        <div className="text-[13px] lg:text-[10px] text-slate-500 font-mono mb-1">Indeks obserwacji</div>
        <div
          className="text-6xl font-bold font-mono"
          style={{ color: scoreColor, textShadow: `0 0 20px ${scoreColor}` }}
        >
          {score}
          <span className="text-xl">/10</span>
        </div>
        <div
          className="mt-2 text-sm lg:text-xs font-bold font-mono tracking-widest"
          style={{ color: scoreColor }}
        >
          {canSee
            ? "✓ ZORZA MOŻLIWA!"
            : dark && weather.cloudCover < 70
            ? "Zbyt słaba aktywność"
            : !dark
            ? "Za jasno (dzień)"
            : "Zbyt duże zachmurzenie"}
        </div>
      </div>

      {/* Grid of conditions */}
      <div className="grid grid-cols-2 gap-2 text-[13px] lg:text-[10px] font-mono">
        <div className="rounded border border-slate-700 bg-slate-800/40 p-2">
          <div className="text-slate-500 mb-0.5">Czas lokalny</div>
          <div className="text-slate-200 font-bold">{localTime}</div>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/40 p-2">
          <div className="text-slate-500 mb-0.5">UTC</div>
          <div className="text-slate-200 font-bold">{utcTime}</div>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/40 p-2">
          <div className="text-slate-500 mb-0.5">Wschód / Zachód</div>
          <div className="text-slate-200 font-bold">
            {weather.sunrise} / {weather.sunset}
          </div>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/40 p-2">
          <div className="text-slate-500 mb-0.5">Ciemność</div>
          <div
            className="font-bold"
            style={{ color: dark ? "#44ff88" : "#ff6600" }}
          >
            {dark ? "✓ NOC" : "☀ DZIEŃ"}
          </div>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/40 p-2">
          <div className="text-slate-500 mb-0.5">Zachmurzenie</div>
          <div
            className="font-bold"
            style={{
              color: weather.cloudCover < 30 ? "#44ff88" : weather.cloudCover < 70 ? "#ffdd00" : "#ff6600",
            }}
          >
            {weather.loading ? "…" : `${weather.cloudCover}%`}
          </div>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/40 p-2">
          <div className="text-slate-500 mb-0.5">Księżyc</div>
          <div className="text-slate-200 font-bold">
            {moon.emoji} {moon.illumination}%
          </div>
          <div className="text-slate-500 text-[9px]">{moon.name}</div>
        </div>
      </div>

      {/* Location */}
      <div className="text-[9px] text-slate-600 font-mono text-center">
        📍 {lat.toFixed(2)}°N {lon.toFixed(2)}°E
        {" · "}
        Wymagane Kp ≥ {kpRequiredAtLat.toFixed(0)} dla tej lokalizacji
      </div>
    </div>
  );
}
