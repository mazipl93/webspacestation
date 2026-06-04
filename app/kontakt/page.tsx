import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Skontaktuj się z redakcją Web Space Station — sprawy redakcyjne, techniczne i RODO.",
  alternates: { canonical: `${getSiteUrl()}/kontakt` },
};

export default function ContactPage() {
  return (
    <LegalPageShell title="Kontakt">
      <p>
        Masz pytanie do redakcji, zgłoszenie techniczne lub wniosek dotyczący danych
        osobowych? Napisz do nas — odpowiadamy w miarę możliwości w dni robocze.
      </p>

      <div className="rounded-xl border border-hairline bg-glass px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          E-mail redakcji
        </p>
        <a
          href="mailto:redakcja@webspacestation.pl"
          className="mt-2 block text-[16px] font-semibold text-accent-cyan hover:underline"
        >
          redakcja@webspacestation.pl
        </a>
      </div>

      <h2 className="pt-2 text-[17px] font-bold text-text-primary">
        Inne kanały
      </h2>
      <ul className="space-y-2">
        <li>
          <Link href="/rss" className="text-accent-cyan hover:underline">
            Subskrypcje RSS
          </Link>{" "}
          — aktualności bez konta.
        </li>
        <li>
          Społeczność — linki w stopce serwisu (Discord, YouTube, X i inne).
        </li>
      </ul>

      <h2 className="pt-2 text-[17px] font-bold text-text-primary">
        Dane osobowe (RODO)
      </h2>
      <p>
        Wnioski o dostęp, usunięcie lub sprostowanie danych kieruj na ten sam adres,
        z tematem „RODO”. Szczegóły w{" "}
        <Link href="/polityka-prywatnosci" className="text-accent-cyan hover:underline">
          Polityce prywatności
        </Link>
        .
      </p>
    </LegalPageShell>
  );
}
