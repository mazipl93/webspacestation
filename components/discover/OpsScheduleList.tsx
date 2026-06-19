import Link from "next/link";
import type { OpsCalendarEvent } from "@/lib/ops/types";

type Props = {
  events: OpsCalendarEvent[];
  limit?: number;
  href?: string;
};

export default function OpsScheduleList({ events, limit = 5, href = "/starty" }: Props) {
  const sorted = [...events]
    .sort((a, b) => new Date(a.net).getTime() - new Date(b.net).getTime())
    .slice(0, limit);

  if (sorted.length === 0) {
    return (
      <p className="text-[12px] text-text-tertiary">Brak zaplanowanych startów w harmonogramie.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {sorted.map((ev, index) => (
        <li key={ev.id}>
          <Link
            href={href}
            className="group flex gap-3 rounded-lg border border-hairline-faint px-3 py-2.5 transition-colors hover:border-hairline-strong hover:bg-glass/30"
          >
            <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-md border border-hairline bg-glass py-1.5">
              <span
                className={
                  index === 0
                    ? "text-[10px] font-bold uppercase tracking-[0.08em] text-accent-cyan"
                    : "text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted"
                }
              >
                {index === 0 ? "Nast." : "NET"}
              </span>
              <span className="mt-0.5 text-center text-[11px] font-bold leading-tight text-text-primary">
                {ev.dateLabel}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-text-primary group-hover:text-accent-cyan">
                {ev.title}
              </p>
              {ev.hint && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-tertiary">
                  {ev.hint}
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
