// ─── News / Articles ───────────────────────────────────────────────────────

export type NewsCategory =
  | "misje"
  | "astronomia"
  | "technologie"
  | "ziemia-z-kosmosu"
  | "iss";

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: NewsCategory;
  publishedAt: string; // ISO 8601
  timeLabel: string; // pre-formatted relative label, e.g. "2 godz. temu"
  imageUrl: string;
  slug: string;
  isBreaking?: boolean;
  content?: string[];  // article body paragraphs
  readTime?: number;   // estimated reading time in minutes
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
