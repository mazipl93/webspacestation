import Image from "next/image";
import { cn } from "@/lib/cn";

/** Natural aspect of trimmed wordmark PNG (≈400×96 source). */
const WORDMARK_ASPECT = 400 / 96;

type Props = {
  /** Wysokość wordmarku w px (nav domyślnie 52, stopka 48). */
  height?: number;
  className?: string;
};

function wordmarkSrc(height: number): string {
  if (height >= 80) return "/brand/wss-wordmark@88h.png";
  if (height >= 48) return "/brand/wss-wordmark@52h.png";
  return "/brand/wss-wordmark.png";
}

/**
 * Oficjalny wordmark WSS (PNG) — WSS + łuk + WEB SPACE STATION.
 * Wektor SVG odrzucony; UI opiera się na assetach z `public/brand/`.
 */
export default function WssLogoWordmark({ height = 52, className }: Props) {
  const width = Math.round(height * WORDMARK_ASPECT);

  return (
    <Image
      src={wordmarkSrc(height)}
      alt=""
      width={width}
      height={height}
      className={cn(
        "h-auto w-auto max-w-[min(260px,52vw)] shrink-0 transition-transform duration-500 group-hover:scale-[1.02]",
        className
      )}
      style={{ height, width: "auto" }}
      priority
      unoptimized
    />
  );
}
