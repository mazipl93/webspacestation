export type InstagramConfig = {
  enabled: boolean;
  businessAccountId: string;
  accessToken: string;
  graphVersion: string;
};

export function getInstagramConfig(): InstagramConfig | null {
  const enabled = process.env.INSTAGRAM_AUTO_POST === "true";
  const businessAccountId =
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim() ?? "";
  const accessToken =
    process.env.INSTAGRAM_ACCESS_TOKEN?.trim() ??
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() ??
    "";
  const graphVersion = process.env.FACEBOOK_GRAPH_VERSION?.trim() || "v21.0";

  if (!enabled || !businessAccountId || !accessToken) return null;

  return {
    enabled: true,
    businessAccountId,
    accessToken,
    graphVersion,
  };
}

export function isInstagramAutoPostConfigured(): boolean {
  return getInstagramConfig() !== null;
}
