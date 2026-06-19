export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "x"
  | "discord"
  | "youtube";

export type SocialProfile = {
  id: SocialPlatform;
  url: string;
  /** Krótka etykieta (nav aria, footer) */
  label: string;
  /** Tekst przycisku CTA pod artykułem */
  ctaLabel: string;
  ariaLabel: string;
  brandColor: string;
  priority: "primary" | "secondary";
};

export const WSS_SOCIAL_PRIMARY: readonly SocialProfile[] = [
  {
    id: "facebook",
    url: "https://www.facebook.com/WebSpaceStation",
    label: "Facebook",
    ctaLabel: "Polub na Facebooku",
    ariaLabel: "Web Space Station na Facebooku",
    brandColor: "#1877f2",
    priority: "primary",
  },
  {
    id: "instagram",
    url: "https://instagram.com/webspacestation",
    label: "Instagram",
    ctaLabel: "Obserwuj na Instagramie",
    ariaLabel: "Web Space Station na Instagramie",
    brandColor: "#e4405f",
    priority: "primary",
  },
  {
    id: "x",
    url: "https://x.com/WebSpaceStation",
    label: "X",
    ctaLabel: "Śledź na X",
    ariaLabel: "Web Space Station na X",
    brandColor: "#e7e9ea",
    priority: "primary",
  },
] as const;

export const WSS_SOCIAL_SECONDARY: readonly SocialProfile[] = [
  {
    id: "discord",
    url: "https://discord.gg/wss",
    label: "Discord",
    ctaLabel: "Dołącz na Discordzie",
    ariaLabel: "Społeczność Web Space Station na Discordzie",
    brandColor: "#5865f2",
    priority: "secondary",
  },
  {
    id: "youtube",
    url: "https://youtube.com/@webspacestation",
    label: "YouTube",
    ctaLabel: "Subskrybuj na YouTube",
    ariaLabel: "Web Space Station na YouTube",
    brandColor: "#ff0000",
    priority: "secondary",
  },
] as const;

export const WSS_SOCIAL_ALL: readonly SocialProfile[] = [
  ...WSS_SOCIAL_PRIMARY,
  ...WSS_SOCIAL_SECONDARY,
];

/** Organization.sameAs — wszystkie profile WSS. */
export function getSocialSameAs(): string[] {
  return WSS_SOCIAL_ALL.map((p) => p.url);
}

export function getSocialProfile(id: SocialPlatform): SocialProfile | undefined {
  return WSS_SOCIAL_ALL.find((p) => p.id === id);
}

/** Kolor marki tylko na ikonie — reszta UI neutralna. */
export function getSocialIconColor(id: SocialPlatform): string {
  if (id === "x") return "#e8eaed";
  return getSocialProfile(id)?.brandColor ?? "#e8eaed";
}
