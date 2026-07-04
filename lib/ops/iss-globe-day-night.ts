/** Tekstury i shader day/night — rozszerzony three-globe/example/day-night-cycle. */

import * as THREE from "three";
import type { ShaderMaterial, Texture } from "three";
import type { IssGlobeEarthTextureSet } from "@/lib/ops/iss-globe-earth-textures";
import { subsolarLngLat } from "@/lib/ops/subsolar-point";

/** GLSL3 — wymagane przez Three.js r152+ / WebGL2. */
export const ISS_GLOBE_DAY_NIGHT_SHADER = {
  vertexShader: `
    out vec3 vNormal;
    out vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;

    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform sampler2D bumpTexture;
    uniform sampler2D specularTexture;
    uniform vec2 sunPosition;
    uniform vec2 globeRotation;
    uniform float bumpStrength;
    uniform float specularStrength;

    in vec3 vNormal;
    in vec2 vUv;
    out vec4 fragColor;

    #define PI 3.141592653589793

    float toRad(in float a) {
      return a * PI / 180.0;
    }

    vec3 polarToCartesian(in vec2 c) {
      float theta = toRad(90.0 - c.x);
      float phi = toRad(90.0 - c.y);
      return vec3(
        sin(phi) * cos(theta),
        cos(phi),
        sin(phi) * sin(theta)
      );
    }

    void main() {
      float invLon = toRad(globeRotation.x);
      float invLat = -toRad(globeRotation.y);
      mat3 rotX = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(invLat), -sin(invLat),
        0.0, sin(invLat), cos(invLat)
      );
      mat3 rotY = mat3(
        cos(invLon), 0.0, sin(invLon),
        0.0, 1.0, 0.0,
        -sin(invLon), 0.0, cos(invLon)
      );
      vec3 sunDirection = rotX * rotY * polarToCartesian(sunPosition);
      float intensity = dot(normalize(vNormal), normalize(sunDirection));

      vec4 dayColor = texture(dayTexture, vUv);
      vec4 nightColor = texture(nightTexture, vUv);

      float blendFactor = smoothstep(-0.18, 0.22, intensity);
      vec3 dayRgb = dayColor.rgb;
      if (bumpStrength > 0.0) {
        float bump = texture(bumpTexture, vUv).r;
        dayRgb *= 0.78 + bumpStrength * 3.5 * bump;
      }

      vec3 base = mix(nightColor.rgb, dayRgb, blendFactor);

      if (specularStrength > 0.0) {
        float specMask = texture(specularTexture, vUv).r;
        float oceanGlint = pow(max(intensity, 0.0), 10.0) * specMask * blendFactor;
        base += oceanGlint * specularStrength;
      }

      fragColor = vec4(base, 1.0);
    }
  `,
} as const;

/** Odświeżanie pozycji Słońca — wystarczy co minutę (terminator ~4°/h). */
export const ISS_GLOBE_DAY_NIGHT_UPDATE_MS = 60_000;

type GeoCamera = {
  camera: () => { position: { x: number; y: number; z: number } };
  toGeoCoords: (coords: { x: number; y: number; z: number }) => {
    lng: number;
    lat: number;
  };
};

export type GlobeDayNightTextures = {
  day: Texture;
  night: Texture;
  bump: Texture | null;
  specular: Texture | null;
};

export function createGlobeDayNightMaterial(
  textures: GlobeDayNightTextures,
  textureSet: Pick<
    IssGlobeEarthTextureSet,
    "bumpStrength" | "specularStrength"
  >,
): ShaderMaterial {
  const [lng, lat] = subsolarLngLat(new Date());
  const fallbackTex = textures.day;

  return new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: textures.day },
      nightTexture: { value: textures.night },
      bumpTexture: { value: textures.bump ?? fallbackTex },
      specularTexture: { value: textures.specular ?? fallbackTex },
      sunPosition: { value: new THREE.Vector2(lng, lat) },
      globeRotation: { value: new THREE.Vector2(0, 0) },
      bumpStrength: { value: textures.bump ? textureSet.bumpStrength : 0 },
      specularStrength: {
        value: textures.specular ? textureSet.specularStrength : 0,
      },
    },
    vertexShader: ISS_GLOBE_DAY_NIGHT_SHADER.vertexShader,
    fragmentShader: ISS_GLOBE_DAY_NIGHT_SHADER.fragmentShader,
    glslVersion: THREE.GLSL3,
  });
}

/** Jak w three-globe/example/day-night-cycle — korekta terminatorem przy obrocie kamery. */
export function syncGlobeDayNightRotation(
  material: ShaderMaterial,
  globe: GeoCamera,
): void {
  const pos = globe.camera().position;
  const { lng, lat } = globe.toGeoCoords({
    x: pos.x,
    y: pos.y,
    z: pos.z,
  });
  material.uniforms.globeRotation!.value.set(lng, lat);
}
