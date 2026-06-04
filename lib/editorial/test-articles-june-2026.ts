/**
 * Dwa artykuły redakcyjne WSS (czerwiec 2026) — źródła faktów: NASA, SpaceNews.
 * Status domyślny: REVIEW (publikacja ręczna w CMS).
 */

export type EditorialDraft = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  contextNote: string;
  categorySlug: "misje" | "astronomia" | "technologie";
  tags: string[];
  coverImage: string;
  coverImageCredit: string;
  source: string;
  originalUrl: string;
  readingTime: number;
  featured?: boolean;
  heroPosition?: number;
};

export const EDITORIAL_TEST_ARTICLES_JUNE_2026: EditorialDraft[] = [
  {
    slug: "roman-space-telescope-start-30-sierpnia-2026",
    title:
      "Roman wystartuje 30 sierpnia: teleskop, który zmapuje wszechświat szybciej niż Hubble",
    subtitle:
      "NASA przyspiesza start Nancy Grace Roman Space Telescope o osiem miesięcy — Falcon Heavy i punkt L2 przygotowują się na erę panoramicznej astronomii w podczerwieni.",
    excerpt:
      "Teleskop Roman ma wynieść na orbitę około 8 ton instrumentów i rozpocząć pięcioletnią misję badania ciemnej energii, egzoplanet i struktury Galaktyki — z polem widzenia setki razy większym niż u Hubble’a.",
    content: [
      "Amerykańska agencja kosmiczna oficjalnie ustaliła datę startu Nancy Grace Roman Space Telescope na **30 sierpnia 2026**. To kolejne przyspieszenie w harmonogramie: jeszcze na początku roku mówiło się o terminie pod koniec 2027, potem o wczesnym wrześniu, a teraz zespół misji jest już w fazie ostatnich czynności przed transportem obserwatorium z Goddard Space Flight Center na Florydę.",
      "Roman to odpowiedź NASA na pytanie, jak badaczom uda się pogodzić szeroki obraz nieba z wysoką czułością w podczerwieni. Podstawowe lustro ma średnicę około 2,4 metra — mniejsze niż u Jamesa Webba — ale prawdziwą przewagą jest **pole widzenia**: jednym ujęciem Roman obejmie obszar setki razy większy niż typowe zdjęcie Hubble’a. W praktyce oznacza to, że w ciągu kilku lat misji można przeprowadzić pasmowe mapowanie nieba, które wcześniej zajęłoby dekadę obserwacji punktowych.",
      "Start zaplanowano na rakietę **SpaceX Falcon Heavy** z Kennedy Space Center. Po wyniesieniu Roman popłynie do **drugiego punktu Lagrange’a L2** — tej samej „strefy parkingowej” co Webb, około 1,5 mln km od Ziemi w kierunku od Słońca. Tam stabilna termika i minimalne zakłócenia świetlne pozwolą prowadzić długie serie pomiarów bez przerywania obserwacji przez cień Ziemi.",
      "W ostatnich tygodniach przed startem inżynierowie pakują satelitę do transportu, sprawdzą stan po drodze na Florydę, przeprowadzą testy z zasilaniem, załadują około **1100 litrów hydrazyny** i połączą obserwatorium z adapterem rakiety. Następnie Roman trafi pod osłonę fairingu Falcon Heavy i na pad 39A. Agencja podkreśla, że choć misja została zaprojektowana pod badania ciemnej energii, ciemnej materii i egzoplanet, jej dane będą użyteczne dla praktycznie każdej dziedziny astronomii — od mapowania galaktyk po poszukiwanie transientów.",
      "Dla polskich odbiorców newsów kosmicznych Roman to ważny sygnał: **nie koniec ery teleskopów**, lecz uzupełnienie Webb’a. Webb wciąż będzie „lupą” na wybrane obiekty, Roman — **kamerą szerokokątną**, która wskaże, gdzie warto celować dokładniej. Jeśli start utrzyma się w sierpniu mimo letniej pogody na Przylądku, już jesienią 2026 możemy zobaczyć pierwsze kalibracyjne obrazy, a pełna nauka ruszy w 2027.",
    ].join("\n\n"),
    contextNote:
      "Roman (dawniej WFIRST) był planowany latami jako następca idei szerokopolowego teleskopu po odwołaniu JWST-owego poprzednika. Dziś misja jest spoiwem między programem flagowym NASA a szybkim odkrywaniem zjawisk przejściowych — w tym egzoplanet metodą mikro soczewkowania grawitacyjnej, gdzie Roman ma znacząco zwiększyć liczbę kandydatów w porównaniu z misjami naziemnymi.",
    categorySlug: "misje",
    tags: ["NASA", "Roman", "SpaceX", "Falcon Heavy", "teleskop", "L2", "James Webb"],
    coverImage:
      "https://assets.science.nasa.gov/content/dam/science/missions/roman/Roman%20Space%20Telescope/rs0275-006-crop-20.png",
    coverImageCredit: "NASA / Goddard Space Flight Center",
    source: "NASA Science",
    originalUrl:
      "https://science.nasa.gov/blogs/roman/2026/06/03/hello-world-nasa-shares-new-home-for-roman-space-telescope-updates/",
    readingTime: 6,
    featured: true,
    heroPosition: 1,
  },
  {
    slug: "nasa-zamyka-misje-maven-na-marssie",
    title:
      "NASA zamyka MAVEN po ponad dekadzie: Mars stracił kluczowy „laboratorium atmosfery”",
    subtitle:
      "Orbiter MAVEN milczy od grudnia 2025 — agencja formalnie kończy misję, ale cztery inne satelity nadal łączą łaziki z Ziemią. Na horyzoncie sieć MTN za 700 mln USD.",
    excerpt:
      "Misja MAVEN badała, jak atmosfera Marsa ucieka w kosmos pod wpływem wiatru słonecznego. NASA ogłosiła jej zakończenie 3 czerwca 2026 po uznaniu sondy za nie do odzyskania.",
    content: [
      "NASA oficjalnie **zakończyła misję MAVEN** (Mars Atmosphere and Volatile Evolution) — orbiter, który od września 2014 roku krążył wokół Marsa i mierzył ucieczkę gazów z górnej atmosfery planety. Decyzja zapadła 3 czerwca 2026, po ponad pół roku bez kontaktu: sonda przestała odpowiadać po anomalii w **grudniu 2025**, a komisja uznała, że jej odzyskanie nie jest realne.",
      "MAVEN nie był „kolejnym zdjęciowym” satelitą Marsa. Jego instrumenty śledziły **jonosferę i krawędź atmosfery**, pokazując, jak burze słoneczne i wiatr słoneczny przyspieszają utratę wody i CO₂ w przestrzeń kosmiczną. Te dane łączą się bezpośrednio z pytaniem, **dlaczego Mars, który kiedyś mógł być bardziej wilgotny, dziś jest suchą, zimną pustynią** — kontekstem dla przyszłych misji załogowych i poszukiwań śladów życia.",
      "Koniec MAVEN nie oznacza jednak blackoutu na Marsie. NASA podkreśla, że **cztery orbiter-y nadal działają jako stacje przekaźnikowe**: Mars Odyssey, Mars Reconnaissance Orbiter oraz europejskie Mars Express i Trace Gas Orbiter. Łaziki i stacje naziemne mogą nadal przesyłać dane, choć zespoły musiały lekko dostosować harmonogramy łączności — bez „deficytu naukowego” w skali całego programu.",
      "Strata MAVEN uderza w inny segment programu: **długoterminowy monitoring pogody kosmicznej i atmosfery w czasie rzeczywistym**. Właśnie dlatego Kongres USA przewidział w pakiecie budżetowym **700 mln USD na Mars Telecommunications Network (MTN)** — misję łącznościową z terminem startu do końca **2028**. W maju 2026 NASA opublikowała finalne zapytanie ofertowe; propozycje składane są do **15 czerwca**, a kontrakt ma zostać podpisany jesienią.",
      "MAVEN pozostanie na orbicie Marsa jeszcze **50–100 lat**, zanim wejdzie w atmosferę. Zespół przygotuje prognozę trajektorii, by inne misje unikały zbliżeń. Dla czytelników WSS to ważna lekcja programowa: **Mars nie jest jednym satelitą**, lecz ekosystemem orbitów — gdy jeden instrument odpada, nauka może trwać, ale infrastruktura wymaga planu B. MTN ma być właśnie tym planem na następną dekadę.",
    ].join("\n\n"),
    contextNote:
      "MAVEN uzupełniał dane z łazików i MRO: podczas gdy kamery patrzą na skały, MAVEN patrzył na „wiatr” ponad nimi. Bez takich misji modele klimatu Marsa tracą kotwicę w czasie — a to wraca przy planowaniu lądowań załogowych i ocenie radiacji podczas burz słonecznych.",
    categorySlug: "misje",
    tags: ["NASA", "MAVEN", "Mars", "atmosfera", "MTN", "ESA", "orbiter"],
    coverImage:
      "https://www.nasa.gov/wp-content/uploads/2023/03/maven-orbit-mars-16.jpg",
    coverImageCredit: "NASA / GSFC",
    source: "SpaceNews",
    originalUrl: "https://spacenews.com/nasa-declares-end-to-maven-mars-mission/",
    readingTime: 5,
    featured: false,
    heroPosition: 0,
  },
];
