"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import type { KpForecast, NoaaAlert } from "@/lib/aurora/api";
import { getKpColor } from "@/lib/aurora/api";
import {
  formatAlertIssueTime,
  formatChartTooltipTime,
  formatForecastAxisLabel,
  parseNoaaTimeTag,
} from "@/lib/aurora/time-display";

interface ForecastPanelProps {
  forecast: KpForecast[];
  alerts: NoaaAlert[];
  /** Pełny widok (desktop); na mobile można wyłączyć sekcje. */
  showAlerts?: boolean;
  showForecast?: boolean;
  /** storm = tylko alerty i ostrzeżenia burz geomagnetycznych */
  alertsFilter?: "all" | "storm";
}

const ALERT_TYPE_COLOR: Record<string, string> = {
  alert: "#ff2222",
  warning: "#ff6600",
  watch: "#ffaa00",
  summary: "#60a5fa",
  info: "#64748b",
};

const ALERT_TYPE_LABEL: Record<string, string> = {
  alert: "ALERT",
  warning: "OSTRZEZENIE",
  watch: "OBSERWACJA",
  summary: "PODSUMOWANIE",
  info: "INFO",
};

function makeAlertKey(alert: NoaaAlert): string {
  return `${alert.productId}_${alert.issueTime}`;
}

