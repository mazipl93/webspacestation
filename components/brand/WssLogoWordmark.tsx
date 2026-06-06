import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  height?: number;
  className?: string;
};

const LOGO_SRC = "/brand/wss-logo.png";
/** Intrinsic asset ratio (1120×405, transparent PNG). */
const LOGO_ASPECT = 1120 / 405;

export default function WssLogoWordmark({ height = 52, className }: Props) {
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <Image
      src={LOGO_SRC}
      alt=""
      width={width}
      height={height}
      className={cn("block max-w-full bg-transparent object-contain object-left", className)}
      style={{ height: `${height}px`, width: `${width}px` }}
      priority
      aria-hidden
    />
  );
}
