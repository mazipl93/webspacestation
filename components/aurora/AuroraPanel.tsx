import type { ReactNode } from "react";

interface AuroraPanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Spójna karta sekcji terminala. */
export default function AuroraPanel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: AuroraPanelProps) {
  return (
    <section
      className={`rounded-xl border border-slate-800/90 bg-slate-900/50 overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/30">
        <div className="min-w-0">
          <h2 className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-200 uppercase truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[9px] text-slate-500 font-mono mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}
