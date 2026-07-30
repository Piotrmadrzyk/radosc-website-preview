/* ==========================================================================
   PM GROWTH LAB — Formularz strategiczny dla Michała Elżbieciaka
   Czysty JavaScript, bez zależności zewnętrznych, bez backendu.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------- ustawienia */
  var STORAGE_KEY = 'pmgl.michal.formularz.v1';
  var TOTAL_QUESTIONS = 84;

  var STAGES = [
    { n: 1, title: 'MICHAŁ I JEGO DZIAŁALNOŚĆ' },
    { n: 2, title: 'SWRN I PRZYCHÓD ODNAWIALNY' },
    { n: 3, title: 'PRODUKTY, KTÓRE WARTO PROMOWAĆ' },
    { n: 4, title: 'GRUPY KLIENTÓW' },
    { n: 5, title: 'SPRZEDAŻ I OBSŁUGA LEADÓW' },
    { n: 6, title: 'MARKA I KOMUNIKACJA' },
    { n: 7, title: 'OBECNE KANAŁY I NOWY FACEBOOK' },
    { n: 8, title: 'FUNDACJA I DZIAŁALNOŚĆ SPOŁECZNA' },
    { n: 9, title: 'CELE I BUDŻET' }
  ];

  var MSG_DEFAULT = 'Potrzebujemy tej informacji, żeby prawidłowo policzyć model biznesowy.';
  var QUICK = ['Muszę sprawdzić', 'Omówię podczas spotkania', 'Nie dotyczy'];
  var YND = ['Tak', 'Nie', 'Nie wiem'];
  var YNZ = ['Tak', 'Nie', 'Wymaga zgody', 'Nie wiem'];

  /* ------------------------------------------------------ konstruktory pól */
  var F = {
    radio: function (id, label, options, o) { return ext({ type: 'radio', id: id, label: label, options: options }, o); },
    check: function (id, label, options, o) { return ext({ type: 'check', id: id, label: label, options: options }, o); },
    text: function (id, label, o) { return ext({ type: 'text', id: id, label: label }, o); },
    area: function (id, label, o) { return ext({ type: 'textarea', id: id, label: label }, o); },
    scale: function (id, label, o) { return ext({ type: 'scale', id: id, label: label }, o); },
    matrix: function (id, label, rows, cols, o) { return ext({ type: 'matrix', id: id, label: label, rows: rows, cols: cols }, o); },
    rank: function (id, label, options, o) { return ext({ type: 'rank', id: id, label: label, options: options }, o); },
    rep: function (id, label, cols, o) { return ext({ type: 'rep', id: id, label: label, cols: cols }, o); }
  };
  function ext(base, o) { if (o) { for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) base[k] = o[k]; } } return base; }

  /* pomocnicy dla warunków — każdy zapamiętuje, od którego pola zależy */
  function dep(fn, id) { fn.dep = id; return fn; }
  function is(id, val) { return dep(function (a) { return a[id] === val; }, id); }
  function isOneOf(id, vals) { return dep(function (a) { return vals.indexOf(a[id]) !== -1; }, id); }
  function has(id, val) { return dep(function (a) { return Array.isArray(a[id]) && a[id].indexOf(val) !== -1; }, id); }

  /* ------------------------------------------------------------- struktura */
  var SCREENS = [

    /* ======================================================== EKRAN STARTOWY */
    { type: 'welcome', stage: 0 },

    /* ================================================================ ETAP 1 */
    { type: 'intro', stage: 1, lead: 'Najpierw chcemy zrozumieć, jak dziś wygląda Twoja działalność.' },

    {
      type: 'q', stage: 1, q: [1, 1], fields: [
        F.check('q1', 'Jakimi obszarami zajmujesz się obecnie zawodowo?', [
          'ubezpieczenia na życie', 'ubezpieczenia grupowe', 'ubezpieczenia majątkowe',
          'ubezpieczenia komunikacyjne', 'zabezpieczenie emerytalne', 'inwestycje i oszczędności',
          'benefity pracownicze', 'rozwiązania dla firm', 'leasing', 'inne'
        ], { n: 1, req: true, help: 'Zaznacz wszystko, czym realnie się zajmujesz — także obszary poboczne.' }),
        F.text('q1_other', 'Jakie inne obszary?', { showIf: has('q1', 'inne'), placeholder: 'np. gwarancje ubezpieczeniowe, kredyty hipoteczne' })
      ]
    },

    {
      type: 'q', stage: 1, q: [2, 3], fields: [
        F.check('q2', 'Które trzy obszary przynoszą Ci obecnie największy dochód?', null,
          { n: 2, optionsFrom: 'q1', max: 3, req: true, help: 'Wybierz maksymalnie trzy pozycje.' }),
        F.check('q3', 'Które trzy obszary chcesz najmocniej rozwijać w ciągu najbliższych 12 miesięcy?', null,
          { n: 3, optionsFrom: 'q1', max: 3, req: true, help: 'To nie muszą być te same obszary co powyżej.' })
      ]
    },

    {
      type: 'q', stage: 1, q: [4, 5], fields: [
        F.text('q4', 'Od ilu lat działasz w branży?', { n: 4, numeric: true, req: true, placeholder: 'np. 12' }),
        F.radio('q5_mode', 'Ilu aktywnych klientów obsługujesz obecnie?', ['Dokładna liczba', 'Liczba przybliżona', 'Muszę sprawdzić'], { n: 5, req: true }),
        F.text('q5_value', 'Podaj liczbę', { showIf: isOneOf('q5_mode', ['Dokładna liczba', 'Liczba przybliżona']), numeric: true, placeholder: 'np. 320' })
      ]
    },

    {
      type: 'q', stage: 1, q: [6, 7], fields: [
        F.text('q6', 'Ile nowych rozmów lub spotkań z potencjalnymi klientami odbywasz średnio w miesiącu?', { n: 6, numeric: true, quick: true, placeholder: 'np. 25' }),
        F.radio('q7_mode', 'Ilu z tych klientów średnio finalizuje zakup?', ['Podam liczbę', 'Podam procent', 'Muszę sprawdzić'], { n: 7 }),
        F.text('q7_count', 'Liczba klientów miesięcznie', { showIf: is('q7_mode', 'Podam liczbę'), numeric: true, placeholder: 'np. 8' }),
        F.text('q7_pct', 'Procent skuteczności', { showIf: is('q7_mode', 'Podam procent'), numeric: true, placeholder: 'np. 35' })
      ]
    },

    /* ================================================================ ETAP 2 */
    { type: 'intro', stage: 2, lead: 'Ten etap jest kluczowy. Chcemy zrozumieć, jak działa Twój model współpracy z SWRN i które produkty mają największy potencjał.' },

    {
      type: 'q', stage: 2, q: [8, 8], fields: [
        F.radio('q8_mode', 'Ilu aktywnych klientów masz obecnie przypisanych do swojego portalu SWRN?', ['Podam liczbę', 'Podam przedział', 'Muszę sprawdzić'], { n: 8, req: true }),
        F.text('q8_value', 'Liczba klientów', { showIf: is('q8_mode', 'Podam liczbę'), numeric: true, placeholder: 'np. 74' }),
        F.radio('q8_range', 'Przedział', ['do 10', '10–50', '50–100', '100–250', 'powyżej 250'], { showIf: is('q8_mode', 'Podam przedział') })
      ]
    },

    {
      type: 'q', stage: 2, q: [9, 9], fields: [
        F.rep('q9', 'Jakie produkty SWRN sprzedają się obecnie najlepiej?', [
          { id: 'nazwa', label: 'Nazwa produktu', placeholder: 'np. karta sportowa' },
          { id: 'skladka', label: 'Miesięczna składka klienta', placeholder: 'np. 129 zł' },
          { id: 'klienci', label: 'Liczba aktywnych klientów', placeholder: 'np. 30' },
          { id: 'prowizja', label: 'Twoja prowizja', placeholder: 'np. 8% lub 12 zł' },
          { id: 'sposob', label: 'Sposób naliczania prowizji', type: 'select', options: ['jednorazowo', 'co miesiąc przez cały okres', 'przez określony czas', 'inaczej', 'nie wiem'] }
        ], { n: 9, addLabel: 'Dodaj kolejny produkt', itemLabel: 'Produkt', min: 1, req: true, help: 'Dodaj tyle pozycji, ile realnie ma znaczenie — nawet szacunkowo.' })
      ]
    },

    {
      type: 'q', stage: 2, q: [10, 10], fields: [
        F.radio('q10', 'Czy prowizję otrzymujesz przez cały okres, w którym klient opłaca produkt?',
          ['Tak', 'Nie', 'Zależy od produktu', 'Muszę potwierdzić'], { n: 10, req: true }),
        F.area('q10_note', 'Jeżeli zależy od produktu — opisz krótko', { showIf: is('q10', 'Zależy od produktu') })
      ]
    },

    {
      type: 'q', stage: 2, q: [11, 11], fields: [
        F.rep('q11', 'Jaki procent lub kwotę prowizji otrzymujesz?', [
          { id: 'produkt', label: 'Produkt / grupa produktów', placeholder: 'np. ubezpieczenie grupowe' },
          { id: 'stawka', label: 'Procent lub kwota', placeholder: 'np. 10% / 15 zł' },
          { id: 'uwagi', label: 'Uwagi', placeholder: 'np. tylko przez 24 miesiące' }
        ], { n: 11, addLabel: 'Dodaj kolejną pozycję', itemLabel: 'Prowizja', help: 'Możesz odpowiedzieć osobno dla różnych produktów. Jeśli nie znasz stawki, wpisz „muszę sprawdzić”.' })
      ]
    },

    {
      type: 'q', stage: 2, q: [12, 12], fields: [
        F.radio('q12', 'Od jakiej wartości liczona jest prowizja?', [
          'od całej wpłaty klienta', 'od składki ubezpieczeniowej', 'od części administracyjnej',
          'inny sposób', 'nie wiem / muszę sprawdzić'
        ], { n: 12, req: true }),
        F.text('q12_other', 'Jaki inny sposób?', { showIf: is('q12', 'inny sposób') })
      ]
    },

    {
      type: 'q', stage: 2, q: [13, 13], fields: [
        F.radio('q13', 'Czy wysokość prowizji różni się między kategoriami produktów?', YND, { n: 13, req: true }),
        F.matrix('q13_matrix', 'Jak wygląda poziom prowizji w poszczególnych kategoriach?',
          ['ubezpieczenia', 'karty sportowe', 'pakiety medyczne', 'inne benefity'],
          ['Wyższa', 'Przeciętna', 'Niższa', 'Nie wiem'], { showIf: is('q13', 'Tak') }),
        F.area('q13_note', 'Chcesz coś doprecyzować?', { showIf: is('q13', 'Tak') })
      ]
    },

    {
      type: 'q', stage: 2, q: [14, 14], fields: [
        F.radio('q14_mode', 'Jaki jest obecny miesięczny przychód z klientów SWRN?',
          ['Dokładna kwota', 'Przedział', 'Wolę omówić podczas spotkania', 'Muszę sprawdzić'], { n: 14, req: true }),
        F.text('q14_value', 'Kwota miesięcznie', { showIf: is('q14_mode', 'Dokładna kwota'), placeholder: 'np. 3 200 zł' }),
        F.radio('q14_range', 'Przedział', ['do 1 000 zł', '1 000–3 000 zł', '3 000–6 000 zł', '6 000–12 000 zł', 'powyżej 12 000 zł'], { showIf: is('q14_mode', 'Przedział') })
      ]
    },

    {
      type: 'q', stage: 2, q: [15, 16], fields: [
        F.radio('q15', 'Jak długo przeciętny klient pozostaje aktywny?',
          ['mniej niż 6 miesięcy', '6–12 miesięcy', '1–2 lata', 'ponad 2 lata', 'nie mam takich danych'], { n: 15, req: true }),
        F.radio('q16_mode', 'Ilu klientów średnio rezygnuje?', ['Podam liczby', 'Nie mam takich danych', 'Muszę sprawdzić'], { n: 16 }),
        F.text('q16_month', 'Rezygnacje w miesiącu', { showIf: is('q16_mode', 'Podam liczby'), numeric: true, placeholder: 'np. 2' }),
        F.text('q16_year', 'Rezygnacje w roku', { showIf: is('q16_mode', 'Podam liczby'), numeric: true, placeholder: 'np. 18' })
      ]
    },

    {
      type: 'q', stage: 2, q: [17, 17], fields: [
        F.matrix('q17', 'Czy otrzymujesz informację, gdy klient:',
          ['rozpocznie zapis', 'nie dokończy zapisu', 'aktywuje produkt', 'przestanie płacić', 'zrezygnuje', 'dokupi kolejny produkt'],
          YND, { n: 17, req: true, help: 'To decyduje o tym, czy da się mierzyć lejek i odzyskiwać porzucone zapisy.' })
      ]
    },

    {
      type: 'q', stage: 2, q: [18, 19], fields: [
        F.radio('q18', 'Czy klient, który wejdzie przez Twój link, pozostaje przypisany do Ciebie na stałe?',
          ['Tak, na stałe', 'Tak, ale przez określony czas', 'Nie', 'Nie wiem'], { n: 18, req: true }),
        F.radio('q19', 'Czy otrzymujesz prowizję także z produktów, które taki klient dokupi później?',
          ['Tak', 'Nie', 'Zależy od produktu', 'Nie wiem'], { n: 19, req: true })
      ]
    },

    {
      type: 'q', stage: 2, q: [20, 20], fields: [
        F.matrix('q20', 'Czy masz dostęp do panelu lub raportu pokazującego:',
          ['aktywnych klientów', 'składki', 'prowizje', 'rezygnacje', 'rozpoczęte zapisy', 'źródło pozyskania klienta'],
          YND, { n: 20, req: true })
      ]
    },

    {
      type: 'q', stage: 2, q: [21, 21], fields: [
        F.radio('q21', 'Czy możesz udostępnić nam umowę partnerską, tabelę prowizji lub materiały SWRN?',
          ['Tak', 'Tak, ale po podpisaniu poufności', 'Częściowo', 'Nie', 'Muszę sprawdzić'], { n: 21, req: true }),
        F.area('q21_where', 'Link do Google Drive albo opis, gdzie znajdują się dokumenty',
          { showIf: isOneOf('q21', ['Tak', 'Tak, ale po podpisaniu poufności', 'Częściowo']), placeholder: 'np. https://drive.google.com/... lub: mam w mailu od SWRN z marca' })
      ]
    },

    /* ================================================================ ETAP 3 */
    { type: 'intro', stage: 3, lead: 'Nie chcemy reklamować wszystkiego naraz. Najpierw wybierzemy produkt, który najłatwiej sprzedać i który daje największą wartość klientowi oraz Tobie.' },

    {
      type: 'q', stage: 3, q: [22, 22], fields: [
        F.rank('q22', 'Które produkty według Ciebie mają największy potencjał?', [
          'ubezpieczenie grupowe bez pracodawcy', 'ubezpieczenie dla osoby prowadzącej działalność',
          'ubezpieczenie po zmianie lub utracie pracy', 'karta sportowa bez pracodawcy',
          'pakiety medyczne', 'benefity dla rodzin', 'benefity dla małych firm', 'inne'
        ], { n: 22, req: true, help: 'Zaznacz produkty, a następnie ustaw kolejność od najważniejszego.' }),
        F.text('q22_other', 'Jaki inny produkt?', { showIf: has('q22', 'inne') })
      ]
    },

    {
      type: 'q', stage: 3, q: [23, 24], fields: [
        F.text('q23', 'Który produkt najłatwiej dziś wyjaśnić klientowi?', { n: 23, req: true }),
        F.text('q24', 'Który produkt najłatwiej dziś sprzedać?', { n: 24, req: true })
      ]
    },

    {
      type: 'q', stage: 3, q: [25, 27], fields: [
        F.text('q25', 'Który produkt daje Ci najlepszy przychód miesięczny?', { n: 25, quick: true }),
        F.text('q26', 'Który produkt klienci utrzymują najdłużej?', { n: 26, quick: true }),
        F.text('q27', 'Które produkty mają najwięcej rezygnacji?', { n: 27, quick: true })
      ]
    },

    {
      type: 'q', stage: 3, q: [28, 29], fields: [
        F.area('q28', 'Jakie są najczęstsze pytania klientów dotyczące SWRN?', { n: 28, req: true, placeholder: 'Wypisz je tak, jak padają w rozmowie — to gotowy materiał na stronę i FAQ.' }),
        F.area('q29', 'Jakie są najczęstsze obawy klientów?', { n: 29, req: true })
      ]
    },

    {
      type: 'q', stage: 3, q: [30, 30], fields: [
        F.area('q30', 'Dlaczego klienci najczęściej rezygnują z zakupu lub nie kończą zapisu?', { n: 30, req: true, placeholder: 'np. gubią się przy rejestracji, nie rozumieją co dokładnie kupują, odkładają decyzję' })
      ]
    },

    {
      type: 'q', stage: 3, q: [31, 32], fields: [
        F.area('q31', 'Co Twoim zdaniem jest największą przewagą SWRN nad ofertami kupowanymi indywidualnie?', { n: 31, req: true }),
        F.area('q32', 'Co jest największą wadą lub utrudnieniem?', { n: 32, req: true })
      ]
    },

    /* ================================================================ ETAP 4 */
    { type: 'intro', stage: 4, lead: 'Teraz wybierzemy ludzi, dla których stworzymy pierwszy lejek.' },

    {
      type: 'q', stage: 4, q: [33, 33], fields: [
        F.check('q33', 'Które grupy klientów są dla Ciebie najważniejsze?', [
          'osoby prowadzące jednoosobową działalność', 'osoby pracujące w małych firmach bez benefitów',
          'osoby niepracujące na etacie', 'osoby po zmianie pracy', 'osoby, które straciły ubezpieczenie grupowe',
          'freelancerzy', 'właściciele małych firm', 'pracodawcy szukający benefitów', 'rodziny',
          'osoby zainteresowane sportem', 'osoby 50+', 'obecni klienci innych ubezpieczeń', 'inne'
        ], { n: 33, req: true }),
        F.text('q33_other', 'Jaka inna grupa?', { showIf: has('q33', 'inne') })
      ]
    },

    {
      type: 'q', stage: 4, q: [34, 35], fields: [
        F.check('q34', 'Która z tych grup najczęściej kupuje obecnie?', null, { n: 34, optionsFrom: 'q33', max: 2, req: true, help: 'Wybierz maksymalnie dwie.' }),
        F.check('q35', 'Z którą grupą masz najlepszy kontakt i największe doświadczenie?', null, { n: 35, optionsFrom: 'q33', max: 2, req: true })
      ]
    },

    {
      type: 'q', stage: 4, q: [36, 37], fields: [
        F.radio('q36', 'Czy oferta ma być promowana:', ['lokalnie na Śląsku', 'w całej Polsce', 'najpierw lokalnie, później w całej Polsce'], { n: 36, req: true }),
        F.radio('q37', 'Czy chcesz rozwijać głównie:', ['klientów indywidualnych', 'firmy', 'oba segmenty równolegle'], { n: 37, req: true })
      ]
    },

    {
      type: 'q', stage: 4, q: [38, 38], fields: [
        F.radio('q38', 'Czy masz już kontakty do firm, którym można zaproponować benefity dla pracowników?',
          ['Tak, sporo', 'Tak, kilka', 'Nie, ale mogę je zdobyć', 'Nie'], { n: 38, req: true }),
        F.text('q38_count', 'Ile firm mniej więcej?', { showIf: isOneOf('q38', ['Tak, sporo', 'Tak, kilka']), numeric: true, placeholder: 'np. 15' })
      ]
    },

    {
      type: 'q', stage: 4, q: [39, 39], fields: [
        F.text('q39', 'Ilu obecnych lub dawnych klientów można potencjalnie poinformować o nowej ofercie?', { n: 39, numeric: true, quick: true, placeholder: 'np. 200' }),
        F.radio('q39_consent', 'Czy posiadasz zgody na kontakt marketingowy z tymi osobami?',
          ['Tak, mam zgody', 'Częściowo', 'Nie', 'Muszę sprawdzić'], { req: true }),
        { type: 'info', id: '_i39', text: 'Nie chodzi jeszcze o przekazywanie nam danych osobowych. Potrzebujemy jedynie przybliżonej liczby i informacji, czy posiadasz odpowiednie zgody na kontakt.' }
      ]
    },

    /* ================================================================ ETAP 5 */
    { type: 'intro', stage: 5, lead: 'Dobry lejek nie może generować więcej kontaktów, niż jesteśmy w stanie profesjonalnie obsłużyć.' },

    {
      type: 'q', stage: 5, q: [40, 41], fields: [
        F.radio('q40', 'Ile nowych kontaktów tygodniowo jesteś w stanie obsłużyć?',
          ['do 5', '5–10', '10–20', '20–40', 'ponad 40', 'muszę sprawdzić'], { n: 40, req: true }),
        F.radio('q41', 'Jak szybko możesz skontaktować się z nową osobą?',
          ['do 15 minut', 'do godziny', 'tego samego dnia', 'następnego dnia', 'zależy od dnia'], { n: 41, req: true })
      ]
    },

    {
      type: 'q', stage: 5, q: [42, 43], fields: [
        F.check('q42', 'Jak chcesz otrzymywać nowe leady?',
          ['e-mail', 'SMS', 'WhatsApp', 'Messenger', 'panel internetowy', 'arkusz Google', 'CRM'], { n: 42, req: true }),
        F.check('q43', 'Jak klient powinien móc się z Tobą skontaktować?',
          ['telefon', 'oddzwonienie', 'WhatsApp', 'Messenger', 'e-mail', 'wideorozmowa', 'spotkanie osobiste'], { n: 43, req: true })
      ]
    },

    {
      type: 'q', stage: 5, q: [44, 45], fields: [
        F.radio('q44', 'Czy korzystasz obecnie z kalendarza do umawiania rozmów?', ['Tak', 'Nie', 'Nie wiem'], { n: 44, req: true }),
        F.text('q44_link', 'Podaj link do kalendarza', { showIf: is('q44', 'Tak'), placeholder: 'np. https://calendly.com/...' }),
        F.radio('q45', 'Czy korzystasz z CRM?', ['Tak', 'Nie', 'Nie wiem'], { n: 45, req: true }),
        F.text('q45_name', 'Z jakiego CRM korzystasz?', { showIf: is('q45', 'Tak'), placeholder: 'np. Berg System, Livespace, arkusz Google' })
      ]
    },

    {
      type: 'q', stage: 5, q: [46, 47], fields: [
        F.text('q46', 'Kto poza Tobą może obsługiwać nowe kontakty?', { n: 46, quick: true, placeholder: 'np. nikt / asystentka / współpracownik' }),
        F.text('q47', 'W jakich godzinach najłatwiej się z Tobą skontaktować?', { n: 47, req: true, placeholder: 'np. pon.–pt. 9:00–18:00' })
      ]
    },

    {
      type: 'q', stage: 5, q: [48, 49], fields: [
        F.radio('q48', 'Ile trwa przeciętna rozmowa potrzebna do dobrania oferty?',
          ['do 15 minut', '15–30 minut', '30–60 minut', 'ponad godzinę', 'zależy od produktu'], { n: 48, req: true }),
        F.radio('q49', 'Czy klient może dokonać zakupu bez rozmowy z Tobą?',
          ['Tak, w pełni samodzielnie', 'Tak, ale zwykle potrzebuje wsparcia', 'Nie', 'Nie wiem'], { n: 49, req: true })
      ]
    },

    {
      type: 'q', stage: 5, q: [50, 50], fields: [
        F.radio('q50', 'Czy wolisz:', [
          'najpierw krótką kwalifikację przez formularz', 'bezpośrednią rezerwację rozmowy',
          'możliwość wyboru przez klienta', 'inny model'
        ], { n: 50, req: true }),
        F.text('q50_other', 'Jaki inny model?', { showIf: is('q50', 'inny model') })
      ]
    },

    /* ================================================================ ETAP 6 */
    { type: 'intro', stage: 6, lead: 'Chcemy stworzyć osobny projekt sprzedażowy, ale nie odcinać go od Twojej wiarygodności i doświadczenia.' },

    {
      type: 'q', stage: 6, q: [51, 51], fields: [
        F.radio('q51', 'Czy zgadzasz się na stworzenie osobnej marki skoncentrowanej na benefitach dostępnych bez pracodawcy?',
          ['Tak', 'Tak, ale chcę omówić nazwę', 'Wolę rozwijać istniejącą markę', 'Nie wiem'], { n: 51, req: true })
      ]
    },

    {
      type: 'q', stage: 6, q: [52, 52], fields: [
        F.radio('q52', 'Które rozwiązanie najbardziej Ci odpowiada?', [
          'osobna marka, której jestem twarzą', 'osobna marka tylko subtelnie podpisana moim nazwiskiem',
          'projekt Premium Centrum Finansowego', 'marka osobista Michała Elżbieciaka', 'do wspólnego ustalenia'
        ], { n: 52, req: true })
      ]
    },

    {
      type: 'q', stage: 6, q: [53, 54], fields: [
        F.scale('q53', 'Jak oceniasz roboczą nazwę: „Benefity bez etatu”?', { n: 53, req: true, low: 'Nie przekonuje mnie', high: 'Bardzo dobra' }),
        F.area('q53_note', 'Komentarz do nazwy', { placeholder: 'Co Ci w niej pasuje, a co nie?' }),
        F.area('q54', 'Jakie inne nazwy lub określenia przychodzą Ci do głowy?', { n: 54 })
      ]
    },

    {
      type: 'q', stage: 6, q: [55, 55], fields: [
        F.radio('q55', 'Czy chcesz występować na stronie jako główna twarz projektu?',
          ['Tak', 'Raczej tak, ale dyskretnie', 'Nie', 'Do ustalenia'], { n: 55, req: true })
      ]
    },

    {
      type: 'q', stage: 6, q: [56, 56], fields: [
        F.matrix('q56', 'Czy zgadzasz się na wykorzystanie:',
          ['zdjęcia', 'imienia i nazwiska', 'historii zawodowej', 'opinii klientów',
            'logotypu Premium Centrum Finansowego', 'informacji o doświadczeniu', 'informacji o działalności społecznej'],
          ['Tak', 'Nie', 'Do omówienia'], { n: 56, req: true })
      ]
    },

    {
      type: 'q', stage: 6, q: [57, 58], fields: [
        F.radio('q57', 'Czy jesteś gotowy nagrywać krótkie materiały wideo?',
          ['tak, regularnie', 'tak, sporadycznie', 'potrzebuję pomocy podczas nagrań', 'wolę nie występować na wideo'], { n: 57, req: true }),
        F.radio('q58', 'Jaki styl komunikacji najlepiej do Ciebie pasuje?',
          ['ekspercki i konkretny', 'prosty i bezpośredni', 'spokojny i rodzinny', 'energiczny', 'premium', 'mieszany'], { n: 58, req: true })
      ]
    },

    {
      type: 'q', stage: 6, q: [59, 59], fields: [
        F.area('q59', 'Jakich określeń, obietnic lub sposobów komunikacji nie chcesz używać?', { n: 59, quick: true, placeholder: 'np. „najtaniej”, obietnice gwarantowanego zysku, agresywna sprzedaż' })
      ]
    },

    {
      type: 'q', stage: 6, q: [60, 61], fields: [
        F.check('q60', 'Czy materiały i reklamy muszą być zatwierdzane przez:',
          ['SWRN', 'ubezpieczycieli', 'współpracującą multiagencję', 'dział prawny', 'nikogo', 'nie wiem'], { n: 60, req: true }),
        F.matrix('q61', 'Czy możemy używać nazw i logotypów:',
          ['SWRN', 'ubezpieczycieli', 'Medicover Sport', 'innych partnerów'], YNZ, { n: 61, req: true })
      ]
    },

    /* ================================================================ ETAP 7 */
    { type: 'intro', stage: 7, lead: 'Nie chcemy mieszać intensywnej promocji nowego lejka z całą Twoją codzienną komunikacją.' },

    {
      type: 'q', stage: 7, q: [62, 63], fields: [
        F.radio('q62', 'Czy zgadzasz się na utworzenie osobnej strony na Facebooku dla nowej marki?',
          ['Tak', 'Nie', 'Chcę to omówić'], { n: 62, req: true }),
        F.radio('q63', 'Jak często możesz udostępniać materiały nowej marki na swoim profilu prywatnym?',
          ['raz w tygodniu', 'kilka razy w miesiącu', 'tylko najważniejsze materiały', 'nie chcę wykorzystywać profilu prywatnego'], { n: 63, req: true })
      ]
    },

    {
      type: 'q', stage: 7, q: [64, 66], fields: [
        F.radio('q64', 'Czy obecny firmowy Facebook ma wspierać nowy projekt?', ['Tak', 'Nie', 'Częściowo', 'Nie mam firmowego profilu'], { n: 64, req: true }),
        F.radio('q65', 'Czy Instagram ma być:', ['osobnym kanałem nowej marki', 'prowadzony w ramach obecnego konta', 'uruchomiony później', 'niewykorzystywany'], { n: 65, req: true }),
        F.radio('q66', 'Czy LinkedIn ma wspierać ofertę dla firm?', ['Tak', 'Nie', 'Później', 'Nie mam profilu na LinkedIn'], { n: 66, req: true })
      ]
    },

    {
      type: 'q', stage: 7, q: [67, 67], fields: [
        F.radio('q67', 'Czy posiadasz dostęp administracyjny do wszystkich swoich stron i profili?',
          ['Tak, do wszystkich', 'Do części', 'Nie', 'Muszę sprawdzić'], { n: 67, req: true }),
        F.text('q67_note', 'Do czego nie masz dostępu?', { showIf: isOneOf('q67', ['Do części', 'Nie']) })
      ]
    },

    {
      type: 'q', stage: 7, q: [68, 68], fields: [
        F.radio('q68', 'Czy w przeszłości prowadziłeś płatne reklamy?', ['Tak', 'Nie', 'Nie pamiętam'], { n: 68, req: true }),
        F.text('q68_budget', 'Jaki był budżet?', { showIf: is('q68', 'Tak'), placeholder: 'np. 500 zł miesięcznie' }),
        F.text('q68_what', 'Co było promowane?', { showIf: is('q68', 'Tak') }),
        F.area('q68_results', 'Jakie były wyniki?', { showIf: is('q68', 'Tak'), placeholder: 'np. dużo kliknięć, mało rozmów' }),
        F.text('q68_who', 'Kto prowadził kampanie?', { showIf: is('q68', 'Tak') })
      ]
    },

    {
      type: 'q', stage: 7, q: [69, 70], fields: [
        F.radio('q69', 'Czy możemy otrzymać dostęp wyłącznie analityczny do statystyk Meta?', ['Tak', 'Nie', 'Do omówienia'], { n: 69, req: true }),
        F.check('q70', 'Czy posiadasz piksel Meta, Google Analytics albo inne narzędzia pomiarowe?',
          ['piksel Meta', 'Google Analytics', 'Google Tag Manager', 'Google Ads', 'inne narzędzie', 'nie posiadam', 'nie wiem'], { n: 70, req: true }),
        F.text('q70_other', 'Jakie inne narzędzie?', { showIf: has('q70', 'inne narzędzie') })
      ]
    },

    /* ================================================================ ETAP 8 */
    { type: 'intro', stage: 8, lead: 'Działalność społeczna jest ważną częścią Twojej wiarygodności. Nie chcemy jednak wykorzystywać fundacji do nachalnej sprzedaży.' },

    {
      type: 'q', stage: 8, q: [71, 71], fields: [
        F.area('q71', 'Jaka jest dokładna relacja między: Fundacją Wspieramy Marzenia, Hokejem od Serca, Piłką od Serca, Basketem od Serca, Tobą jako osobą i Premium Centrum Finansowym?',
          { n: 71, req: true, rows: 8, placeholder: 'Opisz własnymi słowami — kto jest właścicielem, kto organizatorem, co jest wydarzeniem, a co podmiotem.' })
      ]
    },

    {
      type: 'q', stage: 8, q: [72, 73], fields: [
        F.radio('q72', 'Czy możemy informować na stronie o Twoim zaangażowaniu społecznym?', ['Tak', 'Nie', 'Tak, ale bardzo oszczędnie'], { n: 72, req: true }),
        F.radio('q73', 'Czy możemy używać zdjęć z wydarzeń?', YNZ, { n: 73, req: true })
      ]
    },

    {
      type: 'q', stage: 8, q: [74, 75], fields: [
        F.radio('q74', 'Czy logotypy i nazwy wydarzeń mogą być wykorzystywane w materiałach biznesowych?', YNZ, { n: 74, req: true }),
        F.radio('q75', 'Czy partnerzy i sponsorzy wydarzeń mogą potencjalnie otrzymać osobną ofertę biznesową?',
          ['Tak', 'Nie', 'Tylko wybrani', 'Do omówienia'], { n: 75, req: true })
      ]
    },

    {
      type: 'q', stage: 8, q: [76, 76], fields: [
        F.area('q76', 'Czy istnieją zasady lub granice, których bezwzględnie nie powinniśmy przekraczać?', { n: 76, quick: true, placeholder: 'np. nie łączymy zbiórek charytatywnych ze sprzedażą produktu' })
      ]
    },

    /* ================================================================ ETAP 9 */
    { type: 'intro', stage: 9, lead: 'Na końcu ustalimy, jaki wynik ma przynieść cały projekt.' },

    {
      type: 'q', stage: 9, q: [77, 77], fields: [
        F.radio('q77_mode', 'Ilu nowych aktywnych klientów SWRN chcesz pozyskać?', ['Podam cele', 'Ustalimy po analizie'], { n: 77, req: true }),
        F.text('q77_3', 'W ciągu 3 miesięcy', { showIf: is('q77_mode', 'Podam cele'), numeric: true, placeholder: 'np. 20' }),
        F.text('q77_6', 'W ciągu 6 miesięcy', { showIf: is('q77_mode', 'Podam cele'), numeric: true, placeholder: 'np. 60' }),
        F.text('q77_12', 'W ciągu 12 miesięcy', { showIf: is('q77_mode', 'Podam cele'), numeric: true, placeholder: 'np. 150' })
      ]
    },

    {
      type: 'q', stage: 9, q: [78, 78], fields: [
        F.radio('q78_mode', 'Jaki miesięczny przychód odnawialny chcesz osiągnąć dzięki temu projektowi?', ['Podam kwoty', 'Ustalimy po analizie'], { n: 78, req: true }),
        F.text('q78_3', 'Po 3 miesiącach', { showIf: is('q78_mode', 'Podam kwoty'), placeholder: 'np. 2 000 zł' }),
        F.text('q78_6', 'Po 6 miesiącach', { showIf: is('q78_mode', 'Podam kwoty'), placeholder: 'np. 5 000 zł' }),
        F.text('q78_12', 'Po 12 miesiącach', { showIf: is('q78_mode', 'Podam kwoty'), placeholder: 'np. 12 000 zł' })
      ]
    },

    {
      type: 'q', stage: 9, q: [79, 80], fields: [
        F.radio('q79', 'Jaki miesięczny budżet reklamowy jesteś gotowy przeznaczyć na pierwszy test?',
          ['do 500 zł', '500–1000 zł', '1000–2000 zł', '2000–5000 zł', 'powyżej 5000 zł', 'jeszcze nie wiem'], { n: 79, req: true }),
        F.radio('q80', 'Jaką kwotę jesteś gotowy przeznaczyć na budowę strony, lejka i systemu?',
          ['chcę najpierw poznać propozycję', 'mam określony budżet', 'wolę model etapowy', 'chcę omówić to podczas spotkania'], { n: 80, req: true }),
        F.text('q80_amount', 'Jaki to budżet?', { showIf: is('q80', 'mam określony budżet'), placeholder: 'np. 8 000 zł' })
      ]
    },

    {
      type: 'q', stage: 9, q: [81, 81], fields: [
        F.area('q81', 'Co musi się wydarzyć, żebyś po 90 dniach powiedział: „Ten projekt naprawdę działa”?', { n: 81, req: true, rows: 6 })
      ]
    },

    {
      type: 'q', stage: 9, q: [82, 83], fields: [
        F.area('q82', 'Czego najbardziej obawiasz się w tym projekcie?', { n: 82, req: true }),
        F.area('q83', 'Co jest dla Ciebie najważniejsze we współpracy z nami?', { n: 83, req: true })
      ]
    },

    {
      type: 'q', stage: 9, q: [84, 84], fields: [
        F.area('q84', 'Czy jest coś istotnego, o co nie zapytaliśmy?', { n: 84, quick: true, placeholder: 'To miejsce na wszystko, co uważasz za ważne, a o czym nie było mowy.' })
      ]
    },

    /* =========================================================== PODSUMOWANIE */
    { type: 'end', stage: 9 }
  ];

  /* indeks pól — potrzebny m.in. dla optionsFrom i eksportu */
  var FIELDS = {};
  SCREENS.forEach(function (s) {
    (s.fields || []).forEach(function (f) { FIELDS[f.id] = f; });
  });

  /* ------------------------------------------------------------------ stan */
  var state = { answers: {}, index: 0, started: false, completed: false, savedAt: null };

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
  var wiping = false;

  function save() {
    if (wiping) return;
    state.savedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        answers: state.answers, index: state.index,
        started: state.started, completed: state.completed, savedAt: state.savedAt
      }));
      flashSaved('Odpowiedzi zapisane');
    } catch (e) {
      flashSaved('Zapis niemożliwy w tej przeglądarce');
    }
  }
  var saveTimer = null;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 350); }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      return (d && typeof d === 'object' && d.answers) ? d : null;
    } catch (e) { return null; }
  }

  var flashTimer = null;
  function flashSaved(text) {
    if (!el.saved) return;
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
    }, 2600);
  }

  /* ----------------------------------------------------------- widoczność */
  function screenVisible(s) {
    if (s.showIf && !s.showIf(state.answers)) return false;
    if (s.type === 'q') return (s.fields || []).some(fieldVisible);
    return true;
  }
  function fieldVisible(f) { return !f.showIf || !!f.showIf(state.answers); }

  function visibleScreens() { return SCREENS.filter(screenVisible); }

  function optionsOf(f) {
    if (f.optionsFrom) {
      var src = state.answers[f.optionsFrom];
      if (Array.isArray(src) && src.length) return src.slice();
      var base = FIELDS[f.optionsFrom];
      return base && base.options ? base.options.slice() : [];
    }
    return f.options || [];
  }

  /* ---------------------------------------------------------------- render */
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  var pendingFocus = null;

  function render(opts) {
    opts = opts || {};
    var s = SCREENS[state.index];
    if (!s || !screenVisible(s)) { state.index = indexOfNextVisible(state.index, 1); s = SCREENS[state.index]; }

    el.screen.innerHTML = '';
    if (!opts.keepScroll) {
      el.screen.classList.remove('is-entering');
      void el.screen.offsetWidth;
      el.screen.classList.add('is-entering');
    }

    if (s.type === 'welcome') renderWelcome();
    else if (s.type === 'intro') renderIntro(s);
    else if (s.type === 'end') renderEnd();
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

  /* przerysowanie ekranu bez utraty pozycji i fokusu (pytania warunkowe) */
  function rerender(focusId) {
    pendingFocus = focusId || null;
    render({ keepScroll: true });
  }

  function renderWelcome() {
    var c = el.screen;
    c.appendChild(h('p', 'eyebrow', 'Formularz strategiczny'));
    c.appendChild(h('h1', 'screen-title', 'Cześć Michał.'));
    c.appendChild(h('p', 'lead', 'Zanim zaprojektujemy system, który pomoże Ci pozyskiwać nowych klientów i budować stały przychód, musimy dobrze poznać mechanizm Twojego biznesu.'));
    var l2 = h('p', 'lead'); l2.innerHTML = '<strong>To nie jest zwykła ankieta.</strong>';
    c.appendChild(l2);
    c.appendChild(h('p', 'lead', 'Twoje odpowiedzi pozwolą nam przygotować:'));
    var ul = h('ul', 'bullets');
    ['nową stronę', 'osobną markę produktową', 'lejek sprzedażowy', 'plan promocji', 'system mierzenia wyników']
      .forEach(function (t) { ul.appendChild(h('li', null, t)); });
    c.appendChild(ul);
    c.appendChild(h('hr', 'rule'));
    c.appendChild(h('p', 'lead', 'Wypełnienie formularza zajmie około 12–18 minut.'));
    c.appendChild(h('p', 'muted', 'Możesz przerwać w dowolnym momencie — odpowiedzi zapiszą się automatycznie na tym urządzeniu.'));

    var row = h('div', 'cta-row');
    var btn = h('button', 'btn btn--primary btn--xl', 'ROZPOCZYNAMY');
    btn.type = 'button';
    btn.addEventListener('click', function () { state.started = true; go(1); });
    row.appendChild(btn);
    c.appendChild(row);
    c.appendChild(h('p', 'cta-note', 'Twoje odpowiedzi służą wyłącznie przygotowaniu projektu dla Twojej działalności.'));
  }

  function renderIntro(s) {
    var c = el.screen;
    var st = stageOf(s.stage);
    c.appendChild(h('p', 'eyebrow', 'Etap ' + st.n + ' z 9'));
    c.appendChild(h('h1', 'screen-title', st.title.charAt(0) + st.title.slice(1).toLowerCase()));
    c.appendChild(h('p', 'lead', s.lead));
    c.appendChild(h('p', 'muted', 'Pytania w tym etapie pojawiają się pojedynczo. Nic nie ginie — wszystko zapisuje się na bieżąco.'));
  }

  function renderQuestions(s) {
    var c = el.screen;
    var st = stageOf(s.stage);
    var range = s.q[0] === s.q[1] ? ('Pytanie ' + s.q[0]) : ('Pytania ' + s.q[0] + '–' + s.q[1]);
    c.appendChild(h('p', 'eyebrow', 'Etap ' + st.n + ' · ' + range + ' z ' + TOTAL_QUESTIONS));

    s.fields.forEach(function (f) {
      if (!fieldVisible(f)) return;
      c.appendChild(renderField(f));
    });
  }

  function renderField(f) {
    var wrap = h('div', 'field');
    wrap.dataset.field = f.id;

    if (f.type === 'info') {
      wrap.className = 'field';
      wrap.appendChild(h('div', 'callout', f.text));
      return wrap;
    }

    var labelTag = (f.type === 'text' || f.type === 'textarea') ? 'label' : 'span';
    var lab = h(labelTag, 'field__label');
    if (f.n) {
      var no = h('span', 'qno', f.n + '.');
      lab.appendChild(no);
      lab.appendChild(document.createTextNode(' '));
    }
    lab.appendChild(document.createTextNode(f.label));
    if (labelTag === 'label') lab.setAttribute('for', 'in_' + f.id);
    wrap.appendChild(lab);

    if (f.help) wrap.appendChild(h('p', 'field__help', f.help));

    var control = buildControl(f);
    wrap.appendChild(control);

    if (f.quick && (f.type === 'text' || f.type === 'textarea')) {
      var q = h('div', 'quick');
      QUICK.forEach(function (t) {
        var b = h('button', 'chip', t);
        b.type = 'button';
        b.addEventListener('click', function () {
          setAnswer(f.id, t);
          var input = wrap.querySelector('#in_' + cssEsc(f.id));
          if (input) input.value = t;
          wrap.classList.remove('is-invalid');
        });
        q.appendChild(b);
      });
      wrap.appendChild(q);
    }

    var hint = h('div', 'hint');
    hint.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 6v5M10 13.6v.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    hint.appendChild(h('span', null, f.msg || MSG_DEFAULT));
    wrap.appendChild(hint);

    return wrap;
  }

  function cssEsc(s) { return String(s).replace(/([^\w-])/g, '\\$1'); }

  function buildControl(f) {
    switch (f.type) {
      case 'text': return ctrlText(f);
      case 'textarea': return ctrlArea(f);
      case 'radio': return ctrlChoice(f, false);
      case 'check': return ctrlChoice(f, true);
      case 'scale': return ctrlScale(f);
      case 'matrix': return ctrlMatrix(f);
      case 'rank': return ctrlRank(f);
      case 'rep': return ctrlRep(f);
      default: return h('div');
    }
  }

  function ctrlText(f) {
    var wrap = h('div', 'control');
    var i = document.createElement('input');
    i.type = 'text';
    i.id = 'in_' + f.id;
    i.name = f.id;
    if (f.numeric) { i.inputMode = 'numeric'; i.autocomplete = 'off'; }
    if (f.placeholder) i.placeholder = f.placeholder;
    i.value = state.answers[f.id] || '';
    i.addEventListener('input', function () { setAnswer(f.id, i.value); clearInvalid(i); });
    wrap.appendChild(i);
    return wrap;
  }

  function ctrlArea(f) {
    var wrap = h('div', 'control');
    var t = document.createElement('textarea');
    t.id = 'in_' + f.id;
    t.name = f.id;
    t.rows = f.rows || 4;
    if (f.placeholder) t.placeholder = f.placeholder;
    t.value = state.answers[f.id] || '';
    t.addEventListener('input', function () { setAnswer(f.id, t.value); clearInvalid(t); });
    wrap.appendChild(t);
    return wrap;
  }

  function ctrlChoice(f, multi) {
    var box = h('div', 'options');
    box.setAttribute('role', multi ? 'group' : 'radiogroup');
    box.setAttribute('aria-label', f.label);
    var opts = optionsOf(f);
    if (!opts.length) {
      box.appendChild(h('p', 'muted', 'Najpierw zaznacz obszary w poprzednim pytaniu.'));
      return box;
    }
    opts.forEach(function (opt, i) {
      var id = 'in_' + f.id + '_' + i;
      var lab = h('label', 'opt ' + (multi ? 'opt--check' : 'opt--radio'));
      lab.setAttribute('for', id);
      var input = document.createElement('input');
      input.type = multi ? 'checkbox' : 'radio';
      input.name = f.id;
      input.id = id;
      input.value = opt;

      var selected = multi
        ? (Array.isArray(state.answers[f.id]) && state.answers[f.id].indexOf(opt) !== -1)
        : state.answers[f.id] === opt;
      input.checked = selected;
      if (selected) lab.classList.add('is-selected');

      lab.appendChild(input);
      lab.appendChild(h('span', 'opt__box'));
      lab.appendChild(h('span', 'opt__text', opt));

      input.addEventListener('change', function () {
        if (multi) {
          var cur = Array.isArray(state.answers[f.id]) ? state.answers[f.id].slice() : [];
          var at = cur.indexOf(opt);
          if (input.checked) {
            if (f.max && cur.length >= f.max) {
              input.checked = false;
              toast('Możesz wybrać maksymalnie ' + f.max + ' ' + (f.max === 3 ? 'pozycje' : 'pozycji') + '.');
              return;
            }
            if (at === -1) cur.push(opt);
          } else if (at !== -1) { cur.splice(at, 1); }
          setAnswer(f.id, cur);
        } else {
          setAnswer(f.id, opt);
        }
        refreshChoiceUI(box, f, multi);
        if (dependsOnField(f.id)) rerender(input.id);
      });

      box.appendChild(lab);
    });
    return box;
  }

  function refreshChoiceUI(box, f, multi) {
    var val = state.answers[f.id];
    Array.prototype.forEach.call(box.querySelectorAll('.opt'), function (lab) {
      var input = lab.querySelector('input');
      var on = multi ? (Array.isArray(val) && val.indexOf(input.value) !== -1) : val === input.value;
      input.checked = on;
      lab.classList.toggle('is-selected', on);
    });
    var field = box.closest('.field');
    if (field) field.classList.remove('is-invalid');
  }

  function ctrlScale(f) {
    var wrap = h('div', 'control');
    var row = h('div', 'scale');
    row.setAttribute('role', 'radiogroup');
    row.setAttribute('aria-label', f.label);
    for (var i = 1; i <= 10; i++) {
      (function (v) {
        var b = h('button', 'scale__btn', String(v));
        b.type = 'button';
        b.setAttribute('aria-pressed', String(state.answers[f.id] === v));
        if (state.answers[f.id] === v) b.classList.add('is-selected');
        b.addEventListener('click', function () {
          setAnswer(f.id, v);
          Array.prototype.forEach.call(row.children, function (c) {
            var on = c === b;
            c.classList.toggle('is-selected', on);
            c.setAttribute('aria-pressed', String(on));
          });
          var field = row.closest('.field');
          if (field) field.classList.remove('is-invalid');
        });
        row.appendChild(b);
      })(i);
    }
    wrap.appendChild(row);
    var legend = h('div', 'scale__legend');
    legend.appendChild(h('span', null, '1 — ' + (f.low || 'zdecydowanie nie')));
    legend.appendChild(h('span', null, '10 — ' + (f.high || 'zdecydowanie tak')));
    wrap.appendChild(legend);
    return wrap;
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
          setAnswer(f.id, cur);
          Array.prototype.forEach.call(opts.children, function (c) {
            var on = c === b;
            c.classList.toggle('is-selected', on);
            c.setAttribute('aria-pressed', String(on));
          });
          var field = box.closest('.field');
          if (field) field.classList.remove('is-invalid');
        });
        opts.appendChild(b);
      });
      r.appendChild(opts);
      box.appendChild(r);
    });
    return box;
  }

  function ctrlRank(f) {
    var wrap = h('div', 'control');
    var chosen = Array.isArray(state.answers[f.id]) ? state.answers[f.id].slice() : [];
    var opts = optionsOf(f);

    var box = h('div', 'options options--tight');
    opts.forEach(function (opt, i) {
      var id = 'in_' + f.id + '_' + i;
      var lab = h('label', 'opt opt--check');
      lab.setAttribute('for', id);
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.value = opt;
      input.checked = chosen.indexOf(opt) !== -1;
      if (input.checked) lab.classList.add('is-selected');
      input.addEventListener('change', function () {
        var cur = Array.isArray(state.answers[f.id]) ? state.answers[f.id].slice() : [];
        var at = cur.indexOf(opt);
        if (input.checked && at === -1) cur.push(opt);
        if (!input.checked && at !== -1) cur.splice(at, 1);
        setAnswer(f.id, cur);
        lab.classList.toggle('is-selected', input.checked);
        drawOrder();
        if (dependsOnField(f.id)) rerender(input.id);
      });
      lab.appendChild(input);
      lab.appendChild(h('span', 'opt__box'));
      lab.appendChild(h('span', 'opt__text', opt));
      box.appendChild(lab);
    });
    wrap.appendChild(box);

    var orderTitle = h('p', 'field__help', 'Kolejność od najważniejszego:');
    orderTitle.style.marginTop = '18px';
    wrap.appendChild(orderTitle);
    var list = h('div', 'rank');
    wrap.appendChild(list);

    function drawOrder() {
      list.innerHTML = '';
      var cur = Array.isArray(state.answers[f.id]) ? state.answers[f.id] : [];
      if (!cur.length) { list.appendChild(h('p', 'rank__empty', 'Zaznacz produkty powyżej, a ustawimy je w kolejności.')); return; }
      cur.forEach(function (name, i) {
        var item = h('div', 'rank__item');
        item.appendChild(h('span', 'rank__pos', String(i + 1)));
        item.appendChild(h('span', 'rank__name', name));
        var ctrl = h('div', 'rank__ctrl');
        var up = h('button', 'icon-btn', '↑'); up.type = 'button'; up.setAttribute('aria-label', 'Przesuń „' + name + '” wyżej');
        var dn = h('button', 'icon-btn', '↓'); dn.type = 'button'; dn.setAttribute('aria-label', 'Przesuń „' + name + '” niżej');
        up.disabled = i === 0; dn.disabled = i === cur.length - 1;
        up.addEventListener('click', function () { move(i, -1); });
        dn.addEventListener('click', function () { move(i, 1); });
        ctrl.appendChild(up); ctrl.appendChild(dn);
        item.appendChild(ctrl);
        list.appendChild(item);
      });
    }
    function move(i, dir) {
      var cur = state.answers[f.id].slice();
      var j = i + dir;
      if (j < 0 || j >= cur.length) return;
      var t = cur[i]; cur[i] = cur[j]; cur[j] = t;
      setAnswer(f.id, cur);
      drawOrder();
    }
    drawOrder();
    return wrap;
  }

  function ctrlRep(f) {
    var wrap = h('div', 'control');
    var list = h('div', 'rep');
    wrap.appendChild(list);

    var add = h('button', 'btn btn--add', '+  ' + (f.addLabel || 'Dodaj pozycję'));
    add.type = 'button';
    add.addEventListener('click', function () {
      var cur = rows().slice();
      cur.push(blank());
      setAnswer(f.id, cur);
      draw();
      var inputs = list.querySelectorAll('input, select');
      if (inputs.length) inputs[inputs.length - f.cols.length].focus();
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
        head.appendChild(h('span', 'rep__title', (f.itemLabel || 'Pozycja') + ' ' + (idx + 1)));
        if (rows().length > 1) {
          var del = h('button', 'icon-btn', '×');
          del.type = 'button';
          del.setAttribute('aria-label', 'Usuń pozycję ' + (idx + 1));
          del.addEventListener('click', function () {
            var cur = rows().slice(); cur.splice(idx, 1);
            setAnswer(f.id, cur.length ? cur : [blank()]);
            draw();
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
          input.addEventListener('input', onChange);
          input.addEventListener('change', onChange);
          function onChange() {
            var cur = rows().slice();
            cur[idx] = ext({}, cur[idx]);
            cur[idx][col.id] = input.value;
            setAnswer(f.id, cur);
            clearInvalid(input);
          }
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

  /* ------------------------------------------------------------ odpowiedzi */
  function setAnswer(id, val) {
    state.answers[id] = val;
    saveSoon();
  }
  function clearInvalid(node) {
    var f = node.closest ? node.closest('.field') : null;
    if (f) f.classList.remove('is-invalid');
  }

  /* czy któreś pole bieżącego ekranu zależy od tego pola? */
  function dependsOnField(id) {
    var s = SCREENS[state.index];
    return (s.fields || []).some(function (f) {
      return f.showIf && f.showIf.dep === id;
    }) || hasOptionsFrom(id);
  }
  function hasOptionsFrom(id) {
    var s = SCREENS[state.index];
    return (s.fields || []).some(function (f) { return f.optionsFrom === id; });
  }

  /* ---------------------------------------------------------- walidacja */
  function validate() {
    var s = SCREENS[state.index];
    if (s.type !== 'q') return true;
    var firstBad = null;

    s.fields.forEach(function (f) {
      if (!fieldVisible(f) || !f.req) return;
      var node = el.screen.querySelector('[data-field="' + cssEsc(f.id) + '"]');
      if (!node) return;
      var ok = answered(f);
      node.classList.toggle('is-invalid', !ok);
      if (!ok && !firstBad) firstBad = node;
    });

    if (firstBad) {
      firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var focusable = firstBad.querySelector('input, textarea, select, button');
      if (focusable) focusable.focus({ preventScroll: true });
      return false;
    }
    return true;
  }

  function answered(f) {
    var v = state.answers[f.id];
    switch (f.type) {
      case 'text': case 'textarea': return typeof v === 'string' && v.trim() !== '';
      case 'radio': return !!v;
      case 'check': case 'rank': return Array.isArray(v) && v.length > 0;
      case 'scale': return typeof v === 'number';
      case 'matrix':
        if (!v) return false;
        return f.rows.every(function (r) { return !!v[r]; });
      case 'rep':
        if (!Array.isArray(v) || !v.length) return false;
        return v.some(function (row) {
          return Object.keys(row).some(function (k) { return String(row[k] || '').trim() !== ''; });
        });
      default: return true;
    }
  }

  /* --------------------------------------------------------------- nawigacja */
  function indexOfNextVisible(from, dir) {
    var i = from + dir;
    while (i >= 0 && i < SCREENS.length && !screenVisible(SCREENS[i])) i += dir;
    if (i < 0) return 0;
    if (i >= SCREENS.length) return SCREENS.length - 1;
    return i;
  }

  function go(dir) {
    if (dir > 0 && !validate()) return;
    var next = indexOfNextVisible(state.index, dir > 0 ? 1 : -1);
    if (next === state.index) return;
    state.index = next;
    if (SCREENS[state.index].type === 'end') state.completed = true;
    save();
    render();
  }

  function goToIndex(i) {
    state.index = Math.max(0, Math.min(SCREENS.length - 1, i));
    save();
    render();
  }

  function updateChrome(s) {
    var vis = visibleScreens();
    var pos = vis.indexOf(s);
    var pct = vis.length > 1 ? Math.round((pos / (vis.length - 1)) * 100) : 0;

    var isForm = s.type === 'q' || s.type === 'intro';
    el.progress.hidden = s.type === 'welcome';
    el.navbar.hidden = !isForm;

    el.fill.style.width = (s.type === 'welcome' ? 0 : pct) + '%';
    el.percent.textContent = (s.type === 'welcome' ? 0 : pct) + '%';
    var st = s.stage ? stageOf(s.stage) : null;
    el.stage.textContent = st ? ('Etap ' + st.n + ' z 9 · ' + st.title.charAt(0) + st.title.slice(1).toLowerCase()) : '';

    el.back.disabled = pos <= 0 || s.type === 'welcome';
    el.next.textContent = isLastQuestionScreen(s) ? 'Zakończ' : 'Dalej';
  }

  function isLastQuestionScreen(s) {
    var vis = visibleScreens();
    var i = vis.indexOf(s);
    return i >= 0 && i + 1 < vis.length && vis[i + 1].type === 'end';
  }

  function stageOf(n) { return STAGES[n - 1] || { n: n, title: '' }; }

  /* ------------------------------------------------------------ podsumowanie */
  function renderEnd() {
    var c = el.screen;
    c.appendChild(h('p', 'eyebrow', 'Podsumowanie'));
    c.appendChild(h('h1', 'screen-title', 'Dziękujemy, Michał.'));
    c.appendChild(h('p', 'lead', 'Mamy komplet informacji potrzebnych do rozpoczęcia analizy.'));
    c.appendChild(h('p', 'lead', 'Na podstawie Twoich odpowiedzi przygotujemy:'));
    var ul = h('ul', 'bullets');
    ['diagnozę obecnego modelu', 'wybór pierwszego produktu', 'propozycję nowej marki', 'strukturę strony',
      'pierwszy lejek sprzedażowy', 'plan pilotażu', 'sposób mierzenia opłacalności']
      .forEach(function (t) { ul.appendChild(h('li', null, t)); });
    c.appendChild(ul);
    c.appendChild(h('p', 'lead', 'To nie jest jeszcze automatyczna oferta.'));
    c.appendChild(h('p', 'muted', 'Najpierw przeanalizujemy odpowiedzi i przygotujemy rozwiązanie dopasowane do Twojego biznesu.'));

    var sig = h('div', 'sig');
    sig.appendChild(h('div', 'sig__name', 'Piotr Mądrzyk'));
    sig.appendChild(h('div', 'sig__role', 'PM GROWTH LAB · Strategia. Technologia. Wzrost.'));
    c.appendChild(sig);

    var grid = h('div', 'actions-grid');
    var summaryBox = h('div', 'summary');
    summaryBox.hidden = true;

    grid.appendChild(mkBtn('ZOBACZ MOJE ODPOWIEDZI', 'btn--primary', function (b) {
      summaryBox.hidden = !summaryBox.hidden;
      b.textContent = summaryBox.hidden ? 'ZOBACZ MOJE ODPOWIEDZI' : 'UKRYJ ODPOWIEDZI';
      if (!summaryBox.hidden) {
        buildSummary(summaryBox);
        summaryBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }));
    grid.appendChild(mkBtn('POPRAW ODPOWIEDZI', 'btn--light', function () {
      var vis = visibleScreens();
      var first = vis.filter(function (x) { return x.type === 'q'; })[0];
      goToIndex(SCREENS.indexOf(first));
    }));
    grid.appendChild(mkBtn('SKOPIUJ ODPOWIEDZI', 'btn--light', function () { copyText(buildTxt()); }));
    grid.appendChild(mkBtn('POBIERZ ODPOWIEDZI JAKO TXT', 'btn--light', function () {
      download('formularz-strategiczny-michal-elzbieciak.txt', buildTxt(), 'text/plain;charset=utf-8');
    }));
    grid.appendChild(mkBtn('POBIERZ ODPOWIEDZI JAKO JSON', 'btn--light', function () {
      download('formularz-strategiczny-michal-elzbieciak.json', buildJson(), 'application/json;charset=utf-8');
    }));
    c.appendChild(grid);
    c.appendChild(summaryBox);
  }

  function mkBtn(text, cls, fn) {
    var b = h('button', 'btn ' + cls, text);
    b.type = 'button';
    b.addEventListener('click', function () { fn(b); });
    return b;
  }

  function buildSummary(box) {
    box.innerHTML = '';
    box.appendChild(h('hr', 'rule'));
    box.appendChild(h('h2', 'screen-title', 'Twoje odpowiedzi'));
    collect().forEach(function (stage) {
      box.appendChild(h('p', 'summary__stage', 'Etap ' + stage.n + ' — ' + stage.title));
      stage.items.forEach(function (it) {
        var row = h('div', 'summary__row');
        row.appendChild(h('p', 'summary__q', it.label));
        var a = h('p', 'summary__a', it.text || 'brak odpowiedzi');
        if (!it.text) a.classList.add('is-empty');
        row.appendChild(a);
        box.appendChild(row);
      });
    });
  }

  /* zbiera odpowiedzi w kolejności etapów */
  function collect() {
    var out = [];
    STAGES.forEach(function (st) {
      var items = [];
      SCREENS.forEach(function (s) {
        if (s.stage !== st.n || s.type !== 'q' || !screenVisible(s)) return;
        s.fields.forEach(function (f) {
          if (f.type === 'info' || !fieldVisible(f)) return;
          items.push({
            id: f.id,
            label: (f.n ? f.n + '. ' : '· ') + f.label,
            text: formatAnswer(f),
            raw: state.answers[f.id] === undefined ? null : state.answers[f.id]
          });
        });
      });
      if (items.length) out.push({ n: st.n, title: st.title, items: items });
    });
    return out;
  }

  function formatAnswer(f) {
    var v = state.answers[f.id];
    if (v === undefined || v === null || v === '') return '';
    switch (f.type) {
      case 'check':
        return Array.isArray(v) && v.length ? v.join(', ') : '';
      case 'rank':
        return Array.isArray(v) && v.length ? v.map(function (x, i) { return (i + 1) + ') ' + x; }).join('\n') : '';
      case 'scale':
        return v + ' / 10';
      case 'matrix':
        var rows = f.rows.filter(function (r) { return v[r]; });
        return rows.length ? rows.map(function (r) { return '· ' + r + ': ' + v[r]; }).join('\n') : '';
      case 'rep':
        if (!Array.isArray(v)) return '';
        var lines = [];
        v.forEach(function (row, i) {
          var parts = f.cols.map(function (c) {
            var val = String(row[c.id] || '').trim();
            return val ? c.label + ': ' + val : null;
          }).filter(Boolean);
          if (parts.length) lines.push((i + 1) + ') ' + parts.join(' | '));
        });
        return lines.join('\n');
      default:
        return String(v).trim();
    }
  }

  function completionPercent() {
    var total = 0, done = 0;
    SCREENS.forEach(function (s) {
      if (s.type !== 'q' || !screenVisible(s)) return;
      s.fields.forEach(function (f) {
        if (f.type === 'info' || !fieldVisible(f)) return;
        total++;
        if (answered(f)) done++;
      });
    });
    return total ? Math.round((done / total) * 100) : 0;
  }

  function todayPL() {
    var d = new Date();
    var p = function (x) { return (x < 10 ? '0' : '') + x; };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ', godz. ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function buildTxt() {
    var L = [];
    L.push('FORMULARZ STRATEGICZNY');
    L.push('MICHAŁ ELŻBIECIAK');
    L.push('PM GROWTH LAB');
    L.push('Data wypełnienia: ' + todayPL());
    L.push('Uzupełnienie odpowiedzi: ' + completionPercent() + '%');
    L.push('');
    L.push('Dokument zawiera odpowiedzi z formularza strategicznego.');
    L.push('Można go w całości wkleić jako materiał wejściowy do analizy.');
    L.push('');

    collect().forEach(function (stage) {
      L.push('==================================================');
      L.push('ETAP ' + stage.n + ' — ' + stage.title);
      L.push('==================================================');
      L.push('');
      stage.items.forEach(function (it) {
        L.push(it.label);
        var t = it.text || '(brak odpowiedzi)';
        t.split('\n').forEach(function (line, i) {
          L.push((i === 0 ? '→ ' : '   ') + line);
        });
        L.push('');
      });
    });

    L.push('==================================================');
    L.push('KONIEC FORMULARZA');
    L.push('Przygotowanie: Piotr Mądrzyk · PM Growth Lab');
    L.push('Strategia. Technologia. Wzrost.');
    return L.join('\n');
  }

  function buildJson() {
    var data = {
      formularz: 'Formularz strategiczny PM Growth Lab',
      klient: 'Michał Elżbieciak',
      autor: 'Piotr Mądrzyk — PM Growth Lab',
      dataWypelnienia: new Date().toISOString(),
      uzupelnienieProcent: completionPercent(),
      etapy: collect().map(function (st) {
        return {
          etap: st.n,
          tytul: st.title,
          odpowiedzi: st.items.map(function (it) {
            return { id: it.id, pytanie: it.label, odpowiedz: it.raw, tekst: it.text };
          })
        };
      }),
      surowe: state.answers
    };
    return JSON.stringify(data, null, 2);
  }

  function download(name, content, mime) {
    try {
      var blob = new Blob(['﻿' + content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 800);
      toast('Plik ' + name.split('.').pop().toUpperCase() + ' został pobrany.');
    } catch (e) {
      toast('Pobieranie niemożliwe w tej przeglądarce.');
    }
  }

  function copyText(text) {
    var done = function () { toast('Odpowiedzi skopiowane do schowka.'); };
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { toast('Nie udało się skopiować — pobierz plik TXT.'); }
      ta.remove();
    }
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
            wiping = true;
            clearTimeout(saveTimer);
            state.answers = {}; state.index = 0; state.started = false; state.completed = false;
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            location.reload();
          }
        },
        { label: 'Zostaw', fn: function () {} }
      ]);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !el.modal.hidden) { closeModal(); return; }
    if (e.key !== 'Enter') return;
    if (!el.modal.hidden) return;
    var t = e.target;
    var tag = t && t.tagName ? t.tagName.toLowerCase() : '';
    if (tag === 'textarea' && !(e.ctrlKey || e.metaKey)) return;
    if (tag === 'button' || tag === 'a' || tag === 'select') return;
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
              state.started = !!saved.started;
              state.completed = !!saved.completed;
              render();
              flashSaved('Wczytano zapisane odpowiedzi');
            }
          },
          {
            label: 'Zacznij od początku', fn: function () {
              state.answers = {}; state.index = 0; state.started = false; state.completed = false;
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

  /* API pomocnicze do testów automatycznych */
  window.PMGL = {
    state: state, SCREENS: SCREENS, go: go, goToIndex: goToIndex,
    buildTxt: buildTxt, buildJson: buildJson, collect: collect,
    completionPercent: completionPercent, visibleScreens: visibleScreens,
    setAnswer: function (id, v) { state.answers[id] = v; }, render: render, save: save,
    STORAGE_KEY: STORAGE_KEY
  };

  start();
})();
