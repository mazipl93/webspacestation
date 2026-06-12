import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "blue-origin",
  title: "Blue Origin",
  tagline: "Prywatna firma kosmiczna Jeffa Bezosa: New Shepard, New Glenn i misja księżycowa",
  description:
    "Artykuły o Blue Origin na Web Space Station: rakiety New Shepard i New Glenn, turystyka kosmiczna, kontrakt lunarny z NASA i plany kolonizacji kosmosu.",
  accent: "#1d6fa4",
  tags: ["Blue Origin", "New Glenn"],
  intro: [
    "Blue Origin to prywatna firma kosmiczna założona w 2000 roku przez Jeffa Bezosa, założyciela Amazona. Firma realizuje długoterminową wizję przeniesienia przemysłu ciężkiego poza Ziemię i zasiedlenia przestrzeni kosmicznej przez miliony ludzi. Motto Blue Origin: Gradatim Ferociter, krok po kroku, wytrwale, odzwierciedla stopniowe, inżynieryjnie ostrożne podejście do rozwoju technologii rakietowych.",
    "Suborbitalny pojazd New Shepard, zdolny do wielokrotnego użytku, regularnie wynosi turystów i ładunki naukowe na granicę kosmosu. W 2021 roku Jeff Bezos osobiście poleciał na jego pokładzie. Orbitalny pojazd New Glenn, z silnikami BE-4 napędzanymi skroplonym metanem i tlenem, dołączył do floty operacyjnej i konkuruje bezpośrednio z rakietą Falcon 9 firmy SpaceX na rynku komercyjnych startów.",
    "Blue Origin wygrała jeden z kontraktów NASA w programie Commercial Lunar Payload Services: lądownik Blue Moon ma dostarczyć astronautów Artemis na powierzchnię Księżyca. Firma pracuje również nad systemem BE-7, silnikiem przeznaczonym do lądowań lunarnych. W dłuższej perspektywie Blue Origin planuje budowę orbitalnych kolonii, wielkich cylindrycznych habitatów zdolnych pomieścić tysiące mieszkańców.",
  ],
  related: [
    { label: "SpaceX", href: "/spacex" },
    { label: "Artemis", href: "/artemis" },
    { label: "Starlink", href: "/starlink" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function BlueOriginPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
