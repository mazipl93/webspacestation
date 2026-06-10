export type FacebookConfig = {
  enabled: boolean;
  pageId: string;
  accessToken: string;
  graphVersion: string;
};

export function getFacebookConfig(): FacebookConfig | null {
  const enabled = process.env.FACEBOOK_AUTO_POST === "true";
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim() ?? "";
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() ?? "";
  const graphVersion = process.env.FACEBOOK_GRAPH_VERSION?.trim() || "v21.0";

  if (!enabled || !pageId || !accessToken) return null;

  return { enabled: true, pageId, accessToken, graphVersion };
}

export function isFacebookAutoPostConfigured(): boolean {
  return getFacebookConfig() !== null;
}
