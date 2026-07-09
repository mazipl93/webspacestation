/** Ikona ISS — ta sama grafika na globusie 3D i mapie 2D. */
export const ISS_MAP_PIN_SRC = "/images/ops-pads/issik2.png";

/** Rozmiar markera na mapie 2D (odpowiednik iss-globe__marker--compact). */
export const ISS_MAP_PIN_WIDTH = 44;
export const ISS_MAP_PIN_HEIGHT = 26;

/** HTML markera 2D — bez klas globusa (globalne width:100% psuły rozmiar w Leaflet). */
export function issMapPinHtml(active: boolean): string {
  const w = ISS_MAP_PIN_WIDTH;
  const h = ISS_MAP_PIN_HEIGHT;
  const activeStyle = active ? "transform:scale(1.06);" : "";
  const shadow =
    "filter:drop-shadow(0 2px 4px rgba(0,0,0,0.9)) drop-shadow(0 0 8px rgba(0,0,0,0.45));";
  return `<img src="${ISS_MAP_PIN_SRC}" class="ops-iss-map-pin__img" alt="" width="${w}" height="${h}" style="display:block;width:${w}px;height:${h}px;max-width:${w}px;max-height:${h}px;object-fit:contain;pointer-events:none;${shadow}${activeStyle}" decoding="async" draggable="false" />`;
}
