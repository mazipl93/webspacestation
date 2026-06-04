/**

 * Zdjęcia rzeczywistych obiektów (kosmodromy, rampy).

 * Własne zdjęcia: /public/images/ops-pads/ — pozostałe: Wikimedia / NASA.

 * NIE używamy map_image z Launch Library (podgląd mapy).

 */

const OPS_PAD_IMG = "/images/ops-pads";



export type CosmodromeSpotlight = {

  title: string;

  description: string;

  imageUrl: string;

  imageCredit: string;

  facts: string[];

};



export const ISS_SPOTLIGHT: CosmodromeSpotlight = {
  title: "Międzynarodowa Stacja Kosmiczna (ISS)",
  description:
    "ISS to stale zamieszkana stacja kosmiczna na orbicie okołoziemskiej, pełniąca rolę laboratorium badawczego w warunkach mikrograwitacji. To jedno z najważniejszych miejsc w historii eksploracji kosmosu, gdzie prowadzi się eksperymenty niemożliwe do wykonania na Ziemi.",
  imageUrl: `${OPS_PAD_IMG}/iss.png`,
  imageCredit: "NASA · materiał WSS",
  facts: [
    "ISS jest tak duża, że można ją zobaczyć z Ziemi gołym okiem jako szybko poruszającą się „gwiazdę”.",
    "Jeden dzień na ISS to 16 wschodów i zachodów Słońca.",
    "Stacja waży ok. 420 ton i ma wielkość boiska do piłki nożnej.",
    "Astronauci spędzają tam zwykle 6 miesięcy na jednej misji.",
    "Moduły ISS były budowane i wysyłane w kosmos przez ponad 20 lat.",
  ],
};



type SiteRule = {

  test: (haystack: string) => boolean;

  spotlight: CosmodromeSpotlight;

};



/** Bardziej szczegółowe reguły muszą być pierwsze. */

