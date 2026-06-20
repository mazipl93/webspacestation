"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn } from "lucide-react";
import { normalizeCoverImageUrl } from "@/lib/media/cover-url";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  caption?: string;
  className?: string;
};

/** Inline figure — tap/click opens a fullscreen lightbox. */
export default function ArticleFigure({ src, caption, className }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const url = normalizeCoverImageUrl(src) ?? src;
  const label = caption?.trim();
  const alt = label || "Ilustracja w treści artykułu";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const lightbox =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[70] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={alt}
          >
            <button
              type="button"
              aria-label="Zamknij powiększone zdjęcie"
              className="absolute inset-0 bg-black/88 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center p-4 pb-6 pt-14 sm:p-8 sm:pt-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={alt}
                className="pointer-events-auto max-h-[min(82vh,1200px)] w-auto max-w-[min(96vw,1200px)] object-contain shadow-2xl"
              />
              {label ? (
                <p className="pointer-events-auto mt-4 max-w-[min(96vw,48rem)] text-center text-[12px] leading-relaxed text-text-secondary sm:text-[13px]">
                  {label}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Zamknij"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-text-secondary transition-colors hover:bg-black/75 hover:text-text-primary sm:right-6 sm:top-6"
            >
              <X size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <figure className={cn("my-8 min-w-0", className)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block w-full overflow-hidden rounded-lg border border-hairline bg-[#090d13] text-left transition-colors duration-200 hover:border-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan"
          aria-label={label ? `Powiększ: ${label}` : "Powiększ ilustrację"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt}
            className="block h-auto max-h-[min(85vh,920px)] w-full cursor-zoom-in object-contain"
            loading="lazy"
            decoding="async"
          />
          <span
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white/90 opacity-80 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
            aria-hidden
          >
            <ZoomIn size={15} strokeWidth={2} />
          </span>
        </button>
        {label ? (
          <figcaption className="mt-2 text-left text-[11px] leading-relaxed text-text-muted">
            {label}
          </figcaption>
        ) : null}
      </figure>
      {lightbox}
    </>
  );
}
