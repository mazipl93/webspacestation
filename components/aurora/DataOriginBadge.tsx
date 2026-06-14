type DataOrigin = "earth-now" | "l1-now" | "local" | "noaa-ground";

const ORIGIN_LABEL: Record<DataOrigin, string> = {
  "earth-now": "Teraz na Ziemi",
  "l1-now": "Teraz @ L1",
  local: "Lokalnie",
  "noaa-ground": "Na Ziemi · NOAA",
};

const ORIGIN_CLASS: Record<DataOrigin, string> = {
  "earth-now": "text-amber-200/95 border-amber-400/40 bg-amber-500/12",
  "l1-now": "text-sky-200/95 border-sky-400/40 bg-sky-500/12",
  local: "text-slate-300/90 border-slate-500/40 bg-slate-800/50",
  "noaa-ground": "text-violet-200/90 border-violet-400/35 bg-violet-500/10",
};

/** Etykieta źródła pomiaru (L1 vs propagacja do Ziemi). */
export default function DataOriginBadge({
  origin,
  className = "",
}: {
  origin: DataOrigin;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-block font-mono font-bold uppercase tracking-wide",
        "text-[9px] lg:text-[10px] leading-none",
        "px-1.5 py-0.5 rounded border",
        ORIGIN_CLASS[origin],
        className,
      ].join(" ")}
    >
      {ORIGIN_LABEL[origin]}
    </span>
  );
}
