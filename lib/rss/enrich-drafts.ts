/**
 * RSS DRAFT enrichment (OpenAI): B+ hybrid — PL title, lead, body, WSS context.
 */
import { editorialCategoryToSlug } from "@/lib/rss/categorize";
import type { RssEditorialCategory } from "@/lib/rss/types";
import { getOpenAIEnrichmentModel } from "@/lib/rss/openai-config";
import {
  parseBodyParagraphs,
  resolveContextText,
  resolveLeadText,
  resolveTitleText,
  sanitizeLeadPl,
} from "@/lib/rss/apply-enrichment";
import { polishTypography, requireOpenAIKey } from "@/lib/rss/translate";

const OPENAI_API = "https://api.openai.com/v1/chat/completions";
const OPENAI_ITEMS_PER_BATCH = 12;

export type RssDraftInput = {
  title: string;
  excerpt: string;
  source?: string | null;
};

/** Normalized B+ output (internal). */
export type RssDraftEnrichment = {
  title_pl: string;
  lead_pl: string;
  body_pl: string[];
  context_pl: string;
  category?: string;
  tags?: string[];
  reading_time_min?: number;
};

/**
 * Strict OpenAI JSON per item (also accepts legacy *_pl keys).
 * @see docs — lead/body/context mapping to excerpt/content/contextNote
 */
export type RawOpenAiRssItem = {
  title?: string;
  title_pl?: string;
  lead?: string;
  lead_pl?: string;
  summary_pl?: string;
  body?: string[] | string;
  body_pl?: string[] | string;
  context?: string;
  context_pl?: string;
  content?: string[] | string;
  paragraphs?: string[] | string;
  category?: string;
  tags?: string[];
  reading_time_min?: number;
};

type OpenAIEnrichmentPayload = {
  items?: RawOpenAiRssItem[];
};

const B_PLUS_SYSTEM_PROMPT =
  "You process short English RSS metadata for a Polish science/tech news portal (hybrid aggregator + editorial). " +
  "STRICT RULES: do NOT add facts beyond title and snippet. do NOT quote sources beyond input. " +
  "Translate title to natural Polish (field: title). " +
  "lead: exactly 1–2 factual sentences in Polish from input ONLY. Never name the publisher or write 'according to' / 'reports'. " +
  "body: JSON array of 2–4 distinct Polish paragraphs, factual expansion from snippet only. " +
  "context: 2–3 sentences of GENERAL industry/trend framing as WSS editorial comment. No new specific facts, dates, numbers, or quotes. " +
  "tags: 3–5 strings. category: e.g. Technology, Space, Science, Business. " +
  "Use commas not em dashes. Keep proper names and numbers from input. " +
  'Return JSON ONLY: {"items":[{"title":"...","lead":"...","body":["...","..."],"context":"...","tags":["..."],"category":"..."}]} ' +
  "Same number of items, same order as input.";

function clampReadingTime(value: unknown, fallbackText: string): number {
  const n =
    typeof value === "number" && Number.isFinite(value)
      ? Math.round(value)
      : estimateReadingTimeMin(fallbackText);
  return Math.max(2, Math.min(8, n));
}

/** Text-length reading estimate when the model omits reading_time_min. */
export function estimateReadingTimeMin(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.min(8, Math.ceil(words / 180)));
}

/** Map free-form AI category labels → WSS editorial bucket → Prisma slug. */
export function mapAiCategoryToEditorial(
  category: string | undefined
): RssEditorialCategory | null {
  if (!category?.trim()) return null;
  const n = category.toLowerCase();

  if (/\b(ai|artificial|machine learning|llm|gpt)\b/.test(n)) return "AI";
  if (/\b(space|mission|launch|rocket|orbit|nasa|esa|astronaut)\b/.test(n))
    return "MISJE";
  if (
    /\b(astronom|cosmic|planet|galaxy|telescope|universe|physics|science)\b/.test(
      n
    )
  )
    return "ASTRONOMIA";
  if (/\b(climate|earth|environment|weather|ecology)\b/.test(n))
    return "ZIEMIA";
  if (
    /\b(tech|technology|software|hardware|startup|business|gadget|cyber)\b/.test(
      n
    )
  )
    return "TECHNOLOGIE";

  return null;
}

export function mapAiCategoryToSlug(category: string | undefined): string | null {
  const editorial = mapAiCategoryToEditorial(category);
  return editorial ? editorialCategoryToSlug(editorial) : null;
}

function normalizeBodyParagraphs(raw: unknown, fallback: string): string[] {
  const parsed = parseBodyParagraphs(raw);
  if (parsed.length > 0) return parsed;
  return fallback.trim() ? [fallback.trim()] : [];
}

function coalesceRawItem(raw: RawOpenAiRssItem) {
  return {
    title_pl: resolveTitleText(raw),
    lead_pl: resolveLeadText(raw),
    body_pl: raw.body ?? raw.body_pl ?? raw.content ?? raw.paragraphs,
    context_pl: resolveContextText(raw),
    category: raw.category?.trim() || undefined,
    tags: raw.tags,
    reading_time_min: raw.reading_time_min,
  };
}

