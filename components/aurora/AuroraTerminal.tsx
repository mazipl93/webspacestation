"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useAuroraData } from "./useAuroraData";
import { useUserLocation, useWeather } from "./useLocation";
import KpGauge from "./KpGauge";
import GeomagneticPanel from "./GeomagneticPanel";
import SolarWindPanel from "./SolarWindPanel";
import ForecastPanel from "./ForecastPanel";
import SolarDataPanel from "./SolarDataPanel";
import AuxPanel from "./AuxPanel";
import SunspotRegionsPanel from "./SunspotRegionsPanel";
import { ToastContainer, useToasts } from "./ToastSystem";
import { getKpColor } from "@/lib/aurora/api";

const AuroraMap = dynamic(() => import("./AuroraMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-slate-800 flex items-center justify-center text-slate-500 text-sm font-mono h-52 sm:h-64 lg:h-80">
      Ładowanie mapy…
    </div>
  ),
});

function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 text-slate-500 font-mono text-sm">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l-3 3-3-3V4a8 8 0 018 8z" />
      </svg>
      Pobieranie danych NOAA…
    </div>
  );
}

export default function AuroraTerminal() {
  const { state, refetch } = useAuroraData();
  const location = useUserLocation();
  const weather = useWeather(location.lat, location.lon, !location.loading);
  const { toasts, addToast, dismiss } = useToasts();
  const prevKpRef = useRef<number>(0);
  const [activeTab, setActiveTab] = useState<"main" | "charts" | "solar">("main");

  // Clock tick every second for display
  useEffect(() => {
    const id = setInterval(() => {}, 1000);
    return () => clearInterval(id);
  }, []);

  // Toast when Kp >= 5
  useEffect(() => {
    const currentKp = state.kpCurrent.at(-1)?.kp ?? 0;
    if (currentKp >= 5 && prevKpRef.current < 5) {
      addToast(`Kp = ${currentKp.toFixed(1)} — Burza G${Math.min(5, Math.floor(currentKp - 4))}! Zorza możliwa!`, "storm");
    } else if (currentKp >= 4 && prevKpRef.current < 4) {
      addToast(`Kp = ${currentKp.toFixed(1)} — Wzrosła aktywność geomagnetyczna`, "warning");
    }
    prevKpRef.current = currentKp;
  }, [state.kpCurrent, addToast]);

  // Toast for alerts
  const alertsLen = state.alerts.length;
  const prevAlertsRef = useRef(0);
  useEffect(() => {
    if (alertsLen > prevAlertsRef.current && alertsLen > 0) {
      const latest = state.alerts[0];
      if (latest?.type === "alert" || latest?.type === "warning") {
        addToast(`NOAA Alert: ${latest.message.slice(0, 80)}…`, "warning");
      }
    }
    prevAlertsRef.current = alertsLen;
  }, [alertsLen, state.alerts, addToast]);

  const currentKp = state.kpCurrent.at(-1)?.kp ?? 0;
  const latestWind = state.solarWind.at(-1);
  const bz = latestWind?.bz ?? 0;
  const kpColor = getKpColor(currentKp);
  const isStormy = currentKp >= 5;

  const lastUpdateStr = state.lastUpdate
    ? state.lastUpdate.toLocaleTimeString("pl-PL")
    : "—";

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        background: "linear-gradient(135deg, #020408 0%, #060810 50%, #030608 100%)",
        fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
      }}
    >
      {/* Styles for aurora terminal */}
      <style>{`
        .aurora-root * { box-sizing: border-box; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

        .aurora-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .aurora-popup .leaflet-popup-tip { display: none; }
      `}</style>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50 border-b border-slate-800/80 px-3 sm:px-4 py-2"
        style={{ background: "rgba(6,8,16,0.95)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: kpColor,
                boxShadow: `0 0 8px ${kpColor}`,
                animation: isStormy ? "pulse-slow 1s ease-in-out infinite" : "none",
              }}
            />
            <span className="font-bold text-xs sm:text-sm tracking-widest text-slate-100 uppercase whitespace-nowrap">
              Aurora Terminal
            </span>
            <span className="text-[10px] text-slate-600 hidden sm:inline">
              v2.0 · NOAA SWPC
            </span>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono min-w-0 overflow-hidden">
            <span className="shrink-0">
              <span className="text-slate-500">Kp </span>
              <span className="font-bold" style={{ color: kpColor }}>
                {currentKp.toFixed(1)}
              </span>
            </span>
            <span className="shrink-0">
              <span className="text-slate-500">Bz </span>
              <span
                className="font-bold"
                style={{ color: bz < 0 ? "#ff6600" : "#44ff88" }}
              >
                {bz >= 0 ? "+" : ""}{bz.toFixed(1)}
              </span>
            </span>
            <span className="hidden sm:inline shrink-0">
              <span className="text-slate-500">Wind </span>
              <span className="text-slate-300">
                {latestWind?.speed.toFixed(0) ?? "—"} km/s
              </span>
            </span>
            {isStormy && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest animate-pulse shrink-0"
                style={{
                  color: kpColor,
                  border: `1px solid ${kpColor}`,
                  background: `${kpColor}22`,
                }}
              >
                G{Math.min(5, Math.max(1, Math.floor(currentKp - 4)))}
              </span>
            )}
            <span className="text-slate-600 hidden lg:inline shrink-0">
              {lastUpdateStr}
            </span>
          </div>

          {/* Refresh */}
          <button
            onClick={refetch}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-2 py-1 rounded transition-colors shrink-0"
            aria-label="Odśwież dane"
          >
            ↻ <span className="hidden sm:inline">Odśwież</span>
          </button>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <main className="max-w-screen-2xl mx-auto p-2 sm:p-3 lg:p-4 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-4">
        {state.loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-4">

            {/* ── LEFT SIDEBAR ── */}
            <aside
              className={`space-y-4 ${activeTab !== "main" ? "hidden lg:block" : ""}`}
            >
              {/* Kp Gauge */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 sm:p-4 flex flex-col items-center">
                <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-2">
                  Planetarny Indeks Kp
                </div>
                <div className="w-full max-w-[200px] sm:max-w-none">
                  <KpGauge kp={currentKp} size={220} />
                </div>

                {/* Mini stats */}
                <div className="mt-2 w-full grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="rounded border border-slate-700 bg-slate-800/40 p-2 text-center">
                    <div className="text-slate-500 text-[10px]">Hp30</div>
                    <div className="font-bold text-sky-300">
                      {state.kpCurrent.slice(-30).reduce((a, b) => a + b.kp, 0) / 30 > 0
                        ? (state.kpCurrent.slice(-30).reduce((a, b) => a + b.kp, 0) / 30).toFixed(1)
                        : "—"}
                    </div>
                  </div>
                  <div className="rounded border border-slate-700 bg-slate-800/40 p-2 text-center">
                    <div className="text-slate-500 text-[10px]">Hp60</div>
                    <div className="font-bold text-violet-300">
                      {state.kpCurrent.slice(-60).reduce((a, b) => a + b.kp, 0) / 60 > 0
                        ? (state.kpCurrent.slice(-60).reduce((a, b) => a + b.kp, 0) / 60).toFixed(1)
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Solar Wind Panel */}
              <SolarWindPanel data={state.solarWind} />
            </aside>

            {/* ── CENTER MAIN ── */}
            <section
              className={`space-y-4 ${activeTab !== "main" ? "hidden lg:block" : ""}`}
            >
              {/* Aurora Map */}
              <AuroraMap
                kp={currentKp}
                userLat={location.lat}
                userLon={location.lon}
              />

              {/* Geomagnetic charts */}
              <div
                className={`${activeTab === "main" ? "hidden lg:block" : ""}`}
              >
                <GeomagneticPanel
                  kp3Day={state.kp3Day}
                  dst={state.dst}
                  symh={state.symh}
                />
              </div>
            </section>

            {/* Charts tab on mobile */}
            {activeTab === "charts" && (
              <section className="lg:hidden space-y-4">
                <GeomagneticPanel
                  kp3Day={state.kp3Day}
                  dst={state.dst}
                  symh={state.symh}
                />
              </section>
            )}

            {/* Solar tab on mobile */}
            {activeTab === "solar" && (
              <section className="lg:hidden space-y-4">
                <SunspotRegionsPanel regions={state.solarRegions} />
                <SolarDataPanel
                  xrayFlux={state.xrayFlux}
                  solarFlares={state.solarFlares}
                  sunspotNumber={state.sunspotNumber}
                />
                <ForecastPanel
                  forecast={state.kpForecast}
                  alerts={state.alerts}
                />
                <AuxPanel
                  kp={currentKp}
                  weather={weather}
                  lat={location.lat}
                  lon={location.lon}
                />
              </section>
            )}

            {/* ── RIGHT SIDEBAR ── */}
            <aside className="hidden lg:flex flex-col gap-4">
              <SunspotRegionsPanel regions={state.solarRegions} />
              <SolarDataPanel
                xrayFlux={state.xrayFlux}
                solarFlares={state.solarFlares}
                sunspotNumber={state.sunspotNumber}
              />
              <ForecastPanel
                forecast={state.kpForecast}
                alerts={state.alerts}
              />
              <AuxPanel
                kp={currentKp}
                weather={weather}
                lat={location.lat}
                lon={location.lon}
              />
            </aside>
          </div>
        )}

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800/50 px-4 py-3 text-[9px] text-slate-600 font-mono text-center pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-3">
        Źródła danych: NOAA Space Weather Prediction Center (SWPC) · Open-Meteo Weather API ·
        Dane Kp, Solar Wind, X-ray: services.swpc.noaa.gov · Odświeżanie co 60s ·
        © Web Space Station
      </footer>

      {/* ── MOBILE BOTTOM NAV (viewport-fixed, above map & content) ── */}
      <nav
        className="lg:hidden fixed inset-x-0 bottom-0 z-[1100] flex border-t border-slate-700 text-xs font-mono shadow-[0_-4px_24px_rgba(0,0,0,0.55)]"
        style={{
          background: "#060810",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        aria-label="Nawigacja terminala"
      >
        {(["main", "charts", "solar"] as const).map((tab) => {
          const icons: Record<string, string> = {
            main: "◎",
            charts: "≋",
            solar: "☀",
          };
          const labels: Record<string, string> = {
            main: "Kp / Wiatr",
            charts: "Wykresy",
            solar: "Słońce",
          };
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors border-t-2 ${
                active
                  ? "text-sky-400 border-sky-500"
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              <span className="text-base leading-none">{icons[tab]}</span>
              <span className="text-[10px]">{labels[tab]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
