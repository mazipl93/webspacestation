import {
  OPS_LAUNCH_BRIEFS_BATCH_LIMIT,
  OPS_LAUNCH_BRIEFS_HORIZON_DAYS,
  getLaunchBriefsModel,
  isLaunchBriefsEnabled,
  requireLaunchBriefsOpenAIKey,
} from "@/lib/ops/launch-brief-config";
import {
  attachBriefsToLaunches,
  filterLaunchesForBriefGeneration,
  mergeLaunchBriefsFromPrevious,
} from "@/lib/ops/launch-brief-merge";
import { polishTypography } from "@/lib/rss/translate";
import type { OpsLaunch, OpsLaunchBrief } from "@/lib/ops/types";

const OPENAI_API = "https://api.openai.com/v1/chat/completions";
const OPENAI_ITEMS_PER_BATCH = 6;

const LAUNCH_BRIEF_SYSTEM_PROMPT =
  "Jesteś redaktorem portalu kosmicznego Web Space Station. " +
  "Na podstawie WYŁĄCZNIE dostarczonych pól JSON o locie napisz krótki kontekst po polsku. " +
  "Zasady: 2–3 zdania, maks. 280 znaków w polu brief. " +
  "Nie dodawaj faktów spoza inputu (nie zgaduj payloadu ani orbit). " +
  "Misje nieujawnione, NROL, „Unknown payload”: napisz wprost, że szczegóły są niepubliczne. " +
  "Rutynowy Starlink: wyjaśnij krótko profil misji (internet LEO), bez udawania przełomu. " +
  "Ton: konkretny, ciekawy, bez clickbaitu. Używaj przecinków, nie myślników em. " +
  'Zwróć JSON: {"items":[{"id":"...","brief":"..."}]} — ta sama liczba i kolejność co input.';

type BriefInput = {
  id: string;
  provider: string;
  mission: string;
  rocketName?: string;
  site: string;
  net: string;
  windowLabel?: string;
  statusLabel: string;
};

type RawBriefItem = { id?: string; brief?: string };

function toBriefInput(launch: OpsLaunch): BriefInput {
  return {
    id: launch.id,
    provider: launch.provider,
    mission: launch.mission,
    rocketName: launch.rocketName,
    site: launch.site,
    net: launch.net,
    windowLabel: launch.windowLabel,
    statusLabel: launch.statusLabel,
  };
}

function sanitizeBriefText(raw: string): string | null {
  const text = polishTypography(raw.replace(/\s+/g, " ").trim());
  if (text.length < 40 || text.length > 360) return null;
  return text;
}

async function generateBriefBatch(
  batch: BriefInput[],
): Promise<Map<string, OpsLaunchBrief>> {
  const key = requireLaunchBriefsOpenAIKey();
  const model = getLaunchBriefsModel();
  const generatedAt = new Date().toISOString();

  const res = await fetch(OPENAI_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.45,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: LAUNCH_BRIEF_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(batch) },
      ],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenAI launch brief HTTP ${res.status}: ${raw.slice(0, 400)}`);
  }

  let envelope: { choices?: { message?: { content?: string } }[] };
  try {
    envelope = JSON.parse(raw) as typeof envelope;
  } catch {
    throw new Error("OpenAI launch brief: invalid JSON envelope");
  }

  const content = envelope.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI launch brief: empty response");

  let payload: { items?: RawBriefItem[] };
  try {
    payload = JSON.parse(content) as { items?: RawBriefItem[] };
  } catch {
    throw new Error("OpenAI launch brief: invalid items JSON");
  }

  const items = payload.items ?? [];
  const byId = new Map<string, OpsLaunchBrief>();

  for (const input of batch) {
    const item = items.find((row) => row.id === input.id);
    const text = item?.brief ? sanitizeBriefText(item.brief) : null;
    if (!text) continue;
    byId.set(input.id, {
      text,
      basedOnNet: input.net,
      generatedAt,
      model,
    });
  }

  return byId;
}

/** Generuje brakujące briefy (OpenAI) — wołaj tylko z cron / ops:refresh. */
export async function generateMissingLaunchBriefs(
  launches: OpsLaunch[],
): Promise<OpsLaunch[]> {
  if (!isLaunchBriefsEnabled()) return launches;

  const pending = filterLaunchesForBriefGeneration(
    launches,
    OPS_LAUNCH_BRIEFS_BATCH_LIMIT,
    OPS_LAUNCH_BRIEFS_HORIZON_DAYS,
  );
  if (pending.length === 0) return launches;

  const generated = new Map<string, OpsLaunchBrief>();

  for (let i = 0; i < pending.length; i += OPENAI_ITEMS_PER_BATCH) {
    const batch = pending.slice(i, i + OPENAI_ITEMS_PER_BATCH).map(toBriefInput);
    try {
      const part = await generateBriefBatch(batch);
      for (const [id, brief] of part) generated.set(id, brief);
    } catch (error) {
      console.error("[ops] launch brief batch failed", error);
    }
  }

  if (generated.size === 0) return launches;
  return attachBriefsToLaunches(launches, generated);
}

export type FetchCoreOpsOptions = {
  /** OpenAI brief generation — tylko cron / ops:refresh. */
  generateBriefs?: boolean;
  previousLaunches?: OpsLaunch[];
};

export async function applyLaunchBriefPipeline(
  launches: OpsLaunch[],
  options: FetchCoreOpsOptions = {},
): Promise<OpsLaunch[]> {
  let next = mergeLaunchBriefsFromPrevious(
    launches,
    options.previousLaunches ?? [],
  );

  if (options.generateBriefs) {
    next = await generateMissingLaunchBriefs(next);
  }

  return next;
}
