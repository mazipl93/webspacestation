/**
 * Warstwy atmosferyczne globusa — pod obserwacje kosmiczne (ISS, zorza, GO),
 * nie prognozę „pogody z temperaturą”.
 */

import type * as THREE from "three";
export type IssGlobeLayerId = "none" | "clouds-viirs";

export type IssGlobeLayerDef = {
  id: IssGlobeLayerId;
  label: string;
  hint: string;
  /** NASA GIBS WMS (EPSG:4326) — tylko gdy zdefiniowane. */
  gibsLayer?: string;
  gibsWidth: number;
  gibsHeight: number;
  opacity: number;
  /** Odświeżanie po stronie klienta (ms). */
  refreshMs: number;
  enabled: boolean;
};

export const ISS_GLOBE_LAYERS: Record<IssGlobeLayerId, IssGlobeLayerDef> = {
  none: {
    id: "none",
    label: "Bez warstwy",
    hint: "Tylko globus i orbita ISS.",
    gibsWidth: 0,
    gibsHeight: 0,
    opacity: 0,
    refreshMs: 0,
    enabled: true,
  },
  "clouds-viirs": {
    id: "clouds-viirs",
    label: "Chmury · satelita",
    hint: "Pokrywa chmur MODIS (NASA GIBS) · obserwacja, nie prognoza · ~30 min opóźnienia.",
    gibsLayer: "MODIS_Terra_Cloud_Fraction_Day",
    gibsWidth: 2048,
    gibsHeight: 1024,
    opacity: 0.82,
    refreshMs: 30 * 60 * 1000,
    enabled: true,
  },
};

/** Warstwy planowane (picker / legenda — bez implementacji rasteru). */
export const ISS_GLOBE_LAYERS_PLANNED = [
  {
    id: "aurora-kp",
    label: "Owal zorzy (Kp)",
    hint: "NOAA SWPC · wspólne z terminalem zorzy.",
  },
  {
    id: "precip-radar",
    label: "Radar opadów",
    hint: "Przeszkody w widoku ISS / zorzy przy niskim horyzoncie.",
  },
  {
    id: "cloud-forecast",
    label: "Prognoza chmur (ECMWF)",
    hint: "Model numeryczny · faza 2 — wymaga cache rastra globalnego.",
  },
] as const;

export function buildGibsWmsUrl(
  layer: string,
  width: number,
  height: number,
  date = new Date(),
): string {
  const day = date.toISOString().slice(0, 10);
  const params = new URLSearchParams({
    service: "WMS",
    version: "1.1.1",
    request: "GetMap",
    layers: layer,
    styles: "default",
    format: "image/png",
    bbox: "-180,-90,180,90",
    width: String(width),
    height: String(height),
    SRS: "EPSG:4326",
    time: day,
  });
  return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${params.toString()}`;
}

export function getGlobeLayerApiUrl(layerId: IssGlobeLayerId): string | null {
  if (layerId === "none") return null;
  return `/api/ops/globe-layer?layer=${layerId}`;
}

export const ISS_GLOBE_LAYER_SHADER = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;

    uniform sampler2D layerTexture;
    uniform float opacity;

    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(layerTexture, vUv);
      float raw = max(texel.a, max(max(texel.r, texel.g), texel.b));
      float cover = smoothstep(0.06, 0.42, raw);
      gl_FragColor = vec4(0.95, 0.97, 1.0, cover * opacity);
    }
  `,
} as const;

type GlobeTaggedObject = THREE.Object3D & { __globeObjType?: string };

export function findGlobeGroup(scene: THREE.Scene): GlobeTaggedObject | null {
  let found: GlobeTaggedObject | null = null;
  scene.traverse((obj) => {
    if ((obj as GlobeTaggedObject).__globeObjType === "globe") {
      found = obj as GlobeTaggedObject;
    }
  });
  return found;
}
