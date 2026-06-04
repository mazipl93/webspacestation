export type HomepageSectionTheme =
  | "week-topic"
  | "latest"
  | "popular"
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
  technologie: "Innowacje · hardware · orbita",
  rozrywka: "Gry · filmy · sci-fi",
  astronomia: "Teleskopy · galaktyki · odkrycia",
  misje: "Lądowania · sondy · głęboka przestrzeń",
  "ziemia-z-kosmosu": "Obserwacje · klimat · planeta",
  iss: "Badania · załoga · stacja",
};

export function categorySectionTheme(
  slug: string,
  meta: { label: string; color: string; href: string; description: string },
): SectionThemeConfig {
  const themeMap: Record<string, HomepageSectionTheme> = {
    technologie: "technologie",
    rozrywka: "rozrywka",
    astronomia: "astronomia",
    misje: "misje",
    "ziemia-z-kosmosu": "ziemia-z-kosmosu",
    iss: "iss",
  };

  const accentAlt: Partial<Record<string, string>> = {
    astronomia: "#6366f1",
    technologie: "#2f6dff",
    rozrywka: "#fb7185",
    misje: "#60a5fa",
    "ziemia-z-kosmosu": "#4ade80",
    iss: "#ff9500",
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
