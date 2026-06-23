"use client";

import { useEffect, useRef } from "react";
import { adminApi } from "@/lib/admin/api";

/** 2 min — wystarczy dla Vercel Hobby. Redukcja 4× vs poprzedniego 30 s. */
const INTERVAL_MS = 120_000;

export default function ScheduledPublishPoller() {
  const running = useRef(false);
  const intervalRef = useRef<number | null>(null);

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

    const start = () => {
      if (intervalRef.current !== null) return;
      void tick();
      intervalRef.current = window.setInterval(() => void tick(), INTERVAL_MS);
    };

    const stop = () => {
      if (intervalRef.current === null) return;
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") {
      start();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, []);

  return null;
}
