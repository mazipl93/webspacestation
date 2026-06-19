/** Machine tag linking CMS articles to Launch Library 2 records. */

export const LAUNCH_TAG_PREFIX = "launch:" as const;

export function launchTagFor(launchId: string): string {
  return `${LAUNCH_TAG_PREFIX}${launchId}`;
}

export function isLaunchTag(tag: string): boolean {
  return tag.startsWith(LAUNCH_TAG_PREFIX);
}

export function extractLaunchIdFromTags(tags: readonly string[]): string | null {
  for (const tag of tags) {
    if (isLaunchTag(tag)) return tag.slice(LAUNCH_TAG_PREFIX.length);
  }
  return null;
}

export function hasLaunchTag(tags: readonly string[], launchId: string): boolean {
  return tags.includes(launchTagFor(launchId));
}
