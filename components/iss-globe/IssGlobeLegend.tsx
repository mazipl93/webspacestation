"use client";

import type { GlobeLayerStatus } from "@/hooks/useGlobeAtmosphereLayer";
import { cn } from "@/lib/cn";
import {
  ISS_GLOBE_LAYERS,
  ISS_GLOBE_LAYERS_PLANNED,
  type IssGlobeLayerId,
} from "@/lib/ops/iss-globe-layers";

type Props = {
  atmosphereLayer: IssGlobeLayerId;
  onAtmosphereLayerChange: (layer: IssGlobeLayerId) => void;
  layerUpdatedAt?: string | null;
  layerStatus?: GlobeLayerStatus;
  showLayerToggles?: boolean;
  className?: string;
};

function formatLayerTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export default function IssGlobeLegend({
  atmosphereLayer,
  onAtmosphereLayerChange,
  layerUpdatedAt,
  layerStatus = "off",
  showLayerToggles = true,
  className,
}: Props) {
  const layerStamp = formatLayerTime(layerUpdatedAt);
  const activeLayer = ISS_GLOBE_LAYERS[atmosphereLayer];

  return (
    <div className={cn("sledziss-page__legend-wrap", className)}>
      <div className="sledziss-page__legend" aria-label="Legenda globusa">
        <span className="sledziss-page__legend-item sledziss-page__legend-item--future">
          Orbita ISS (~408 km nad Ziemią)
        </span>
        <span className="sledziss-page__legend-item sledziss-page__legend-item--visibility">
          Horyzont ISS — gdzie stacja jest nad linią horyzontu
        </span>
        <span className="sledziss-page__legend-item sledziss-page__legend-item--countries">
          Granice państw
        </span>
        <span className="sledziss-page__legend-item sledziss-page__legend-item--earth">
          Ziemia · NASA Blue Marble (wysoka rozdzielczość)
        </span>
      </div>

      {showLayerToggles ? (
        <div className="iss-globe-layers iss-globe-layers--legend">
          <p className="iss-globe-layers__title">Warstwy atmosferyczne</p>
          <p className="iss-globe-layers__subtitle">
            Pod obserwacje ISS i zorzy — włącz / wyłącz w legendzie.
          </p>

          <div
            className="iss-globe-layers__options"
            role="group"
            aria-label="Warstwy atmosferyczne"
          >
            {(Object.keys(ISS_GLOBE_LAYERS) as IssGlobeLayerId[])
              .filter((id) => id !== "none")
              .map((id) => {
                const layer = ISS_GLOBE_LAYERS[id];
                if (!layer.enabled) return null;
                const on = atmosphereLayer === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    className={cn(
                      "iss-globe-layers__btn",
                      on && "iss-globe-layers__btn--active",
                    )}
                    onClick={() =>
                      onAtmosphereLayerChange(on ? "none" : id)
                    }
                  >
                    {layer.label}
                  </button>
                );
              })}
          </div>

          <p className="iss-globe-layers__hint">
            {layerStatus === "loading"
              ? "Ładowanie warstwy chmur…"
              : layerStatus === "error"
                ? "Nie udało się pobrać warstwy — spróbuj ponownie."
                : atmosphereLayer === "none"
                  ? "Brak aktywnej warstwy — włącz np. chmury satelitarne."
                  : activeLayer.hint}
          </p>
          {layerStamp && atmosphereLayer !== "none" && layerStatus === "ready" ? (
            <p className="iss-globe-layers__stamp">Dane: {layerStamp} UTC</p>
          ) : null}

          <details className="iss-globe-layers__planned">
            <summary>Wkrótce: zorza, radar, prognoza chmur</summary>
            <ul>
              {ISS_GLOBE_LAYERS_PLANNED.map((layer) => (
                <li key={layer.id}>
                  <strong>{layer.label}</strong> — {layer.hint}
                </li>
              ))}
            </ul>
          </details>
        </div>
      ) : null}
    </div>
  );
}
