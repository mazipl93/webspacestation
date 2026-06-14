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
      className={`rounded-xl lg:rounded-2xl lg:aurora-panel-desktop border border-slate-800/90 bg-slate-900/50 lg:bg-slate-900/55 overflow-hidden lg:shadow-[0_4px_28px_rgb(0_0_0_/_0.22)] ${className}`}
    >
      <div className="aurora-panel-head flex items-start justify-between gap-3 px-3 sm:px-4 lg:px-5 py-2.5 lg:py-3.5 border-b border-slate-800/80 bg-slate-950/30 lg:bg-slate-950/40">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] lg:text-[13px] font-bold tracking-[0.14em] lg:tracking-[0.16em] text-slate-200 uppercase truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[13px] lg:text-[13px] text-slate-500 font-mono mt-1 lg:mt-0.5 leading-snug break-words">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="aurora-panel-body p-3 sm:p-4 lg:p-5">{children}</div>
    </section>
  );
}
