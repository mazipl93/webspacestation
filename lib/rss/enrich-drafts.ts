/**
 * RSS DRAFT enrichment (OpenAI): PL title + factual summary + optional metadata.
 * Does not publish or generate full article body.
 */
import { editorialCategoryToSlug } from "@/lib/rss/categorize";
import type { RssEditorialCategory } from "@/lib/rss/types";
import { getOpenAIEnrichmentModel } from "@/lib/rss/openai-config";
import { polishTypography, requireOpenAIKey } from "@/lib/rss/translate";

const OPENAI_API = "https://api.openai.com/v1/chat/completions";
const OPENAI_ITEMS_PER_BATCH = 12;

export type RssDraftInput = {
  title: string;
  excerpt: string;
  source?: string | null;
};

/** Strict worker output shape (one item). */
export type RssDraftEnrichment = {
  title_pl: string;
  summary_pl: string;
  category?: string;
  tags?: string[];
  reading_time_min?: number;
};

type OpenAIEnrichmentPayload = {
  items: RssDraftEnrichment[];
};

function clampReadingTime(value: unknown, fallbackText: string): number {
  const n =
    typeof value === "number" && Number.isFinite(value)
      ? Math.round(value)
      : estimateReadingTimeMin(fallbackText);
  return Math.max(1, Math.min(5, n));
}

/** Snippet-only reading estimate when the model omits reading_time_min. */
export function estimateReadingTimeMin(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.min(5, Math.ceil(words / 200)));
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

function normalizeEnrichment(
  raw: RssDraftEnrichment,
  input: RssDraftInput
): RssDraftEnrichment {
  const title_pl = polishTypography(
    raw.title_pl?.trim() || input.title
  );
  const summary_pl = polishTypography(
    raw.summary_pl?.trim() || input.excerpt.slice(0, 300)
  );
  const tags = Array.isArray(raw.tags)
    ? raw.tags
        .map((t) => String(t).trim())
        .filter(Boolean)
        .slice(0, 5)
    : undefined;

  return {
    title_pl,
    summary_pl,
    category: raw.category?.trim() || undefined,
    tags: tags?.length ? tags : undefined,
    reading_time_min: clampReadingTime(
      raw.reading_time_min,
      `${input.title} ${input.excerpt}`
    ),
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
      source: p.source ?? undefined,
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
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You process short English RSS metadata for a Polish science/tech news portal. " +
            "Rules: translate the title to natural Polish (not word-for-word). " +
            "Write summary_pl as 1–2 factual sentences in Polish using ONLY facts from title and snippet—no invented details, no speculation, no full article. " +
            "summary_pl MUST add context beyond title_pl (use the snippet): never copy or lightly rephrase the title alone. " +
            "Optionally set category (e.g. Technology, Space, Science, Business), 3–5 tags, reading_time_min (1–5, snippet length only). " +
            "Use commas not em dashes. Keep proper names and numbers. " +
            'Return JSON only: {"items":[{"title_pl":"...","summary_pl":"...","category":"...","tags":["..."],"reading_time_min":1},...]} ' +
            "Same number of items, same order as input.",
        },
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

  const items = payload.items ?? [];
  if (items.length !== batch.length) {
    throw new Error(
      `OpenAI: expected ${batch.length} items, got ${items.length}`
    );
  }

  return batch.map((input, i) =>
    normalizeEnrichment(items[i] ?? {}, input)
  );
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
  summary_pl: string;
  source?: string | null;
};

/**
 * Re-run AI when original EN RSS snippet is unavailable (article already in REVIEW/PUBLISHED).
 * Rewrites Polish title + summary instead of re-translating the same PL text.
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
        {
          role: "system",
          content:
            "You edit Polish metadata for a science/tech news portal (RSS aggregator). " +
            "Improve title_pl and summary_pl: clearer natural Polish, fix awkward phrasing, " +
            "keep all facts — do not invent details. summary_pl must add context beyond title_pl " +
            "(1–2 factual sentences). Optionally adjust category, 3–5 tags, reading_time_min (1–5). " +
            "Use commas not em dashes. Keep proper names and numbers. " +
            'Return JSON only: {"title_pl":"...","summary_pl":"...","category":"...","tags":["..."],"reading_time_min":1}',
        },
        {
          role: "user",
          content: JSON.stringify({
            title_pl: input.title_pl,
            summary_pl: input.summary_pl,
            source: input.source ?? undefined,
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

  let item: RssDraftEnrichment;
  try {
    item = JSON.parse(content) as RssDraftEnrichment;
  } catch {
    throw new Error("OpenAI: invalid revision JSON");
  }

  return normalizeEnrichment(item, {
    title: input.title_pl,
    excerpt: input.summary_pl,
    source: input.source,
  });
}
