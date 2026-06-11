type Props = {
  /** stale = ostatni harmonogram z cache; paused = brak danych LL2 */
  variant?: "stale" | "paused";
};

const LABELS: Record<NonNullable<Props["variant"]>, string> = {
  stale: "Ostatni sygnał",
  paused: "Anteny w ruchu",
};

export default function OpsPreviewBadge({ variant = "stale" }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-glass px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
      {LABELS[variant]}
    </span>
  );
}
