/**
 * Hub anchor-text linking.
 *
 * Finds first occurrence of known brand/topic keywords in plain paragraph text
 * and wraps them in `[matched text](/hub)` markdown syntax, which
 * `renderInlineMarkdown` then turns into real <a> links.
 *
 * Rules:
 *  - 1 link per hub per article (caller passes `usedHrefs: Set<string>`)
 *  - Never injects inside existing markdown: `[...](...)`, `**...**`, bare URLs
 *  - Uses Unicode word-boundary lookbehind/lookahead for Polish inflected forms
 */

export type HubLinkRule = {
  /** Route href, e.g. "/nasa" */
  href: string;
  /**
   * Pattern to match in plain text.
   * Should NOT be global (no `g` flag) — we call `.exec()` once per text segment.
   * May include the `u` flag for Unicode support.
   */
  pattern: RegExp;
};

/**
 * Hub link rules sorted: multi-word patterns first to prevent partial overlaps.
 * Polish inflections are handled via explicit suffix alternations and
 * `(?<!\p{L})` / `(?!\p{L})` Unicode lookbehind/ahead where ASCII `\b` is unreliable.
 */
export const HUB_LINK_RULES: HubLinkRule[] = [
  // Multi-word brands
  {
    href: "/blue-origin",
    pattern: /\bBlue\s+Origin\b/,
  },
  // ISS / Stacja kosmiczna
  {
    href: "/stacja-kosmiczna",
    pattern:
      /(?<!\p{L})Międzynarodow[aą]\s+Stacj[ąa]\s+Kosmiczn[ąa](?!\p{L})|\bISS\b/u,
  },
  // Czarne dziury — multi-word Polish topic
  {
    href: "/czarne-dziury",
    // Matches: czarna dziura, czarne dziury, czarnej dziury, czarną dziurą,
    //          czarnych dziur, czarnych dziurami, etc. (case-insensitive)
    pattern:
      /(?<!\p{L})czarn(?:a|e|ej|ą|ych|ymi)\s+dziur(?:y|a|ę|ą|om|ach|ami)?(?!\p{L})/iu,
  },
  // Ciemna materia
  {
    href: "/ciemna-materia",
    // Matches: ciemna materia, ciemnej materii, ciemną materię, ciemną materią
    pattern:
      /(?<!\p{L})ciemn(?:a|ej|ą)\s+mater(?:ia|ii|ię|ią)(?!\p{L})/iu,
  },
  // James Webb — before standalone JWST to avoid splitting the phrase
  {
    href: "/jwst",
    pattern: /\bJWST\b|\bJames[a]?\s+Webb[a]?\b/,
  },
  // Single-word brands (ASCII — `\b` works reliably)
  { href: "/nasa", pattern: /\bNASA\b/ },
  { href: "/spacex", pattern: /\bSpaceX\b/ },
  { href: "/esa", pattern: /\bESA\b/ },
  { href: "/artemis", pattern: /\bArtemis\b/ },
  { href: "/starlink", pattern: /\bStarlink\b/ },
  // Hubble — straight-apostrophe genitive "Hubble'a" handled by \W boundary
  {
    href: "/hubble",
    pattern: /\bHubble\b/,
  },
  // Mars — common Polish inflections: Marsa, Marsie, Marsem, Marsowi
  {
    href: "/mars",
    pattern: /\bMars(?:a|ie|em|owi)?\b/,
  },
  // Ksiezyc — Polish inflections via explicit suffix list
  {
    href: "/ksiezyc",
    pattern:
      /(?<!\p{L})Księżyc(?:a|owi|em|u|owe?|owy|ową|owym)?(?!\p{L})/u,
  },
  // Egzoplanety — lowercase, various forms
  {
    href: "/egzoplanety",
    pattern: /(?<!\p{L})egzoplanet(?:a|y|ę|ami|ach|om)?(?!\p{L})/iu,
  },
];

/**
 * Regex matching existing markdown constructs that must NOT be modified.
 * Matches: `**bold**`, `[label](url)`, bare `https://...` URLs.
 */
const PROTECT_RE =
  /\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<>\[\]()]+/g;

type TextPart = {
  text: string;
  /** true = plain text, eligible for hub-link injection */
  safe: boolean;
};

function splitProtectedRanges(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  PROTECT_RE.lastIndex = 0;
  while ((m = PROTECT_RE.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ text: text.slice(last, m.index), safe: true });
    }
    parts.push({ text: m[0], safe: false });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push({ text: text.slice(last), safe: true });
  }
  return parts.length > 0 ? parts : [{ text, safe: true }];
}

/**
 * Injects hub anchor links into a single paragraph or lead text string.
 *
 * @param text       - Raw paragraph text (may contain existing markdown)
 * @param usedHrefs  - Mutable Set tracking which hub hrefs have been used in
 *                     this article. Pass the same Set across all paragraphs.
 * @param rules      - Hub rules (defaults to HUB_LINK_RULES)
 * @returns Modified text with `[matched](href)` injected, or original if no match.
 */
export function injectHubAnchors(
  text: string,
  usedHrefs: Set<string>,
  rules: HubLinkRule[] = HUB_LINK_RULES,
): string {
  if (!text) return text;

  const parts = splitProtectedRanges(text);
  let modified = false;

  for (const rule of rules) {
    if (usedHrefs.has(rule.href)) continue;

    for (let i = 0; i < parts.length; i++) {
      if (!parts[i].safe) continue;

      // Clone pattern to reset lastIndex and avoid shared state between calls
      const re = new RegExp(rule.pattern.source, rule.pattern.flags.replace("g", ""));
      const m = re.exec(parts[i].text);
      if (!m) continue;

      const before = parts[i].text.slice(0, m.index);
      const matched = m[0];
      const after = parts[i].text.slice(m.index + matched.length);

      parts.splice(
        i,
        1,
        { text: before, safe: true },
        // Mark injected link as protected so a later rule can't nest inside it
        { text: `[${matched}](${rule.href})`, safe: false },
        { text: after, safe: true },
      );

      usedHrefs.add(rule.href);
      modified = true;
      break; // found first occurrence — move to next rule
    }
  }

  return modified ? parts.map((p) => p.text).join("") : text;
}
