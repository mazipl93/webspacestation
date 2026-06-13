import { getSiteUrl } from "@/lib/site-url";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
} from "@/lib/seo/site-og";

/** Visual + SEO config for per-page Open Graph images. */
export type OgPageEntry = {
  /** Route segment for /og/[id], usually slug without leading slash. */
  id: string;
  path: `/${string}` | "/";
  /** Large text on OG card. */
  headline: string;
  /** Secondary line on OG card. */
  subtitle: string;
  /** og:image:alt, unique per page. */
  alt: string;
  /** Brand accent (hex). */
  accent?: string;
  /** Photo background from /public (optional). */
  backgroundImage?: string;
  /** sharp resize position when cropping photo (default centre). */
  backgroundPosition?: "centre" | "bottom" | "top" | "attention";
  /** CSS gradient fallback when no photo. */
  gradient?: string;
  /** Polish SEO keywords for listing/tool pages. */
  keywords?: string[];
};

export const OG_PAGE_REGISTRY: Record<string, OgPageEntry> = {
  home: {
    id: "home",
    path: "/",
    headline: "Portal informacyjny o kosmosie",
    subtitle:
      "Wiadomości, analizy i wiedza · misje · astronomia · nauka · narzędzia na żywo",
    alt: "Web Space Station, portal informacyjny o kosmosie: aktualności, artykuły i narzędzia live",
    accent: "#38bdf8",
    backgroundImage: "/og/home-cover.jpg",
    keywords: [
      "aktualności kosmiczne",
      "newsy kosmos",
      "kosmos",
      "astronomia",
      "ISS tracker",
      "zorza polarna",
      "starty rakiet",
      "misje kosmiczne",
      "NASA",
      "SpaceX",
    ],
  },
  zorza: {
    id: "zorza",
    path: "/zorza",
    headline: "Czy dziś będzie zorza?",
    subtitle: "Indeks Kp · prognoza NOAA · space weather",
    alt: "Zorza polarna na żywo, indeks geomagnetyczny Kp i prognoza aurora borealis",
    accent: "#34d399",
    backgroundImage: "/og/zorza-cover.jpg",
    backgroundPosition: "centre",
    keywords: [
      "zorza polarna",
      "zorza polarna dziś",
      "indeks Kp",
      "czy dziś będzie zorza",
      "prognoza zorzy",
      "aurora borealis",
      "space weather",
      "burza geomagnetyczna",
    ],
  },
  mapa: {
    id: "mapa",
    path: "/mapa",
    headline: "ISS tracker na żywo",
    subtitle: "Gdzie jest ISS · orbita · mapa startów rakiet",
    alt: "ISS tracker na żywo, mapa pozycji Międzynarodowej Stacji Kosmicznej na orbicie",
    accent: "#ffb830",
    backgroundImage: "/og/home-cover.jpg",
    keywords: [
      "ISS tracker",
      "gdzie jest ISS",
      "ISS na żywo",
      "pozycja ISS",
      "orbita ISS",
      "mapa ISS",
      "Międzynarodowa Stacja Kosmiczna",
    ],
  },
  starty: {
    id: "starty",
    path: "/starty",
    headline: "Starty rakiet na żywo",
    subtitle: "Harmonogram · odliczanie · SpaceX · NASA · ESA",
    alt: "Starty rakiet, harmonogram nadchodzących misji i odliczanie na żywo",
    accent: "#f97316",
    backgroundImage: "/og/home-cover.jpg",
    keywords: [
      "starty rakiet",
      "harmonogram startów",
      "kiedy start rakiety",
      "SpaceX start",
      "start rakiety dziś",
      "odliczanie do startu",
    ],
  },
  kalendarz: {
    id: "kalendarz",
    path: "/kalendarz",
    headline: "Harmonogram startów rakiet",
    subtitle: "Terminy NET · oś czasu misji kosmicznych",
    alt: "Kalendarz startów rakiet, terminy i harmonogram misji kosmicznych",
    accent: "#38bdf8",
    backgroundImage: "/og/home-cover.jpg",
    keywords: [
      "harmonogram startów",
      "kalendarz startów rakiet",
      "terminy startów",
      "plan startów SpaceX",
      "NET start rakiety",
    ],
  },
  aktualnosci: {
    id: "aktualnosci",
    path: "/aktualnosci",
    headline: "Aktualności kosmiczne",
    subtitle: "Newsy · misje · astronomia · technologie",
    alt: "Aktualności kosmiczne, najnowsze wiadomości ze świata kosmosu i astronomii",
    accent: "#2f6dff",
    backgroundImage: "/og/home-cover.jpg",
    keywords: [
      "aktualności kosmiczne",
      "newsy kosmos",
      "wiadomości kosmiczne",
      "kosmos news",
      "astronomia aktualności",
    ],
  },
  misje: {
    id: "misje",
    path: "/misje",
    headline: "Misje kosmiczne",
    subtitle: "Starty · eksploracja · programy NASA i SpaceX",
    alt: "Misje kosmiczne, artykuły o startach rakiet i programach kosmicznych",
    accent: "#2f6dff",
    backgroundImage: "/og/home-cover.jpg",
    keywords: [
      "misje kosmiczne",
      "programy kosmiczne",
      "starty rakiet",
      "NASA misje",
      "SpaceX misje",
      "eksploracja kosmosu",
    ],
  },
  astronomia: {
    id: "astronomia",
    path: "/astronomia",
    headline: "Astronomia",
    subtitle: "Teleskopy · galaktyki · egzoplanety · odkrycia",
    alt: "Astronomia, odkrycia astronomiczne, teleskopy kosmiczne i tajemnice wszechświata",
    accent: "#a855f7",
    backgroundImage: "/images/ops-pads/aurora.jpg",
    keywords: [
      "astronomia",
      "odkrycia astronomiczne",
      "teleskop kosmiczny",
      "egzoplanety",
      "galaktyki",
      "JWST",
    ],
  },
  nauka: {
    id: "nauka",
    path: "/nauka",
    headline: "Nauka · jak działa kosmos",
    subtitle: "Fizyka · astronomia od podstaw · evergreen",
    alt: "Nauka, przewodniki o fizyce kosmosu, astronomii i technologiach orbitalnych",
    accent: "#14b8a6",
    gradient:
      "radial-gradient(ellipse at 48% 42%, rgba(20,184,166,0.44) 0%, transparent 52%), linear-gradient(145deg, #041210 0%, #061018 100%)",
    keywords: [
      "nauka o kosmosie",
      "jak działa kosmos",
      "fizyka kosmosu",
      "astronomia dla każdego",
      "kosmos od podstaw",
    ],
  },
  technologie: {
    id: "technologie",
    path: "/technologie",
    headline: "Technologie kosmiczne",
    subtitle: "Rakiety · satelity · AI w nauce",
    alt: "Technologie kosmiczne, rakiety, satelity, teleskopy i innowacje",
    accent: "#38bdf8",
    gradient:
      "radial-gradient(ellipse at 50% 94%, rgba(90,140,255,0.34) 0%, transparent 36%), linear-gradient(160deg, #050a13 0%, #070e1a 100%)",
    keywords: [
      "technologie kosmiczne",
      "rakiety",
      "satelity",
      "innovacje kosmiczne",
      "AI w nauce",
    ],
  },
  iss: {
    id: "iss",
    path: "/iss",
    headline: "Międzynarodowa Stacja Kosmiczna",
    subtitle: "Załogi · EVA · eksperymenty na orbicie",
    alt: "ISS, aktualności z Międzynarodowej Stacji Kosmicznej, spacery i eksperymenty",
    accent: "#ffb830",
    backgroundImage: "/og/home-cover.jpg",
    keywords: [
      "ISS",
      "Międzynarodowa Stacja Kosmiczna",
      "stacja kosmiczna",
      "spacer kosmiczny EVA",
      "załoga ISS",
    ],
  },
  "ziemia-z-kosmosu": {
    id: "ziemia-z-kosmosu",
    path: "/ziemia-z-kosmosu",
    headline: "Ziemia z kosmosu",
    subtitle: "Satelity · pogoda · klimat z orbity",
    alt: "Ziemia z kosmosu, obserwacje satelitarne, pogoda i klimat z orbity",
    accent: "#22c55e",
    gradient:
      "radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, transparent 56%), linear-gradient(135deg, #04101f 0%, #061224 100%)",
    keywords: [
      "Ziemia z kosmosu",
      "obserwacje satelitarne",
      "pogoda z orbity",
      "klimat satelity",
      "Ziemia z orbity",
    ],
  },
  nasa: {
    id: "nasa",
    path: "/nasa",
    headline: "NASA",
    subtitle: "Misje · Artemis · odkrycia · starty",
    alt: "NASA, artykuły o misjach, programach i odkryciach agencji NASA",
    accent: "#1d9bf0",
    gradient:
      "radial-gradient(ellipse at 60% 30%, rgba(29,155,240,0.4) 0%, transparent 55%), linear-gradient(145deg, #060810 0%, #0a1520 100%)",
    keywords: ["NASA", "misje NASA", "Artemis", "program kosmiczny USA"],
  },
  spacex: {
    id: "spacex",
    path: "/spacex",
    headline: "SpaceX",
    subtitle: "Falcon · Starship · Starlink · starty",
    alt: "SpaceX, artykuły o rakietach Falcon, Starship i startach SpaceX",
    accent: "#ffffff",
    gradient:
      "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.12) 0%, transparent 50%), linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 100%)",
    keywords: ["SpaceX", "Starship", "Falcon 9", "start SpaceX", "Starlink"],
  },
  esa: {
    id: "esa",
    path: "/esa",
    headline: "ESA",
    subtitle: "Europejska agencja kosmiczna · misje",
    alt: "ESA, artykuły o Europejskiej Agencji Kosmicznej i jej misjach",
    accent: "#003399",
    gradient:
      "radial-gradient(ellipse at 55% 35%, rgba(0,51,153,0.5) 0%, transparent 55%), linear-gradient(145deg, #060810 0%, #0a1020 100%)",
    keywords: ["ESA", "Europejska Agencja Kosmiczna", "misje ESA"],
  },
  jwst: {
    id: "jwst",
    path: "/jwst",
    headline: "James Webb Space Telescope",
    subtitle: "Obrazy · odkrycia · astronomia infraczerwona",
    alt: "JWST, Kosmiczny Teleskop Jamesa Webba, obrazy i odkrycia",
    accent: "#fbbf24",
    gradient:
      "radial-gradient(ellipse at 50% 45%, rgba(251,191,36,0.35) 0%, transparent 55%), linear-gradient(145deg, #0a0810 0%, #1a1020 100%)",
    keywords: ["JWST", "James Webb", "teleskop Webb", "obrazy JWST"],
  },
  hubble: {
    id: "hubble",
    path: "/hubble",
    headline: "Hubble",
    subtitle: "Kosmiczny Teleskop Hubble'a · odkrycia",
    alt: "Hubble, Kosmiczny Teleskop Hubble'a i jego odkrycia astronomiczne",
    accent: "#60a5fa",
    gradient:
      "radial-gradient(ellipse at 50% 40%, rgba(96,165,250,0.35) 0%, transparent 55%), linear-gradient(145deg, #060810 0%, #0a1525 100%)",
    keywords: ["Hubble", "teleskop Hubble", "obrazy Hubble"],
  },
  "czarne-dziury": {
    id: "czarne-dziury",
    path: "/czarne-dziury",
    headline: "Czarne dziury",
    subtitle: "Horyzont zdarzeń · supermasywne · odkrycia",
    alt: "Czarne dziury, artykuły o supermasywnych czarnych dziurach i odkryciach",
    accent: "#6366f1",
    gradient:
      "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.45) 0%, transparent 60%), linear-gradient(145deg, #050508 0%, #0a0a15 100%)",
    keywords: ["czarne dziury", "horyzont zdarzeń", "supermasywna czarna dziura"],
  },
  egzoplanety: {
    id: "egzoplanety",
    path: "/egzoplanety",
    headline: "Egzoplanety",
    subtitle: "Planety pozasłoneczne · atmospheres · odkrycia",
    alt: "Egzoplanety, planety pozasłoneczne i badania ich atmosfer",
    accent: "#8b5cf6",
    gradient:
      "radial-gradient(ellipse at 45% 40%, rgba(139,92,246,0.4) 0%, transparent 55%), linear-gradient(145deg, #080610 0%, #100818 100%)",
    keywords: ["egzoplanety", "planety pozasłoneczne", "exoplanety"],
  },
  mars: {
    id: "mars",
    path: "/mars",
    headline: "Mars",
    subtitle: "Łaziki · misje · kolonizacja · badania",
    alt: "Mars, artykuły o misjach na Marsa, łazikach i badaniach planety",
    accent: "#ef4444",
    gradient:
      "radial-gradient(ellipse at 50% 45%, rgba(239,68,68,0.4) 0%, transparent 55%), linear-gradient(145deg, #100808 0%, #1a0a0a 100%)",
    keywords: ["Mars", "misje na Marsa", "Perseverance", "kolonizacja Marsa"],
  },
  ksiezyc: {
    id: "ksiezyc",
    path: "/ksiezyc",
    headline: "Księżyc",
    subtitle: "Artemis · lądowania · eksploracja",
    alt: "Księżyc, program Artemis, lądowania i eksploracja Księżyca",
    accent: "#94a3b8",
    gradient:
      "radial-gradient(ellipse at 50% 35%, rgba(148,163,184,0.3) 0%, transparent 55%), linear-gradient(145deg, #080810 0%, #101018 100%)",
    keywords: ["Księżyc", "Artemis", "lądowanie na Księżycu", "program Artemis"],
  },
  "blue-origin": {
    id: "blue-origin",
    path: "/blue-origin",
    headline: "Blue Origin",
    subtitle: "New Shepard · New Glenn · starty",
    alt: "Blue Origin, artykuły o rakietach New Shepard i New Glenn",
    accent: "#3b82f6",
    gradient:
      "radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.35) 0%, transparent 55%), linear-gradient(145deg, #060810 0%, #0a1020 100%)",
    keywords: ["Blue Origin", "New Glenn", "New Shepard", "Jeff Bezos kosmos"],
  },
  starlink: {
    id: "starlink",
    path: "/starlink",
    headline: "Starlink",
    subtitle: "Konstelacja satelitów · internet z kosmosu",
    alt: "Starlink, konstelacja satelitów i internet kosmiczny SpaceX",
    accent: "#38bdf8",
    gradient:
      "radial-gradient(ellipse at 50% 30%, rgba(56,189,248,0.35) 0%, transparent 55%), linear-gradient(145deg, #060810 0%, #0a1520 100%)",
    keywords: ["Starlink", "satelity Starlink", "internet satelitarny"],
  },
  artemis: {
    id: "artemis",
    path: "/artemis",
    headline: "Artemis",
    subtitle: "Powrót na Księżyc · SLS · Orion · Gateway",
    alt: "Artemis, program NASA powrotu człowieka na Księżyc",
    accent: "#f59e0b",
    gradient:
      "radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.35) 0%, transparent 55%), linear-gradient(145deg, #0a0806 0%, #151008 100%)",
    keywords: ["Artemis", "program Artemis", "SLS", "Orion", "Księżyc NASA"],
  },
  "ciemna-materia": {
    id: "ciemna-materia",
    path: "/ciemna-materia",
    headline: "Ciemna materia",
    subtitle: "Tajemnice Wszechświata · badania · teorie",
    alt: "Ciemna materia, artykuły o badaniach i teoriach ciemnej materii",
    accent: "#64748b",
    gradient:
      "radial-gradient(ellipse at 50% 50%, rgba(100,116,139,0.35) 0%, transparent 60%), linear-gradient(145deg, #050508 0%, #0a0a12 100%)",
    keywords: ["ciemna materia", "dark matter", "Wszechświat"],
  },
  "stacja-kosmiczna": {
    id: "stacja-kosmiczna",
    path: "/stacja-kosmiczna",
    headline: "Stacja kosmiczna",
    subtitle: "ISS · Tiangong · stacje orbitalne",
    alt: "Stacje kosmiczne, ISS, Tiangong i przyszłe stacje orbitalne",
    accent: "#ffb830",
    backgroundImage: "/og/home-cover.jpg",
    keywords: ["stacja kosmiczna", "ISS", "Tiangong", "stacja orbitalna"],
  },
};

