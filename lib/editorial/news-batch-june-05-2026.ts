/**
 * Partia newsroom WSS — 5 czerwca 2026 (6 artykułów PL).
 * Astronomia, misje, technologie — okładki NASA Image Library (HTTP 200).
 */

import type { EditorialDraft } from "./test-articles-june-2026";
import { nasaCoverUrl } from "./nasa-cover";

export const EDITORIAL_NEWS_BATCH_JUNE_05_2026: EditorialDraft[] = [
  {
      slug: "europa-clipper-przelot-jowisz-ganimedes-czerwiec-2026",
      title:
        "Europa Clipper mija Jowisza i Ganimedesa: największa misja planetarna NASA w kluczowym manewrze",
      subtitle:
        "Sonda w drodze do księżyca lodowego Europy wykorzystuje grawitację gazowych olbrzymów — w czerwcu 2026 zespół kalibruje instrumenty po flyby.",
      excerpt:
        "Misja Europa Clipper, wyniesiona w październiku 2024 na rakiecie Falcon Heavy, zmierza do Jowisza, by zbadać podpowierzchniowy ocean księżyca Europa. W pierwszej połowie 2026 roku sonda przechodzi serię flyby Jowisza i Ganimedesa, testując radar, spektrometry i kamery przed wejściem na orbitę wokół Europy w 2030 roku.",
      content: [
        "Europa Clipper to największa misja planetarna w historii NASA pod względem masy startowej i liczby instrumentów — odpowiedź na pytanie, czy pod lodową skorupą Europy kryje się ocean zdolny do chemii sprzyjającej życiu. Start z Kennedy Space Center nastąpił 14 października 2024 na Falcon Heavy; sonda ma dotrzeć do układu Jowisza i rozpocząć naukę systematyczną w 2030, po latach manewrów grawitacyjnych.",
        "W czerwcu 2026 zespół Jet Propulsion Laboratory (JPL) raportuje postęp po przelotach (flyby) w pobliżu Jowisza i Ganimedesa — największego księżyca Układu Słonecznego. Flyby nie są jedynie „oszczędnością paliwa”: pozwalają skalibrować Europa Imaging System (EIS), Mapping Imaging Spectrometer for Europa (MISE), Europa Ultraviolet Spectrograph (Europa-UVS) i radar REASON na realnych celach, zanim orbita wokół Europy stanie się jedynym polem widzenia.",
        "Radar REASON (Radar for Europa Assessment and Sounding: Ocean to Near-surface) ma penetrować lodową skorupę do głębokości dziesiątek kilometrów — klucz do mapowania grubości lodu i ewentualnych komór wody. Wczesne testy po flyby Ganimedesa dostarczają danych porównawczych z archiwum Galileo (1995–2003) i z europejską sondą JUICE, która równolegle bada układ Jowisza z innej trajektorii.",
        "Chemia powierzchni Europy — plamy brązowe, gejzery wodoru sugerowane przez Hubble’a — wymaga spektroskopii w podczerwieni i UV. MISE mapuje sole i organizy na powierzchni; połączenie z danymi Webb (Tc 1, komety międzygwiezdne w innych artykułach WSS z tego tygodnia) pokazuje, jak agencje uzupełniają się: Webb patrzy na obiekty dalekie, Clipper — na lokalny laboratorium oceaniczne w Układzie Słonecznym.",
        "Misja ma koszt rzędu 5 mld USD i dziesięć instrumentów; masa startowa przekraczała możliwości pojedynczego Falcon 9, stąd wybór Falcon Heavy. Dla polityki naukowej Clipper jest spoiwem między programem Mars Sample Return (wątpliwym w budżecie FY2027) a astrobiologią — jeśli Mars jest trudny logistycznie, Europa pozostaje „drugą szansą” w poszukiwaniu życia poza Ziemią.",
        "Europejska ESA współpracuje pośrednio przez JUICE (Jupiter Icy Moons Explorer): dwie sondy w tym samym układzie w latach 30. wymagają koordynacji czasu obserwacji i unikania interferencji RF. Dla czytelnika WSS to przykład multi-agency science — nie wyścig PR, lecz komplementarne orbity.",
        "Flyby Ganimedesa w 2026 daje też test termiki i zasilania: Clipper jedzie daleko od Słońca, panele muszą zasilać jednocześnie grzałki i komputery podczas przelotów w cieniu planety. Anomalie termiczne w tym etapie są tańsze niż po wejściu na orbitę Europy, gdzie każda minuta łączności jest planowana z wyprzedzeniem miesięcy.",
        "Harmonogram publiczny NASA zakłada, że pierwsze zdjęcia wysokiej rozdzielczości Europy z orbity pojawią się po 2030; do tego czasu media dostaną głównie kalibracje i mapy z flyby. Redakcja WSS nie obiecuje „dowodu życia” — misja szuka warunków habitability: woda, chemia, energia, stabilność w czasie geologicznym.",
        "Porównanie z Perseverance na Marsie (artykuł w tej partii) jest pouczające: Mars badamy powierzchnię in situ, Europa — z orbity i radaru. Obie ścieżki wymagają dekad planowania; Clipper startował, gdy MAVEN na Marsie właśnie się kończył — zmiana pokolenia misji w jednym kwartale 2026.",
        "Źródła: NASA Europa Clipper, JPL press; okładka z NASA Image Library (PIA25236). W CMS: kategoria Misje, status REVIEW do finalnej publikacji partii.",
      ].join("\n\n"),
      contextNote:
        "Europa Clipper to flagowiec astrobiologii NASA na lata 30. — na WSS łączymy go z europejskim JUICE i z zamknięciem MAVEN jako narrację „Mars głęboko, Jowisz szeroko”. Flyby w 2026 budują zaufanie czytelnika do sekcji Misje przed falą zdjęć z orbity.",
      categorySlug: "misje",
      tags: [
        "Europa Clipper",
        "NASA",
        "Jowisz",
        "Europa",
        "Ganimede",
        "JPL",
        "Falcon Heavy",
        "radar REASON",
        "astrobiologia",
        "JUICE",
      ],
      coverImage: nasaCoverUrl("PIA25236"),
      coverImageCredit: "NASA / JPL-Caltech",
      source: "NASA",
      originalUrl: "https://science.nasa.gov/mission/europa-clipper/",
      readingTime: 10,
      featured: true,
      heroPosition: 0,
    },
  {
      slug: "perseverance-zapas-probek-mars-czerwiec-2026",
      title:
        "Perseverance na Marsie: zapas próbek w depozycie i tarcie Mars Sample Return w 2026",
      subtitle:
        "Łazik NASA kontynuuje zbieranie rdzeni skalnych w Jezero — budżet USA zawiesza wątek transportu próbek na Ziemię.",
      excerpt:
        "Łazik Perseverance w kraterze Jezero zbiera i kataloguje rdzenie skalne w ramach misji Mars Sample Return. W czerwcu 2026 NASA prowadzi naukę powierzchniową, podczas gdy projekt budżetu FY2027 de facto wstrzymuje plan odbioru próbek — europejski Rosalind Franklin i sieć orbiterów stają pod presją.",
      content: [
        "Perseverance wylądował 18 lutego 2021 w kraterze Jezero — dawnej delcie rzeki, gdzie geolodzy spodziewają się osadów bogatych w węgiel i minerały wskazujące na dawne wody. Od ponad pięciu lat łazik jeździ po Marsie, wierci rdzenie skalne i odkłada je w hermetycznych tubach; część próbek trafia do depozytu zapasowego (sample depot) na powierzchni, by przyszła misja odbiorcza mogła je podnieść.",
        "W czerwcu 2026 zespół naukowy publikuje wyniki z ostatnich kampanii wędrówek — m.in. analizy skał węglanowych i sygnatur hydrologicznych w skałach osadowych. Instrument SHERLOC i PIXL na ramieniu robota skanują skały na mikroskali; SuperCam laserem odparowuje powierzchnię i analizuje plazmę. To nie jest „zdjęciowa turystyka” — każdy rdzeń ma metadane GPS marsjańskiego i kontekstu geologicznego.",
        "Program Mars Sample Return (MSR) miał połączyć Perseverance, lądownik odbiorczy NASA i rakietę startową z Marsa (Mars Ascent Vehicle) w jeden łańcuch logistyczny wart miliardy dolarów. Projekt budżetu NASA na FY2027 (ogłoszony maj 2026) sugeruje wstrzymanie lub anulowanie segmentu MSR — w praktyce próbki mogą leżeć na Marsie latami dłużej niż planowano.",
        "Dla ESA oznacza to kryzys wokół łazika Rosalind Franklin (ExoMars), którego start na Marsa był uzależniony od amerykańskiego lądownika. Europejscy partnerzy analizują scenariusze z Roscosmos, prywatnymi firmami lub odroczeniem — temat wraca na radę ESA równolegle do Gateway (osobny artykuł WSS z 4 czerwca).",
        "Utrata MAVEN (zakończenie misji 3 czerwca 2026) nie zatrzymuje Perseverance, ale ogranicza modelowanie pogody kosmicznej w czasie rzeczywistym — łazik nadal ma łączność przez MRO, TGO i bezpośrednio Ziemię, lecz planiści EVA i przyszłych astronautów tracą jeden kanał danych o atmosferze.",
        "Naukowo depozyt próbek na powierzchni to unikalny bank materiału — pierwszy w historii ludzkości poza Ziemią. Nawet bez terminowego MSR geolodzy mogą w przyszłości wysłać inną misję; tubki są zaprojektowane na dekady w martwym środowisku. Debata budżetowa w USA nie kasuje wartości naukowej już zebranych rdzeni.",
        "Perseverance współpracuje z Ingenuity (historyczny helikopter, zakończony) i z przyszłymi robotami; w Jezero widać deltę i warstwy osadów, które na Ziemię trafiłyby do laboratoriów izotopowych. Czytelnik WSS powinien rozróżnić „łazik działa” od „próbki jadą” — w 2026 to dwa różne statusy.",
        "Porównanie z Europa Clipper (flyby w tej partii): Mars = in situ + cache, Europa = orbiter + radar. Obie misje szukają śladów wody i chemii, ale Mars jest bliżej logistycznie, a Europa — bardziej ekstremalna radiacyjnie przy Jowiszu.",
        "Media społecznościowe często mieszają zdjęcia z Curiosity i Perseverance — oba są aktywne w 2026, ale Jezero jest unikalne pod kątem biosygnatur w osadach deltowych. W CMS ustaw okładkę KSC/JPL i kategorię Misje.",
        "Źródło: NASA Mars Exploration Program; aktualizacja po komunikacie budżetowym FY2027. Nie dodawaj ręcznych linków w treści — WSS wplata je przy renderze.",
      ].join("\n\n"),
      contextNote:
        "Perseverance bez MSR to lekcja polityki nauki: instrumenty działają, łańcuch dostaw się rwie. Na WSS łączymy to z zamknięciem MAVEN i z Rosalind Franklin jako europejskim elementem tej samej układanki Mars 2026.",
      categorySlug: "misje",
      tags: [
        "Perseverance",
        "Mars",
        "Jezero",
        "Mars Sample Return",
        "NASA",
        "ESA",
        "Rosalind Franklin",
        "rdzenie skalne",
        "MSR",
        "FY2027",
      ],
      coverImage: nasaCoverUrl("KSC-20200402-PH-JPL01_0003"),
      coverImageCredit: "NASA / JPL-Caltech",
      source: "NASA",
      originalUrl:
        "https://science.nasa.gov/mission/mars-2020-perseverance/",
      readingTime: 10,
    },
  {
      slug: "parker-solar-probe-perihelion-2026-najszybszy-obiekt",
      title:
        "Parker Solar Probe: kolejne perihelion w 2026 — najszybszy obiekt zbudowany przez człowieka",
      subtitle:
        "Sonda zbliża się do Słońca na odległość kilku promieni słonecznych, mierząc wiatry i burze, które trafiają też w Marsa i Ziemię.",
      excerpt:
        "NASA Parker Solar Probe w 2026 roku wykonuje kolejne zbliżenia do fotosfery, osiągając prędkości przekraczające 600 km/s i temperatury tarczy rzędu 1400 °C. Dane uzupełniają misje SOHO, Solar Orbiter ESA i sieć satelitów pogody kosmicznej.",
      content: [
        "Parker Solar Probe (dawniej Solar Probe Plus) startowała 12 sierpnia 2018 na rakiecie Delta IV Heavy — pierwsza misja „dotykająca” Słońca, nazwana na czt Eugene Parker, odkrywcy wiatru słonecznego. Od lat wykonuje serię periheliów, coraz bardziej zbliżając się do fotosfery dzięki manewrom z Wenus.",
        "W 2026 kolejne przejścia w perycentrum trajektorii ustawiają rekordy: sonda jest najszybszym obiektem zbudowanym przez ludzi (prędkości względem Słońca przekraczające 600 km/s), z tarczą termiczną TPS (Thermal Protection System) wytrzymującą temperatury rzędu 1400 °C na froncie. Cel naukowy: zrozumieć, dlaczego korona jest gorętsza od powierzchni i jak wiatr słoneczny przyspiesza.",
        "Dla programu Mars i ISS dane Parkera nie są abstrakcją — burze słoneczne i CME (coronal mass ejections) wykryte w pobliżu Słońca trafiają w predykcje dla astronautów i łazików. Zakończenie MAVEN 3 czerwca 2026 osłabia monitoring marsjański, ale Parkera i DSCOVR nadal ostrzegają Ziemię.",
        "Europejska Solar Orbiter (ESA/NASA) patrzy na Słońce z innej geometrii — orbity wysokiego nachylenia pokazują bieguny. Parker = „wewnątrz” płaszcza, Solar Orbiter = „bok” i bieguny. Razem tworzą heliofizykę 3D analogiczną do wielu teleskopów w astronomii.",
        "Instrumenty FIELDS, SWEAP, ISOIS i WISPR mierzą pola magnetyczne, cząstki i promieniowanie rentgenowskie korony. W 2026 społeczność heliofizyczna koreluje te dane z cyklem słonecznym (maksimum aktywności w okolicach połowy dekady) — więcej flarów oznacza więcej testów dla satelitów Starlink i systemów GPS.",
        "Parker nie ma konkurencji w prędkości: nawet New Horizons przy Pluto był wolniejszy względem Słońca w peryhelium sondy. Dla popularnonaukowego czytelnika to prosty hook — „sonda szybsza niż pocisk, ale celuje w gwiazdę, nie w planetę”.",
        "Bezpieczeństwo misji: każde perihelion wymaga orientacji tarczy; błąd kilku stopni mógłby przegrzać elektronikę. Zespół APL (Applied Physics Laboratory) publikuje status łączności po każdym przejściu — w czerwcu 2026 oczekuje się kolejnego pakietu danych w archiwum SPDF.",
        "Powiązanie z Roman (start 30 sierpnia 2026): obie misje pokazują skalę budżetu flagowego — Roman mapuje wszechświat, Parker — gwiazdę, od której zależy życie w Układzie. W sekcji Astronomia WSS traktujemy heliofizykę jak astrofizykę lokalną.",
        "Projekt budżetu NASA FY2027 dotyka głównie astrofizyki obserwacyjnej dalekiego kosmosu; Parker jako misja operacyjna ma inny cykl finansowy — ale cięcia science wpływają na analizę danych archiwalnych. Warto śledzić Heliophysics Division w komunikatach.",
        "Źródło: NASA Parker Solar Probe; okładka KSC (przygotowania do startu). Kategoria Astronomia; bez ręcznych linków w HTML treści.",
      ].join("\n\n"),
      contextNote:
        "Parker uzupełnia newsroom po MAVEN i Clipper: Słońce napędza pogodę kosmiczną, która zjada atmosfery planet. Na WSS heliofizyka to most między Astronomią a Misjami załogowymi.",
      categorySlug: "astronomia",
      tags: [
        "Parker Solar Probe",
        "NASA",
        "Słońce",
        "wiatr słoneczny",
        "Solar Orbiter",
        "ESA",
        "heliofizyka",
        "burze słoneczne",
        "perihelion",
        "APL",
      ],
      coverImage: nasaCoverUrl("KSC-20180419-PH_KLS01_0047"),
      coverImageCredit: "NASA / Kim Shiflett",
      source: "NASA",
      originalUrl: "https://science.nasa.gov/mission/parker-solar-probe/",
      readingTime: 10,
    },
  {
      slug: "nasa-dragonfly-titan-testy-wiatrakow-2026",
      title:
        "Dragonfly na Titanie: NASA testuje wirniki w tunelu, misja do 2028 startu",
      subtitle:
        "Octocopter ma latać w gęstym atmosferze metanowej księżyca Saturna — w 2026 zespół JHU APL kalibruje aerodynamikę przed integracją.",
      excerpt:
        "Misja Dragonfly wyśle drona do atmosfery Tytana (księżyc Saturna), gdzie gęstość powietrza i niska grawitacja umożliwiają loty jak helikopterem na Ziemi. W czerwcu 2026 NASA i Johns Hopkins APL publikują postęp testów wirników w tunelach wiatrowych przed planowanym startem w 2028.",
      content: [
        "Dragonfly to misja New Frontiers klasy — po New Horizons, Juno i OSIRIS-REx — mająca wysłać wielowirnikowy lądownik na Tytana, największy księżyc Saturna. Titan ma gęstą atmosferę azotową z metanem, na powierzchni — jeziora i rzeki węglowodorów, nie wody. Start planowany na 2028 (harmonogram NASA, weryfikowany kwartalnie).",
        "W 2026 zespół Johns Hopkins Applied Physics Laboratory testuje wirniki i silniki w tunelach aerodynamicznych symulujących gęstość atmosfery Tytana (~1,5 bara, 4× gęściej niż Ziemia przy 1/7 g). Loty na Titanie są energetycznie tańsze niż na Marsie — stąd koncepcja skakania między punktami naukowymi zamiast jednego statycznego łazika.",
        "Instrumenty: mas spektrometr, gamma-ray spectrometer, meteorology suite — mają zbadać chemii prebiotyczną i cykle metanu. Titan jest laboratorium Ziemi sprzed życia bez tlenu, z organiczną mgłą — dane uzupełniają Cassini-Huygens (lądownik Huygens 2005, dane archiwalne nadal analizowane).",
        "Wyzwania: temperatura ok. −179 °C, brak światła słonecznego na powierzchni (mgła), łączność z Ziemią z opóźnieniem godzin. Dragonfly będzie komunikować się przez orbiter przekaźnikowy — architektura podobna do Marsa, ale czasy lotu znacznie dłuższe.",
        "Budżet i harmonogram Dragonfly były już przesuwane w przeszłości; FY2027 w USA grozi cięciami programów planetarnych — misja musi utrzymać milestone’y integracji w 2026, by nie stracić kolejki startowej na SLS lub alternatywnym nośniku (decyzja programowa, nie potwierdzona w tym artykule).",
        "Porównanie z Ingenuity na Marsie: Mars = rzadka atmosfera, Titan = gęsta. Ingenuity udowodnił, że loty poza Ziemią są możliwe; Dragonfly skaluje to do dziesiątek kilometrów między lądowaniami.",
        "Dla czytelnika WSS Titan to „najdziwniejszy księżyc w Układzie” — news technologiczny w Misjach, nie fantasy. Łączy się z grami (No Man’s Sky w partii 4.06) jako kontrast: prawdziwa chemia metanu vs proceduralna planeta.",
        "ESA nie jest głównym partnerem Dragonfly, ale Huygens (ESA) dostarczył kontekst atmosferyczny — europejskie archiwa nadal współautorują publikacje. Współpraca międzynarodowa w Saturnie wróci przy ewentualnym Enceladus w następnej dekadzie.",
        "Testy 2026 w APL obejmują też autonomię nawigacji — opóźnienie sygnału wymaga lokalnych decyzji AI podobnie jak w łazikach Marsa, ale w 4× gęstszej atmosferze błąd sterowania kończy się szybciej.",
        "Źródło: NASA Dragonfly; okładka NHQ (testy hardware). Status REVIEW w CMS do finalnej publikacji.",
      ].join("\n\n"),
      contextNote:
        "Dragonfly to wizytówka „inżynierii ekstremalnej” — na WSS buduje most między Cassini a przyszłymi misjami lodowych księżyców (Europa, Enceladus) w jednym sezonie redakcyjnym.",
      categorySlug: "misje",
      tags: [
        "Dragonfly",
        "Titan",
        "Saturn",
        "NASA",
        "APL",
        "octocopter",
        "New Frontiers",
        "Cassini",
        "Huygens",
        "metan",
      ],
      coverImage: nasaCoverUrl("NHQ20260109_admin_0007"),
      coverImageCredit: "NASA",
      source: "NASA",
      originalUrl: "https://science.nasa.gov/mission/dragonfly/",
      readingTime: 10,
    },
  {
      slug: "hubble-36-lat-obserwacji-orbita-2026",
      title:
        "Hubble po 36 latach na orbicie: serwisowany teleskop nadal uzupełnia Webb i Roman",
      subtitle:
        "Od kwietnia 1990 HST dostarcza obrazy w widmie optycznym — w 2026 NASA i ESA planują most do Roman i utrzymanie archiwum MAST.",
      excerpt:
        "Kosmiczny Teleskop Hubble’a (HST) od 24 kwietnia 1990 roku krąży na niskiej orbicie okołoziemskiej i obserwuje we wszechświecie od ultrafioletu po bliską podczerwień. W czerwcu 2026, 36 lat po starcie z Discovery, zespół Space Telescope Science Institute publikuje kampanie łączące dane Hubble z James Webb i przygotowuje się na erę Nancy Grace Roman.",
      content: [
        "Hubble Space Telescope (HST) wystartował 24 kwietnia 1990 na pokładzie Space Shuttle Discovery (misja STS-31) — jeden z najważniejszych eksperymentów ludzkości w orbicie, później serwisowany pięciokrotnie przez astronautów (ostatni serwis STS-125, 2009). Dziś, w czerwcu 2026, ma 36 lat od startu i nadal prowadzi obserwacje, choć bez nowych wizyt serwisowych.",
        "Hubble nie konkuruje z James Webb — uzupełnia go: optyka widzialna i UV na Hubble vs podczerwień na Webb. Przykład z tego tygodnia WSS: mgławica Tc 1 w APOD 4 czerwca — Webb (MIRI) mapuje buckyballs, Hubble historycznie dostarczał obrazy wysokiej rozdzielczości w zakresach, gdzie Webb nie patrzy. Roman (start 30 sierpnia 2026) z kolei zrobi survey, Hubble — punkty i legacy programs.",
        "W 2026 Space Telescope Science Institute (STScI) w Baltimore zarządza czasem Hubble, Webb i przygotowaniami Roman. Archiwum MAST (Mikulski Archive) łączy dane trzech er — astronomowie coraz częściej publikują prace multi-mission (ten sam obiekt: Hubble + Webb + ALMA).",
        "Techniczne wyzwania starzejącego się teleskopu: giroskopy, baterie, fine guidance sensors — zespół ground-only utrzymuje precyzję pointing bez serwisu kosmicznego. Każdy rok po 2009 to sukces inżynierii operacyjnej, nie „samoczynna żywotność”.",
        "Naukowo Hubble zmierzył rozszerzanie Wszechświata (Hubble-Lemaître law), odkrył ciemna energia (supernowe SN Ia), fotografował Pillars of Creation, Deep Fields i atmosfery egzoplanet (transity). Liczby: ponad 1,5 mln obserwacji, dziesiątki tysięcy publikacji recenzowanych.",
        "Dla polskich czytelników Hubble to często pierwszy kontakt z astronomią — zdjęcia w podręcznikach. W 2026 media muszą tłumaczyć: „Hubble nie jest martwy”, ale „nie będzie już serwisowany” — różnica kluczowa przy fake news o „końcu teleskopu”.",
        "Budżet NASA utrzymuje operacje Hubble w ramach Astrophysics; cięcia FY2027 dotykają głównie nowych flagowych misji, nie zawsze operacji — ale presja budżetowa może skrócić czas obserwacji. ESA dostarczyła pierwotnie solar arrays i instrumenty — europejskie użycie czasu na Hubble trwa w ramach umów.",
        "Powiązanie z Parker Solar Probe (artykuł w tej partii): Słońce i daleki wszechświat — Hubble rzadko patrzy na Słońce (ochrona detektorów), Parker i Solar Orbiter — tak. Kompletny obraz wymaga wielu misji.",
        "W archiwum MAST czytelnik amatorski może pobrać raw FITS — trend citizen science. WSS zachęca do APOD i galerii Odkrywaj na portalu jako legalne wejście bez piractwa obrazów.",
        "Źródło: NASA Hubble / STScI; okładka NASA Image Library. Kategoria Astronomia; 36. rocznica = kąt newsroom czerwiec 2026.",
      ].join("\n\n"),
      contextNote:
        "Hubble to pamięć i precyzja punktowa — Roman zrobi mapy, Webb spektrum. Na WSS rocznica 36 lat domyka tygodnie Webb+Tc 1+3I/ATLAS jako lekcję „trzech teleskopów, jedna nauka”.",
      categorySlug: "astronomia",
      tags: [
        "Hubble",
        "HST",
        "NASA",
        "STScI",
        "MAST",
        "James Webb",
        "Roman",
        "teleskop",
        "STS-31",
        "astronomia",
      ],
      coverImage: nasaCoverUrl("PIA25701"),
      coverImageCredit: "NASA / STScI",
      source: "NASA / ESA",
      originalUrl: "https://science.nasa.gov/mission/hubble/",
      readingTime: 10,
      featured: false,
      heroPosition: 0,
    }
];
