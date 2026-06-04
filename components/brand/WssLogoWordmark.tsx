import Image from "next/image";
import { cn } from "@/lib/cn";

/** Szerokość przy danej wysokości (aspect ~3.78 z exportu). */
const WORDMARK_ASPECT = 3.78;

type Props = {
  /** Wysokość wordmarku w px (nav domyślnie większy). */
  height?: number;
  className?: string;
};

/** Oficjalny wordmark WSS (WSS + łuk + Web Space Station) — PNG bez tła. */
export default function WssLogoWordmark({ height = 52, className }: Props) {
  const width = Math.round(height * WORDMARK_ASPECT);

  return (
    <div
      className={cn(
        "relative shrink-0 transition-transform duration-500 group-hover:scale-[1.02]",
        "drop-shadow-[0_4px_24px_rgba(56,189,248,0.22)]",
        className
      )}
    >
      <Image
        src="/brand/wss-wordmark.png"
        alt=""
        width={width}
        height={height}
        className="h-auto max-w-[min(240px,48vw)] w-auto object-contain object-left"
        style={{ height, width: "auto", maxHeight: height }}
        priority
        unoptimized
      />
    </div>
  );
}
