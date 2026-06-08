import { config } from "dotenv";
config();

import { prisma } from "../lib/prisma";

async function main() {
  const rows = await prisma.opsCacheEntry.findMany({
    select: { key: true, live: true, fetchedAt: true },
    orderBy: { key: "asc" },
  });
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
