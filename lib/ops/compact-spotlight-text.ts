import type { CosmodromeSpotlight } from "@/lib/ops/cosmodrome-photos";

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).trimEnd();
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.55 ? cut.slice(0, lastSpace) : cut;
  return `${base}…`;
}

/** Krótkie wersje pod panel pod mapą — bez przewijania. */
export function compactSpotlightCopy(spotlight: CosmodromeSpotlight): {
  description: string;
  fact: string | null;
} {
  return {
    description: truncate(spotlight.description, 128),
    fact: spotlight.facts[0] ? truncate(spotlight.facts[0], 96) : null,
  };
}
