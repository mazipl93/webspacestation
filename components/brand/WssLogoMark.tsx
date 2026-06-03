import { cn } from "@/lib/cn";

type WssLogoMarkProps = {
  size?: number;
  className?: string;
};

/**
 * Znak WSS — stylizowane okno stacji (cupola): horyzont, gwiazdy, pierścień orbitalny.
 * Wektor ręczny, bez stockowych zdjęć i clipartu.
 */
export default function WssLogoMark({ size = 40, className }: WssLogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wss-badge-bg" x1="24" y1="3" x2="24" y2="45">
          <stop stopColor="#151c2c" />
          <stop stopColor="#090c14" />
        </linearGradient>
        <linearGradient id="wss-badge-edge" x1="6" y1="6" x2="42" y2="42">
          <stop stopColor="#7dd3fc" stopOpacity="0.65" />
          <stop stopColor="#3b82f6" stopOpacity="0.9" />
          <stop stopColor="#6366f1" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="wss-limb" x1="24" y1="20" x2="24" y2="42">
          <stop stopColor="#1d4ed8" stopOpacity="0.15" />
          <stop stopColor="#155e75" />
          <stop stopColor="#1e3a5f" />
          <stop stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="wss-atmo" cx="24" cy="28" r="12">
          <stop stopColor="#38bdf8" stopOpacity="0.45" />
          <stop stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <clipPath id="wss-viewport">
          <circle cx="24" cy="24" r="14.25" />
        </clipPath>
      </defs>

      <rect x="2.5" y="2.5" width="43" height="43" rx="11.5" fill="url(#wss-badge-bg)" />
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="11.5"
        stroke="url(#wss-badge-edge)"
        strokeWidth="1"
      />

      <circle
        cx="24"
        cy="24"
        r="15.5"
        stroke="url(#wss-badge-edge)"
        strokeWidth="0.65"
        strokeOpacity="0.35"
      />

      <g clipPath="url(#wss-viewport)">
        <rect x="8" y="8" width="32" height="32" fill="#060910" />
        <ellipse cx="24" cy="31" rx="17" ry="11" fill="url(#wss-atmo)" />
        <path d="M 7 28.5 Q 24 17 41 28.5 V 44 H 7 Z" fill="url(#wss-limb)" />
        <path
          d="M 9.5 28.8 Q 24 19.5 38.5 28.8"
          stroke="#93c5fd"
          strokeWidth="0.75"
          strokeOpacity="0.7"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      <circle cx="16.5" cy="16.5" r="1.15" fill="#f1f5f9" fillOpacity="0.9" />
      <circle cx="24" cy="12.5" r="1.55" fill="#bae6fd" />
      <circle cx="31" cy="15.5" r="0.95" fill="#e2e8f0" fillOpacity="0.75" />
      <circle cx="20.5" cy="20.5" r="0.6" fill="#94a3b8" fillOpacity="0.55" />

      <path
        d="M 10.5 21.5 A 13.5 13.5 0 0 1 37.5 21.5"
        stroke="#2f6dff"
        strokeWidth="0.7"
        strokeOpacity="0.4"
        fill="none"
        strokeLinecap="round"
      />

      <circle cx="36" cy="11" r="2" fill="#38bdf8" fillOpacity="0.18" />
      <circle cx="36" cy="11" r="0.85" fill="#38bdf8" />
    </svg>
  );
}