const PATH_TO_ID = Object.fromEntries(
  Object.values(OG_PAGE_REGISTRY).map((entry) => [entry.path, entry.id]),
) as Record<string, string>;

/** Resolve OG page id from public path (e.g. `/mapa` → `mapa`, `/` → `home`). */
export function pathToOgPageId(path: string): string | undefined {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return PATH_TO_ID[normalized];
}

export function getOgPageById(id: string): OgPageEntry | undefined {
  return OG_PAGE_REGISTRY[id];
}

export function getOgPageByPath(path: string): OgPageEntry | undefined {
  const id = pathToOgPageId(path);
  return id ? OG_PAGE_REGISTRY[id] : undefined;
}

/** Absolute URL to dynamic OG image (1200×630 WebP/JPEG). */
export function getPageOgImageUrl(pageId: string): string {
  return `${getSiteUrl()}/og/${pageId}`;
}

export function resolvePageOgImage(path: string): {
  url: string;
  alt: string;
  width: number;
  height: number;
  pageId: string;
} {
  const pageId = pathToOgPageId(path) ?? "home";
  const entry = OG_PAGE_REGISTRY[pageId];
  return {
    url: getPageOgImageUrl(pageId),
    alt: entry?.alt ?? DEFAULT_OG_IMAGE_ALT,
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    pageId,
  };
}

/** Keywords for a path from OG registry (empty if unknown). */
export function getPageKeywords(path: string): string[] | undefined {
  return getOgPageByPath(path)?.keywords;
}
