"use client";

import { useEffect, useRef } from "react";
import { adminApi } from "@/lib/admin/api";

/** Co 30 s publikuje przeterminowane SCHEDULED — Vercel Hobby nie ma crona co minutę. */
const INTERVAL_MS = 30_000;

export default function ScheduledPublishPoller() {
  const running = useRef(false);

  useEffect(() => {
    const tick = async () => {
      if (running.current) return;
      running.current = true;
      try {
        const result = await adminApi.publishDueScheduled();
        if (result.published > 0) {
          window.dispatchEvent(new CustomEvent("wss:scheduled-published"));
        }
      } catch {
        // CMS działa dalej przy chwilowym błędzie API
      } finally {
        running.current = false;
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
