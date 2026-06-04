import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ImageIcon,
  Map,
  Newspaper,
  Play,
  Rocket,
  Telescope,
  Cpu,
  Gamepad2,
  Globe2,
  Orbit,
} from "lucide-react";
import { CATEGORY_INFO, getCategoryInfo } from "@/lib/categories";

export type NavMenuLink = {
  label: string;
  href: string;
  /** Category slug or path key for accent color */
  accentKey?: string;
  description?: string;
  icon?: LucideIcon;
};

export const NAV_PRIMARY_LINKS: NavMenuLink[] = [
  {
    label: "Aktualności",
    href: "/aktualnosci",
    accentKey: "aktualnosci",
    description: "Wszystkie opublikowane artykuły",
    icon: Newspaper,
  },
  {
    label: "Misje",
    href: "/misje",
    accentKey: "misje",
    description: CATEGORY_INFO.misje.description,
    icon: Rocket,
  },
  {
    label: "Astronomia",
    href: "/astronomia",
    accentKey: "astronomia",
    description: CATEGORY_INFO.astronomia.description,
    icon: Telescope,
  },
  {
    label: "Technologie",
    href: "/technologie",
    accentKey: "technologie",
    description: CATEGORY_INFO.technologie.description,
    icon: Cpu,
  },
  {
    label: "Rozrywka",
    href: "/rozrywka",
    accentKey: "rozrywka",
    description: CATEGORY_INFO.rozrywka.description,
    icon: Gamepad2,
  },
];

export const NAV_CATEGORY_LINKS: NavMenuLink[] = [
  {
    label: CATEGORY_INFO["ziemia-z-kosmosu"].label,
    href: "/ziemia-z-kosmosu",
    accentKey: "ziemia-z-kosmosu",
    description: CATEGORY_INFO["ziemia-z-kosmosu"].description,
    icon: Globe2,
  },
  {
    label: CATEGORY_INFO.iss.label,
    href: "/iss",
    accentKey: "iss",
    description: CATEGORY_INFO.iss.description,
    icon: Orbit,
  },
];

export const NAV_MORE_LINKS: NavMenuLink[] = [
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
    label: "Kalendarz startów",
    href: "/kalendarz",
    accentKey: "kalendarz",
    description: "Nadchodzące starty rakiet",
    icon: Calendar,
  },
  {
    label: "Mapa kosmosu",
    href: "/mapa",
    accentKey: "mapa",
    description: "Interaktywna mapa obiektów",
    icon: Map,
  },
];

const MORE_ACCENT = "#38bdf8";

export function navLinkAccent(link: NavMenuLink): string {
  if (link.accentKey && link.accentKey in CATEGORY_INFO) {
    return getCategoryInfo(link.accentKey).color;
  }
  if (link.href === "/aktualnosci") return "#2f6dff";
  return MORE_ACCENT;
}

/** Flat list for legacy callers (mobile export). */
export const NAV_ALL_PUBLIC_LINKS: NavMenuLink[] = [
  ...NAV_PRIMARY_LINKS,
  ...NAV_CATEGORY_LINKS,
  ...NAV_MORE_LINKS,
];

export const NAV_MOBILE_SECTIONS = [
  { id: "primary", label: "Artykuły", links: NAV_PRIMARY_LINKS, defaultOpen: true },
  { id: "categories", label: "Kategorie", links: NAV_CATEGORY_LINKS, defaultOpen: false },
  { id: "more", label: "Odkrywaj", links: NAV_MORE_LINKS, defaultOpen: false },
] as const;
