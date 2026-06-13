/** SEO + discovery dla narzędzi live WSS (ISS, zorza, starty). */

export type InteractiveToolId =
  | "iss-tracker"
  | "aurora-terminal"
  | "rocket-launches"
  | "launch-calendar";

export type InteractiveToolSeo = {
  id: InteractiveToolId;
  path: `/${string}`;
  /** Tytuł karty / OG (bez sufiksu serwisu). */
  title: string;
  /** Nagłówek H1 na stronie. */
  headline: string;
  description: string;
  longDescription: string;
  keywords: string[];
  featureList: string[];
  faq: { question: string; answer: string }[];
  relatedToolIds: InteractiveToolId[];
  ogImageAlt: string;
  sitemapPriority: number;
  sitemapChangeFrequency: "hourly" | "daily" | "weekly";
};

export const INTERACTIVE_TOOLS: Record<InteractiveToolId, InteractiveToolSeo> = {
  "iss-tracker": {
    id: "iss-tracker",
    path: "/mapa",
    title: "ISS tracker na żywo · gdzie jest stacja kosmiczna",
    headline: "ISS tracker na żywo · mapa pozycji stacji i startów",
    description:
      "Śledź Międzynarodową Stację Kosmiczną na żywo: pozycja ISS na mapie, orbita, prędkość, wysokość i platformy startowe nadchodzących rakiet.",
    longDescription:
      "Sprawdź, gdzie nad Ziemią leci ISS w tej chwili. Mapa pokazuje pozycję stacji na orbicie, trasę lotu i miejsca planowanych startów rakiet — dane odświeżane na bieżąco, bez instalacji aplikacji.",
    keywords: [
      "ISS tracker",
      "śledzenie ISS",
      "ISS na żywo",
      "gdzie jest ISS",
      "pozycja ISS",
      "orbita ISS",
      "mapa ISS",
      "Międzynarodowa Stacja Kosmiczna",
      "stacja kosmiczna na żywo",
      "ISS teraz",
      "przelot ISS",
      "mapa startów rakiet",
    ],
    featureList: [
      "Pozycja ISS na mapie w czasie rzeczywistym",
      "Orbita i parametry lotu stacji",
      "Platformy startowe nadchodzących misji",
      "Integracja z harmonogramem startów WSS",
    ],
    faq: [
      {
        question: "Jak śledzić ISS na żywo?",
        answer:
          "Na mapie WSS zobaczysz aktualną pozycję Międzynarodowej Stacji Kosmicznej na Ziemi, wysokość, prędkość i trasę orbity. Dane są odświeżane automatycznie.",
      },
      {
        question: "Czy mogę zobaczyć ISS gołym okiem?",
        answer:
          "Tak — ISS bywa widoczna o zmierzchu i świcie jako jasny punkt przelatujący po niebie. Tracker pomaga ustalić, nad którym regionem Ziemi stacja leci w danej chwili.",
      },
      {
        question: "Czy mapa pokazuje też starty rakiet?",
        answer:
          "Tak — na tej samej mapie zaznaczone są platformy startowe i nadchodzące starty. Pełny harmonogram z odliczaniem znajdziesz w sekcji Starty rakiet.",
      },
    ],
    relatedToolIds: ["rocket-launches", "aurora-terminal", "launch-calendar"],
    ogImageAlt: "ISS tracker na żywo · mapa pozycji Międzynarodowej Stacji Kosmicznej",
    sitemapPriority: 0.95,
    sitemapChangeFrequency: "hourly",
  },
  "aurora-terminal": {
    id: "aurora-terminal",
    path: "/zorza",
    title: "Czy dziś będzie zorza? · indeks Kp na żywo",
    headline: "Terminal zorzy polarnej · space weather na żywo",
    description:
      "Monitoruj zorzę polarną na żywo: indeks geomagnetyczny Kp, wiatr słoneczny Bz, prognoza burz i mapa widoczności zorzy w Polsce i na świecie — dane NOAA.",
    longDescription:
      "Sprawdź szansę na zorzę dziś i w najbliższych godzinach. Terminal łączy indeks Kp, parametry wiatru słonecznego, prognozę NOAA i mapę owali auroralnych — narzędzie dla łowców zórz i fotografów nocnego nieba.",
    keywords: [
      "zorza polarna",
      "zorza polarna dziś",
      "zorza na żywo",
      "indeks Kp",
      "prognoza zorzy",
      "Kp index",
      "aurora borealis",
      "space weather",
      "pogoda kosmiczna",
      "burza geomagnetyczna",
      "szansa na zorzę",
      "zorza w Polsce",
      "monitor zorzy",
      "wiatr słoneczny Bz",
    ],
    featureList: [
      "Indeks Kp i dane geomagnetyczne na żywo",
      "Wiatr słoneczny i parametr Bz",
      "Mapa owali auroralnych i widoczności zorzy",
      "Prognoza burz geomagnetycznych NOAA",
    ],
    faq: [
      {
        question: "Co oznacza indeks Kp?",
        answer:
          "Kp to skala aktywności geomagnetycznej od 0 do 9. Wyższe wartości oznaczają większą szansę na zorzę polarną na niższych szerokościach geograficznych, także w Polsce.",
      },
      {
        question: "Kiedy widać zorzę w Polsce?",
        answer:
          "Przy Kp 5+ zorza bywa widoczna w północnej Polsce, przy silniejszych burzach także dalej na południe. Terminal pokazuje aktualne warunki i prognozę na najbliższe godziny.",
      },
      {
        question: "Skąd pochodzą dane w terminalu zorzy?",
        answer:
          "Korzystamy z publicznych źródeł NOAA SWPC i pokrewnych serwisów space weather. Dane są odświeżane co około minutę.",
      },
    ],
    relatedToolIds: ["iss-tracker", "rocket-launches"],
    ogImageAlt: "Terminal zorzy polarnej · indeks Kp i prognoza aurora na żywo",
    sitemapPriority: 0.95,
    sitemapChangeFrequency: "hourly",
  },
  "rocket-launches": {
    id: "rocket-launches",
    path: "/starty",
    title: "Starty rakiet · harmonogram i odliczanie na żywo",
    headline: "Starty rakiet na żywo",
    description:
      "Harmonogram nadchodzących startów rakiet: SpaceX, NASA, ESA i inne — daty NET, okna startowe, odliczanie na żywo i kontekst każdej misji.",
    longDescription:
      "Śledź, kiedy wystartuje następna rakieta. Lista startów z odliczaniem, informacjami o misji, rakiecie i platformie startowej — z linkiem do mapy ISS i terminala zorzy w Centrum operacyjnym WSS.",
    keywords: [
      "starty rakiet",
      "harmonogram startów",
      "start rakiety dziś",
      "odliczanie do startu",
      "kiedy start rakiety",
      "SpaceX start",
      "start rakiety na żywo",
      "nadchodzące starty",
      "termin startu rakiety",
      "rakiet start harmonogram",
      "launch schedule",
    ],
    featureList: [
      "Harmonogram nadchodzących startów rakiet",
      "Odliczanie do startu w czasie rzeczywistym",
      "Informacje o misji, rakiecie i platformie",
      "Powiązane aktualności i kontekst AI",
    ],
    faq: [
      {
        question: "Jak sprawdzić, kiedy jest następny start rakiety?",
        answer:
          "Na stronie Starty rakiet zobaczysz listę nadchodzących misji z datą NET, oknem startowym i odliczaniem. Najbliższy start jest wyróżniony na stronie głównej w Centrum operacyjnym.",
      },
      {
        question: "Czy odliczanie do startu jest na żywo?",
        answer:
          "Tak — licznik aktualizuje się automatycznie i uwzględnia fazy odliczania, okna startowego oraz opóźnień, gdy agencja je zgłosi.",
      },
      {
        question: "Gdzie zobaczę skąd startuje rakieta?",
        answer:
          "Przy każdym starcie podajemy platformę i kosmodrom. Mapę platform startowych i pozycję ISS znajdziesz w ISS trackerze na /mapa.",
      },
    ],
    relatedToolIds: ["iss-tracker", "launch-calendar", "aurora-terminal"],
    ogImageAlt: "Starty rakiet · harmonogram i odliczanie na żywo",
    sitemapPriority: 0.92,
    sitemapChangeFrequency: "hourly",
  },
  "launch-calendar": {
    id: "launch-calendar",
    path: "/kalendarz",
    title: "Harmonogram startów rakiet · terminy i odliczanie",
    headline: "Harmonogram startów rakiet",
    description:
      "Kalendarz startów rakiet z terminami NET, oknami startowymi i odliczaniem — przejrzysta oś czasu nadchodzących misji kosmicznych.",
    longDescription:
      "Oś czasu nadchodzących startów rakiet w jednym widoku. Sprawdź daty, agencje i misje, a potem przejdź do pełnej listy startów lub mapy ISS.",
    keywords: [
      "harmonogram startów",
      "kalendarz startów rakiet",
      "terminy startów",
      "start rakiety kiedy",
      "NET start rakiety",
      "plan startów SpaceX",
      "nadchodzące misje kosmiczne",
    ],
    featureList: [
      "Oś czasu nadchodzących startów",
      "Terminy NET i okna startowe",
      "Skrót do pełnego harmonogramu /starty",
    ],
    faq: [
      {
        question: "Czym różni się kalendarz od strony Starty?",
        answer:
          "Kalendarz pokazuje terminy na osi czasu, a strona Starty — pełne karty misji z odliczaniem, zdjęciami i kontekstem.",
      },
    ],
    relatedToolIds: ["rocket-launches", "iss-tracker"],
    ogImageAlt: "Harmonogram startów rakiet · kalendarz misji",
    sitemapPriority: 0.9,
    sitemapChangeFrequency: "hourly",
  },
};

export function getInteractiveTool(id: InteractiveToolId): InteractiveToolSeo {
  return INTERACTIVE_TOOLS[id];
}

export function getInteractiveToolByPath(path: string): InteractiveToolSeo | null {
  return (
    Object.values(INTERACTIVE_TOOLS).find((tool) => tool.path === path) ?? null
  );
}

export function getRelatedTools(id: InteractiveToolId): InteractiveToolSeo[] {
  const tool = INTERACTIVE_TOOLS[id];
  return tool.relatedToolIds.map((relatedId) => INTERACTIVE_TOOLS[relatedId]);
}

/** Ścieżki narzędzi live — wyższy priorytet w sitemap. */
export const INTERACTIVE_TOOL_PATHS = Object.values(INTERACTIVE_TOOLS).map(
  (t) => t.path,
);
