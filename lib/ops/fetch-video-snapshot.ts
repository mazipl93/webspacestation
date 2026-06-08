import { fetchNasaVideos } from "@/lib/ops/nasa-media";
import type { OpsVideoPayload } from "@/lib/ops/payloads";

/** NASA Video Library — osobny snapshot dla /wideo. */
export async function fetchVideoOpsSnapshot(): Promise<OpsVideoPayload> {
  const isDev = process.env.NODE_ENV === "development";
  const videos = isDev
    ? []
    : await fetchNasaVideos(12).catch(() => []);

  return {
    videos,
    live: videos.length > 0,
    fetchedAt: new Date().toISOString(),
  };
}
