import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Informacje o przetwarzaniu danych osobowych i plikach cookies w serwisie Web Space Station.",
  alternates: { canonical: `${getSiteUrl()}/polityka-prywatnosci` },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Polityka prywatności">
      <p>
        Niniejsza polityka opisuje zasady przetwarzania danych w serwisie{" "}
        <strong>Web Space Station</strong> (dalej: „Serwis”), dostępnym pod adresem{" "}
        {getSiteUrl()}.
      </p>

      <h2 className="pt-2 text-[17px] font-bold text-text-primary">
        Administrator danych
      </h2>
      <p>
        Administratorem danych osobowych jest redakcja Web Space Station. W sprawach
        prywatności skontaktuj się przez stronę{" "}
        <a href="/kontakt" className="text-accent-cyan hover:underline">
          Kontakt
        </a>
        .
      </p>

      <h2 className="pt-2 text-[17px] font-bold text-text-primary">
        Jakie dane zbieramy
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Konto użytkownika</strong> — adres e-mail, nazwa wyświetlana i
          avatar (jeśli podasz), gdy korzystasz z logowania Supabase.
        </li>
        <li>
          <strong>Komentarze</strong> — treść komentarza, identyfikator konta i data
          publikacji.
        </li>
        <li>
          <strong>Newsletter</strong> — adres e-mail podany w formularzu w stopce
          (obecnie zapis lokalny w przeglądarce; pełny backend mailingowy — w
          przygotowaniu).
        </li>
        <li>
          <strong>Logi techniczne</strong> — adres IP, nagłówki przeglądarki i
          podstawowe dane diagnostyczne po stronie hostingu (Vercel) w zakresie
          niezbędnym do działania i bezpieczeństwa Serwisu.
        </li>
      </ul>

      <h2 className="pt-2 text-[17px] font-bold text-text-primary">
        Cele i podstawy prawne
      </h2>
      <p>
        Dane przetwarzamy w celu świadczenia usług Serwisu (konto, komentarze),
        moderacji treści oraz — po uruchomieniu newslettera — wysyłki informacji
        redakcyjnych za Twoją zgodą. Podstawą jest wykonanie umowy o korzystanie z
        Serwisu (art. 6 ust. 1 lit. b RODO) oraz prawnie uzasadniony interes
        administratora (art. 6 ust. 1 lit. f RODO), w tym bezpieczeństwo i
        statystyki techniczne.
      </p>

      <h2 className="pt-2 text-[17px] font-bold text-text-primary">
        Pliki cookies
      </h2>
      <p>
        Serwis może używać cookies sesji niezbędnych do logowania oraz cookies
        preferencji interfejsu. Możesz ograniczyć cookies w ustawieniach
        przeglądarki; część funkcji (np. konto) może wtedy nie działać poprawnie.
      </p>

      <h2 className="pt-2 text-[17px] font-bold text-text-primary">
        Twoje prawa
      </h2>
      <p>
        Przysługuje Ci prawo dostępu do danych, sprostowania, usunięcia,
        ograniczenia przetwarzania, przenoszenia danych, sprzeciwu oraz skargi do
        Prezesa UODO. Żądania realizujemy przez{" "}
        <a href="/kontakt" className="text-accent-cyan hover:underline">
          Kontakt
        </a>
        .
      </p>

      <p className="pt-4 text-[13px] text-text-muted">
        Ostatnia aktualizacja: 4 czerwca 2026.
      </p>
    </LegalPageShell>
  );
}
