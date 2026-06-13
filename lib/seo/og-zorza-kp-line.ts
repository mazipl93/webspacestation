import { getHomepageAuroraSnapshot } from "@/lib/aurora/homepage-snapshot";

function formatKpPl(kp: number): string {
  return kp.toLocaleString("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Jedna linia na kartę OG: najpierw sens dla człowieka, potem Kp. */
function buildHumanKpLine(kp: number): string {
  const kpStr = formatKpPl(kp);

  if (kp >= 7) {
    return `Zorza możliwa w całej Polsce · indeks Kp ${kpStr}`;
  }
  if (kp >= 5) {
    return `Szansa na zorzę w północnej i centralnej Polsce · Kp ${kpStr}`;
  }
  if (kp >= 4) {
    return `Zorza możliwa na północy kraju · indeks Kp ${kpStr}`;
  }
  if (kp >= 3) {
    return `W Polsce raczej bez zorzy · indeks Kp ${kpStr}`;
  }
  return `Dziś w Polsce bez zorzy · indeks Kp ${kpStr}`;
}

/** Krótka linia na kartę OG /zorza (reuse snapshot terminala). */
export async function getOgZorzaKpSubtitle(): Promise<string | null> {
  const snapshot = await getHomepageAuroraSnapshot();
  if (!snapshot) return null;

  return buildHumanKpLine(snapshot.kp);
}