function normalizeEnrichment(
  raw: RawOpenAiRssItem,
  input: RssDraftInput
): RssDraftEnrichment {
  const coalesced = coalesceRawItem(raw);
  const title_pl = polishTypography(coalesced.title_pl || input.title);
  const lead_pl = polishTypography(
    sanitizeLeadPl(coalesced.lead_pl || input.excerpt.slice(0, 280), input.source)
  );
  const body_pl = normalizeBodyParagraphs(
    coalesced.body_pl,
    input.excerpt.slice(0, 600)
  ).map((p) => polishTypography(p));
  const context_pl = coalesced.context_pl
    ? polishTypography(coalesced.context_pl)
    : "";
  const tags = Array.isArray(coalesced.tags)
    ? coalesced.tags
        .map((t) => String(t).trim())
        .filter(Boolean)
        .slice(0, 5)
    : undefined;

  const readingText = [title_pl, lead_pl, ...body_pl, context_pl]
    .filter(Boolean)
    .join(" ");

  return {
    title_pl,
    lead_pl,
    body_pl,
    context_pl,
    category: coalesced.category,
    tags: tags?.length ? tags : undefined,
    reading_time_min: clampReadingTime(coalesced.reading_time_min, readingText),
  };
}

async function enrichBatchOpenAI(
  batch: RssDraftInput[]
): Promise<RssDraftEnrichment[]> {
  const key = requireOpenAIKey();
  const model = getOpenAIEnrichmentModel();

  const inputJson = JSON.stringify(
    batch.map((p) => ({
      title: p.title,
      snippet: p.excerpt,
    }))
  );

  const res = await fetch(OPENAI_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: B_PLUS_SYSTEM_PROMPT },
        { role: "user", content: inputJson },
      ],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenAI HTTP ${res.status}: ${raw.slice(0, 400)}`);
  }

  let parsed: { choices?: { message?: { content?: string } }[] };
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    throw new Error("OpenAI: invalid JSON envelope");
  }

  const content = parsed.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI: empty response");

  let payload: OpenAIEnrichmentPayload;
  try {
    payload = JSON.parse(content) as OpenAIEnrichmentPayload;
  } catch {
    throw new Error("OpenAI: invalid enrichment JSON");
  }

  let items = payload.items ?? [];
  if (items.length !== batch.length && batch.length === 1) {
    const root = payload as OpenAIEnrichmentPayload & RawOpenAiRssItem;
    if (root.lead || root.body || root.context || root.lead_pl || root.body_pl) {
      items = [root];
    }
  }
  if (items.length !== batch.length) {
    throw new Error(
      `OpenAI: expected ${batch.length} items, got ${items.length}`
    );
  }

  return batch.map((input, i) => normalizeEnrichment(items[i] ?? {}, input));
}

/** Enrich unprocessed DRAFT RSS rows via OpenAI Chat Completions. */
export async function enrichRssDrafts(
  drafts: RssDraftInput[]
): Promise<RssDraftEnrichment[]> {
  if (drafts.length === 0) return [];

  const output: RssDraftEnrichment[] = [];

  for (let start = 0; start < drafts.length; start += OPENAI_ITEMS_PER_BATCH) {
    const batch = drafts.slice(start, start + OPENAI_ITEMS_PER_BATCH);
    const enriched = await enrichBatchOpenAI(batch);
    output.push(...enriched);
  }

  return output;
}

export type RssRevisionInput = {
  title_pl: string;
  lead_pl: string;
  body_pl: string[];
  context_pl?: string | null;
  source?: string | null;
};

const REVISE_SYSTEM_PROMPT =
  "You rewrite Polish RSS article metadata for a science/tech portal (B+ hybrid). " +
  "STRICT: no new facts beyond input. " +
  "title: natural Polish headline. lead: 1–2 factual sentences, NO publisher names. " +
  "body: array of 2–4 factual paragraphs from input only. " +
  "context: 2–3 sentences general trend (WSS editorial comment), no new specific facts. " +
  "Use commas not em dashes. " +
  'Return JSON ONLY: {"title":"...","lead":"...","body":["..."],"context":"...","tags":["..."],"category":"..."}';

/**
 * Re-run B+ AI when original EN RSS snippet is unavailable.
 */
export async function reviseRssArticlePolish(
  input: RssRevisionInput
): Promise<RssDraftEnrichment> {
  const key = requireOpenAIKey();
  const model = getOpenAIEnrichmentModel();

  const res = await fetch(OPENAI_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: REVISE_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            title: input.title_pl,
            lead: input.lead_pl,
            body: input.body_pl,
            context: input.context_pl ?? undefined,
          }),
        },
      ],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenAI HTTP ${res.status}: ${raw.slice(0, 400)}`);
  }

  let parsed: { choices?: { message?: { content?: string } }[] };
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    throw new Error("OpenAI: invalid JSON envelope");
  }

  const content = parsed.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI: empty response");

  let item: RawOpenAiRssItem;
  try {
    item = JSON.parse(content) as RawOpenAiRssItem;
  } catch {
    throw new Error("OpenAI: invalid revision JSON");
  }

  return normalizeEnrichment(item, {
    title: input.title_pl,
    excerpt: input.lead_pl,
    source: input.source,
  });
}
