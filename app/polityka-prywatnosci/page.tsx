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
        Serwis używa cookies niezbędnych do logowania (Supabase) oraz identyfikatora
        przeglądarki przy polubieniach artykułów bez konta. Te pliki są wymagane do
        działania wybranych funkcji i nie wymagają osobnej zgody marketingowej.
      </p>
      <p>
        <strong>Google Analytics 4</strong> (Google Ireland Limited) — po Twojej
        zgodzie w bannerze cookies mierzymy ruch na stronie: liczbę odwiedzin,
        źródła wejść, przeglądane podstrony i zdarzenia zaangażowania (np.
        przewinięcia). Adres IP jest anonimizowany. Podstawą prawną jest zgoda
        (art. 6 ust. 1 lit. a RODO). Zgodę możesz wycofać w dowolnym momencie
        przez link <strong>Ustawienia cookies</strong> w stopce serwisu.
      </p>
      <p>
        Dopóki nie zaakceptujesz analityki, skrypt Google Analytics nie jest
        ładowany. Możesz też ograniczyć cookies w ustawieniach przeglądarki;
        część funkcji (np. konto) może wtedy nie działać poprawnie.
      </p>

      <h2 className="pt-2 text-[17px] font-bold text-text-primary">
        Usuwanie konta
      </h2>
      <p>
        Zalogowany użytkownik może samodzielnie usunąć konto w sekcji{" "}
        <a href="/profil" className="text-accent-cyan hover:underline">
          Profil
        </a>{" "}
        → <strong>Usuń konto</strong>. Operacja jest nieodwracalna i wymaga
        potwierdzenia hasłem.
      </p>
      <p>Po usunięciu konta trwale usuwamy m.in.:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>konto logowania (adres e-mail i hasło),</li>
        <li>komentarze pod artykułami,</li>
        <li>polubienia artykułów i subskrypcje działów,</li>
        <li>zdjęcie profilowe wgrane do serwisu,</li>
        <li>profil użytkownika w bazie Serwisu.</li>
      </ul>
      <p>
        Konta redakcyjne powiązane z artykułami w CMS nie mogą zostać usunięte
        samodzielnie — w takim przypadku skontaktuj się przez{" "}
        <a href="/kontakt" className="text-accent-cyan hover:underline">
          Kontakt
        </a>
        .
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
        Ostatnia aktualizacja: 10 czerwca 2026.
      </p>
    </LegalPageShell>
  );
}
