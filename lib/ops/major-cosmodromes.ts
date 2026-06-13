import type { CosmodromeSpotlight } from "@/lib/ops/cosmodrome-photos";

const OPS_PAD = "/images/ops-pads";

const WIKI = {
  slc41:
    "https://upload.wikimedia.org/wikipedia/commons/5/5c/Atlas_V_launch_complex_LC41.jpg",
  vostochny:
    "https://upload.wikimedia.org/wikipedia/commons/c/c3/Soyuz-2.1a_launch_vehicle_carrying_spacecraft_Mikhail_Lomonosov_at_the_launch_pad_at_Vostochny_Launch_Centre.jpg",
  jiuquan:
    "https://upload.wikimedia.org/wikipedia/commons/f/ff/Shenzhou-12_roll_out_01.png",
  sriharikota:
    "https://upload.wikimedia.org/wikipedia/commons/f/f3/PSLV_C-35_at_the_launch_pad.jpg",
} as const;

export type MajorCosmodrome = {
  id: string;
  lat: number;
  lon: number;
  label: string;
  sublabel: string;
  spotlight: CosmodromeSpotlight;
};

/** Aktywne kosmodromy orbitalne — zawsze na mapie WSS (warstwa stała). */
export const MAJOR_COSMODROMES: MajorCosmodrome[] = [
  {
    id: "lc-39a",
    lat: 28.6081,
    lon: -80.604,
    label: "LC-39A · Kennedy Space Center",
    sublabel: "SpaceX · NASA",
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
    id: "slc-40",
    lat: 28.5619,
    lon: -80.5774,
    label: "SLC-40 · Cape Canaveral",
    sublabel: "SpaceX",
    spotlight: {
      title: "SLC-40 (Cape Canaveral, USA) · SpaceX",
      description:
        "Najbardziej zapracowana wyrzutnia SpaceX na Florydzie. Stąd startuje większość satelitów Starlink oraz wiele misji komercyjnych i wojskowych.",
      imageUrl: `${OPS_PAD}/cape-slc-40.png`,
      imageCredit: "Materiał WSS",
      facts: [
        "W niektórych latach z SLC-40 odbywało się więcej startów niż z jakiejkolwiek innej platformy na świecie.",
        "Po eksplozji Falcona 9 w 2016 roku kompleks został niemal całkowicie odbudowany.",
        "Rampa obsługuje też misje załogowe jako zapasowa infrastruktura NASA.",
      ],
    },
  },
  {
    id: "slc-41",
    lat: 28.5831,
    lon: -80.583,
    label: "SLC-41 · Cape Canaveral",
    sublabel: "ULA",
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
    id: "vandenberg-slc-4e",
    lat: 34.632,
    lon: -120.611,
    label: "SLC-4E · Vandenberg",
    sublabel: "SpaceX",
    spotlight: {
      title: "SLC-4E (Vandenberg, USA) · SpaceX",
      description:
        "Jedna z najważniejszych wyrzutni SpaceX położona nad Pacyfikiem w Kalifornii. Stąd startują misje na orbity polarne i słoneczno-synchroniczne, wykorzystywane przez satelity obserwujące Ziemię.",
      imageUrl: `${OPS_PAD}/vandenberg-slc-4e.png`,
      imageCredit: "John Kraus · materiał WSS",
      facts: [
        "Startujące stąd rakiety lecą nad oceanem, bez przelotu nad gęsto zaludnionymi terenami.",
        "To jedyne miejsce, gdzie SpaceX regularnie ląduje boostery Falcon 9 na zachodnim wybrzeżu USA.",
        "Mgła i wiatr nad Pacyfikiem bywają trudniejsze niż warunki na Florydzie.",
      ],
    },
  },
  {
    id: "starbase",
    lat: 25.9971,
    lon: -97.157,
    label: "Starbase · Boca Chica",
    sublabel: "SpaceX",
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
    id: "wallops",
    lat: 37.8331,
    lon: -75.4885,
    label: "Wallops · MARS",
    sublabel: "NASA · Rocket Lab · Northrop",
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
    id: "baikonur",
    lat: 45.9203,
    lon: 63.3422,
    label: "Bajkonur · Gagarin Start",
    sublabel: "Roscosmos",
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
    id: "plesetsk",
    lat: 62.9572,
    lon: 40.5778,
    label: "Plesetsk",
    sublabel: "Roscosmos",
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
    id: "vostochny",
    lat: 51.8844,
    lon: 128.3331,
    label: "Wostochny",
    sublabel: "Roscosmos",
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
    id: "kourou",
    lat: 5.232,
    lon: -52.7694,
    label: "Kourou · ELA-3",
    sublabel: "ESA · Arianespace",
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
    id: "tanegashima",
    lat: 30.4,
    lon: 130.977,
    label: "Tanegashima · Yoshinobu LP-2",
    sublabel: "JAXA",
    spotlight: {
      title: "Yoshinobu Launch Complex LP-2 (Tanegashima, Japonia)",
      description:
        "Najważniejsza japońska platforma startowa na wyspie Tanegashima nad Oceanem Spokojnym. Stąd JAXA wynosi rakiety H-IIA, H-IIB i H3 z satelitami naukowymi i ładunkami na stację.",
      imageUrl: `${OPS_PAD}/tanegashima-yoshinobu-lp2.png`,
      imageCredit: "Materiał WSS",
      facts: [
        "Tanegashima bywa nazywana „najpiękniejszym kosmodromem świata” ze względu na tropikalne położenie.",
        "Japonia wysłała stąd sondy na Księżyc, Marsa i asteroidy.",
        "Starty lecą wyłącznie nad ocean, bez przelotu nad gęstą zabudową.",
      ],
    },
  },
  {
    id: "mahia",
    lat: -39.2617,
    lon: 177.8647,
    label: "Mahia · Rocket Lab LC-1",
    sublabel: "Rocket Lab",
    spotlight: {
      title: "Rocket Lab Launch Complex 1 (Mahia, Nowa Zelandia)",
      description:
        "Pierwszy komercyjny port orbitalny Rocket Lab na półwyspie Mahia. Stąd startują lekkie rakiety Electron z małymi satelitami i CubeSatami w wysokiej częstotliwości.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/f/fe/Rocket_Lab_Launch_Complex_1.jpg",
      imageCredit: "Grumpy Eye · CC BY-SA · Wikimedia Commons",
      facts: [
        "Electron wynosi małe satelity komercyjne i naukowe na niską orbitę okołoziemską.",
        "Ścieżka startu nad Pacyfikiem zapewnia bezpieczny przelot nad oceanem.",
        "Główny kosmodrom Rocket Lab na południowej półkuli Ziemi.",
      ],
    },
  },
  {
    id: "wenchang",
    lat: 19.6145,
    lon: 110.9508,
    label: "Wenchang · LC-101",
    sublabel: "CNSA",
    spotlight: {
      title: "LC-101 (Wenchang, Chiny) · CASC",
      description:
        "Najnowocześniejsza chińska platforma startowa na wyspie Hainan nad Morzem Południowochińskim. Obsługuje ciężkie rakiety Długi Marsz 5 i 7 oraz moduły stacji Tiangong.",
      imageUrl: `${OPS_PAD}/wenchang-lc-101.png`,
      imageCredit: "Materiał WSS",
      facts: [
        "Główna brama Chin do misji księżycowych i planetarnych.",
        "Segmenty rakiet transportuje się statkami. Kosmodrom leży tuż przy morzu.",
        "Stąd wystartowała pierwsza chińska misja pobrania próbek z Księżyca.",
      ],
    },
  },
  {
    id: "jiuquan",
    lat: 40.9606,
    lon: 100.2983,
    label: "Jiuquan",
    sublabel: "CNSA",
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
    id: "sriharikota",
    lat: 13.7331,
    lon: 80.2353,
    label: "Sriharikota · SDSC",
    sublabel: "ISRO",
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

const COSMODROME_BY_ID = new Map(
  MAJOR_COSMODROMES.map((site) => [site.id, site]),
);

/** Maks. odległość dopasowania rampy z harmonogramu do stałego kosmodromu. */
const MATCH_RADIUS_KM = 110;

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

export function getMajorCosmodrome(id: string): MajorCosmodrome | undefined {
  return COSMODROME_BY_ID.get(id);
}

export function getMajorCosmodromeSpotlight(
  siteId: string,
): CosmodromeSpotlight | undefined {
  return COSMODROME_BY_ID.get(siteId)?.spotlight;
}

export function matchPadToMajorCosmodrome(pad: {
  lat: number;
  lon: number;
}): MajorCosmodrome | null {
  let best: { site: MajorCosmodrome; dist: number } | null = null;

  for (const site of MAJOR_COSMODROMES) {
    const dist = haversineKm(pad.lat, pad.lon, site.lat, site.lon);
    if (dist <= MATCH_RADIUS_KM && (!best || dist < best.dist)) {
      best = { site, dist };
    }
  }

  return best?.site ?? null;
}