export default function ForecastPanel({
  forecast,
  alerts,
  showAlerts = true,
  showForecast = true,
  alertsFilter = "all",
}: ForecastPanelProps) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const cacheRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const toTranslate = alerts.slice(0, 5).filter((a) => {
      const key = makeAlertKey(a);
      return !cacheRef.current[key];
    });

    if (toTranslate.length === 0) return;

    toTranslate.forEach((alert) => {
      const key = makeAlertKey(alert);
      fetch("/api/aurora/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: alert.message, type: alert.type }),
      })
        .then((r) => r.json())
        .then(({ translation }: { translation: string }) => {
          if (translation) {
            cacheRef.current[key] = translation;
            setTranslations((prev) => ({ ...prev, [key]: translation }));
          }
        })
        .catch(() => null);
    });
  }, [alerts]);

  const chartData = forecast.slice(0, 24).map((f) => {
    const raw = f.time.includes("T") ? f.time : f.time.replace(" ", "T") + "Z";
    const iso = raw.endsWith("Z") ? raw : `${raw}Z`;
    const label = isNaN(parseNoaaTimeTag(iso)?.getTime() ?? NaN)
      ? f.time.slice(5, 16)
      : formatForecastAxisLabel(iso);
    const tooltipTime = formatChartTooltipTime(iso);
    return { label, tooltipTime, kp: f.kp, color: getKpColor(f.kp) };
  });

  const maxForecast = Math.max(...forecast.map((f) => f.kp), 0);
  const stormAlerts = alerts.filter((a) => a.type === "alert" || a.type === "warning");
  const visibleAlerts =
    alertsFilter === "storm" ? stormAlerts : alerts;

  return (
    <div className="space-y-4">
      {/* Active Alerts */}
      {showAlerts && visibleAlerts.length > 0 && (
        <div className="rounded-2xl lg:rounded-2xl lg:aurora-panel-desktop border border-slate-800 bg-slate-900/60 lg:bg-slate-900/55 p-4 lg:p-5 min-w-0 lg:shadow-[0_4px_28px_rgb(0_0_0_/_0.22)]">
          <h3 className="text-[15px] lg:text-[13px] font-bold tracking-[0.14em] text-slate-200 uppercase mb-3">
            Alerty NOAA Space Weather
          </h3>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {visibleAlerts.slice(0, 8).map((alert, i) => {
              const key = makeAlertKey(alert);
              const col = ALERT_TYPE_COLOR[alert.type] || "#64748b";
              const lbl = ALERT_TYPE_LABEL[alert.type] || alert.type;
              const translation = translations[key] || cacheRef.current[key];
              const isExpanded = expanded[key] ?? false;

              return (
                <div
                  key={i}
                  className="rounded border p-3"
                  style={{ borderColor: `${col}44`, background: `${col}0a` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[12px] lg:text-xs font-bold px-2 py-0.5 rounded font-mono"
                      style={{ color: col, background: `${col}22`, border: `1px solid ${col}44` }}
                    >
                      {lbl}
                    </span>
                    <span className="text-[11px] lg:text-xs text-slate-500 font-mono leading-snug">
                      {formatAlertIssueTime(alert.issueTime)}
                    </span>
                  </div>

                  {/* Polish translation — prominent */}
                  {i < 5 && (
                    <div className="mb-2">
                      {translation ? (
                        <p className="text-[15px] lg:text-sm text-slate-100 leading-relaxed break-words">
                          {translation}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 font-mono italic">
                          Tlumaczenie...
                        </p>
                      )}
                    </div>
                  )}

                  {/* Original NOAA text — collapsible */}
                  <div>
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
                      }
                      className="text-[9px] lg:text-[11px] text-slate-600 hover:text-slate-400 font-mono transition-colors"
                    >
                      {isExpanded ? "Ukryj oryginal" : "Pokaz oryginal NOAA"}
                    </button>
                    {isExpanded && (
                      <p className="mt-1 text-[9px] lg:text-xs text-slate-500 font-mono leading-relaxed whitespace-pre-wrap break-words">
                        {alert.message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3-day Kp forecast */}
      {showForecast && (
      <div className="rounded-2xl lg:rounded-2xl lg:aurora-panel-desktop border border-slate-800 bg-slate-900/60 lg:bg-slate-900/55 p-4 lg:p-5 min-w-0 lg:shadow-[0_4px_28px_rgb(0_0_0_/_0.22)]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-[15px] lg:text-[13px] font-bold tracking-[0.14em] text-slate-200 uppercase">
              Prognoza indeksu Kp
            </h3>
            <p className="text-[12px] lg:text-[12px] font-mono text-slate-500 mt-1">
              72 h · NOAA SWPC
            </p>
          </div>
          <div className="text-right text-[13px] lg:text-[13px] font-mono shrink-0">
            <span className="text-slate-500 block text-[11px] lg:inline lg:mr-1">Szczyt</span>
            <span style={{ color: getKpColor(maxForecast) }} className="font-bold text-xl lg:text-2xl tabular-nums">
              {maxForecast.toFixed(1)}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={124}>
          <BarChart data={chartData} margin={{ top: 2, right: 4, left: 0, bottom: 2 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 9]}
              tick={{ fontSize: 11, fill: "#64748b", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={20}
            />
            <Tooltip
              contentStyle={{
                background: "#0a0f1e",
                border: "1px solid #334155",
                borderRadius: 4,
                fontSize: 12,
                fontFamily: "monospace",
                color: "#e2e8f0",
              }}
              labelFormatter={(_label, payload) => {
                const row = payload?.[0]?.payload as { tooltipTime?: string } | undefined;
                return row?.tooltipTime ?? String(_label ?? "");
              }}
              formatter={(v: unknown) => [Number(v).toFixed(1), "Kp"]}
            />
            <ReferenceLine y={5} stroke="#ff666633" strokeDasharray="3 3" />
            <Bar dataKey="kp" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  fillOpacity={entry.kp >= 5 ? 0.9 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* Storm badge */}
      {showAlerts && stormAlerts.length > 0 && (
        <div className="rounded-lg border border-red-500/50 bg-red-900/20 p-3 text-center animate-pulse">
          <div className="text-red-400 font-bold text-sm tracking-widest">
            AKTYWNA BURZA GEOMAGNETYCZNA
          </div>
          <div className="text-[10px] lg:text-xs text-red-300/70 font-mono mt-1">
            Sprawdz alerty NOAA powyzej
          </div>
        </div>
      )}
    </div>
  );
}
