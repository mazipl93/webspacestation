import { nasaCoverUrl } from "./nasa-cover";

/** Slugi artykułów gaming / rozrywka — poza działem Technologie. */
export const ROZRYWKA_ARTICLE_SLUGS = [
  "no-mans-sky-the-swarm-aktualizacja-6-4-maj-2026",
  "star-fox-nintendo-switch-2-25-czerwca-2026",
  "x4-foundations-empire-aktualizacja-9-00-czerwiec-2026",
  "stellaris-nomads-dlc-15-czerwca-2026-paradox",
  "star-citizen-alpha-4-8-1-defend-location-2026",
  "eve-frontier-cycle-6-sanctuary-25-czerwca-2026",
  "kerbal-space-program-2-eksploracja-2026-update",
  "playstation-state-of-play-czerwiec-2026-wolverine-god-of-war-laufey",
] as const;

export type RozrywkaSlug = (typeof ROZRYWKA_ARTICLE_SLUGS)[number];

/**
 * Okładki rozrywki — wyłącznie poziome NASA ~medium, bez łazika Mars / cleanroom.
 * Artykuły z własną grafiką w DB (np. State of Play) — nie nadpisywać w seedzie.
 */
export const ROZRYWKA_COVER_BY_SLUG: Record<string, string> = {
  "no-mans-sky-the-swarm-aktualizacja-6-4-maj-2026":
    nasaCoverUrl("carina_nebula"),
  "star-fox-nintendo-switch-2-25-czerwca-2026": nasaCoverUrl("PIA24801"),
  "x4-foundations-empire-aktualizacja-9-00-czerwiec-2026":
    nasaCoverUrl("PIA25501"),
  "stellaris-nomads-dlc-15-czerwca-2026-paradox": nasaCoverUrl("PIA04921"),
  "star-citizen-alpha-4-8-1-defend-location-2026": nasaCoverUrl("PIA23646"),
  "eve-frontier-cycle-6-sanctuary-25-czerwca-2026": nasaCoverUrl("PIA24301"),
  "kerbal-space-program-2-eksploracja-2026-update":
    nasaCoverUrl("KSC-20180402-PH_KLS02_0018"),
};

export function isRozrywkaArticleSlug(
  slug: string | undefined
): slug is RozrywkaSlug {
  return Boolean(
    slug &&
      (ROZRYWKA_ARTICLE_SLUGS as readonly string[]).includes(slug)
  );
}

export function rozrywkaCoverForSlug(slug: string): string | null {
  return ROZRYWKA_COVER_BY_SLUG[slug] ?? null;
}

/** Usuwa markdown bold z treści redakcyjnej (piszemy normalnym tekstem). */
export function stripEditorialBoldMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1");
}
