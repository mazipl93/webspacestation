import { getOpenAIKey } from "@/lib/rss/translate";

/** Max startów z briefem AI na jeden run ops:refresh (koszt). */
export const OPS_LAUNCH_BRIEFS_BATCH_LIMIT = 8;

/** Generuj briefy tylko dla startów w tym horyzoncie (dni). */
export const OPS_LAUNCH_BRIEFS_HORIZON_DAYS = 21;

/** Klucz OpenAI tylko dla briefów startów (np. projekt wss-starty). Fallback: OPENAI_API_KEY. */
export function getLaunchBriefsOpenAIKey(): string | null {
  const dedicated = process.env.OPS_LAUNCH_BRIEFS_OPENAI_API_KEY?.trim();
  if (dedicated) return dedicated;
  return getOpenAIKey();
}

export function requireLaunchBriefsOpenAIKey(): string {
  const key = getLaunchBriefsOpenAIKey();
  if (!key) {
    throw new Error(
      "Brak OPS_LAUNCH_BRIEFS_OPENAI_API_KEY (lub OPENAI_API_KEY) — wymagany do briefów startów.",
    );
  }
  return key;
}

export function getLaunchBriefsModel(): string {
  return (
    process.env.OPS_LAUNCH_BRIEFS_MODEL?.trim() ||
    process.env.OPENAI_TRANSLATION_MODEL?.trim() ||
    "gpt-5.4-mini"
  );
}

export function isLaunchBriefsEnabled(): boolean {
  const flag = process.env.OPS_LAUNCH_BRIEFS?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return Boolean(getLaunchBriefsOpenAIKey());
}
