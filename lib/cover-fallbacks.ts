import { createHash } from "crypto";

/** Varied placeholders when RSS has no image or CDN 404. */
const BY_CATEGORY: Record<string, string[]> = {
  technologie: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=70",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=70",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=70",
  ],
  ai: [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=70",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=70",
  ],
  misje: [
    "https://images.unsplash.com/photo-1446776811953-b23d57bd2aa0?auto=format&fit=crop&w=1000&q=70",
    "https://images.unsplash.com/photo-1614728894747-2f457dab2d4c?auto=format&fit=crop&w=1000&q=70",
  ],
  astronomia: [
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1000&q=70",
    "https://images.unsplash.com/photo-1419242902214-272b23f4b7a0?auto=format&fit=crop&w=1000&q=70",
  ],
  "ziemia-z-kosmosu": [
    "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=1000&q=70",
    "https://images.unsplash.com/photo-1446776877081-d2826f855de6?auto=format&fit=crop&w=1000&q=70",
  ],
  iss: [
    "https://images.unsplash.com/photo-1614728894747-2f457dab2d4c?auto=format&fit=crop&w=1000&q=70",
    "https://images.unsplash.com/photo-1454789548928-9efd52ff1e69?auto=format&fit=crop&w=1000&q=70",
  ],
};

const DEFAULT_POOL = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd2aa0?auto=format&fit=crop&w=1000&q=70",
];

export function pickCategoryCoverFallback(
  category: string,
  seed: string
): string {
  const pool = BY_CATEGORY[category] ?? DEFAULT_POOL;
  const hash = createHash("sha1").update(seed).digest("hex");
  const idx = parseInt(hash.slice(0, 8), 16) % pool.length;
  return pool[idx] ?? DEFAULT_POOL[0];
}
