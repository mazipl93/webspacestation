/** Presety dev: płaskie ciemne tło — bez boksów, bez wzorów. */

export type PortalPageThemeId =
  | "focus-classic"
  | "paper-warm"
  | "cool-mist"
  | "slate-soft"
  | "sky-light"
  | "rose-blush"
  | "lavender-mist"
  | "sage-calm"
  | "sand-editorial"
  | "night-editor";

export type PortalPageTheme = {
  id: PortalPageThemeId;
  label: string;
  hint: string;
};

export const PORTAL_PAGE_THEMES: PortalPageTheme[] = [
  {
    id: "focus-classic",
    label: "1 · Granat",
    hint: "Ciemny granat (#0c1424).",
  },
  {
    id: "paper-warm",
    label: "2 · Ciepła czerń",
    hint: "Brązowo-czarna (#1a120c).",
  },
  {
    id: "cool-mist",
    label: "3 · Lodowa czerń",
    hint: "Prawie czarna z chłodnym odcieniem (#060a14).",
  },
  {
    id: "slate-soft",
    label: "4 · Głęboki granat ★",
    hint: "Domyślny (#060810).",
  },
  {
    id: "sky-light",
    label: "5 · Teal-czarny",
    hint: "Ciemny morski (#081820).",
  },
  {
    id: "rose-blush",
    label: "6 · Wiśniowa czerń",
    hint: "Czerń z ciepłym różem (#180810).",
  },
  {
    id: "lavender-mist",
    label: "7 · Fioletowa czerń",
    hint: "Głęboki fiolet (#100818).",
  },
  {
    id: "sage-calm",
    label: "8 · Leśna czerń",
    hint: "Czerń ze zielonym (#081008).",
  },
  {
    id: "sand-editorial",
    label: "9 · Piaskowa czerń",
    hint: "Ciepła żółto-czarna (#141008).",
  },
  {
    id: "night-editor",
    label: "10 · Próżnia",
    hint: "Prawie czysta czerń (#030306).",
  },
];

export const PORTAL_PAGE_THEME_STORAGE_KEY = "wss-portal-page-theme-v5";

export const DEFAULT_PORTAL_PAGE_THEME: PortalPageThemeId = "slate-soft";

export function isPortalPageThemeId(value: string): value is PortalPageThemeId {
  return PORTAL_PAGE_THEMES.some((t) => t.id === value);
}
