"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuroraData } from "./useAuroraData";
import { useUserLocation, useWeather } from "./useLocation";
import KpGauge from "./KpGauge";
import GeomagneticPanel from "./GeomagneticPanel";
import SolarWindPanel from "./SolarWindPanel";
import ForecastPanel from "./ForecastPanel";
import SolarDataPanel from "./SolarDataPanel";
import AuxPanel from "./AuxPanel";
import AuroraPanel from "./AuroraPanel";
import SunspotRegionsPanel from "./SunspotRegionsPanel";
import { ToastContainer, useToasts } from "./ToastSystem";
import {
  getDisplayKp,
  getEarthSolarWindPoint,
} from "@/lib/aurora/api";

const AuroraMap = dynamic(() => import("./AuroraMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-slate-800 flex items-center justify-center text-slate-500 text-sm font-mono h-44 sm:h-52">
      Ladowanie mapy…
    </div>
  ),
});

function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 text-slate-500 font-mono text-sm py-24">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l-3 3-3-3V4a8 8 0 018 8z" />
      </svg>
      Pobieranie danych NOAA…
    </div>
  );
}

type Tab = "live" | "geo" | "solar";

export default function AuroraTerminal() {
  const { state, refetch } = useAuroraData();
  const location = useUserLocation();
  const weather = useWeather(location.lat, location.lon, !location.loading);
  const { toasts, addToast, dismiss } = useToasts();
  const prevKpRef = useRef<number>(0);
  const [activeTab, setActiveTab] = useState<Tab>("live");

  useEffect(() => {
    const currentKp = getDisplayKp(state.kpCurrent, state.kp3Day);
    if (currentKp >= 5 && prevKpRef.current < 5) {
      addToast(`Kp = ${currentKp.toFixed(1)} — Burza G${Math.min(5, Math.floor(currentKp - 4))}! Zorza mozliwa!`, "storm");
    } else if (currentKp >= 4 && prevKpRef.current < 4) {
      addToast(`Kp = ${currentKp.toFixed(1)} — Wzrosla aktywnosc geomagnetyczna`, "warning");
    }
    prevKpRef.current = currentKp;
  }, [state.kpCurrent, state.kp3Day, addToast]);

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

  const currentKp = getDisplayKp(state.kpCurrent, state.kp3Day);
  const earthWind = getEarthSolarWindPoint(state.solarWind);
  const bz = earthWind?.bz ?? 0;
  const headerWindSpeed = earthWind?.speed ?? 0;
  const isStormy = currentKp >= 5;

  const lastUpdateStr = state.lastUpdate
    ? state.lastUpdate.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const hp30 =
    state.kpCurrent.slice(-30).reduce((a, b) => a + b.kp, 0) / 30 > 0
      ? (state.kpCurrent.slice(-30).reduce((a, b) => a + b.kp, 0) / 30).toFixed(1)
      : "—";
  const hp60 =
    state.kpCurrent.slice(-60).reduce((a, b) => a + b.kp, 0) / 60 > 0
      ? (state.kpCurrent.slice(-60).reduce((a, b) => a + b.kp, 0) / 60).toFixed(1)
      : "—";

  const auxProps = {
    kp: currentKp,
    weather,
    lat: location.lat,
    lon: location.lon,
    bz,
    bt: earthWind?.bt ?? 0,
    speed: headerWindSpeed,
  };

  return (
    <div
      className="min-h-screen text-slate-100 aurora-root"
      style={{
        background: "linear-gradient(160deg, #020408 0%, #060810 45%, #030608 100%)",
        fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
      }}
    >
      <style>{`
        .aurora-root * { box-sizing: border-box; }
        .aurora-root .scrollbar-none::-webkit-scrollbar { display: none; }
        .aurora-root .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        .aurora-popup .leaflet-popup-content-wrapper {
          background: transparent !important; border: none !important;
          box-shadow: none !important; padding: 0 !important;
        }
        .aurora-popup .leaflet-popup-tip { display: none; }
      `}</style>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <header className="max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-4 pt-3 sm:pt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-[10px] font-mono text-slate-500 transition-colors hover:border-[#44ff88]/35 hover:text-[#44ff88]"
            aria-label="Wróć na stronę główną Web Space Station"
          >
            <ArrowLeft size={12} aria-hidden />
            <span className="hidden sm:inline">Strona główna</span>
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-widest text-slate-100 uppercase">
              Zorza polarna na żywo
            </h1>
            <p className="text-[9px] text-slate-600 font-mono mt-0.5">
              Aurora Terminal · indeks Kp · NOAA SWPC · odswiezono {lastUpdateStr}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="shrink-0 text-[10px] font-mono text-slate-400 hover:text-sky-300 border border-slate-700 hover:border-sky-600/50 bg-slate-900/60 px-3 py-1.5 rounded-md transition-colors"
          aria-label="Odswiez dane"
        >
          ↻ Odswiez
        </button>
      </header>

      <main className="max-w-screen-2xl mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-3 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-5">
        {state.loading ? (
          <Spinner />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,270px)] gap-3 sm:gap-4 lg:items-start">
              {/* ── LEWO: Kp + mapa + historia geomagnetyczna ── */}
              <div
                className={`space-y-3 sm:space-y-4 ${activeTab !== "geo" ? "hidden lg:block" : ""}`}
              >
                <AuroraPanel
                  title="Kp · teraz"
                  subtitle="Indeks geomagnetyczny · okno 3h"
                  action={
                    isStormy ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider text-orange-400 border border-orange-500/40 bg-orange-500/10">
                        BURZA G{Math.min(5, Math.max(1, Math.floor(currentKp - 4)))}
                      </span>
                    ) : undefined
                  }
                >
                  <div className="flex flex-col items-center">
                    <KpGauge kp={currentKp} size={200} />
                    <div className="mt-3 w-full grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="rounded-md border border-slate-800 bg-slate-950/40 p-2 text-center">
                        <div className="text-slate-500 text-[10px]">Hp30</div>
                        <div className="font-bold text-sky-300">{hp30}</div>
                      </div>
                      <div className="rounded-md border border-slate-800 bg-slate-950/40 p-2 text-center">
                        <div className="text-slate-500 text-[10px]">Hp60</div>
                        <div className="font-bold text-violet-300">{hp60}</div>
                      </div>
                    </div>
                  </div>
                </AuroraPanel>

                <AuroraPanel title="Mapa zorzy" subtitle="Owale auroralne · Twoja lokalizacja" className="overflow-hidden">
                  <div className="-mx-3 sm:-mx-4 -mb-3 sm:-mb-4">
                    <AuroraMap
                      kp={currentKp}
                      userLat={location.lat}
                      userLon={location.lon}
                      dataReady={!state.loading && state.solarWind.length > 0}
                      compact
                    />
                  </div>
                </AuroraPanel>

                <AuroraPanel title="Historia geomagnetyczna" subtitle="Kp · Dst · SYM-H">
                  <GeomagneticPanel
                    kp3Day={state.kp3Day}
                    kp1m={state.kpCurrent}
                    dst={state.dst}
                    symh={state.symh}
                  />
                </AuroraPanel>
              </div>

              {/* ── SRODEK: wiatr sloneczny DSCOVR ── */}
              <div className={`min-w-0 ${activeTab !== "live" ? "hidden lg:block" : ""}`}>
                <SolarWindPanel data={state.solarWind} />
              </div>

              {/* ── PRAWO: obserwacja + slonce ── */}
              <div
                className={`space-y-3 sm:space-y-4 ${activeTab === "solar" ? "" : "hidden lg:block"}`}
              >
                <AuxPanel {...auxProps} />

                <div className={activeTab === "solar" ? "block" : "hidden lg:block"}>
                  <SunspotRegionsPanel regions={state.solarRegions} />
                </div>
                <div className={activeTab === "solar" ? "block" : "hidden lg:block"}>
                  <SolarDataPanel
                    xrayFlux={state.xrayFlux}
                    solarFlares={state.solarFlares}
                    sunspotNumber={state.sunspotNumber}
                  />
                </div>
                <div className={activeTab === "solar" ? "block" : "hidden lg:block"}>
                  <ForecastPanel forecast={state.kpForecast} alerts={state.alerts} />
                </div>
              </div>
            </div>

            {/* Mobile: obserwacja pod wiatrem na zakladce live */}
            {activeTab === "live" && (
              <div className="lg:hidden mt-3">
                <AuxPanel {...auxProps} />
              </div>
            )}
          </>
        )}
      </main>

      {process.env.NODE_ENV === "development" && state.diagnostics.length > 0 && (
        <details className="max-w-screen-2xl mx-auto px-4 pb-4 text-[10px] font-mono text-slate-500">
          <summary className="cursor-pointer hover:text-slate-300">
            Aurora debug ({state.diagnostics.filter((d) => d.error).length} issues)
          </summary>
          <pre className="mt-2 overflow-x-auto rounded border border-slate-800 bg-slate-950/80 p-2 whitespace-pre-wrap">
            {state.diagnostics
              .map(
                (d) =>
                  `${d.key} ${d.status} ${d.ms}ms rows=${d.dataRows}/${d.length} ${d.error ?? "ok"}\n  ${d.sample}`,
              )
              .join("\n\n")}
          </pre>
        </details>
      )}

      <footer className="border-t border-slate-800/50 px-4 py-3 text-[9px] text-slate-600 font-mono text-center pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-3">
        NOAA SWPC · Open-Meteo · odswiezanie co 60s ·{" "}
        <Link href="/" className="text-slate-500 transition-colors hover:text-[#44ff88]">
          Web Space Station
        </Link>
        {" · "}
        <Link href="/mapa" className="text-slate-500 transition-colors hover:text-[#44ff88]">
          ISS tracker
        </Link>
        {" · "}
        <Link href="/starty" className="text-slate-500 transition-colors hover:text-[#44ff88]">
          Starty rakiet
        </Link>
      </footer>

      {/* Mobile bottom nav — duplikat zakladek dla kciuka */}
      <nav
        className="lg:hidden fixed inset-x-0 bottom-0 z-[1100] flex border-t border-slate-800 bg-[#060810]/98 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Nawigacja"
      >
        {(
          [
            { id: "live" as Tab, icon: "◈", label: "Wiatr" },
            { id: "geo" as Tab, icon: "◎", label: "Kp" },
            { id: "solar" as Tab, icon: "☀", label: "Slonce" },
          ] as const
        ).map(({ id, icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[10px] font-mono border-t-2 transition-colors ${
              activeTab === id
                ? "text-sky-400 border-sky-500"
                : "text-slate-500 border-transparent"
            }`}
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
