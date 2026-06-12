import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "hubble",
  title: "Teleskop Hubble'a",
  tagline: "Kosmiczny Teleskop Hubble'a, trzy dekady odkryć na orbicie Ziemi",
  description:
    "Artykuły o Teleskopie Hubble'a na Web Space Station: odkrycia, obserwacje, naprawa i historia legendarnego teleskopu NASA i ESA.",
  accent: "#a78bfa",
  tags: ["Hubble"],
  intro: [
    "Kosmiczny Teleskop Hubble'a to jeden z najważniejszych instrumentów naukowych w historii astronomii. Wyniesiony na orbitę w 1990 roku przez NASA i ESA, teleskop krąży na wysokości około 550 kilometrów nad Ziemią i rejestruje obrazy kosmosu z pominięciem zakłóceń atmosferycznych. Przez ponad trzy dekady dostarczył danych do tysięcy publikacji naukowych i zrewolucjonizował nasze rozumienie wszechświata.",
    "Hubble przyczynił się do wyznaczenia stałej Hubble'a, potwierdzenia istnienia czarnych dziur w centrach galaktyk oraz odkrycia, że ekspansja wszechświata przyspiesza. Jego ikonikcze zdjęcia: Filary Stworzenia, głębokie pola Hubble'a czy mgławica Orła, stały się symbolami naukowej eksploracji kosmosu i trafiły do masowej kultury popularnej.",
    "Mimo wielokrotnych problemów technicznych, w tym słynnej wady lustra naprawionej przez astronautów w 1993 roku, Hubble działa do dziś. NASA i ESA planują utrzymać jego działanie przynajmniej do końca lat dwudziestych, kiedy Kosmiczny Teleskop Jamesa Webba przejmie część jego zadań. Hubble i Webb uzupełniają się: obserwują różne zakresy spektrum i różne zjawiska kosmiczne.",
  ],
  related: [
    { label: "JWST", href: "/jwst" },
    { label: "NASA", href: "/nasa" },
    { label: "Egzoplanety", href: "/egzoplanety" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function HubblePage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
