"use client";

import { useEffect, useState, type RefObject } from "react";

type Size = { width: number; height: number };

const MIN_SIZE = 120;

function readSize(node: HTMLElement): Size | null {
  const rect = node.getBoundingClientRect();
  const width = Math.floor(rect.width);
  const height = Math.floor(rect.height);
  if (width < MIN_SIZE || height < MIN_SIZE) return null;
  return { width, height };
}

function sizeChanged(a: Size, b: Size, tolerance: number): boolean {
  return (
    Math.abs(a.width - b.width) > tolerance ||
    Math.abs(a.height - b.height) > tolerance
  );
}

/** Stabilny rozmiar canvas — na mobile bez pętli od paska adresu (dvh). */
export function useGlobeStageSize(
  ref: RefObject<HTMLElement | null>,
  isMobile: boolean,
  enabled: boolean,
): Size {
  const [size, setSize] = useState<Size>({ width: 320, height: 320 });

  useEffect(() => {
    if (!enabled) return;

    const node = ref.current;
    if (!node) return;

    let raf = 0;

    const commit = (next: Size | null) => {
      if (!next) return;
      setSize((prev) => {
        const tolerance = isMobile ? 20 : 4;
        if (!sizeChanged(prev, next, tolerance)) return prev;
        return next;
      });
    };

    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        commit(readSize(node));
      });
    };

    measure();

    if (isMobile) {
      const onOrientation = () => {
        window.setTimeout(measure, 120);
      };
      window.addEventListener("orientationchange", onOrientation);
      window.visualViewport?.addEventListener("resize", onOrientation);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("orientationchange", onOrientation);
        window.visualViewport?.removeEventListener("resize", onOrientation);
      };
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [ref, isMobile, enabled]);

  return size;
}
