/**
 * Run a .sql file against DIRECT_URL (Supabase). Usage:
 *   npx tsx scripts/run-sql-file.ts supabase/avatars.sql
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });

const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx scripts/run-sql-file.ts <path-to.sql>");
  process.exit(1);
}

const prisma = new PrismaClient();

function statementsFromSql(raw: string): string[] {
  return raw
    .split(/;\s*\n/)
    .map((s) => s.replace(/^--[^\n]*\n/gm, "").trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
}

async function main() {
  const raw = readFileSync(file, "utf8");
  const statements = statementsFromSql(raw);
  console.log(`Executing ${statements.length} statement(s) from ${file}...`);

  for (const stmt of statements) {
    const preview =
      stmt.split("\n").find((l) => !l.trim().startsWith("--"))?.trim().slice(0, 72) ??
      stmt.slice(0, 72);
    console.log(`→ ${preview}...`);
    await prisma.$executeRawUnsafe(stmt);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
