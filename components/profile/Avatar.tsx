import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  /** Rounded-2xl (square-ish) instead of a full circle — used in the header. */
  squared?: boolean;
};

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "U";
}

// Presentational avatar: renders the uploaded profile picture when available,
// otherwise a gradient monogram. Shared across the navbar, account menu and
// profile so the look stays consistent.
export default function Avatar({
  name,
  src,
  size = 32,
  className,
  squared = false,
}: Props) {
  const radius = squared ? "rounded-2xl" : "rounded-full";
  const fontSize = Math.max(11, Math.round(size * 0.42));

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden font-bold text-white",
        radius,
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize,
        background: "linear-gradient(135deg, #2f6dff 0%, #1a4fd0 100%)",
      }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      ) : (
        initial(name)
      )}
    </span>
  );
}
