/**
 * Dev/smoke: oznacz N najnowszych PUBLISHED jako Temat tygodnia.
 * Usage: node scripts/seed-week-topic.mjs [limit=3]
 */
import { PrismaClient } from "@prisma/client";

const limit = Math.min(8, Math.max(1, Number(process.argv[2]) || 3));
const p = new PrismaClient();

try {
  const latest = await p.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: { id: true, slug: true, title: true },
  });

  if (latest.length === 0) {
    console.error("Brak artykułów PUBLISHED — opublikuj co najmniej jeden w CMS.");
    process.exit(1);
  }

  await p.article.updateMany({
    where: { id: { in: latest.map((a) => a.id) } },
    data: { weekTopic: true },
  });

  console.log(`Ustawiono weekTopic=true dla ${latest.length} artykułów:`);
  for (const a of latest) console.log(`  - ${a.slug}`);

  const local = process.env.SITE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3000";
  try {
    const res = await fetch(`${local}/api/revalidate-articles`, { method: "POST" });
    console.log(
      res.ok
        ? `[revalidate] OK (${local})`
        : `[revalidate] HTTP ${res.status} — uruchom dev i: npm run cache:revalidate`
    );
  } catch {
    console.log("Dev server wyłączony — po npm run dev odśwież / (Ctrl+F5).");
  }
} finally {
  await p.$disconnect();
}
