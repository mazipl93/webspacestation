"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgSrc(spotlight.imageUrl);
    setImgReady(false);
    bodyRef.current?.scrollTo(0, 0);
  }, [pinId, spotlight.imageUrl]);

  return (
    <section
      className="ops-map-pin-detail card-surface relative flex max-h-[min(44dvh,400px)] min-h-0 flex-col overflow-hidden rounded-xl border border-hairline-faint sm:max-h-[min(40dvh,420px)] lg:max-h-[min(36dvh,440px)]"
      aria-label={spotlight.title}
      data-pin-id={pinId}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-colors hover:bg-black/75"
        aria-label="Zamknij opis punktu"
      >
        <X size={16} />
      </button>

      <div className="ops-map-pin-detail__hero relative w-full shrink-0 overflow-hidden bg-[#0f172a]">
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
          className={`ops-map-pin-detail__img block h-full w-full object-cover object-center transition-opacity duration-200 ${
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
        <div className="ops-map-popup__hero-shade pointer-events-none absolute inset-0" aria-hidden />
        <div className="ops-map-popup__hero-text absolute inset-x-0 bottom-0">
          <p className="ops-map-popup__title">{spotlight.title}</p>
          {caption ? <p className="ops-map-popup__caption">{caption}</p> : null}
          <p className="ops-map-popup__credit">{spotlight.imageCredit}</p>
        </div>
      </div>

      <div
        ref={bodyRef}
        className="ops-map-pin-detail__body ops-map-popup__body min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <p className="ops-map-popup__desc">{spotlight.description}</p>
        {spotlight.facts.length > 0 && (
          <div className="ops-map-popup__facts">
            <p className="ops-map-popup__facts-label">Czy wiesz, że?</p>
            <ul className="ops-map-popup__facts-list">
              {spotlight.facts.map((fact, i) => (
                <li key={`${pinId}-fact-${i}`}>{fact}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
