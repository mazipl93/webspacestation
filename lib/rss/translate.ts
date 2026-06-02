/**
 * Shared RSS / OpenAI config helpers. Enrichment lives in enrich-drafts.ts only.
 */

export class RssTranslationConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RssTranslationConfigError";
  }
}

export function isRssTranslationEnabled(): boolean {
  const flag = process.env.RSS_TRANSLATE_PL?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return true;
}

export function getOpenAIKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || null;
}

/** OpenAI is the only AI provider — fail fast if misconfigured. */
export function requireOpenAIKey(): string {
  const key = getOpenAIKey();
  if (!key) {
    throw new RssTranslationConfigError(
      "Brak OPENAI_API_KEY — wymagany do przetwarzania szkiców RSS."
    );
  }
  return key;
}

/** Normal Polish punctuation — avoid long em dashes from EN→PL. */
export function polishTypography(text: string): string {
  return text
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, ", ")
    .replace(/\s+-\s+/g, ", ")
    .replace(/,{2,}/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ", ")
    .trim();
}

/** Skip API when text already looks Polish (seed / future PL feeds). */
export function isLikelyPolish(text: string): boolean {
  const polishDiacritics = (text.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) ?? []).length;
  if (polishDiacritics >= 2) return true;
  const lower = text.toLowerCase();
  const hasPl =
    /\b(oraz|jest|się|przez|który|która|artykuł|polska|polski)\b/.test(lower);
  const hasEn =
    /\b(the|and|with|from|will|has|been|their|about|into)\b/.test(lower);
  return hasPl && !hasEn;
}
