"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getEarthSolarWindPoint,
  getKpLabel,
  getKpLiveReading,
  type KpLiveReading,
} from "@/lib/aurora/api";
import type { AuroraHomepageSnapshot } from "@/lib/aurora/homepage-snapshot";
import {
  fetchAuroraTerminalCore,
  getAuroraTerminalCoreCache,
  setAuroraTerminalCoreCache,
  snapshotToTerminalCore,
  subscribeAuroraTerminalCore,
  type AuroraTerminalCore,
} from "@/lib/aurora/terminal-core";

const POLL_MS = 60_000;

function initialCoreFromProps(
  initialSnapshot: AuroraHomepageSnapshot | null | undefined,
): AuroraTerminalCore | null {
  const cached = getAuroraTerminalCoreCache();
  if (cached) return cached;
  if (
    initialSnapshot &&
    (initialSnapshot.kp1m.length > 0 ||
      initialSnapshot.kp3Day.length > 0 ||
      initialSnapshot.solarWind.length > 0)
  ) {
    return snapshotToTerminalCore(initialSnapshot);
  }
  return null;
}

export function useAuroraTerminalCore(initialSnapshot?: AuroraHomepageSnapshot | null) {
  const [core, setCore] = useState<AuroraTerminalCore | null>(() =>
    initialCoreFromProps(initialSnapshot),
  );

  const applyCore = useCallback((next: AuroraTerminalCore) => {
    setAuroraTerminalCoreCache(next);
    setCore(next);
  }, []);

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const next = await fetchAuroraTerminalCore(signal);
      if (signal?.aborted) return;
      applyCore(next);
    },
    [applyCore],
  );

  useEffect(() => {
    const cached = getAuroraTerminalCoreCache();
    if (cached) setCore(cached);

    const unsubscribe = subscribeAuroraTerminalCore(() => {
      const latest = getAuroraTerminalCoreCache();
      if (latest) setCore(latest);
    });

    const controller = new AbortController();
    void refresh(controller.signal);

    const interval = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    return () => {
      unsubscribe();
      controller.abort();
      window.clearInterval(interval);
    };
  }, [refresh]);

  const reading = useMemo<KpLiveReading | null>(() => {
    if (!core) return null;
    return getKpLiveReading(core.kp1m, core.kp3Day);
  }, [core]);

  const kp = reading?.current ?? null;

  const bzAtEarth = useMemo(() => {
    if (!core) return null;
    return getEarthSolarWindPoint(core.solarWind)?.bz ?? null;
  }, [core]);

  const label = kp != null ? getKpLabel(kp) : null;
  const stormy = kp != null && kp >= 5;

  return {
    core,
    reading,
    kp,
    label,
    stormy,
    bzAtEarth,
    refresh,
  };
}
