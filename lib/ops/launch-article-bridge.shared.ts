/** Client-safe — typ i helper bez server-only. */
export type LaunchWssArticleLink = {
  slug: string;
  title: string;
  href: string;
};

export function linkForLaunch(
  launchId: string,
  links: Map<string, LaunchWssArticleLink>,
): LaunchWssArticleLink | null {
  return links.get(launchId) ?? null;
}
