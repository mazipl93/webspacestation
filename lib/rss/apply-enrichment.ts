import type { RssDraftEnrichment } from "@/lib/rss/enrich-drafts";
import { isSummaryDuplicateOfTitle } from "@/lib/rss/summary-quality";
import { polishTypography } from "@/lib/rss/translate";

export const MIN_LEAD_PL_LENGTH = 40;
export const MIN_BODY_PARAGRAPH_LENGTH = 40;
export const MIN_CONTEXT_PL_LENGTH = 60;
export const MIN_BODY_PARAGRAPHS = 2;

export function joinBodyParagraphs(body: string[]): string {
  return body.map((p) => p.trim()).filter(Boolean).join("\n\n");
}

export function splitContentToParagraphs(
  content: string | null | undefined
): string[] {
  if (!content?.trim()) return [];
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Lead: max 2 sentences (public hero). */
export function clampLeadSentences(lead: string): string {
  const trimmed = lead.trim();
  if (!trimmed) return trimmed;
  const sentences =
    trimmed.match(/[^.!?…]+[.!?…]+/g)?.map((s) => s.trim()).filter(Boolean) ??
    [];
  if (sentences.length <= 2) return trimmed;
  return sentences.slice(0, 2).join(" ").trim();
}

/** Remove publisher attribution from lead — source lives in footer only. */
export function sanitizeLeadPl(lead: string, source?: string | null): string {
  let s = lead.trim();
  const publisher = source?.trim();

  if (publisher) {
    const esc = publisher.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s
      .replace(
        new RegExp(
          `(?:informacj[ęe]|wiadomo[śs]ć?) podał[a]?\\s+${esc}[^.!?]*[.!?]?`,
          "gi"
        ),
        ""
      )
      .replace(new RegExp(`według\\s+${esc}[^.!?]*[.!?]?`, "gi"), "")
      .replace(
        new RegExp(`${esc}\\s+(?:podaje|raportuje|informuje)[^.!?]*[.!?]?`, "gi"),
        ""
      )
      .replace(
        new RegExp(`(?:źródło|source):\\s*${esc}[^.!?]*[.!?]?`, "gi"),
        ""
      );
  }

  s = s
    .replace(
      /\s*(?:informacj[ęe] podał[^.!?]*[.!?]?|według wydawcy[^.!?]*[.!?]?)\s*/gi,
      ""
    )
    .replace(/\s{2,}/g, " ")
    .replace(/^[,.;\s]+|[,.;\s]+$/g, "")
    .trim();

  return clampLeadSentences(s);
}

export type EnrichmentValidationResult =
  | { ok: true }
  | { ok: false; error: string };

/** Strict validation for new RSS → AI pipeline (B+). */
export function validateRssEnrichment(
  e: RssDraftEnrichment
): EnrichmentValidationResult {
  if (!e.title_pl?.trim()) {
    return { ok: false, error: "pusty tytuł" };
  }
  if (!e.lead_pl?.trim()) {
    return { ok: false, error: "pusty lead" };
  }

  const lead = e.lead_pl.trim();
  if (lead.length < MIN_LEAD_PL_LENGTH) {
    return { ok: false, error: `lead za krótki (${lead.length} zn.)` };
  }
  if (isSummaryDuplicateOfTitle(e.title_pl, lead)) {
    return { ok: false, error: "lead powtarza tytuł" };
  }

  const body = (e.body_pl ?? []).map((p) => p.trim()).filter(Boolean);
  if (body.length < MIN_BODY_PARAGRAPHS) {
    return {
      ok: false,
      error: `treść: oczekiwano ${MIN_BODY_PARAGRAPHS}+ akapitów, jest ${body.length}`,
    };
  }
  for (const [i, p] of body.entries()) {
    if (p.length < MIN_BODY_PARAGRAPH_LENGTH) {
      return {
        ok: false,
        error: `akapit ${i + 1} za krótki (${p.length} zn.)`,
      };
    }
  }

  const ctx = e.context_pl?.trim();
  if (!ctx || ctx.length < MIN_CONTEXT_PL_LENGTH) {
    return { ok: false, error: "kontekst WSS za krótki lub pusty" };
  }

  return { ok: true };
}

export function enrichmentToArticleFields(
  e: RssDraftEnrichment,
  source?: string | null
) {
  const body = (e.body_pl ?? [])
    .map((p) => polishTypography(p.trim()))
    .filter(Boolean);
  const lead = polishTypography(sanitizeLeadPl(e.lead_pl, source));
  const contextRaw = e.context_pl?.trim();

  return {
    title: polishTypography(e.title_pl.trim()),
    excerpt: lead,
    content: joinBodyParagraphs(body),
    contextNote: contextRaw ? polishTypography(contextRaw) : null,
    readingTime: e.reading_time_min,
    tags: e.tags,
    category: e.category,
  };
}
