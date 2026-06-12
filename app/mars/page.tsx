import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "mars",
  title: "Mars",
  tagline: "Czerwona Planeta: łaziki, misje i plany załogowej eksploracji Marsa",
  description:
    "Artykuły o Marsie na Web Space Station: misje NASA, ESA i SpaceX, łaziki Curiosity i Perseverance, poszukiwanie śladów życia i przyszłość kolonizacji.",
  accent: "#ef4444",
  tags: ["Mars"],
  intro: [
    "Mars, czwarta planeta Układu Słonecznego, od dekad przyciąga uwagę naukowców i inżynierów jako najbardziej dostępny cel dla załogowych misji kosmicznych. Czerwona barwa planety pochodzi od tlenków żelaza pokrywających jej powierzchnię. Mars posiada najwyższy wulkan w Układzie Słonecznym, Olympus Mons, oraz największy kanion, Valles Marineris, rozciągający się na długości ponad czterech tysięcy kilometrów.",
    "Łaziki NASA eksplorują marsyjską powierzchnię od 2004 roku: Spirit i Opportunity, następnie Curiosity i Perseverance. Ten ostatni, działający od 2021 roku w kraterze Jezero, szuka śladów dawnego życia mikrobiologicznego i pobiera próbki skalne przeznaczone do przyszłego transportu na Ziemię w ramach misji Mars Sample Return. Helikopter Ingenuity, wyniesiony razem z Perseverance, stał się pierwszym pojazdem latającym na innej planecie.",
    "Plany załogowych lotów na Marsa realizuje kilka podmiotów równolegle. NASA planuje misję załogową w latach trzydziestych w ramach programu Moon to Mars. SpaceX, poprzez program Starship, celuje w komercyjną kolonizację Czerwonej Planety. Misje orbitalne: MAVEN, Mars Reconnaissance Orbiter i europejski Trace Gas Orbiter, badają atmosferę i geologię planety, tworząc mapę zasobów niezbędnych dla przyszłych kolonistów.",
  ],
  related: [
    { label: "NASA", href: "/nasa" },
    { label: "SpaceX", href: "/spacex" },
    { label: "Artemis", href: "/artemis" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function MarsPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
