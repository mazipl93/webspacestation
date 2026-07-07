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
import OpsIssTelemetry from "@/components/discover/OpsIssTelemetry";
import { useGlobeStageSize } from "@/components/iss-globe/useGlobeStageSize";
import { useGlobeCountries } from "@/hooks/useGlobeCountries";
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
  flattenGlobeMaterial,
  getIssGlobeCameraAltitude,
  getIssGlobeFollowTransitionMs,
  getIssGlobeZoomLimits,
  resolveIssGlobeProfile,
  type IssGlobeVariant,
} from "@/lib/ops/iss-globe-config";
import { resolveGlobeCountryBorderStyle } from "@/lib/ops/iss-globe-countries";
import type { OpsIssPosition } from "@/lib/ops/types";
import { issVisibilityRingDegrees } from "@/lib/ops/iss-visibility";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="iss-globe__loading flex h-full min-h-[inherit] w-full items-center justify-center bg-[#030712] text-[12px] text-text-muted">
      Ładowanie modelu Ziemi…
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
};

function useMobileGlobe() {
  // Zawsze false na SSR i pierwszym renderze klienta — matchMedia w useState
  // powoduje mismatch klas (iss-globe--mobile) przy hydratacji.
  const [isMobile, setIsMobile] = useState(false);

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
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalGlobeRef = useRef<GlobeMethods | undefined>(undefined);
  const globeRef = externalGlobeRef ?? internalGlobeRef;
  const userMovedRef = useRef(false);
  const programmaticPovRef = useRef(false);
  const followIssRef = useRef(true);
  const viewInitRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [globePainted, setGlobePainted] = useState(false);
  const [followInternal, setFollowInternal] = useState(true);
  const followIss = followIssProp ?? followInternal;
  followIssRef.current = followIss;
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
  const followTransitionMs = getIssGlobeFollowTransitionMs(
    variant,
    interactive,
    isMobile,
  );
  const isCompactPreview = variant === "compact" && !interactive;

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

  const issRef = useRef(iss);
  const cameraAltitudeRef = useRef(cameraAltitude);
  issRef.current = iss;
  cameraAltitudeRef.current = cameraAltitude;

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
        window.setTimeout(() => {
          programmaticPovRef.current = false;
        }, 0);
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
      const zoom = getIssGlobeZoomLimits(variant, isMobile, interactive);
      const baseDistance = radius * cameraAltitude;

      controls.enabled = interactive;
      controls.enablePan = false;
      controls.enableRotate = interactive;
      controls.enableDamping = interactive;
      controls.dampingFactor = isMobile ? 0.16 : 0.08;
      controls.rotateSpeed = isMobile ? 0.22 : 0.45;
      controls.enableZoom = interactive && zoom.enableZoom;
      controls.zoomSpeed = isMobile ? 0.65 : 0.85;
      controls.minDistance = baseDistance * zoom.minMultiplier;
      controls.maxDistance = baseDistance * zoom.maxMultiplier;

      if (!interactive || !zoom.enableZoom) {
        controls.minDistance = baseDistance;
        controls.maxDistance = baseDistance;
        controls.touches = { ONE: 0, TWO: 0 };
      } else if (isMobile) {
        controls.touches = { ONE: 0, TWO: 2 };
      } else {
        controls.touches = { ONE: 0, TWO: 2 };
      }

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, profile.maxPixelRatio),
      );

      flattenGlobeMaterial(globe as GlobeInstanceRef);
    },
    [cameraAltitude, interactive, isMobile, profile.maxPixelRatio, variant],
  );

  useEffect(() => {
    if (!globePainted || !globeRef.current) return;
    configureControls(globeRef.current);
    if (isCompactPreview && followIss && issRef.current) {
      centerOnIss(0);
    }
  }, [globePainted, configureControls, globeRef, isCompactPreview, followIss, centerOnIss]);

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
          const bootIss = issRef.current;
          if (bootIss) {
            globe.pointOfView(
              {
                lat: bootIss.latitude,
                lng: bootIss.longitude,
                altitude: cameraAltitudeRef.current,
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
  }, [showGlobe, configureControls, globeRef]);

  const disableFollowOnUserInput = useCallback(() => {
    if (!followIssRef.current) return;
    userMovedRef.current = true;
    if (followIssProp === undefined) {
      setFollowInternal(false);
    }
    onFollowChange?.(false);
  }, [followIssProp, onFollowChange]);

  useEffect(() => {
    if (!globePainted || !interactive) return;

    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    const canvas = globe.renderer().domElement;

    controls.addEventListener("start", disableFollowOnUserInput);
    canvas.addEventListener("wheel", disableFollowOnUserInput, { passive: true });
    canvas.addEventListener("pointerdown", disableFollowOnUserInput);

    return () => {
      controls.removeEventListener("start", disableFollowOnUserInput);
      canvas.removeEventListener("wheel", disableFollowOnUserInput);
      canvas.removeEventListener("pointerdown", disableFollowOnUserInput);
    };
  }, [globePainted, interactive, disableFollowOnUserInput, globeRef]);

  useEffect(() => {
    const onVisibility = () => {
      const globe = globeRef.current;
      if (!globe) return;
      globe.controls().enabled = interactive && !document.hidden;
      if (!document.hidden && isCompactPreview && globePainted && followIss && iss) {
        centerOnIss(0);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [
    interactive,
    isCompactPreview,
    globePainted,
    followIss,
    iss,
    centerOnIss,
    globeRef,
  ]);

  useEffect(() => {
    if (!isCompactPreview || !globePainted || !followIss || !iss) return;
    const id = window.setTimeout(() => centerOnIss(0), 100);
    return () => window.clearTimeout(id);
  }, [size.width, size.height, isCompactPreview, globePainted, followIss, iss, centerOnIss]);

  const setFollow = useCallback(
    (next: boolean) => {
      if (next) userMovedRef.current = false;
      if (followIssProp === undefined) setFollowInternal(next);
      onFollowChange?.(next);
      if (next) centerOnIss(followTransitionMs);
    },
    [centerOnIss, followIssProp, followTransitionMs, onFollowChange],
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
    centerOnIss(followTransitionMs);
  }, [
    followIss,
    iss?.latitude,
    iss?.longitude,
    globePainted,
    centerOnIss,
    followTransitionMs,
    globeRef,
  ]);

  useEffect(() => {
    if (!globePainted || !viewInitRef.current || !globeRef.current) return;
    if (followTransitionMs > 0) return;
    centerOnIss(0);
  }, [cameraAltitude, globePainted, centerOnIss, followTransitionMs, globeRef]);

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
        !interactive && "iss-globe--preview",
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
                Ładowanie modelu Ziemi…
              </div>
            ) : null}

            {(showControls || liveHud === "controls") && globePainted ? (
              <>
                {liveHud === "controls" && iss ? (
                  <div className="iss-globe__telemetry">
                    <OpsIssTelemetry iss={iss} variant="hud" />
                  </div>
                ) : null}

                <div className="iss-globe__hud" aria-label="Sterowanie modelem Ziemi">
                  {liveHud === "controls" && !iss ? (
                    <span className="iss-globe__live-chip iss-globe__live-chip--muted">
                      Oczekiwanie na dane ISS…
                    </span>
                  ) : null}

                  {showControls ? (
                  <div className="iss-globe__hud-actions">
                    <button
                      type="button"
                      className={cn(
                        "iss-globe__follow-btn",
                        followIss && "iss-globe__follow-btn--active",
                      )}
                      onClick={() => setFollow(!followIss)}
                      aria-pressed={followIss}
                    >
                      Śledź ISS
                    </button>
                    {!followIss ? (
                      <button
                        type="button"
                        className="iss-globe__follow-btn iss-globe__follow-btn--ghost"
                        onClick={resetView}
                      >
                        Wróć do ISS
                      </button>
                    ) : null}
                  </div>
                ) : null}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="iss-globe__loading flex h-full min-h-[inherit] w-full items-center justify-center bg-[#030712] text-[12px] text-text-muted">
            {deferMount
              ? "Przewiń, by załadować model…"
              : "Ładowanie modelu Ziemi…"}
          </div>
        )}
      </div>
    </div>
  );
}
