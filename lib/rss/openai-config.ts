/** Default enrichment model (override with OPENAI_TRANSLATION_MODEL in .env). */
export const DEFAULT_OPENAI_ENRICHMENT_MODEL = "gpt-5.4-mini";

export function getOpenAIEnrichmentModel(): string {
  return (
    process.env.OPENAI_TRANSLATION_MODEL?.trim() ||
    DEFAULT_OPENAI_ENRICHMENT_MODEL
  );
}
