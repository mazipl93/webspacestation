"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Activity, ArrowLeft, RefreshCw, Sparkles, Sun, type LucideIcon } from "lucide-react";
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
import ObservationHero from "./ObservationHero";
import { ToastContainer, useToasts } from "./ToastSystem";
import {
  getEarthSolarWindPoint,
  getKpColor,
  getKpLiveReading,
  getBzColor,
} from "@/lib/aurora/api";
import { formatKpPeriodDual, formatTimeDual } from "@/lib/aurora/time-display";
import { TimeDualSplit } from "./TimeDual";
import KpContextCaption from "./KpContextCaption";
import DataOriginBadge from "./DataOriginBadge";
import { getInteractiveTool } from "@/lib/seo/interactive-tools";

const AURORA_TOOL = getInteractiveTool("aurora-terminal");

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

type MobileTab = "zorza" | "wykresy" | "slonce";

const MOBILE_TABS: { id: MobileTab; Icon: LucideIcon; label: string }[] = [
  { id: "zorza", Icon: Sparkles, label: "Zorza" },
  { id: "wykresy", Icon: Activity, label: "Wykresy" },
  { id: "slonce", Icon: Sun, label: "Słońce" },
];

function MobileSectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[14px] font-mono font-semibold uppercase tracking-widest text-slate-400 pt-2 pb-1">
      {children}
    </p>
  );
}

function HpStats({ hp30, hp60 }: { hp30: string; hp60: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:gap-3 text-[14px] lg:text-sm font-mono">
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 lg:bg-slate-950/50 p-4 lg:p-4 text-center min-w-0">
        <div className="text-slate-500 text-[13px] lg:text-[11px] uppercase tracking-wide">Hp30</div>
        <div className="font-bold text-3xl lg:text-3xl text-sky-300 mt-1 tabular-nums">{hp30}</div>
        <div className="text-[12px] lg:text-[11px] text-slate-600 mt-1 leading-snug">średnia 30 min</div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 lg:bg-slate-950/50 p-4 lg:p-4 text-center min-w-0">
        <div className="text-slate-500 text-[13px] lg:text-[11px] uppercase tracking-wide">Hp60</div>
        <div className="font-bold text-3xl lg:text-3xl text-violet-300 mt-1 tabular-nums">{hp60}</div>
        <div className="text-[12px] lg:text-[11px] text-slate-600 mt-1 leading-snug">średnia 60 min</div>
      </div>
    </div>
  );
}

