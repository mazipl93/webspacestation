import type { RssDraftEnrichment } from "@/lib/rss/enrich-drafts";
import { isSummaryDuplicateOfTitle } from "@/lib/rss/summary-quality";
import { polishTypography } from "@/lib/rss/translate";

export const MIN_LEAD_PL_LENGTH = 40;
export const MIN_BODY_PARAGRAPH_LENGTH = 40;
export const MIN_CONTEXT_PL_LENGTH = 60;
export const MIN_BODY_PARAGRAPHS = 2;

/** OpenAI B+ JSON keys (lead / body / context) + legacy *_pl aliases. */
export type BPlusRawFields = {
  title?: string;
  title_pl?: string;
  lead?: string;
  lead_pl?: string;
  summary_pl?: string;
  body?: unknown;
  body_pl?: unknown;
  content?: unknown;
  paragraphs?: unknown;
  context?: string;
  context_pl?: string;
  category?: string;
  tags?: string[];
  reading_time_min?: number;
};

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

/** Parse AI `body` (array, string, JSON string, or { paragraphs: [] }). */
export function parseBodyParagraphs(raw: unknown): string[] {
  if (raw == null) return [];

  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      if (typeof item === "string") {
        const t = item.trim();
        return t ? [t] : [];
      }
      if (item && typeof item === "object" && "text" in item) {
        const t = String((item as { text?: unknown }).text ?? "").trim();
        return t ? [t] : [];
      }
      const t = String(item).trim();
      return t && t !== "[object Object]" ? [t] : [];
    });
  }

  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    if (t.startsWith("[")) {
      try {
        return parseBodyParagraphs(JSON.parse(t) as unknown);
      } catch {
        /* fall through to paragraph split */
      }
    }
    return splitContentToParagraphs(t);
  }

  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if ("paragraphs" in o) return parseBodyParagraphs(o.paragraphs);
    if ("body" in o) return parseBodyParagraphs(o.body);
  }

  return [];
}

export function resolveLeadText(raw: BPlusRawFields | RssDraftEnrichment): string {
  const r = raw as BPlusRawFields;
  return (
    r.lead?.trim() ||
    r.lead_pl?.trim() ||
    r.summary_pl?.trim() ||
    (raw as RssDraftEnrichment).lead_pl?.trim() ||
    ""
  );
}

export function resolveContextText(
  raw: BPlusRawFields | RssDraftEnrichment
): string {
  const r = raw as BPlusRawFields;
  return (
    r.context?.trim() ||
    r.context_pl?.trim() ||
    (raw as RssDraftEnrichment).context_pl?.trim() ||
    ""
  );
}

export function resolveBodyParagraphs(
  raw: BPlusRawFields | RssDraftEnrichment
): string[] {
  const r = raw as BPlusRawFields;
  const fromRaw = parseBodyParagraphs(
    r.body ?? r.body_pl ?? r.content ?? r.paragraphs
  );
  if (fromRaw.length > 0) return fromRaw;
  return parseBodyParagraphs((raw as RssDraftEnrichment).body_pl);
}

export function resolveTitleText(
  raw: BPlusRawFields | RssDraftEnrichment,
  fallback = ""
): string {
  const r = raw as BPlusRawFields;
  return (
    r.title_pl?.trim() ||
    r.title?.trim() ||
    (raw as RssDraftEnrichment).title_pl?.trim() ||
    fallback
  );
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
  e: RssDraftEnrichment | BPlusRawFields
): EnrichmentValidationResult {
  const title = resolveTitleText(e);
  const lead = resolveLeadText(e);
  const body = resolveBodyParagraphs(e).map((p) => p.trim()).filter(Boolean);
  const context = resolveContextText(e);

  if (!title) {
    return { ok: false, error: "pusty tytuł" };
  }
  if (!lead) {
    return { ok: false, error: "pusty lead" };
  }

  if (lead.length < MIN_LEAD_PL_LENGTH) {
    return { ok: false, error: `lead za krótki (${lead.length} zn.)` };
  }
  if (isSummaryDuplicateOfTitle(title, lead)) {
    return { ok: false, error: "lead powtarza tytuł" };
  }

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

  if (!context || context.length < MIN_CONTEXT_PL_LENGTH) {
    return { ok: false, error: "kontekst WSS za krótki lub pusty" };
  }

  return { ok: true };
}

/**
 * Map B+ OpenAI output → Prisma Article fields.
 * excerpt = lead, content = body (joined), contextNote = context
 */
export function enrichmentToArticleFields(
  e: RssDraftEnrichment | BPlusRawFields,
  source?: string | null
) {
  const title = polishTypography(resolveTitleText(e));
  const lead = polishTypography(sanitizeLeadPl(resolveLeadText(e), source));
  const body = resolveBodyParagraphs(e)
    .map((p) => polishTypography(p.trim()))
    .filter(Boolean);
  const contextRaw = resolveContextText(e);

  return {
    title,
    excerpt: lead,
    content: joinBodyParagraphs(body),
    contextNote: contextRaw ? polishTypography(contextRaw) : null,
    readingTime: (e as RssDraftEnrichment).reading_time_min,
    tags: (e as RssDraftEnrichment).tags ?? (e as BPlusRawFields).tags,
    category:
      (e as RssDraftEnrichment).category ?? (e as BPlusRawFields).category,
  };
}
