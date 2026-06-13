/**

 * Zdjęcia rzeczywistych obiektów (kosmodromy, rampy).

 * Własne zdjęcia: /public/images/ops-pads/ — pozostałe: Wikimedia / NASA.

 * NIE używamy map_image z Launch Library (podgląd mapy).

 */

import { buildPadHaystack } from "@/lib/ops/pad-resolver";

const OPS_PAD_IMG = "/images/ops-pads";

const WIKI = {
  slc41:
    "https://upload.wikimedia.org/wikipedia/commons/5/5c/Atlas_V_launch_complex_LC41.jpg",
  vostochny:
    "https://upload.wikimedia.org/wikipedia/commons/c/c3/Soyuz-2.1a_launch_vehicle_carrying_spacecraft_Mikhail_Lomonosov_at_the_launch_pad_at_Vostochny_Launch_Centre.jpg",
  jiuquan:
    "https://upload.wikimedia.org/wikipedia/commons/f/ff/Shenzhou-12_roll_out_01.png",
  sriharikota:
    "https://upload.wikimedia.org/wikipedia/commons/f/f3/PSLV_C-35_at_the_launch_pad.jpg",
  kwajalein:
    "https://upload.wikimedia.org/wikipedia/commons/1/17/Ronald_Reagan_Ballistic_Missile_Defense_Test_Site_at_Kwajalein_Atoll%2C_Republic_of_the_Marshall_Islands.jpg",
  wenchang:
    "https://upload.wikimedia.org/wikipedia/commons/3/3c/Wenchang_Space_Launch_Site_02.jpg",
  andoya:
    "https://upload.wikimedia.org/wikipedia/commons/6/6e/Black_Brant_IX_launching_from_Andoya.jpg",
} as const;



