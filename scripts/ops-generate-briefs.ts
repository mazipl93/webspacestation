/**
 * Generuje briefy AI dla startów już w ops_cache (bez ponownego fetchu LL2).
 * Usage: npm run ops:briefs
 */
import { config } from "dotenv";

config();

import { generateMissingLaunchBriefs } from "../lib/ops/generate-launch-briefs";
import { mergeLaunchBriefsFromPrevious } from "../lib/ops/launch-brief-merge";
import { OPS_CACHE_KEYS } from "../lib/ops/payloads";
import { readStoredCore, writeOpsCacheEntry } from "../lib/ops/snapshot-store";

async function main() {
  const stored = await readStoredCore();
  if (!stored || stored.launches.length === 0) {
    console.error("Brak snapshotu core — najpierw npm run ops:refresh");
    process.exit(1);
  }

  const merged = mergeLaunchBriefsFromPrevious(stored.launches, stored.launches);
  const launches = await generateMissingLaunchBriefs(merged);

  const withBrief = launches.filter((l) => l.brief).length;
  await writeOpsCacheEntry(
    OPS_CACHE_KEYS.core,
    { ...stored, launches, fetchedAt: new Date().toISOString() },
    stored.live,
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        total: launches.length,
        withBrief,
        sample: launches
          .filter((l) => l.brief)
          .slice(0, 3)
          .map((l) => ({ mission: l.mission, brief: l.brief?.text })),
      },
      null,
      2,
    ),
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
