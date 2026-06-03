import Link from "next/link";
import { cn } from "@/lib/cn";
import WssLogoMark from "@/components/brand/WssLogoMark";

type WssLogoProps = {
  className?: string;
  showFullName?: boolean;
  showTagline?: boolean;
  asLink?: boolean;
  size?: "sm" | "md";
};

export default function WssLogo({
  className,
  showFullName = true,
  showTagline = true,
  asLink = false,
  size = "md",
}: WssLogoProps) {
  const markPx = size === "sm" ? 36 : 40;

  const inner = (
    <>
      <div
        className={cn(
          "relative shrink-0 transition-transform duration-500 group-hover:scale-[1.04]",
          "drop-shadow-[0_4px_16px_rgba(47,109,255,0.28)]"
        )}
      >
        <WssLogoMark size={markPx} />
      </div>

      <div className="min-w-0 leading-none">
        <span className="flex min-w-0 items-baseline gap-2">
          <span
            className={cn(
              "text-gradient font-extrabold uppercase tracking-[0.11em]",
              size === "md" ? "text-[15px] sm:text-[14px]" : "text-[14px]"
            )}
          >
            WSS
          </span>
          {showFullName && (
            <>
              <span className="hidden h-3 w-px bg-white/15 xl:inline" aria-hidden />
              <span className="hidden truncate font-medium tracking-[0.02em] text-text-secondary xl:inline xl:text-[11px]">
                Web Space Station
              </span>
            </>
          )}
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 block font-medium tracking-[0.04em] text-text-tertiary",
              size === "md" ? "text-[10px] sm:text-[9.5px]" : "text-[9.5px]"
            )}
          >
            Wiadomości kosmiczne
          </span>
        )}
      </div>
    </>
  );

  const classes = cn("group flex min-w-0 items-center gap-2.5", className);

  if (asLink) {
    return (
      <Link href="/" className={classes} aria-label="Web Space Station — strona główna">
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}
