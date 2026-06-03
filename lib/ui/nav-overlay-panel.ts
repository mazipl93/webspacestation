/** Shared positioning for navbar search / notifications — avoids clipping off-screen on mobile. */
export const NAV_OVERLAY_BACKDROP = "fixed inset-0 z-[55]";

export const NAV_OVERLAY_PANEL_BASE =
  "z-[60] overflow-hidden rounded-2xl border border-hairline shadow-2xl";

export const NAV_OVERLAY_PANEL_STYLE = {
  background: "rgba(12,16,24,0.96)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
} as const;

/** Below fixed navbar (h-[4.25rem] / sm:h-16), full width with safe gutters on small screens. */
export const NAV_OVERLAY_PANEL_POSITION =
  "max-sm:fixed max-sm:inset-x-4 max-sm:top-[calc(4.25rem+0.5rem)] max-sm:w-auto max-sm:max-w-none max-sm:origin-top sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:origin-top-right";
