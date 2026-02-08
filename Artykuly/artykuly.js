const bazaArtykulow = [
    // --- DZIAŁ: MELDUNKI (1-11) ---
    {
        id: 1,
        kategoria: 'meldunki',
        tag: 'JWST',
        tytul: 'Woda na egzoplanecie LHS 475 b',
        opis: 'Teleskop Jamesa Webba potwierdził obecność sygnatur pary wodnej w atmosferze skalistej planety.',
        tresc: `<p>Kosmiczny Teleskop Jamesa Webba (JWST) dostarczył przełomowych danych dotyczących planety LHS 475 b. Jest to obiekt o rozmiarach niemal identycznych jak Ziemia, oddalony o zaledwie 41 lat świetlnych od nas.</p><div class="highlight-box">"To pierwszy raz, kiedy z taką pewnością możemy mówić o składzie atmosfery planety skalistej."</div><h2>Analiza widmowa</h2><p>Dzięki instrumentowi NIRSpec, naukowcy przeprowadzili analizę tranzytu. Obecność pary wodnej sugeruje, że procesy geologiczne mogą stale zasilać jej atmosferę.</p>`,
        img: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200',
        link: 'artykul.html?id=1'
    },
    {
        id: 2,
        kategoria: 'meldunki',
        tag: 'SPACEX',
        tytul: 'Starship Flight 7: Sukces Mechazilli',
        opis: 'System przechwytywania Boostera zadziałał bezbłędnie przy siódmym locie testowym.',
        tresc: `<p>SpaceX wykonało kolejny milowy krok. Lot Flight 7 zakończył się spektakularnym przechwyceniem pierwszego stopnia (Super Heavy) przez ramiona wieży startowej Mechazilla.</p><h2>Dane techniczne</h2><p>Rakieta wystartowała ze Starbase w Teksasie. Elon Musk zapowiedział, że Flight 8 będzie już próbą orbitalną z pełnym ładunkiem satelitów Starlink v3.</p>`,
        img: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200',
        link: 'artykul.html?id=2'
    },
    {
        id: 3,
        kategoria: 'meldunki',
        tag: 'ESA',
        tytul: 'Misja JUICE u bram Jowisza',
        opis: 'Sonda przesłała zdjęcia Europy i Ganimedesa wykonane z rekordowej odległości.',
        tresc: `<p>Sonda JUICE zbliża się do celu. Europejska Agencja Kosmiczna potwierdziła, że wszystkie instrumenty naukowe, w tym polski wkład, działają poprawnie.</p><div class="highlight-box">Głównym celem misji jest zbadanie oceanów ukrytych pod lodową skorupą księżyców Jowisza.</div>`,
        img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
        link: 'artykul.html?id=3'
    },
    {
        id: 4,
        kategoria: 'meldunki',
        tag: 'VOYAGER',
        tytul: 'Voyager 1: Nowa komunikacja',
        opis: 'Inżynierowie NASA naprawili błąd pamięci w sondzie oddalonej o 24 mld km.',
        tresc: `<p>Legendarna sonda znów nadaje sensowne dane. Po miesiącach bełkotu binarnego, inżynierowie zdołali zdalnie przeprogramować komputer pokładowy, omijając uszkodzony sektor pamięci sprzed 50 lat.</p>`,
        img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
        link: 'artykul.html?id=4'
    },
    {
        id: 5,
        kategoria: 'meldunki',
        tag: 'MARS',
        tytul: 'Perseverance: Próbki gotowe',
        opis: 'Łazik zdeponował ostatnią kasetę z próbkami skał w kraterze Jezero.',
        tresc: `<p>Misja Mars Sample Return nabiera realnych kształtów. Zebrane materiały zawierają osady rzeczne, które mogą skrywać mikrobiologiczne ślady przeszłości Czerwonej Planety.</p>`,
        img: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=1200',
        link: 'artykul.html?id=5'
    },
    {
        id: 6,
        kategoria: 'meldunki',
        tag: 'MOON',
        tytul: 'VIPER: Polowanie na wodę',
        opis: 'Nowy łazik NASA wylądował w wiecznie zacienionym kraterze Nobile.',
        tresc: `<p>Łazik VIPER rozpoczął swoją misję na południowym biegunie Księżyca. Jego celem jest stworzenie pierwszej mapy zasobów lodu, kluczowego dla przyszłych kolonistów misji Artemis.</p>`,
        img: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200',
        link: 'artykul.html?id=6'
    },
    {
        id: 7,
        kategoria: 'meldunki',
        tag: 'HUBBLE',
        tytul: 'Tajemniczy rozbłysk w M87',
        opis: 'Hubble zaobserwował potężny dżet materii wystrzelony z czarnej dziury.',
        tresc: `<p>Mimo wieku, Teleskop Hubble’a wciąż zaskakuje. Najnowsze obserwacje czarnej dziury w galaktyce M87 wykazały nagłe przyspieszenie dżetu plazmy poruszającego się blisko prędkości światła.</p>`,
        img: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200',
        link: 'artykul.html?id=7'
    },
    {
        id: 8,
        kategoria: 'meldunki',
        tag: 'BLUE ORIGIN',
        tytul: 'New Glenn na stanowisku',
        opis: 'Potężna rakieta wielokrotnego użytku przygotowana do dziewiczego lotu.',
        tresc: `<p>Firma Jeffa Bezosa ukończyła testy silników BE-4. New Glenn ma konkurować z Falconem Heavy, oferując ogromną przestrzeń ładunkową dla przyszłych stacji orbitalnych.</p>`,
        img: 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?w=1200',
        link: 'artykul.html?id=8'
    },
    {
        id: 9,
        kategoria: 'meldunki',
        tag: 'SETI',
        tytul: 'Sygnał z Proxima Centauri',
        opis: 'Radioteleskopy wykryły nietypową emisję z najbliższego układu gwiezdnego.',
        tresc: `<p>Naukowcy z projektu Breakthrough Listen ponownie analizują sygnał BLC1. Nowe algorytmy AI wykluczyły większość zakłóceń ziemskich, co czyni go niezwykle intrygującym.</p>`,
        img: 'https://images.unsplash.com/photo-1457364887197-9150188c107b?w=1200',
        link: 'artykul.html?id=9'
    },
    {
        id: 10,
        kategoria: 'meldunki',
        tag: 'SATURN',
        tytul: 'Pierścienie Saturna znikają',
        opis: 'Najnowsze dane sugerują, że kultowe pasy planety znikną w ciągu 100 mln lat.',
        tresc: `<p>Zjawisko "deszczu pierścieniowego" pochłania materię Saturna szybciej niż sądzono. Lód i pył opadają do atmosfery planety pod wpływem pola magnetycznego.</p>`,
        img: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=1200',
        link: 'artykul.html?id=10'
    },
    {
        id: 11,
        kategoria: 'meldunki',
        tag: 'NASA',
        tytul: 'Misja Psyche rozpoczęta',
        opis: 'Sonda zbliża się do metalicznej asteroidy wartej kwadryliony dolarów.',
        tresc: `<p>Sonda pędzi w kierunku 16 Psyche – obiektu złożonego głównie z żelaza i niklu. Może to być odsłonięte jądro wczesnej planety.</p>`,
        img: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200',
        link: 'artykul.html?id=11'
    },

    // --- DZIAŁ: NAUKA (12-22) ---
    {
        id: 12,
        kategoria: 'nauka',
        tag: 'FIZYKA',
        tytul: 'Horyzont Zdarzeń',
        opis: 'Co dzieje się z materią po przekroczeniu granicy czarnej dziury?',
        tresc: `<p>Fizycy sugerują, że informacja o materii wpadającej do czarnej dziury nie ginie, lecz zostaje zakodowana w promieniowaniu Hawkinga. To rozwiązuje jeden z największych paradoksów nauki.</p>`,
        img: 'https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=1200',
        link: 'artykul.html?id=12'
    },
    {
        id: 13,
        kategoria: 'nauka',
        tag: 'KOSMOLOGIA',
        tytul: 'Mapa Ciemnej Materii',
        opis: 'Nowa mapa dystrybucji niewidzialnej materii w galaktykach.',
        tresc: `<p>Ciemna materia stanowi 27% wszechświata. Nowe mapy soczewkowania grawitacyjnego pokazują, że jej rozkład jest bardziej jednolity, niż zakładali zwolennicy teorii Einsteina.</p>`,
        img: 'https://images.unsplash.com/photo-1506318137071-a8e063b4999d?w=1200',
        link: 'artykul.html?id=13'
    },
    {
        id: 14,
        kategoria: 'nauka',
        tag: 'KWANTY',
        tytul: 'Internet Kwantowy',
        opis: 'Jak splątanie może zrewolucjonizować łączność w kosmosie.',
        tresc: `<p>Splątanie kwantowe pozwala na natychmiastową korelację stanów cząstek. W przyszłości może to oznaczać komunikację z Marsem bez opóźnień radiowych.</p>`,
        img: 'https://images.unsplash.com/photo-1538370910016-0d3c343f5020?w=1200',
        link: 'artykul.html?id=14'
    },
    {
        id: 15,
        kategoria: 'nauka',
        tag: 'SŁOŃCE',
        tytul: 'Maksimum Solarne 2026',
        opis: 'Analiza cyklu słońca i wpływu na ziemskie sieci energetyczne.',
        tresc: `<p>Słońce osiąga szczyt aktywności w obecnym cyklu. Liczne rozbłyski klasy X powodują zorze polarne widoczne nawet w południowej Europie, ale zagrażają satelitom Starlink.</p>`,
        img: 'https://images.unsplash.com/photo-1614728423169-3f65fd722b7e?w=1200',
        link: 'artykul.html?id=15'
    },
    {
        id: 16,
        kategoria: 'nauka',
        tag: 'CZAS',
        tytul: 'Dylatacja Czasu',
        opis: 'Dlaczego czas na orbicie płynie inaczej niż na Ziemi?',
        tresc: `<p>Zgodnie z ogólną teorią względności, słabsza grawitacja na orbicie sprawia, że zegary atomowe tykają tam szybciej. Systemy GPS muszą to korygować co mikrosekundę.</p>`,
        img: 'https://images.unsplash.com/photo-1464802686167-b939a67e06a1?w=1200',
        link: 'artykul.html?id=16'
    },
    {
        id: 17,
        kategoria: 'nauka',
        tag: 'ŻYCIE',
        tytul: 'Życie na Europie?',
        opis: 'Organizmy, które mogłyby przetrwać w oceanach pod lodem.',
        tresc: `<p>Ekstrofile na Ziemi udowadniają, że życie nie potrzebuje słońca. Kominy hydrotermalne pod lodową skorupą księżyca Jowisza – Europy – to najbardziej obiecujące miejsce w Układzie Słonecznym.</p>`,
        img: 'https://images.unsplash.com/photo-1447433589675-4aaa56a4015a?w=1200',
        link: 'artykul.html?id=17'
    },
    {
        id: 18,
        kategoria: 'nauka',
        tag: 'NEBULE',
        tytul: 'Filary Stworzenia',
        opis: 'Nowe zdjęcia z podczerwieni ukazują rodzące się gwiazdy.',
        tresc: `<p>Mgławica Orzeł zawiera gęste kolumny gazu. Dzięki podczerwieni Webba widzimy, jak wewnątrz pyłu zapalają się tysiące nowych słońc.</p>`,
        img: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200',
        link: 'artykul.html?id=18'
    },
    {
        id: 19,
        kategoria: 'nauka',
        tag: 'BIOLOGIA',
        tytul: 'Mózg w Kosmosie',
        opis: 'Jak brak grawitacji zmienia strukturę neuronową.',
        tresc: `<p>Nieważkość wpływa na ciśnienie płynu mózgowo-rdzeniowego. Długie misje mogą trwale zmieniać ostrość wzroku u astronautów (syndrom SANS).</p>`,
        img: 'https://images.unsplash.com/photo-1444090542259-0af8fa96557e?w=1200',
        link: 'artykul.html?id=19'
    },
    {
        id: 20,
        kategoria: 'nauka',
        tag: 'CHEMIA',
        tytul: 'Zagadka Metanu',
        opis: 'Sezonowe skoki metanu na Marsie – czy to geologia czy biologia?',
        tresc: `<p>Łazik Curiosity wykrył cykliczne uwalnianie metanu. Na Ziemi gaz ten produkują organizmy żywe, ale na Marsie może on pochodzić z reakcji skał z wodą pod powierzchnią.</p>`,
        img: 'https://images.unsplash.com/photo-1516339901600-2e1a6298ed34?w=1200',
        link: 'artykul.html?id=20'
    },
    {
        id: 21,
        kategoria: 'nauka',
        tag: 'GEOLOGIA',
        tytul: 'Tunele Lawowe',
        opis: 'Podziemne bazy jako idealne schronienie na Księżycu.',
        tresc: `<p>Księżycowe jaskinie po lawie oferują stałą temperaturę i ochronę przed promieniowaniem kosmicznym. Są to gotowe struktury pod pierwsze ludzkie osady.</p>`,
        img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
        link: 'artykul.html?id=21'
    },
    {
        id: 22,
        kategoria: 'nauka',
        tag: 'MATEMATYKA',
        tytul: 'Geometria Wszechświata',
        opis: 'Złota proporcja widoczna w kształtach spiralnych galaktyk.',
        tresc: `<p>Ciąg Fibonacciego objawia się w naturze w każdej skali – od roślin po ogromne galaktyki. To wynik fundamentalnych praw optymalizacji energii.</p>`,
        img: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1200',
        link: 'artykul.html?id=22'
    },

    // --- DZIAŁ: TECHNOLOGIA (23-34) ---
    {
        id: 23,
        kategoria: 'tech',
        tag: 'NAPĘD',
        tytul: 'Silniki Halla',
        opis: 'Nowa generacja napędów elektrycznych do dalekich misji.',
        tresc: `<p>Silniki plazmowe Halla pozwalają na wielomiesięczną pracę przy minimalnym zużyciu paliwa (ksenonu). To klucz do dotarcia do pasa asteroid.</p>`,
        img: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1200',
        link: 'artykul.html?id=23'
    },
    {
        id: 24,
        kategoria: 'tech',
        tag: 'LASER',
        tytul: 'Łączność Laserowa',
        opis: 'NASA testuje przesył wideo 4K z głębokiego kosmosu.',
        tresc: `<p>Komunikacja optyczna (lasery) oferuje 100-krotnie wyższą przepustowość niż fale radiowe. Przesłanie mapy Marsa zajmie teraz minuty, a nie dni.</p>`,
        img: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1200',
        link: 'artykul.html?id=24'
    },
    {
        id: 25,
        kategoria: 'tech',
        tag: 'AI',
        tytul: 'Sondy Autonomiczne',
        opis: 'AI przejmuje kontrolę nad misjami poza układem słonecznym.',
        tresc: `<p>Z powodu opóźnień w sygnale, sondy muszą same decydować o omijaniu przeszkód. Nowe procesory AI pozwalają na naukę w czasie rzeczywistym.</p>`,
        img: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1200',
        link: 'artykul.html?id=25'
    },
    {
        id: 26,
        kategoria: 'tech',
        tag: 'DRUK 3D',
        tytul: 'Bazy z Pyłu',
        opis: 'Drukarki 3D wykorzystujące regolit jako materiał budowlany.',
        tresc: `<p>Zamiast wozić beton z Ziemi, będziemy topić pył księżycowy laserami, tworząc wytrzymałe kopuły mieszkalne bezpośrednio na miejscu.</p>`,
        img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200',
        link: 'artykul.html?id=26'
    },
    {
        id: 27,
        kategoria: 'tech',
        tag: 'SKAFANDRY',
        tytul: 'Axiom Extravehicular',
        opis: 'Nowe skafandry Artemis zapewniające pełną swobodę ruchu.',
        tresc: `<p>W przeciwieństwie do sztywnych skafandrów z misji Apollo, nowe modele Axiom pozwalają na kucanie, wspinaczkę i obsługę precyzyjnych narzędzi.</p>`,
        img: 'https://images.unsplash.com/photo-1516339901600-2e1a6298ed34?w=1200',
        link: 'artykul.html?id=27'
    },
    {
        id: 28,
        kategoria: 'tech',
        tag: 'ROBOTYKA',
        tytul: 'Canadarm3',
        opis: 'Sztuczna inteligencja w ramieniu stacji Gateway.',
        tresc: `<p>Nowe ramię robotyczne na orbicie Księżyca będzie potrafiło samodzielnie naprawiać stację bez udziału załogi, korzystając z zaawansowanych sensorów dotyku.</p>`,
        img: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200',
        link: 'artykul.html?id=28'
    },
    {
        id: 29,
        kategoria: 'tech',
        tag: 'VR',
        tytul: 'Trening VR',
        opis: 'Symulacje wirtualnej rzeczywistości dla kolonistów Marsa.',
        tresc: `<p>Astronauci spędzają tysiące godzin w VR, ucząc się procedur awaryjnych w symulowanym środowisku niskiej grawitacji i burz pyłowych.</p>`,
        img: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1200',
        link: 'artykul.html?id=29'
    },
    {
        id: 30,
        kategoria: 'tech',
        tag: 'FUSION',
        tytul: 'Energia Fuzji',
        opis: 'Kompaktowe reaktory termojądrowe dla statków międzyplanetarnych.',
        tresc: `<p>Fuzja helu-3 z Księżyca może dostarczyć czystej i niemal nieskończonej energii, pozwalając na skrócenie lotu na Marsa do kilku tygodni.</p>`,
        img: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1200',
        link: 'artykul.html?id=30'
    },
    {
        id: 31,
        kategoria: 'tech',
        tag: 'HYDROGEN',
        tytul: 'Paliwo Wodorowe',
        opis: 'Kriogeniczne systemy przechowywania wodoru na orbicie.',
        tresc: `<p>Największym wyzwaniem jest parowanie wodoru. Nowe technologie izolacji próżniowej pozwalają na tankowanie statków w punktach Lagrange'a.</p>`,
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
        link: 'artykul.html?id=31'
    },
    {
        id: 32,
        kategoria: 'tech',
        tag: 'CYBER',
        tytul: 'Tarcze Magnetyczne',
        opis: 'Sztuczne pole magnetyczne chroniące statki przed promieniowaniem.',
        tresc: `<p>Naukowcy pracują nad nadprzewodzącymi cewkami, które wytworzą wokół statku "bańkę" odchylającą naładowane cząstki wiatru słonecznego.</p>`,
        img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
        link: 'artykul.html?id=32'
    },
    {
        id: 33,
        kategoria: 'tech',
        tag: 'BIO',
        tytul: 'Szklarnie Hydroponiczne',
        opis: 'Samowystarczalne systemy uprawy żywności w kosmosie.',
        tresc: `<p>Uprawa roślin bez gleby, przy użyciu mgły wodnej bogatej w minerały, pozwala na produkcję tlenu i świeżego jedzenia dla załóg stacji Gateway.</p>`,
        img: 'https://images.unsplash.com/photo-1517076731070-13c65bcb2e86?w=1200',
        link: 'artykul.html?id=33'
    },
    {
        id: 34,
        kategoria: 'tech',
        tag: 'NAPĘD',
        tytul: 'VASIMR: Silnik Przyszłości',
        opis: 'Plazmowy napęd o zmiennym impulsie właściwym.',
        tresc: `<p>VASIMR to najbardziej zaawansowany silnik plazmowy. Dzięki niemu podróż na Marsa przestanie być misją samobójczą, a stanie się rutynowym lotem trwającym 90 dni.</p>`,
        img: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1200',
        link: 'artykul.html?id=34'
    }
];