import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "artemis",
  title: "Program Artemis",
  tagline: "Powrót człowieka na Księżyc: rakieta SLS, kapsuła Orion i stacja Gateway",
  description:
    "Artykuły o programie Artemis na Web Space Station: misje Artemis I, II, III, rakieta SLS, kapsuła Orion, lądowniki lunarni i budowa stacji Gateway.",
  accent: "#f59e0b",
  tags: ["Artemis", "Artemis III", "Artemis II", "SLS"],
  intro: [
    "Program Artemis to flagowy program NASA, którego celem jest powrót człowieka na Księżyc po ponad pięćdziesięcioletniej przerwie od ostatniego lądowania w 1972 roku. Nazwa nawiązuje do greckiej bogini Księżyca i siostry Apollina. Artemis I, bezzałogowa misja testowa w 2022 roku, z powodzeniem wyniosła kapsułę Orion na orbitę lunarną i potwierdziła gotowość Systemu Startowego Kosmosu, rakiety SLS.",
    "Artemis II ma zabrać załogę czterech astronautów na lot wokółksiężycowy bez lądowania, powtarzając trasę misji Apollo 8. Artemis III to misja lądowania: astronauci, w tym pierwsza kobieta i pierwsza osoba spoza USA, mają stanąć na powierzchni bieguna południowego Księżyca. Lądownik lunarny dla Artemis III dostarcza SpaceX w ramach programu Human Landing System, wykorzystując pojazd Starship w wersji lunarnej.",
    "Orbitalny element programu to Gateway: stacja kosmiczna na eliptycznej orbicie księżycowej, budowana we współpracy NASA, ESA, JAXA i CSA. Gateway ma pełnić rolę bazy operacyjnej dla misji lunarnych i punktu przesiadkowego dla przyszłych wypraw marsjańskich. Program Artemis wciela w życie nową filozofię eksploracji: trwałej obecności człowieka w pobliżu Księżyca, nie jednorazowych wizyt.",
  ],
  related: [
    { label: "Księżyc", href: "/ksiezyc" },
    { label: "NASA", href: "/nasa" },
    { label: "SpaceX", href: "/spacex" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function ArtemisPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
