import { normalizeCoverImageUrl } from "@/lib/media/cover-url";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  caption?: string;
  className?: string;
};

/** Inline figure — caption flush under the image inside one frame. */
export default function ArticleFigure({ src, caption, className }: Props) {
  const url = normalizeCoverImageUrl(src) ?? src;
  const label = caption?.trim();

  return (
    <figure className={cn("my-8 min-w-0", className)}>
      <div className="overflow-hidden rounded-lg border border-hairline bg-[#090d13]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label || "Ilustracja w treści artykułu"}
          className="block h-auto max-h-[min(85vh,920px)] w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
      {label ? (
        <figcaption className="mt-2 text-left text-[11px] leading-relaxed text-text-muted">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}
