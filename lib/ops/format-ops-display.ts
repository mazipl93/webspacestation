import type { OpsIssPosition } from "@/lib/ops/types";

function hemisphere(value: number, pos: string, neg: string): string {
  const abs = Math.abs(value).toFixed(1);
  return `${abs}°${value >= 0 ? pos : neg}`;
}

/** Czytelny opis pozycji ISS dla laika. */
export function formatIssForReader(iss: OpsIssPosition | null): {
  coords: string;
  summary: string;
} {
  if (!iss) {
    return {
      coords: "Brak sygnału",
      summary: "Tracker ISS chwilowo niedostępny — spróbuj odświeżyć za chwilę.",
    };
  }

  const lat = hemisphere(iss.latitude, "N", "S");
  const lon = hemisphere(iss.longitude, "E", "W");

  return {
    coords: `${lat}, ${lon}`,
    summary:
      "Stacja krąży ok. 400 km nad Ziemią i okrąża planetę co ~90 minut. Współrzędne to punkt na globie bezpośrednio pod ISS w tej chwili.",
  };
}

export function formatOpsFetchedAt(iso: string | undefined): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
