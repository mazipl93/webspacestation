"use client";

import { useEffect, useState } from "react";
import type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";

const PASSES_URL = "/api/ops/iss-passes";
const INTERVAL_MS = 60_000;

type Payload = {
  passes: IssPolandPass[];
  computedAt: string;
  tleAt?: string | null;
};

type Options = {
  limit?: number;
  initialPasses?: IssPolandPass[];
  initialComputedAt?: string | null;
};

export function useIssPolandPasses({
  limit = 4,
  initialPasses = [],
  initialComputedAt = null,
}: Options = {}) {
  const [passes, setPasses] = useState<IssPolandPass[]>(initialPasses);
  const [computedAt, setComputedAt] = useState<string | null>(initialComputedAt);
  const [tleAt, setTleAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(initialPasses.length === 0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch(`${PASSES_URL}?limit=${limit}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Payload;
        if (cancelled) return;
        setPasses(data.passes ?? []);
        setComputedAt(data.computedAt ?? null);
        setTleAt(data.tleAt ?? null);
      } catch {
        // zostaje ostatnia lista
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, INTERVAL_MS);
    const onVis = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [limit]);

  return { passes, computedAt, tleAt, loading };
}
