export type HomepageSectionTheme =
  | "week-topic"
  | "latest"
  | "popular"
  | "nauka"
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
  href: "/starty",
  live: true,
};

export function categorySectionTheme(
  slug: string,
  meta: { label: string; color: string; href: string },
): SectionThemeConfig {
  const themeMap: Record<string, HomepageSectionTheme> = {
    misje: "misje",
    astronomia: "astronomia",
    nauka: "nauka",
    technologie: "technologie",
    iss: "iss",
    "ziemia-z-kosmosu": "ziemia-z-kosmosu",
    rozrywka: "rozrywka",
  };

  const accentAlt: Partial<Record<string, string>> = {
    misje: "#60a5fa",
    astronomia: "#6366f1",
    nauka: "#2dd4bf",
    technologie: "#2f6dff",
    iss: "#ff9500",
    "ziemia-z-kosmosu": "#4ade80",
    rozrywka: "#fb7185",
  };

  return {
    theme: themeMap[slug] ?? "technologie",
    accent: meta.color,
    accentAlt: accentAlt[slug],
    kicker: "",
    label: meta.label,
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
    subtitle: config.subtitle?.trim() || undefined,
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
