/**
 * Usuwa **bold** z plików źródłowych lib/editorial/*.ts
 */
import fs from "fs";
import path from "path";

function stripEditorialBoldMarkdown(raw: string): string {
  return raw.replace(/\*\*([^*]+)\*\*/g, "$1");
}

const dir = path.join(process.cwd(), "lib", "editorial");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

for (const file of files) {
  const fp = path.join(dir, file);
  const raw = fs.readFileSync(fp, "utf8");
  const next = stripEditorialBoldMarkdown(raw);
  if (next !== raw) {
    fs.writeFileSync(fp, next, "utf8");
    console.log(`[stripped] ${file}`);
  }
}
