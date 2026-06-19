import { slugify } from "@/lib/server/validation";
import { launchPhaseLabel } from "@/lib/ops/launch-phase";
import { formatLaunchSummary } from "@/lib/ops/localize-ops";
import { launchTagFor } from "@/lib/ops/launch-tag";
import type { OpsLaunch } from "@/lib/ops/types";

const LL2_SOURCE = "Launch Library 2 (The Space Devs)";

export type LaunchNewsDraftFields = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  source: string;
  originalUrl: string | null;
  coverImage: string | null;
  readingTime: number;
  syncFingerprint: string;
};

function formatNetPl(net: string, windowLabel?: string): string {
  const fmt = new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  });
  const netLabel = `${fmt.format(new Date(net))} UTC`;
  if (windowLabel?.trim()) return windowLabel;
  return netLabel;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Stable fingerprint — update DRAFT only when launch facts change. */
export function launchNewsSyncFingerprint(launch: OpsLaunch): string {
  return JSON.stringify({
    net: launch.net,
    windowEnd: launch.windowEnd ?? null,
    statusLabel: launch.statusLabel,
    phase: launch.phase,
    mission: launch.mission,
    site: launch.site,
    rocketName: launch.rocketName ?? null,
  });
}

export function launchNewsDraftSlug(launch: OpsLaunch): string {
  const base = slugify(`zapowiedza-${launch.mission}`);
  const suffix = launch.id.replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase() || "start";
  return `${base}-${suffix}`.slice(0, 200);
}

export function buildLaunchNewsDraftFields(launch: OpsLaunch): LaunchNewsDraftFields {
  const netLabel = formatNetPl(launch.net, launch.windowLabel);
  const phase = launchPhaseLabel(launch.phase);
  const summary = formatLaunchSummary(launch);
  const fingerprint = launchNewsSyncFingerprint(launch);

  const title = `Zapowiedź: ${launch.mission} — start ${netLabel.split("·")[0]?.trim() ?? netLabel}`;

  const knownFacts = [
    launch.mission && `Misja / payload: ${launch.mission}`,
    launch.rocketName && `Rakieta: ${launch.rocketName}`,
    launch.provider && `Operator: ${launch.provider}`,
    launch.site && `Miejsce startu: ${launch.site}`,
    `Planowany moment (NET): ${netLabel}`,
    `Status: ${launch.statusLabel} (${phase})`,
  ].filter(Boolean) as string[];

  const excerpt =
    `${launch.provider} planuje start misji ${launch.mission}. ${summary}. ` +
    `NET: ${netLabel}. Status: ${launch.statusLabel}.`;

  const paragraphs = [
    `<p><strong>Zapowiedź startu</strong> — szkic redakcyjny na podstawie publicznego harmonogramu ${escapeHtml(LL2_SOURCE)}. ` +
      `Przed publikacją uzupełnij kontekst i usuń spekulacje.</p>`,
    `<p><strong>Co wiemy</strong></p>`,
    `<ul>${knownFacts.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`,
    `<p><strong>Czego nie ustalamy w szkicu</strong></p>`,
    `<ul>` +
      `<li>Szczegółowy skład ładunku lub cele naukowe — tylko jeśli potwierdzi je operator.</li>` +
      `<li>Przyczyny opóźnień lub zmian okna — wyłącznie na podstawie oficjalnego komunikatu.</li>` +
      `<li>Wynik startu przed faktycznym zakończeniem misji.</li>` +
      `</ul>`,
    launch.brief?.text
      ? `<p><strong>Kontekst (automatyczny skrót)</strong></p><p>${escapeHtml(launch.brief.text)}</p>`
      : "",
    launch.detailUrl
      ? `<p>Źródło harmonogramu: <a href="${escapeHtml(launch.detailUrl)}" rel="noopener noreferrer">${escapeHtml(LL2_SOURCE)}</a></p>`
      : `<p>Źródło harmonogramu: ${escapeHtml(LL2_SOURCE)}</p>`,
    `<!-- launch-sync:${Buffer.from(fingerprint, "utf8").toString("base64url")} -->`,
  ].filter(Boolean);

  const content = paragraphs.join("\n");
  const tags = [
    launchTagFor(launch.id),
    slugify(launch.provider),
    "zapowiedź startu",
  ].filter(Boolean);

  return {
    slug: launchNewsDraftSlug(launch),
    title,
    excerpt,
    content,
    tags,
    source: LL2_SOURCE,
    originalUrl: launch.detailUrl ?? null,
    coverImage: launch.image?.trim() ? launch.image : null,
    readingTime: estimateReadingTime(content),
    syncFingerprint: fingerprint,
  };
}

export function extractLaunchSyncFingerprint(content: string | null | undefined): string | null {
  if (!content) return null;
  const match = content.match(/<!-- launch-sync:([A-Za-z0-9_-]+) -->/);
  if (!match?.[1]) return null;
  try {
    return Buffer.from(match[1], "base64url").toString("utf8");
  } catch {
    return null;
  }
}
