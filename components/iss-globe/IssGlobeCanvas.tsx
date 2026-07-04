"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import dynamic from "next/dynamic";
import type { GlobeMethods } from "react-globe.gl";
import {
  getIssGlobeMarkerElement,
  getObserverGlobeMarkerElement,
  issGlobeMarkerVisibility,
} from "@/components/iss-globe/iss-globe-marker";
import { useGlobeStageSize } from "@/components/iss-globe/useGlobeStageSize";
import { useGlobeCountries } from "@/hooks/useGlobeCountries";
import { useGlobeAtmosphereLayer } from "@/hooks/useGlobeAtmosphereLayer";
import { useLiveIssTrack } from "@/hooks/useLiveIssTrack";
import { cn } from "@/lib/cn";
import {
  decimateGlobePath,
  globeVisibilityCircle,
  issToGlobePoint,
  mergeGlobeOrbitPaths,
  type GlobePoint,
} from "@/lib/ops/iss-globe-geo";
import {
  ISS_GLOBE_FOLLOW,
  flattenGlobeMaterial,
  getIssGlobeCameraAltitude,
  getIssGlobeZoomLimits,
  resolveIssGlobeProfile,
  type IssGlobeVariant,
} from "@/lib/ops/iss-globe-config";
import { resolveGlobeCountryBorderStyle } from "@/lib/ops/iss-globe-countries";
import type { IssGlobeLayerId } from "@/lib/ops/iss-globe-layers";
import type { OpsIssPosition } from "@/lib/ops/types";
import { issVisibilityRingDegrees } from "@/lib/ops/iss-visibility";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="iss-globe__loading flex h-full min-h-[inherit] w-full items-center justify-center bg-[#030712] text-[12px] text-text-muted">
      Ładowanie globusa…
    </div>
  ),
});

type GlobePath = {
  id: string;
  points: GlobePoint[];
  color: string;
  stroke: number;
};

type GlobeHtmlMarker = GlobePoint & { id: string; kind: "iss" | "observer" };

type GlobeInstanceRef = GlobeMethods & {
  globeMaterial?: () => import("three").Material;
};

type Props = {
  initialIss: OpsIssPosition | null;
  initialGlobePast?: GlobePoint[];
  initialGlobeFuture?: GlobePoint[];
  variant?: IssGlobeVariant;
  className?: string;
  followIss?: boolean;
  onFollowChange?: (follow: boolean) => void;
  showControls?: boolean;
  interactive?: boolean;
  liveHud?: "off" | "controls";
  globeRef?: RefObject<GlobeMethods | undefined>;
  observer?: { lat: number; lon: number; name?: string } | null;
  atmosphereLayer?: IssGlobeLayerId;
  onAtmosphereLayerMeta?: (meta: {
    updatedAt: string | null;
    label: string;
    status: import("@/hooks/useGlobeAtmosphereLayer").GlobeLayerStatus;
    error?: string;
  }) => void;
};

