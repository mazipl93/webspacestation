/** Normalize AI/CMS tags for Article.tags (max 5, trimmed). */
export function normalizeArticleTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const t = String(raw).trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
    if (out.length >= 5) break;
  }
  return out;
}
