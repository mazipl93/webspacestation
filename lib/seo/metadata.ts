import type { Metadata } from "next";

/** Strony utility / konto — nie trafiają do indeksu Google. */
export const SEO_NOINDEX: Metadata["robots"] = {
  index: false,
  follow: false,
};

/** Wyszukiwarka — follow linków, bez indeksu wyników. */
export const SEO_NOINDEX_FOLLOW: Metadata["robots"] = {
  index: false,
  follow: true,
};

/** Placeholder „Wkrótce” — nie indeksujemy do czasu realnej treści. */
export const SEO_COMING_SOON_ROBOTS = SEO_NOINDEX;
