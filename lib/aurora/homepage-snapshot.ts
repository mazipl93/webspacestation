import { unstable_cache } from "next/cache";
import type { KpData, SolarWindData } from "@/lib/aurora/api";
import {
  getDisplayKp,
  getEarthSolarWindPoint,
  getKpLabel,
} from "@/lib/aurora/api";
import {
  fetchTerminalKp1m,
  fetchTerminalKp3Day,
  fetchTerminalSolarWind,
} from "@/lib/aurora/rtsw";

export type AuroraHomepageSnapshot = {
  kp: number;
  label: string;
  stormy: boolean;
  bzAtEarth: number | null;
  kp1m: KpData[];
  kp3Day: KpData[];
  solarWind: SolarWindData[];
  updatedAt: string;
};

async function loadAuroraSnapshot(): Promise<AuroraHomepageSnapshot | null> {
  try {
    const [kp1m, kp3Day, solarWind] = await Promise.all([
      fetchTerminalKp1m(),
      fetchTerminalKp3Day(),
      fetchTerminalSolarWind(),
    ]);

    if (kp1m.length === 0 && kp3Day.length === 0 && solarWind.length === 0) {
      return null;
    }

    const kp = getDisplayKp(kp1m, kp3Day);
    const earth = getEarthSolarWindPoint(solarWind);

    return {
      kp,
      label: getKpLabel(kp),
      stormy: kp >= 5,
      bzAtEarth: earth?.bz ?? null,
      kp1m,
      kp3Day,
      solarWind,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[aurora] homepage snapshot failed", error);
    return null;
  }
}

export async function getHomepageAuroraSnapshot(): Promise<AuroraHomepageSnapshot | null> {
  if (process.env.NODE_ENV === "development") {
    return loadAuroraSnapshot();
  }
  return unstable_cache(loadAuroraSnapshot, ["aurora-homepage-v2"], {
    revalidate: 60,
  })();
}
