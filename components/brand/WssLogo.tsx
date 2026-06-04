import Link from "next/link";
import { cn } from "@/lib/cn";
import WssLogoWordmark from "@/components/brand/WssLogoWordmark";

type WssLogoProps = {
  className?: string;
  asLink?: boolean;
  /** Wysokość wordmarku (px). */
  height?: number;
};

export default function WssLogo({ className, asLink = false, height = 52 }: WssLogoProps) {
  const inner = <WssLogoWordmark height={height} />;
  const classes = cn("group flex min-w-0 items-center", className);

  if (asLink) {
    return (
      <Link href="/" className={classes} aria-label="Web Space Station — strona główna">
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}
