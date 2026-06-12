import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "egzoplanety",
  title: "Egzoplanety",
  tagline: "Planety poza Układem Słonecznym: odkrycia, poszukiwanie życia i atmosfery egzoplanet",
  description:
    "Artykuły o egzoplanetach na Web Space Station: odkrycia Keplera i TESS, atmosfery badane przez JWST, strefy zamieszkiwalne i poszukiwanie biosygnatur.",
  accent: "#10b981",
  tags: ["egzoplanety"],
  intro: [
    "Egzoplanety to planety krążące wokół gwiazd innych niż Słońce. Pierwszą pewną detekcję egzoplanety ogłoszono w 1992 roku: planeta okrążała pulsara. Odkrycie egzoplanety wokół gwiazdy podobnej do Słońca nastąpiło w 1995 roku. Od tamtej pory teleskopy kosmiczne Kepler i TESS potwierdziły istnienie ponad pięciu tysięcy egzoplanet, a rzeczywista liczba planet w Drodze Mlecznej szacowana jest na setki miliardów.",
    "Współczesne badania egzoplanet koncentrują się na analizie ich atmosfer metodą spektroskopii tranzytowej. Kosmiczny Teleskop Jamesa Webba po raz pierwszy wykrył w atmosferach odległych planet konkretne związki chemiczne: dwutlenek węgla, metan i parę wodną. Kluczowym celem jest identyfikacja biosygnatur, związków chemicznych, których obecność mogłaby wskazywać na biologiczne procesy życiowe.",
    "Strefy zamieszkiwalne, obszary wokół gwiazdy, w których temperatura pozwala na istnienie ciekłej wody, skupiają szczególną uwagę astronomów. Planety skalne w strefach zamieszkiwalnych pobliskich gwiazd, takich jak TRAPPIST-1 czy Proxima Centauri, są priorytetowymi celami obserwacji. Misje Europejskiej Agencji Kosmicznej: CHEOPS i planowany PLATO, uzupełniają globalny program poszukiwań egzoplanet.",
  ],
  related: [
    { label: "JWST", href: "/jwst" },
    { label: "NASA", href: "/nasa" },
    { label: "Teleskop Hubble'a", href: "/hubble" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function EgzoplanetyPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
