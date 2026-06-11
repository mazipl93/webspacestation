"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { OpsLaunchPhase } from "@/lib/ops/types";

type CountdownParts = {
  prefix?: string;
  h: string;
  m: string;
  s: string;
  past: boolean;
};

const PLACEHOLDER: CountdownParts = {
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
    prefix: days > 0 ? `${days} ${days === 1 ? "dzień" : "dni"}` : undefined,
    h: String(hours).padStart(2, "0"),
    m: String(minutes).padStart(2, "0"),
    s: String(seconds).padStart(2, "0"),
    past: false,
  };
}

type Props = {
  net: string;
  phase?: OpsLaunchPhase;
  imminent?: boolean;
  className?: string;
};

function PhaseMessage({
  phase,
  className,
}: {
  phase: OpsLaunchPhase;
  className?: string;
}) {
  const copy: Record<string, string> = {
    window: "Okno startowe otwarte",
    live: "Start w toku",
    hold: "Start wstrzymany",
    success: "Start udany",
    failure: "Start nieudany",
    unknown: "Aktualizujemy status…",
  };

  return (
    <p
      className={cn(
        "text-[13px] font-bold leading-snug",
        phase === "live" || phase === "window"
          ? "text-accent-cyan live-breathe"
          : "text-white/80",
        className,
      )}
    >
      {copy[phase] ?? copy.unknown}
    </p>
  );
}

export default function OpsCountdownHero({
  net,
  phase = "countdown",
  imminent,
  className,
}: Props) {
  const [parts, setParts] = useState(PLACEHOLDER);

  useEffect(() => {
    if (phase !== "countdown" && phase !== "hold") return;
    const tick = () => setParts(computeCountdown(net));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [net, phase]);

  if (phase === "window" || phase === "live" || phase === "success" || phase === "failure") {
    return <PhaseMessage phase={phase} className={className} />;
  }

  if (phase === "unknown") {
    return <PhaseMessage phase="unknown" className={className} />;
  }

  if (parts.past && phase === "countdown") {
    return <PhaseMessage phase="window" className={className} />;
  }

  return (
    <div
      className={cn(
        "ops-countdown-hero",
        imminent && "ops-countdown-hero--imminent",
        phase === "hold" && "ops-countdown-hero--hold",
        className,
      )}
      aria-live="polite"
    >
      {parts.prefix ? (
        <p className="ops-countdown-hero__days">{parts.prefix}</p>
      ) : null}
      <div className="ops-countdown-hero__blocks">
        {(
          [
            ["h", "godz"],
            ["m", "min"],
            ["s", "sek"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="ops-countdown-hero__cell">
            <span className="ops-countdown-hero__value">{parts[key]}</span>
            <span className="ops-countdown-hero__label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
