// Client-safe slugify (mirrors lib/server/validation.ts but with no Prisma
// import, so it can be bundled into client components).

const PL_CHARS = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g;
const PL_MAP: Record<string, string> = {
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
  Ą: "a", Ć: "c", Ę: "e", Ł: "l", Ń: "n", Ó: "o", Ś: "s", Ź: "z", Ż: "z",
};

export function slugify(input: string): string {
  return input
    .normalize("NFC")
    .replace(PL_CHARS, (c) => PL_MAP[c] ?? c)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}
