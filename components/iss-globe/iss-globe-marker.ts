import { ISS_MAP_PIN_SRC } from "@/lib/ops/iss-map-pin-icon";

/** Jedna instancja markera — globe.gl aktualizuje pozycję bez przebudowy DOM. */
let markerEl: HTMLDivElement | null = null;
let markerCompact = false;
let markerSrc: string | null = null;

export function getIssGlobeMarkerElement(compact: boolean): HTMLDivElement {
  if (
    markerEl &&
    markerCompact === compact &&
    markerSrc === ISS_MAP_PIN_SRC
  ) {
    return markerEl;
  }

  markerEl = document.createElement("div");
  markerCompact = compact;
  markerSrc = ISS_MAP_PIN_SRC;
  markerEl.className = compact
    ? "iss-globe__marker iss-globe__marker--compact"
    : "iss-globe__marker";
  markerEl.setAttribute("role", "img");
  markerEl.setAttribute("aria-label", "Międzynarodowa Stacja Kosmiczna");

  const img = document.createElement("img");
  img.src = ISS_MAP_PIN_SRC;
  img.alt = "";
  img.draggable = false;
  img.decoding = "async";
  markerEl.appendChild(img);

  return markerEl;
}

export function issGlobeMarkerVisibility(
  el: HTMLElement,
  isVisible: boolean,
): void {
  el.style.opacity = isVisible ? "1" : "0";
}

/** Marker obserwatora (lokalizacja z pickera przelotów). */
let observerMarkerEl: HTMLDivElement | null = null;

export function getObserverGlobeMarkerElement(): HTMLDivElement {
  if (observerMarkerEl) return observerMarkerEl;

  observerMarkerEl = document.createElement("div");
  observerMarkerEl.className = "iss-globe__observer-marker";
  observerMarkerEl.setAttribute("role", "img");
  observerMarkerEl.setAttribute("aria-label", "Lokalizacja obserwatora");
  return observerMarkerEl;
}
