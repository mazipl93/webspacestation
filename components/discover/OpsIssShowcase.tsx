import Link from "next/link";
import { ChevronRight, Satellite } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  coords: string;
  altitude: string | null;
  velocity: string | null;
  className?: string;
};

function IssOrbitGraphic() {
  return (
    <svg
      viewBox="0 0 88 88"
      className="ops-iss-showcase__orbit-svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="ops-iss-globe" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(56,189,248,0.35)" />
          <stop offset="100%" stopColor="rgba(8,14,24,0.2)" />
        </radialGradient>
      </defs>
      <circle cx="44" cy="44" r="30" fill="url(#ops-iss-globe)" stroke="rgba(56,189,248,0.22)" strokeWidth="1" />
      <ellipse
        cx="44"
        cy="44"
        rx="38"
        ry="14"
        fill="none"
        stroke="rgba(167,139,250,0.35)"
        strokeWidth="1"
        strokeDasharray="3 5"
        transform="rotate(-18 44 44)"
      />
      <g className="ops-iss-showcase__sat">
        <circle cx="76" cy="30" r="4" fill="#38bdf8" />
        <circle cx="76" cy="30" r="7" fill="rgba(56,189,248,0.25)" />
      </g>
    </svg>
  );
}

export default function OpsIssShowcase({
  coords,
  altitude,
  velocity,
  className,
}: Props) {
  return (
    <Link
      href="/mapa"
      className={cn("ops-iss-showcase group block min-w-0", className)}
    >
      <div className="ops-iss-showcase__inner">
        <IssOrbitGraphic />

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-cyan">
            <Satellite size={13} aria-hidden />
            ISS teraz
          </p>
          <p className="ops-iss-showcase__coords">{coords}</p>
          {(altitude || velocity) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {altitude ? (
                <span className="ops-iss-showcase__chip">{altitude} n.p.m.</span>
              ) : null}
              {velocity ? (
                <span className="ops-iss-showcase__chip">{velocity}</span>
              ) : null}
            </div>
          )}
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent-cyan/90 group-hover:text-accent-cyan">
            Orbita na mapie
            <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
