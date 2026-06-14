"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getMoonPhase, calculateObservingScore } from "@/lib/aurora/api";
import { TimeDual, TimeDualSplit } from "./TimeDual";
import type { WeatherData } from "./useLocation";

interface AuxPanelProps {
  kp: number;
  weather: WeatherData;
  lat: number;
  lon: number;
  bz?: number;
  bt?: number;
  speed?: number;
  hideScore?: boolean;
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

function ConditionCell({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl lg:rounded-lg border border-slate-700/80 bg-slate-800/40 lg:bg-slate-800/35 p-3.5 lg:p-3 min-w-0 ${className}`}
    >
      <div className="text-[12px] lg:text-[11px] text-slate-500 font-mono mb-1 uppercase tracking-wide">
        {label}
      </div>
      <div className="font-mono font-bold text-[15px] lg:text-[15px] leading-snug break-words">
        {children}
      </div>
    </div>
  );
}

export default function AuxPanel({
  kp,
  weather,
  lat,
  lon,
  bz = 0,
  bt = 0,
  speed = 0,
  hideScore = false,
}: AuxPanelProps) {
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
  const kpRequiredAtLat = Math.max(1, 10 - Math.abs(lat) / 9);
  const canSee = kp >= kpRequiredAtLat && dark && weather.cloudCover < 70;

  return (
    <div className="rounded-2xl lg:rounded-2xl lg:aurora-panel-desktop border border-slate-800 bg-slate-900/60 lg:bg-slate-900/55 p-4 lg:p-5 space-y-4 lg:space-y-4 min-w-0 lg:shadow-[0_4px_28px_rgb(0_0_0_/_0.22)]">
      <h3 className="text-[15px] lg:text-[13px] font-bold tracking-[0.14em] text-slate-200 uppercase">
        {hideScore ? "Szczegóły lokalne" : "Warunki obserwacyjne"}
      </h3>

      {!hideScore && (
        <div className="text-center py-1 lg:py-2 rounded-xl lg:rounded-lg border border-slate-800/80 bg-slate-950/40 lg:bg-slate-950/50 px-3">
          <div className="text-[14px] lg:text-[11px] text-slate-500 font-mono mb-1 uppercase tracking-wide">
            Indeks obserwacji
          </div>
          <div
            className="text-6xl lg:text-[4.5rem] font-bold font-mono leading-none tabular-nums"
            style={{ color: scoreColor, textShadow: `0 0 24px ${scoreColor}55` }}
          >
            {score}
            <span className="text-xl lg:text-2xl text-slate-600">/10</span>
          </div>
          <div
            className="mt-2 text-[15px] lg:text-[13px] font-bold font-mono tracking-wide leading-snug"
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
      )}

      <div className="grid grid-cols-2 gap-2.5 lg:gap-2 font-mono min-w-0">
        <ConditionCell label="Czas" className="col-span-2">
          <span className="lg:hidden">
            <TimeDualSplit date={now} seconds className="text-slate-200 text-[15px]" />
          </span>
          <span className="hidden lg:block text-slate-200">
            <TimeDual date={now} seconds className="text-[14px]" />
          </span>
        </ConditionCell>

        <ConditionCell label="Wschód">
          <span className="text-slate-200 tabular-nums">{weather.sunrise}</span>
        </ConditionCell>
        <ConditionCell label="Zachód">
          <span className="text-slate-200 tabular-nums">{weather.sunset}</span>
        </ConditionCell>

        <ConditionCell label="Ciemność">
          <span style={{ color: dark ? "#44ff88" : "#ff6600" }}>
            {dark ? "✓ NOC" : "☀ DZIEŃ"}
          </span>
        </ConditionCell>

        <ConditionCell label="Zachmurzenie">
          <span
            className="tabular-nums"
            style={{
              color: weather.cloudCover < 30 ? "#44ff88" : weather.cloudCover < 70 ? "#ffdd00" : "#ff6600",
            }}
          >
            {weather.loading ? "…" : `${weather.cloudCover}%`}
          </span>
        </ConditionCell>

        <ConditionCell label="Księżyc" className="col-span-2">
          <span className="text-slate-200">
            {moon.emoji} {moon.illumination}% · {moon.name}
          </span>
        </ConditionCell>
      </div>

      <div className="rounded-xl lg:rounded-lg border border-slate-800/80 bg-slate-950/35 px-3 py-3 space-y-1 text-[12px] lg:text-[12px] text-slate-500 font-mono text-center min-w-0">
        <div className="text-slate-400 break-words tabular-nums">
          📍 {lat.toFixed(2)}°N · {lon.toFixed(2)}°E
        </div>
        <div className="text-slate-600 leading-snug">
          Wymagane Kp ≥ {kpRequiredAtLat.toFixed(0)} na Twojej szerokości
        </div>
      </div>
    </div>
  );
}
