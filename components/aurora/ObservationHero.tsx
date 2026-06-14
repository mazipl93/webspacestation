"use client";



import { useEffect, useState, type CSSProperties } from "react";

import {

  calculateObservingScore,

  getMoonPhase,

} from "@/lib/aurora/api";

import { KpPeriodSplit } from "./TimeDual";
import type { WeatherData } from "./useLocation";
import KpGauge from "./KpGauge";
import KpContextCaption from "./KpContextCaption";
import type { KpLiveReading } from "@/lib/aurora/api";

interface ObservationHeroProps {
  kp: number;
  kpReading?: KpLiveReading;

  weather: WeatherData;

  lat: number;

  bz?: number;

  bt?: number;

  speed?: number;

  isStormy?: boolean;

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



function verdictText(canSee: boolean, dark: boolean, cloudCover: number): string {

  if (canSee) return "Zorza możliwa";

  if (!dark) return "Za jasno (dzień)";

  if (cloudCover >= 70) return "Zbyt duże zachmurzenie";

  return "Zbyt słaba aktywność";

}



function ContextChip({

  label,

  value,

  valueClassName = "text-slate-200",

  valueStyle,

}: {

  label: string;

  value: string;

  valueClassName?: string;

  valueStyle?: CSSProperties;

}) {

  return (

    <div className="rounded-xl border border-slate-800/90 bg-slate-950/45 px-4 py-3 text-center min-w-0">

      <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wide">{label}</div>

      <div

        className={`text-[16px] font-bold font-mono mt-1 leading-snug break-words ${valueClassName}`}

        style={valueStyle}

      >

        {value}

      </div>

    </div>

  );

}



/** Mobile hero: Kp + szansa na zorze — pełna szerokość, bez overflow. */

export default function ObservationHero({
  kp,
  kpReading,
  weather,

  lat,

  bz = 0,

  bt = 0,

  speed = 0,

  isStormy = false,

}: ObservationHeroProps) {

  const [now, setNow] = useState(() => new Date());



  useEffect(() => {

    const id = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(id);

  }, []);



  const dark = isDarkNow(weather.sunrise, weather.sunset);

  const moon = getMoonPhase(now);

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

  const verdict = verdictText(canSee, dark, weather.cloudCover);

  const cloudColor =

    weather.cloudCover < 30 ? "#44ff88" : weather.cloudCover < 70 ? "#ffdd00" : "#ff6600";



  return (

    <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 overflow-hidden shadow-[0_8px_32px_rgb(0_0_0_/_0.35)]">

      {/* Kp — pełna szerokość, duży gauge */}

      <div className="relative px-4 pt-5 pb-4 text-center">

        <div

          className="pointer-events-none absolute inset-0 opacity-45"

          style={{

            background: `radial-gradient(ellipse 90% 55% at 50% 80%, ${getScoreColor(Math.min(9, kp))}28 0%, transparent 72%)`,

          }}

        />

        <p className="text-[13px] text-slate-500 font-mono uppercase tracking-widest mb-2">

          Indeks Kp

        </p>

        <KpGauge kp={kp} size={240} showStormBadge={false} />
        {kpReading && <KpContextCaption reading={kpReading} className="mt-2" />}
        <div className="mt-3 px-2">

          <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-1.5">Okres pomiaru</p>

          <KpPeriodSplit date={now} />

        </div>

      </div>



      {/* Szansa — szeroki pas, werdykt + wielka liczba obok siebie */}

      <div className="px-4 py-5 border-t border-slate-800/80 bg-slate-950/50">

        <div className="flex items-center justify-between gap-4 min-w-0">

          <div className="min-w-0 flex-1">

            <p className="text-[13px] text-slate-500 font-mono uppercase tracking-widest">

              Szansa na zorze

            </p>

            <p

              className="text-[16px] font-mono font-bold mt-2 leading-snug break-words"

              style={{ color: scoreColor }}

            >

              {verdict}

            </p>

            {isStormy && (

              <span className="inline-block mt-3 px-3 py-1 rounded-md text-[12px] font-bold font-mono text-orange-400 border border-orange-500/40 bg-orange-500/10">

                Burza G{Math.min(5, Math.max(1, Math.floor(kp - 4)))}

              </span>

            )}

          </div>

          <div className="shrink-0 text-right">

            <div

              className="text-6xl sm:text-7xl font-bold font-mono leading-none tabular-nums"

              style={{ color: scoreColor, textShadow: `0 0 24px ${scoreColor}44` }}

            >

              {score}

              <span className="text-2xl text-slate-600">/10</span>

            </div>

          </div>

        </div>

      </div>



      {/* Kontekst — trzy równe kafelki */}

      <div className="grid grid-cols-3 gap-2 p-3 border-t border-slate-800/80 bg-slate-950/30">

        <ContextChip

          label="Wymagane Kp"

          value={`≥ ${kpRequiredAtLat.toFixed(0)}`}

        />

        <ContextChip

          label="Pora"

          value={dark ? "Noc" : "Dzień"}

          valueClassName=""

          valueStyle={{ color: dark ? "#44ff88" : "#ff6600" }}

        />

        <ContextChip

          label="Chmury"

          value={weather.loading ? "…" : `${weather.cloudCover}%`}

          valueStyle={{ color: cloudColor }}

        />

      </div>

    </div>

  );

}


