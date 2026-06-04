import type { OpsGalleryItem, OpsVideoItem } from "@/lib/ops/types";

const NASA_KEY = process.env.NASA_API_KEY?.trim() || "DEMO_KEY";

type NasaApod = {
  title?: string;
  date?: string;
  url?: string;
  hdurl?: string;
  copyright?: string;
  explanation?: string;
};

type NasaSearchItem = {
  href?: string;
  data?: { title?: string; date_created?: string }[];
  links?: { href?: string; rel?: string; render?: string }[];
};

type NasaSearchResponse = {
  collection?: { items?: NasaSearchItem[] };
};

export async function fetchNasaApod(): Promise<OpsGalleryItem | null> {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = (await res.json()) as NasaApod;
  const imageUrl = data.hdurl || data.url;
  if (!imageUrl || imageUrl.includes("youtube")) return null;
  return {
    id: `apod-${data.date ?? "today"}`,
    title: data.title ?? "Astronomiczne zdjęcie dnia",
    imageUrl,
    credit: data.copyright ? `© ${data.copyright}` : "NASA APOD",
    date: data.date,
    href: "https://apod.nasa.gov/apod/astropix.html",
    source: "NASA APOD",
  };
}

export async function fetchNasaGalleryImages(limit = 10): Promise<OpsGalleryItem[]> {
  const q = encodeURIComponent("nebula OR galaxy OR mars OR jupiter");
  const url = `https://images-api.nasa.gov/search?q=${q}&media_type=image&page_size=${limit}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = (await res.json()) as NasaSearchResponse;
  const items = data.collection?.items ?? [];

  const out: OpsGalleryItem[] = [];
  for (const item of items) {
    const meta = item.data?.[0];
    const thumb = item.links?.find((l) => l.rel?.includes("preview"))?.href;
    const full = item.links?.find((l) => l.render === "image")?.href ?? thumb;
    if (!full || !meta?.title) continue;
    out.push({
      id: `nasa-img-${out.length}-${meta.date_created ?? ""}`,
      title: meta.title,
      imageUrl: full,
      credit: "NASA",
      date: meta.date_created?.slice(0, 10),
      href: full,
      source: "NASA Image Library",
    });
  }
  return out;
}

export async function fetchNasaVideos(limit = 12): Promise<OpsVideoItem[]> {
  const q = encodeURIComponent("launch OR iss OR spacewalk");
  const url = `https://images-api.nasa.gov/search?q=${q}&media_type=video&page_size=${limit}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = (await res.json()) as NasaSearchResponse;
  const items = data.collection?.items ?? [];

  const out: OpsVideoItem[] = [];
  for (const item of items) {
    const meta = item.data?.[0];
    const thumb = item.links?.find((l) => l.rel?.includes("preview"))?.href;
    const video =
      item.links?.find((l) => l.render === "video" || l.href?.endsWith(".mp4"))
        ?.href ?? item.href;
    if (!meta?.title || !video) continue;
    out.push({
      id: `nasa-vid-${out.length}`,
      title: meta.title,
      thumbnail: thumb,
      href: video,
      source: "NASA Video Library",
    });
  }
  return out;
}
