import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  height?: number;
  className?: string;
};

const LOGO_SRC = "/brand/wss-logo.png";
/** Logo ISS + WEB SPACE STATION (808×460, transparent PNG). */
const LOGO_ASPECT = 808 / 460;

export default function WssLogoWordmark({ height = 52, className }: Props) {
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <Image
      src={LOGO_SRC}
      alt=""
      width={width}
      height={height}
      unoptimized
      className={cn("block shrink-0 bg-transparent object-contain object-left", className)}
      style={{ height: `${height}px`, width: `${width}px` }}
      priority
      aria-hidden
    />
  );
}
