/**
 * Maps article tags to matching SEO hub pages.
 *
 * Keeps hub matching logic in one place so both the article widget and any
 * future server-side feature share the same rules.
 */

export type HubRef = {
  title: string;
  tagline: string;
  href: string;
  accent: string;
};

type HubMatchRule = {
  /** Article tags (exact strings) that trigger this hub. */
  matchTags: string[];
  hub: HubRef;
};

const HUB_MATCH_RULES: HubMatchRule[] = [
  {
    matchTags: ["NASA"],
    hub: {
      title: "NASA",
      tagline: "Misje, odkrycia i programy kosmiczne agencji NASA",
      href: "/nasa",
      accent: "#1d9bf0",
    },
  },
  {
    matchTags: ["SpaceX"],
    hub: {
      title: "SpaceX",
      tagline: "Starship, Falcon 9, Dragon i rewolucja prywatnego kosmosu",
      href: "/spacex",
      accent: "#e8f0ff",
    },
  },
  {
    matchTags: ["ESA"],
    hub: {
      title: "ESA",
      tagline: "Europejski program kosmiczny, Ariane i misje naukowe",
      href: "/esa",
      accent: "#00b4d8",
    },
  },
  {
    matchTags: ["JWST", "James Webb", "James Webb Space Telescope"],
    hub: {
      title: "James Webb",
      tagline: "Najdalsze okno na Wszechswiat w podczerwieni",
      href: "/jwst",
      accent: "#f97316",
    },
  },
  {
    matchTags: ["Hubble", "Teleskop Hubble'a", "Kosmiczny Teleskop Hubble'a", "HST"],
    hub: {
      title: "Teleskop Hubble'a",
      tagline: "Trzy dekady odkryc astronomicznych na orbicie Ziemi",
      href: "/hubble",
      accent: "#a78bfa",
    },
  },
  {
    matchTags: ["czarna dziura", "czarne dziury", "supermasywne czarne dziury"],
    hub: {
      title: "Czarne dziury",
      tagline: "Horyzonty zdarzen, obrazowanie i odkrycia EHT",
      href: "/czarne-dziury",
      accent: "#7c3aed",
    },
  },
  {
    matchTags: ["egzoplanety"],
    hub: {
      title: "Egzoplanety",
      tagline: "Planety poza Ukladem Slonecznym i poszukiwanie biosygnatur",
      href: "/egzoplanety",
      accent: "#10b981",
    },
  },
  {
    matchTags: ["Mars"],
    hub: {
      title: "Mars",
      tagline: "Laziki, misje i plany zalogowej eksploracji Czerwonej Planety",
      href: "/mars",
      accent: "#ef4444",
    },
  },
  {
    matchTags: ["Księżyc"],
    hub: {
      title: "Księżyc",
      tagline: "Program Artemis, misje lunarne i powrot czlowieka na Srebrny Glob",
      href: "/ksiezyc",
      accent: "#94a3b8",
    },
  },
  {
    matchTags: ["Blue Origin", "New Glenn"],
    hub: {
      title: "Blue Origin",
      tagline: "New Shepard, New Glenn i misja ksiezycowa Blue Moon",
      href: "/blue-origin",
      accent: "#1d6fa4",
    },
  },
  {
    matchTags: ["Starlink"],
    hub: {
      title: "Starlink",
      tagline: "Megakonstelacja satelitow SpaceX i internet z orbity",
      href: "/starlink",
      accent: "#06b6d4",
    },
  },
  {
    matchTags: ["Artemis", "Artemis II", "Artemis III", "SLS"],
    hub: {
      title: "Program Artemis",
      tagline: "Powrot czlowieka na Ksiezyc: SLS, Orion i stacja Gateway",
      href: "/artemis",
      accent: "#f59e0b",
    },
  },
  {
    matchTags: ["ciemna materia"],
    hub: {
      title: "Ciemna materia",
      tagline: "Niewidzialna materia stanowiaca 27 procent wszechswiata",
      href: "/ciemna-materia",
      accent: "#6d28d9",
    },
  },
  {
    matchTags: ["ISS", "Międzynarodowa Stacja Kosmiczna"],
    hub: {
      title: "Stacja kosmiczna",
      tagline: "ISS, expedycje i przyszlosc zalozonych stacji orbitalnych",
      href: "/stacja-kosmiczna",
      accent: "#38bdf8",
    },
  },
];

/**
 * Returns up to `max` hubs whose matchTags overlap with the given article tags.
 * Each hub appears at most once. Order follows HUB_MATCH_RULES priority.
 */
export function getRelatedHubs(articleTags: string[], max = 3): HubRef[] {
  if (!articleTags || articleTags.length === 0) return [];
  const tagSet = new Set(articleTags);
  const result: HubRef[] = [];
  for (const rule of HUB_MATCH_RULES) {
    if (result.length >= max) break;
    if (rule.matchTags.some((t) => tagSet.has(t))) {
      result.push(rule.hub);
    }
  }
  return result;
}
