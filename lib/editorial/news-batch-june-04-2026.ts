/**
 * Partia newsroom WSS — 4 czerwca 2026 (11 artykułów PL).
 * Uzupełnia EDITORIAL_TEST_ARTICLES_JUNE_2026 (4 szt.); nie duplikuje tych slugów.
 */

import type { EditorialDraft } from "./test-articles-june-2026";
import { nasaCoverUrl } from "./nasa-cover";

export const EDITORIAL_NEWS_BATCH_JUNE_04_2026: EditorialDraft[] = [
  {
      slug: "mglawica-tc1-buckyballs-jwst-apod-04-czerwca-2026",
      title:
        "APOD 4 czerwca: mgławica Tc 1, buckyballs i znak zapytania z Jamesa Webba",
      subtitle:
        "MIRI mapuje cienką skorupę C60 wokół białego karła — Jan Cami (Western University) wraca do miejsca pierwszego wykrycia fullerenu w 2010 roku przez Spitzera.",
      excerpt:
        "Obraz dnia NASA z 4 czerwca 2026 pokazuje mgławicę planetarną Tc 1 w konstelacji Ara, ponad 10 000 lat świetlnych od Ziemi: pierwsze w kosmosie buckyballs (C60) i nowa struktura przypominająca odwrócony znak zapytania w centrum obłoku gazu wokół umierającej gwiazdy.",
      content: [
        "4 czerwca 2026 Astronomy Picture of the Day (APOD) wyróżnia mgławicę planetarną Tc 1 — obiekt, w którym w 2010 roku teleskop Spitzer po raz pierwszy wykrył w przestrzeni kosmicznej buckminsterfullereny (C60), molekuły węgla ułożone jak piłka nożna. Piętnaście lat później James Webb Space Telescope (JWST) z instrumentem MIRI (Mid-Infrared Instrument) dostarcza najostrzejszego dotąd obrazu tego samego regionu: ponad 10 000 lat świetlnych w kierunku konstelacji Ara, gdzie centralna gwiazda przechodzi w fazę białego karła otoczonego rozprzestrzeniającym się płaszczem gazu.",
        "Za obserwacjami stoi zespół pod kierownictwem Jana Camiego z Western University w Kanadzie — tego samego astronoma, który prowadził analizę spektralną Spitzera w 2010 roku. Nowe dane łączą dziewięć filtrów MIRI w zakresie 5,6–25,5 mikrometra; niebieskie tony oznaczają gorętszy gaz, czerwone — chłodniejszy materiał. Obraz przetworzyła Katelyn Beecroft w PixInsight; kredyty: NASA / ESA / CSA / Western University, J. Cami.",
        "Geometria buckyballs jest jednym z głównych wniosków publikacji i materiałów APOD: cząsteczki C60 nie są rozproszone losowo — wypełniają cienką, sferyczną skorupę wokół centralnej gwiazdy, widoczną jako jasną krawędź pomarańczowego rdzenia mgławicy. To wskazuje na procesy chemiczne i transport pyłu w fazie końcowej ewolucji gwiazdy o masie podobnej do Słońca, gdzie wiatry i promieniowanie UV modelują warstwy molekularne zanim obłok rozproszy się w galaktycznym medium.",
        "MIRI nie tylko „fotografuje” — spektroskopia pola całkowego (IFU) mapuje temperaturę, gęstość, skład chemiczny i ruchy gazu w każdym punkcie mgławicy. Dla astrofizyki organicznej to most między laboratorium (synteza fullerenu w latach 80., Nagroda Nobla 1996) a obserwacją: buckyballs w Tc 1 są najbardziej spektakularnym laboratorium chemii węgla w fazie planetarnej nebulae, bez konieczności próbkowania materiału na Ziemi.",
        "Porównanie Spitzer 2010 versus Webb 2026 jest lekcją ewolucji instrumentów: Spitzer dostarczył pierwsze spektralne linie C60 w Tc 1, ale rozdzielczość przestrzenna nie pozwalała zmapować geometrycznej skorupy. Webb wypełnia tę lukę w skali lat świetlnych — widać promienie, włókna i warstwy, w których fullereny mogły powstać w wiatrach bogatych w węgiel. Modele muszą teraz wyjaśnić, dlaczego cząsteczka o masie molekularnej jak mała planeta ma tendencję do koncentracji na sferze, a nie do równomiernego mieszania z wodorem i hellem w całym płaszczu.",
        "Konstelacja Ara (Ołtarz) leży w strefie Drogi Mlecznej widocznej z południa; odległość ponad 10 000 ly oznacza, że światło z fazy planetary nebula dotarło do nas dziesiątki tysięcy lat po tym, jak centralna gwiazda wyrzuciła zewnętrzne warstwy. Dla obserwatorów amatorskich obiekt nie jest „targetem wieczoru” jak M42, lecz dla astronomii molekularnej Tc 1 jest wzorcem typu Wolf-Rayet / carbon-rich w końcowej fazie życia gwiazdy — kategoria, w której chemia węgla dominuje nad tlenem.",
        "W centrum kadru APOD pojawia się drugi bohater dnia: delikatna struktura w kształcie odwróconego znaku zapytania tuż przy sercu mgławicy — detal, który autorzy opisu APOD traktują jako wizualną „interpunkcję” dla otwartych pytań. Mechanizm powstania tej formacji nie jest jeszcze domknięty; modele muszą pogodzić asymetrię wiatrów, możliwe układy podwójne w przeszłości i lokalne tarcie promieniowania z dyskiem resztkowym.",
        "Tc 1 przypomina, że mgławice planetarne nie mają nic wspólnego z planetami — to ostatni etap życia gwiazd o masie niskiej i średniej, gdy zewnętrzne warstwy są wyrzucane, a rdzeń kurczy się do białego karła. W tym kontekście buckyballs działają jak kapsuły chemiczne: rejestrują, jak węgiel i inne pierwiastki były przetwarzane w atmosferze gwiazdy i w zewnętrznej powłoce, zanim materiał trafi do międzygwiazdowego medium i — dalej — do przyszłych układów planetarnych.",
        "Dla czytelnika WSS obraz z apod.nasa.gov (4 czerwca 2026) to połączenie trzech trendów redakcyjnych: Webb jako lupa chemii, powrót do „starych” celów Spitzera z nową rozdzielczością oraz codzienny rytm APOD jako wejścia w newsroom. Warto śledzić preprinty i komunikaty Western University równolegle z blogiem Webb — pełne mapy IFU mogą w kolejnych tygodniach zawęzić modele formowania fullerenu w wiatrach gwiazdowych.",
        "Porównanie z innymi obiektami (np. wczesnymi spekulacjami fullerenu w meteorytach) pokazuje, że Tc 1 pozostaje wzorcowym laboratorium kosmicznym dla C60. Gdy Roman Space Telescope ruszy pod koniec sierpnia 2026, survey w podczerwieni może wskazać kolejne mgławice do celowania Webbem — Tc 1 ustawia poprzeczkę jako obiekt, który łączy historię Spitzera z erą JWST.",
        "Pełne mapy IFU z MIRI mogą w kolejnych tygodniach zawęzić modele formowania fullerenu w wiatrach węglowych — warto śledzić komunikaty Western University równolegle z kolejnymi zdjęciami APOD i archiwum MAST programu Webb dla tego celu.",
      ].join("\n\n"),
      contextNote:
        "Powrót Camiego do Tc 1 ilustruje trend WSS na czerwiec 2026: teleskopy flagowe nie tylko odkrywają nowe obiekty, lecz odświeżają klasyki z ery Spitzera z mapami chemii 3D. APOD codziennie zasila sekcję Astronomia krótkim leadem, a pełny artykuł newsroom domyka kontekst dla polskiego czytelnika nauki popularnej.",
      categorySlug: "astronomia",
      tags: [
        "APOD",
        "JWST",
        "MIRI",
        "Tc 1",
        "buckyballs",
        "C60",
        "mgławica planetarna",
        "Ara",
        "Spitzer",
        "Jan Cami",
      ],
      coverImage: nasaCoverUrl("PIA25438"),
      coverImageCredit:
        "NASA / ESA / CSA / Western University, J. Cami; processing: K. Beecroft",
      source: "NASA APOD",
      originalUrl: "https://apod.nasa.gov/apod/ap260604.html",
      readingTime: 10,
      featured: true,
      heroPosition: 3,
    },
  {
      slug: "webb-metan-kometa-miedzygwiezdna-3i-atlas-czerwiec-2026",
      title:
        "Webb wykrył metan na międzygwiezdnej komecie 3I/ATLAS — pierwszy taki sygnał w historii",
      subtitle:
        "Blog NASA z 1 czerwca 2026 i publikacja w ApJL: obserwacje MIRI 15–16 i 27 grudnia 2025 ujawniają metan ukryty w lodzie oraz nadmiar CO₂ względem komet Układu Słonecznego.",
      excerpt:
        "James Webb Space Telescope zebrał pierwszy średniopodczerwony odcisk chemiczny obiektu międzygwiezdnego: kometa 3I/ATLAS, odkryta 1 lipca 2025 przez sieć ATLAS w Chile, to trzeci znany gość spoza Układu — a metan pojawił się dopiero po ogrzaniu głębszych warstw lodu podczas przejścia w pobliżu Słońca.",
      content: [
        "Wpis na blogu NASA Science z 1 czerwca 2026 podsumowuje wyniki, które zespół opublikował w The Astrophysical Journal Letters: James Webb Space Telescope po raz pierwszy bezpośrednio wykrył metan (CH₄) na obiekcie międzygwiezdnym — komecie 3I/ATLAS. To trzeci potwierdzony gość spoza naszego Układu (po 1I/ʻOumuamua i 2I/Borisov); został odkryty 1 lipca 2025 przez projekt ATLAS (Asteroid Terrestrial-impact Last Alert System) w Chile i szybko stał się priorytetem dla sieci teleskopów naziemnych i kosmicznych.",
        "Kluczowe obserwacje wykonano instrumentem MIRI w dwóch terminach po przejściu peryhelium, gdy kometa wracała w głąb Układu: 15–16 grudnia 2025 (ok. 329 mln km, 205 mln mil od Słońca) oraz 27 grudnia 2025 (ok. 379 mln km, 236 mln mil). Dane pokazują rozkład gazów w komie: para wodna rozciąga się daleko poza jądro — częściowo z lodowych ziaren w otocze — podczas gdy dwutlenek węgla i metan koncentrują się bliżej jądra.",
        "Metan jest wysoce lotny — sublimuje z lodu przy niewielkim ogrzaniu. Jego opóźnione pojawienie się w 3I/ATLAS sugeruje, że był zakopany pod wierzchnią warstwą i uwalniał się dopiero, gdy ciepło po bliskim przejściu przy Słońcu dotarło w głąb podpowierzchniowego lodu. Stosunek metanu do wody jest zaskakująco wysoki — w naszym Układzie niewiele komet oferuje podobny analog.",
        "Praca Matthew Belyakov (Caltech) i współpracowników potwierdza też wcześniejsze wrażenie, że 3I/ATLAS jest bogata w CO₂: względny nadmiar dwutlenku węgla względem wody odróżnia ją od typowych komet słonecznych i wskazuje na inne środowisko formowania lub historię termiczną w innym układzie gwiazdowym. Prędkość względem Słońca rzędu ~57 km/s podkreśla interstellarne pochodzenie; trajektoria w wczesnym 2026 przebiegła w pobliżu Jowisza, co dało astronomom krótkie okno na manewry i dodatkowe pomiary.",
        "Webb dostarcza tu nie zdjęcia wizualnego w sensie Hubble’a, lecz map chemicznych i widma — „odcisk palca” w podczerwieni. To uzupełnia dane z SPHEREx i obserwatoriów naziemnych z 2025 roku, które sugerowały emisję w paśmie 3,2–3,6 µm, ale bez rozdzielczości wystarczającej do jednoznacznego przypisania metanu. MIRI rozstrzyga spór na korzyść bezpośredniej detekcji CH₄.",
        "Historia odkrycia 3I/ATLAS zaczyna się 1 lipca 2025 w Chile w ramach sieci ATLAS — automatycznego systemu wczesnego ostrzegania przed asteroidami, który przy okazji łapie komety i obiekty nietypowe. Trzeci numer (3I) w oznaczeniu międzygwiezdnym oznacza, że po 1I/ʻOumuamua (2017) i 2I/Borisov (2019) mamy kolejny potwierdzony gość z innej gwiazdy. Prędkość rzędu 57 km/s względem Słońca i trajektoria skrócona przez Jowisza na początku 2026 dały astronomom krótkie, intensywne okno kampanii — Webb był rezerwowany właśnie na fazę po-peryhelium, gdy głęboki lód zaczął uwalniać metan.",
        "Autorzy w ApJL (m.in. Matthew Belyakov, Caltech) podkreślają, że CO₂ pozostaje dominującym lotnym względem wody w tej komecie — metan jest „drugim aktem” uwalnianym z głębi. Dla modeli formowania planet oznacza to, że obiekt mógł skondensować się w regionie bogatym w węgiel i tlen, z temperaturą zbyt niską na duże ilości wody lodowej na powierzchni, a jednocześnie z warstwami metanu schowanymi pod skorupą pyłową. To scenariusz różny od wielu komet długookresowych Układu Słonecznego obserwowanych przez Rosettę czy przez teleskopy naziemne.",
        "Dla astrobiologii i planetologii komety międzygwiezdne są próbkami chemii innych dysków protoplanetarnych. Metan i CO₂ wskazują na zimne regiony formowania lub na przechowywanie lotnych w głębokim lodzie. Jeśli podobne obiekty są częste, materiał dostarczany do młodych układów może mieć inny bilans węgla niż zakładano w modelach budowy Ziemi.",
        "W czerwcu 2026 kometa oddala się od Słońca; kolejne kampanie będą coraz trudniejsze, ale archiwum MAST (program Webb #9442) pozostaje otwarte dla analiz porównawczych z 2I/Borisov. NASA podkreśla, że to pierwszy mid-IR fingerprint ISO — precedens dla następnych gości, których survey ATLAS i Rubin LSST mogą wykryć częściej w latach 30.",
        "Obserwacje 15–16 i 27 grudnia 2025 wykonano, gdy kometa była już po przejściu peryhelium — kluczowe dla interpretacji opóźnionego metanu: model termiczny musi tłumaczyć, jak ciepło wnika w głąb po oddaleniu z peryhelium, a nie tylko w szczycie. Matthew Belyakov (Caltech) i zespół w ApJL zestawiają mapy gazów z widmem punktowym — metoda, która stanie się szablonem dla kolejnych ISO.",
        "Blog NASA z 1 czerwca 2026 jest oficjalnym wejściem dla publiczności; WSS rozwija go po polsku z datami, prędkością ~57 km/s i kontekstem trzeciego obiektu międzygwiezdnego. Przejście w pobliżu Jowisza na początku 2026 zmieniło trajektorię na krótszą — stąd intensywna kampania w grudniu 2025, zanim kometa zniknęła z zasięgu największych teleskopów.",
        "Czytelnik WSS powinien rozróżnić „kometa” a „statek”: 3I/ATLAS zachowuje się jak aktywna kometa z comą i lotnymi gazami — narracja naukowa jest w danych spektralnych, nie w spekulacjach mediowych. W sekcji Astronomia łączymy ten temat z APOD Tc 1 (chemia węgla) i z kalendarzem przejść komet w Odkrywaj.",
        "Kampania obserwacyjna 3I/ATLAS pokazuje, że międzygwiezdne goście są coraz częściej „łapane” przez surveye (ATLAS, w przyszłości Rubin LSST) — każdy kolejny obiekt z pełnym odciskiem MIRI wzmacnia argument za stałym rezerwem czasu Webb na szybkie follow-upy po odkryciu.",
      ].join("\n\n"),
      contextNote:
        "3I/ATLAS to drugi wielki temat międzygwiezdny dekady po Borisov — na WSS pokazuje trend „spektroskopia zamiast sensacji”: Webb i MIRI definiują newsroom, gdy obiekt jest już na wylocie. Parę z APOD Tc 1 (węgiel złożony) tworzy narrację czerwca: od mgławic do komet, chemia kosmiczna w jednym tygodniu.",
      categorySlug: "astronomia",
      tags: [
        "JWST",
        "MIRI",
        "3I/ATLAS",
        "kometa międzygwiezdna",
        "metan",
        "CO2",
        "ATLAS Chile",
        "Matthew Belyakov",
        "ApJL",
        "NASA",
      ],
      coverImage: nasaCoverUrl("PIA25301"),
      coverImageCredit:
        "NASA, ESA, CSA, STScI; M. Belyakov (Caltech), I. Wong (STScI); processing: A. Pagan (STScI)",
      source: "NASA Science",
      originalUrl:
        "https://science.nasa.gov/blogs/3iatlas/2026/06/01/nasas-webb-detects-methane-on-interstellar-comet-3i-atlas/",
      readingTime: 10,
      featured: true,
      heroPosition: 4,
    },
  {
      slug: "starlink-10-43-start-04-czerwca-2026-cape-canaveral",
      title:
        "Starlink 10-43 wyniesiony 4 czerwca z SLC-40 — 29 satelitów i 12. lot boostera B1090",
      subtitle:
        "Po odroczeniu 3 czerwca z powodu pogody Falcon 9 wystartował o 6:26 EDT; lądowanie na droneship A Shortfall of Gravitas. To ok. 50. misja Starlink w 2026 roku w kontekście ponad 10 000 satelitów na orbicie.",
      excerpt:
        "SpaceX zamknęła kolejny rozdział rozbudowy konstelacji: w środę 4 czerwca 2026 rakieta Falcon 9 z Cape Canaveral Space Force Station (stanowisko SLC-40) dostarczyła 29 satelitów Starlink V2 Mini, korzystając z boostera B1090 na jego 12. locie i platformy A Shortfall of Gravitas na Oceanie Atlantyckim.",
      content: [
        "4 czerwca 2026 o 6:26 czasu wschodniego (EDT) z Space Launch Complex 40 na Cape Canaveral Space Force Station wystartowała misja Starlink 10-43 — kolejny launch rozszerzający konstelację internetu szerokopasmowego SpaceX. Na orbicie niską (LEO) trafiło 29 satelitów Starlink; wcześniejsza próba 3 czerwca została odwołana z powodu pogody, co w Florida late spring nie jest rzadkością przy grzmotach i chmurach cumulonimbus w oknie porannym.",
        "Pierwszy stopień B1090 wykonał 12. lot — kolejny dowód rutynowej reflight w programie Falcon 9. Po oddzieleniu stopni i kontynuacji misji na drugim stopniu, booster wrócił na autonomiczną platformę „A Shortfall of Gravitas” (ASOG) na Atlantyku. Taki scenariusz (launch ze wschodniego wybrzeża + lądowanie na dronowej barki) jest standardem dla ciężkich profili Starlink z Florydy.",
        "W skali roku 2026 to około 50. start dedykowany Starlinkowi — tempo, które utrzymuje SpaceX w pozycji dominującego operatora launch services pod kątem liczby orbity na rok. Łącznie konstelacja przekroczyła barierę ponad 10 000 aktywnych satelitów (wliczając wersje V2 Mini i wcześniejsze generacje), co ma znaczenie dla astronomii (streaki na obrazach), zarządzania ruchem orbitalnym i debaty regulacyjnej o gęstości LEO.",
        "Starlink 10-43 wpisuje się w serię Group 10 — numeracja wskazuje na partię w konkretnym shellu i inklinacji, dostosowaną do pokrycia geograficznego i przepustowości. Dla użytkownika końcowego kolejny launch to głównie redundancja i wymiana satelitów kończących żywotność, nie jednorazowy „skok” jakości — ale dla infrastruktury to ciągłe doskonalenie siatki i latencji.",
        "Szczegóły profilu 10-43 (czas wynoszenia, inklinacja, masa ładunku) publikują katalogi launchowe w ciągu godzin po starcie — kluczowe dla analityków, którzy śledzą zapełnianie powłoki Starlink shell i wpływ na widoczność satelitów o zmierzchu. Scrub 3 czerwca przypomina, że nawet przy 50. misji Starlink w 2026 pogoda na wschodnim wybrzeżu USA pozostaje nieprzewidywalnym „gatekeeperem” — przesunięcie o 24 godziny to standard, nie kryzys.",
        "W kontekście 10 000+ satelitów na orbicie debata o deorbitacji i światłochronności (VisorSat, kontrakty z astronomami) wraca przy każdym dużym launchu. Europejska ESA i Międzynarodowa Unia Astronomiczna (IAU) prowadzą dialog z operatorami; dla WSS launch 4 czerwca to moment, by przypomnieć czytelnikowi różnicę między liczbą satelitów w PR a realnym wpływem na obserwacje naziemne — zależnym od kąta, korp i filtrów.",
        "Transmisja 6:26 EDT z SLC-40 trafia w poranny slot widzów w USA i popołudniowy w Europie — typowy rytm Starlinków z Cape Canaveral. Booster B1090 na 12. locie pokazuje, że SpaceX nadal intensywnie reużywa najstarsze korpusy, zamiast trzymać je wyłącznie na misje jednorazowe. A Shortfall of Gravitas na Atlantyku odbiera stopień na wschód od wybrzeża — geometryczny standard dla profili na południe i na północny wschód.",
        "W polskim kontekście regulacyjnym launch nie zmienia od razu przepisów telekomunikacyjnych, ale ilustruje, skąd bierze się presja na cielistość nocnego nieba i na konkurencję dla projektów europejskich operatorów LEO. Dla sekcji Technologie WSS to news infrastrukturalny z twardymi datami — nie zapowiedź „internetu z kosmosu dla każdego”, lecz fakt kolejnej dostawy 29 satelitów do już ogromnej konstelacji w połowie 2026 roku.",
        "Porównanie z manifestem NASA na 2026 (Roman, CRS, załogowe) pokazuje dwa rytmy branży: rzadkie, drogie misje naukowe i tygodniowy rytm komercyjnego LEO. WSS klasyfikuje ten news w Technologie jako infrastrukturę łączności i launch, nie jako misję eksploracyjną — choć każdy Falcon 9 z SLC-40 dzieli przestrzeń z programami wojskowymi i naukowymi na sąsiednich padach.",
        "Aspekt środowiskowy: cumulonimbus wokół Przylądku Kennedy’ego i Canaveral w czerwcu wymusza scruby i holdy — 3 czerwca pokazało, że nawet wysoka częstotliwość startów nie eliminuje pogody. SpaceX korzysta z lokalnych radarów i prognoz 45th Weather Squadron; publiczne transmisje często pokazują countdown zatrzymany na T-minus kilka sekund do minut.",
        "Dla polskiego czytelnika znaczenie jest pośrednie: Starlink jest dostępny w wielu krajach UE, a debaty o światłochronności satelitów dotyczą także europejskich obserwatoriów (w tym projektów ESA). W newsroomie WSS traktujemy launch jako fakt infrastruktury z datą, padem i numerem boostera — bez hype’u „rewolucji internetu”.",
        "Kontekst konkurencji: OneWeb, Kuiper (Amazon) i chińskie konstelacje budują własne sloty — tempo SpaceX w czerwcu 2026 nadal wyznacza benchmark cadence. Obserwatorzy branży notują też presję na Starship jako przyszłego nośnika masowego dla V3, ale Starlink 10-43 pozostaje klasycznym Falcon 9.",
        "Źródła operacyjne: komunikaty SpaceX, NASASpaceflight i kalendarz startów; okładka może pochodzić z archiwum NASA startów Falcon (public domain) — w CMS ustaw kredyt i nie duplikuj slugów z partii testowej z 4 czerwca.",
      ].join("\n\n"),
      contextNote:
        "Starlink to tło szumu launchowego 2026 — na WSS jeden artykuł miesięcznie z pełnymi parametrami (pad, booster, liczba satelitów) wystarczy, by czytelnik widział trend komercjalizacji LEO obok flagowych misji NASA/ESA w Misjach i Astronomii.",
      categorySlug: "technologie",
      tags: [
        "SpaceX",
        "Starlink",
        "Falcon 9",
        "Cape Canaveral",
        "SLC-40",
        "B1090",
        "ASOG",
        "konstelacja",
        "launch 2026",
      ],
      coverImage: nasaCoverUrl("PIA23645"),
      coverImageCredit: "NASA / Joel Kowsky",
      source: "SpaceX / NASASpaceflight",
      originalUrl: "https://www.spacex.com/launches/",
      readingTime: 9,
      featured: true,
      heroPosition: 4,
    },
  {
      slug: "blue-origin-new-glenn-wznowienie-lotow-koniec-2026",
      title:
        "Blue Origin: New Glenn ma wrócić na pas do końca 2026 — deklaracja po SpaceNews",
      subtitle:
        "SpaceNews z 3 czerwca 2026 cytuje zobowiązanie firmy Bezosa do wznowienia lotów ciężkiego rakiety po testach i anomaliach z początku roku.",
      excerpt:
        "Według SpaceNews (3 czerwca 2026) Blue Origin zapowiada wznowienie lotów New Glenn do końca 2026 roku — kluczowy sygnał dla manifestu Kuiper, programów NASA i konkurencji z Falcon Heavy/Starship.",
      content: [
        "Portal SpaceNews opublikował 3 czerwca 2026 informację, że Blue Origin deklaruje wznowienie lotów rakiety New Glenn do końca 2026 roku. To odpowiedź branży na pytanie, kiedy ciężki nośnik firmy Jeffa Bezosa stanie się regularnym elementem rynku launch, a nie pojedynczym demonstratorem.",
        "New Glenn — dwustopniowa rakieta z pierwszym stopniem zwracanym na statek oceaniczny — ma 7 metrów średnicy fairingu i być konkurentem Falcon Heavy oraz przyszłego Starship w segmencie ciężkim. Pierwsze loty testowe w 2025 pokazały zarówno sukcesy, jak i potrzebę iteracji po anomaliach i harmonogramach.",
        "Dla Project Kuiper (konstelacja Amazon) New Glenn jest preferowanym nośnikiem do uzupełnienia slotów LEO — opóźnienia Blue Origin bezpośrednio wpływają na konkurencję ze Starlinkiem (artykuł Starlink 10-43 w tej partii). Deklaracja „koniec 2026” nie zastępuje daty startu, ale ustawia oczekiwania inwestorów.",
        "Artykuł SpaceNews z 3 czerwca 2026 cytuje zobowiązanie firmy po serii testów i dyskusji z klientami rządowymi — segment, w którym ULA Vulcan i Falcon Heavy już latają, a New Glenn ma udowodnić powtarzalność (odzysk pierwszego stopnia, harmonogram manifestu). Bez tego Kuiper pozostaje zależny od Falcon 9 jako nośnika przejściowego.",
        "Dla programu Blue Moon i przyszłych kontraktów Artemis (landers, cargo) New Glenn jest kandydatem na ciężkie ładunki — sukces komercyjny i certyfikacja wojskowa SLC-36 na Cape Canaveral są warunkiem wejścia na listę NASA NSSL.",
        "Deklaracja z 3 czerwca 2026 (SpaceNews) nie podaje numeru lotu — czytelnik powinien traktować ją jako zobowiązanie korporacyjne, nie datę w kalendarzu startów. Konkurencja SpaceX Starship i Falcon Heavy ustawia poprzeczkę ceny i częstotliwości; Blue musi pokazać co najmniej dwa-trzy udane loty pod rząd, by przejąć manifesty poza własnym Kuiper.",
        "W 2026 roku New Shepard wznawia loty podnioski po przerwie — osobny produkt, ale wspólny PR Blue Origin. New Glenn jest jednak filarem orbitalnym; bez niego wizja Orbital Reef i ciężkie ładunki wojskowe pozostają na papierze.",
        "Programy NASA (np. misje planetarne i loty załogowe w dłuższej perspektywie) obserwują manifest New Glenn jako drugi komercyjny heavy lift po SpaceX. Certyfikacja wojskowa i komercyjna wymaga kilku udanych lotów z rzędu — „wznowienie” sugeruje serię, nie jednorazowy test.",
        "Blue Origin rozwija też BE-4 (silnik na Vulcan i własne projekty) oraz New Shepard (suborbitalny turystyczny). New Glenn jest jednak filarem Orbital Reef i innych wizji stacji — bez niego tempo infrastruktury orbitalnej Blue pozostaje ograniczone.",
        "Porównanie z CRS-34 SpaceX (misja zaopatrzeniowa ISS) pokazuje podział rynku: SpaceX dominuje dziś w LEO załogowym i cargo, Blue walczy o przyszły segment ciężki. WSS klasyfikuje news jako Misje / infrastrukturę launch, bo dotyczy realnej pojemności orbitalnej, nie gry.",
        "Krytycy zwracają uwagę na historię opóźnień Blue Origin względem obietnic z poprzedniej dekady; SpaceNews cytuje oficjalne słowo firmy — redakcja WSS nie prognozuje daty startu, tylko raportuje deklarację końca 2026.",
        "Obserwatorzy prawa kosmicznego i środowiska będą śledzić wpływ większej liczby startów New Glenn na emisje i hałas na wybrzeżu Florydy / Karoliny — podobnie jak przy Falcon 9.",
        "Źródło: SpaceNews + komunikaty Blue Origin; okładka NASA launch lub ESA — kategoria misje; aktualizacja po pierwszym potwierdzonym locie w drugiej połowie 2026.",
      ].join("\n\n"),
      contextNote:
        "New Glenn to test wiarygodności Blue — na WSS łączymy z Kuiper i z presją na drugiego dostawcę heavy lift w erze, gdy SpaceX wynosi tysiące Starlinków miesięcznie.",
      categorySlug: "misje",
      tags: [
        "Blue Origin",
        "New Glenn",
        "SpaceNews",
        "Jeff Bezos",
        "Kuiper",
        "rakieta",
        "launch",
        "heavy lift",
        "2026",
        "komercyjny",
      ],
      coverImage: nasaCoverUrl("PIA23763"),
      coverImageCredit: "NASA",
      source: "SpaceNews",
      originalUrl: "https://spacenews.com/",
      readingTime: 10,
    },
  {
      slug: "spacex-crs-34-iss-maj-czerwiec-2026-dragon",
      title:
        "SpaceX CRS-34: 6500 funtów cargo na ISS, port Harmony — wyjście w połowie czerwca",
      subtitle:
        "Start 15 maja 2026; Dragon na forward port Harmony. Misja zaopatrzeniowa przed odłączeniem w drugiej połowie czerwca 2026.",
      excerpt:
        "15 maja 2026 Falcon 9 wyniósł Dragon CRS-34 z ok. 6500 funtów ładunku na Międzynarodową Stację Kosmiczną — cumowanie przy forward port Harmony. Planowane odejście w połowie czerwca 2026 zamyka kolejny cykl resupply NASA.",
      content: [
        "15 maja 2026 SpaceX wykonała misję Commercial Resupply Services CRS-34 — start Falcon 9 z Cape Canaveral z kapsułą Dragon niosącą około 6500 funtów (nearly 3000 kg) ładunku na Międzynarodową Stację Kosmiczną (ISS). To kolejny element kontraktu NASA na zaopatrzenie stacji w ramach programu Commercial Resupply Services.",
        "Dragon zacumował przy forward port modułu Harmony (Node 2) — standardowy punkt dla amerykańskich statków cargo, umożliwiający równoległe cumowanie innych pojazdów na pozostałych portach USOS. Załoga Expedition na pokładzie ISS rozładowuje eksperymenty naukowe, materiały biologiczne, sprzęt ECLSS i zapasy dla załogi.",
        "Ładunek 6500 funtów obejmuje typowy miks: badania mikrograwitacji (komórki, płyny, materiały), technologie demonstracyjne, żywność, odzież i części zamienne. NASA publikuje manifest w press kit CRS-34 — poszczególne eksperymenty są numerowane w bazie NASA Science i ISS National Lab.",
        "Start 15 maja 2026 zapewnił stacji zapas przed planowanym odłączeniem Dragon w połowie czerwca 2026 — okno, w którym załoga kończy eksperymenty wymagające powrotu próbek na Ziemię w kapsule Dragon (w przeciwieństwie do Progress, który spala się z odpadami). Forward port Harmony ułatwia jednoczesne cumowanie statku załogowego na dolnym porcie.",
        "CRS-34 jest kolejnym dowodem, że komercyjny model resupply NASA z SpaceX działa w rytmie co kilka miesięcy — równolegle Roscosmos wysyła Progress, a ESA promuje eksperymenty europejskie na Columbus. Dla polskich instytutów ISS nadal jest platformą, do której można dostać się przez programy ESA, nawet gdy media mówią głównie o Artemis i Księżycu.",
        "Po 15 maja 2026 załoga ISS ma kilka tygodni na rozładowanie 6500 funtów — termiczne eksperymenty, płyny, materiały i zaopatrzenie dla Expedition obecnej na pokładzie. Harmony forward port pozostaje najbardziej fotografowanym cumowaniem Dragon w mediach, bo kamera na module Node 2 pokazuje podejście kapsuły z Ziemi w tle.",
        "Planowane odejście w połowie czerwca 2026 zamyka misję przed kolejnymi launchami załogowymi i cargo — Dragon spłonie po wejściu w atmosferę, a kapsuła woduje z próbkami. Dla WSS to news z kategorii Misje: konkretna masa, port, daty startu i wyjścia, bez spekulacji o przyszłych kontraktach CRS.",
        "Harmonogram przewiduje odejście Dragon w połowie czerwca 2026 — po kilku tygodniach na stacji kapsuła wróci z próbkami i ładunkiem zwrotnym (downmass), spalając się w atmosferze po wodowaniu na Oceanie Atlantyckim (wariant cargo bez załogi). To zamyka cykl misji przed kolejnymi launchami załogowymi i Progress/HTV partnerskimi.",
        "CRS-34 zachodzi równolegle z programem załogowym Commercial Crew (Crew Dragon) i z europejskimi dostawami — ESA i Roscosmos nadal uczestniczą w logistyce ISS w 2026, choć architektura stacji ewoluuje pod kątem komercyjnych stacji (Axiom, Starlab itd.).",
        "Dla polskiego czytelnika ISS pozostaje najbliższym laboratorium orbitalnym — eksperymenty ESA często obejmują europejskie instytuty; śledzenie CRS to sposób na zauważenie, które pakiety naukowe właśnie dotarły. WSS kategoria Misje łączy z CRS i z planowanym odłączeniem czerwiec.",
        "Technicznie Dragon 2 cargo używa tej samej rodziny kapsuł co Crew, z modyfikacjami wnętrza — Falcon 9 z SLC-40 lub 39A zależnie od manifestu; CRS-34 kontynuuje wysoką częstotliwość resupply SpaceX po latach 20., gdy NASA polegała wyłącznie na Shuttle i Progress.",
        "Bezpieczeństwo: każde cumowanie wymaga procedury R-Bar lub V-Bar approach z udziałem Canadarm2 (SSRMS) w razie potrzeby — Dragon często cumuje autonomicznie po serii hold pointów. Środek czerwca 2026 to też okno dla EVA planowanych niezależnie od Dragon — harmonogram NASA TV.",
        "Po odłączeniu w połowie czerwca 2026 Dragon zabierze próbki i ładunek zwrotny — dla mediów naukowych to moment na podsumowanie, które eksperymenty ISS z tej misji dały pierwsze wyniki (mikrograwitacja, materiały, biologia). WSS zaktualizuje datę faktycznego undocku, gdy NASA opublikuje komunikat.",
      ].join("\n\n"),
      contextNote:
        "CRS to puls ISS — na WSS każda misja cargo z funtami, portem i datą wyjścia buduje zaufanie czytelnika do sekcji Misje obok newsów o grach i Webb.",
      categorySlug: "misje",
      tags: [
        "SpaceX",
        "CRS-34",
        "Dragon",
        "ISS",
        "NASA",
        "Harmony",
        "zaopatrzenie",
        "Falcon 9",
        "maj 2026",
        "czerwiec 2026",
      ],
      coverImage: nasaCoverUrl("PIA19807"),
      coverImageCredit: "NASA",
      source: "NASA",
      originalUrl:
        "https://www.nasa.gov/mission/spacex-crs-34/",
      readingTime: 10,
    }
];
