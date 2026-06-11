/** Dekoracyjne tło „szukamy sygnału” — tylko wizual, aria-hidden. */
export default function OpsLaunchPausedBackdrop() {
  return (
    <div className="ops-launch-paused__backdrop" aria-hidden>
      <div className="ops-launch-paused__radar">
        <span className="ops-launch-paused__ping" />
        <span className="ops-launch-paused__ping ops-launch-paused__ping--2" />
        <span className="ops-launch-paused__ping ops-launch-paused__ping--3" />
      </div>

      <svg
        className="ops-launch-paused__dish"
        viewBox="0 0 120 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="60"
          cy="72"
          rx="28"
          ry="5"
          fill="rgba(56,189,248,0.12)"
        />
        <path
          d="M60 68V52"
          stroke="rgba(148,163,184,0.45)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M44 52H76"
          stroke="rgba(148,163,184,0.35)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M28 48C28 28 42 14 60 14C78 14 92 28 92 48"
          stroke="rgba(56,189,248,0.35)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="ops-launch-paused__dish-beam"
          d="M60 48L96 8"
          stroke="rgba(255,69,58,0.55)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 6"
        />
        <circle cx="60" cy="48" r="4" fill="rgba(56,189,248,0.85)" />
        <text
          x="98"
          y="12"
          fill="rgba(255,255,255,0.35)"
          fontSize="11"
          fontWeight="700"
          fontFamily="system-ui,sans-serif"
        >
          ???
        </text>
      </svg>

      <div className="ops-launch-paused__bars">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="ops-launch-paused__bar"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <div className="ops-launch-paused__static" />
    </div>
  );
}
