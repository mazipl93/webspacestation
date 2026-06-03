import { runScheduledPublish } from "@/lib/server/articles";

async function main() {
  const result = await runScheduledPublish();
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
