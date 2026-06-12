import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "jwst",
  title: "James Webb",
  tagline: "Kosmiczny Teleskop Jamesa Webba, najdalsze okno na Wszechswiat",
  description:
    "Odkrycia i artykuły o Kosmicznym Teleskopie Jamesa Webba (JWST). Wczesny Wszechświat, egzoplanety, czarne dziury i rewolucja astronomiczna na Web Space Station.",
  accent: "#f97316",
  tags: ["JWST", "James Webb", "James Webb Space Telescope"],
  intro: [
    "Kosmiczny Teleskop Jamesa Webba (JWST) to najpotężniejszy i najbardziej czuły teleskop kosmiczny w historii, opracowany przez NASA, ESA i Kanadyjską Agencję Kosmiczną (CSA). Po 25 latach projektowania i budowy Webb wystartował 25 grudnia 2021 roku i dotarł do punktu libracyjnego L2, skąd obserwuje Wszechświat w podczerwieni.",
    "Główne zwierciadło teleskopu o średnicy 6,5 metra, złożone z 18 sześciokątnych segmentów pokrytych złotem, zbiera światło emitowane przez obiekty oddalone o ponad 13 miliardów lat świetlnych. JWST obserwuje pierwsze galaktyki uformowane po Wielkim Wybuchu, analizuje atmosfery egzoplanet w poszukiwaniu biomarkerów i bada powstawanie gwiazd i planet w galaktycznym pyle.",
    "Odkrycia Webba regularnie rewidują dotychczasowe modele kosmologiczne. Teleskop zarejestrował najstarsze znane galaktyki, wykrył ślady chemiczne w atmosferach odległych planet i uchwycił struktury protoplanetarne z niespotykaną dotąd rozdzielczością. Webb działa daleko ponad zaplanowany minimalny czas misji wynoszący 10 lat, a zapas paliwa pozwala na ponad 20 lat obserwacji.",
  ],
  related: [
    { label: "NASA", href: "/nasa" },
    { label: "ESA", href: "/esa" },
    { label: "SpaceX", href: "/spacex" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function JwstPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
