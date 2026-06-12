import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "ciemna-materia",
  title: "Ciemna materia",
  tagline: "Niewidzialna materia stanowiąca 27 procent wszechświata: natura, dowody i poszukiwania",
  description:
    "Artykuły o ciemnej materii na Web Space Station: dowody na jej istnienie, kandydaci na cząstki, detektory i eksperymenty poszukujące natury ciemnej materii.",
  accent: "#6d28d9",
  tags: ["ciemna materia"],
  intro: [
    "Ciemna materia to hipotetyczna forma materii, która nie emituje, nie pochłania ani nie odbija światła, przez co jest niewidoczna dla teleskopów optycznych. Jej istnienie wynika z obserwacji astronomicznych: gwiazdy na obrzeżach galaktyk poruszają się zbyt szybko w stosunku do ilości widzialnej materii, a soczewkowanie grawitacyjne ujawnia masy znacznie przekraczające to, co widzimy. Szacuje się, że ciemna materia stanowi około 27 procent całkowitej energii-masy wszechświata, podczas gdy zwykła materia barionowa to zaledwie 5 procent.",
    "Wśród kandydatów na cząstki ciemnej materii dominują WIMP-y: słabo oddziałujące masywne cząstki, aksjony oraz sterylne neutrina. Podziemne detektory, takie jak LUX-ZEPLIN w Stanach Zjednoczonych czy XENONnT we Włoszech, szukają śladów zderzeń WIMP-ów z jądrami atomów. Aksjonów poszukuje eksperyment ADMX w Seattle. Żaden z detektorów nie zarejestrował dotąd przekonującego sygnału, co zawęża dopuszczalny obszar parametrów.",
    "Obserwacje kosmologiczne, zwłaszcza mapowanie kosmicznego mikrofalowego promieniowania tła i rozkładu galaktyk, precyzyjnie określają gęstość ciemnej materii, nie ujawniając jednak jej natury. Teleskop Eulid ESA, wyniesiony w 2023 roku, tworzy szczegółową mapę rozkładu ciemnej materii w kosmosie na podstawie efektów soczewkowania grawitacyjnego. Wyjaśnienie natury ciemnej materii pozostaje jednym z największych otwartych problemów fizyki i kosmologii.",
  ],
  related: [
    { label: "Czarne dziury", href: "/czarne-dziury" },
    { label: "JWST", href: "/jwst" },
    { label: "ESA", href: "/esa" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function CiemnaMateriaPPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
