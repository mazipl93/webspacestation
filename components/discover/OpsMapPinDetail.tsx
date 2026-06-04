"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { MapPinSpotlight } from "@/lib/ops/map-pin-spotlight";

const FALLBACK_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/9/9b/Aerial_View_of_Launch_Complex_39.jpg";

type Props = {
  pinId: string;
  spotlight: MapPinSpotlight;
  caption?: string;
  onClose: () => void;
};

export default function OpsMapPinDetail({
  pinId,
  spotlight,
  caption,
  onClose,
}: Props) {
  const [imgSrc, setImgSrc] = useState(spotlight.imageUrl);
  const [imgReady, setImgReady] = useState(false);

  useEffect(() => {
    setImgSrc(spotlight.imageUrl);
    setImgReady(false);
  }, [pinId, spotlight.imageUrl]);

  return (
    <section
      className="ops-map-pin-detail card-surface relative overflow-hidden rounded-xl border border-hairline-faint"
      aria-label={spotlight.title}
      data-pin-id={pinId}
    >
      <div className="ops-map-pin-detail__grid">
        <div className="ops-map-pin-detail__media relative shrink-0 overflow-hidden bg-[#0f172a]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white hover:bg-black/75"
            aria-label="Zamknij"
          >
            <X size={14} />
          </button>
          {!imgReady ? (
            <div
              className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-800 to-slate-900"
              aria-hidden
            />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${pinId}-${imgSrc}`}
            src={imgSrc}
            alt=""
            className={`ops-map-pin-detail__img transition-opacity duration-150 ${
              imgReady ? "opacity-100" : "opacity-0"
            }`}
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
