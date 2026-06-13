import { ISS_SPOTLIGHT } from "@/lib/ops/cosmodrome-photos";

const OPS_PAD_IMG = "/images/ops-pads";

/** Tła kart Centrum operacyjnego — jak zdjęcie rakiety w OpsLaunchShowcase. */
export const OPS_ISS_SHOWCASE_IMAGE = ISS_SPOTLIGHT.imageUrl;

/** Zorza polarna z ISS (NASA iss065e453585, Shane Kimbrough, 2021). */
export const OPS_AURORA_SHOWCASE_IMAGE = `${OPS_PAD_IMG}/aurora.jpg`;

export const OPS_SHOWCASE_SCRIM = {
  iss: "linear-gradient(105deg, rgba(4, 7, 12, 0.94) 0%, rgba(4, 7, 12, 0.62) 48%, rgba(4, 7, 12, 0.28) 100%)",
  aurora:
    "linear-gradient(105deg, rgba(4, 10, 8, 0.9) 0%, rgba(4, 10, 8, 0.42) 42%, rgba(4, 10, 8, 0.12) 100%)",
} as const;

export const OPS_SHOWCASE_GLOW = {
  iss: "radial-gradient(circle at 88% 12%, rgba(56, 189, 248, 0.42) 0%, transparent 52%)",
  aurora: "radial-gradient(circle at 92% 8%, rgba(68, 255, 136, 0.38) 0%, transparent 55%)",
} as const;
