/** Ikona ISS — biała sylwetka (Wikimedia CC0). */
export const ISS_MAP_PIN_SRC = "/images/ops-pads/iss-silhouette.svg";

export const ISS_MAP_PIN_WIDTH = 38;
export const ISS_MAP_PIN_HEIGHT = 24;

export function issMapPinHtml(active: boolean): string {
  const activeClass = active ? " ops-iss-map-pin--active" : "";
  return `<span class="ops-iss-map-pin${activeClass}"><img src="${ISS_MAP_PIN_SRC}" width="${ISS_MAP_PIN_WIDTH}" height="${ISS_MAP_PIN_HEIGHT}" alt="" decoding="async" draggable="false" /></span>`;
}
