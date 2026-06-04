import { OPS_TERMS } from "@/lib/ops/ops-terminology";
import type { OpsLaunch } from "@/lib/ops/types";

const PROVIDER_PL: Record<string, string> = {
  SpaceX: "SpaceX",
  "Space Exploration Technologies Corp.": "SpaceX",
  "China Aerospace Science and Technology Corporation": "CASC (Chiny)",
  LandSpace: "LandSpace (Chiny)",
  "Mitsubishi Heavy Industries": "MHI (Japonia)",
  "United Launch Alliance": "ULA (USA)",
  Arianespace: "Arianespace (EU)",
  "Rocket Lab Ltd": "Rocket Lab",
  "Indian Space Research Organization": "ISRO (Indie)",
  Roscosmos: "Roscosmos (Rosja)",
};

const STATUS_PL: Record<string, string> = {
  "Go for Launch": "Gotowy do startu",
  "To Be Confirmed": "Do potwierdzenia",
  "To Be Determined": "Termin do ustalenia",
  "In Progress": "W trakcie",
  Success: "Sukces",
  Failure: "Awaria",
  Hold: "Wstrzymany",
  TBD: "Do ustalenia",
  TBC: "Do potwierdzenia",
  Planned: "Zaplanowany",
  Scheduled: "Zaplanowany",
  Confirmed: "Potwierdzony",
  "Launch Successful": "Start udany",
  "Launch Failure": "Start nieudany",
  "Partial Failure": "Częściowa awaria",
  "Offline API": "API niedostępne",
};

const SITE_RULES: { pattern: RegExp; replace: string }[] = [
  { pattern: /Space Launch Complex (\d+[A-Z]?)/gi, replace: "Platforma SLC-$1" },
  { pattern: /Commercial LC-(\d+)/gi, replace: "Platforma LC-$1" },
  { pattern: /Launch Area (\d+[A-Z]?)/gi, replace: "Strefa startowa $1" },
  { pattern: /Space Launch Center/gi, replace: "Centrum startowe" },
  { pattern: /Satellite Launch Center/gi, replace: "Centrum startowe" },
  { pattern: /Cape Canaveral SFS,? Florida/gi, replace: "Przylądek Canaveral, USA" },
  { pattern: /Cape Canaveral/gi, replace: "Przylądek Canaveral" },
  { pattern: /Vandenberg SFB,? California/gi, replace: "Vandenberg, USA" },
  { pattern: /Vandenberg Space Force Base/gi, replace: "Baza Vandenberg, USA" },
  { pattern: /Wenchang Space Launch Site/gi, replace: "Wenchang, Chiny" },
  { pattern: /Jiuquan Satellite Launch Center/gi, replace: "Jiuquan, Chiny" },
  { pattern: /People's Republic of China/gi, replace: "Chiny" },
  { pattern: /United States of America/gi, replace: "USA" },
  { pattern: /, Florida$/gi, replace: ", USA" },
  { pattern: /, California$/gi, replace: ", USA" },
];

/** Nazwa misji po polsku (marki typu Starlink zostają). */
export function localizeMission(mission: string): string {
  const trimmed = mission.trim();
  if (/^unknown payload$/i.test(trimmed)) return "Misja nieujawniona";
  if (/^tbd$/i.test(trimmed)) return "Misja do ustalenia";
  return trimmed;
}

export function localizeProvider(provider: string): string {
  const direct = PROVIDER_PL[provider.trim()];
  if (direct) return direct;
  if (/china aerospace/i.test(provider)) return "CASC (Chiny)";
  if (/space exploration technologies/i.test(provider)) return "SpaceX";
  return provider.trim();
}

export function localizeSite(site: string): string {
  let out = site.trim();
  for (const { pattern, replace } of SITE_RULES) {
    out = out.replace(pattern, replace);
  }
  const parts = out.split(" · ").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 2) return parts.join(" · ");
  return `${parts[0]} · ${parts[parts.length - 1]}`;
}

export function localizePadLabel(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return OPS_TERMS.launchSiteFallback;
  return localizeSite(trimmed);
}

export function localizeStatus(status: string): string {
  const key = status.trim();
  return STATUS_PL[key] ?? STATUS_PL[key.replace(/\s+/g, " ")] ?? key;
}

export function localizeOpsLaunch(launch: OpsLaunch): OpsLaunch {
  return {
    ...launch,
    mission: localizeMission(launch.mission),
    provider: localizeProvider(launch.provider),
    site: localizeSite(launch.site),
    statusLabel: localizeStatus(launch.statusLabel),
  };
}

/** Skrócony opis startu do list i kalendarza. */
export function formatLaunchSummary(launch: OpsLaunch): string {
  const rocket = launch.rocketName ? ` · ${launch.rocketName}` : "";
  return `${launch.provider}${rocket} · ${launch.site}`;
}
