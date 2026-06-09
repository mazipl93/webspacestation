import { resolveVideoEmbedUrl } from "@/lib/articles/content-video";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  caption?: string;
  className?: string;
};

/** YouTube / Vimeo embed in article body (`::video` in CMS). */
export default function ArticleVideoEmbed({ src, caption, className }: Props) {
  const embedUrl = resolveVideoEmbedUrl(src);
  const label = caption?.trim();

  if (!embedUrl) {
    return (
      <figure className={cn("my-8 min-w-0", className)}>
        <p className="text-[13px] text-text-muted">
          Nieobsługiwany adres wideo.{" "}
          <a
            href={src}
            className="text-accent-cyan underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Otwórz link
          </a>
        </p>
      </figure>
    );
  }

  return (
    <figure className={cn("my-8 min-w-0", className)}>
      <div className="overflow-hidden rounded-lg border border-hairline bg-[#090d13]">
        <div className="relative aspect-video w-full">
          <iframe
            src={embedUrl}
            title={label || "Wideo w treści artykułu"}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
      {label ? (
        <figcaption className="mt-2 text-left text-[11px] leading-relaxed text-text-muted">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}
