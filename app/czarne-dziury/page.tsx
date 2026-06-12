import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "czarne-dziury",
  title: "Czarne dziury",
  tagline: "Najbardziej ekstremalne obiekty we wszechświecie: czarne dziury i ich otoczenie",
  description:
    "Artykuły o czarnych dziurach na Web Space Station: supermasywne czarne dziury, horyzonty zdarzeń, obserwacje i odkrycia naukowe.",
  accent: "#7c3aed",
  tags: ["czarna dziura", "czarne dziury", "supermasywne czarne dziury"],
  intro: [
    "Czarne dziury to obszary przestrzeni, w których grawitacja jest tak silna, że nic, nawet światło, nie jest w stanie uciec poza horyzont zdarzeń. Powstają w wyniku kolapsu grawitacyjnego masywnych gwiazd lub, w przypadku supermasywnych czarnych dziur, przez wielomilionowe scalanie materii w centrach galaktyk. Teoria ogólna względności Einsteina precyzyjnie opisuje ich geometrię, choć wiele aspektów czarnych dziur pozostaje nierozwiązaną zagadką fizyki.",
    "W 2019 roku Teleskop Horyzontu Zdarzeń (EHT) uchwycił pierwszy obraz czarnej dziury: cień supermasywnej czarnej dziury M87* o masie 6,5 miliarda Słońc. W 2022 roku opublikowano obraz Sagittariusa A*, czarnej dziury w centrum Drogi Mlecznej o masie 4 milionów Słońc. Obie fotografie potwierdziły przewidywania ogólnej teorii względności z niespotykaną dotąd precyzją.",
    "Supermasywne czarne dziury rezydują w centrach niemal każdej dużej galaktyki i odgrywają kluczową rolę w ich ewolucji. Procesy akrecji materii wokół czarnych dziur generują dżety relatywistyczne i promieniowanie, które wpływają na całe galaktyki. Fale grawitacyjne rejestrowane przez detektory LIGO i Virgo pozwalają astronomom śledzić zderzenia czarnych dziur w odległych zakątkach kosmosu.",
  ],
  related: [
    { label: "JWST", href: "/jwst" },
    { label: "Ciemna materia", href: "/ciemna-materia" },
    { label: "Egzoplanety", href: "/egzoplanety" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function CzarneDziuryPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
