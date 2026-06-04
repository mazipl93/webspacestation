/** Normalized ops feed for Odkrywaj + homepage Centrum operacyjne. */

export type OpsLaunch = {
  id: string;
  provider: string;
  /** Nazwa misji / payloadu (np. Starlink Group 17-43) */
  mission: string;
  /** Konfiguracja rakiety (np. Falcon 9 Block 5) — wiele startów może mieć ten sam typ */
  rocketName?: string;
  /** ISO 8601 — moment startu (NET) */
  net: string;
  site: string;
  image: string;
  hue: number;
  statusLabel: string;
  windowLabel?: string;
  detailUrl?: string;
};

export type OpsIssPosition = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

export type OpsMapPin = {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  left: string;
  top: string;
  kind: "iss" | "pad";
};

export type OpsCalendarEvent = {
  id: string;
  quarter: string;
  title: string;
  hint?: string;
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
  calendar: OpsCalendarEvent[];
  iss: OpsIssPosition | null;
  mapPins: OpsMapPin[];
  gallery: OpsGalleryItem[];
  videos: OpsVideoItem[];
  /** true = API OK; false = fallback mock */
  live: boolean;
  fetchedAt: string;
};
