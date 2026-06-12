import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "stacja-kosmiczna",
  title: "Stacja kosmiczna",
  tagline: "ISS i przyszłość stacji kosmicznych: życie, nauka i praca na orbicie",
  description:
    "Artykuły o ISS i stacjach kosmicznych na Web Space Station: ekspedycje, spacewalki, eksperymenty naukowe i plany następców Międzynarodowej Stacji Kosmicznej.",
  accent: "#38bdf8",
  tags: ["ISS", "Międzynarodowa Stacja Kosmiczna"],
  intro: [
    "Międzynarodowa Stacja Kosmiczna (ISS) to największy obiekt zbudowany przez człowieka w kosmosie. Krąży na orbicie na wysokości około 400 kilometrów, okrążając Ziemię szesnaście razy na dobę. Budowana od 1998 roku we współpracy NASA, Roskosmosu, ESA, JAXA i CSA, stacja gości nieprzerwanie astronautów od 2 listopada 2000 roku. Jej moduły laboratoryjne pozwalają prowadzić eksperymenty biologiczne, fizyczne i medyczne w warunkach mikrograwitacji.",
    "Badania na ISS mają bezpośrednie przełożenie na medycynę i technologię: wyniki dotyczące zaniku mięśni i utraty masy kostnej w kosmosie pomagają leczyć osteoporozę na Ziemi. Eksperymenty krystalograficzne pozwoliły lepiej zrozumieć struktury białek stosowanych w farmakologii. ISS jest też platformą testową dla technologii podtrzymywania życia, systemów nawigacji i materiałów przeznaczonych dla przyszłych misji lunarnych i marsjańskich.",
    "NASA planuje wycofanie ISS z eksploatacji do 2030 roku i kontrolowane zdeorbitowanie. Miejsce stacji mają zająć komercyjne stacje kosmiczne: Axiom Space planuje podłączyć własne moduły do ISS, a następnie odłączyć je po jej deorbitacji. Nowe projekty: Orbital Reef od Blue Origin i Sierra Space, Starlab od Voyager Space i Nanorack, mają zapewnić ciągłość obecności człowieka na niskiej orbicie okołoziemskiej.",
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

export default function StacjaKosmicznaPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
