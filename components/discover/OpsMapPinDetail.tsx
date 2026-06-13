"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { resolveSpotlightImageDisplay } from "@/lib/ops/spotlight-image-display";
import type { MapPinSpotlight } from "@/lib/ops/map-pin-spotlight";

const FALLBACK_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/9/9b/Aerial_View_of_Launch_Complex_39.jpg";

type Props = {
  pinId: string;
  spotlight: MapPinSpotlight;
  caption?: string;
  variant?: "panel" | "overlay";
  onClose: () => void;
};

export default function OpsMapPinDetail({
  pinId,
  spotlight,
  caption,
  variant = "panel",
  onClose,
}: Props) {
  const isOverlay = variant === "overlay";
  const [imgSrc, setImgSrc] = useState(spotlight.imageUrl);
  const [imgReady, setImgReady] = useState(false);

  useEffect(() => {
    setImgSrc(spotlight.imageUrl);
    setImgReady(false);
  }, [pinId, spotlight.imageUrl]);

  const imageDisplay = resolveSpotlightImageDisplay(spotlight, imgSrc);

  return (
    <section
      className={cn(
        "ops-map-pin-detail relative overflow-hidden",
        isOverlay
          ? "ops-map-pin-detail--overlay"
          : "card-surface rounded-xl border border-hairline-faint",
      )}
      aria-label={spotlight.title}
      data-pin-id={pinId}
    >
      <button
        type="button"
        onClick={onClose}
        className={cn(
          "absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border text-white shadow-md transition-colors",
          isOverlay
            ? "border-white/25 bg-[#0a1018] hover:bg-[#141c2e]"
            : "border-white/20 bg-black/60 hover:bg-black/80",
        )}
        aria-label="Zamknij"
      >
        <X size={14} />
      </button>

      <div className="ops-map-pin-detail__grid">
        <div className="ops-map-pin-detail__media">
          {!imgReady ? (
            <div
              className="ops-map-pin-detail__img-placeholder animate-pulse"
              aria-hidden
            />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${pinId}-${imgSrc}`}
            src={imgSrc}
            alt=""
            className={cn(
              "ops-map-pin-detail__img transition-opacity duration-150",
              isOverlay &&
                `ops-map-pin-detail__img--${imageDisplay.fit}`,
              imgReady ? "opacity-100" : "opacity-0",
            )}
            style={{ objectPosition: imageDisplay.focus }}
            decoding="async"
            onLoad={() => setImgReady(true)}
            onError={() => {
              if (imgSrc !== FALLBACK_IMAGE) {
                setImgSrc(FALLBACK_IMAGE);
                setImgReady(false);
              }
            }}
          />
        </div>

        <div className="ops-map-pin-detail__copy min-w-0">
          <p className="ops-map-pin-detail__title">{spotlight.title}</p>
          {caption ? (
            <p className="ops-map-pin-detail__caption">{caption}</p>
          ) : null}
          <p className="ops-map-pin-detail__desc">{spotlight.description}</p>
          {spotlight.facts.length > 0 ? (
            <div className="ops-map-pin-detail__facts">
              <p className="ops-map-pin-detail__facts-label">Czy wiesz, że?</p>
              <ul className="ops-map-pin-detail__facts-list">
                {spotlight.facts.map((fact, i) => (
                  <li key={`${pinId}-fact-${i}`}>{fact}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
