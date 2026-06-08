/**
 * Apply a Supabase SQL file (supports $$ function bodies).
 * Usage: npx tsx scripts/apply-supabase-sql-file.ts supabase/user_article_likes.sql
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import { Client } from "pg";

config({ path: ".env" });

const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx scripts/apply-supabase-sql-file.ts <path-to.sql>");
  process.exit(1);
}

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DIRECT_URL or DATABASE_URL in .env");
  process.exit(1);
}

function stripLineComments(sql: string): string {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
}

/** Split SQL on semicolons outside $$ ... $$ blocks. */
function splitSqlStatements(raw: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inDollar = false;
  const sql = stripLineComments(raw);

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (!inDollar && ch === "$" && next === "$") {
      inDollar = true;
      current += "$$";
      i++;
      continue;
    }

    if (inDollar && ch === "$" && next === "$") {
      inDollar = false;
      current += "$$";
      i++;
      continue;
    }

    if (!inDollar && ch === ";") {
      const stmt = current.trim();
      if (stmt.length > 0 && !stmt.startsWith("--")) {
        statements.push(stmt);
      }
      current = "";
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail.length > 0 && !tail.startsWith("--")) {
    statements.push(tail);
  }

  return statements;
}

async function main() {
  const raw = readFileSync(file, "utf8");
  const statements = splitSqlStatements(raw);
  console.log(`Applying ${statements.length} statement(s) from ${file}...`);

  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const stmt of statements) {
      const preview =
        stmt.split("\n").find((l) => l.trim() && !l.trim().startsWith("--"))?.trim().slice(0, 72) ??
        stmt.slice(0, 72);
      console.log(`→ ${preview}...`);
      await client.query(stmt);
    }
    console.log("Done.");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
