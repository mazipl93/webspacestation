// ─── News / Articles ───────────────────────────────────────────────────────

export type NewsCategory =
  | "misje"
  | "astronomia"
  | "technologie"
  | "ai"
  | "ziemia-z-kosmosu"
  | "iss";

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: NewsCategory;
  publishedAt: string; // ISO 8601
  timeLabel: string; // pre-formatted relative label, e.g. "2 godz. temu"
  /** Public DTO — mapped from DB coverImage via resolveImage(). */
  image: string;
  slug: string;
  isBreaking?: boolean;
  /** score >= 10 — hero / card top emphasis */
  isTopPriority?: boolean;
  /** News Engine importance (homepage ranking) */
  score?: number;
  /** CMS highlight — boosts ranking / szansa na hero. */
  featured?: boolean;
  /** Homepage hero slider slot: 0 = off, 1–4 = slide order. */
  heroPosition?: number;
  /** CMS „Temat tygodnia” — slider pod hero. */
  weekTopic?: boolean;
  /** Original create time — editorial metadata; „Najnowsze” uses publishedAt first. */
  createdAt?: string;
  /** Last DB update — JSON-LD dateModified. */
  updatedAt?: string;
  content?: string[];  // article body paragraphs
  readTime?: number;   // estimated reading time in minutes
  /** WSS editorial context (RSS hybrid articles) */
  contextNote?: string;
  /** Provenance for UI kind (RSS vs editorial) — not used for attribution. */
  contentOrigin?: "EDITORIAL" | "RSS" | "AI_DRAFT";
  /** External publisher when ingested by News Engine */
  source?: string;
  originalUrl?: string;
  /** RSS cover caption (publisher + site) */
  imageCredit?: string;
  /** Editorial byline — optional free text (legacy / manual). */
  authorByline?: string;
  /** CMS team author with avatar (preferred when set). */
  publicByline?: {
    name: string;
    avatarUrl?: string;
    roleLabel?: string;
    fromTeam: boolean;
  };
  /** Editorial / RSS tags — related-articles ranking (frontend). */
  tags?: string[];
}

// ─── Rocket Launches ───────────────────────────────────────────────────────

export type LaunchStatus = "scheduled" | "live" | "success" | "failed" | "delayed";

export interface RocketLaunch {
  id: string;
  missionName: string;
  rocketName: string;
  provider: string; // SpaceX, Ariane Group, Blue Origin …
  launchDate: string; // ISO 8601
  launchSite: string;
  status: LaunchStatus;
  imageUrl: string;
  pad: string;
}

// ─── Active Missions ────────────────────────────────────────────────────────

export type MissionDestination =
  | "mars"
  | "jupiter"
  | "moon"
  | "earth-orbit"
  | "sun"
  | "deep-space";

export interface ActiveMission {
  id: string;
  name: string;
  agency: string;
  destination: MissionDestination;
  launchDate: string;
  status: "active" | "nominal" | "critical";
  description: string;
}

// ─── Timeline Events ────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  date: string; // ISO 8601
  quarter: string; // e.g. "Q1 2026"
  title: string;
  description?: string;
}

// ─── Navigation ─────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}
