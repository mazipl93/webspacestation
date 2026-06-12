import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "esa",
  title: "ESA",
  tagline: "Europejska Agencja Kosmiczna, Europa w kosmosie",
  description:
    "Artykuły o ESA, Europejskiej Agencji Kosmicznej. Misje Ariane, Copernicus, JUICE, Proba i europejski program kosmiczny na Web Space Station.",
  accent: "#00b4d8",
  tags: ["ESA"],
  intro: [
    "Europejska Agencja Kosmiczna (ESA, European Space Agency) to organizacja międzyrządowa skupiająca 22 kraje członkowskie, koordynująca i realizująca europejski program kosmiczny. Siedziba ESA mieści się w Paryżu, a agencja dysponuje siecią centrów specjalistycznych w całej Europie: od ESOC w Darmstadt, przez ESRIN we Frascati, po centrum startowe CNES/ESA w Kourou w Gujanie Francuskiej.",
    "ESA prowadzi szeroko zakrojony program misji naukowych, obserwacji Ziemi i nawigacyjnych. Flota satelitów Copernicus dostarcza danych środowiskowych kluczowych dla monitorowania klimatu, oceanów i katastrof naturalnych. System Galileo zapewnia europejską niezależność w dziedzinie nawigacji satelitarnej, stanowiąc alternatywę dla GPS.",
    "W eksploracji głębokiego kosmosu ESA uczestniczy w programie Artemis: europejski Moduł Serwisowy (ESM) napędza kapsułę Orion. Sonda JUICE bada księżyce Jowisza, a misja EnVision zmierza ku Wenus. ESA aktywnie współpracuje z NASA przy teleskopie Hubble'a i JWST, wnosząc wkład naukowy i technologiczny do największych projektów astronomicznych epoki.",
  ],
  related: [
    { label: "NASA", href: "/nasa" },
    { label: "SpaceX", href: "/spacex" },
    { label: "JWST", href: "/jwst" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function EsaPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