function useMobileGlobe() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function useDeferredGlobeMount(
  containerRef: RefObject<HTMLElement | null>,
  defer: boolean,
) {
  const [ready, setReady] = useState(!defer);

  useEffect(() => {
    if (!defer) {
      setReady(true);
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setReady(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px", threshold: 0.08 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [containerRef, defer]);

  return ready;
}

function buildPaths(
  globePast: GlobePoint[],
  globeFuture: GlobePoint[],
  iss: OpsIssPosition | null,
  variant: IssGlobeVariant,
  isMobile: boolean,
): GlobePath[] {
  const profile = resolveIssGlobeProfile(variant, isMobile);
  const merged = mergeGlobeOrbitPaths(
    decimateGlobePath(globePast, profile.pathDecimate),
    decimateGlobePath(globeFuture, profile.pathDecimate),
  );

  const paths: GlobePath[] = [];
  const orbitStroke = variant === "compact" ? 1.4 : isMobile ? 1.6 : 2.2;

  if (merged.length >= 2) {
    paths.push({
      id: "iss-orbit-3d",
      points: merged,
      color: "rgba(34, 211, 238, 0.88)",
      stroke: orbitStroke,
    });
  }

  if (iss) {
    paths.push({
      id: "iss-visibility-zone",
      points: globeVisibilityCircle(
        iss.latitude,
        iss.longitude,
        issVisibilityRingDegrees(iss.altitudeKm, iss.visibility),
      ),
      color: "rgba(239, 68, 68, 0.72)",
      stroke: 1.35,
    });
  }

  return paths;
}

export default function IssGlobeCanvas({
  initialIss,
  initialGlobePast = [],
  initialGlobeFuture = [],
  variant = "full",
  className,
  followIss: followIssProp,
  onFollowChange,
  showControls = false,
  interactive = true,
  liveHud = "off",
  globeRef: externalGlobeRef,
  observer = null,
  atmosphereLayer = "none",
  onAtmosphereLayerMeta,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalGlobeRef = useRef<GlobeMethods | undefined>(undefined);
  const globeRef = externalGlobeRef ?? internalGlobeRef;
  const userMovedRef = useRef(false);
  const programmaticPovRef = useRef(false);
  const viewInitRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [globePainted, setGlobePainted] = useState(false);
  const [followInternal, setFollowInternal] = useState(true);
  const followIss = followIssProp ?? followInternal;
  const isMobile = useMobileGlobe();
  const profile = useMemo(
    () => resolveIssGlobeProfile(variant, isMobile),
    [variant, isMobile],
  );
  const deferMount = variant === "compact" && isMobile;
  const globeReady = useDeferredGlobeMount(containerRef, deferMount);
  const showGlobe = mounted && globeReady;
  const size = useGlobeStageSize(containerRef, isMobile, showGlobe);
  const cameraAltitude = getIssGlobeCameraAltitude(variant, isMobile);
  const countryBorderStyle = useMemo(
    () => resolveGlobeCountryBorderStyle(variant, isMobile),
    [variant, isMobile],
  );
  const countryFeatures = useGlobeCountries(
    showGlobe && globePainted && countryBorderStyle != null,
  );
  const showCountryBorders =
    countryBorderStyle != null && countryFeatures.length > 0;

  useGlobeAtmosphereLayer(
    globeRef,
    variant === "full" ? atmosphereLayer : "none",
    globePainted,
    onAtmosphereLayerMeta,
  );

  const { iss, globePast, globeFuture } = useLiveIssTrack(
    initialIss,
    [],
    [],
    initialGlobePast,
    initialGlobeFuture,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const issMarkerData = useMemo((): GlobeHtmlMarker[] => {
    const markers: GlobeHtmlMarker[] = [];
    if (iss) {
      markers.push({ ...issToGlobePoint(iss), id: "iss", kind: "iss" });
    }
    if (observer) {
      markers.push({
        lat: observer.lat,
        lng: observer.lon,
        alt: 0.008,
        id: "observer",
        kind: "observer",
      });
    }
    return markers;
  }, [iss, observer]);

  const pathsData = useMemo(
    () => buildPaths(globePast, globeFuture, iss, variant, isMobile),
    [globePast, globeFuture, iss, variant, isMobile],
  );

  const centerOnIss = useCallback(
    (transitionMs = 0) => {
      if (!iss || !globeRef.current) return;
      programmaticPovRef.current = true;
      globeRef.current.pointOfView(
        {
          lat: iss.latitude,
          lng: iss.longitude,
          altitude: cameraAltitude,
        },
        transitionMs,
      );
      if (transitionMs <= 0) {
        programmaticPovRef.current = false;
      } else {
        window.setTimeout(() => {
          programmaticPovRef.current = false;
        }, transitionMs + 80);
      }
    },
    [iss, cameraAltitude, globeRef],
  );

  const configureControls = useCallback(
    (globe: GlobeMethods) => {
      const controls = globe.controls();
      const renderer = globe.renderer();
      const radius = globe.getGlobeRadius();
      const zoom = getIssGlobeZoomLimits(variant, isMobile);

      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = isMobile ? 0.16 : 0.08;
      controls.rotateSpeed = isMobile ? 0.22 : 0.45;
      controls.enableZoom = zoom.enableZoom;
      controls.zoomSpeed = isMobile ? 0.55 : 0.85;
      controls.minDistance = radius * zoom.minDistanceFactor;
      controls.maxDistance = radius * zoom.maxDistanceFactor;

      if (isMobile && !zoom.enableZoom) {
        const targetDistance = radius * cameraAltitude;
        controls.minDistance = targetDistance;
        controls.maxDistance = targetDistance;
        controls.touches = { ONE: 0, TWO: 0 };
      } else if (isMobile) {
        controls.touches = { ONE: 0, TWO: 1 };
      } else {
        controls.touches = { ONE: 0, TWO: 2 };
      }

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, profile.maxPixelRatio),
      );

      flattenGlobeMaterial(globe as GlobeInstanceRef);
    },
    [cameraAltitude, isMobile, profile.maxPixelRatio, variant],
  );

  useEffect(() => {
    if (!showGlobe) return;

    let cancelled = false;
    let frame = 0;
    const fallback = window.setTimeout(() => {
      if (!cancelled) setGlobePainted(true);
    }, 1200);

    const boot = () => {
      if (cancelled) return;
      const globe = globeRef.current;
      if (!globe) {
        frame = requestAnimationFrame(boot);
        return;
      }

      try {
        configureControls(globe);

        if (!viewInitRef.current) {
          if (iss) {
            globe.pointOfView(
              {
                lat: iss.latitude,
                lng: iss.longitude,
                altitude: cameraAltitude,
              },
              0,
            );
          } else {
            globe.pointOfView({ lat: 20, lng: 15, altitude: 2.6 }, 0);
          }
          viewInitRef.current = true;
        }
      } catch (err) {
        console.error("[iss-globe] globe setup failed", err);
      }

      setGlobePainted(true);
      clearTimeout(fallback);
    };

    boot();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(fallback);
    };
  }, [showGlobe, configureControls, iss, cameraAltitude, globeRef]);

  const handleUserMove = useCallback(() => {
    if (programmaticPovRef.current) return;
    userMovedRef.current = true;
    if (followIssProp === undefined) {
      setFollowInternal(false);
    }
    onFollowChange?.(false);
  }, [followIssProp, onFollowChange]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !interactive) return;
    const controls = globe.controls();
    controls.addEventListener("start", handleUserMove);
    return () => controls.removeEventListener("start", handleUserMove);
  }, [mounted, globeReady, interactive, handleUserMove, globeRef]);

  useEffect(() => {
    const onVisibility = () => {
      const globe = globeRef.current;
      if (!globe) return;
      globe.controls().enabled = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [mounted, globeReady, globeRef]);

  const setFollow = useCallback(
    (next: boolean) => {
      if (next) userMovedRef.current = false;
      if (followIssProp === undefined) setFollowInternal(next);
      onFollowChange?.(next);
      if (next)
        centerOnIss(
          isMobile
            ? ISS_GLOBE_FOLLOW.mobileTransitionMs
            : ISS_GLOBE_FOLLOW.desktopTransitionMs,
        );
    },
    [centerOnIss, followIssProp, isMobile, onFollowChange],
  );

  const resetView = useCallback(() => {
    userMovedRef.current = false;
    setFollow(true);
  }, [setFollow]);

  const htmlElement = useCallback(
    (d: object) => {
      const marker = d as GlobeHtmlMarker;
      return marker.kind === "observer"
        ? getObserverGlobeMarkerElement()
        : getIssGlobeMarkerElement(variant === "compact");
    },
    [variant],
  );

  useEffect(() => {
    if (!followIss || !iss || !globeRef.current || !globePainted) return;
    centerOnIss(
      isMobile
        ? ISS_GLOBE_FOLLOW.mobileTransitionMs
        : ISS_GLOBE_FOLLOW.desktopTransitionMs,
    );
  }, [
    followIss,
    iss?.latitude,
    iss?.longitude,
    globePainted,
    centerOnIss,
    isMobile,
    globeRef,
  ]);

  useEffect(() => {
    if (!showGlobe || !globeRef.current || !globePainted) return;
    globeRef.current.renderer().setPixelRatio(
      Math.min(window.devicePixelRatio || 1, profile.maxPixelRatio),
    );
  }, [
    showGlobe,
    globePainted,
    size.width,
    size.height,
    profile.maxPixelRatio,
    globeRef,
  ]);

  useEffect(() => {
    if (!globePainted || !globeRef.current) return;
    const globe = globeRef.current as GlobeInstanceRef;
    flattenGlobeMaterial(globe);
    const retry = window.setTimeout(() => flattenGlobeMaterial(globe), 1800);
    return () => clearTimeout(retry);
  }, [globePainted, profile.globeImageUrl, profile.bumpImageUrl, globeRef]);

  useEffect(() => {
    if (!showGlobe) {
      setGlobePainted(false);
      viewInitRef.current = false;
    }
  }, [showGlobe]);

  return (
    <div
      className={cn(
        "iss-globe",
        variant === "compact" && "iss-globe--compact",
        isMobile && "iss-globe--mobile",
        className,
      )}
    >
      <div ref={containerRef} className="iss-globe__stage">
        {showGlobe ? (
          <>
            <Globe
              ref={globeRef}
              width={size.width}
              height={size.height}
              backgroundColor="rgba(3,7,18,1)"
              backgroundImageUrl={profile.backgroundImageUrl}
              globeImageUrl={profile.globeImageUrl}
              bumpImageUrl={profile.bumpImageUrl}
              globeCurvatureResolution={profile.globeCurvatureResolution}
              showAtmosphere={profile.showAtmosphere}
              atmosphereColor="#7dd3fc"
              atmosphereAltitude={0.055}
              showGraticules={profile.showGraticules}
              animateIn={false}
              enablePointerInteraction={interactive && globePainted}
              htmlElementsData={issMarkerData}
              htmlLat="lat"
              htmlLng="lng"
              htmlAltitude="alt"
              htmlElement={htmlElement}
              htmlTransitionDuration={0}
              htmlElementVisibilityModifier={issGlobeMarkerVisibility}
              pathsData={pathsData}
              pathPoints="points"
              pathPointLat="lat"
              pathPointLng="lng"
              pathPointAlt="alt"
              pathColor="color"
              pathStroke="stroke"
              pathTransitionDuration={0}
              polygonsData={showCountryBorders ? countryFeatures : []}
              polygonGeoJsonGeometry="geometry"
              polygonAltitude={
                showCountryBorders
                  ? () => countryBorderStyle!.altitude
                  : undefined
              }
              polygonCapColor={
                showCountryBorders
                  ? () => countryBorderStyle!.capColor
                  : undefined
              }
              polygonSideColor={
                showCountryBorders
                  ? () => countryBorderStyle!.sideColor
                  : undefined
              }
              polygonStrokeColor={
                showCountryBorders
                  ? () => countryBorderStyle!.strokeColor
                  : undefined
              }
              polygonsTransitionDuration={0}
            />
            {!globePainted ? (
              <div className="iss-globe__boot" aria-hidden>
                Ładowanie globusa…
              </div>
            ) : null}
          </>
        ) : (
          <div className="iss-globe__loading flex h-full min-h-[inherit] w-full items-center justify-center bg-[#030712] text-[12px] text-text-muted">
            {deferMount
              ? "Przewiń, by załadować globus…"
              : "Ładowanie globusa…"}
          </div>
        )}
      </div>

      {(showControls || liveHud === "controls") && (
        <div className="iss-globe__controls">
          {liveHud === "controls" && iss ? (
            <span className="iss-globe__live-chip" aria-live="polite">
              <span className="iss-globe__hud-dot" aria-hidden />
              ISS · na żywo
            </span>
          ) : liveHud === "controls" ? (
            <span className="iss-globe__live-chip iss-globe__live-chip--muted">
              Oczekiwanie na dane ISS…
            </span>
          ) : null}
          {showControls ? (
            <>
              <button
                type="button"
                className={cn(
                  "iss-globe__control-btn",
                  followIss && "iss-globe__control-btn--active",
                )}
                onClick={() => setFollow(!followIss)}
                aria-pressed={followIss}
              >
                {followIss ? "Śledzenie ISS" : "Śledź ISS"}
              </button>
              <button
                type="button"
                className="iss-globe__control-btn"
                onClick={resetView}
              >
                Reset widoku
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
