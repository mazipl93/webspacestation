/** Ikona ISS na mapie 2D i modelu 3D. */
export const ISS_MAP_PIN_SRC = "/images/ops-pads/issik2.png";

export const ISS_MAP_PIN_WIDTH = 48;
export const ISS_MAP_PIN_HEIGHT = 28;

export function issMapPinHtml(active: boolean): string {
  const activeClass = active ? " ops-iss-map-pin--active" : "";
  return `<span class="ops-iss-map-pin${activeClass}"><img src="${ISS_MAP_PIN_SRC}" width="${ISS_MAP_PIN_WIDTH}" height="${ISS_MAP_PIN_HEIGHT}" alt="" decoding="async" draggable="false" /></span>`;
}