export default function AuroraTerminal() {
  const { state, refetch, refreshing } = useAuroraData();
  const location = useUserLocation();
  const weather = useWeather(location.lat, location.lon, !location.loading);
  const { toasts, addToast, dismiss } = useToasts();
  const prevKpRef = useRef<number>(0);
  const wasRefreshingRef = useRef(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("zorza");
  const [isWide, setIsWide] = useState(false);
  const [refreshDone, setRefreshDone] = useState(false);

  useEffect(() => {
    if (wasRefreshingRef.current && !refreshing) {
      setRefreshDone(true);
      const timer = window.setTimeout(() => setRefreshDone(false), 2200);
      wasRefreshingRef.current = refreshing;
      return () => window.clearTimeout(timer);
    }
    wasRefreshingRef.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const reading = getKpLiveReading(state.kpCurrent, state.kp3Day);
    const kp = reading.current;
    if (kp >= 5 && prevKpRef.current < 5) {
      addToast(`Kp = ${kp.toFixed(1)} — Burza G${Math.min(5, Math.floor(kp - 4))}! Zorza mozliwa!`, "storm");
    } else if (kp >= 4 && prevKpRef.current < 4) {
      addToast(`Kp = ${kp.toFixed(1)} — Wzrosla aktywnosc geomagnetyczna`, "warning");
    }
    prevKpRef.current = kp;
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

  const kpReading = getKpLiveReading(state.kpCurrent, state.kp3Day);
  const currentKp = kpReading.current;
  const earthWind = getEarthSolarWindPoint(state.solarWind);
  const bz = earthWind?.bz ?? 0;
  const headerWindSpeed = earthWind?.speed ?? 0;
  const isStormy = currentKp >= 5;

  const lastUpdateStr = state.lastUpdate
    ? formatTimeDual(state.lastUpdate)
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

  const stormAlertCount = state.alerts.filter(
    (a) => a.type === "alert" || a.type === "warning",
  ).length;

  const mapVisible = isWide || mobileTab === "zorza";
  const kpPeriodLabel = formatKpPeriodDual();

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

      <header className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3 lg:gap-4">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-md lg:rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 min-h-[44px] lg:min-h-0 lg:px-3.5 lg:py-2 text-[14px] lg:text-[13px] font-mono text-slate-500 transition-colors hover:border-[#44ff88]/35 hover:text-[#44ff88]"
            aria-label="Wróć na stronę główną Web Space Station"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">Strona główna</span>
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-100">
              <span className="lg:hidden">Terminal zorzy</span>
              <span className="hidden lg:inline">{AURORA_TOOL.headline}</span>
            </h1>
            <p className="text-[13px] lg:text-[13px] text-slate-500 font-mono mt-0.5 lg:mt-1 leading-snug">
              NOAA SWPC · odświeżono{" "}
              {state.lastUpdate ? (
                <>
                  <span className="lg:hidden">
                    <TimeDualSplit date={state.lastUpdate} className="inline-block mt-1" />
                  </span>
                  <span className="hidden lg:inline">{lastUpdateStr}</span>
                </>
              ) : (
                "—"
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={refreshing}
          aria-busy={refreshing}
          aria-label={
            refreshing ? "Odświeżanie danych NOAA" : refreshDone ? "Dane odświeżone" : "Odśwież dane NOAA"
          }
          className={[
            "aurora-refresh-btn shrink-0 inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px]",
            "text-[14px] lg:text-[13px] font-mono px-3.5 py-2 lg:px-4 lg:py-2.5 rounded-md lg:rounded-lg",
            "border transition-all duration-200 active:scale-[0.97]",
            "disabled:cursor-wait",
            refreshing
              ? "border-sky-500/60 text-sky-300 bg-sky-950/50 shadow-[0_0_12px_rgb(56_189_248_/_0.2)]"
              : refreshDone
              ? "border-[#44ff88]/55 text-[#44ff88] bg-[#44ff88]/10 shadow-[0_0_12px_rgb(68_255_136_/_0.2)]"
              : "text-slate-400 hover:text-sky-300 border-slate-700 hover:border-sky-600/50 bg-slate-900/60 lg:hover:bg-slate-900/80",
          ].join(" ")}
        >
          <RefreshCw
            className={`size-4 shrink-0 ${refreshing ? "animate-spin" : refreshDone ? "text-[#44ff88]" : ""}`}
            aria-hidden
          />
          <span className="whitespace-nowrap">
            {refreshing ? "Odświeżanie…" : refreshDone ? "Odświeżono" : "Odśwież"}
          </span>
        </button>
      </header>

      {/* Desktop: pasek odczytu na żywo */}
      {!state.loading && (
        <div className="hidden lg:block max-w-screen-2xl mx-auto px-6 pb-4">
          <div className="aurora-desktop-hud" role="group" aria-label="Bieżące parametry space weather">
            <div className="aurora-desktop-hud__cell">
              <DataOriginBadge origin="noaa-ground" className="mb-1" />
              <span className="aurora-desktop-hud__label">Kp</span>
              <span className="aurora-desktop-hud__value" style={{ color: getKpColor(currentKp) }}>
                {currentKp.toFixed(1)}
              </span>
              <KpContextCaption reading={kpReading} variant="hud" />
            </div>
            <div className="aurora-desktop-hud__cell">
              <DataOriginBadge origin="earth-now" className="mb-1" />
              <span className="aurora-desktop-hud__label">Bz</span>
              <span className="aurora-desktop-hud__value" style={{ color: getBzColor(bz) }}>
                {bz >= 0 ? "+" : ""}{bz.toFixed(1)}
              </span>
              <span className="aurora-desktop-hud__unit">nT · szac. z DSCOVR</span>
            </div>
            <div className="aurora-desktop-hud__cell">
              <DataOriginBadge origin="earth-now" className="mb-1" />
              <span className="aurora-desktop-hud__label">V</span>
              <span className="aurora-desktop-hud__value" style={{ color: "#34d399" }}>
                {headerWindSpeed > 0 ? headerWindSpeed.toFixed(0) : "—"}
              </span>
              <span className="aurora-desktop-hud__unit">km/s · szac. z DSCOVR</span>
            </div>
            <div className="aurora-desktop-hud__cell">
              <DataOriginBadge origin="noaa-ground" className="mb-1" />
              <span className="aurora-desktop-hud__label">Hp30</span>
              <span className="aurora-desktop-hud__value" style={{ color: "#7dd3fc" }}>
                {hp30}
              </span>
              <span className="aurora-desktop-hud__unit">średnia 30 min</span>
            </div>
            <div className="aurora-desktop-hud__cell">
              <DataOriginBadge origin="local" className="mb-1" />
              <span className="aurora-desktop-hud__label">Zachmurzenie</span>
              <span
                className="aurora-desktop-hud__value text-xl"
                style={{
                  color: weather.cloudCover < 30 ? "#44ff88" : weather.cloudCover < 70 ? "#ffdd00" : "#ff6600",
                }}
              >
                {weather.loading ? "…" : `${weather.cloudCover}%`}
              </span>
              <span className="aurora-desktop-hud__unit">Open-Meteo</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: 3 zakladki u gory */}
      <nav
        className="aurora-mobile-tabs lg:hidden sticky top-0 z-20 max-w-screen-2xl mx-auto px-2 sm:px-3 pt-2 pb-2"
        aria-label="Sekcje terminala"
      >
        <div className="aurora-mobile-tabs__track" role="tablist">
          {MOBILE_TABS.map(({ id, Icon, label }) => {
            const isActive = mobileTab === id;
            const badge = id === "wykresy" && stormAlertCount > 0 ? stormAlertCount : null;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setMobileTab(id)}
                className={`aurora-mobile-tabs__btn${isActive ? " is-active" : ""}`}
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden />
                <span>{label}</span>
                {badge != null && (
                  <span className="aurora-mobile-tabs__badge">{badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-3 lg:py-2 pb-8 lg:pb-6">
        {state.loading ? (
          <Spinner />
        ) : (
          <>
            {/* ── MOBILE: jedna kolumna, tylko aktywna zakladka ── */}
            <div className="lg:hidden space-y-4 pb-2">
              {mobileTab === "zorza" && (
                <>
                  <ObservationHero {...auxProps} kpReading={kpReading} isStormy={isStormy} />
                  <AuroraPanel title="Mapa zorzy" subtitle="Owale auroralne · Twoja lokalizacja" className="overflow-hidden">
                    <div className="-mx-3 sm:-mx-4 -mb-3 sm:-mb-4">
                      <AuroraMap
                        kp={currentKp}
                        userLat={location.lat}
                        userLon={location.lon}
                        dataReady={!state.loading && state.solarWind.length > 0}
                        compact
                        isVisible={mapVisible}
                      />
                    </div>
                  </AuroraPanel>
                  <ForecastPanel
                    forecast={state.kpForecast}
                    alerts={state.alerts}
                    showAlerts={false}
                    showForecast
                  />
                  <AuxPanel {...auxProps} hideScore />
                </>
              )}

              {mobileTab === "wykresy" && (
                <>
                  <SolarWindPanel data={state.solarWind} showTimeAxis />

                  <MobileSectionLabel>Geomagnetyzm</MobileSectionLabel>
                  <AuroraPanel title="Indeksy godzinowe" subtitle="Hp30 · Hp60">
                    <HpStats hp30={hp30} hp60={hp60} />
                  </AuroraPanel>
                  <AuroraPanel title="Historia Kp · Dst · SYM-H" subtitle="72h · NOAA">
                    <GeomagneticPanel
                      kp3Day={state.kp3Day}
                      kp1m={state.kpCurrent}
                      dst={state.dst}
                      symh={state.symh}
                      showTimeAxis
                    />
                  </AuroraPanel>
                  <ForecastPanel
                    forecast={state.kpForecast}
                    alerts={state.alerts}
                    showForecast={false}
                    alertsFilter="storm"
                  />
                </>
              )}

              {mobileTab === "slonce" && (
                <>
                  <SunspotRegionsPanel regions={state.solarRegions} />
                  <SolarDataPanel
                    xrayFlux={state.xrayFlux}
                    solarFlares={state.solarFlares}
                    sunspotNumber={state.sunspotNumber}
                  />
                  <ForecastPanel
                    forecast={state.kpForecast}
                    alerts={state.alerts}
                    showForecast={false}
                    alertsFilter="all"
                  />
                </>
              )}
            </div>

            {/* ── DESKTOP: 3 kolumny ── */}
            <div className="hidden lg:block">
              <div className="aurora-desktop-grid grid grid-cols-[minmax(288px,24%)_minmax(0,1fr)_minmax(300px,28%)] xl:grid-cols-[300px_1fr_320px] gap-5 xl:gap-6 mb-4">
                <div className="aurora-desktop-col-label aurora-desktop-col-label--geom">Geomagnetyzm · Zorza</div>
                <div className="aurora-desktop-col-label aurora-desktop-col-label--wind">Wiatr słoneczny · IMF</div>
                <div className="aurora-desktop-col-label aurora-desktop-col-label--ops">Warunki · Słońce</div>
              </div>
              <div className="aurora-desktop-grid grid grid-cols-[minmax(288px,24%)_minmax(0,1fr)_minmax(300px,28%)] xl:grid-cols-[300px_1fr_320px] gap-5 xl:gap-6 items-start">
              <div className="space-y-5 aurora-desktop-col--geom">
                <AuroraPanel
                  title="Indeks Kp"
                  subtitle={`Okres ${kpPeriodLabel} · NOAA SWPC`}
                  action={
                    isStormy ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wider text-orange-400 border border-orange-500/40 bg-orange-500/10">
                        BURZA G{Math.min(5, Math.max(1, Math.floor(currentKp - 4)))}
                      </span>
                    ) : undefined
                  }
                >
                  <div className="flex flex-col items-center py-1">
                    <KpGauge kp={currentKp} size={228} />
                    <KpContextCaption reading={kpReading} className="mt-2 text-center" />
                  </div>
                </AuroraPanel>

                <AuroraPanel title="Mapa zorzy" subtitle="Owale auroralne · Twoja lokalizacja" className="overflow-hidden">
                  <div className="-mx-3 sm:-mx-4 lg:-mx-5 -mb-3 sm:-mb-4 lg:-mb-5">
                    <AuroraMap
                      kp={currentKp}
                      userLat={location.lat}
                      userLon={location.lon}
                      dataReady={!state.loading && state.solarWind.length > 0}
                      compact
                      isVisible={mapVisible}
                    />
                  </div>
                </AuroraPanel>

                <AuroraPanel title="Indeksy godzinowe" subtitle="Hp30 · Hp60">
                  <HpStats hp30={hp30} hp60={hp60} />
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

              <div className="min-w-0 aurora-desktop-col--wind">
                <SolarWindPanel data={state.solarWind} />
              </div>

              <div className="space-y-5 aurora-desktop-col--ops">
                <AuxPanel {...auxProps} />
                <SunspotRegionsPanel regions={state.solarRegions} />
                <SolarDataPanel
                  xrayFlux={state.xrayFlux}
                  solarFlares={state.solarFlares}
                  sunspotNumber={state.sunspotNumber}
                />
                <ForecastPanel
                  forecast={state.kpForecast}
                  alerts={state.alerts}
                  alertsFilter="all"
                />
              </div>
            </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-slate-800/50 px-4 lg:px-6 py-3 lg:py-4 text-[13px] lg:text-[12px] text-slate-600 font-mono text-center">
        NOAA SWPC · Open-Meteo · odświeżanie co 60s ·{" "}
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
    </div>
  );
}
