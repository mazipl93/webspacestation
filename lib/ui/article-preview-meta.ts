import type { NewsCategory } from "@/types";

export const PREVIEW_CATEGORY_META: Record<
  string,
  { label: string; color: string }
> = {
  misje: { label: "Misje", color: "#2f6dff" },
  astronomia: { label: "Astronomia", color: "#a855f7" },
  technologie: { label: "Technologie", color: "#38bdf8" },
  "ziemia-z-kosmosu": { label: "Ziemia z kosmosu", color: "#22c55e" },
  iss: { label: "ISS", color: "#ffb830" },
  ai: { label: "AI", color: "#e879f9" },
};

export const PREVIEW_CATEGORY_FALLBACK: Record<string, string> = {
  misje: `
    radial-gradient(ellipse at 50% 92%, rgba(255,130,30,0.72) 0%, rgba(225,70,0,0.34) 15%, transparent 40%),
    linear-gradient(180deg, #060c16 0%, #0a1320 52%, #07090c 100%)`,
  astronomia: `
    radial-gradient(ellipse at 56% 46%, rgba(168,20,240,0.46) 0%, rgba(90,10,205,0.22) 28%, transparent 56%),
    linear-gradient(135deg, #05070f 0%, #0b0514 100%)`,
  technologie: `
    radial-gradient(ellipse at 50% 94%, rgba(90,140,255,0.34) 0%, transparent 36%),
    linear-gradient(160deg, #050a13 0%, #070e1a 100%)`,
  "ziemia-z-kosmosu": `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
  iss: `
    radial-gradient(circle at 66% 44%, rgba(40,108,225,0.58) 0%, rgba(14,52,150,0.28) 32%, transparent 56%),
    linear-gradient(135deg, #04101f 0%, #061224 100%)`,
  ai: `
    radial-gradient(ellipse at 40% 50%, rgba(232,121,249,0.4) 0%, transparent 50%),
    linear-gradient(135deg, #0a0612 0%, #12081a 100%)`,
};

export function previewCatMeta(category: string) {
  return PREVIEW_CATEGORY_META[category] ?? { label: category, color: "#2f6dff" };
}

export function previewCatFallback(category: string) {
  return (
    PREVIEW_CATEGORY_FALLBACK[category] ?? PREVIEW_CATEGORY_FALLBACK.technologie
  );
}

export function previewCategorySlug(
  categoryId: string,
  categories: { id: string; slug: string }[]
): NewsCategory {
  const slug = categories.find((c) => c.id === categoryId)?.slug ?? "technologie";
  return slug as NewsCategory;
}
