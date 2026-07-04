"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { GlobeMethods } from "react-globe.gl";
import {
  findGlobeGroup,
  getGlobeLayerApiUrl,
  ISS_GLOBE_LAYER_SHADER,
  ISS_GLOBE_LAYERS,
  type IssGlobeLayerId,
} from "@/lib/ops/iss-globe-layers";

/** three-globe: prime meridian wzdłuż osi Z. */
const GLOBE_TEXTURE_ROT_Y = -Math.PI / 2;
const LAYER_ALT = 0.018;

export type GlobeLayerStatus = "off" | "loading" | "ready" | "error";

type LayerMeta = {
  updatedAt: string | null;
  label: string;
  status: GlobeLayerStatus;
  error?: string;
};

function disposeLayerMesh(
  mesh: THREE.Mesh | null,
  parent: THREE.Object3D | null,
): void {
  if (!mesh) return;
  parent?.remove(mesh);
  mesh.geometry.dispose();
  if (Array.isArray(mesh.material)) {
    mesh.material.forEach((m) => m.dispose());
  } else {
    mesh.material.dispose();
  }
}

/** Raster atmosferyczny — georeferencja 1:1 z globusem, bez obrotu / terminatora. */
export function useGlobeAtmosphereLayer(
  globeRef: RefObject<GlobeMethods | undefined>,
  layerId: IssGlobeLayerId,
  globePainted: boolean,
  onMetaChange?: (meta: LayerMeta) => void,
): void {
  const [tick, setTick] = useState(0);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const onMetaRef = useRef(onMetaChange);
  onMetaRef.current = onMetaChange;

  const def = ISS_GLOBE_LAYERS[layerId];

  const emit = (meta: Partial<LayerMeta> & { label: string; status: GlobeLayerStatus }) => {
    onMetaRef.current?.({
      updatedAt: meta.updatedAt ?? null,
      label: meta.label,
      status: meta.status,
      error: meta.error,
    });
  };

  useEffect(() => {
    if (layerId === "none" || !def.refreshMs) return;
    const timer = setInterval(() => setTick((n) => n + 1), def.refreshMs);
    return () => clearInterval(timer);
  }, [layerId, def.refreshMs]);

  useEffect(() => {
    const globe = globeRef.current;
    const scene = globe?.scene() ?? null;
    const globeGroup = scene ? findGlobeGroup(scene) : null;
    const layerParent = globeGroup ?? scene;

    if (!globePainted || layerId === "none") {
      disposeLayerMesh(meshRef.current, layerParent);
      meshRef.current = null;
      emit({ label: ISS_GLOBE_LAYERS.none.label, status: "off" });
      return;
    }

    let cancelled = false;
    let frame = 0;
    const apiUrl = getGlobeLayerApiUrl(layerId);
    if (!apiUrl) return;

    emit({ label: def.label, status: "loading" });

    const attach = async () => {
      if (cancelled) return;
      const g = globeRef.current;
      if (!g) {
        frame = requestAnimationFrame(() => void attach());
        return;
      }

      try {
        const res = await fetch(`${apiUrl}&_=${tick}`, { cache: "default" });
        if (cancelled) return;

        if (!res.ok) {
          emit({
            label: def.label,
            status: "error",
            error: `API ${res.status}`,
          });
          return;
        }

        const updatedAt = res.headers.get("X-Globe-Layer-Updated");
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);

        if (cancelled || !globeRef.current) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        const activeScene = globeRef.current.scene();
        const activeGroup = findGlobeGroup(activeScene);
        const parent = activeGroup ?? activeScene;
        const radius = globeRef.current.getGlobeRadius();

        disposeLayerMesh(meshRef.current, parent);
        meshRef.current = null;

        const tex = await new THREE.TextureLoader().loadAsync(objectUrl);
        URL.revokeObjectURL(objectUrl);
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;

        const material = new THREE.ShaderMaterial({
          uniforms: {
            layerTexture: { value: tex },
            opacity: { value: def.opacity },
          },
          vertexShader: ISS_GLOBE_LAYER_SHADER.vertexShader,
          fragmentShader: ISS_GLOBE_LAYER_SHADER.fragmentShader,
          transparent: true,
          depthWrite: false,
          depthTest: true,
        });

        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(radius * (1 + LAYER_ALT), 96, 96),
          material,
        );
        mesh.rotation.y = GLOBE_TEXTURE_ROT_Y;
        mesh.renderOrder = 100;

        if (cancelled || !globeRef.current) {
          disposeLayerMesh(mesh, null);
          return;
        }

        parent.add(mesh);
        meshRef.current = mesh;

        emit({
          updatedAt,
          label: def.label,
          status: "ready",
        });
      } catch (err) {
        if (cancelled) return;
        console.warn("[iss-globe] atmosphere layer failed", err);
        emit({
          label: def.label,
          status: "error",
          error: err instanceof Error ? err.message : "fetch failed",
        });
      }
    };

    void attach();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      const g = globeRef.current;
      const s = g?.scene() ?? null;
      const p = s ? findGlobeGroup(s) ?? s : null;
      disposeLayerMesh(meshRef.current, p);
      meshRef.current = null;
    };
  }, [globePainted, layerId, tick, globeRef, def.label, def.opacity]);
}
