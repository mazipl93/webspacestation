import type { Metadata } from "next";
import HubPageShell, {
  buildHubMetadata,
  type HubConfig,
} from "@/components/pages/HubPageShell";

export const revalidate = 300;

const HUB: HubConfig = {
  slug: "nasa",
  title: "NASA",
  tagline: "National Aeronautics and Space Administration, cywilny program kosmiczny USA",
  description:
    "Wszystkie artykuły o NASA na Web Space Station: misje, odkrycia, starty i programy kosmiczne agencji NASA. Artemis, JWST, Mars i wiecej.",
  accent: "#1d9bf0",
  tags: ["NASA"],
  intro: [
    "NASA (National Aeronautics and Space Administration) to amerykańska agencja rządowa odpowiedzialna za cywilny program badań kosmicznych i lotniczych Stanów Zjednoczonych. Założona 29 lipca 1958 roku, NASA przez ponad sześćdziesiąt lat kształtuje historię eksploracji kosmosu: od programu Apollo, przez misje promów kosmicznych, aż po współczesne programy Artemis i badania Układu Słonecznego.",
    "Dziś NASA prowadzi ambitny program Artemis, którego celem jest powrót człowieka na Księżyc i ustanowienie stałej ludzkiej obecności na jego orbicie. W ramach programu agencja buduje rakietę SLS, kapsułę Orion oraz Gateway, czyli orbitalną stację księżycową. Równocześnie łaziki NASA eksplorują powierzchnię Marsa, a sondy docierają do najdalszych zakątków Układu Słonecznego.",
    "Kosmiczny Teleskop Jamesa Webba, opracowany przez NASA we współpracy z ESA i CSA, rewolucjonizuje astronomię: obserwuje galaktyki sprzed 13 miliardów lat i analizuje atmosfery egzoplanet. Na niskiej orbicie okołoziemskiej NASA współzarządza Międzynarodową Stacją Kosmiczną, centrum badań naukowych w mikrograwitacji.",
  ],
  related: [
    { label: "SpaceX", href: "/spacex" },
    { label: "ESA", href: "/esa" },
    { label: "JWST", href: "/jwst" },
  ],
};

type Props = { searchParams: Promise<{ strona?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildHubMetadata(HUB, searchParams);
}

export default function NasaPage({ searchParams }: Props) {
  return <HubPageShell config={HUB} searchParams={searchParams} />;
}
