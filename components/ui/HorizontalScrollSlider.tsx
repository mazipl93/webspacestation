"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
  /** Klasy na wewnętrznym tracku (gap, padding). */
  trackClassName?: string;
  ariaLabel?: string;
  /** Ułamek szerokości widocznej na jedno kliknięcie strzałki. */
  stepRatio?: number;
};

export default function HorizontalScrollSlider({
  children,
  className,
  trackClassName,
  ariaLabel = "Przewijana lista",
  stepRatio = 0.88,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanPrev(el.scrollLeft > 6);
    setCanNext(el.scrollLeft < max - 6);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  const scrollByStep = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * stepRatio, behavior: "smooth" });
  };

  /** Kółko myszy przewija w poziomie; klik w kartę (link) działa normalnie. */
  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;

    const delta =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta === 0) return;

    e.preventDefault();
    el.scrollLeft += delta;
  };

  const arrowClass =
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-space-card/95 text-text-primary shadow-lg backdrop-blur-sm transition-all hover:border-accent-cyan/40 hover:text-accent-cyan disabled:pointer-events-none disabled:opacity-0 sm:flex";

  return (
    <div className={cn("relative sm:px-11 lg:px-12", className)}>
      <button
        type="button"
        aria-label="Przewiń w lewo"
        disabled={!canPrev}
        onClick={() => scrollByStep(-1)}
        className={cn(arrowClass, "left-1 lg:left-0 lg:-translate-x-1/2")}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        aria-label="Przewiń w prawo"
        disabled={!canNext}
        onClick={() => scrollByStep(1)}
        className={cn(arrowClass, "right-1 lg:right-0 lg:translate-x-1/2")}
      >
        <ChevronRight size={20} />
      </button>

      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onWheel={onWheel}
        className={cn(
          "flex snap-x snap-mandatory overflow-x-auto pb-2 scrollbar-none",
          trackClassName
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  );
}
