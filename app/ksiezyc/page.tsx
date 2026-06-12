import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "ksiezyc",
  title: "Księżyc",
  tagline: "Naturalny satelita Ziemi: powrót człowieka na Księżyc i nowe misje lunarne",
  description:
    "Artykuły o Księżycu na Web Space Station: program Artemis, misje bezzałogowe, zasoby lunarne i plany budowy stałej bazy na orbicie i powierzchni Srebrnego Globu.",
  accent: "#94a3b8",
  tags: ["Księżyc"],
  intro: [
    "Księżyc, jedyny naturalny satelita Ziemi, towarzyszył ludzkości od zarania dziejów. Jego wpływ na ziemskie pływy i stabilizację osi obrotu Ziemi był kluczowy dla powstania warunków sprzyjających życiu. Między 1969 a 1972 rokiem dwunastu astronautów programu Apollo stanęło na jego powierzchni, co pozostaje do dziś największym osiągnięciem eksploracji kosmosu.",
    "Po pięćdziesięcioletniej przerwie ludzkość szykuje się do powrotu na Księżyc. Program NASA Artemis, we współpracy z ESA, JAXA i agencjami innych krajów, zakłada lądowanie astronautów, w tym pierwszej kobiety, na powierzchni Srebrnego Globu. Równolegle szereg agencji i firm prywatnych realizuje misje bezzałogowe: indyjska Chandrayaan-3 wylądowała w 2023 roku przy biegunie południowym, a program Commercial Lunar Payload Services NASA zleca loty prywatnym operatorom.",
    "Biegun południowy Księżyca, gdzie woda w postaci lodu wypełnia trwale zacienione kratery, jest strategicznym celem eksploracji. Lód księżycowy może dostarczyć wody, tlenu i paliwa wodorowego dla przyszłych misji. Gateway, planowana orbitalna stacja księżycowa, ma pełnić rolę węzła komunikacyjnego i bazy wypadowej zarówno dla misji lunarnych, jak i przyszłych ekspedycji marsjańskich.",
  ],
  related: [
    { label: "Artemis", href: "/artemis" },
    { label: "NASA", href: "/nasa" },
    { label: "Mars", href: "/mars" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function KsiezyePage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
