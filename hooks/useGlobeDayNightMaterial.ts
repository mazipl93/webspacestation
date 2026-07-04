"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { GlobeMethods } from "react-globe.gl";
import {
  createGlobeDayNightMaterial,
  ISS_GLOBE_DAY_NIGHT_UPDATE_MS,
  syncGlobeDayNightRotation,
  type GlobeDayNightTextures,
} from "@/lib/ops/iss-globe-day-night";
import {
  resolveIssGlobeEarthTextures,
  type IssGlobeEarthTextureSet,
} from "@/lib/ops/iss-globe-earth-textures";
import type { IssGlobeVariant } from "@/lib/ops/iss-globe-config";
import { subsolarLngLat } from "@/lib/ops/subsolar-point";

const textureCache = new Map<string, Promise<GlobeDayNightTextures>>();

function cacheKey(set: IssGlobeEarthTextureSet): string {
  return [set.day, set.night, set.bump ?? "", set.specular ?? ""].join("|");
}

function loadTexture(
  loader: THREE.TextureLoader,
  url: string,
): Promise<THREE.Texture> {
  return loader.loadAsync(url).then((tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
}

function loadDayNightTextures(
  textureSet: IssGlobeEarthTextureSet,
): Promise<GlobeDayNightTextures> {
  const key = cacheKey(textureSet);
  const cached = textureCache.get(key);
  if (cached) return cached;

  const loader = new THREE.TextureLoader();
  const pending = Promise.all([
    loadTexture(loader, textureSet.day),
    loadTexture(loader, textureSet.night),
    textureSet.bump
      ? loadTexture(loader, textureSet.bump)
      : Promise.resolve(null),
    textureSet.specular
      ? loadTexture(loader, textureSet.specular)
      : Promise.resolve(null),
  ]).then(([day, night, bump, specular]) => ({ day, night, bump, specular }));

  textureCache.set(key, pending);
  return pending;
}

function applySunPosition(
  material: THREE.ShaderMaterial,
  date = new Date(),
): void {
  const [lng, lat] = subsolarLngLat(date);
  material.uniforms.sunPosition!.value.set(lng, lat);
}

/** Materiał globusa z teksturą dnia/nocy i aktualnym terminatorem. */
export function useGlobeDayNightMaterial(
  enabled: boolean,
  variant: IssGlobeVariant,
  isMobile: boolean,
): {
  material: THREE.ShaderMaterial | null;
  textureSet: IssGlobeEarthTextureSet;
} {
  const textureSet = resolveIssGlobeEarthTextures(
    isMobile ? "mobile" : "desktop",
    variant,
  );
  const [material, setMaterial] = useState<THREE.ShaderMaterial | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    if (!enabled) {
      materialRef.current = null;
      setMaterial(null);
      return;
    }

    let cancelled = false;

    loadDayNightTextures(textureSet)
      .then((textures) => {
        if (cancelled) return;
        const mat = createGlobeDayNightMaterial(textures, textureSet);
        materialRef.current = mat;
        setMaterial(mat);
      })
      .catch((err) => {
        console.error("[iss-globe] day/night textures failed", err);
        if (!cancelled) {
          materialRef.current = null;
          setMaterial(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, textureSet.day, textureSet.night, textureSet.bump, textureSet.specular]);

  useEffect(() => {
    if (!enabled || !materialRef.current) return;

    const tick = () => {
      if (materialRef.current) applySunPosition(materialRef.current);
    };

    tick();
    const timer = setInterval(tick, ISS_GLOBE_DAY_NIGHT_UPDATE_MS);
    const onVisibility = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, material]);

  return { material, textureSet };
}

/** Preload tekstur (np. przed montowaniem globusa). */
export function preloadGlobeDayNightTextures(
  variant: IssGlobeVariant,
  isMobile: boolean,
): Promise<void> {
  const textureSet = resolveIssGlobeEarthTextures(
    isMobile ? "mobile" : "desktop",
    variant,
  );
  return loadDayNightTextures(textureSet).then(() => undefined);
}

/** Podłącza sync globeRotation — wymagane do poprawnego terminatorem (three-globe day-night). */
export function bindGlobeDayNightRotation(
  material: THREE.ShaderMaterial,
  globe: GlobeMethods,
): () => void {
  const sync = () => syncGlobeDayNightRotation(material, globe);
  sync();
  const controls = globe.controls();
  controls.addEventListener("change", sync);
  return () => controls.removeEventListener("change", sync);
}
