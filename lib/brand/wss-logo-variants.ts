/** Dev + boot: warianty wordmarku WSS (czat 37). */

export const WSS_LOGO_VARIANT_STORAGE_KEY = "wss-logo-variant-v1";

export const WSS_LOGO_VARIANTS = [
  {
    id: "station",
    label: "A · Station",
    hint: "Saira Extra Condensed 900 · W·S·S (Verge / Manuka lane)",
  },
  {
    id: "apex",
    label: "B · Apex",
    hint: "Custom W (NASA/Axios) + Saira 900 · W|S|S",
  },
  {
    id: "control",
    label: "C · Control",
    hint: "Oswald 700 · WSS + WEB SPACE STATION (SpaceX / Bloomberg)",
  },
] as const;

export type WssLogoVariantId = (typeof WSS_LOGO_VARIANTS)[number]["id"];

export const DEFAULT_WSS_LOGO_VARIANT: WssLogoVariantId = "control";

export function isWssLogoVariantId(value: string): value is WssLogoVariantId {
  return WSS_LOGO_VARIANTS.some((v) => v.id === value);
}
