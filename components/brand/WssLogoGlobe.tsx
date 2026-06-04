import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  className?: string;
};

/**
 * Ziemia z logo WSS — okrągły kadr maskuje ucięty brzeg w oryginale (góra-prawo).
 */
export default function WssLogoGlobe({ size = 48, className }: Props) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/wss-globe.png"
        alt=""
        width={size}
        height={size}
        className="max-w-none object-cover"
        style={{
          width: `${Math.round(size * 1.18)}px`,
          height: `${Math.round(size * 1.18)}px`,
          objectPosition: "42% 48%",
        }}
        priority
        unoptimized
      />
    </span>
  );
}
