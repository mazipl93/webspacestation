import { getLaunchBriefsOpenAIKey, getWebSearchModel } from "@/lib/ops/launch-brief-config";
import { polishTypography } from "@/lib/rss/translate";
import type { OpsLaunch, OpsLaunchBrief } from "@/lib/ops/types";

const OPENAI_API = "https://api.openai.com/v1/chat/completions";

const WEB_SEARCH_SYSTEM_PROMPT =
  "Jesteś redaktorem portalu kosmicznego Web Space Station (webspacestation.pl). " +
  "Napisz krótki KONTEKST do startu rakiety po polsku, korzystając z aktualnych informacji w internecie. " +
  "Zasady: 2–3 zdania, maks. 280 znaków. " +
  "Misje klasyfikowane (NROL, USSF): napisz co wiadomo publicznie (klient, rola misji), nie spekuluj o ładunku. " +
  "Misje załogowe: wymień astronautów jeśli znani, cel i czas trwania. " +
  "Misje naukowe: cel naukowy, orbita docelowa lub cel badań. " +
  "Ton: konkretny, ciekawy, bez clickbaitu. Używaj przecinków, nie myślników em. " +
  "Zwróć WYŁĄCZNIE sam tekst kontekstu — bez tytułu, cudzysłowów, przypisów ani etykiet.";

/** Usuwa znaczniki cytowań OpenAI web search ([1], [2], itp.) */
function stripCitations(text: string): string {
  return text.replace(/\[\d+\]/g, "").replace(/\s{2,}/g, " ").trim();
}

/**
 * Generuje brief dla "ciekawej" misji z pomocą web search (gpt-4o-search-preview).
 * Przy padzie lub błędzie zwraca null — caller powinien fallbackować do batcha.
 */
export async function generateBriefWithWebSearch(
  launch: OpsLaunch,
): Promise<OpsLaunchBrief | null> {
  const key = getLaunchBriefsOpenAIKey();
  if (!key) return null;

  const model = getWebSearchModel();
  const generatedAt = new Date().toISOString();

  const userMessage =
    `Misja: ${launch.mission}\n` +
    `Operator: ${launch.provider}\n` +
    `Rakieta: ${launch.rocketName ?? "nieznana"}\n` +
    `Platforma startowa: ${launch.site}\n` +
    `Data startu (NET, UTC): ${launch.net}\n` +
    (launch.windowLabel ? `Okno: ${launch.windowLabel}\n` : "") +
    `Status: ${launch.statusLabel}`;

  try {
    const res = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        web_search_options: { search_context_size: "low" },
        messages: [
          { role: "system", content: WEB_SEARCH_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(
        `[ops:briefs] web search HTTP ${res.status} (${launch.mission}):`,
        err.slice(0, 200),
      );
      return null;
    }

    const envelope = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const raw = envelope.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;

    const text = polishTypography(stripCitations(raw.replace(/\s+/g, " ").trim()));
    if (text.length < 40 || text.length > 360) return null;

    return { text, basedOnNet: launch.net, generatedAt, model };
  } catch (err) {
    console.warn(`[ops:briefs] web search failed (${launch.mission}):`, err);
    return null;
  }
}
