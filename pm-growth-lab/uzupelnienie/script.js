/* ==========================================================================
   PM GROWTH LAB — pytania uzupełniające dla Michała Elżbieciaka
   Czysty JavaScript, bez zależności. Wysyłka przez funkcję serverless.
   ========================================================================== */
(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     KONFIGURACJA WYSYŁKI

     ENDPOINT to publiczny adres webhooka n8n, który przyjmuje komplet
     odpowiedzi, składa raport i wysyła go e-mailem. Ten sam wzorzec obsługuje
     formularze Zielonej Pergoli.

     Sam adres webhooka nie jest sekretem. Adres odbiorcy raportu oraz
     poświadczenie skrzynki żyją wyłącznie po stronie n8n i nie występują
     nigdzie w kodzie strony ani w repozytorium.

     Gdyby ENDPOINT był pusty, formularz NIE pokazuje sukcesu — informuje
     wprost, że wysyłka nie jest uruchomiona, i zachowuje odpowiedzi.
     -------------------------------------------------------------------------- */
  var CONFIG = {
    ENDPOINT: 'https://pmresearch.app.n8n.cloud/webhook/36d9c89d-6eb8-461b-b03b-e00527e4968d/pm-growth-lab-uzupelnienie',
    FORM_ID: 'pm-growth-lab-followup-v1',
    TIMEOUT_MS: 25000
  };

  var STORAGE_KEY = 'pmgl.michal.uzupelnienie.v1';
  var TOTAL_QUESTIONS = 51;
  var OTHER = 'Inna odpowiedź';
  var SKIP = 'Nie wiem / omówimy podczas spotkania';
  var YND = ['Tak', 'Nie', 'Nie wiem'];

  var SECTIONS = [
    { n: 1, title: 'PRODUKTY I KIERUNEK ROZWOJU', name: 'Produkty i kierunek rozwoju', lead: 'Zacznijmy od doprecyzowania, który produkt i który kierunek ma napędzać pierwszy lejek.' },
    { n: 2, title: 'KLIENCI SWRN I PROWIZJE', name: 'Klienci SWRN i prowizje', lead: 'Te liczby decydują o tym, czy reklama się spina. Chcemy policzyć wartość klienta dokładnie, a nie w przybliżeniu.' },
    { n: 3, title: 'UTRZYMANIE I PRZYPISYWANIE KLIENTÓW', name: 'Utrzymanie i przypisywanie klientów', lead: 'Przychód odnawialny działa tylko wtedy, gdy klient zostaje przypisany do Ciebie i płaci dłużej niż kilka miesięcy.' },
    { n: 4, title: 'CEL PIERWSZEJ KAMPANII', name: 'Cel pierwszej kampanii', lead: 'Zanim ustalimy budżet, musimy mówić o tym samym, kiedy mówimy „nowy klient”.' },
    { n: 5, title: 'OBECNA BAZA KLIENTÓW I FIRM', name: 'Obecna baza klientów i firm', lead: 'Najtańsze pierwsze wyniki zwykle pochodzą z bazy, którą już masz.' },
    { n: 6, title: 'OBSŁUGA NOWYCH LEADÓW', name: 'Obsługa nowych leadów', lead: 'Lejek jest wart tyle, ile obsługa kontaktów, które wygeneruje.' },
    { n: 7, title: 'WCZEŚNIEJSZE REKLAMY', name: 'Wcześniejsze reklamy', lead: 'Chcemy uniknąć powtórzenia tego, co już raz nie zadziałało.' },
    { n: 8, title: 'MARKA I KOMUNIKACJA', name: 'Marka i komunikacja', lead: 'Zawęźmy nazwę, zakres marki i realny wolumen materiałów.' },
    { n: 9, title: 'ZGODY, LOGOTYPY I FUNDACJA', name: 'Zgody, logotypy i fundacja', lead: 'Zanim cokolwiek opublikujemy, musimy wiedzieć, czego użyć nie wolno.' },
    { n: 10, title: 'BUDŻET I MODEL WSPÓŁPRACY', name: 'Budżet i model współpracy', lead: 'Na koniec ustalmy ramy finansowe i sposób raportowania.' }
  ];

  /* ------------------------------------------------------------- konstruktory */
  function ext(base, o) { if (o) { for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) base[k] = o[k]; } return base; }
  function Q(n, label, spec) { return ext({ id: 'q' + n, n: n, label: label }, spec); }
  function closed(list) { return list.concat([OTHER, SKIP]); }

  /* --------------------------------------------------------------- pytania */
  var SCREENS = [{ type: 'welcome' }];

  function S(n) { SCREENS.push({ type: 'intro', section: n }); }
  function P(section, questions) { SCREENS.push({ type: 'q', section: section, fields: questions }); }

  /* ---- SEKCJA 1 ---------------------------------------------------------- */
  S(1);
  P(1, [Q(1, 'W pierwszym formularzu jako obszar do najmocniejszego rozwoju wskazałeś ubezpieczenia komunikacyjne. Jakie dwa pozostałe obszary chcesz rozwijać najmocniej w ciągu najbliższych 12 miesięcy?', {
    type: 'check', max: 2, help: 'Wybierz maksymalnie dwa obszary.',
    options: closed(['ubezpieczenia na życie', 'ubezpieczenia grupowe', 'ubezpieczenia majątkowe', 'zabezpieczenie emerytalne',
      'inwestycje i oszczędności', 'benefity pracownicze', 'rozwiązania dla firm', 'leasing'])
  })]);
  P(1, [Q(2, 'Jako produkty o największym potencjale wskazałeś benefity dla małych firm, pakiety medyczne i ubezpieczenia dla JDG, ale jako najłatwiejsze i najbardziej dochodowe — emeryturę oraz życie indywidualne. Który kierunek ma być priorytetem nowego lejka?', {
    type: 'radio',
    options: closed(['produkty SWRN generujące stałą prowizję', 'emerytura i życie', 'dwa osobne lejki', 'inny kierunek'])
  })]);
  P(1, [Q(3, 'Gdybyśmy mieli rozpocząć od jednego produktu i jednej grupy klientów, co wybrałbyś osobiście?', {
    type: 'area', rows: 6, placeholder: 'np. karta sportowa dla osób prowadzących jednoosobową działalność'
  })]);
  P(1, [Q(4, 'Co dokładnie rozumiesz przez „benefity dla małych firm”? Jakie konkretne produkty powinny znaleźć się w tej ofercie?', {
    type: 'area', rows: 6
  })]);

  /* ---- SEKCJA 2 ---------------------------------------------------------- */
  S(2);
  P(2, [Q(5, 'Podałeś 98 aktywnych klientów SWRN. Jak wygląda orientacyjny podział tych klientów?', {
    type: 'grid', help: 'Liczby mogą być przybliżone. Jeśli nie znasz podziału, użyj przycisku poniżej.',
    parts: [
      { id: 'grupowe', label: 'Ubezpieczenia grupowe', placeholder: 'np. 40' },
      { id: 'medyczne', label: 'Pakiety medyczne', placeholder: 'np. 25' },
      { id: 'sport', label: 'Karty sportowe', placeholder: 'np. 28' },
      { id: 'pozostale', label: 'Pozostałe produkty', placeholder: 'np. 5' }
    ],
    skipLabel: 'Nie znam dokładnego podziału'
  })]);
  P(2, [Q(6, 'Czy kwota 99 zł oznacza:', {
    type: 'radio',
    options: closed(['średnią miesięczną składkę klienta', 'cenę najpopularniejszego pakietu', 'przykładową wartość'])
  })]);
  P(2, [Q(7, 'W jednym miejscu podałeś prowizję 18%, a w innym 10–15% dla produktów grupowych. Od czego zależy ta różnica?', {
    type: 'area', rows: 5
  })]);
  P(2, [
    Q(8, 'Czy prowizja 18% jest liczona od pełnej kwoty wpłacanej przez klienta?', {
      type: 'radio', options: closed(['tak', 'nie', 'zależy od produktu', 'muszę sprawdzić'])
    }),
    Q(9, 'Czy prowizja 10–15% jest wypłacana przez cały okres opłacania składki?', {
      type: 'radio', options: closed(['tak', 'nie', 'zależy od produktu', 'muszę sprawdzić'])
    })
  ]);
  P(2, [Q(10, 'Co dzieje się z prowizją z produktów emerytalnych po pierwszym roku?', {
    type: 'radio',
    options: closed(['prowizja się kończy', 'prowizja maleje', 'przechodzi w prowizję odnawialną', 'zależy od produktu', 'muszę sprawdzić'])
  })]);
  P(2, [Q(11, 'Co dokładnie oznacza prowizja 50% przy sukcesji i zabezpieczeniu wspólników spółek?', {
    type: 'area', rows: 5, placeholder: 'Od czego liczona, jak długo wypłacana, czy jednorazowo.'
  })]);
  P(2, [Q(12, 'Czy możesz udostępnić anonimowe materiały pokazujące produkty i prowizje?', {
    type: 'check',
    options: closed(['zrzuty ekranu z panelu', 'anonimową tabelę', 'materiały produktowe', 'nie mogę udostępnić', 'muszę sprawdzić']),
    followUp: { id: 'q12_where', label: 'Link albo opis, gdzie znajdują się materiały', type: 'area', rows: 3, placeholder: 'np. link do Dysku Google albo: mam w mailu od SWRN z marca' }
  })]);

  /* ---- SEKCJA 3 ---------------------------------------------------------- */
  S(3);
  P(3, [Q(13, 'Ilu klientów SWRN zrezygnowało w ciągu ostatnich 12 miesięcy?', {
    type: 'text', numeric: true, placeholder: 'np. 12 albo „około 10”', quick: ['Muszę sprawdzić', 'Około — podam szacunek', SKIP]
  })]);
  P(3, [Q(14, 'Jakie są najczęstsze przyczyny rezygnacji?', {
    type: 'check',
    options: closed(['cena', 'brak korzystania z produktu', 'problemy z płatnością', 'zmiana potrzeb', 'zmiana pracy',
      'zakończenie programu', 'zamknięcie wariantu', 'nie mam danych'])
  })]);
  P(3, [Q(15, 'Co dokładnie oznacza wskazane przez Ciebie „ryzyko zamknięcia polisy”?', {
    type: 'check',
    options: closed(['zakończenie całego programu grupowego', 'zmiana warunków przez ubezpieczyciela', 'zamknięcie konkretnego wariantu',
      'utrata ochrony przez pojedynczego klienta', 'muszę doprecyzować'])
  })]);
  P(3, [Q(16, 'Czy możesz sprawdzić, czy klient wchodzący przez Twój link pozostaje przypisany do Ciebie na stałe?', {
    type: 'radio',
    options: closed(['tak, sprawdzę', 'już wiem, że pozostaje', 'już wiem, że nie pozostaje', 'nie mam możliwości sprawdzenia'])
  })]);
  P(3, [Q(17, 'Co dzieje się z przypisaniem klienta, gdy klient:', {
    type: 'matrix',
    rows: ['wraca później bez użycia Twojego linku', 'kupuje kolejny produkt', 'kontaktuje się bezpośrednio z SWRN', 'zmienia wariant'],
    cols: ['pozostaje przypisany', 'może utracić przypisanie', 'nie wiem']
  })]);
  P(3, [Q(18, 'Czy panel SWRN umożliwia:', {
    type: 'matrix',
    rows: ['automatyczne powiadomienia', 'eksport rozpoczętych zapisów', 'eksport rezygnacji', 'eksport aktywnych klientów', 'regularny raport prowizji'],
    cols: YND
  })]);

  /* ---- SEKCJA 4 ---------------------------------------------------------- */
  S(4);
  P(4, [Q(19, 'Co oznacza „aktywny klient” w celu 100 klientów po 90 dniach?', {
    type: 'check', help: 'Możesz wskazać więcej niż jeden warunek.',
    options: closed(['zostawił kontakt', 'odbył rozmowę', 'rozpoczął zapis', 'podpisał umowę', 'opłacił pierwszą składkę',
      'pozostaje aktywny minimum jeden miesiąc'])
  })]);
  P(4, [Q(20, 'Cel 300 klientów w ciągu trzech miesięcy ma obejmować:', {
    type: 'check',
    options: closed(['nowych klientów indywidualnych', 'pracowników pozyskanych firm', 'obecnych klientów, którym sprzedamy dodatkowy produkt',
      'członków rodzin', 'wszystkie grupy razem'])
  })]);
  P(4, [Q(21, 'Jak liczymy klienta rodzinnego?', {
    type: 'radio',
    options: closed(['każda objęta osoba to osobny klient', 'jeden płatnik to jeden klient', 'zależy od produktu', 'musimy wspólnie ustalić'])
  })]);
  P(4, [Q(22, 'Jaki wynik po 90 dniach uznasz za minimalnie akceptowalny, jeżeli 100 aktywnych klientów okaże się nierealne przy początkowym budżecie?', {
    type: 'grid',
    parts: [
      { id: 'klienci', label: 'Minimalna liczba aktywnych klientów', placeholder: 'np. 40' },
      { id: 'przychod', label: 'Minimalny miesięczny przychód odnawialny', placeholder: 'np. 1 500 zł' }
    ]
  })]);

  /* ---- SEKCJA 5 ---------------------------------------------------------- */
  S(5);
  P(5, [Q(23, 'Jak wygląda orientacyjny podział 180 osób, do których możesz się skontaktować?', {
    type: 'grid', help: 'Liczby przybliżone w zupełności wystarczą.',
    parts: [
      { id: 'jdg', label: 'Osoby prowadzące działalność', placeholder: 'np. 60' },
      { id: 'wlasciciele', label: 'Właściciele firm', placeholder: 'np. 20' },
      { id: 'pracownicy', label: 'Pracownicy bez benefitów', placeholder: 'np. 50' },
      { id: 'rodziny', label: 'Rodziny', placeholder: 'np. 30' },
      { id: 'pozostali', label: 'Pozostali klienci indywidualni', placeholder: 'np. 20' }
    ],
    skipLabel: 'Nie znam podziału'
  })]);
  P(5, [Q(24, 'Jakiego rodzaju zgody posiadasz w odniesieniu do tych 180 osób?', {
    type: 'check',
    help: 'To nie jest opinia prawna — potrzebujemy tylko obrazu sytuacji, żeby zaplanować sposób kontaktu.',
    options: closed(['zgoda na kontakt telefoniczny', 'zgoda na e-mail', 'zgoda na SMS', 'zgoda na komunikację marketingową',
      'wyłącznie kontakt związany z obecną umową', 'muszę sprawdzić'])
  })]);
  P(5, [Q(25, 'Opisz osiem firm, którym można potencjalnie zaproponować benefity.', {
    type: 'rep', addLabel: 'Dodaj kolejną firmę', itemLabel: 'Firma',
    help: 'Bez danych osobowych — wystarczy branża, skala i stanowisko osoby decyzyjnej.',
    cols: [
      { id: 'branza', label: 'Branża', placeholder: 'np. transport' },
      { id: 'pracownicy', label: 'Liczba pracowników', type: 'select', options: ['do 5', '5–15', '15–50', '50–250', 'powyżej 250', 'nie wiem'] },
      { id: 'relacja', label: 'Rodzaj relacji', type: 'select', options: ['obecny klient', 'dawny klient', 'znajomość prywatna', 'partner wydarzeń', 'polecenie', 'kontakt zimny'] },
      { id: 'decydent', label: 'Osoba decyzyjna (stanowisko)', placeholder: 'np. właściciel, kadrowa' },
      { id: 'rozmowa', label: 'Czy temat benefitów był poruszany?', type: 'select', options: ['tak', 'nie', 'wstępnie'] }
    ]
  })]);
  P(5, [Q(26, 'Czy partnerzy i sponsorzy wydarzeń mogą być przez Ciebie kontaktowani biznesowo?', {
    type: 'radio',
    options: closed(['tak', 'tak, ale tylko osobiście przeze mnie', 'wymaga dodatkowej zgody', 'nie', 'muszę sprawdzić'])
  })]);

  /* ---- SEKCJA 6 ---------------------------------------------------------- */
  S(6);
  P(6, [Q(27, 'Jakie zadania może wykonywać asystentka?', {
    type: 'check',
    options: closed(['pierwszy kontakt', 'kwalifikacja leada', 'umawianie rozmów', 'przypominanie o niedokończonym zapisie',
      'wysyłanie materiałów', 'obsługa CRM', 'kontakt po zakupie', 'wsparcie administracyjne'])
  })]);
  P(6, [Q(28, 'Do jakich narzędzi asystentka ma dostęp?', {
    type: 'check',
    options: closed(['Tillio', 'poczta', 'WhatsApp', 'Calendly', 'panel SWRN', 'Meta Business Suite'])
  })]);
  P(6, [Q(29, 'Czy możemy odnowić i skonfigurować Calendly z osobnymi rodzajami rozmów?', {
    type: 'radio',
    options: closed(['tak', 'nie', 'chcę najpierw zobaczyć propozycję', 'użyjemy innego narzędzia'])
  })]);
  P(6, [Q(30, 'Czy Tillio umożliwia zapisywanie:', {
    type: 'matrix',
    rows: ['źródła leada', 'kampanii reklamowej', 'zainteresowania produktem', 'etapu sprzedaży', 'wyniku rozmowy', 'podpisania umowy', 'miesięcznej prowizji'],
    cols: YND
  })]);
  P(6, [Q(31, 'Kto powinien aktualizować status leada?', {
    type: 'radio',
    options: closed(['Michał', 'asystentka', 'automatyzacja', 'zależnie od etapu', 'do ustalenia'])
  })]);

  /* ---- SEKCJA 7 ---------------------------------------------------------- */
  S(7);
  P(7, [Q(32, 'Co dokładnie oznacza określenie „słabi klienci” przy wcześniejszych reklamach?', {
    type: 'check',
    options: closed(['przypadkowe kontakty', 'brak budżetu', 'brak odpowiedzi na telefon', 'niewłaściwy wiek',
      'zainteresowanie tylko najniższą ceną', 'brak finalizacji', 'błędne dane'])
  })]);
  P(7, [Q(33, 'Jakie były orientacyjne koszty wcześniejszych kampanii?', {
    type: 'grid',
    parts: [
      { id: 'kontakt', label: 'Koszt jednego kontaktu', placeholder: 'np. 25 zł' },
      { id: 'rozmowa', label: 'Koszt jednej rozmowy', placeholder: 'np. 60 zł' },
      { id: 'klient', label: 'Koszt jednego pozyskanego klienta', placeholder: 'np. 300 zł' }
    ],
    skipLabel: 'Nie posiadam takich danych'
  })]);
  P(7, [
    Q(34, 'Dokąd prowadziły reklamy?', {
      type: 'check', options: closed(['formularz Meta', 'Messenger', 'WhatsApp', 'telefon', 'strona internetowa', 'bezpośrednia oferta'])
    }),
    Q(35, 'Kto prowadził kampanie?', {
      type: 'check', options: closed(['Michał', 'pracownik lub asystentka', 'freelancer', 'agencja'])
    })
  ]);
  P(7, [Q(36, 'Czy możemy otrzymać dostęp analityczny do historycznych kampanii?', {
    type: 'radio', options: closed(['tak', 'nie', 'muszę sprawdzić'])
  })]);

  /* ---- SEKCJA 8 ---------------------------------------------------------- */
  S(8);
  P(8, [Q(37, 'Co najbardziej nie pasuje Ci w nazwie „Benefity bez etatu”?', {
    type: 'check',
    options: closed(['słowo „benefity”', 'określenie „bez etatu”', 'zbyt wąska grupa odbiorców', 'brak związku z ubezpieczeniami',
      'nie pasuje do klientów firmowych', 'cała koncepcja'])
  })]);
  P(8, [Q(38, 'Jak mocno nowa marka powinna być związana z Twoim nazwiskiem?', {
    type: 'scale', low: 'marka całkowicie niezależna', high: 'marka oparta bezpośrednio na nazwisku Michała'
  })]);
  P(8, [Q(39, 'Jak szeroki zakres powinna obejmować nowa marka?', {
    type: 'check',
    options: closed(['ubezpieczenia grupowe', 'pakiety medyczne', 'benefity dla firm', 'emerytura', 'życie indywidualne',
      'sukcesja', 'leasing', 'rozwiązania finansowe', 'tylko jeden wyspecjalizowany produkt'])
  })]);
  P(8, [Q(40, 'Ile krótkich materiałów wideo jesteś realnie w stanie nagrywać?', {
    type: 'radio',
    options: closed(['jeden tygodniowo', 'dwa tygodniowo', 'trzy lub więcej tygodniowo', 'kilka miesięcznie', 'zależnie od przygotowanego scenariusza'])
  })]);
  P(8, [Q(41, 'Kto może odpowiadać za nagrywanie, montaż i publikację?', {
    type: 'grid',
    parts: [
      { id: 'nagrywanie', label: 'Nagrywanie', type: 'select', options: ['Michał', 'asystentka', 'freelancer', 'agencja', 'PM Growth Lab', 'do ustalenia'] },
      { id: 'montaz', label: 'Montaż', type: 'select', options: ['Michał', 'asystentka', 'freelancer', 'agencja', 'PM Growth Lab', 'do ustalenia'] },
      { id: 'publikacja', label: 'Publikacja', type: 'select', options: ['Michał', 'asystentka', 'freelancer', 'agencja', 'PM Growth Lab', 'do ustalenia'] }
    ]
  })]);

  /* ---- SEKCJA 9 ---------------------------------------------------------- */
  S(9);
  P(9, [Q(42, 'Kto może potwierdzić możliwość używania nazw i logotypów partnerów?', {
    type: 'grid', help: 'Bez danych osobowych — wystarczy organizacja albo stanowisko.',
    parts: [
      { id: 'swrn', label: 'SWRN', placeholder: 'np. opiekun partnera' },
      { id: 'ubezpieczyciele', label: 'Ubezpieczyciele', placeholder: 'np. dyrektor oddziału' },
      { id: 'medicover', label: 'Medicover Sport', placeholder: 'np. dział partnerski' },
      { id: 'inni', label: 'Inni partnerzy', placeholder: 'np. koordynator wydarzeń' }
    ]
  })]);
  P(9, [Q(43, 'Czy możesz uzyskać te potwierdzenia przed uruchomieniem reklam?', {
    type: 'radio', options: closed(['tak', 'częściowo', 'nie', 'muszę sprawdzić'])
  })]);
  P(9, [Q(44, 'Jakich granic dotyczących działalności fundacji nie powinniśmy przekraczać?', {
    type: 'area', rows: 6
  })]);
  P(9, [Q(45, 'Czy na stronie biznesowej możemy informować, że jesteś twórcą wydarzeń i angażujesz się społecznie, bez wykorzystywania bazy fundacji do sprzedaży?', {
    type: 'radio', options: closed(['tak', 'nie', 'wymaga omówienia'])
  })]);
  P(9, [Q(46, 'Kto udziela zgody na wykorzystywanie zdjęć z wydarzeń?', {
    type: 'area', rows: 4, placeholder: 'Organizacja, rola albo zasada — bez danych osobowych.'
  })]);

  /* ---- SEKCJA 10 --------------------------------------------------------- */
  S(10);
  P(10, [
    Q(47, 'Budżet reklamowy 1000–2000 zł miesięcznie dotyczy:', {
      type: 'radio', options: closed(['pierwszego miesiąca testowego', 'pierwszych trzech miesięcy', 'stałego budżetu', 'jeszcze nie wiem'])
    }),
    Q(48, 'Czy budżet może zostać zwiększony, jeżeli kampania będzie rentowna?', {
      type: 'radio', options: closed(['tak', 'nie', 'zależy od wyników', 'do ustalenia'])
    })
  ]);
  P(10, [Q(49, 'Jaki sposób rozliczenia za budowę i prowadzenie systemu najbardziej Ci odpowiada?', {
    type: 'radio',
    options: closed(['jednorazowa opłata', 'płatność etapami', 'miesięczny abonament', 'opłata podstawowa i premia za wyniki', 'chcę poznać propozycję'])
  })]);
  P(10, [Q(50, 'Jak często chcesz otrzymywać raport z działania lejka?', {
    type: 'radio',
    options: closed(['raz w tygodniu', 'co dwa tygodnie', 'raz w miesiącu', 'panel dostępny na bieżąco'])
  })]);
  P(10, [Q(51, 'Jakie trzy liczby chcesz widzieć w raporcie w pierwszej kolejności?', {
    type: 'grid',
    parts: [
      { id: 'l1', label: 'Liczba nr 1', placeholder: 'np. koszt pozyskania klienta' },
      { id: 'l2', label: 'Liczba nr 2', placeholder: 'np. liczba aktywnych klientów' },
      { id: 'l3', label: 'Liczba nr 3', placeholder: 'np. miesięczny przychód odnawialny' }
    ]
  })]);

  SCREENS.push({ type: 'review' });
  SCREENS.push({ type: 'sent' });

  var QUESTIONS = [];
  SCREENS.forEach(function (s) { (s.fields || []).forEach(function (f) { QUESTIONS.push(f); }); });

  /* ------------------------------------------------------------------ stan */
  var state = {
    answers: {}, index: 0, savedAt: null,
    submissionId: null, sentAt: null
  };
  var wiping = false;
  var pendingFocus = null;

  var el = {
    screen: document.getElementById('screen'),
    navbar: document.getElementById('navbar'),
    back: document.getElementById('btnBack'),
    next: document.getElementById('btnNext'),
    progress: document.getElementById('progress'),
    fill: document.getElementById('progressFill'),
    stage: document.getElementById('progressStage'),
    percent: document.getElementById('progressPercent'),
    saved: document.getElementById('savedFlag'),
    savedText: document.getElementById('savedText'),
    reset: document.getElementById('btnReset'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    modalActions: document.getElementById('modalActions'),
    toast: document.getElementById('toast')
  };

  /* ------------------------------------------------------------ localStorage */
  function save() {
    if (wiping) return;
    state.savedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        answers: state.answers, index: state.index, savedAt: state.savedAt,
        submissionId: state.submissionId, sentAt: state.sentAt
      }));
      flashSaved('Odpowiedzi zapisane');
    } catch (e) { flashSaved('Zapis niemożliwy w tej przeglądarce'); }
  }
  var saveTimer = null;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 350); }
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      return d && typeof d === 'object' && d.answers ? d : null;
    } catch (e) { return null; }
  }

  var flashTimer = null;
  function flashSaved(text) {
    el.savedText.textContent = text || 'Odpowiedzi zapisane';
    el.saved.classList.add('is-visible');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { el.saved.classList.remove('is-visible'); }, 2200);
  }
  var toastTimer = null;
  function toast(text) {
    el.toast.textContent = text;
    el.toast.hidden = false;
    requestAnimationFrame(function () { el.toast.classList.add('is-visible'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.classList.remove('is-visible');
      setTimeout(function () { el.toast.hidden = true; }, 260);
    }, 2800);
  }

  /* ---------------------------------------------------------------- render */
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function sectionOf(n) { return SECTIONS[n - 1] || { n: n, title: '', name: '', lead: '' }; }
  function noteId(f) { return f.id + '__note'; }
  function otherId(f) { return f.id + '__other'; }
  function skipId(f) { return f.id + '__skip'; }

  function render(opts) {
    opts = opts || {};
    var s = SCREENS[state.index];
    el.screen.innerHTML = '';
    if (!opts.keepScroll) {
      el.screen.classList.remove('is-entering');
      void el.screen.offsetWidth;
      el.screen.classList.add('is-entering');
    }

    if (s.type === 'welcome') renderWelcome();
    else if (s.type === 'intro') renderIntro(s);
    else if (s.type === 'review') renderReview();
    else if (s.type === 'sent') renderSent();
    else renderQuestions(s);

    updateChrome(s);

    if (opts.keepScroll) {
      if (pendingFocus) {
        var back = document.getElementById(pendingFocus);
        if (back) back.focus({ preventScroll: true });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      el.screen.focus({ preventScroll: true });
    }
    pendingFocus = null;
  }
  function rerender(focusId) { pendingFocus = focusId || null; render({ keepScroll: true }); }

  function renderWelcome() {
    var c = el.screen;
    c.appendChild(h('p', 'eyebrow', 'Pytania uzupełniające'));
    c.appendChild(h('h1', 'screen-title', 'Cześć Michał.'));
    c.appendChild(h('p', 'lead', 'Dziękuję za wypełnienie pierwszego formularza.'));
    c.appendChild(h('p', 'lead', 'Twoje odpowiedzi pozwoliły nam już określić najważniejsze kierunki projektu. Zostało kilka kwestii, które musimy doprecyzować przed przygotowaniem ostatecznej strategii, nowej strony i pierwszego lejka sprzedażowego.'));
    var l = h('p', 'lead');
    l.innerHTML = '<strong>Nie będziemy ponownie pytać o informacje, które już podałeś.</strong>';
    c.appendChild(l);
    c.appendChild(h('hr', 'rule'));
    c.appendChild(h('p', 'lead', 'Po zakończeniu niczego nie musisz pobierać ani przesyłać. Komplet odpowiedzi zostanie automatycznie dostarczony do Piotra.'));
    c.appendChild(h('p', 'lead', 'Wypełnienie zajmie około 10–15 minut.'));

    var row = h('div', 'cta-row');
    var btn = h('button', 'btn btn--primary btn--xl', 'UZUPEŁNIAMY SZCZEGÓŁY');
    btn.type = 'button';
    btn.addEventListener('click', function () { go(1); });
    row.appendChild(btn);
    c.appendChild(row);
    c.appendChild(h('p', 'cta-note', 'Możesz przerwać w dowolnym momencie. Odpowiedzi zapiszą się automatycznie na tym urządzeniu.'));
  }

  function renderIntro(s) {
    var c = el.screen;
    var st = sectionOf(s.section);
    c.appendChild(h('p', 'eyebrow', 'Sekcja ' + st.n + ' z 10'));
    c.appendChild(h('h1', 'screen-title', st.name));
    c.appendChild(h('p', 'lead', st.lead));
    c.appendChild(h('p', 'muted', 'Przy każdym pytaniu możesz wpisać własną odpowiedź i dodać komentarz. Żadne pytanie nie blokuje przejścia dalej.'));
  }

  function renderQuestions(s) {
    var c = el.screen;
    var st = sectionOf(s.section);
    var nums = s.fields.map(function (f) { return f.n; });
    var range = nums.length === 1 ? ('Pytanie ' + nums[0]) : ('Pytania ' + nums[0] + '–' + nums[nums.length - 1]);
    c.appendChild(h('p', 'eyebrow', 'Sekcja ' + st.n + ' · ' + range + ' z ' + TOTAL_QUESTIONS));
    s.fields.forEach(function (f) { c.appendChild(renderQuestion(f)); });
  }

  function renderQuestion(f) {
    var wrap = h('div', 'field');
    wrap.dataset.field = f.id;

    var labelTag = (f.type === 'text' || f.type === 'area') ? 'label' : 'span';
    var lab = h(labelTag, 'field__label');
    var no = h('span', 'qno', f.n + '.');
    lab.appendChild(no);
    lab.appendChild(document.createTextNode(' ' + f.label));
    if (labelTag === 'label') lab.setAttribute('for', 'in_' + f.id);
    wrap.appendChild(lab);
    if (f.help) wrap.appendChild(h('p', 'field__help', f.help));

    var skipped = state.answers[skipId(f)] === true;
    var control = h('div', 'control');
    if (!skipped) control.appendChild(buildControl(f));
    else control.appendChild(h('p', 'muted', SKIP + ' — zaznaczone.'));
    wrap.appendChild(control);

    /* pytanie warunkowe (np. gdzie są materiały) */
    if (f.followUp && !skipped && hasAnyAnswer(f)) {
      wrap.appendChild(renderFollowUp(f.followUp));
    }

    /* własna odpowiedź: przy zamkniętych po wybraniu „Inna odpowiedź”,
       przy pozostałych typach pod przełącznikiem */
    var showOther = (f.type === 'radio' || f.type === 'check')
      ? isOtherSelected(f)
      : (!isOpen(f) && (state.answers['__open_' + otherId(f)] === true || !!state.answers[otherId(f)]));
    if (showOther && !skipped) wrap.appendChild(subField(f, otherId(f), 'Wpisz własną odpowiedź', 'sub--other'));

    /* komentarz */
    var showNote = state.answers['__open_' + noteId(f)] === true || !!state.answers[noteId(f)];
    if (showNote) wrap.appendChild(subField(f, noteId(f), 'Dodatkowy komentarz lub wyjaśnienie', 'sub--note'));

    /* przełączniki */
    var extra = h('div', 'extra');
    /* przy pytaniach otwartych głównym polem jest już wolny tekst —
       osobna „inna odpowiedź” byłaby tam tylko szumem */
    if (!isOpen(f) && f.type !== 'radio' && f.type !== 'check' && !skipped) {
      extra.appendChild(mkToggle(showOther ? 'Ukryj własną odpowiedź' : 'Inna odpowiedź', showOther, function () {
        state.answers['__open_' + otherId(f)] = !showOther;
        if (showOther) delete state.answers[otherId(f)];
        saveSoon(); rerender();
      }));
    }
    extra.appendChild(mkToggle(showNote ? 'Ukryj komentarz' : 'Dodaj komentarz', showNote, function () {
      state.answers['__open_' + noteId(f)] = !showNote;
      if (showNote) delete state.answers[noteId(f)];
      saveSoon(); rerender();
    }));
    if (f.type !== 'radio' && f.type !== 'check') {
      var skipBtn = h('button', 'chip' + (skipped ? ' chip--on' : ''), f.skipLabel || SKIP);
      skipBtn.type = 'button';
      skipBtn.setAttribute('aria-pressed', String(skipped));
      skipBtn.addEventListener('click', function () {
        if (skipped) delete state.answers[skipId(f)];
        else state.answers[skipId(f)] = true;
        saveSoon(); rerender();
      });
      extra.appendChild(skipBtn);
    }
    wrap.appendChild(extra);
    return wrap;
  }

  function mkToggle(text, open, fn) {
    var b = h('button', 'toggle' + (open ? ' is-open' : ''));
    b.type = 'button';
    var plus = h('span', 'toggle__plus', open ? '−' : '+');
    b.appendChild(plus);
    b.appendChild(h('span', null, text));
    b.addEventListener('click', fn);
    return b;
  }

  function subField(f, id, label, cls) {
    var box = h('div', 'sub ' + cls);
    var lab = h('label', 'sub__label', label);
    lab.setAttribute('for', 'in_' + id);
    box.appendChild(lab);
    var t = document.createElement('textarea');
    t.id = 'in_' + id;
    t.rows = 3;
    t.value = state.answers[id] || '';
    t.placeholder = cls === 'sub--other' ? 'Twoja odpowiedź własnymi słowami' : 'Cokolwiek, co warto dopisać do tej odpowiedzi';
    t.addEventListener('input', function () { state.answers[id] = t.value; saveSoon(); });
    box.appendChild(t);
    return box;
  }

  function renderFollowUp(fu) {
    var box = h('div', 'sub');
    var lab = h('label', 'sub__label', fu.label);
    lab.setAttribute('for', 'in_' + fu.id);
    box.appendChild(lab);
    var t = document.createElement('textarea');
    t.id = 'in_' + fu.id;
    t.rows = fu.rows || 3;
    if (fu.placeholder) t.placeholder = fu.placeholder;
    t.value = state.answers[fu.id] || '';
    t.addEventListener('input', function () { state.answers[fu.id] = t.value; saveSoon(); });
    box.appendChild(t);
    return box;
  }

  function isOpen(f) { return f.type === 'text' || f.type === 'area'; }

  function isOtherSelected(f) {
    var v = state.answers[f.id];
    if (f.type === 'check') return Array.isArray(v) && v.indexOf(OTHER) !== -1;
    return v === OTHER;
  }
  function hasAnyAnswer(f) {
    var v = state.answers[f.id];
    if (Array.isArray(v)) return v.length > 0;
    if (v && typeof v === 'object') return Object.keys(v).some(function (k) { return String(v[k] || '').trim() !== ''; });
    return v !== undefined && v !== null && String(v).trim() !== '';
  }

  function buildControl(f) {
    switch (f.type) {
      case 'text': return ctrlText(f);
      case 'area': return ctrlArea(f);
      case 'radio': return ctrlChoice(f, false);
      case 'check': return ctrlChoice(f, true);
      case 'scale': return ctrlScale(f);
      case 'matrix': return ctrlMatrix(f);
      case 'grid': return ctrlGrid(f);
      case 'rep': return ctrlRep(f);
      default: return h('div');
    }
  }

  function ctrlText(f) {
    var box = h('div');
    var i = document.createElement('input');
    i.type = 'text';
    i.id = 'in_' + f.id;
    if (f.numeric) i.inputMode = 'numeric';
    if (f.placeholder) i.placeholder = f.placeholder;
    i.value = state.answers[f.id] || '';
    i.addEventListener('input', function () { state.answers[f.id] = i.value; saveSoon(); });
    box.appendChild(i);
    if (f.quick) {
      var q = h('div', 'quick');
      f.quick.forEach(function (t) {
        var b = h('button', 'chip', t);
        b.type = 'button';
        b.addEventListener('click', function () { state.answers[f.id] = t; i.value = t; saveSoon(); });
        q.appendChild(b);
      });
      box.appendChild(q);
    }
    return box;
  }

  function ctrlArea(f) {
    var box = h('div');
    var t = document.createElement('textarea');
    t.id = 'in_' + f.id;
    t.rows = f.rows || 5;
    if (f.placeholder) t.placeholder = f.placeholder;
    t.value = state.answers[f.id] || '';
    t.addEventListener('input', function () { state.answers[f.id] = t.value; saveSoon(); });
    box.appendChild(t);
    return box;
  }

  function ctrlChoice(f, multi) {
    var box = h('div', 'options');
    box.setAttribute('role', multi ? 'group' : 'radiogroup');
    box.setAttribute('aria-label', f.label);
    f.options.forEach(function (opt, i) {
      var id = 'in_' + f.id + '_' + i;
      var lab = h('label', 'opt ' + (multi ? 'opt--check' : 'opt--radio'));
      lab.setAttribute('for', id);
      var input = document.createElement('input');
      input.type = multi ? 'checkbox' : 'radio';
      input.name = f.id;
      input.id = id;
      input.value = opt;
      var on = multi
        ? (Array.isArray(state.answers[f.id]) && state.answers[f.id].indexOf(opt) !== -1)
        : state.answers[f.id] === opt;
      input.checked = on;
      if (on) lab.classList.add('is-selected');
      lab.appendChild(input);
      lab.appendChild(h('span', 'opt__box'));
      lab.appendChild(h('span', 'opt__text', opt));

      input.addEventListener('change', function () {
        if (multi) {
          var cur = Array.isArray(state.answers[f.id]) ? state.answers[f.id].slice() : [];
          var at = cur.indexOf(opt);
          if (input.checked) {
            /* „Nie wiem / omówimy” wyklucza pozostałe odpowiedzi */
            if (opt === SKIP) cur = [SKIP];
            else {
              cur = cur.filter(function (x) { return x !== SKIP; });
              var limit = f.max ? f.max + (cur.indexOf(OTHER) !== -1 || opt === OTHER ? 1 : 0) : 0;
              if (f.max && opt !== OTHER && cur.filter(function (x) { return x !== OTHER; }).length >= f.max) {
                input.checked = false;
                toast('Możesz wybrać maksymalnie ' + f.max + ' pozycje. Odznacz jedną, żeby wskazać inną.');
                return;
              }
              if (at === -1) cur.push(opt);
            }
          } else if (at !== -1) cur.splice(at, 1);
          state.answers[f.id] = cur;
        } else {
          state.answers[f.id] = opt;
        }
        saveSoon();
        rerender(input.id);
      });
      box.appendChild(lab);
    });
    return box;
  }

  function ctrlScale(f) {
    var box = h('div');
    var row = h('div', 'scale');
    row.setAttribute('role', 'radiogroup');
    row.setAttribute('aria-label', f.label);
    for (var i = 1; i <= 10; i++) {
      (function (v) {
        var b = h('button', 'scale__btn', String(v));
        b.type = 'button';
        b.id = 'in_' + f.id + '_' + v;
        var on = state.answers[f.id] === v;
        if (on) b.classList.add('is-selected');
        b.setAttribute('aria-pressed', String(on));
        b.addEventListener('click', function () {
          state.answers[f.id] = v;
          saveSoon();
          Array.prototype.forEach.call(row.children, function (c) {
            var sel = c === b;
            c.classList.toggle('is-selected', sel);
            c.setAttribute('aria-pressed', String(sel));
          });
        });
        row.appendChild(b);
      })(i);
    }
    box.appendChild(row);
    var legend = h('div', 'scale__legend');
    legend.appendChild(h('span', null, '1 — ' + f.low));
    legend.appendChild(h('span', null, '10 — ' + f.high));
    box.appendChild(legend);
    return box;
  }

  function ctrlMatrix(f) {
    var box = h('div', 'matrix');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', f.label);
    var val = state.answers[f.id] || {};
    f.rows.forEach(function (row) {
      var r = h('div', 'matrix__row');
      r.appendChild(h('span', 'matrix__label', row));
      var opts = h('div', 'matrix__opts');
      f.cols.forEach(function (col) {
        var b = h('button', 'matrix__opt', col);
        b.type = 'button';
        b.setAttribute('aria-label', row + ': ' + col);
        b.setAttribute('aria-pressed', String(val[row] === col));
        if (val[row] === col) b.classList.add('is-selected');
        b.addEventListener('click', function () {
          var cur = ext({}, state.answers[f.id] || {});
          cur[row] = col;
          state.answers[f.id] = cur;
          saveSoon();
          Array.prototype.forEach.call(opts.children, function (c) {
            var sel = c === b;
            c.classList.toggle('is-selected', sel);
            c.setAttribute('aria-pressed', String(sel));
          });
        });
        opts.appendChild(b);
      });
      r.appendChild(opts);
      box.appendChild(r);
    });
    return box;
  }

  function ctrlGrid(f) {
    var box = h('div', 'grid-fields');
    var val = state.answers[f.id] || {};
    f.parts.forEach(function (part) {
      var cell = h('div');
      var id = 'in_' + f.id + '_' + part.id;
      var lab = h('label', null, part.label);
      lab.setAttribute('for', id);
      cell.appendChild(lab);
      var input;
      if (part.type === 'select') {
        input = document.createElement('select');
        var ph = document.createElement('option');
        ph.value = ''; ph.textContent = '— wybierz —';
        input.appendChild(ph);
        part.options.forEach(function (o) {
          var op = document.createElement('option');
          op.value = o; op.textContent = o;
          input.appendChild(op);
        });
      } else {
        input = document.createElement('input');
        input.type = 'text';
        if (part.placeholder) input.placeholder = part.placeholder;
      }
      input.id = id;
      input.value = val[part.id] || '';
      var onChange = function () {
        var cur = ext({}, state.answers[f.id] || {});
        cur[part.id] = input.value;
        state.answers[f.id] = cur;
        saveSoon();
      };
      input.addEventListener('input', onChange);
      input.addEventListener('change', onChange);
      cell.appendChild(input);
      box.appendChild(cell);
    });
    return box;
  }

  function ctrlRep(f) {
    var wrap = h('div');
    var list = h('div', 'rep');
    wrap.appendChild(list);
    var add = h('button', 'btn btn--add', '+  ' + f.addLabel);
    add.type = 'button';
    add.addEventListener('click', function () {
      var cur = rows().slice();
      cur.push(blank());
      state.answers[f.id] = cur;
      saveSoon(); draw();
    });
    wrap.appendChild(add);

    function blank() { var o = {}; f.cols.forEach(function (c) { o[c.id] = ''; }); return o; }
    function rows() {
      var v = state.answers[f.id];
      if (!Array.isArray(v) || !v.length) { v = [blank()]; state.answers[f.id] = v; }
      return v;
    }
    function draw() {
      list.innerHTML = '';
      rows().forEach(function (row, idx) {
        var item = h('div', 'rep__item');
        var head = h('div', 'rep__head');
        head.appendChild(h('span', 'rep__title', f.itemLabel + ' ' + (idx + 1)));
        if (rows().length > 1) {
          var del = h('button', 'icon-btn', '×');
          del.type = 'button';
          del.setAttribute('aria-label', 'Usuń pozycję ' + (idx + 1));
          del.addEventListener('click', function () {
            var cur = rows().slice(); cur.splice(idx, 1);
            state.answers[f.id] = cur.length ? cur : [blank()];
            saveSoon(); draw();
          });
          head.appendChild(del);
        }
        item.appendChild(head);
        var grid = h('div', 'rep__grid');
        f.cols.forEach(function (col) {
          var cell = h('div');
          var id = 'in_' + f.id + '_' + idx + '_' + col.id;
          var lab = h('label', null, col.label);
          lab.setAttribute('for', id);
          cell.appendChild(lab);
          var input;
          if (col.type === 'select') {
            input = document.createElement('select');
            var ph = document.createElement('option');
            ph.value = ''; ph.textContent = '— wybierz —';
            input.appendChild(ph);
            col.options.forEach(function (o) {
              var op = document.createElement('option');
              op.value = o; op.textContent = o;
              input.appendChild(op);
            });
          } else {
            input = document.createElement('input');
            input.type = 'text';
            if (col.placeholder) input.placeholder = col.placeholder;
          }
          input.id = id;
          input.value = row[col.id] || '';
          var onChange = function () {
            var cur = rows().slice();
            cur[idx] = ext({}, cur[idx]);
            cur[idx][col.id] = input.value;
            state.answers[f.id] = cur;
            saveSoon();
          };
          input.addEventListener('input', onChange);
          input.addEventListener('change', onChange);
          cell.appendChild(input);
          grid.appendChild(cell);
        });
        item.appendChild(grid);
        list.appendChild(item);
      });
    }
    draw();
    return wrap;
  }

  /* ------------------------------------------------------- zbieranie danych */
  function answerText(f) {
    if (state.answers[skipId(f)] === true) return SKIP;
    var v = state.answers[f.id];
    if (v === undefined || v === null || v === '') return '';
    switch (f.type) {
      case 'check':
        return Array.isArray(v) && v.length ? v.join(', ') : '';
      case 'scale':
        return v + ' / 10';
      case 'matrix':
        var rows = f.rows.filter(function (r) { return v[r]; });
        return rows.length ? rows.map(function (r) { return '· ' + r + ': ' + v[r]; }).join('\n') : '';
      case 'grid':
        var parts = f.parts.filter(function (p) { return String(v[p.id] || '').trim() !== ''; });
        return parts.length ? parts.map(function (p) { return '· ' + p.label + ': ' + String(v[p.id]).trim(); }).join('\n') : '';
      case 'rep':
        if (!Array.isArray(v)) return '';
        var lines = [];
        v.forEach(function (row, i) {
          var bits = f.cols.map(function (c) {
            var val = String(row[c.id] || '').trim();
            return val ? c.label + ': ' + val : null;
          }).filter(Boolean);
          if (bits.length) lines.push((i + 1) + ') ' + bits.join(' | '));
        });
        return lines.join('\n');
      default:
        return String(v).trim();
    }
  }

  function itemOf(f) {
    var followUp = f.followUp && state.answers[f.followUp.id]
      ? '\n' + f.followUp.label + ': ' + String(state.answers[f.followUp.id]).trim()
      : '';
    return {
      n: f.n,
      question: f.label,
      answer: answerText(f) + followUp,
      other: String(state.answers[otherId(f)] || '').trim(),
      comment: String(state.answers[noteId(f)] || '').trim()
    };
  }

  function collect() {
    return SECTIONS.map(function (sec) {
      var items = QUESTIONS.filter(function (f) { return sectionOfQuestion(f) === sec.n; }).map(itemOf);
      return { n: sec.n, title: sec.title, items: items };
    });
  }

  var QSECTION = {};
  SCREENS.forEach(function (s) { (s.fields || []).forEach(function (f) { QSECTION[f.id] = s.section; }); });
  function sectionOfQuestion(f) { return QSECTION[f.id]; }

  function isAnswered(f) {
    var it = itemOf(f);
    return !!(it.answer.trim() || it.other || it.comment);
  }
  function completionPercent() {
    var done = QUESTIONS.filter(isAnswered).length;
    return Math.round((done / QUESTIONS.length) * 100);
  }
  function missingQuestions() {
    return QUESTIONS.filter(function (f) { return !isAnswered(f); });
  }

  /* --------------------------------------------------------------- nawigacja */
  function go(dir) {
    var next = state.index + (dir > 0 ? 1 : -1);
    if (next < 0 || next >= SCREENS.length) return;
    if (SCREENS[next].type === 'sent' && !state.sentAt) return;   /* ekran po wysyłce */
    state.index = next;
    save();
    render();
  }
  function goToIndex(i) {
    state.index = Math.max(0, Math.min(SCREENS.length - 1, i));
    save(); render();
  }
  function firstQuestionIndex() {
    for (var i = 0; i < SCREENS.length; i++) if (SCREENS[i].type === 'q') return i;
    return 0;
  }

  function updateChrome(s) {
    var pos = state.index;
    var last = SCREENS.length - 2;                       /* ekran „wysłane” poza paskiem */
    var pct = Math.round((Math.min(pos, last) / last) * 100);
    var isForm = s.type === 'q' || s.type === 'intro';

    el.progress.hidden = s.type === 'welcome';
    el.navbar.hidden = !isForm;
    el.fill.style.width = (s.type === 'welcome' ? 0 : pct) + '%';
    el.percent.textContent = (s.type === 'welcome' ? 0 : pct) + '%';
    el.stage.textContent = s.section
      ? 'Sekcja ' + s.section + ' z 10 · ' + sectionOf(s.section).name
      : (s.type === 'review' ? 'Przegląd przed wysłaniem' : (s.type === 'sent' ? 'Wysłane' : ''));
    el.back.disabled = pos <= 0;
    el.next.textContent = SCREENS[pos + 1] && SCREENS[pos + 1].type === 'review' ? 'Przejdź do podsumowania' : 'Dalej';
  }

  /* --------------------------------------------------- przegląd przed wysyłką */
  function renderReview() {
    var c = el.screen;
    c.appendChild(h('p', 'eyebrow', 'Przegląd przed wysłaniem'));
    c.appendChild(h('h1', 'screen-title', 'Sprawdź odpowiedzi, zanim je wyślemy.'));

    var pct = completionPercent();
    var meter = h('div', 'review__meter');
    meter.appendChild(h('span', 'review__pct', pct + '%'));
    var mlab = h('span', 'review__meterlabel');
    mlab.textContent = 'Tyle pytań ma odpowiedź, własną odpowiedź albo komentarz. Brakujące pytania możesz zostawić — omówimy je podczas spotkania.';
    meter.appendChild(mlab);
    c.appendChild(meter);

    var box = h('div', 'summary');
    collect().forEach(function (sec) {
      var any = sec.items.some(function (it) { return it.answer.trim() || it.other || it.comment; });
      if (!any) return;
      box.appendChild(h('p', 'summary__stage', 'Sekcja ' + sec.n + ' — ' + sec.title));
      sec.items.forEach(function (it) {
        if (!it.answer.trim() && !it.other && !it.comment) return;
        var row = h('div', 'summary__row');
        row.appendChild(h('p', 'summary__q', it.n + '. ' + it.question));
        if (it.answer.trim()) row.appendChild(h('p', 'summary__a', it.answer.trim()));
        if (it.other) {
          var o = h('div', 'summary__extra summary__extra--other');
          o.appendChild(h('b', null, 'Własna odpowiedź'));
          o.appendChild(document.createTextNode(it.other));
          row.appendChild(o);
        }
        if (it.comment) {
          var k = h('div', 'summary__extra summary__extra--note');
          k.appendChild(h('b', null, 'Komentarz'));
          k.appendChild(document.createTextNode(it.comment));
          row.appendChild(k);
        }
        box.appendChild(row);
      });
    });
    c.appendChild(box);

    var missing = missingQuestions();
    if (missing.length) {
      var mb = h('div', 'review__missing');
      mb.appendChild(h('h3', null, 'Pytania bez odpowiedzi (' + missing.length + ')'));
      var ul = h('ul', 'bullets');
      missing.forEach(function (f) { ul.appendChild(h('li', null, f.n + '. ' + f.label)); });
      mb.appendChild(ul);
      c.appendChild(mb);
    }

    /* zgoda */
    var consent = h('div', 'consent');
    consent.id = 'consentBox';
    var lab = h('label', 'opt opt--check' + (state.answers.__consent ? ' is-selected' : ''));
    lab.setAttribute('for', 'in_consent');
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = 'in_consent';
    chk.checked = !!state.answers.__consent;
    chk.addEventListener('change', function () {
      state.answers.__consent = chk.checked;
      lab.classList.toggle('is-selected', chk.checked);
      consent.classList.remove('is-invalid');
      saveSoon();
    });
    lab.appendChild(chk);
    lab.appendChild(h('span', 'opt__box'));
    lab.appendChild(h('span', 'consent__text', 'Potwierdzam, że moje odpowiedzi mogą zostać przesłane do Piotra Mądrzyka i wykorzystane wyłącznie do przygotowania analizy oraz projektu dla mojej działalności.'));
    consent.appendChild(lab);
    c.appendChild(consent);

    /* honeypot — niewidoczne pole; wypełnia je tylko bot */
    var hp = document.createElement('input');
    hp.type = 'text';
    hp.id = 'website';
    hp.name = 'website';
    hp.className = 'hp';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    c.appendChild(hp);

    var status = h('p', 'send__status');
    status.id = 'sendStatus';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    var row = h('div', 'cta-row');
    var back = h('button', 'btn btn--light', 'WRÓĆ I POPRAW');
    back.type = 'button';
    back.addEventListener('click', function () { goToIndex(firstQuestionIndex()); });
    var sendBtn = h('button', 'btn btn--primary btn--xl', 'WYŚLIJ ODPOWIEDZI DO PIOTRA');
    sendBtn.type = 'button';
    sendBtn.id = 'btnSend';
    sendBtn.addEventListener('click', function () { askAndSend(sendBtn, status, hp); });
    row.appendChild(sendBtn);
    row.appendChild(back);
    c.appendChild(row);
    c.appendChild(status);
    c.appendChild(h('p', 'cta-note', 'Nie musisz niczego pobierać ani przesyłać samodzielnie — raport trafi bezpośrednio do Piotra.'));
  }

  /* ------------------------------------------------------------------ wysyłka */
  function newSubmissionId() {
    var d = new Date();
    var p = function (x) { return (x < 10 ? '0' : '') + x; };
    var rnd = '';
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (var i = 0; i < 4; i++) rnd += chars.charAt(Math.floor(Math.random() * chars.length));
    return 'UZ-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + rnd;
  }

  function askAndSend(btn, status, hp) {
    if (!state.answers.__consent) {
      var box = document.getElementById('consentBox');
      if (box) {
        box.classList.add('is-invalid');
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var chk = document.getElementById('in_consent');
        if (chk) chk.focus({ preventScroll: true });
      }
      status.className = 'send__status send__status--warn';
      status.textContent = 'Zanim wyślemy odpowiedzi, potrzebujemy Twojego potwierdzenia powyżej.';
      return;
    }
    openModal('Czy na pewno chcesz przesłać odpowiedzi do Piotra?',
      'Raport trafi bezpośrednio na jego skrzynkę. Odpowiedzi zostaną też zachowane na tym urządzeniu, więc nic nie zginie.',
      [
        { label: 'Tak, wyślij', primary: true, fn: function () { doSend(btn, status, hp); } },
        { label: 'Jeszcze nie', fn: function () {} }
      ]);
  }

  function doSend(btn, status, hp) {
    if (!CONFIG.ENDPOINT) {
      status.className = 'send__status send__status--warn';
      status.textContent = 'Wysyłka nie jest jeszcze uruchomiona po stronie serwera. Twoje odpowiedzi są bezpiecznie zapisane na tym urządzeniu — spróbuj ponownie za chwilę albo daj znać Piotrowi.';
      return;
    }

    var id = state.submissionId || newSubmissionId();
    state.submissionId = id;
    btn.disabled = true;
    btn.textContent = 'WYSYŁANIE…';
    status.className = 'send__status';
    status.textContent = 'Przesyłamy raport do Piotra…';

    var payload = {
      formId: CONFIG.FORM_ID,
      submissionId: id,
      submittedAt: new Date().toISOString(),
      completion: completionPercent(),
      consent: true,
      hp: hp ? hp.value : '',
      sections: collect()
    };

    var finished = false;
    var timer = setTimeout(function () {
      if (finished) return;
      finished = true;
      failSend(btn, status);
    }, CONFIG.TIMEOUT_MS);

    fetch(CONFIG.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) { return { ok: r.ok, data: data }; });
    }).then(function (r) {
      if (finished) return;
      finished = true; clearTimeout(timer);
      if (!r.ok || !r.data || r.data.ok !== true) { failSend(btn, status); return; }
      state.sentAt = new Date().toISOString();
      save();
      state.index = SCREENS.length - 1;
      render();
    }).catch(function () {
      if (finished) return;
      finished = true; clearTimeout(timer);
      failSend(btn, status);
    });
  }

  function failSend(btn, status) {
    btn.disabled = false;
    btn.textContent = 'SPRÓBUJ PONOWNIE';
    status.className = 'send__status send__status--warn';
    status.textContent = 'Nie udało się teraz przesłać odpowiedzi. Wszystkie informacje są bezpiecznie zapisane na tym urządzeniu. Spróbuj ponownie za chwilę.';
  }

  function renderSent() {
    var c = el.screen;
    c.appendChild(h('p', 'eyebrow', 'Raport przesłany'));
    c.appendChild(h('h1', 'screen-title', 'Dziękujemy, Michał.'));
    c.appendChild(h('p', 'lead', 'Odpowiedzi zostały bezpiecznie przesłane do Piotra.'));
    c.appendChild(h('p', 'lead', 'Nie musisz niczego pobierać ani dodatkowo wysyłać. Teraz przeanalizujemy informacje i przygotujemy właściwy plan projektu.'));
    c.appendChild(h('p', 'muted', 'Piotr skontaktuje się z Tobą po zakończeniu analizy.'));

    var meta = h('div', 'sent__box');
    meta.appendChild(h('p', 'muted', 'Data przesłania: ' + formatStamp(state.sentAt) + ' · Poziom uzupełnienia: ' + completionPercent() + '%'));
    meta.appendChild(h('span', 'sent__id', 'Identyfikator zgłoszenia: ' + (state.submissionId || '—')));
    c.appendChild(meta);

    var sig = h('div', 'sig');
    sig.appendChild(h('div', 'sig__name', 'Piotr Mądrzyk'));
    sig.appendChild(h('div', 'sig__role', 'PM GROWTH LAB · Strategia. Technologia. Wzrost.'));
    c.appendChild(sig);

    var status = h('p', 'send__status');
    status.setAttribute('role', 'status');

    var row = h('div', 'cta-row');
    var again = h('button', 'btn btn--light', 'WYŚLIJ PONOWNIE');
    again.type = 'button';
    again.addEventListener('click', function () {
      openModal('Wysłać raport jeszcze raz?',
        'Piotr otrzymał już Twoje odpowiedzi ' + formatStamp(state.sentAt) + '. Ponowna wysyłka przyśle mu aktualną wersję jako kolejną wiadomość.',
        [
          { label: 'Tak, wyślij ponownie', primary: true, fn: function () { resend(again, status); } },
          { label: 'Nie wysyłaj', fn: function () {} }
        ]);
    });
    var review = h('button', 'btn btn--light', 'ZOBACZ SWOJE ODPOWIEDZI');
    review.type = 'button';
    review.addEventListener('click', function () { goToIndex(SCREENS.length - 2); });
    row.appendChild(review);
    row.appendChild(again);
    c.appendChild(row);
    c.appendChild(status);
  }

  function resend(btn, status) {
    btn.disabled = true;
    btn.textContent = 'WYSYŁANIE…';
    status.className = 'send__status';
    status.textContent = 'Przesyłamy raport ponownie…';

    if (!CONFIG.ENDPOINT) {
      btn.disabled = false;
      btn.textContent = 'WYŚLIJ PONOWNIE';
      status.className = 'send__status send__status--warn';
      status.textContent = 'Wysyłka nie jest jeszcze uruchomiona po stronie serwera.';
      return;
    }

    var payload = {
      formId: CONFIG.FORM_ID,
      submissionId: state.submissionId || newSubmissionId(),
      submittedAt: new Date().toISOString(),
      completion: completionPercent(),
      consent: true,
      hp: '',
      sections: collect()
    };

    fetch(CONFIG.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, data: d }; });
    }).then(function (r) {
      btn.disabled = false;
      btn.textContent = 'WYŚLIJ PONOWNIE';
      if (!r.ok || !r.data || r.data.ok !== true) {
        status.className = 'send__status send__status--warn';
        status.textContent = 'Nie udało się teraz przesłać odpowiedzi. Wszystkie informacje są bezpiecznie zapisane na tym urządzeniu. Spróbuj ponownie za chwilę.';
        return;
      }
      state.sentAt = new Date().toISOString();
      save();
      status.className = 'send__status';
      status.textContent = 'Raport przesłany ponownie · ' + formatStamp(state.sentAt);
      toast('Raport przesłany ponownie.');
      render();
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = 'WYŚLIJ PONOWNIE';
      status.className = 'send__status send__status--warn';
      status.textContent = 'Nie udało się teraz przesłać odpowiedzi. Wszystkie informacje są bezpiecznie zapisane na tym urządzeniu. Spróbuj ponownie za chwilę.';
    });
  }

  function formatStamp(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    var p = function (x) { return (x < 10 ? '0' : '') + x; };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ', godz. ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* ---------------------------------------------------------------- modal */
  function openModal(title, body, actions) {
    el.modalTitle.textContent = title;
    el.modalBody.textContent = body;
    el.modalActions.innerHTML = '';
    actions.forEach(function (a) {
      var b = h('button', 'btn ' + (a.primary ? 'btn--primary' : 'btn--ghost'), a.label);
      b.type = 'button';
      b.addEventListener('click', function () { closeModal(); a.fn(); });
      el.modalActions.appendChild(b);
    });
    el.modal.hidden = false;
    var first = el.modalActions.querySelector('button');
    if (first) first.focus();
  }
  function closeModal() { el.modal.hidden = true; }

  /* ------------------------------------------------------------------ init */
  el.next.addEventListener('click', function () { go(1); });
  el.back.addEventListener('click', function () { go(-1); });
  el.reset.addEventListener('click', function () {
    openModal('Wyczyścić zapisane odpowiedzi?',
      'Usuniemy wszystkie odpowiedzi zapisane na tym urządzeniu. Tej operacji nie da się cofnąć.',
      [
        {
          label: 'Tak, wyczyść', primary: true, fn: function () {
            wiping = true; clearTimeout(saveTimer);
            state.answers = {}; state.index = 0; state.sentAt = null; state.submissionId = null;
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            location.reload();
          }
        },
        { label: 'Zostaw', fn: function () {} }
      ]);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !el.modal.hidden) { closeModal(); return; }
    if (e.key !== 'Enter' || !el.modal.hidden) return;
    var t = e.target;
    var tag = t && t.tagName ? t.tagName.toLowerCase() : '';
    if (tag === 'textarea' && !(e.ctrlKey || e.metaKey)) return;
    if (tag === 'button' || tag === 'a' || tag === 'select') return;
    if (t && (t.type === 'checkbox' || t.type === 'radio')) return;   /* Enter przełącza zaznaczenie */
    if (el.navbar.hidden) {
      if (SCREENS[state.index].type === 'welcome') {
        var cta = el.screen.querySelector('.btn--primary');
        if (cta) { e.preventDefault(); cta.click(); }
      }
      return;
    }
    e.preventDefault();
    go(1);
  });

  window.addEventListener('beforeunload', function () { clearTimeout(saveTimer); save(); });

  function start() {
    var saved = load();
    if (saved && Object.keys(saved.answers || {}).length) {
      state.answers = saved.answers;
      openModal('Znaleźliśmy zapisane odpowiedzi.',
        'Chcesz kontynuować od miejsca, w którym skończyłeś?',
        [
          {
            label: 'Kontynuuj', primary: true, fn: function () {
              state.index = typeof saved.index === 'number' ? saved.index : 0;
              state.submissionId = saved.submissionId || null;
              state.sentAt = saved.sentAt || null;
              render();
              flashSaved('Wczytano zapisane odpowiedzi');
            }
          },
          {
            label: 'Zacznij od początku', fn: function () {
              state.answers = {}; state.index = 0; state.sentAt = null; state.submissionId = null;
              try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
              render();
            }
          }
        ]);
      render();
    } else {
      render();
    }
  }

  window.PMGLU = {
    state: state, SCREENS: SCREENS, SECTIONS: SECTIONS, QUESTIONS: QUESTIONS, CONFIG: CONFIG,
    collect: collect, completionPercent: completionPercent, missingQuestions: missingQuestions,
    goToIndex: goToIndex, go: go, render: render, save: save, STORAGE_KEY: STORAGE_KEY,
    OTHER: OTHER, SKIP: SKIP
  };

  start();
})();
