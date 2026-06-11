import {
  fitShareCardLine,
  sanitizeSocialText,
} from "@/lib/social/facebook-caption";

/** Max chars for the large headline on the 1200×630 share-card. */
export const SOCIAL_CARD_TITLE_MAX = 60;
/** Max chars for the secondary line under the headline. */
export const SOCIAL_CARD_HOOK_MAX = 90;

export type ShareCardCopyInput = {
  socialCardTitle?: string | null;
  socialCardHook?: string | null;
  title: string;
  subtitle?: string | null;
};

export type ShareCardCopy = {
  title: string;
  hook: string | null;
};

/**
 * Text rendered on the FB share-card image.
 * Explicit CMS fields win; legacy articles fall back without excerpt (avoids mid-sentence clips).
 */
export function resolveShareCardCopy(input: ShareCardCopyInput): ShareCardCopy {
  const explicitTitle = input.socialCardTitle?.trim() ?? "";
  const explicitHook = input.socialCardHook?.trim() ?? "";

  if (explicitTitle) {
    return {
      title: explicitTitle,
      hook: explicitHook || null,
    };
  }

  const subtitle = input.subtitle?.trim() ?? "";
  const title =
    subtitle && subtitle.length <= SOCIAL_CARD_TITLE_MAX
      ? subtitle
      : fitShareCardLine(
          sanitizeSocialText(input.title),
          SOCIAL_CARD_TITLE_MAX,
        );

  return {
    title,
    hook: explicitHook || null,
  };
}

export function clampSocialCardTitle(value: string): string {
  return value.slice(0, SOCIAL_CARD_TITLE_MAX);
}

export function clampSocialCardHook(value: string): string {
  return value.slice(0, SOCIAL_CARD_HOOK_MAX);
}
