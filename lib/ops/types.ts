/** Normalized ops feed for Odkrywaj + homepage Centrum operacyjne. */

export type OpsLaunchPhase =
  | "countdown"
  | "window"
  | "live"
  | "hold"
  | "success"
  | "failure"
  | "unknown";

export type OpsLaunch = {
  id: string;
  provider: string;
  /** Nazwa misji / payloadu (np. Starlink Group 17-43) */
  mission: string;
  /** Konfiguracja rakiety (np. Falcon 9 Block 5) — wiele startów może mieć ten sam typ */
  rocketName?: string;
  /** ISO 8601 — moment startu (NET) */
  net: string;
  windowStart?: string;
  windowEnd?: string;
  site: string;
  image: string;
  hue: number;
  statusLabel: string;
  statusAbbrev?: string;
  statusId?: number;
  phase: OpsLaunchPhase;
  windowLabel?: string;
  detailUrl?: string;
  lastUpdated?: string;
  netPrecisionLabel?: string;
  /** Krótki kontekst PL (OpenAI + LL2), cache w ops snapshot. */
  brief?: OpsLaunchBrief;
};

export type OpsLaunchBrief = {
  text: string;
  basedOnNet: string;
  generatedAt: string;
  model?: string;
};

export type OpsIssPosition = {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitudeKm?: number;
  velocityKmh?: number;
  /** Promień widoczności z API (km) — opcjonalnie */
  visibility?: number;
};

export type OpsMapPin = {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  lat: number;
  lon: number;
  kind: "iss" | "pad";
  /** Zdjęcie padu z Launch Library (map_image), jeśli dostępne */
  imageUrl?: string;
};

export type OpsCalendarEvent = {
  id: string;
  /** Etykieta kwartału — tylko widok strony /kalendarz */
  quarter: string;
  /** Krótka data startu, np. „12 cze” */
  dateLabel: string;
  title: string;
  hint?: string;
  /** Najbliższy start w feedzie */
  active?: boolean;
  net: string;
};

export type OpsGalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  credit?: string;
  date?: string;
  href?: string;
  source: string;
};

export type OpsVideoItem = {
  id: string;
  title: string;
  thumbnail?: string;
  href: string;
  source: string;
};

export type OpsSnapshot = {
  launches: OpsLaunch[];
  /** Ostatnie zakończone starty (LL2 /previous/) — sukces / awaria. */
  recentLaunches: OpsLaunch[];
  calendar: OpsCalendarEvent[];
  iss: OpsIssPosition | null;
  /** Ground track ISS (segmenty bez skoku dateline) */
  issOrbit: { lat: number; lon: number }[][];
  mapPins: OpsMapPin[];
  gallery: OpsGalleryItem[];
  videos: OpsVideoItem[];
  /** true = świeży harmonogram LL2 w tym fetchu */
  live: boolean;
  fetchedAt: string;
};
