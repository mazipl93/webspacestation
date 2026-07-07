/** SEO + discovery dla narzędzi live WSS (ISS, zorza, starty). */

export type InteractiveToolId =
  | "iss-tracker"
  | "iss-globe-tracker"
  | "aurora-terminal"
  | "rocket-launches";

export type InteractiveToolSeo = {
  id: InteractiveToolId;
  path: `/${string}`;
  /** Tytuł karty / OG (bez sufiksu serwisu). */
  title: string;
  /** Nagłówek H1 na stronie. */
  headline: string;
  /** Meta description (Google, OG, Twitter). */
  description: string;
  longDescription: string;
  /** Akapit pod schema.org WebApplication.abstract (tylko JSON-LD). */
  abstract?: string;
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
      "Sprawdź, gdzie nad Ziemią leci ISS w tej chwili. Mapa pokazuje pozycję stacji na orbicie, trasę lotu i miejsca planowanych startów rakiet. Dane odświeżane na bieżąco, bez instalacji aplikacji.",
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
          "Tak. ISS bywa widoczna o zmierzchu i świcie jako jasny punkt przelatujący po niebie. Tracker pomaga ustalić, nad którym regionem Ziemi stacja leci w danej chwili.",
      },
      {
        question: "Czy mapa pokazuje też starty rakiet?",
        answer:
          "Tak. Na tej samej mapie zaznaczone są platformy startowe i nadchodzące starty. Pełny harmonogram z odliczaniem znajdziesz w sekcji Starty rakiet.",
      },
    ],
    relatedToolIds: ["iss-globe-tracker", "rocket-launches", "aurora-terminal"],
    ogImageAlt: "ISS tracker na żywo · mapa pozycji Międzynarodowej Stacji Kosmicznej",
    sitemapPriority: 0.95,
    sitemapChangeFrequency: "hourly",
  },
  "iss-globe-tracker": {
    id: "iss-globe-tracker",
    path: "/sledziss",
    title: "Śledź ISS · model Ziemi 3D na żywo",
    headline: "Śledź ISS · model Ziemi 3D",
    description:
      "Gdzie jest ISS teraz? Trójwymiarowy model Ziemi z pozycją stacji, orbitą, prędkością i przelotami nad Twoją lokalizacją. Darmowy tracker w przeglądarce.",
    longDescription:
      "Obracaj model Ziemi i obserwuj ISS na wysokości około 400 km. Włącz śledzenie kamery, sprawdź wysokość i prędkość stacji oraz zaplanuj obserwację dzięki liście przelotów w panelu bocznym.",
    abstract:
      "Interaktywny tracker Międzynarodowej Stacji Kosmicznej w trójwymiarze. Strona pokazuje aktualną pozycję ISS na orbicie około 408 km nad powierzchnią Ziemi, trasę orbity, telemetrię na żywo oraz nadchodzące przeloty widoczne z wybranej lokalizacji w Polsce. Narzędzie działa w przeglądarce na komputerze i telefonie, bez instalacji aplikacji.",
    keywords: [
      "śledź ISS",
      "ISS tracker",
      "gdzie jest ISS",
      "gdzie jest ISS teraz",
      "ISS na żywo",
      "pozycja ISS",
      "orbita ISS",
      "Międzynarodowa Stacja Kosmiczna",
      "model Ziemi 3D",
      "ISS 3D",
      "tracker stacji kosmicznej",
      "ISS teraz",
      "przelot ISS",
      "przelot ISS nad Polską",
      "obserwacja ISS",
      "stacja kosmiczna na żywo",
      "ISS wysokość prędkość",
    ],
    featureList: [
      "Trójwymiarowy model Ziemi z teksturą NASA Blue Marble",
      "Pozycja ISS na orbicie aktualizowana co kilka sekund",
      "Orbita stacji i zasięg horyzontu geometrycznego",
      "Telemetria: współrzędne, wysokość, prędkość, czas obiegu",
      "Przeloty ISS nad wybraną lokalizacją z oceną widoczności",
      "Obsługa telefonu: obracanie, pinch-zoom, śledzenie kamery",
    ],
    faq: [
      {
        question: "Gdzie jest ISS teraz?",
        answer:
          "Na stronie /sledziss zobaczysz bieżącą pozycję Międzynarodowej Stacji Kosmicznej na modelu Ziemi 3D wraz z wysokością, prędkością i współrzędnymi geograficznymi. Dane odświeżają się automatycznie co około 5 sekund.",
      },
      {
        question: "Jak dokładna jest pozycja ISS na modelu?",
        answer:
          "Pozycja pochodzi z elementów orbitalnych TLE satelity NORAD 25544 i propagatora SGP4, tego samego standardu co w trackera NASA i N2YO. Typowa dokładność to około jeden kilometr.",
      },
      {
        question: "Czym różni się model 3D od mapy 2D?",
        answer:
          "Model Ziemi pokazuje ISS w przestrzeni trójwymiarowej nad kulą planety z orbitą na właściwej wysokości około 408 km. Mapa 2D pod adresem /mapa pokazuje ground track na płaskiej mapie oraz platformy startowe rakiet.",
      },
      {
        question: "Czy mogę zobaczyć ISS gołym okiem?",
        answer:
          "Tak, przy sprzyjających warunkach ISS wygląda jak jasna gwiazda przelatująca po niebie. W panelu bocznym wybierz swoje miasto i sprawdź nadchodzące przeloty z oceną widoczności.",
      },
      {
        question: "Czy tracker ISS działa na telefonie?",
        answer:
          "Tak. Model Ziemi obsługuje dotyk: możesz obracać widok, przybliżać dwoma palcami i włączyć śledzenie kamery za stacją jednym przyciskiem.",
      },
    ],
    relatedToolIds: ["iss-tracker", "rocket-launches", "aurora-terminal"],
    ogImageAlt: "Śledź ISS na trójwymiarowym modelu Ziemi z orbitą stacji kosmicznej na żywo",
    sitemapPriority: 0.94,
    sitemapChangeFrequency: "hourly",
  },
  "aurora-terminal": {
    id: "aurora-terminal",
    path: "/zorza",
    title: "Czy dziś będzie zorza? · indeks Kp na żywo",
    headline: "Terminal zorzy polarnej · space weather na żywo",
    description:
      "Monitoruj zorzę polarną na żywo: indeks geomagnetyczny Kp, wiatr słoneczny Bz, prognoza burz i mapa widoczności zorzy w Polsce i na świecie. Dane NOAA.",
    longDescription:
      "Sprawdź szansę na zorzę dziś i w najbliższych godzinach. Terminal łączy indeks Kp, parametry wiatru słonecznego, prognozę NOAA i mapę owali auroralnych. Narzędzie dla łowców zórz i fotografów nocnego nieba.",
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
    headline: "Starty rakiet",
    description:
      "Harmonogram nadchodzących startów rakiet: SpaceX, NASA, ESA i inne. Daty NET, okna startowe, odliczanie na żywo i kontekst każdej misji.",
    longDescription:
      "Śledź, kiedy wystartuje następna rakieta. Karty misji z odliczaniem na żywo, datami NET, informacjami o rakiecie i platformie startowej oraz powiązanymi aktualnościami WSS.",
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
      "NET start rakiety",
      "plan startów SpaceX",
      "launch schedule",
    ],
    featureList: [
      "Nadchodzące starty z odliczaniem na żywo",
      "Daty NET i okna startowe przy każdej misji",
      "Informacje o misji, rakiecie i platformie",
      "Powiązane aktualności i kontekst redakcyjny",
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
          "Tak. Licznik aktualizuje się automatycznie i uwzględnia fazy odliczania, okna startowego oraz opóźnień, gdy agencja je zgłosi.",
      },
      {
        question: "Gdzie zobaczę skąd startuje rakieta?",
        answer:
          "Przy każdym starcie podajemy platformę i kosmodrom. Mapę platform startowych i pozycję ISS znajdziesz w ISS trackerze na /mapa.",
      },
    ],
    relatedToolIds: ["iss-tracker", "aurora-terminal"],
    ogImageAlt: "Starty rakiet · harmonogram i odliczanie na żywo",
    sitemapPriority: 0.92,
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