export type CosmodromeSpotlight = {

  title: string;

  description: string;

  imageUrl: string;

  imageCredit: string;

  /** cover = wypełnienie kadru (lokalne PNG); contain = całe zdjęcie (Wikimedia). */
  imageFit?: "cover" | "contain";

  /** Kadrowanie, np. „center bottom” — gdy cover ucina ważny fragment. */
  imageFocus?: string;

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

      title: "SLC-4E (Vandenberg, USA) · SpaceX",

      description:

        "Jedna z najważniejszych wyrzutni SpaceX położona nad Pacyfikiem w Kalifornii. Stąd startują misje na orbity polarne i słoneczno-synchroniczne, wykorzystywane przez satelity obserwujące Ziemię.",

      imageUrl: `${OPS_PAD_IMG}/vandenberg-slc-4e.png`,

      imageCredit: "John Kraus · materiał WSS",

      facts: [

        "Startujące stąd rakiety lecą nad oceanem, bez przelotu nad gęsto zaludnionymi terenami.",

        "To jedyne miejsce, gdzie SpaceX regularnie ląduje boostery Falcon 9 na zachodnim wybrzeżu USA.",

        "Mgła i wiatr nad Pacyfikiem bywają trudniejsze niż warunki na Florydzie.",

      ],

    },

  },

  {

    test: (h) =>
      /slc-40|platforma slc-40|launch complex 40|space launch complex 40/i.test(h) &&
      !/slc-4e|slc-41/i.test(h),

    spotlight: {

      title: "SLC-40 (Cape Canaveral, USA) · SpaceX",

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

      title: "Launch Area 96A (Jiuquan, Chiny) · LandSpace",

      description:

        "Prywatna chińska wyrzutnia wykorzystywana przez firmę LandSpace do startów rakiet Zhuque.",

      imageUrl: `${OPS_PAD_IMG}/jiuquan-launch-area-96a-landspace.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "Stąd wystartowała Zhuque-2, pierwsza na świecie rakieta na ciekły metan, która osiągnęła orbitę.",

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

        "Najważniejsza japońska platforma startowa na wyspie Tanegashima nad Oceanem Spokojnym. Stąd JAXA wynosi rakiety H-IIA, H-IIB i H3 z satelitami naukowymi i ładunkami na stację.",

      imageUrl: `${OPS_PAD_IMG}/tanegashima-yoshinobu-lp2.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "Tanegashima bywa nazywana „najpiękniejszym kosmodromem świata” ze względu na tropikalne położenie.",

        "Japonia wysłała stąd sondy na Księżyc, Marsa i asteroidy.",

        "Starty lecą wyłącznie nad ocean, bez przelotu nad gęstą zabudową.",

      ],

    },

  },

  {

    test: (h) =>
      /platforma lc-1\b|\blc-1\b|launch pad lc-1|commercial lc-1/i.test(h) &&
      /wenchang|hainan/i.test(h) &&
      !/lc-101|lc-10|lc-11/i.test(h),

    spotlight: {

      title: "LC-1 (Wenchang, Chiny) · CASC",

      description:

        "Platforma startowa Long March 7 na wyspie Hainan. Obsługuje załadunki na orbitę niską i współpracuje z cięższą rampą LC-101 w tym samym kosmodromie.",

      imageUrl: `${OPS_PAD_IMG}/wenchang-lc-101.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "Long March 7 wynosi moduły stacji Tiangong i satelity na orbitę niską.",

        "Wenchang leży nad morzem, co ułatwia transport segmentów statkiem.",

        "LC-101 obok obsługuje cięższe rakiety Long March 5.",

      ],

    },

  },

  {

    test: (h) =>
      /platforma lc-1\b|\blc-1\b|launch pad lc-1/i.test(h) &&
      /jiuquan|gobi|shenzhou/i.test(h) &&
      !/lc-10|lc-11|lc-101|wenchang|hainan|rocket lab|mahia|andoya|andøya|isar|wallops/i.test(h),

    spotlight: {

      title: "LC-1 (Jiuquan, Chiny) · CNSA",

      description:

        "Jedna z głównych platform w Centrum Startowym Jiuquan w pustyni Gobi. Historyczne starty programu załogowego Shenzhou, dziś także misje naukowe.",

      imageUrl: `${OPS_PAD_IMG}/jiuquan-launch-area-96a-landspace.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "Jiuquan to najstarszy chiński kosmodrom, działający od lat 50.",

        "Stąd startowały misje Shenzhou z chińskimi taikonautami.",

        "Pustynny klimat ułatwia obserwację trajektorii startu.",

      ],

    },

  },

  {

    test: (h) => /lc-101|platforma lc-101|commercial lc-101/i.test(h),

    spotlight: {

      title: "LC-101 (Wenchang, Chiny) · CASC",

      description:

        "Najnowocześniejsza chińska platforma startowa na wyspie Hainan nad Morzem Południowochińskim. Obsługuje ciężkie rakiety Długi Marsz 5 i 7 oraz moduły stacji Tiangong.",

      imageUrl: `${OPS_PAD_IMG}/wenchang-lc-101.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "Główna brama Chin do misji księżycowych i planetarnych.",

        "Segmenty rakiet transportuje się statkami. Kosmodrom leży tuż przy morzu.",

        "Stąd wystartowała pierwsza chińska misja pobrania próbek z Księżyca.",

      ],

    },

  },

  {

    test: (h) =>
      /rocket lab/i.test(h) &&
      /lc-2|lc 2|launch complex 2|\(lc-2\)/i.test(h),

    spotlight: {

      title: "Rocket Lab Launch Complex 2 (Wallops, USA)",

      description:

        "Amerykańska wyrzutnia Rocket Lab na wyspie Wallops w stanie Wirginia. Stąd startują rakiety Electron na wschodnim wybrzeżu USA, uzupełniając główny kosmodrom firmy w Mahia.",

      imageUrl: `${OPS_PAD_IMG}/rocket-lab-lc2-wallops.png`,

      imageCredit: "Materiał WSS",

      facts: [

        "To pierwsza prywatna orbitalna platforma startowa na wschodnim wybrzeżu USA.",

        "Powstała jako uzupełnienie Launch Complex 1 na półwyspie Mahia w Nowej Zelandii.",

        "Dzięki dwóm kosmodromom Rocket Lab może startować z obu półkul Ziemi.",

      ],

    },

  },

  {

    test: (h) =>
      /andoya|andøya|nordmela/i.test(h) ||
      (/orbital launch pad/i.test(h) &&
        /isar|spectrum|norway|nordland/i.test(h) &&
        !/rocket lab|mahia|new zealand/i.test(h)),

    spotlight: {

      title: "Andøya Spaceport · Orbital Launch Pad (Norwegia)",

      description:

        "Pierwsza orbitalna rampa w kontynentalnej Europie, przy północnym wybrzeżu Norwegii. Stąd Isar Aerospace startuje rakietą Spectrum na orbity polarne i słoneczno-synchroniczne nad Oceanem Arktycznym.",

      imageUrl: WIKI.andoya,

      imageCredit: "NASA · Wikimedia Commons",

      facts: [

        "Launch Library nazywa tę rampę „Orbital Launch Pad”, bez numeru SLC.",

        "Spectrum wykonuje starty na orbity polarne bez przelotu nad gęstą zabudową.",

        "Andøya Space ma tradycję suborbitalnych startów od 1962 roku.",

      ],

    },

  },

  {

    test: (h) =>
      /rocket lab/i.test(h) &&
      /mahia|launch complex 1|\blc-1\b|new zealand/i.test(h) &&
      !/lc-10|lc-11|lc-101|lc-2|wallops|virginia|andoya|andøya|isar/i.test(h),

    spotlight: {

      title: "Rocket Lab Launch Complex 1 (Mahia, Nowa Zelandia)",

      description:

        "Główny kosmodrom Rocket Lab na półwyspie Mahia nad Pacyfikiem. Stąd startują rakiety Electron z małymi satelitami na niską orbitę okołoziemską.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/f/fe/Rocket_Lab_Launch_Complex_1.jpg",

      imageCredit: "Grumpy Eye · CC BY-SA · Wikimedia Commons",

      facts: [

        "Electron wynosi CubeSaty i małe ładunki komercyjne.",

        "Ścieżka startu nad oceanem zapewnia bezpieczny przelot bez przelotu nad lądem.",

        "Rocket Lab LC-2 w Wallops uzupełnia ten port na półkuli północnej.",

      ],

    },

  },

  {

    test: (h) => /haiyang/i.test(h) &&
      /offshore|launch location|launch site|port/i.test(h),

    spotlight: {

      title: "Port morski Haiyang (Shandong, Chiny)",

      description:

        "Haiyang Oriental Aerospace Port to chiński hub startów morskich na wybrzeżu Morza Żółtego. Rakiety montuje się w porcie, a potem holuje na wyznaczone wody i startuje stamtąd z pokładu statku lub platformy.",

      imageUrl: WIKI.wenchang,

      imageCredit: "Shujianyang · CC BY-SA · Wikimedia Commons",

      facts: [

        "Stąd wyruszają misje CZ-11H, Jielong-3 i Ceres-1 w wersjach morskich.",

        "Pierwszy chiński start z morza w 2019 roku otworzył regularne starty z Żółtego i Wschodniego Morza Chińskiego.",

        "Port skraca łańcuch logistyczny: montaż, testy i załadunek odbywają się przy nabrzeżu, bez transportu lądowego na odległy kosmodrom.",

      ],

    },

  },

  {

    test: (h) =>
      /offshore launch platform|offshore launch location/i.test(h) &&
      !/haiyang/i.test(h),

    spotlight: {

      title: "Pływająca platforma startowa (Chiny, morza wschodnie)",

      description:

        "Mobilna platforma lub statek startowy wykorzystywany przez Chiny do wynoszenia rakiet z morza. Pozwala wybrać szerokość geograficzną startu i unikać przelotów nad gęsto zaludnionymi regionami.",

      imageUrl: WIKI.jiuquan,

      imageCredit: "中国新闻网 · CC BY 4.0 · Wikimedia Commons",

      facts: [

        "CZ-11H startuje z pokładu po zimnym wystrzeleniu z pionowej rury, podobnie jak w wersji mobilnej lądowej.",

        "Platformy bywają holowane w rejon Haiyang, Morza Żółtego lub Morza Południowochińskiego w zależności od orbity docelowej.",

        "Starty morskie obsługują m.in. satelity Jilin-1, Shiyan i misje komercyjne Ceres-1S.",

      ],

    },

  },

  {

    test: (h) =>
      /kwajalein|reagan test site|omelek|marshall islands|rts\b/i.test(h),

    spotlight: {

      title: "Reagan Test Site (Kwajalein Atoll, Wyspy Marshalla)",

      description:

        "Ronald Reagan Ballistic Missile Defense Test Site to amerykański poligon rakietowy na atolach Kwajalein w Oceanii. Historycznie startowały stąd m.in. rakiety SpaceX Falcon 1 z wyspy Omelek, dziś obiekt służy testom obrony antyrakietowej i lotom suborbitalnym.",

      imageUrl: WIKI.kwajalein,

      imageCredit: "U.S. Army · Wikimedia Commons",

      facts: [

        "Kompleks obejmuje kilka wysp atolu Kwajalein, Wake i Aur na obszarze ponad 1,9 mln km² nad Pacyfikiem.",

        "Omelek Island była jedyną rampą SpaceX Falcon 1 poza USA, zanim firma przeniosła się na Przylądek Canaveral.",

        "Poligon testuje interceptory GMD i wspiera programy NASA oraz Space Force w warunkach oceanicznych.",

      ],

    },

  },

  {

    test: (h) => /lc-39a|launch complex 39a|pad 39a|platforma slc-39a/i.test(h),

    spotlight: {

      title: "Launch Complex 39A (Kennedy Space Center, USA)",

      description:

        "Historyczna rampa na Przylądku Canaveral, z której startowały Apollo i prom kosmiczne. Dziś SpaceX wynosi stąd Falcon 9, Falcon Heavy i załogowe Crew Dragon na orbitę i ISS.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/c/c1/Launch_Complex_39-A_From_Above.jpg",

      imageCredit: "Wikimedia Commons · LC-39A",

      facts: [

        "SpaceX dzierżawi 39A od NASA od 2014 roku.",

        "Stąd wyruszył Apollo 11 w drodze na Księżyc w 1969 roku.",

        "Załogowe misje Crew Dragon na ISS startują stąd regularnie.",

      ],

    },

  },

  {

    test: (h) => /starbase|boca chica|south texas/i.test(h),

    spotlight: {

      title: "Starbase (Boca Chica, Teksas)",

      description:

        "Kompleks SpaceX nad Zatoką Meksykańską z halą montażową Starship, wieżą startową i poligonem testowym Super Heavy. To tutaj SpaceX rozwija w pełni wielokrotnego użytku system na Księżyc i Marsa.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/d/d5/USA_-_Texas_-_Boca_Chica_-_Starbase_(51288496140).jpg",

      imageFit: "cover",

      imageFocus: "center 58%",

      imageCredit: "Alexander Hatley · CC BY · Wikimedia Commons",

      facts: [

        "Jedyny port pod pełną integrację Starship i Super Heavy w jednym miejscu.",

        "Starty są widoczne z plaż South Padre Island i przyciągają tłumy obserwatorów.",

        "Starship ma obsłużyć załogowy Księżyc w programie Artemis i docelowo loty na Marsa.",

      ],

    },

  },

  {

    test: (h) => /vandenberg|vafb|slc-6|slc-4w/i.test(h),

    spotlight: {

      title: "SLC-4E (Vandenberg, USA) · SpaceX",

      description:

        "Jedna z najważniejszych wyrzutni SpaceX położona nad Pacyfikiem w Kalifornii. Stąd startują misje na orbity polarne i słoneczno-synchroniczne, wykorzystywane przez satelity obserwujące Ziemię.",

      imageUrl: `${OPS_PAD_IMG}/vandenberg-slc-4e.png`,

      imageCredit: "John Kraus · materiał WSS",

      facts: [

        "Startujące stąd rakiety lecą nad oceanem, bez przelotu nad gęsto zaludnionymi terenami.",

        "To jedyne miejsce, gdzie SpaceX regularnie ląduje boostery Falcon 9 na zachodnim wybrzeżu USA.",

        "Mgła i wiatr nad Pacyfikiem bywają trudniejsze niż warunki na Florydzie.",

      ],

    },

  },

  {

    test: (h) => /baikonur|tyuratam|gagarin/i.test(h),

    spotlight: {

      title: "Bajkonur · Gagarin's Start (rampa Sojuz)",

      description:

        "Historyczna rampa Gagarina (Site 1) w stepie Kazachstanu. Stąd w 1961 roku wyleciał Jurij Gagarin, a dziś startują rakiety Sojuz z załogami i ładunkami na ISS.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/5/51/Baikonur_Cosmodrome_Soyuz_launch_pad.jpg",

      imageFit: "contain",

      imageCredit: "NASA / Bill Ingalls · Wikimedia Commons",

      facts: [

        "Najstarszy czynny port orbitalny świata, działający od lat 50.",

        "Charakterystyczna ruchoma wieża serwisowa otacza rakietę Sojuz przed startem.",

        "Kosmodrom leży na terytorium wynajmowanym przez Rosję od Kazachstanu.",

      ],

    },

  },

  {

    test: (h) => /kourou|guiana|guyana|arianespace|ela-3|ela-4|centre spatial/i.test(h),

    spotlight: {

      title: "Centre spatial guyanais (Kourou, Gujana Francuska)",

      description:

        "Europejski kosmodrom ESA i CNES w tropikalnej dżungli Gujany Francuskiej. Stąd startują rakiety Ariane z ramp ELA-3 i nowego ELA-4, w tym Ariane 6.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/1/19/Up_close_at_Ariane_Launch_Pad_Centre_Spatial_Guyanais.jpg",

      imageCredit: "Wikimedia Commons · ELA-3 Kourou",

      facts: [

        "Bliskość równika daje większy ładunek na orbitę dzięki prędkości obrotu Ziemi.",

        "Jedyny europejski kosmodrom dla ciężkich rakiet orbitalnych.",

        "Ariane 6 startuje z ELA-4 obok starszych ramp Ariane 5.",

      ],

    },

  },

  {

    test: (h) => /tanegashima|uchinoura/i.test(h) && !/yoshinobu|lp-2/i.test(h),

    spotlight: {

      title: "Tanegashima Space Center (JAXA, Japonia)",

      description:

        "Główny kosmodrom Japonii na wyspie Tanegashima z rampami H-IIA, H-IIB i H3 nad Oceanem Spokojnym.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/a/ac/Global_Precipitation_Measurement_(GPM)_Mission_(12858254354).jpg",

      imageCredit: "NASA / JAXA · Wikimedia Commons",

      facts: [

        "Wyspa na południu Japonii. Starty lecą wyłącznie nad Oceanem Spokojnym.",

        "Rakiety wyjeżdżają na rampę z montażowni przed startem.",

        "Stąd lecą satelity naukowe i zaopatrzenie na stację.",

      ],

    },

  },

  {

    test: (h) => /wenchang|hainan/i.test(h) && !/lc-101|\blc-1\b/i.test(h),

    spotlight: {

      title: "Wenchang Space Launch Site (Hainan, Chiny)",

      description:

        "Chiński kosmodrom na wyspie Hainan nad morzem, z rampami dla rakiet Długi Marsz 5 i 7 oraz modułów stacji Tiangong.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/3/3c/Wenchang_Space_Launch_Site_02.jpg",

      imageCredit: "Shujianyang · CC BY-SA · Wikimedia Commons",

      facts: [

        "Ułatwiony transport segmentów statków drogą morską.",

        "Stąd startowały moduły stacji Tiangong i misje Chang’e.",

        "Long March 5 to ciężki nośnik na orbitę księżycową.",

      ],

    },

  },

  {

    test: (h) => /taiyuan|shanxi/i.test(h) && !/jiuquan|gobi/i.test(h),

    spotlight: {

      title: "Taiyuan Satellite Launch Center (Shanxi, Chiny)",

      description:

        "Kosmodrom na północy Chin, w górach prowincji Shanxi. Stąd startują głównie satelity na orbity polarne i słoneczno-synchroniczne, w tym misje Fengyun i Gaofen.",

      imageUrl: WIKI.jiuquan,

      imageCredit: "中国新闻网 · CC BY 4.0 · Wikimedia Commons",

      facts: [

        "Położenie na północy sprzyja wynoszeniu ładunków na orbity o wysokim nachyleniu.",

        "Rakiety Long March 2C, 4B i 6 startują stąd regularnie.",

        "Jeden z trzech głównych kosmodromów państwowych CNSA obok Jiuquan i Xichang.",

      ],

    },

  },

  {

    test: (h) => /xichang|sichuan/i.test(h) && !/wenchang|hainan/i.test(h),

    spotlight: {

      title: "Xichang Satellite Launch Center (Sichuan, Chiny)",

      description:

        "Kosmodrom w górach prowincji Sichuan, wykorzystywany do geostacjonarnych i nawigacyjnych satelitów BeiDou oraz misji księżycowych Chang'e.",

      imageUrl: WIKI.jiuquan,

      imageCredit: "中国新闻网 · CC BY 4.0 · Wikimedia Commons",

      facts: [

        "Stąd startowały sondy Chang'e na Księżyc i misje BeiDou.",

        "Rampa leży w kotlinie górskim, co wymaga precyzyjnych okien pogodowych.",

        "Long March 3A/B/C to główne nośniki z tego portu.",

      ],

    },

  },

  {

    test: (h) => /jiuquan|gobi|shenzhou/i.test(h),

    spotlight: {

      title: "Jiuquan Satellite Launch Center (Gobi, Chiny)",

      description:

        "Najstarszy aktywny kosmodrom Chin w pustyni Gobi. Stąd startowały misje załogowe Shenzhou, a dziś także prywatne rakiety LandSpace Zhuque i ładunki naukowe.",

      imageUrl: WIKI.jiuquan,

      imageCredit: "中国新闻网 · CC BY 4.0 · Wikimedia Commons",

      facts: [

        "Pierwszy chiński lot załogowy Yang Liweiego w 2003 roku startował stąd.",

        "Ekstremalny klimat Gobi daje stabilną pogodę poza burzami piaskowymi.",

        "Launch Area 96A obsługuje prywatne starty LandSpace Zhuque na ciekłym metanie.",

      ],

    },

  },

  {


    test: (h) => /wallops|virginia|antares|mars/i.test(h) && !/rocket lab/i.test(h),

    spotlight: {

      title: "Mid-Atlantic Regional Spaceport (Wallops, USA)",

      description:

        "Kosmodrom na wybrzeżu Wirginii obsługujący Antares, Electron Rocket Lab i misje NASA Wallops Flight Facility. Ważny węzeł zaopatrzenia stacji kosmicznej na wschodnim wybrzeżu USA.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/0/05/Mid-Atlantic_Regional_Spaceport_-_aerial_photo.jpg",

      imageFit: "cover",

      imageFocus: "center 52%",

      imageCredit: "NASA Wallops · Wikimedia Commons",

      facts: [

        "Stąd regularnie startują statki zaopatrzeniowe Cygnus na ISS.",

        "Rocket Lab LC-2 uzupełnia główny kosmodrom firmy w Mahia na południowej półkuli.",

        "Nocne starty bywają widoczne z wybrzeża wschodniego USA.",

      ],

    },

  },

  {

    test: (h) => /slc-41|platforma slc-41|launch complex 41|space launch complex 41/i.test(h),

    spotlight: {

      title: "Space Launch Complex 41 (Cape Canaveral, USA) · ULA",

      description:

        "Jedna z kluczowych ramp United Launch Alliance na Florydzie. Stąd startują rakiety Atlas V, a od niedawna także Vulcan Centaur z misjami naukowymi, wojskowymi i planetarnymi.",

      imageUrl: WIKI.slc41,

      imageCredit: "NASA · KSC-05PD-2401 · Wikimedia Commons",

      facts: [

        "Leży w tym samym regionie co LC-39, w sercu kosmodromu Przylądku Canaveral.",

        "Stąd wystartowały m.in. sondy na Marsa i misje wojskowe USA.",

        "Vulcan Centaur stopniowo zastępuje Atlas V w długoterminowych kontraktach.",

      ],

    },

  },

  {

    test: (h) =>

      /canaveral|kennedy|ksc|lc-39|launch complex 39|space force station/i.test(h) &&

      !/slc-40|slc-41|slc-39a/i.test(h),

    spotlight: {

      title: "Kennedy Space Center · Launch Complex 39",

      description:

        "Widok z lotu na LC-39: Vehicle Assembly Building, rampy 39A i 39B, crawlerway do oceanu.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/9/9b/Aerial_View_of_Launch_Complex_39.jpg",

      imageCredit: "NASA · Wikimedia Commons",

      facts: [

        "VAB to jeden z największych budynków na świecie, służący do montażu rakiet.",

        "Crawlerway łączy montażownię z rampami nad Atlantykiem.",

        "Serce amerykańskiego programu księżycowego i Shuttle.",

      ],

    },

  },

  {

    test: (h) => /vostochny|wostochny|kosmodrom wostoczny|site 1s/i.test(h),

    spotlight: {

      title: "Kosmodrom Wostochny (Amur, Rosja)",

      description:

        "Najnowszy rosyjski port orbitalny na Dalekim Wschodzie, zbudowany na terytorium Rosji. Obsługuje Sojuz-2, a w przyszłości ma przejąć część startów ciężkich rakiet Angara z Bajkonuru.",

      imageUrl: WIKI.vostochny,

      imageCredit: "kremlin.ru · CC BY 4.0 · Wikimedia Commons",

      facts: [

        "Pierwszy start w 2016 roku. Symbol przeniesienia rosyjskiej astronautyki na własne terytorium.",

        "Infrastruktura przygotowana pod cięższe nośniki Angara-A5.",

        "Położony w lesie taigi, daleko od gęsto zaludnionych regionów.",

      ],

    },

  },

  {

    test: (h) => /plesetsk/i.test(h),

    spotlight: {

      title: "Kosmodrom Plesetsk (Arkhangelsk, Rosja)",

      description:

        "Wojskowy kosmodrom w północnej Rosji, zoptymalizowany pod orbity polarne i słoneczno-synchroniczne. Stąd startują Sojuz-2 oraz rosyjskie satelity rozpoznawcze i nawigacyjne.",

      imageUrl:

        "https://upload.wikimedia.org/wikipedia/commons/b/b7/Plesetsk_Cosmodrome_2017.jpg",

      imageFit: "cover",

      imageFocus: "center 48%",

      imageCredit: "Ministerstwo Obrony RF · Wikimedia Commons",

      facts: [

        "Położenie na północy ułatwia wynoszenie ładunków na orbity polarne.",

        "Głównie satelity wojskowe i państwowe, rzadziej misje komercyjne.",

        "Jeden z najbardziej odludnych dużych kosmodromów na świecie.",

      ],

    },

  },

  {

    test: (h) => /sriharikota|satish dhawan|isro/i.test(h),

    spotlight: {

      title: "Satish Dhawan Space Centre (Sriharikota, Indie)",

      description:

        "Główny kosmodrom ISRO na wyspie Sriharikota w Zatoce Bengalskiej. Stąd startują rakiety PSLV i GSLV z satelitami naukowymi, nawigacyjnymi i misjami planetarnymi.",

      imageUrl: WIKI.sriharikota,

      imageCredit: "ISRO · GODL · Wikimedia Commons",

      facts: [

        "PSLV i GSLV startują stąd regularnie od lat 90.",

        "Mars Orbiter Mission (Mangalyaan) wystartował stąd w 2013 roku.",

        "Misje Chandrayaan na Księżyc to kolejny filar programu ISRO z tego portu.",

      ],

    },

  },

];



const FALLBACK: CosmodromeSpotlight = {

  title: "Platforma startowa",

  description:

    "Rampa startowa powiązana z nadchodzącym lotem w harmonogramie WSS.",

  imageUrl: WIKI.slc41,

  imageCredit: "NASA · Wikimedia Commons",

  facts: [

    "Termin NET w harmonogramie może się przesunąć z powodu pogody, testów technicznych lub kolejki na rampie.",

    "Operator startu wskazuje firmę lub agencję odpowiedzialną za nadchodzącą misję.",

    "Współrzędne rampy pochodzą z Launch Library i wskazują realne miejsce startu na mapie.",

  ],

};



function normalizePadHaystack(
  label: string,
  sublabel: string,
  context?: { ll2Label?: string; lat?: number; lon?: number },
): string {
  return buildPadHaystack({
    label: context?.ll2Label?.trim() || label,
    provider: sublabel,
    lat: context?.lat,
    lon: context?.lon,
  });
}

export type PadSpotlightContext = {
  ll2Label?: string;
  lat?: number;
  lon?: number;
};

export function matchCosmodromeSpotlight(
  label: string,
  sublabel: string,
  context?: PadSpotlightContext,
): CosmodromeSpotlight {
  const h = normalizePadHaystack(label, sublabel, context);

  for (const { test, spotlight } of SITES) {

    if (test(h)) {

      return { ...spotlight };

    }

  }

  const name = label.trim() || FALLBACK.title;

  const operator = sublabel

    .replace(/\s*·\s*start w harmonogramie\s*$/i, "")

    .trim();

  return {

    ...FALLBACK,

    title: name,

    description: operator

      ? `${name} to rampa startowa w harmonogramie WSS. Operator nadchodzącej misji: ${operator}.`

      : `${name} to rampa startowa powiązana z nadchodzącym startem w harmonogramie WSS.`,

  };

}


