export type HomepageSectionTheme =
  | "week-topic"
  | "latest"
  | "popular"
  | "popularnonaukowe"
  | "technologie"
  | "rozrywka"
  | "astronomia"
  | "misje"
  | "ziemia-z-kosmosu"
  | "iss"
  | "ops";

export type SectionThemeConfig = {
  theme: HomepageSectionTheme;
  accent: string;
  accentAlt?: string;
  kicker: string;
  label: string;
  subtitle?: string;
  href?: string;
  live?: boolean;
};

export const POPULAR_THEME: SectionThemeConfig = {
  theme: "popular",
  accent: "#ffb830",
  accentAlt: "#ff6b2c",
  kicker: "Czytane najczęściej",
  label: "Popularne",
  href: "/aktualnosci",
};

export const OPS_THEME: SectionThemeConfig = {
  theme: "ops",
  accent: "#ff453a",
  accentAlt: "#ff9500",
  kicker: "Na żywo z kosmosu",
  label: "Centrum operacyjne",
  subtitle:
    "Skrót tego, co dzieje się na orbicie i na platformach startowych — starty, ISS i mapa satelitarna. Dane z publicznych API.",
  href: "/starty",
  live: true,
};

const CATEGORY_KICKERS: Record<string, string> = {
  misje: "Lądowania · sondy · głęboka przestrzeń",
  astronomia: "Teleskopy · galaktyki · odkrycia",
  popularnonaukowe: "Wyjaśnienia · przewodniki · evergreen",
  technologie: "Innowacje · hardware · orbita",
  iss: "Badania · załoga · stacja",
  "ziemia-z-kosmosu": "Obserwacje · klimat · planeta",
  rozrywka: "Gry · filmy · sci-fi",
};

export function categorySectionTheme(
  slug: string,
  meta: { label: string; color: string; href: string; description: string },
): SectionThemeConfig {
  const themeMap: Record<string, HomepageSectionTheme> = {
    misje: "misje",
    astronomia: "astronomia",
    popularnonaukowe: "popularnonaukowe",
    technologie: "technologie",
    iss: "iss",
    "ziemia-z-kosmosu": "ziemia-z-kosmosu",
    rozrywka: "rozrywka",
  };

  const accentAlt: Partial<Record<string, string>> = {
    misje: "#60a5fa",
    astronomia: "#6366f1",
    popularnonaukowe: "#2dd4bf",
    technologie: "#2f6dff",
    iss: "#ff9500",
    "ziemia-z-kosmosu": "#4ade80",
    rozrywka: "#fb7185",
  };

  return {
    theme: themeMap[slug] ?? "technologie",
    accent: meta.color,
    accentAlt: accentAlt[slug],
    kicker: CATEGORY_KICKERS[slug] ?? meta.label,
    label: meta.label,
    subtitle: meta.description,
    href: meta.href,
  };
}

export function weekTopicTheme(
  config: { label: string; accent: string; subtitle?: string },
): SectionThemeConfig {
  return {
    theme: "week-topic",
    accent: config.accent,
    accentAlt: "#c084fc",
    kicker: "W centrum uwagi",
    label: config.label,
    subtitle: config.subtitle,
    href: "/aktualnosci",
  };
}

export const LATEST_THEME: SectionThemeConfig = {
  theme: "latest",
  accent: "#38bdf8",
  accentAlt: "#2f6dff",
  kicker: "Na bieżąco",
  label: "Najnowsze",
  href: "/aktualnosci",
  live: true,
};
