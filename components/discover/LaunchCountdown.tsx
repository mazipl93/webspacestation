"use client";

import { useEffect, useState } from "react";

type CountdownParts = {
  prefix?: string;
  h: string;
  m: string;
  s: string;
  past: boolean;
};

/** Ten sam na SSR i pierwszym renderze klienta — bez mismatch hydratacji. */
const HYDRATE_PLACEHOLDER: CountdownParts = {
  h: "--",
  m: "--",
  s: "--",
  past: false,
};

function computeCountdown(netIso: string): CountdownParts {
  const target = Date.parse(netIso);
  if (Number.isNaN(target)) {
    return { h: "--", m: "--", s: "--", past: true };
  }

  const now = Date.now();
  let diff = target - now;

  if (diff <= 0) {
    return { h: "00", m: "00", s: "00", past: true };
  }

  const days = Math.floor(diff / 86400000);
  diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000);
  diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000);
  diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);

  return {
    prefix: days > 0 ? `${days} dni` : undefined,
    h: String(hours).padStart(2, "0"),
    m: String(minutes).padStart(2, "0"),
    s: String(seconds).padStart(2, "0"),
    past: false,
  };
}

import type { OpsLaunchPhase } from "@/lib/ops/types";

type Props = {
  net: string;
  featured?: boolean;
  phase?: OpsLaunchPhase;
};

export default function LaunchCountdown({ net, featured, phase = "countdown" }: Props) {
  const [parts, setParts] = useState(HYDRATE_PLACEHOLDER);

  useEffect(() => {
    const tick = () => setParts(computeCountdown(net));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [net]);

  if (phase === "window") {
    return (
      <p className={`font-bold text-accent-cyan live-breathe ${featured ? "text-[14px]" : "text-[12px]"}`}>
        Okno startowe otwarte
      </p>
    );
  }
  if (phase === "live") {
    return (
      <p className={`font-bold text-accent-cyan live-breathe ${featured ? "text-[14px]" : "text-[12px]"}`}>
        Start w toku
      </p>
    );
  }
  if (phase === "success" || phase === "failure") {
    return (
      <p className={`font-bold text-text-secondary ${featured ? "text-[14px]" : "text-[12px]"}`}>
        {phase === "success" ? "Start udany" : "Start nieudany"}
      </p>
    );
  }

  if (parts.past) {
    return (
      <p
        className={`font-bold text-text-tertiary ${featured ? "text-[14px]" : "text-[12px]"}`}
      >
        {phase === "hold" ? "Wstrzymany · sprawdź NET" : "Okno startowe · sprawdź status"}
      </p>
    );
  }

  return (
    <p
      className={`tabular-nums font-bold leading-none text-text-primary ${featured ? "text-[18px] sm:text-[20px]" : "text-[13px]"}`}
    >
      {parts.prefix ? (
        <>
          <span
            className={`font-semibold text-text-secondary ${featured ? "text-[14px]" : "text-[12px]"}`}
          >
            {parts.prefix}
          </span>
          <span className="mx-1.5 text-text-muted">·</span>
        </>
      ) : null}
      {parts.h}:{parts.m}:{parts.s}
    </p>
  );
}
