import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "starlink",
  title: "Starlink",
  tagline: "Megakonstelacja satelitów SpaceX: szerokopasmowy internet z orbity dla całego świata",
  description:
    "Artykuły o Starlink na Web Space Station: starty partii satelitów, zasięg sieci, prędkości i wpływ konstelacji na astronomię.",
  accent: "#06b6d4",
  tags: ["Starlink"],
  intro: [
    "Starlink to megakonstelacja satelitów telekomunikacyjnych tworzona przez SpaceX od 2019 roku. Jej celem jest zapewnienie szerokopasmowego internetu o niskim opóźnieniu w każdym miejscu na Ziemi, ze szczególnym naciskiem na rejony wiejskie i trudno dostępne, które pozostają poza zasięgiem tradycyjnej infrastruktury. Do 2026 roku sieć liczy ponad sześć tysięcy aktywnych satelitów, a docelowa konstelacja ma obejmować nawet kilkadziesiąt tysięcy urządzeń na różnych orbitach.",
    "Satelity Starlink krążą na niskiej orbicie okołoziemskiej, na wysokości od 340 do 570 kilometrów, co pozwala uzyskać opóźnienia rzędu 20 do 60 milisekund: znacznie niższe niż w przypadku tradycyjnych satelitów geostacjonarnych. Usługa dostępna jest w ponad stu krajach i znalazła zastosowanie w regionach dotkniętych katastrofami naturalnymi, na statkach i w lotnictwie komercyjnym.",
    "Rosnąca liczba satelitów Starlink budzi obawy środowiska astronomicznego: jasne smugi widoczne na długich ekspozycjach utrudniają obserwacje naziemne. SpaceX wprowadza powłoki antyrefleksyjne i zmiany orientacji satelitów, by zmniejszyć ich jasność. Starlink jest również strategicznym źródłem przychodów finansującym ambitniejsze projekty SpaceX: rakietę Starship i misje marsjańskie.",
  ],
  related: [
    { label: "SpaceX", href: "/spacex" },
    { label: "Blue Origin", href: "/blue-origin" },
    { label: "NASA", href: "/nasa" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function StarlinkPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
