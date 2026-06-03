import { runScheduledPublish } from "@/lib/server/articles";

const INTERVAL_MS = 60_000;

async function tick() {
  const result = await runScheduledPublish();
  if (result.published > 0 || result.due > 0) {
    console.log(`[publish-scheduled-watch] ${new Date().toISOString()}`, result);
  }
}

console.log(
  `[publish-scheduled-watch] polling every ${INTERVAL_MS / 1000}s — Ctrl+C to stop`
);
void tick();
setInterval(() => {
  void tick().catch((err) => console.error(err));
}, INTERVAL_MS);
