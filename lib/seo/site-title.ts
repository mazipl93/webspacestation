/** Separator w tytułach kart przeglądarki / OG (nie myślnik, nie pipe). */
export const SITE_TITLE_SEP = " · ";

export const SITE_NAME = "Web Space Station";
export const SITE_SHORT_NAME = "WSS";

/** Em/en dash → środkowa kropka (reguła copy SEO / OG). */
export function sanitizeSeoTitle(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, SITE_TITLE_SEP)
    .replace(/\s+/g, " ")
    .trim();
}

/** Podstrona · serwis (np. „Misje · Web Space Station”). */
export function formatPageTitle(page: string, site = SITE_NAME): string {
  return `${sanitizeSeoTitle(page)}${SITE_TITLE_SEP}${site}`;
}

/** Serwis · podtytuł (np. homepage / default w layout). */
export function formatSiteLeadTitle(subtitle: string, site = SITE_NAME): string {
  return `${site}${SITE_TITLE_SEP}${subtitle}`;
}

export const SITE_DEFAULT_TITLE = formatSiteLeadTitle(
  "Portal informacyjny o kosmosie",
);
export const SITE_HOME_TITLE = formatSiteLeadTitle("Aktualności kosmiczne");
