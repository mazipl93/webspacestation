/** Normalize for rough title vs summary comparison. */
function normalizeForCompare(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ąćęłńóśźż\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when summary adds nothing beyond the title (copy / near-copy).
 */
export function isSummaryDuplicateOfTitle(
  title: string,
  summary: string
): boolean {
  const t = normalizeForCompare(title);
  const s = normalizeForCompare(summary);
  if (!t || !s) return false;
  if (s === t) return true;

  const shorter = s.length <= t.length ? s : t;
  const longer = s.length <= t.length ? t : s;
  if (longer.includes(shorter) && longer.length <= shorter.length * 1.15) {
    return true;
  }

  const tWords = new Set(t.split(" ").filter((w) => w.length > 2));
  const sWords = s.split(" ").filter((w) => w.length > 2);
  if (sWords.length < 5) return false;

  const overlap = sWords.filter((w) => tWords.has(w)).length / sWords.length;
  return overlap >= 0.82;
}
