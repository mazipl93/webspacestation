import type { OpsMapPin } from "@/lib/ops/types";

type Props = {
  pins: OpsMapPin[];
  issCoords?: string;
  height?: number;
};

export default function OpsMissionMap({ pins, issCoords, height = 320 }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-hairline-faint"
      style={{
        height,
        background:
          "radial-gradient(ellipse at 92% 50%, rgba(255,165,35,0.16) 0%, transparent 36%), #060a12",
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: 18,
          height: 18,
          left: "30%",
          top: "52%",
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(circle at 35% 32%, #4fc0ff, #0055a8)",
          boxShadow: "0 0 12px rgba(56,189,248,0.6)",
        }}
        aria-hidden
      />
      {pins.map((pin) => (
        <div
          key={pin.id}
          className="absolute flex flex-col items-center"
          style={{ left: pin.left, top: pin.top }}
        >
          <div
            className={
              pin.kind === "iss"
                ? "h-2.5 w-2.5 animate-pulse rounded-full"
                : "h-2 w-2 rounded-full"
            }
            style={{
              background: pin.color,
              boxShadow: `0 0 8px ${pin.color}aa`,
            }}
          />
          <span
            className="mt-1 whitespace-nowrap text-[10px] font-bold leading-none text-text-primary"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95)" }}
          >
            {pin.label}
          </span>
          <span
            className="mt-0.5 flex max-w-[120px] items-center gap-1 truncate text-[8px] leading-none text-text-tertiary"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95)" }}
          >
            <span
              className="h-1 w-1 shrink-0 rounded-full"
              style={{ background: pin.color }}
            />
            {pin.sublabel}
          </span>
        </div>
      ))}
      {issCoords && (
        <p className="absolute bottom-3 left-3 text-[10px] text-text-muted">
          ISS: {issCoords}
        </p>
      )}
    </div>
  );
}
