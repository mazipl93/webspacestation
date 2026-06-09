import type {
  ExternalFeedConfig,
  NormalizedRssItem,
  RssEditorialCategory,
} from "@/lib/rss/types";

export type CategorizeInput = {
  feed: ExternalFeedConfig;
  title: string;
  excerpt: string;
  rawText: string;
};

const KEYWORDS: Record<RssEditorialCategory, RegExp[]> = {
  AI: [
    /\b(ai|artificial intelligence|machine learning|llm|gpt|openai|anthropic|neural)\b/i,
    /\b(szczeczna inteligencja|uczenie maszynowe)\b/i,
  ],
  MISJE: [
    /\b(mission|launch|spacecraft|rover|artemis|starship|falcon|soyuz|crew|docking|orbit)\b/i,
    /\b(misja|start|rakieta|statek kosmiczny|lądowanie|załoga)\b/i,
  ],
  ASTRONOMIA: [
    /\b(telescope|galaxy|exoplanet|black hole|supernova|jwst|hubble|cosmic|universe)\b/i,
    /\b(teleskop|galaktyk|egzoplanet|czarna dziura|wszechświat)\b/i,
  ],
  ZIEMIA: [
    /\b(climate|earth|satellite imagery|hurricane|wildfire|sea level|weather)\b/i,
    /\b(klimat|ziemia|pogoda|satelitarny|morze|pożar)\b/i,
  ],
  TECHNOLOGIE: [
    /\b(rocket|propulsion|satellite|space industry|engineering|hardware)\b/i,
    /\b(technolog|oprogramowanie|chip|startup|device)\b/i,
  ],
};

function scoreCategory(text: string, category: RssEditorialCategory): number {
  return KEYWORDS[category].reduce(
    (sum, re) => sum + (re.test(text) ? 1 : 0),
    0
  );
}

const MISSION_FEED_IDS = new Set(["nasa", "esa", "spacenews"]);

/** Bucket defaults from feed publisher, refined by keyword rules. */
function defaultCategoryForFeed(
  feed: ExternalFeedConfig
): RssEditorialCategory {
  switch (feed.bucket) {
    case "space":
      if (MISSION_FEED_IDS.has(feed.id)) return "MISJE";
      return "ASTRONOMIA";
    case "science":
      return "ASTRONOMIA";
    case "tech":
    default:
      return "TECHNOLOGIE";
  }
}

/**
 * Keyword-based categorization with feed-level fallback.
 * Hook point for future AI categorization (pass text to an LLM route).
 */
export function categorizeRssItem(input: CategorizeInput): RssEditorialCategory {
  const haystack = `${input.title} ${input.excerpt} ${input.rawText}`;
  const categories: RssEditorialCategory[] = [
    "AI",
    "MISJE",
    "ASTRONOMIA",
    "ZIEMIA",
    "TECHNOLOGIE",
  ];

  let best: RssEditorialCategory = defaultCategoryForFeed(input.feed);
  let bestScore = 0;

  for (const cat of categories) {
    const score = scoreCategory(haystack, cat);
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }

  // Tech publishers: promote AI when keywords hit
  if (input.feed.bucket === "tech" && bestScore === 0) {
    return "TECHNOLOGIE";
  }

  return best;
}

/** Map editorial bucket → existing WSS category slug in Prisma. */
export function editorialCategoryToSlug(
  category: RssEditorialCategory
): string {
  const map: Record<RssEditorialCategory, string> = {
    MISJE: "misje",
    ASTRONOMIA: "astronomia",
    TECHNOLOGIE: "technologie",
    AI: "technologie",
    ZIEMIA: "ziemia-z-kosmosu",
  };
  return map[category];
}

/**
 * Optional AI categorization hook — enrichment runs in process-drafts (OpenAI).
 */
export async function categorizeWithAi(
  item: Pick<NormalizedRssItem, "title" | "excerpt">
): Promise<RssEditorialCategory | null> {
  void item;
  return null;
}
