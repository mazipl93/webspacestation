/**
 * Cleanup legacy wss-tags: in subtitle → articles.tags[].
 * Uses raw SQL so it works even when Prisma Client was not regenerated yet.
 *
 * DB column `tags` must exist (migration 20260602150000_article_tags):
 *   npm run db:deploy
 *
 * Usage: npm run db:migrate-article-tags
 */
import { config } from "dotenv";

config();

import { PrismaClient } from "@prisma/client";

const LEGACY_MARKER = "wss-tags:";

type LegacyRow = {
  id: string;
  subtitle: string | null;
  tags: string[] | null;
};

function splitLegacyTags(encoded: string): string[] {
  return encoded
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function cleanSubtitle(subtitle: string): string {
  const idx = subtitle.indexOf(LEGACY_MARKER);
  if (idx === -1) return subtitle;
  return subtitle
    .slice(0, idx)
    .replace(/\s*·\s*$/, "")
    .trim();
}

function mergeTags(existing: string[] | null, extracted: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of [...(existing ?? []), ...extracted]) {
    const key = t.trim();
    if (!key) continue;
    const lower = key.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    out.push(key);
    if (out.length >= 5) break;
  }
  return out;
}

async function main() {
  const prisma = new PrismaClient();

  let rows: LegacyRow[];
  try {
    rows = await prisma.$queryRawUnsafe<LegacyRow[]>(
      `SELECT id, subtitle, tags FROM articles WHERE subtitle LIKE $1`,
      `%${LEGACY_MARKER}%`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('column "tags"') || message.includes("does not exist")) {
      console.error(
        [
          "Kolumna articles.tags nie istnieje w bazie.",
          "Uruchom najpierw: npm run db:deploy",
        ].join("\n")
      );
      process.exit(1);
    }
    throw err;
  }

  console.log(`Articles with legacy subtitle tags: ${rows.length}`);
  let updated = 0;

  for (const row of rows) {
    const subtitle = row.subtitle ?? "";
    const idx = subtitle.indexOf(LEGACY_MARKER);
    if (idx === -1) continue;

    const extracted = splitLegacyTags(
      subtitle.slice(idx + LEGACY_MARKER.length)
    );
    const tags = mergeTags(row.tags, extracted);
    const cleaned = cleanSubtitle(subtitle);

    await prisma.$executeRawUnsafe(
      `UPDATE articles SET tags = $1::text[], subtitle = $2 WHERE id = $3`,
      tags,
      cleaned,
      row.id
    );
    updated += 1;
  }

  console.log(`Cleaned ${updated} article(s).`);
  console.log(
    "Jeśli aplikacja nadal nie widzi pola tags, zatrzymaj npm run dev i uruchom: npx prisma generate"
  );
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
