import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  scrim: string;
  glow: string;
  sizes?: string;
  imagePosition?: string;
  className?: string;
  children: React.ReactNode;
};

export default function OpsShowcaseBackdrop({
  src,
  scrim,
  glow,
  sizes = "(max-width: 1024px) 100vw, 300px",
  imagePosition = "center",
  className,
  children,
}: Props) {
  return (
    <div className={cn("ops-showcase-backdrop", className)}>
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        sizes={sizes}
        className="ops-showcase-backdrop__image object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
        style={{ objectPosition: imagePosition }}
      />
      <div
        className="ops-showcase-backdrop__scrim"
        style={{ background: scrim }}
        aria-hidden
      />
      <div
        className="ops-showcase-backdrop__glow"
        style={{ background: glow }}
        aria-hidden
      />
      <div className="ops-showcase-backdrop__content">{children}</div>
    </div>
  );
}
