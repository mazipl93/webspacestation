/**
 * Artykuły redakcyjne WSS (czerwiec 2026) — newsroom PL, 800–1200+ słów.
 * Źródła faktów: NASA, ESA, SpaceNews (atrybucja w polu source / originalUrl).
 * Domyślny status po seedzie: REVIEW (publikacja ręczna w CMS).
 */

import { nasaCoverUrl } from "./nasa-cover";

export type EditorialDraft = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  contextNote: string;
  categorySlug: "misje" | "astronomia" | "technologie" | "rozrywka";
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
      "NASA przyspiesza start Nancy Grace Roman Space Telescope o osiem miesięcy — Falcon Heavy, punkt L2 i pięcioletnia misja panoramicznej astronomii w podczerwieni.",
    excerpt:
      "Amerykańska agencja kosmiczna ustaliła start Nancy Grace Roman Space Telescope na 30 sierpnia 2026 — osiem miesięcy przed formalnym terminem gotowości i wcześniej niż wczesny wrzesień z kwietnia. Obserwatorium ma wynieść na orbitę około 8 ton instrumentów, zatankować 1100 litrów hydrazyny i rozpocząć misję, której celem są ciemna energia, ciemna materia oraz tysiące nowych egzoplanet — z polem widzenia setki razy większym niż typowe ujęcie Hubble’a.",
    content: [
      "NASA oficjalnie potwierdziła, że Nancy Grace Roman Space Telescope wystartuje 30 sierpnia 2026 z Kennedy Space Center na rakiecie SpaceX Falcon Heavy. Informacja pojawiła się 3 czerwca na inauguracyjnym blogu misji Roman — agencja podkreśla, że to kolejne przyspieszenie: formalna data gotowości do startu (Launch Readiness Date) wynosiła maj 2027, w kwietniu mówiono o wczesnym wrześniu, a teraz zespół ma mniej niż trzy miesiące do finalnych czynności na Przylądku Kennedy’ego.",
      "Roman to odpowiedź na dekadowe pytanie astronomów: jak pogodzić szeroki obraz nieba z czułością w podczerwieni. Główne lustro ma średnicę 2,4 metra — podobnie jak pierwotne lustro Hubble’a, znacznie mniej niż 6,5 m Jamesa Webba — lecz przewaga Roman leży w polu widzenia. Instrument Wide-Field Instrument (WFI) łączy detektory o rozdzielczości porównywalnej z nowoczesnymi kamerami survey (rząd 300 megapikseli efektywnej rozdzielczości) z polem około 0,28 stopnia kwadratowego na jednym ujęciu. Dla porównania: typowe pole Hubble’a to ułamek stopnia — Roman w jednej „klatce” widzi obszar, na który Hubble musiałby patrzeć setki razy dłużej. W ciągu pięcioletniej misji podstawowej zespół planuje pasmowe mapowanie, które wcześniej wymagałoby dekad obserwacji punktowych i dziesiątek lat planowania schedulera.",
      "Misja ma koszt cyklu życia około 4,3 mld USD i — rzadkość w programach flagowych — pozostaje w budżecie przy jednoczesnym wyprzedzeniu harmonogramu. Obserwatorium ukończono i przetestowano w Goddard Space Flight Center w Maryland; w czerwcu inżynierowie pakują satelitę do transportu na Florydę, gdzie Roman trafi do Payload Hazardous Servicing Facility. Tam czekają inspekcja po drodze, testy z zasilaniem, próby generalne startu, załadunek około 290 galonów (1100 litrów) hydrazyny oraz montaż na adapterze Falcon Heavy.",
      "Po starcie Roman popłynie do drugiego punktu Lagrange’a L2 — tej samej „strefy parkingowej” co Webb, około 1,5 mln km od Ziemi w kierunku od Słońca, czyli cztery razy dalej niż Księżyc. Stabilna termika i minimalne zakłócenia świetlne pozwolą prowadzić długie serie pomiarów bez przerywania obserwacji cieniem Ziemi. Agencja szacuje, że zapas paliwa wystarczy na co najmniej 10 lat pracy, choć misja podstawowa trwa pięć lat.",
      "Naukowo Roman został zaprojektowany pod ciemną energię i ciemną materię — badania rozkładu masy w Wszechświecie metodami mikrosoczewkowania i pomiarami odległych supernowych — oraz pod egzoplanety, w tym planety o masie Ziemi wykrywane przez zjawiska przejściowe i soczewkowanie grawitacyjne. Do tego dochodzi koronograf Coronagraph Instrument (CGI), testujący techniki tłumienia światła gwiazdy macierzystej, by bezpośrednio obserwować dyski protoplanetarne. NASA podkreśla jednak, że „nieprzewidziana” zdolność obserwacyjna oznacza użyteczność dla praktycznie każdej dziedziny — od map galaktyk po transjenty i czarne dory.",
      "Dla porównania z Webbem: Webb pozostaje lupą na wybrane obiekty w podczerwieni bliskiej i średniej, Roman będzie kamerą szerokokątną, która wskaże, gdzie warto celować dokładniej. Oba teleskopy uzupełniają się czasowo i naukowo — Roman ma dostarczyć katalogi i statystyki, Webb — spektroskopię wysokiej rozdzielczości wybranych celów. Jeśli start utrzyma się pod koniec sierpnia mimo letniej pogody na Florydzie, pierwsze obrazy kalibracyjne mogą pojawić się jesienią 2026, a pełna nauka ruszy w 2027.",
      "Koronograf Coronagraph Instrument (CGI) ma w misji demonstracyjnej pokazać, że bezpośrednie obrazy egzoplanet i dysków protoplanetarnych są wykonalne w skali kosmicznej — technologia kluczowa dla przyszłych teleskopów poszukujących biosygnatur. Roman będzie też maszyną do transjentów: zmienne gwiazdy, supernowe, aktywne jądra galaktyk i obiekty przejściowe wykryte w survey mogą być natychmiast skierowane do dalszych obserwacji Webbem lub teleskopami naziemnymi.",
      "Harmonogram na Przylądku Kennedy’ego jest napięty jak w misjach flagowych: po załadunku paliwa Roman trafi pod fairing Falcon Heavy, potem do hangaru na integrację z rakietą i rollout na Pad 39A — ten sam pas, z którego startowały misje księżycowe Apollo i współczesny program Artemis. Termin 30 sierpnia ogłoszono m.in. podczas spotkania National Academies (Joel Montalbano, Launch Services Program); administrator Jared Isaacman od kwietnia sugerował wcześniejszy start niż wrzesień — letnia pogoda na Florydzie nadal może przesunąć okno o kilka dni.",
      "W tle polityki naukowej NASA wiosną 2026 pojawił się projekt budżetu FY2027 z drastycznymi cięciami programów astrofizyki (w tym propozycje anulowania części misji rozszerzonych). Przedstawiciele Science Mission Directorate podkreślają, że obecny rok fiskalny finansuje doprowadzenie Roman na pas startowy — to ważne rozróżnienie dla czytelników: start w 2026 nie „rozwiązuje” debaty o budżecie 2027, ale pokazuje, że misja zaprojektowana w 2010 jako WFIRST dotarła do mety technicznej.",
      "Parametry techniczne potwierdzają skalę misji: masa samego teleskopu to około 8000 kg, z paliwem startowym łącznie około 10 500 kg; moc układu zasilania 4,5 kW; dane z orbity popłyną m.in. pasmem Ka z przepustowością rzędu 290 Mbit/s (TT&C w paśmie S). To nie jest lekki satelita CubeSat — Roman jest najcięższym ładunkiem astrofizycznym na manifestach Falcon Heavy w tej dekadzie i wymaga pełnego łańcucha testów PHSF na Florydzie.",
      "Dla czytelnika WSS sierpniowy start Roman oznacza sezon „podwójnego teleskopu” w nagłówkach: Webb dostarcza spektroskopię i detale, Roman — statystykę i mapy. Śledź blog misji na science.nasa.gov, sekcję Astronomia na portalu oraz kalendarz startów w Odkrywaj; po publikacji w CMS ustaw okładkę NASA (object-cover) i sprawdź JSON-LD NewsArticle w Rich Results Test przed wrzuceniem do Google Search Console.",
    ].join("\n\n"),
    contextNote:
      "Roman (dawniej WFIRST) był priorytetem dekady 2010 w amerykańskiej astronomii i spoiwem między Hubble’em a przyszłym Habitable Worlds Observatory. Na WSS misja pokazuje trend: agencje wracają do teleskopów „survey” — szerokie mapy + AI w analizie danych — zamiast wyłącznie pojedynczych, drogich punktów obserwacji. Po starcie Roman stanie się jednym z filarów sekcji Astronomia i Tematu tygodnia przy pierwszych zdjęciach z L2.",
    categorySlug: "astronomia",
    tags: [
      "NASA",
      "Roman",
      "SpaceX",
      "Falcon Heavy",
      "teleskop",
      "L2",
      "James Webb",
      "egzoplanety",
      "ciemna energia",
    ],
    coverImage: nasaCoverUrl("PIA25434"),
    coverImageCredit: "NASA / Goddard Space Flight Center",
    source: "NASA Science",
    originalUrl:
      "https://science.nasa.gov/blogs/roman/2026/06/03/hello-world-nasa-shares-new-home-for-roman-space-telescope-updates/",
    readingTime: 10,
    featured: true,
    heroPosition: 1,
  },
  {
    slug: "nasa-zamyka-misje-maven-na-marssie",
    title:
      "NASA zamyka MAVEN po ponad dekadzie: Mars stracił kluczowy „laboratorium atmosfery”",
    subtitle:
      "Orbiter milczy od grudnia 2025 — agencja formalnie kończy misję 3 czerwca 2026. Na orbicie zostają cztery przekaźniki; Kongres przewiduje 700 mln USD na sieć MTN.",
    excerpt:
      "Misja MAVEN (Mars Atmosphere and Volatile Evolution) badała od 2014 roku, jak wiatr słoneczny i burze kosmiczne odpychają atmosferę Marsa w przestrzeń. NASA ogłosiła zakończenie programu 3 czerwca 2026 po uznaniu sondy za nie do odzyskania — sześć miesięcy po utracie sygnału podczas przelotu za planetą.",
    content: [
      "NASA oficjalnie zakończyła misję MAVEN 3 czerwca 2026 podczas telekonferencji prasowej, potwierdzając wnioski tablicy anomalii (Anomaly Review Board): sonda, która krążyła wokół Marsa od września 2014, nie wróci do łączności ani badań. Ostatni kontakt nastąpił 6 grudnia 2025, gdy MAVEN zniknął za tarczą Marsa widzianą z Ziemi — przed wejściem w cień telemetry pokazywała normalną pracę, lecz sieć Deep Space Network nie odebrała sygnału po wyjściu zza planety (przelot trwa 20–30 minut). Decyzja kończy miesiące prób odzyskania, nie jest nagłym wyłączeniem aparatury z jednego dnia.",
      "W lutym 2026 NASA zebrała tablicę śledczą. Na podstawie fragmentu telemetrii z odbiorników open-loop ustalono, że statek wszedł w safe mode i obracał się z prędkością około 2,7 obrotu na minutę — podczas gdy w normalnej pracy MAVEN jest stabilizowany bezwładnościowo i nie powinien się obracać. Rotacja odcięła panele słoneczne od światła, wyczerpała baterie w ciągu kilku godzin i pozostawiła sondę w stanie nie do odzyskania. Przyczyna pierwotna nadal jest badana; finalny raport tablicy ma pojawić się później w 2026.",
      "MAVEN nie był „kolejnym satelitą zdjęciowym”. Wystrzelony 18 listopada 2013 na rakiecie Atlas V, wszedł na orbitę Marsa 21 września 2014 jako pierwsza misja poświęcona wyłącznie ewolucji atmosfery. Planowana misja podstawowa trwała jeden rok; sonda pracowała ponad 11 lat, przekraczając oczekiwania o czynnik dziesięciu. Mierzyła jonosferę, interakcje z wiatrem słonecznym i tempo ucieczki gazów — spektrometry i magnetometr pokazały, jak burze słoneczne przyspieszają utratę wody i CO₂. Dane łączą się z pytaniem, dlaczego Mars, który mógł być bardziej wilgotny, dziś jest suchą pustynią, i jak planować misje załogowe pod kątem radiacji oraz ochrony załogi.",
      "W latach szczytowych MAVEN był najbardziej pożądanym przekaźnikiem dla misji powierzchniowych — miał orbitę i anteny dostosowane do dużych paczek danych, gdy MRO był zajęty obrazowaniem lub gdy geometrycznie leżał niewygodnie względem Ziemi. Utrata tego węzła nie blokuje codziennej pracy łazików, ale wydłuża okna oczekiwania na przesył i zmusza planistów do trudniejszych kompromisów między nauką powierzchni a telemetrią.",
      "Koniec MAVEN uderza też w infrastrukturę łączności. Przez lata orbiter pełnił rolę przekaźnika dla łazików i stacji naziemnych. NASA podkreśla, że cztery orbiter-y nadal działają: Mars Odyssey, Mars Reconnaissance Orbiter oraz europejskie Mars Express i Trace Gas Orbiter (ESA). Zespoły naziemne lekko dostosowały harmonogramy przesyłu danych — agencja nie prognozuje „deficytu naukowego” dla całego programu Mars, choć traci się długoterminowy monitoring pogody kosmicznej w czasie rzeczywistym z orbity MAVEN.",
      "W maju 2026 NASA opublikowała finalne zapytanie ofertowe na Mars Telecommunications Network (MTN) — misję łącznościową, którą Kongres USA zasilił kwotą 700 mln USD w pakiecie budżetowym. Propozycje wykonawców składane są do 15 czerwca 2026, kontrakt ma zostać podpisany jesienią, a start planowany jest do końca 2028. MTN ma zastąpić lukę po starzejących się przekaźnikach i przygotować sieć pod większe przepływy danych z powierzchni.",
      "MAVEN pozostanie na orbicie eliptycznej (ok. 200–4000 km nad powierzchnią) jeszcze 50–100 lat, zanim wejdzie w atmosferę. Zespół przygotuje długoterminową propagację trajektorii, by inne misje unikały zbliżeń. NASA rozpoczęła standardową procedurę dekomisji i archiwizacji pełnego zbioru danych dla społeczności naukowej — według dyrektor dywizji nauk planetarnych Louise Prockter dane MAVEN „będą informować o Marsie przez dekady”, w tym o ochronie radiacyjnej przyszłych astronautów.",
      "Śledztwo w sprawie awarii toczy się równolegle z koniunkcją słoneczną Mars–Ziemia (okres, gdy Słońce stoi między planetami i ogranicza łączność). Już w styczniu 2026 Louise Prockter mówiła naukowcom, że odzyskanie MAVEN jest „bardzo mało prawdopodobne” — formalne zamknięcie 3 czerwca było więc administracyjnym domknięciem miesięcy prób, nie nagłą decyzją z jednego dnia.",
      "Naukowo MAVEN dostarczył pierwszy bezpośredni obraz jak wiatr słoneczny wpycha się w górną atmosferę i przyspiesza cząstki w kosmos. To uzupełnia dane geologów z łazików Perseverance i Curiosity: skały mówią, co było na powierzchni, MAVEN — co działo się nad nimi przez miliardy lat. Archiwum misji trafi do publicznych repozytoriów; zespoły modelowania klimatu Marsa będą z niego korzystać przy planowaniu lądowań i habitatów.",
      "Program Mars Sample Return i załogowe lądowania wciąż potrzebują modeli radiacji i pogody kosmicznej — bez MAVEN zespół będzie korzystał z archiwum i z pomiarów MAVEN-ów następców dopiero po starcie MTN pod koniec dekady. Tymczasem łaziki Curiosity i Perseverance oraz sonda InSight (dane historyczne) pozostają kotwicą geologiczną, a TGO ESA — chemii atmosfery; to mozaika, nie jeden punkt awarii.",
      "Dla czytelnika WSS lekcja programowa jest prosta: Mars to ekosystem orbitów, nie jeden satelita. Utrata MAVEN nie zatrzymuje łazików, ale przypomina, że każda przerwa w monitoringu atmosfery i łączności wymaga planu B — stąd MTN i europejskie orbiter-y ESA. Po publikacji sprawdź w CMS podpis okładki (NASA/GSFC) i sekcję Kontekst WSS na żywo w podglądzie — to wzorzec jakości przed masową redakcją kolejki REVIEW.",
    ].join("\n\n"),
    contextNote:
      "MAVEN uzupełniał obrazy z kamery MRO i chemii z TGO: podczas gdy łaziki patrzą na skały, MAVEN patrzył na „wiatr” nad nimi. Bez takich misji modele klimatu Marsa tracą kotwicę czasową — a to wraca przy planowaniu lądowań załogowych i ocenie skutków burz słonecznych. Na WSS łączymy to z panelem Odkrywaj (misje, mapa) i z nadchodzącą decyzją o MTN jako następnym kroku infrastruktury.",
    categorySlug: "misje",
    tags: ["NASA", "MAVEN", "Mars", "atmosfera", "MTN", "ESA", "orbiter", "Deep Space Network"],
    coverImage: nasaCoverUrl("PIA14761"),
    coverImageCredit: "NASA / GSFC",
    source: "NASA",
    originalUrl: "https://www.nasa.gov/news-release/nasa-says-farewell-to-maven-mars-mission-hosts-media-call-today/",
    readingTime: 10,
    featured: false,
    heroPosition: 0,
  },
  {
    slug: "artemis-ii-esm-esa-co-dalej-przed-rada-gateway-czerwiec-2026",
    title:
      "Artemis II zakończone sukcesem: europejski moduł serwisowy dowiódł się na Księżyc — co dalej po decyzji o Gateway?",
    subtitle:
      "Orion wrócił 10 kwietnia 2026 z ESA European Service Module. Dwa miesiące później Europa przed radą 11–12 czerwca szuka nowej roli po wstrzymaniu Lunar Gateway przez NASA.",
    excerpt:
      "Pierwszy załogowy lot poza orbitę Ziemi od Apollo 17 zakończył się 10 kwietnia 2026 wodowaniem Orion u wybrzeży San Diego. Napęd, prąd i życie załogi zapewniał zbudowany w Europie moduł serwisowy — techniczny sukces, który staje się argumentem w negocjacjach o przyszłości programu Artemis po marcowej decyzji NASA o wstrzymaniu Gateway.",
    content: [
      "Misja Artemis II zakończyła się 10 kwietnia 2026 o 20:07 czasu wschodniego USA (17:07 czasu lokalnego u wybrzeży Kalifornii), gdy kapsuła Orion wodowała w Pacyfiku u wybrzeży San Diego. Na pokładzie byli NASA Reid Wiseman (dowódca), Victor Glover (pilot), Christina Koch oraz Jeremy Hansen z Kanadyjskiej Agencji Kosmicznej (CSA) — pierwszy nie-Amerykanin lecący w programie Artemis. Lot trwał niespełna 10 dni; najdalszy punkt od domu to 252 756 mil (ok. 407 tys. km), a najbliższe podejście do Księżyca — 4067 mil (ok. 6545 km) nad powierzchnią.",
      "Nazwa kapsuły Integrity (Orion) i statek recovery USS John P. Murtha wpisują misję w tradycję programów załogowych — od wodowania przez wyciągnięcie załogi na „werandę” kapsuły po badania medyczne na pokładzie okrętu. To nie był krótki suborbitalny skok: załoga spędziła ponad tydzień w głębokiej przestrzeni, z pełnym cyklem przygotowania psychofizycznego i procedur awaryjnych, które teraz trafią do podręczników Artemis III.",
      "Start nastąpił 1 kwietnia 2026 o 18:35 czasu wschodniego z Pad 39B na Kennedy Space Center. Rakietą Space Launch System (SLS) o ciągu 8,8 mln funtów przy starcie Orion trafił na orbitę z precyzją, którą NASA opisała jako „punktową”. Drugiego dnia lotu moduł serwisowy wykonał główne odpalenie silnika, ustawiając trajektorię lotu wokół Księżyca metodą free return — po raz pierwszy od Apollo 17 (1972) załoga opuściła niską orbitę okołoziemską.",
      "Sercem technicznym misji był European Service Module (ESM) zbudowany pod kierownictwem ESA — głównie przez Airbus Defence and Space w Bremie, z udziałem firm z 13 krajów europejskich, około 20 głównych wykonawców i ponad 100 dostawców. ESM dostarczał powietrze i wodę, generował prąd z czterech paneli słonecznych, utrzymywał termikę i napędzał Orion na odcinku ponad 1 mln km w głębokiej przestrzeni. 20 minut po starcie rozłożono panele; około trzeciej godziny załoga przejęła sterowanie ręczne, ćwicząc manewry zbliżeniowe pod przyszłe lądowania.",
      "Precyzja ESM była na tyle wysoka, że dwa z trzech planowanych korekt trajektorii w drodze na Księżyc pominęto — oszczędność paliwa i dowód dojrzałości europejskiego segmentu. W dniu powrotu, 10 kwietnia, moduł serwisowy oddzielił się o 19:33 czasu wschodniego; kapsuła weszła w atmosferę, a ESM spalił się bezpiecznie nad Pacyfikiem na trajektorii zaprojektowanej tak, by żadne odłamki nie zagrażały lądowi ani żegludze. Załogę wyciągnięto na morzu, przewieziono helikopterem na USS John P. Murtha, a następnego dnia wrócili do Johnson Space Center w Houston.",
      "Lot nie był jednak wolny od uwag inżynierskich. NASA zgłosiła nieszczelności zaworów układu ciśnienia zbiorników paliwa w module serwisowym — nie zagrażały one manewrom w drodze na Księżyc i z powrotem, lecz 9 kwietnia urzędnicy wskazali, że przed Artemis IV (plan 2028) prawdopodobnie trzeba przeprojektować ten układ. To ważny kontekst dla europejskiego łańcucha dostaw: ESM musi ewoluować razem z wymaganiami NASA, nie tylko powtarzać konfigurację z Artemis II.",
      "Politycznie sukces Artemis II zderza się z 24 marca 2026, gdy NASA wstrzymała prace nad stacją Lunar Gateway na orbicie Księżyca — hubem, który miał obsługiwać załogi przed i po lądowaniach. Europa była zaangażowana w elementy I-Hab, Lunar View i Lunar Link. Dyrektor generalny ESA Josef Aschbacher zapowiedział, że na radzie ESA 11–12 czerwca 2026 w Paryżu przedstawi plan dalszych działań i scenariusze dla przemysłu — przy jednoczesnych rozmowach z Kanadą, Japonią i ZEA.",
      "Lot był testem systemu załogowego, nie lądowaniem: Orion nie wszedł na orbitę księżycową, lecz wykonał free return wokół naturalnego satelity Ziemi — wystarczająco blisko, by zweryfikować termikę, radiację i procedury powrotu. Administrator NASA Jared Isaacman po wodowaniu mówił o „początku” ery powrotu na Księżyc z lądowaniem w planach na 2028 (Artemis III/IV w zależności od harmonogramu), ale harmonogram zależy od budżetu i statusu Gateway.",
      "W czerwcu 2026 ESA i Kanada (CSA) intensyfikują dyplomację programową: wspólne oświadczenie z maja przygotowuje CM25 w Bremie (listopad), gdzie państwa członkowskie zadecydują o finansowaniu eksploracji na kolejne lata. Artemis II daje argument, że europejski moduł serwisowy jest elementem krytycznym, nie dodatkiem — ale nie rozwiązuje pytań, co zrobić z fabrykowanym sprzętem pod I-Hab po wstrzymaniu Gateway.",
      "Komunikaty ESA po wodowaniu podkreślają, że εpsilon (Sophie Adenot na ISS, luty 2026) i Artemis II tworzą ten sam narracyjny rok europejskiej obecności w kosmosie — od orbity okołoziemskiej po flyby Księżyca. To ważne dla czytelników śledzących polskie i europejskie sloty astronautów: Gateway był jedną ścieżką rotacji, nie jedyną możliwością lotu.",
      "Dla czytelnika WSS Artemis II oznacza: Europa ma twardy dowód kompetencji w misjach załogowych, ale architektura programu się zmienia. Sukces ESM nie automatycznie ratuje Gateway — decyzje padną na poziomie ministerialnym 11–12 czerwca i później w Bremie. Śledź sekcję Misje, mapę Odkrywaj i relacje na żywo z rady ESA; w CMS ten artykuł ma pełny lead, 9 akapitów i Kontekst WSS — nie skracaj go przy publikacji.",
    ].join("\n\n"),
    contextNote:
      "Artemis II zamyka pół wieku przerwy w lotach załogowych poza LEO, ale otwiera fazę „programu jako polityki”: budżet NASA FY2027 i anulowanie Gateway zmuszają ESA do przekwalifikowania miliardów euro kontraktów. Na WSS pokazujemy ten wątek jako most między sukcesem technicznym a radą czerwcową — bez sensacji, z datami i rolami partnerów.",
    categorySlug: "misje",
    tags: [
      "Artemis",
      "ESA",
      "Orion",
      "European Service Module",
      "NASA",
      "Księżyc",
      "Gateway",
      "SLS",
    ],
    coverImage: nasaCoverUrl("PIA23646"),
    coverImageCredit: "NASA / ESA",
    source: "ESA / NASA",
    originalUrl: "https://www.esa.int/Newsroom/Press_Releases/Splashdown_for_Artemis_II",
    readingTime: 11,
    featured: true,
    heroPosition: 2,
  },
  {
    slug: "esa-rada-czerwiec-2026-gateway-artemis-budzet-nasa",
    title:
      "Rada ESA w czerwcu 2026: Gateway wstrzymane, budżet NASA wisi — Europa szuka planu B",
    subtitle:
      "Po decyzji NASA z 24 marca i projekcie cięć science na FY2027 agencja w Paryżu ustala los modułów I-Hab, Lunar View i misji wspólnych z USA.",
    excerpt:
      "Europejska Agencja Kosmiczna spotyka się 11–12 czerwca 2026 w Paryżu, by odpowiedzieć na wstrzymanie Lunar Gateway i analizować skutki amerykańskiego projektu budżetu, który dotyka Orion, EnVision, LISA i wspólnych satelitów Earth observation. To pierwsza instytucjonalna reakcja na ekspozycję kontraktów wartych miliardy euro.",
    content: [
      "Kontekst europejski wykracza poza Księżyc: 12 lutego 2026 wystartowała Ariane 6 z czterema boosterami P120C — ESA traktuje to jako potwierdzenie autonomicznego dostępu do przestrzeni, równolegle do debaty o Gateway. W kwietniu 2026 ESA i Europejska Agencja Obrony (EDA) podpisały porozumienie o lukach w zdolnościach obserwacji Ziemi — sygnał, że budżety mogą płynąć także do programów bezpieczeństwa, gdy współpraca naukowa z USA się kurczy.",
      "11–12 czerwca 2026 w Paryżu obraduje Rada ESA — forum państw członkowskich finansujących europejskie programy kosmiczne. W centrum agendy nie jest kolejny start rakiety, lecz przekrojowa zmiana współpracy z NASA: marcowe wstrzymanie stacji Lunar Gateway oraz majowy projekt budżetu federalnego USA na rok fiskalny 2027, który — jeśli zostałby przyjęty w przedstawionej formie — drastycznie okroiłby astrofizykę i zmienił warunki programu Artemis.",
      "Gateway miała krążyć wokół Księżyca jako hub dla astronautów między lotami na powierzchnię. 24 marca 2026 NASA ogłosiła wstrzymanie prac nad tym segmentem architektury Artemis. Europa przygotowywała trzy główne wkłady: moduł habitacyjny I-Hab, reflektor komunikacyjny Lunar View oraz element Lunar Link. Według analiz branżowych (m.in. SpaceNews) w ekspozycji pozostaje rząd 4,4 mld USD podpisanych kontraktów między NASA, ESA i partnerami — bez potwierdzonej ramy „co budujemy zamiast tego”.",
      "Dyrektor generalny ESA Josef Aschbacher powiedział na Munich Space Summit, że agencja pracuje nad scenariuszami dla europejskiego przemysłu i przedstawi plan dalszych działań na radzie czerwcowej. Równolegle ESA utrzymuje kontakt z Kanadą, Japonią i Zjednoczonymi Emiratami Arabskimi — innymi partnerami Gateway. Umowy z NASA przewidują, że inwestycje partnerów są uwzględniane przy każdej ewolucji programu; teraz te rozmowy stały się pilne, nie teoretyczne.",
      "Techniczny kapitał negocjacyjny Europy wzmocnił sukces Artemis II z kwietnia 2026. European Service Module napędzał Orion, a lot zakończył się precyzyjnym wodowaniem — dowód, że europejski segment załogowy działa w misji krytycznej. W komunikatach ESA podkreśla się, że NASA zdefiniuje przyszłą architekturę lotów Artemis, a dopiero potem ESA negocjuje dostępne sloty dla astronautów i kontraktów — Gateway nie był jedyną ścieżką, ale był zaplanowanym flagowym wkładem.",
      "Drugi front to budżet NASA na FY2027 (projekt ogłoszony 30 maja 2026). Po spotkaniu Rady 12 czerwca dyrektor nauki ESA Carole Mundell mówiła o „głębokiej debacie” nad skutkami dla 19 wspólnych misji naukowych. Trzy programy ESA wymagają już na papierze „recovery actions”, jeśli cięcia wejdą w życie: misja do Wenus EnVision, obserwatorium fal grawitacyjnych LISA oraz teleskop rentgenowski New Athena — wszystkie we wczesnej fazie, z dużym udziałem NASA.",
      "W obserwacji Ziemi zagrożone są m.in. wspólne satelity Sentinel-6C do pomiaru poziomu mórz — seria, w której NASA i ESA dzielą odpowiedzialność za instrumenty i launch. Dyrektor Earth Observation Simonetta Cheli wskazała, że ESA analizuje opcje, gdyby USA wycofało się z kolejnych elementów, przy jednoczesnej próbie zrozumienia pełnego zakresu cięć w innych dziedzinach współpracy.",
      "Dla polskiego czytelnika newsów kosmicznych rada czerwcowa to moment, w którym „program” staje się „polityką państw” — decyzje nie padają w Hawthorne czy Bremie, lecz w głosowaniach ministerialnych. Warto rozróżniać: wstrzymanie Gateway ≠ koniec Artemis, ale może oznaczać przesunięcie europejskich miliardów do innych priorytetów (EO, obrona, autonomia launchers po sukcesie Ariane 6 z 12 lutego 2026). WSS będzie relacjonować konkretne decyzje po communiqué z Paryża, nie spekulacje z Twittera.",
      "W eksploracji Księżyca projekt budżetu NASA przewiduje m.in. zakończenie programu Orion po Artemis 3 (w przedstawionej wersji) oraz anulowanie Mars Sample Return i wsparcia dla europejskiego łazika Rosalind Franklin — to bezpośrednio dotyka europejskich dostawców i harmonogramów startowych z Baikonuru lub alternatyw. ESA analizuje te warianty z państwami członkowskimi, nie tylko z Washington.",
      "Z perspektywy polskiej i europejskiej przemysłowej rada czerwcowa to sygnał dla firm z łańcucha ESM, Ariane 6 i Copernicus: zamówienia mogą zostać przesunięte, ale kompetencje z Artemis II pozostają aktywem eksportowym. Dla portalu WSS będziemy po 12 czerwca aktualizować ten wątek konkretnym communiqué — do tego czasu traktuj ten tekst jako tło redakcyjne, nie spekulację o decyzjach, których jeszcze nie ma.",
      "Misje „recovery” — EnVision (Wenus), LISA (fale grawitacyjne) i New Athena (rentgen) — są we wczesnej fazie, ale już teraz wymagają synchronizacji budżetów ESA i NASA; odroczenie amerykańskiego wkładu oznacza przesunięcie startów o lata, nie tylko redukcję kosztów w jednym roku budżetowym. Dla WSS to sygnał, że sekcja Astronomia będzie musiała równoważyć sukces Roman (NASA) z europejskimi flagowcami zależnymi od transatlantyckiej umowy.",
      "Redakcja w CMS: contentOrigin EDITORIAL, pełny Kontekst WSS, źródło ESA/NASA w stopce. Nie auto-publishuj bez podglądu okładki i tytułu; po publikacji na prod uruchom `npm run cache:revalidate`. To wzorzec jakości przed partiami z kolejki REVIEW (~175 szt. RSS).",
    ].join("\n\n"),
    contextNote:
      "Wstrzymanie Gateway i cięcia science w USA przyspieszają debatę w Europie o autonomii: Ariane 6, Copernicus i programy obronne (np. porozumienie ESA–EDA z kwietnia 2026) zyskują wagę, gdy transatlantycka „tarcza” współpracy słabnie. Na WSS traktujemy czerwiec 2026 jako punkt zwrotny w sekcji Misje — podobnie jak start Roman pod koniec sierpnia w Astronomii.",
    categorySlug: "misje",
    tags: [
      "ESA",
      "Gateway",
      "Artemis",
      "NASA",
      "budżet",
      "EnVision",
      "LISA",
      "Sentinel",
      "I-Hab",
    ],
    coverImage: nasaCoverUrl("PIA23421"),
    coverImageCredit: "ESA / NASA",
    source: "ESA / SpaceNews",
    originalUrl:
      "https://www.esa.int/Newsroom/Press_Releases/(year)/2026",
    readingTime: 11,
    featured: false,
    heroPosition: 0,
  },
];
