import { cn } from "@/lib/cn";

/** Przycisk / link wewnątrz paska nawigacji desktop. */
export function navTrackLinkClass(active: boolean) {
  return cn(
    "relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all duration-200 xl:px-3 xl:text-[13px]",
    active
      ? "bg-white/[0.08] text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      : "text-text-secondary hover:bg-white/[0.05] hover:text-text-primary",
  );
}

export const NAV_DESKTOP_TRACK =
  "flex items-center gap-0.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

export const NAV_DESKTOP_ACTIONS =
  "flex items-center gap-0.5 lg:rounded-xl lg:border lg:border-white/[0.06] lg:bg-white/[0.02] lg:p-0.5";

export function navTrackDropdownTriggerClass(active: boolean, open: boolean) {
  return cn(
    navTrackLinkClass(active || open),
    "flex items-center gap-1",
  );
}
