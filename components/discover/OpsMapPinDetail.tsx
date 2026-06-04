"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { MapPinSpotlight } from "@/lib/ops/map-pin-spotlight";

const FALLBACK_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/9/9b/Aerial_View_of_Launch_Complex_39.jpg";

type Props = {
  spotlight: MapPinSpotlight;
  caption?: string;
  onClose: () => void;
};

export default function OpsMapPinDetail({ spotlight, caption, onClose }: Props) {
  const [imgSrc, setImgSrc] = useState(spotlight.imageUrl);

  return (
    <section
      className="ops-map-pin-detail card-surface relative overflow-hidden rounded-xl border border-hairline-faint"
      aria-label={spotlight.title}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-colors hover:bg-black/75"
        aria-label="Zamknij opis punktu"
      >
        <X size={16} />
      </button>

      <article className="ops-map-popup">
        <div className="ops-map-popup__hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt=""
            className="ops-map-popup__img"
            loading="lazy"
            decoding="async"
            onError={() => {
              if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
            }}
          />
          <div className="ops-map-popup__hero-shade" aria-hidden />
          <div className="ops-map-popup__hero-text">
            <p className="ops-map-popup__title">{spotlight.title}</p>
            {caption ? <p className="ops-map-popup__caption">{caption}</p> : null}
            <p className="ops-map-popup__credit">{spotlight.imageCredit}</p>
          </div>
        </div>

        <div className="ops-map-popup__body">
          <p className="ops-map-popup__desc">{spotlight.description}</p>
          {spotlight.facts.length > 0 && (
            <div className="ops-map-popup__facts">
              <p className="ops-map-popup__facts-label">Czy wiesz, że?</p>
              <ul className="ops-map-popup__facts-list">
                {spotlight.facts.map((fact, i) => (
                  <li key={i}>{fact}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
