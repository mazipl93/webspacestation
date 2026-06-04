import type { PortalPageThemeId } from "@/lib/ui/portal-page-themes";

/** Płaskie ciemne tło strony + NAV — bez boksów, bez wzorów, bez gwiazd. */
type PortalThemePack = {
  fill: string;
  onPage: string;
  onPageMuted: string;
  navFgMuted: string;
  navFgSoft: string;
  navAccent: string;
  navBorder: string;
};

function packToCss(p: PortalThemePack): Record<string, string> {
  const fg = p.onPage;
  const fgMuted = p.onPageMuted;
  const fgSoft = p.navFgSoft;
  return {
    "--color-page-fill": p.fill,
    "--color-page-fill-deep": p.fill,
    "--color-page-bg": p.fill,
    "--color-page-bg-top": p.fill,
    "--color-nav-surface": p.fill,
    "--color-nav-surface-deep": p.fill,
    "--color-nav-fg": fg,
    "--color-nav-fg-muted": p.navFgMuted,
    "--color-nav-fg-soft": fgSoft,
    "--color-on-page": fg,
    "--color-on-page-muted": fgMuted,
    "--color-panel-bg": "transparent",
    "--color-panel-fg": fg,
    "--color-panel-fg-muted": fgMuted,
    "--color-panel-border": "transparent",
    "--portal-panel-shadow": "none",
    "--portal-panel-shadow-hover": "none",
    "--portal-nav-line": p.navAccent,
    "--portal-nav-border": p.navBorder,
    "--portal-card-border": "transparent",
    "--color-space-bg": "transparent",
    "--color-space-card": "transparent",
    "--color-space-surface": "transparent",
    "--color-space-elevated": "transparent",
    "--color-space-border": "transparent",
    "--color-space-muted": "transparent",
    "--color-text-primary": fg,
    "--color-text-secondary": fgMuted,
    "--color-text-tertiary": fgSoft,
    "--color-text-muted": fgSoft,
    "--hairline": "transparent",
    "--hairline-strong": "transparent",
    "--hairline-faint": "transparent",
    "--glass-fill": "rgba(255, 255, 255, 0.06)",
    "--glass-fill-hover": "rgba(255, 255, 255, 0.1)",
  };
}

const PACKS: Record<PortalPageThemeId, PortalThemePack> = {
  "focus-classic": {
    fill: "#0c1424",
    onPage: "#eef2f8",
    onPageMuted: "#9aa8c0",
    navFgMuted: "#d0d8e8",
    navFgSoft: "#6a7a94",
    navAccent: "#38bdf8",
    navBorder: "#1e2d48",
  },
  "paper-warm": {
    fill: "#1a120c",
    onPage: "#f5f0ea",
    onPageMuted: "#b0a498",
    navFgMuted: "#dcd4c8",
    navFgSoft: "#887868",
    navAccent: "#f59e0b",
    navBorder: "#3a2818",
  },
  "cool-mist": {
    fill: "#060a14",
    onPage: "#e8f0fa",
    onPageMuted: "#94a8c4",
    navFgMuted: "#ccd8ec",
    navFgSoft: "#5a7090",
    navAccent: "#60a5fa",
    navBorder: "#182438",
  },
  "slate-soft": {
    fill: "#060810",
    onPage: "#f3f5fa",
    onPageMuted: "#a0a8bc",
    navFgMuted: "#d4dae8",
    navFgSoft: "#6e7894",
    navAccent: "#7dd3fc",
    navBorder: "#1a2238",
  },
  "sky-light": {
    fill: "#081820",
    onPage: "#ecf6fc",
    onPageMuted: "#88b0c8",
    navFgMuted: "#c8e0f0",
    navFgSoft: "#5080a0",
    navAccent: "#22d3ee",
    navBorder: "#143040",
  },
  "rose-blush": {
    fill: "#180810",
    onPage: "#faf0f2",
    onPageMuted: "#c0a0a8",
    navFgMuted: "#e8d0d6",
    navFgSoft: "#906070",
    navAccent: "#fb7185",
    navBorder: "#301820",
  },
  "lavender-mist": {
    fill: "#100818",
    onPage: "#f4f0fc",
    onPageMuted: "#b0a0c8",
    navFgMuted: "#ddd0f0",
    navFgSoft: "#7868a0",
    navAccent: "#a78bfa",
    navBorder: "#241c38",
  },
  "sage-calm": {
    fill: "#081008",
    onPage: "#ecf6f0",
    onPageMuted: "#90b0a0",
    navFgMuted: "#cce0d4",
    navFgSoft: "#507060",
    navAccent: "#4ade80",
    navBorder: "#1a2820",
  },
  "sand-editorial": {
    fill: "#141008",
    onPage: "#f5f2ec",
    onPageMuted: "#b8a890",
    navFgMuted: "#dcd4c4",
    navFgSoft: "#887860",
    navAccent: "#fcd34d",
    navBorder: "#282018",
  },
  "night-editor": {
    fill: "#030306",
    onPage: "#fafafa",
    onPageMuted: "#9ca3af",
    navFgMuted: "#e4e4e7",
    navFgSoft: "#71717a",
    navAccent: "#ffffff",
    navBorder: "#1a1a20",
  },
};

export const PORTAL_PAGE_THEME_CSS: Record<
  PortalPageThemeId,
  Record<string, string>
> = Object.fromEntries(
  (Object.keys(PACKS) as PortalPageThemeId[]).map((id) => [
    id,
    packToCss(PACKS[id]),
  ]),
) as Record<PortalPageThemeId, Record<string, string>>;

export function applyPortalPageTheme(id: PortalPageThemeId): void {
  const root = document.documentElement;
  root.dataset.portalTheme = id;
  const vars = PORTAL_PAGE_THEME_CSS[id];
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}
