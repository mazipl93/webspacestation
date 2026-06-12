import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "spacex",
  title: "SpaceX",
  tagline: "Space Exploration Technologies Corp., prywatna rewolucja kosmiczna",
  description:
    "Wszystkie artykuły o SpaceX: Starship, Falcon 9, Dragon, Starlink i misje Elona Muska. Najnowsze starty i odkrycia SpaceX na Web Space Station.",
  accent: "#e8f0ff",
  tags: ["SpaceX"],
  intro: [
    "SpaceX (Space Exploration Technologies Corp.) to prywatna firma kosmiczna założona przez Elona Muska w 2002 roku z misją uczynienia ludzkości gatunkiem wieloplanetarnym. W ciągu nieco ponad dwóch dekad SpaceX zrewolucjonizowało branżę kosmiczną, wprowadzając wielokrotnie używane rakiety i drastycznie obniżając koszty wynoszenia ładunków na orbitę.",
    "Flagowym produktem firmy jest rakieta Falcon 9, czyli pierwszy w historii nośnik orbitalny z odzyskiwalnym pierwszym stopniem. Pojedynczy booster Falcon 9 potrafi wykonać ponad trzydzieści lotów. Cięższy Falcon Heavy, złożony z trzech połączonych rdzeni Falcona 9, jest obecnie najpotężniejszą operacyjną rakietą na świecie.",
    "Trwającym projektem SpaceX jest Starship, w pełni wielokrotnie używalny system transportu kosmicznego złożony z członu Super Heavy i statku Starship. Przeznaczony do lotów na Księżyc i Marsa, w ramach programu NASA HLS Starship ma zabrać astronautów Artemis III na powierzchnię Księżyca. SpaceX obsługuje też konstelację satelitów Starlink zapewniających globalny dostęp do internetu.",
  ],
  related: [
    { label: "NASA", href: "/nasa" },
    { label: "ESA", href: "/esa" },
    { label: "JWST", href: "/jwst" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function SpaceXPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
