"use client";

import { useEffect, useState } from "react";
import type { IssPolandPass } from "@/lib/ops/iss-poland-passes.types";

const PASSES_URL = "/api/ops/iss-passes";
const INTERVAL_MS = 120_000;

type Payload = {
  passes: IssPolandPass[];
  computedAt: string;
};

type Options = {
  limit?: number;
};

export function useIssPolandPasses({ limit = 4 }: Options = {}) {
  const [passes, setPasses] = useState<IssPolandPass[]>([]);
  const [computedAt, setComputedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  return { passes, computedAt, loading };
}
