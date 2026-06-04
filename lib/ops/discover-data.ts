import type { CSSProperties } from "react";

/** Curated ops data — shared by homepage panel and Odkrywaj pages until live API (krok 6). */

export type LaunchData = {
  id: string;
  provider: string;
  mission: string;
  prefix?: string;
  h: string;
  m: string;
  s: string;
  site: string;
  hue: number;
  image: string;
  windowLabel?: string;
};

export const OPS_LAUNCHES: LaunchData[] = [
  {
    id: "falcon9-slc40",
    provider: "SpaceX",
    mission: "Falcon 9 · Starlink Group",
    h: "02",
    m: "31",
    s: "12",
    site: "SLC-40, Cape Canaveral",
    hue: 212,
    windowLabel: "Okno startowe · UTC",
    image:
      "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "starship-flight14",
    provider: "SpaceX",
    mission: "Starship Flight 14",
    prefix: "5 dni",
    h: "14",
    m: "22",
    s: "41",
    site: "Starbase, Teksas",
    hue: 26,
    windowLabel: "Test lotu · Boca Chica",
    image:
      "https://images.unsplash.com/photo-1457364887197-9150188c107b?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "ariane6-kourou",
    provider: "ArianeGroup",
    mission: "Ariane 6",
    prefix: "12 dni",
    h: "06",
    m: "11",
    s: "07",
    site: "Kourou, Gujana Francuska",
    hue: 156,
    windowLabel: "Komercyjny start",
    image:
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "new-glenn-lc36",
    provider: "Blue Origin",
    mission: "New Glenn",
    prefix: "18 dni",
    h: "03",
    m: "45",
    s: "32",
    site: "LC-36, Cape Canaveral",
    hue: 268,
    windowLabel: "Pierwszy lot operacyjny",
    image:
      "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=70",
  },
];

export type MissionPin = {
  id: string;
  name: string;
  planet: string;
  color: string;
  style: CSSProperties;
};

export const OPS_MISSION_PINS: MissionPin[] = [
  {
    id: "perseverance",
    name: "Perseverance",
    planet: "Mars",
    color: "#e0683a",
    style: { top: "12%", right: "30%" },
  },
  {
    id: "europa-clipper",
    name: "Europa Clipper",
    planet: "Jowisz",
    color: "#2f6dff",
    style: { top: "14%", right: "7%" },
  },
  {
    id: "artemis-ii",
    name: "Artemis II",
    planet: "Księżyc",
    color: "#a3afc7",
    style: { top: "56%", right: "42%" },
  },
  {
    id: "iss",
    name: "ISS",
    planet: "Ziemia",
    color: "#38bdf8",
    style: { top: "52%", left: "30%" },
  },
  {
    id: "solar-orbiter",
    name: "Solar Orbiter",
    planet: "Słońce",
    color: "#ffb830",
    style: { top: "44%", right: "2%" },
  },
];

export type TimelineEvent = {
  id: string;
  quarter: string;
  title: string;
  active?: boolean;
  /** Krótki kontekst na stronie /kalendarz */
  hint?: string;
};

export const OPS_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "starship-14",
    quarter: "Q1",
    title: "Starship\nFlight 14",
    active: true,
    hint: "Test lotu · Starbase",
  },
  {
    id: "artemis-ii",
    quarter: "Q2",
    title: "Artemis II\nMisja załogowa",
    hint: "NASA · orbita Księżyca",
  },
  {
    id: "ariane-kuiper",
    quarter: "Q2",
    title: "Ariane 6\nKuiper Launch",
    hint: "ESA · Gujana",
  },
  {
    id: "gateway",
    quarter: "Q3",
    title: "Lunar Gateway\nElementy",
    hint: "Międzynarodowa stacja",
  },
  {
    id: "msr",
    quarter: "Q4",
    title: "Mars Sample\nReturn",
    hint: "Planowany etap MSR",
  },
];

export const OPS_LAUNCH_IMAGE_GRADIENT = {
  launchHue: (h: number) =>
    `radial-gradient(ellipse at 50% 90%, hsla(${h},80%,56%,0.46) 0%, hsla(${h},66%,36%,0.2) 22%, transparent 48%), linear-gradient(180deg, #060b14 0%, #08111f 100%)`,
};