const SITES: SiteRule[] = [

  {

    test: (h) => /slc-4e|slc-4\s*e|platforma slc-4e/i.test(h),

    spotlight: {

      title: "SLC-4E (Vandenberg, USA) – SpaceX",

      description:

        "Jedna z najważniejszych wyrzutni SpaceX położona nad samym Pacyfikiem w Kalifornii. To stąd startują misje na orbity polarne i słoneczno-synchroniczne, wykorzystywane przez satelity obserwujące Ziemię. Kompleks działa od lat 60. i wcześniej obsługiwał rakiety Atlas oraz Titan.",

      imageUrl: `${OPS_PAD_IMG}/vandenberg-slc-4e.png`,

      imageCredit: "John Kraus · materiał WSS",

      facts: [

        "Startujące stąd rakiety lecą nad oceanem, dzięki czemu nie przelatują nad gęsto zaludnionymi terenami.",

        "To jedyne miejsce, gdzie SpaceX regularnie wykonuje lądowania Falconów na zachodnim wybrzeżu USA.",

        "W 1994 roku z tego kompleksu wystartowała sonda Clementine – jedyna misja księżycowa wystrzelona z Vandenberg.",

      ],

    },

  },

  {

    test: (h) => /slc-40|platforma slc-40|launch complex 40/i.test(h) && !/slc-4e|slc-41/i.test(h),

    spotlight: {

      title: "SLC-40 (Cape Canaveral, USA) – SpaceX",

      description:

        "Najbardziej zapracowana wyrzutnia SpaceX na Florydzie. To właśnie stąd startuje większość satelitów Starlink oraz wiele misji komercyjnych i wojskowych.",

      imageUrl: `${OPS_PAD_IMG}/cape-slc-40.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "W niektórych latach z SLC-40 odbywało się więcej startów niż z jakiejkolwiek innej platformy na świecie.",

        "Po eksplozji Falcona 9 w 2016 roku kompleks został niemal całkowicie odbudowany.",

        "Obecnie jest przygotowany także do obsługi załogowych operacji jako zapasowa infrastruktura dla misji NASA.",

      ],

    },

  },

  {

    test: (h) =>

      /launch area 96|strefa startowa 96|96a|landspace|zhuque/i.test(h) ||

      (/jiuquan|gobi/i.test(h) && /landspace/i.test(h)),

    spotlight: {

      title: "Launch Area 96A (Jiuquan, Chiny) – LandSpace",

      description:

        "Prywatna chińska wyrzutnia wykorzystywana przez firmę LandSpace do startów rakiet Zhuque.",

      imageUrl: `${OPS_PAD_IMG}/jiuquan-launch-area-96a-landspace.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "To stąd wystartowała Zhuque-2 – pierwsza na świecie rakieta na ciekły metan, która osiągnęła orbitę.",

        "Metan jest uznawany za paliwo przyszłości dla wielokrotnego użytku i misji międzyplanetarnych.",

        "LandSpace jest jedną z pierwszych prywatnych firm kosmicznych w Chinach, konkurującą z państwowymi programami.",

      ],

    },

  },

  {

    test: (h) => /yoshinobu|lp-2|lp 2/i.test(h),

    spotlight: {

      title: "Yoshinobu Launch Complex LP-2 (Tanegashima, Japonia)",

      description:

        "Najważniejsza japońska platforma startowa znajdująca się na wyspie Tanegashima. To stąd startują nowoczesne rakiety H-IIA i H3.",

      imageUrl: `${OPS_PAD_IMG}/tanegashima-yoshinobu-lp2.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "Tanegashima jest często nazywana „najpiękniejszym kosmodromem świata” ze względu na tropikalne położenie nad oceanem.",

        "Japonia wysłała stąd sondy badające Księżyc, Marsa i asteroidy.",

        "Platforma znajduje się bliżej równika niż większość kosmodromów państw rozwiniętych, co pomaga oszczędzać paliwo.",

      ],

    },

  },

  {

    test: (h) => /lc-101|platforma lc-101|commercial lc-101/i.test(h),

    spotlight: {

      title: "LC-101 (Wenchang, Chiny) – CASC",

      description:

        "Najnowocześniejsza chińska platforma startowa na wyspie Hainan. Obsługuje rakiety Długi Marsz 5 i Długi Marsz 7.",

      imageUrl: `${OPS_PAD_IMG}/wenchang-lc-101.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "To obecnie główna brama Chin do misji księżycowych i planetarnych.",

        "Kosmodrom znajduje się niemal nad morzem, dzięki czemu ogromne rakiety można transportować statkami.",

        "Właśnie stąd wystartowała pierwsza chińska misja pobrania próbek z Księżyca.",

      ],

    },

  },

  {

    test: (h) =>

      /rocket lab/i.test(h) &&

      /wallops|virginia|lc-2|lc 2|launch complex 2|launch area 0c|mars|mid-atlantic/i.test(h),

    spotlight: {

      title: "Rocket Lab Launch Complex 2 (Wallops, USA)",

      description:

        "Amerykańska wyrzutnia Rocket Lab znajdująca się na wyspie Wallops w stanie Wirginia. Została zbudowana głównie dla rakiet Electron.",

      imageUrl: `${OPS_PAD_IMG}/rocket-lab-lc2-wallops.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "To pierwsza prywatna orbitalna platforma startowa na wschodnim wybrzeżu USA.",

        "Powstała jako uzupełnienie głównego kosmodromu Rocket Lab w Nowej Zelandii.",

        "Dzięki dwóm kosmodromom firma może prowadzić starty praktycznie z obu półkul Ziemi.",

      ],

    },

  },

  {

    test: (h) => /lc-39a|launch complex 39a|pad 39a|platforma slc-39a/i.test(h),

    spotlight: {

      title: "Launch Complex 39A — Kennedy Space Center",

      description:

        "Historyczna rampa LC-39A — Apollo, Shuttle, dziś Falcon 9 / Falcon Heavy i Crew Dragon.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/c/c1/Launch_Complex_39-A_From_Above.jpg",

      imageCredit: "Wikimedia Commons · LC-39A",

      facts: [

        "Widok z góry na samą rampę i infrastrukturę KSC.",

        "SpaceX dzierżawi 39A od NASA.",

        "Tu startował Apollo 11 w drodze na Księżyc.",

      ],

    },

  },

  {

    test: (h) => /starbase|boca chica|south texas/i.test(h),

    spotlight: {

      title: "Starbase (Boca Chica, Teksas)",

      description:

        "Kompleks SpaceX nad Zatoką Meksykańską — hala montażowa Starship, wieża startowa i poligon testowy Super Heavy.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/d/d5/USA_-_Texas_-_Boca_Chica_-_Starbase_(51288496140).jpg",

      imageCredit: "Alexander Hatley · CC BY · Wikimedia Commons",

      facts: [

        "Jedyny port pod pełną integrację Starship + Super Heavy w jednym miejscu.",

        "Widoczny z plaż w South Padre Island — starty przyciągają tłumy.",

        "Cel: załogowy Księżyc (Artemis) i docelowo Mars.",

      ],

    },

  },

  {

    test: (h) => /vandenberg|vafb|slc-6|slc-4w/i.test(h),

    spotlight: {

      title: "Vandenberg SFB — Space Launch Complex 4",

      description:

        "Kalifornijska baza nad Pacyfikiem — orbity polarne i słoneczno-synchroniczne dla satelitów obserwacji Ziemi.",

      imageUrl: `${OPS_PAD_IMG}/vandenberg-slc-4e.png`,

      imageCredit: "John Kraus · materiał WSS",

      facts: [

        "Stąd Falcon 9 wynosi satelity obserwacji Ziemi i misje wojskowe.",

        "Ścieżka nad oceanem — inna geometria niż na Florydzie.",

        "Mgła i wiatr — pogoda bywa trudniejsza niż na Przylądku Canaveral.",

      ],

    },

  },

  {

    test: (h) => /baikonur|tyuratam|gagarin/i.test(h),

    spotlight: {

      title: "Bajkonur — Gagarin’s Start (rampa Sojuz)",

      description:

        "Historyczna rampa Gagarina (Site 1) — stąd w 1961 r. wyleciał Jurij Gagarin; dziś starty Sojuz na ISS.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/5/51/Baikonur_Cosmodrome_Soyuz_launch_pad.jpg",

      imageCredit: "NASA / Bill Ingalls · Wikimedia Commons",

      facts: [

        "Najstarszy czynny port orbitalny świata — step Kazachstanu.",

        "Charakterystyczna „wieża” serwisowa wokół rakiety Sojuz.",

        "Leży na wynajmowanym przez Rosję terytorium Kazachstanu.",

      ],

    },

  },

  {

    test: (h) => /kourou|guiana|guyana|arianespace|ela-3|ela-4|centre spatial/i.test(h),

    spotlight: {

      title: "Centre spatial guyanais (Kourou)",

      description:

        "Europejski port ESA/CNES w Gujanie Francuskiej — rzeczywista wieża startowa ELA-3 (Ariane) w dżungli.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/1/19/Up_close_at_Ariane_Launch_Pad_Centre_Spatial_Guyanais.jpg",

      imageCredit: "Wikimedia Commons · ELA-3 Kourou",

      facts: [

        "Blisko równika — większy ładunek na orbitę dzięki prędkości obrotu Ziemi.",

        "Ariane 6 startuje z nowego ELA-4 obok starszych ramp.",

        "Jedyny europejski kosmodrom dla ciężkich rakiet.",

      ],

    },

  },

  {

    test: (h) => /tanegashima|uchinoura/i.test(h) && !/yoshinobu|lp-2/i.test(h),

    spotlight: {

      title: "Tanegashima Space Center (JAXA)",

      description:

        "Główny kosmodrom Japonii na wyspie Tanegashima — rampy H-IIA, H-IIB i H3.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/a/ac/Global_Precipitation_Measurement_(GPM)_Mission_(12858254354).jpg",

      imageCredit: "NASA / JAXA · Wikimedia Commons",

      facts: [

        "Wyspa na południu Japonii — starty wyłącznie nad Oceanem Spokojnym.",

        "Rakiety wyjeżdżają na rampę z montażowni przed startem.",

        "Stąd lecą satelity naukowe i zaopatrzenie na stację.",

      ],

    },

  },

  {

    test: (h) => /wenchang|hainan/i.test(h) && !/lc-101/i.test(h),

    spotlight: {

      title: "Wenchang Space Launch Site",

      description:

        "Chiński kosmodrom na wyspie Hainan — port przy morzu dla rakiet Długi Marsz 5 i 7.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/3/3c/Wenchang_Space_Launch_Site_02.jpg",

      imageCredit: "Shujianyang · CC BY-SA · Wikimedia Commons",

      facts: [

        "Ułatwiony transport segmentów statków drogą morską.",

        "Stąd startowały moduły stacji Tiangong i misje Chang’e.",

        "Long March 5 — ciężki nośnik na orbitę księżycową.",

      ],

    },

  },

  {

    test: (h) => /jiuquan|gobi|shenzhou/i.test(h),

    spotlight: {

      title: "Jiuquan Satellite Launch Center",

      description:

        "Najstarszy aktywny kosmodrom Chin w pustyni Gobi — na zdjęciu tablica wejścia i wieże startowe w tle.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/0/05/Jiuquan_Satellite_Launch_Center_with_sign.jpg",

      imageCredit: "Sparktour · CC BY-SA · Wikimedia Commons",

      facts: [

        "Pierwszy chiński lot załogowy (Yang Liwei, 2003) startował stąd.",

        "Ekstremalny klimat Gobi — stabilna pogoda poza burzami piaskowymi.",

        "Głównie orbity nachylone i misje rozpoznawcze.",

      ],

    },

  },

  {

    test: (h) => /mahia|launch complex 1/i.test(h) && /rocket lab/i.test(h),

    spotlight: {

      title: "Rocket Lab Launch Complex 1 — Mahia",

      description:

        "Pierwszy komercyjny port orbitalny Rocket Lab na półwyspie Mahia (Nowa Zelandia) — rakiety Electron.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/f/fe/Rocket_Lab_Launch_Complex_1.jpg",

      imageCredit: "Grumpy Eye · CC BY-SA · Wikimedia Commons",

      facts: [

        "Electron — małe satelity i CubeSaty w wysokiej częstotliwości startów.",

        "Widok na Pacyfik — bezpieczna ścieżka nad oceanem.",

        "Główny kosmodrom Rocket Lab na południowej półkuli.",

      ],

    },

  },

  {

    test: (h) => /wallops|virginia|antares|mars/i.test(h) && !/rocket lab/i.test(h),

    spotlight: {

      title: "Mid-Atlantic Regional Spaceport (Wallops, USA)",

      description:

        "Wybrzeże Wirginii — rampy Antares i Electron (MARS) oraz NASA Wallops Flight Facility.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/0/05/Mid-Atlantic_Regional_Spaceport_-_aerial_photo.jpg",

      imageCredit: "NASA Wallops · Wikimedia Commons",

      facts: [

        "Kluczowy dla zaopatrzenia ISS (Northrop Grumman Cygnus).",

        "Także suborbitalne i małe satelity naukowe.",

        "Nocne starty bywają widoczne z wybrzeża USA.",

      ],

    },

  },

  {

    test: (h) => /slc-41|platforma slc-41/i.test(h),

    spotlight: {

      title: "Space Launch Complex 41",

      description:

        "Rampa SLC-41 — Atlas V i Vulcan (ULA) na Przylądku Canaveral.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/9/9b/Aerial_View_of_Launch_Complex_39.jpg",

      imageCredit: "NASA · Wikimedia Commons",

      facts: [

        "W pobliżu LC-39 — ten sam region kosmodromu co KSC.",

        "Stąd m.in. sondy na Marsa i misje wojskowe.",

        "Atlas V startował stąd przez dekady.",

      ],

    },

  },

  {

    test: (h) =>

      /canaveral|kennedy|ksc|lc-39|launch complex 39|space force station/i.test(h) &&

      !/slc-40|slc-41|slc-39a/i.test(h),

    spotlight: {

      title: "Kennedy Space Center — Launch Complex 39",

      description:

        "Widok z lotu na LC-39: Vehicle Assembly Building, rampy 39A i 39B, crawlerway do oceanu.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/9/9b/Aerial_View_of_Launch_Complex_39.jpg",

      imageCredit: "NASA · Wikimedia Commons",

      facts: [

        "VAB — jeden z największych budynków na świecie (montaż rakiet).",

        "Crawlerway łączy montażownię z rampami nad Atlantykiem.",

        "Serce amerykańskiego programu księżycowego i Shuttle.",

      ],

    },

  },

  {

    test: (h) => /plesetsk/i.test(h),

    spotlight: {

      title: "Kosmodrom Plesetsk",

      description:

        "Północna Rosja — wojskowy kosmodrom, rampy Sojuz-2 i historyczne starty.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/b/b7/Plesetsk_Cosmodrome_2017.jpg",

      imageCredit: "Ministerstwo Obrony RF · Wikimedia Commons",

      facts: [

        "Orbity polarne — idealne położenie geograficzne.",

        "Głównie ładunki wojskowe i rosyjskie satelity.",

        "Jeden z najbardziej odludnych kosmodromów.",

      ],

    },

  },

  {

    test: (h) => /sriharikota|satish dhawan|isro/i.test(h),

    spotlight: {

      title: "Satish Dhawan Space Centre (Sriharikota)",

      description:

        "Główny kosmodrom ISRO w Indiach — rampa PSLV na wyspie Sriharikota.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/1/16/PSLV-C52_launch_from_Sriharikota_%28cropped%29.jpg",

      imageCredit: "ISRO · Wikimedia Commons",

      facts: [

        "PSLV i GSLV startują stąd od lat 90.",

        "Wyspa na Zatoce Bengalskiej.",

        "Mars Orbiter Mission (Mangalyaan) wystartował stąd.",

      ],

    },

  },

];



const FALLBACK: CosmodromeSpotlight = {

  title: "Platforma startowa",

  description:

    "Miejsce z harmonogramu Launch Library — współrzędne odpowiadają rzeczywistej rampie nadchodzącego startu.",

  imageUrl:

    "https://upload.wikimedia.org/wikipedia/commons/9/9b/Aerial_View_of_Launch_Complex_39.jpg",

  imageCredit: "NASA · Wikimedia Commons",

  facts: [

    "Dokładna rampa zależy od misji w harmonogramie WSS.",

    "Termin NET może się przesunąć (pogoda, testy, kolejka).",

    "Kliknij inne pinezki — każda to inny kosmodrom na Ziemi.",

  ],

};



export function matchCosmodromeSpotlight(

  label: string,

  sublabel: string

): CosmodromeSpotlight {

  const h = `${label} ${sublabel}`.toLowerCase();

  for (const { test, spotlight } of SITES) {

    if (test(h)) {

      return { ...spotlight };

    }

  }

  const operator = sublabel.trim() || "operator";

  return {

    ...FALLBACK,

    title: label.trim() || FALLBACK.title,

    description: `${FALLBACK.description} Operator: ${operator}.`,

  };

}


