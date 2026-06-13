import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  Cpu,
  Globe2,
  ImageIcon,
  Map,
  Newspaper,
  Orbit,
  Play,
  Rocket,
  Sparkles,
  Telescope,
} from "lucide-react";
import { CATEGORY_INFO, getCategoryInfo } from "@/lib/categories";

export type NavMenuLink = {
  label: string;
  href: string;
  /** Category slug or path key for accent color */
  accentKey?: string;
  description?: string;
  icon?: LucideIcon;
  /** Otwórz w nowej karcie (np. pełnoekranowy terminal /zorza) */
  newTab?: boolean;
};

/** Primary nav — SEO order: Misje → Astronomia → Popularnonaukowe → Technologie */
export const NAV_PRIMARY_LINKS: NavMenuLink[] = [
  {
    label: "Aktualności",
    href: "/aktualnosci",
    accentKey: "aktualnosci",
    description: "Wszystkie opublikowane artykuły",
    icon: Newspaper,
  },
  {
    label: CATEGORY_INFO.misje.label,
    href: "/misje",
    accentKey: "misje",
    description: CATEGORY_INFO.misje.description,
    icon: Rocket,
  },
  {
    label: CATEGORY_INFO.astronomia.label,
    href: "/astronomia",
    accentKey: "astronomia",
    description: CATEGORY_INFO.astronomia.description,
    icon: Telescope,
  },
  {
    label: CATEGORY_INFO.nauka.label,
    href: "/nauka",
    accentKey: "nauka",
    description: CATEGORY_INFO.nauka.description,
    icon: BookOpen,
  },
  {
    label: CATEGORY_INFO.technologie.label,
    href: "/technologie",
    accentKey: "technologie",
    description: CATEGORY_INFO.technologie.description,
    icon: Cpu,
  },
];

/** Secondary categories — ISS, Ziemia z kosmosu */
export const NAV_CATEGORY_LINKS: NavMenuLink[] = [
  {
    label: CATEGORY_INFO.iss.label,
    href: "/iss",
    accentKey: "iss",
    description: CATEGORY_INFO.iss.description,
    icon: Orbit,
  },
  {
    label: CATEGORY_INFO["ziemia-z-kosmosu"].label,
    href: "/ziemia-z-kosmosu",
    accentKey: "ziemia-z-kosmosu",
    description: CATEGORY_INFO["ziemia-z-kosmosu"].description,
    icon: Globe2,
  },
];

/** Key topic hubs — shown in nav "Kategorie" dropdown and mobile categories */
export const NAV_HUB_LINKS: NavMenuLink[] = [
  {
    label: "NASA",
    href: "/nasa",
    description: "Misje, programy i odkrycia NASA",
    icon: Rocket,
  },
  {
    label: "SpaceX",
    href: "/spacex",
    description: "Starship, Falcon 9 i Dragon",
    icon: Rocket,
  },
  {
    label: "James Webb (JWST)",
    href: "/jwst",
    description: "Obserwacje najdalszego Wszechswiata",
    icon: Telescope,
  },
  {
    label: "Mars",
    href: "/mars",
    description: "Laziki, misje i plany kolonizacji",
    icon: Globe2,
  },
  {
    label: "Księżyc",
    href: "/ksiezyc",
    description: "Artemis, misje lunarne i zasoby",
    icon: Globe2,
  },
];

export const NAV_MORE_LINKS: NavMenuLink[] = [
  {
    label: "ISS tracker na żywo",
    href: "/mapa",
    accentKey: "mapa",
    description: "Pozycja Międzynarodowej Stacji Kosmicznej na mapie",
    icon: Map,
  },
  {
    label: "Terminal zorzy polarnej",
    href: "/zorza",
    accentKey: "zorza",
    description: "Indeks Kp, prognoza zorzy i dane NOAA na żywo",
    icon: Sparkles,
    newTab: true,
  },
  {
    label: "Starty rakiet na żywo",
    href: "/starty",
    accentKey: "starty",
    description: "Harmonogram startów i odliczanie na żywo",
    icon: Rocket,
  },
  {
    label: "Galeria zdjęć",
    href: "/galeria",
    accentKey: "galeria",
    description: "Zdjęcia i kadry z kosmosu",
    icon: ImageIcon,
  },
  {
    label: "Wideo",
    href: "/wideo",
    accentKey: "wideo",
    description: "Materiały wideo WSS",
    icon: Play,
  },
  {
    label: "Harmonogram startów",
    href: "/kalendarz",
    accentKey: "kalendarz",
    description: "Terminy NET nadchodzących misji",
    icon: Calendar,
  },
];

const MORE_ACCENT = "#38bdf8";

export function navLinkAccent(link: NavMenuLink): string {
  if (link.accentKey && link.accentKey in CATEGORY_INFO) {
    return getCategoryInfo(link.accentKey).color;
  }
  if (link.href === "/aktualnosci") return "#2f6dff";
  if (link.accentKey === "zorza" || link.href === "/zorza") return "#44ff88";
  return MORE_ACCENT;
}

/** Flat list for legacy callers (mobile export). */
export const NAV_ALL_PUBLIC_LINKS: NavMenuLink[] = [
  ...NAV_PRIMARY_LINKS,
  ...NAV_CATEGORY_LINKS,
  ...NAV_HUB_LINKS,
  ...NAV_MORE_LINKS,
];

export const NAV_MOBILE_SECTIONS = [
  { id: "primary", label: "Artykuły", links: NAV_PRIMARY_LINKS, defaultOpen: true },
  { id: "categories", label: "Więcej działów", links: NAV_CATEGORY_LINKS, defaultOpen: false },
  { id: "hubs", label: "Przewodniki", links: NAV_HUB_LINKS, defaultOpen: false },
  { id: "more", label: "Odkrywaj", links: NAV_MORE_LINKS, defaultOpen: false },
] as const;
