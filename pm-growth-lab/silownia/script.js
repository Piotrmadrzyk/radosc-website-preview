/* ==========================================================================
   PM POWER LAB — Operacja Kaloryfer
   Strategiczny formularz ustalenia wspólnych treningów Piotrka i Bartka.
   Czysty JavaScript, bez zależności, bez backendu.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'pmpowerlab.kaloryfer.v1';
  var FORM_ID = 'pm-power-lab-kaloryfer-v1';
  var GYM = 'Zdrofit Rzeszów, al. gen. Leopolda Okulickiego';
  var DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
  var OTHER_HOUR = 'Inna godzina';

  /* ==========================================================================
     DANE PYTAŃ — celowo oddzielone od logiki interfejsu
     ========================================================================== */
  var QUESTIONS = [
    {
      id: 'q1', type: 'radio',
      title: 'Kto właśnie podejmuje jedną z najważniejszych decyzji swojego życia?',
      img: 'q01.webp',
      alt: 'Szef kuchni i organizator wskazują na siebie kciukami, każdy przypisuje sobie zasługę.',
      options: [
        'Bartek — szef kuchni, człowiek zahartowany przy piecu',
        'Piotrek — inicjator całego zamieszania',
        'Wypełniamy ankietę wspólnie',
        'Nie wiem, telefon został znaleziony w Bistro'
      ]
    },
    {
      id: 'q2', type: 'check',
      title: 'Jaki jest oficjalny cel Operacji Kaloryfer?',
      help: 'Można wybrać kilka celów. Komisja nie ocenia ambicji.',
      img: 'q02.webp',
      alt: 'Organizator mierzy taśmą krawiecką biceps szefa kuchni, obaj wyraźnie zadowoleni z wyniku.',
      exclusive: ['Wszystkie powyższe'],
      options: [
        'Schudnąć',
        'Zbudować mięśnie',
        'Poprawić kondycję',
        'Nie łapać zadyszki po wejściu po schodach',
        'Wyglądać dobrze latem',
        'Mieć usprawiedliwienie dla dodatkowego obiadu',
        'Wszystkie powyższe'
      ]
    },
    {
      id: 'q3', type: 'radio',
      title: 'Ile treningów tygodniowo jesteśmy w stanie wykonać naprawdę, a nie tylko w teorii?',
      img: 'q03.webp',
      alt: 'Dwaj mężczyźni przyklejają magnesy w kształcie hantli do wielkiego planera na ścianie.',
      options: [
        '1 trening — wersja demonstracyjna',
        '2 treningi — plan rozsądny',
        '3 treningi — zaczynamy traktować sprawę poważnie',
        '4 treningi — ktoś tu uwierzył w przemianę życia',
        '5 lub więcej — odpowiedź złożona pod wpływem emocji'
      ]
    },
    {
      id: 'q4', type: 'check',
      title: 'Które dni tygodnia nadają się do wspólnego treningu?',
      help: 'Można wybrać kilka dni. System nie przyjmuje odpowiedzi: kiedyś.',
      img: 'q04.webp',
      alt: 'Dwaj mężczyźni analizują tygodniowy plan treningów nad stołem sztabowym, ze wskaźnikami w dłoniach.',
      options: DAYS.slice()
    },
    {
      id: 'q5', type: 'check',
      title: 'Które dni są absolutnie niemożliwe?',
      help: 'Tu wpisujemy prawdę, a nie plany. Prawda jest tańsza w utrzymaniu.',
      img: 'q05.webp',
      alt: 'Szef kuchni w środku kuchennego szczytu, z rękami pełnymi garnków, a przy drzwiach czeka torba treningowa.',
      exclusive: ['Żaden — jestem człowiekiem elastycznym', 'Wszystkie — musimy przeprowadzić dodatkowe negocjacje'],
      options: DAYS.concat([
        'Żaden — jestem człowiekiem elastycznym',
        'Wszystkie — musimy przeprowadzić dodatkowe negocjacje'
      ])
    },
    {
      id: 'q6', type: 'check', tiles: true,
      title: 'O której godzinie najłatwiej będzie rozpocząć trening?',
      help: 'Można wskazać kilka okien czasowych. Im więcej, tym trudniej o wymówkę.',
      img: 'q06.webp',
      alt: 'Poranna walka z ogromnym budzikiem — komiczna scena w sypialni o świcie.',
      options: [
        '6:00 — tryb wojskowy',
        '7:00 — zanim świat zacznie przeszkadzać',
        '8:00 — wersja cywilizowana',
        '15:00 — po pracy, przed wymówkami',
        '16:00', '17:00', '18:00', '19:00',
        '20:00 — trening nocnych wojowników',
        OTHER_HOUR
      ],
      extra: { id: 'q6_time', type: 'time', label: 'Wpisz własną godzinę', when: OTHER_HOUR }
    },
    {
      id: 'q7', type: 'radio',
      title: 'Jak długo powinien trwać jeden trening?',
      img: 'q07.webp',
      alt: 'Szef kuchni biegnie na bieżni i zerka na wielki zegar ścienny, organizator zachęca go gestem.',
      options: [
        '30 minut — lepsze to niż nic',
        '45 minut — szybko i konkretnie',
        '60 minut — standard operacyjny',
        '75 minut — wchodzimy głębiej',
        '90 minut — razem z rozmowami o życiu',
        'Do momentu, aż jeden z nas zacznie negocjować powrót do domu'
      ]
    },
    {
      id: 'q8', type: 'date',
      title: 'Od kiedy oficjalnie zaczynamy?',
      help: 'Data musi istnieć w kalendarzu. „Od nowego roku” nie jest wystarczająco precyzyjne.',
      img: 'q08.webp',
      alt: 'Obaj mężczyźni w blokach startowych na podłodze siłowni, gotowi do startu o wschodzie słońca.',
      note: 'Podpowiadamy najbliższy poniedziałek, ale datę można zmienić na dowolną inną.'
    },
    {
      id: 'q9', type: 'check',
      title: 'Który rodzaj treningu brzmi najmniej przerażająco?',
      help: 'Można wybrać kilka. Odwaga jest podzielna.',
      img: 'q09.webp',
      alt: 'Dwaj mężczyźni w środku karuzeli sprzętu: bieżnia, rower, sztanga i maszyny krążą wokół nich.',
      exclusive: ['Wszystkiego po trochu'],
      options: [
        'Trening całego ciała',
        'Maszyny',
        'Wolne ciężary',
        'Bieżnia lub orbitrek',
        'Rower',
        'Trening obwodowy',
        'Wszystkiego po trochu',
        'Najpierw instruktaż, zanim zrobimy sobie krzywdę'
      ]
    },
    {
      id: 'q10', type: 'check',
      title: 'Jakie wymówki oficjalnie wykreślamy z regulaminu?',
      help: 'Każda zaznaczona pozycja przestaje być argumentem. Wybieraj odważnie.',
      img: 'q10.webp',
      alt: 'Dwaj mężczyźni z wysiłkiem wynoszą ogromną wygodną kanapę przez drzwi siłowni.',
      options: [
        'Nie chce mi się',
        'Pada deszcz',
        'Jest za gorąco',
        'Jest za zimno',
        'Miałem ciężki dzień',
        'Zaczniemy od przyszłego tygodnia',
        'Zjadłem za dużo',
        'Zjadłem za mało',
        'Dzisiaj jest jakiś dziwny dzień',
        'Merkury prawdopodobnie jest w retrogradacji'
      ]
    },
    {
      id: 'q11', type: 'check',
      title: 'Kiedy wolno odwołać wspólny trening?',
      help: 'To jedyna lista uznawanych powodów. Reszta wymaga negocjacji.',
      img: 'q11.webp',
      alt: 'Szef kuchni z torbą treningową na ramieniu odbiera pilny telefon, w tle kipi garnek.',
      options: [
        'Choroba',
        'Pilna sytuacja rodzinna',
        'Poważna awaria w Bistro',
        'Niespodziewany obowiązek zawodowy',
        'Kontuzja',
        'Zamknięcie siłowni',
        'Inwazja obcych',
        'Nigdy z powodu zwykłego „nie chce mi się”'
      ]
    },
    {
      id: 'q12', type: 'radio',
      title: 'Jaką karę ponosi osoba, która odwoła trening bez ważnego powodu?',
      img: 'q12.webp',
      alt: 'Organizator wręcza szefowi kuchni kawę i miskę sałatki jako przyjacielską karę umowną.',
      options: [
        'Stawia drugiemu kawę',
        'Stawia zdrowy posiłek',
        'Robi dodatkowe 10 minut cardio',
        'Następnym razem nie marudzi podczas rozgrzewki',
        'Publicznie przyznaje: „Przegrałem z kanapą”',
        'Kara zostanie ustalona przez komisję Piotrek–Bartek'
      ],
      extra: { id: 'q12_custom', type: 'textarea', label: 'Własna propozycja kary (opcjonalnie)', optional: true, placeholder: 'np. stawia śniadanie przez cały następny tydzień' }
    }
  ];

  /* etykiety do podsumowania i kontraktu */
  var SUMMARY_LABELS = {
    q1: 'Osoba wypełniająca',
    q2: 'Cele operacji',
    q3: 'Liczba treningów w tygodniu',
    q4: 'Dni treningowe',
    q5: 'Dni absolutnie niemożliwe',
    q6: 'Preferowane godziny',
    q7: 'Czas trwania treningu',
    q8: 'Data rozpoczęcia',
    q9: 'Preferowane rodzaje treningu',
    q10: 'Wymówki wykreślone z regulaminu',
    q11: 'Uznane powody odwołania',
    q12: 'Kara za nieuzasadnione odwołanie'
  };

  var RISK_LEVELS = {
    low: { name: 'Niskie', text: 'Istnieje szansa, że naprawdę pójdziecie.' },
    mid: { name: 'Umiarkowane', text: 'Plan wygląda dobrze, ale kanapa nadal pozostaje groźnym przeciwnikiem.' },
    high: { name: 'Wysokie', text: 'Wykryto niebezpiecznie dużo odpowiedzi teoretycznych.' },
    max: { name: 'Krytyczne', text: 'System zaleca natychmiastowe spakowanie torby treningowej.' }
  };

  /* ekrany: powitanie → 12 pytań → kontrakt → zakończenie */
  var SCREENS = [{ type: 'welcome', img: 'start.webp', alt: 'Szef kuchni i organizator przybijają uścisk dłoni nad hantlem leżącym na stole.' }];
  QUESTIONS.forEach(function (q) { SCREENS.push({ type: 'q', q: q }); });
  SCREENS.push({ type: 'contract', img: 'kontrakt.webp', alt: 'Obaj mężczyźni składają uroczystą przysięgę z dłońmi na hantlu ustawionym na cokole.' });
  SCREENS.push({ type: 'done', img: 'finisz.webp', alt: 'Szef kuchni opiera się wizji ogromnego burgera unoszącej się nad sztangą.' });

  var CONTRACT_INDEX = SCREENS.length - 2;
  var DONE_INDEX = SCREENS.length - 1;

  /* ==========================================================================
     STAN
     ========================================================================== */
  var state = { answers: {}, index: 0, savedAt: null, signedP: false, signedB: false };
  var wiping = false;

  var el = {
    screen: document.getElementById('screen'),
    navbar: document.getElementById('navbar'),
    back: document.getElementById('btnBack'),
    next: document.getElementById('btnNext'),
    progress: document.getElementById('progress'),
    fill: document.getElementById('progressFill'),
    stage: document.getElementById('progressStage'),
    percent: document.getElementById('progressPercent'),
    risk: document.getElementById('riskBadge'),
    riskValue: document.getElementById('riskValue'),
    saved: document.getElementById('savedFlag'),
    savedText: document.getElementById('savedText'),
    reset: document.getElementById('btnReset'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    modalActions: document.getElementById('modalActions'),
    toast: document.getElementById('toast'),
    printDoc: document.getElementById('printDoc')
  };

  /* ==========================================================================
     ZAPIS I ODCZYT
     ========================================================================== */
  function save() {
    if (wiping) return;
    state.savedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        answers: state.answers, index: state.index, savedAt: state.savedAt,
        signedP: state.signedP, signedB: state.signedB
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
      return d && typeof d === 'object' && d.answers ? d : null;
    } catch (e) { return null; }
  }

  var flashTimer = null;
  function flashSaved(text) {
    el.savedText.textContent = text;
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
    }, 3200);
  }

  /* ==========================================================================
     NARZĘDZIA
     ========================================================================== */
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function pad(x) { return (x < 10 ? '0' : '') + x; }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function nextMondayISO() {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    var delta = (8 - d.getDay()) % 7 || 7;   /* zawsze najbliższy przyszły poniedziałek */
    d.setDate(d.getDate() + delta);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  var MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  var WEEKDAYS = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  function formatDate(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length !== 3) return iso;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    if (isNaN(d.getTime())) return iso;
    return WEEKDAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  /* wariant do wnętrza zdania: „od dnia 3 sierpnia 2026 (poniedziałek)” */
  function formatDateInline(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length !== 3) return iso;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    if (isNaN(d.getTime())) return iso;
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ' (' + WEEKDAYS[d.getDay()] + ')';
  }
  function daysFromToday(iso) {
    var p = String(iso || '').split('-');
    if (p.length !== 3) return 0;
    var target = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((target - now) / 86400000);
  }
  function joinList(list, conj) {
    var a = list.filter(Boolean);
    if (!a.length) return '';
    if (a.length === 1) return a[0];
    return a.slice(0, -1).join(', ') + ' ' + (conj || 'i') + ' ' + a[a.length - 1];
  }
  /* skraca etykiety godzin i treningów do samej wartości: „6:00 — tryb wojskowy” → „6:00” */
  function shortLabel(text) { return String(text).split(' — ')[0]; }
  /* nazwy własne zostają wielką literą także w środku zdania kontraktu */
  var PROPER = ['Merkury', 'Bistro', 'Piotrek', 'Bartek', 'Zdrofit'];
  function lower(s) {
    if (!s) return s;
    var first = String(s).split(/[\s,—]/)[0];
    if (PROPER.indexOf(first) !== -1) return s;
    return s.charAt(0).toLowerCase() + s.slice(1);
  }

  /* ==========================================================================
     ODPOWIEDZI W FORMIE TEKSTU
     ========================================================================== */
  function answerText(q) {
    var v = state.answers[q.id];
    if (q.type === 'date') return v ? formatDate(v) : '';
    if (q.type === 'check') {
      var list = arr(v).slice();
      if (q.id === 'q6') {
        list = list.map(function (o) {
          return o === OTHER_HOUR
            ? (state.answers.q6_time ? state.answers.q6_time : OTHER_HOUR)
            : o;
        });
      }
      return list.join(', ');
    }
    var out = v || '';
    if (q.id === 'q12' && state.answers.q12_custom) {
      out += (out ? ' · ' : '') + 'Własna propozycja: ' + state.answers.q12_custom;
    }
    return out;
  }

  /* godziny w formie skróconej — do kontraktu */
  function chosenHours() {
    return arr(state.answers.q6).map(function (o) {
      return o === OTHER_HOUR ? (state.answers.q6_time || '') : shortLabel(o);
    }).filter(Boolean);
  }
  function trainingDays() { return arr(state.answers.q4); }

  /* ==========================================================================
     WSKAŹNIK RYZYKA WYMÓWEK
     ========================================================================== */
  function riskScore() {
    var a = state.answers;
    var s = 0;

    var per = a.q3 || '';
    if (per.indexOf('1 trening') === 0) s += 3;
    else if (per.indexOf('2 treningi') === 0) s += 1;
    else if (per.indexOf('4 treningi') === 0) s += 1;
    else if (per.indexOf('5 lub więcej') === 0) s += 3;

    var days = trainingDays().length;
    if (a.q4) { if (days <= 1) s += 3; else if (days === 2) s += 1; }

    var no = arr(a.q5);
    if (no.indexOf('Wszystkie — musimy przeprowadzić dodatkowe negocjacje') !== -1) s += 4;
    else if (no.indexOf('Żaden — jestem człowiekiem elastycznym') !== -1) s -= 1;
    else if (no.length >= 4) s += 2;

    var hours = chosenHours().length;
    if (a.q6) { if (hours === 1) s += 1; else if (hours >= 3) s -= 1; }

    var dur = a.q7 || '';
    if (dur.indexOf('30 minut') === 0) s += 1;
    if (dur.indexOf('Do momentu') === 0) s += 2;

    if (a.q8) {
      var dd = daysFromToday(a.q8);
      if (dd > 21) s += 3; else if (dd > 10) s += 1; else if (dd <= 3) s -= 1;
    }

    var cut = arr(a.q10).length;
    if (a.q10) { if (cut >= 6) s -= 2; else if (cut >= 3) s -= 1; else s += 2; }

    var can = arr(a.q11);
    if (can.indexOf('Nigdy z powodu zwykłego „nie chce mi się”') !== -1) s -= 2;
    if (can.filter(function (x) { return x !== 'Nigdy z powodu zwykłego „nie chce mi się”'; }).length >= 6) s += 2;

    if (arr(a.q2).indexOf('Mieć usprawiedliwienie dla dodatkowego obiadu') !== -1) s += 1;
    if (a.q12 === 'Kara zostanie ustalona przez komisję Piotrek–Bartek') s += 2;
    if (a.q12 === 'Publicznie przyznaje: „Przegrałem z kanapą”') s -= 1;
    if (a.q1 === 'Nie wiem, telefon został znaleziony w Bistro') s += 1;

    return s;
  }
  function riskLevel() {
    var s = riskScore();
    if (s <= 0) return 'low';
    if (s <= 3) return 'mid';
    if (s <= 6) return 'high';
    return 'max';
  }
  function answeredCount() {
    return QUESTIONS.filter(function (q) { return isAnswered(q); }).length;
  }
  function updateRisk() {
    var show = answeredCount() >= 2;
    el.risk.hidden = !show;
    if (!show) return;
    var lvl = riskLevel();
    el.risk.dataset.level = lvl;
    el.riskValue.textContent = RISK_LEVELS[lvl].name;
    el.risk.title = RISK_LEVELS[lvl].text;
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */
  function render(opts) {
    opts = opts || {};
    var s = SCREENS[state.index];
    el.screen.innerHTML = '';

    if (!opts.keepScroll) {
      el.screen.classList.remove('is-entering');
      void el.screen.offsetWidth;
      el.screen.classList.add('is-entering');
    }

    /* ilustracja: ekrany własne trzymają ją u siebie, ekrany pytań — przy pytaniu */
    var pic = s.img || (s.q && s.q.img);
    var picAlt = s.alt || (s.q && s.q.alt);
    if (pic) el.screen.appendChild(figure(pic, picAlt, state.index === 0));

    if (s.type === 'welcome') renderWelcome();
    else if (s.type === 'contract') renderContract();
    else if (s.type === 'done') renderDone();
    else renderQuestion(s.q);

    updateChrome(s);
    updateRisk();
    preloadNext();

    if (!opts.keepScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      el.screen.focus({ preventScroll: true });
    }
  }

  function figure(file, alt, eager) {
    var fig = h('div', 'figure');
    var img = document.createElement('img');
    img.src = 'img/' + file;
    img.alt = alt || '';
    img.width = 1280;
    img.height = 720;
    img.decoding = 'async';
    if (!eager) img.loading = 'lazy';
    /* brak ilustracji nie może zepsuć układu karty — sekcja po prostu znika */
    img.addEventListener('error', function () { fig.hidden = true; });
    fig.appendChild(img);
    return fig;
  }
  function preloadNext() {
    var n = SCREENS[state.index + 1];
    if (n && n.img) { var i = new Image(); i.src = 'img/' + n.img; }
    else if (n && n.q && n.q.img) { var j = new Image(); j.src = 'img/' + n.q.img; }
  }

  function renderWelcome() {
    var c = el.screen;
    var stamp = h('div', 'stamp');
    stamp.appendChild(document.createTextNode('Bistro Pełne Radości'));
    stamp.appendChild(h('span', null, '×'));
    stamp.appendChild(document.createTextNode('PM POWER LAB'));
    c.appendChild(stamp);

    c.appendChild(h('p', 'eyebrow', 'Strategiczny formularz treningowy'));
    c.appendChild(h('h1', 'screen-title', 'Operacja Kaloryfer'));
    c.appendChild(h('p', 'classified', 'Poufny dokument przeznaczony wyłącznie dla dwóch zawodników wysokiego ryzyka: Piotrka i Bartka.'));
    c.appendChild(h('p', 'lead', 'Celem niniejszego badania jest ustalenie, czy dwóch zapracowanych ludzi jest w stanie chodzić regularnie na siłownię, zanim ponownie powiedzą: zaczynamy od przyszłego poniedziałku.'));
    c.appendChild(h('p', 'lead', 'Miejsce prowadzenia operacji: ' + GYM + '.'));

    var row = h('div', 'cta-row');
    var btn = h('button', 'btn btn--primary btn--xl', 'Rozpocznij badanie strategiczne');
    btn.type = 'button';
    btn.addEventListener('click', function () { go(1); });
    row.appendChild(btn);
    c.appendChild(row);
    c.appendChild(h('p', 'cta-note', 'Szacowany czas: 3–5 minut. Szacowany czas odkładania pierwszego treningu: nieograniczony.'));
  }

  function renderQuestion(q) {
    var c = el.screen;
    var n = QUESTIONS.indexOf(q) + 1;
    c.appendChild(h('p', 'eyebrow', 'Pytanie ' + n + ' z ' + QUESTIONS.length));

    var wrap = h('div', 'field');
    wrap.id = 'field_' + q.id;

    var labelTag = q.type === 'date' ? 'label' : 'span';
    var lab = h(labelTag, 'field__label', q.title);
    if (labelTag === 'label') lab.setAttribute('for', 'in_' + q.id);
    wrap.appendChild(lab);
    if (q.help) wrap.appendChild(h('p', 'field__help', q.help));

    if (q.type === 'radio' || q.type === 'check') wrap.appendChild(choices(q));
    else if (q.type === 'date') wrap.appendChild(dateField(q));

    if (q.extra && showExtra(q)) wrap.appendChild(extraField(q.extra));
    if (q.note) wrap.appendChild(h('p', 'field__note', q.note));
    wrap.appendChild(hint());

    c.appendChild(wrap);
  }

  function hint() {
    var box = h('div', 'hint');
    box.id = 'hintBox';
    box.setAttribute('role', 'alert');
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M10 2.5l8 15H2l8-15zM10 8v4M10 14.5v.5');
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.6');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    box.appendChild(svg);
    box.appendChild(h('span', null, ''));
    return box;
  }

  function showExtra(q) {
    if (!q.extra) return false;
    if (!q.extra.when) return true;
    return arr(state.answers[q.id]).indexOf(q.extra.when) !== -1 || state.answers[q.id] === q.extra.when;
  }

  function choices(q) {
    var multi = q.type === 'check';
    var box = h('div', 'options' + (q.tiles ? ' options--tiles' : ''));
    box.setAttribute('role', multi ? 'group' : 'radiogroup');
    box.setAttribute('aria-label', q.title);

    q.options.forEach(function (opt, i) {
      var id = 'in_' + q.id + '_' + i;
      var lab = h('label', 'opt ' + (multi ? 'opt--check' : 'opt--radio'));
      lab.setAttribute('for', id);
      var input = document.createElement('input');
      input.type = multi ? 'checkbox' : 'radio';
      input.name = q.id;
      input.id = id;
      input.value = opt;
      var on = multi ? arr(state.answers[q.id]).indexOf(opt) !== -1 : state.answers[q.id] === opt;
      input.checked = on;
      if (on) lab.classList.add('is-selected');
      lab.appendChild(input);
      lab.appendChild(h('span', 'opt__box'));
      lab.appendChild(h('span', 'opt__text', opt));

      input.addEventListener('change', function () {
        if (multi) toggleMulti(q, opt, input.checked);
        else state.answers[q.id] = opt;
        saveSoon();
        rerenderField(q, id);
      });
      box.appendChild(lab);
    });
    return box;
  }

  function toggleMulti(q, opt, checked) {
    var cur = arr(state.answers[q.id]).slice();
    var exclusive = q.exclusive || [];
    if (checked) {
      if (exclusive.indexOf(opt) !== -1) cur = [opt];
      else {
        cur = cur.filter(function (x) { return exclusive.indexOf(x) === -1; });
        if (cur.indexOf(opt) === -1) cur.push(opt);
      }
    } else {
      cur = cur.filter(function (x) { return x !== opt; });
    }
    /* kolejność zgodna z listą pytania — czytelniejsze podsumowanie */
    cur.sort(function (a, b) { return q.options.indexOf(a) - q.options.indexOf(b); });
    state.answers[q.id] = cur;
    if (q.extra && q.extra.when && cur.indexOf(q.extra.when) === -1) delete state.answers[q.extra.id];
  }

  function dateField(q) {
    var box = h('div');
    if (!state.answers[q.id]) state.answers[q.id] = nextMondayISO();
    var i = document.createElement('input');
    i.type = 'date';
    i.id = 'in_' + q.id;
    i.min = todayISO();
    i.value = state.answers[q.id];
    i.addEventListener('input', function () {
      state.answers[q.id] = i.value;
      saveSoon();
      updateRisk();
      clearError();
    });
    box.appendChild(i);
    return box;
  }

  function extraField(spec) {
    var box = h('div', 'sub' + (spec.optional ? ' sub--soft' : ''));
    var lab = h('label', 'sub__label', spec.label);
    lab.setAttribute('for', 'in_' + spec.id);
    box.appendChild(lab);
    var node;
    if (spec.type === 'textarea') {
      node = document.createElement('textarea');
      node.rows = 3;
    } else {
      node = document.createElement('input');
      node.type = spec.type;
    }
    node.id = 'in_' + spec.id;
    if (spec.placeholder) node.placeholder = spec.placeholder;
    node.value = state.answers[spec.id] || '';
    node.addEventListener('input', function () {
      state.answers[spec.id] = node.value;
      saveSoon();
      clearError();
    });
    box.appendChild(node);
    return box;
  }

  /* przerysowuje tylko bieżące pytanie, żeby nie przewijać widoku */
  function rerenderField(q, focusId) {
    var old = document.getElementById('field_' + q.id);
    if (!old) { render({ keepScroll: true }); return; }
    var fresh = h('div');
    var keep = el.screen;
    el.screen = fresh;
    renderQuestion(q);
    el.screen = keep;
    var next = fresh.querySelector('#field_' + q.id);
    old.parentNode.replaceChild(next, old);
    var back = document.getElementById(focusId);
    if (back) back.focus({ preventScroll: true });
    updateRisk();
  }

  function updateChrome(s) {
    var isQuestion = s.type === 'q';
    var step = state.index;
    var pct = Math.round((Math.min(step, CONTRACT_INDEX) / CONTRACT_INDEX) * 100);

    el.progress.hidden = s.type === 'welcome' || s.type === 'done';
    el.navbar.hidden = s.type === 'welcome' || s.type === 'done';
    el.fill.style.width = pct + '%';
    el.percent.textContent = pct + '%';
    el.stage.textContent = isQuestion
      ? 'Pytanie ' + (QUESTIONS.indexOf(s.q) + 1) + ' z ' + QUESTIONS.length
      : (s.type === 'contract' ? 'Podsumowanie i kontrakt' : '');
    el.back.disabled = state.index <= 0;
    el.next.textContent = state.index === CONTRACT_INDEX - 1
      ? 'Przejdź do kontraktu'
      : (s.type === 'contract' ? 'Zakończ badanie' : 'Dalej');
  }

  /* ==========================================================================
     WALIDACJA
     ========================================================================== */
  function isAnswered(q) {
    var v = state.answers[q.id];
    if (q.type === 'check') return arr(v).length > 0;
    return !!(v && String(v).trim());
  }

  function validate(q) {
    if (q.type === 'radio' && !state.answers[q.id]) {
      return 'Wybierz jedną odpowiedź, żeby przejść dalej. Badanie strategiczne nie znosi pustych pól.';
    }
    if (q.type === 'check' && arr(state.answers[q.id]).length === 0) {
      return 'Zaznacz przynajmniej jedną odpowiedź. Brak zaznaczenia system odczytuje jako „kiedyś”.';
    }
    if (q.type === 'date' && !state.answers[q.id]) {
      return 'Wybierz datę rozpoczęcia. „Od nowego roku” nie jest wystarczająco precyzyjne.';
    }
    if (q.type === 'date' && daysFromToday(state.answers[q.id]) < 0) {
      return 'Ta data już minęła. Operacji Kaloryfer nie da się rozpocząć wstecz.';
    }
    if (q.id === 'q6' && arr(state.answers.q6).indexOf(OTHER_HOUR) !== -1 && !state.answers.q6_time) {
      return 'Wpisz własną godzinę w polu poniżej. „Kiedyś po pracy” nie jest godziną.';
    }
    if (q.id === 'q5') {
      var conflict = collision();
      if (conflict) return conflict;
    }
    return null;
  }

  /* dzień nie może być jednocześnie możliwy i absolutnie niemożliwy */
  function collision() {
    var yes = trainingDays();
    var no = arr(state.answers.q5);
    if (no.indexOf('Wszystkie — musimy przeprowadzić dodatkowe negocjacje') !== -1 && yes.length) {
      return 'Zaznaczono, że wszystkie dni są niemożliwe, a wcześniej wskazano dni treningowe: '
        + joinList(yes.map(lower)) + '. Popraw jedną z tych odpowiedzi.';
    }
    var both = yes.filter(function (d) { return no.indexOf(d) !== -1; });
    if (both.length) {
      return 'Dzień nie może być jednocześnie możliwy i absolutnie niemożliwy: '
        + joinList(both.map(lower)) + '. Popraw pytanie 4 albo 5.';
    }
    return null;
  }

  function showError(msg) {
    var s = SCREENS[state.index];
    if (!s.q) { toast(msg); return; }
    var field = document.getElementById('field_' + s.q.id);
    var box = document.getElementById('hintBox');
    if (field && box) {
      field.classList.add('is-invalid');
      box.querySelector('span').textContent = msg;
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    toast(msg);
  }
  function clearError() {
    var s = SCREENS[state.index];
    if (!s.q) return;
    var field = document.getElementById('field_' + s.q.id);
    if (field) field.classList.remove('is-invalid');
  }

  /* ==========================================================================
     NAWIGACJA
     ========================================================================== */
  function go(dir) {
    var s = SCREENS[state.index];
    if (dir > 0) {
      if (s.type === 'q') {
        var err = validate(s.q);
        if (err) { showError(err); return; }
      }
      if (s.type === 'contract') {
        if (!state.signedP || !state.signedB) {
          toast('Kontrakt wymaga zatwierdzenia przez obie strony. Jedna strona to za mało.');
          var pending = document.querySelector('.sign__btn:not(.is-signed)');
          if (pending) { pending.focus(); pending.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          return;
        }
      }
    }
    var next = state.index + (dir > 0 ? 1 : -1);
    if (next < 0 || next >= SCREENS.length) return;
    state.index = next;
    save();
    render();
  }

  /* ==========================================================================
     PODSUMOWANIE I KONTRAKT
     ========================================================================== */
  function contractParts() {
    var a = state.answers;
    var days = trainingDays();
    var hours = chosenHours();
    var perWeek = shortLabel(a.q3 || '');
    var duration = shortLabel(a.q7 || '');
    var kinds = arr(a.q9);
    var reasons = arr(a.q11);
    var excuses = arr(a.q10);
    var goals = arr(a.q2);

    var penalty = a.q12 || '';
    if (a.q12_custom) penalty += ' (własna propozycja: ' + a.q12_custom + ')';

    var plan = [
      { label: 'Miejsce', value: GYM },
      { label: 'Liczba treningów', value: perWeek || '—' },
      { label: 'Dni treningowe', value: days.length ? joinList(days.map(lower)) : '—' },
      { label: 'Godziny', value: hours.length ? joinList(hours) : '—' },
      { label: 'Czas trwania', value: duration || '—' },
      { label: 'Start operacji', value: formatDate(a.q8) || '—' },
      { label: 'Rodzaje treningu', value: kinds.length ? joinList(kinds.map(lower)) : '—' },
      { label: 'Uznane powody odwołania', value: reasons.length ? joinList(reasons.map(lower)) : '—' },
      { label: 'Kara umowna', value: penalty || '—' }
    ];

    var lvl = riskLevel();
    var paragraphs = [
      'Piotrek i Bartek deklarują podjęcie wspólnej próby regularnego uczęszczania na siłownię Zdrofit przy al. gen. Leopolda Okulickiego w Rzeszowie. Ustalony plan obejmuje ' +
        (perWeek ? lower(perWeek) : 'ustaloną liczbę treningów') + ' w tygodniu' +
        (days.length ? ', w dniach: ' + joinList(days.map(lower)) : '') +
        (hours.length ? ', o godzinie ' + joinList(hours) : '') +
        (duration ? ', w wymiarze ' + lower(duration) : '') +
        (a.q8 ? ', licząc od dnia ' + formatDateInline(a.q8) : '') + '.',
      goals.length
        ? 'Za oficjalny cel operacji strony uznają: ' + joinList(goals.map(lower)) + '.'
        : 'Cel operacji zostanie ustalony w trybie roboczym.',
      kinds.length
        ? 'Zakres ćwiczeń obejmuje: ' + joinList(kinds.map(lower)) + '.'
        : 'Zakres ćwiczeń zostanie ustalony na miejscu.',
      excuses.length
        ? 'Z regulaminu zostają wykreślone następujące wymówki: ' + joinList(excuses.map(lower)) + '. Powoływanie się na nie nie wywołuje skutków prawnych ani towarzyskich.'
        : 'Strony nie wykreśliły żadnej wymówki, co komisja odnotowuje z niepokojem.',
      reasons.length
        ? 'Odwołanie treningu jest dopuszczalne wyłącznie z powodów: ' + joinList(reasons.map(lower)) + '.'
        : 'Katalog dopuszczalnych powodów odwołania pozostaje pusty.',
      'Strona, która odwoła trening bez ważnego powodu, ponosi następującą karę: ' + (penalty ? lower(penalty) : 'do ustalenia') + '.',
      'Wskaźnik ryzyka wymówek w chwili zawarcia kontraktu: ' + RISK_LEVELS[lvl].name.toLowerCase() + '. ' + RISK_LEVELS[lvl].text
    ];

    var noDays = arr(a.q5);
    if (noDays.length) {
      paragraphs.splice(1, 0, 'Za dni wyłączone z operacji strony uznają: ' + joinList(noDays.map(lower)) + '.');
    }

    return { plan: plan, paragraphs: paragraphs, level: lvl };
  }

  function renderContract() {
    var c = el.screen;
    c.appendChild(h('p', 'eyebrow', 'Podsumowanie badania'));
    c.appendChild(h('h1', 'screen-title', 'Wyniki są jednoznaczne.'));
    c.appendChild(h('p', 'lead', 'Poniżej znajduje się komplet ustaleń oraz wygenerowany na ich podstawie kontrakt. Odpowiedzi możesz jeszcze poprawić przyciskiem „Wstecz”.'));

    /* wskaźnik ryzyka */
    var lvl = riskLevel();
    var rp = h('div', 'riskpanel');
    rp.appendChild(h('span', 'riskpanel__badge', RISK_LEVELS[lvl].name));
    var rt = h('p', 'riskpanel__text');
    rt.appendChild(h('b', null, 'Wskaźnik ryzyka wymówek'));
    rt.appendChild(document.createTextNode(RISK_LEVELS[lvl].text));
    rp.appendChild(rt);
    c.appendChild(rp);

    /* odpowiedzi */
    var box = h('div', 'summary');
    QUESTIONS.forEach(function (q) {
      var txt = answerText(q);
      if (!txt) return;
      var row = h('div', 'summary__row');
      row.appendChild(h('p', 'summary__q', SUMMARY_LABELS[q.id] || q.title));
      row.appendChild(h('p', 'summary__a', txt));
      box.appendChild(row);
    });
    c.appendChild(box);

    /* kontrakt */
    var parts = contractParts();
    var contract = h('div', 'contract');
    contract.appendChild(h('p', 'contract__kicker', 'Dokument wygenerowany automatycznie'));
    contract.appendChild(h('h2', 'contract__title', 'Kontrakt Operacji Kaloryfer'));

    var ul = h('ul', 'contract__list');
    parts.plan.forEach(function (row) {
      var li = h('li');
      li.appendChild(h('b', null, row.label));
      li.appendChild(h('span', null, row.value));
      ul.appendChild(li);
    });
    contract.appendChild(ul);

    var body = h('div', 'contract__body');
    parts.paragraphs.forEach(function (p) { body.appendChild(h('p', null, p)); });
    contract.appendChild(body);

    /* zatwierdzenia */
    var sign = h('div', 'sign');
    sign.appendChild(signButton('Piotrek — zatwierdzam', 'Inicjator operacji', 'signedP'));
    sign.appendChild(signButton('Bartek — zatwierdzam', 'Szef kuchni Bistro Pełne Radości', 'signedB'));
    contract.appendChild(sign);

    var sealed = h('div', 'sealed', 'Kontrakt treningowy został zawarty. Od tej chwili wymówki wymagają pisemnego uzasadnienia w trzech egzemplarzach.');
    sealed.id = 'sealedBox';
    sealed.hidden = !(state.signedP && state.signedB);
    contract.appendChild(sealed);

    c.appendChild(contract);

    /* eksport */
    var actions = h('div', 'actions-grid');
    actions.appendChild(actionButton('Kopiuj kontrakt', copyContract));
    actions.appendChild(actionButton('Pobierz TXT', downloadTxt));
    actions.appendChild(actionButton('Pobierz JSON', downloadJson));
    actions.appendChild(actionButton('Drukuj lub zapisz PDF', printContract));
    c.appendChild(actions);
    c.appendChild(h('p', 'cta-note', 'Kontrakt powstaje w całości w tej przeglądarce. Nic nie jest nigdzie wysyłane.'));

    buildPrintDoc();
  }

  function signButton(name, role, key) {
    var b = h('button', 'sign__btn' + (state[key] ? ' is-signed' : ''));
    b.type = 'button';
    b.setAttribute('aria-pressed', String(!!state[key]));
    var mark = h('span', 'sign__mark');
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M4 10.5l4 4 8-9');
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '2.2');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    mark.appendChild(svg);
    b.appendChild(mark);
    var txt = h('span');
    txt.appendChild(h('span', 'sign__name', name));
    txt.appendChild(h('span', 'sign__role', role));
    b.appendChild(txt);

    b.addEventListener('click', function () {
      state[key] = !state[key];
      b.classList.toggle('is-signed', state[key]);
      b.setAttribute('aria-pressed', String(state[key]));
      var sealed = document.getElementById('sealedBox');
      var both = state.signedP && state.signedB;
      if (sealed) sealed.hidden = !both;
      if (both) toast('Kontrakt treningowy został zawarty.');
      save();
      buildPrintDoc();
    });
    return b;
  }

  function actionButton(label, fn) {
    var b = h('button', 'btn btn--light', label);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }

  function renderDone() {
    var c = el.screen;
    c.appendChild(h('p', 'eyebrow', 'Operacja aktywna'));
    c.appendChild(h('h1', 'screen-title', 'Kontrakt treningowy został zawarty.'));
    c.appendChild(h('p', 'classified', 'Od tej chwili wymówki wymagają pisemnego uzasadnienia w trzech egzemplarzach.'));

    var parts = contractParts();
    var ul = h('ul', 'bullets');
    ['Miejsce', 'Dni treningowe', 'Godziny', 'Start operacji'].forEach(function (key) {
      var row = parts.plan.filter(function (r) { return r.label === key; })[0];
      if (row) ul.appendChild(h('li', null, key + ': ' + row.value));
    });
    c.appendChild(ul);

    c.appendChild(h('p', 'lead', 'Wskaźnik ryzyka wymówek: ' + RISK_LEVELS[parts.level].name.toLowerCase() + '. ' + RISK_LEVELS[parts.level].text));

    var actions = h('div', 'actions-grid');
    actions.appendChild(actionButton('Kopiuj kontrakt', copyContract));
    actions.appendChild(actionButton('Pobierz TXT', downloadTxt));
    actions.appendChild(actionButton('Pobierz JSON', downloadJson));
    actions.appendChild(actionButton('Drukuj lub zapisz PDF', printContract));
    c.appendChild(actions);

    var row = h('div', 'cta-row');
    var back = h('button', 'btn btn--primary', 'Wróć do kontraktu');
    back.type = 'button';
    back.addEventListener('click', function () { state.index = CONTRACT_INDEX; save(); render(); });
    row.appendChild(back);
    c.appendChild(row);
    c.appendChild(h('p', 'cta-note', 'Odpowiedzi zostają zapisane na tym urządzeniu. Możesz wrócić do nich w każdej chwili.'));

    buildPrintDoc();
  }

  /* ==========================================================================
     EKSPORT
     ========================================================================== */
  function contractText() {
    var parts = contractParts();
    var lines = [];
    lines.push('KONTRAKT OPERACJI KALORYFER');
    lines.push('PM POWER LAB × Bistro Pełne Radości');
    lines.push('Dokument sporządzono: ' + formatDate(todayISO()));
    lines.push('');
    lines.push('USTALENIA');
    parts.plan.forEach(function (r) { lines.push('  ' + r.label + ': ' + r.value); });
    lines.push('');
    lines.push('TREŚĆ KONTRAKTU');
    parts.paragraphs.forEach(function (p) { lines.push(p); lines.push(''); });
    lines.push('PEŁNE ODPOWIEDZI');
    QUESTIONS.forEach(function (q, i) {
      lines.push('  ' + (i + 1) + '. ' + q.title);
      lines.push('     ' + (answerText(q) || '—'));
    });
    lines.push('');
    lines.push('ZATWIERDZENIA');
    lines.push('  Piotrek — zatwierdzam: ' + (state.signedP ? 'TAK' : 'jeszcze nie'));
    lines.push('  Bartek — zatwierdzam: ' + (state.signedB ? 'TAK' : 'jeszcze nie'));
    if (state.signedP && state.signedB) {
      lines.push('');
      lines.push('Kontrakt treningowy został zawarty. Od tej chwili wymówki wymagają');
      lines.push('pisemnego uzasadnienia w trzech egzemplarzach.');
    }
    return lines.join('\n');
  }

  function exportData() {
    var answers = {};
    QUESTIONS.forEach(function (q) {
      answers[q.id] = { pytanie: q.title, odpowiedz: state.answers[q.id] === undefined ? null : state.answers[q.id] };
    });
    if (state.answers.q6_time) answers.q6.wlasnaGodzina = state.answers.q6_time;
    if (state.answers.q12_custom) answers.q12.wlasnaKara = state.answers.q12_custom;
    var parts = contractParts();
    return {
      formularz: FORM_ID,
      nazwa: 'PM POWER LAB — Operacja Kaloryfer',
      miejsce: GYM,
      wygenerowano: new Date().toISOString(),
      ryzykoWymowek: { poziom: RISK_LEVELS[parts.level].name, komentarz: RISK_LEVELS[parts.level].text },
      ustalenia: parts.plan.reduce(function (acc, r) { acc[r.label] = r.value; return acc; }, {}),
      zatwierdzenia: { piotrek: !!state.signedP, bartek: !!state.signedB },
      odpowiedzi: answers
    };
  }

  function downloadFile(name, mime, content) {
    try {
      var blob = new Blob([content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast('Plik ' + name + ' został pobrany.');
    } catch (e) {
      toast('Ta przeglądarka nie pozwoliła pobrać pliku. Użyj kopiowania do schowka.');
    }
  }
  function downloadTxt() { downloadFile('kontrakt-operacja-kaloryfer.txt', 'text/plain;charset=utf-8', contractText()); }
  function downloadJson() { downloadFile('operacja-kaloryfer.json', 'application/json;charset=utf-8', JSON.stringify(exportData(), null, 2)); }

  function copyContract() {
    var text = contractText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast('Kontrakt skopiowany do schowka.');
      }, function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'readonly');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (ok) { toast('Kontrakt skopiowany do schowka.'); return; }
    openModal('Przeglądarka nie pozwoliła skopiować tekstu.',
      'Skorzystaj z przycisku „Pobierz TXT” — plik zawiera dokładnie tę samą treść kontraktu.',
      [
        { label: 'Pobierz TXT', primary: true, fn: downloadTxt },
        { label: 'Zamknij', fn: function () {} }
      ]);
  }

  function buildPrintDoc() {
    var parts = contractParts();
    var d = el.printDoc;
    d.innerHTML = '';
    d.appendChild(h('h1', null, 'Kontrakt Operacji Kaloryfer'));
    d.appendChild(h('p', 'pd-kicker', 'PM POWER LAB × Bistro Pełne Radości'));
    var ul = h('ul');
    parts.plan.forEach(function (r) {
      var li = h('li');
      li.appendChild(h('b', null, r.label));
      li.appendChild(document.createTextNode(r.value));
      ul.appendChild(li);
    });
    d.appendChild(ul);
    parts.paragraphs.forEach(function (p) { d.appendChild(h('p', null, p)); });

    var sig = h('div', 'pd-sign');
    sig.appendChild(h('p', null, 'Piotrek — zatwierdzam: ' + (state.signedP ? 'TAK' : '.....................')));
    sig.appendChild(h('p', null, 'Bartek — zatwierdzam: ' + (state.signedB ? 'TAK' : '.....................')));
    if (state.signedP && state.signedB) {
      sig.appendChild(h('p', null, 'Kontrakt treningowy został zawarty. Od tej chwili wymówki wymagają pisemnego uzasadnienia w trzech egzemplarzach.'));
    }
    d.appendChild(sig);
    d.appendChild(h('p', 'pd-foot', 'Dokument sporządzono: ' + formatDate(todayISO()) + '. Miejsce operacji: ' + GYM + '.'));
  }

  function printContract() {
    buildPrintDoc();
    window.print();
  }

  /* ==========================================================================
     MODAL
     ========================================================================== */
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

  /* ==========================================================================
     START
     ========================================================================== */
  el.next.addEventListener('click', function () { go(1); });
  el.back.addEventListener('click', function () { go(-1); });

  el.reset.addEventListener('click', function () {
    openModal('Zacząć badanie od nowa?',
      'Usuniemy wszystkie odpowiedzi i zatwierdzenia zapisane na tym urządzeniu. Tej operacji nie da się cofnąć.',
      [
        {
          label: 'Tak, zaczynamy od zera', primary: true, fn: function () {
            wiping = true;
            clearTimeout(saveTimer);
            state.answers = {};
            state.index = 0;
            state.signedP = false;
            state.signedB = false;
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            location.reload();
          }
        },
        { label: 'Zostaw jak jest', fn: function () {} }
      ]);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !el.modal.hidden) { closeModal(); return; }
    if (e.key !== 'Enter' || !el.modal.hidden) return;
    var t = e.target;
    var tag = t && t.tagName ? t.tagName.toLowerCase() : '';
    if (tag === 'textarea' || tag === 'button' || tag === 'a') return;
    if (t && (t.type === 'checkbox' || t.type === 'radio')) return;   /* Enter przełącza zaznaczenie */
    if (SCREENS[state.index].type === 'welcome') {
      var cta = el.screen.querySelector('.btn--primary');
      if (cta) { e.preventDefault(); cta.click(); }
      return;
    }
    if (el.navbar.hidden) return;
    e.preventDefault();
    go(1);
  });

  window.addEventListener('beforeunload', function () { clearTimeout(saveTimer); save(); });

  function start() {
    var saved = load();
    if (saved && Object.keys(saved.answers || {}).length) {
      state.answers = saved.answers;
      openModal('Znaleźliśmy rozpoczęte badanie.',
        'Chcesz kontynuować od miejsca, w którym skończyłeś?',
        [
          {
            label: 'Kontynuuj', primary: true, fn: function () {
              state.index = typeof saved.index === 'number' ? Math.min(Math.max(saved.index, 0), SCREENS.length - 1) : 0;
              state.signedP = !!saved.signedP;
              state.signedB = !!saved.signedB;
              render();
              flashSaved('Wczytano zapisane odpowiedzi');
            }
          },
          {
            label: 'Zacznij od nowa', fn: function () {
              state.answers = {};
              state.index = 0;
              state.signedP = false;
              state.signedB = false;
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

  /* interfejs do testów automatycznych */
  window.PMPOWER = {
    state: state, SCREENS: SCREENS, QUESTIONS: QUESTIONS, STORAGE_KEY: STORAGE_KEY,
    go: go, render: render, save: save, validate: validate,
    contractText: contractText, exportData: exportData,
    riskScore: riskScore, riskLevel: riskLevel, answerText: answerText,
    goTo: function (i) { state.index = Math.max(0, Math.min(SCREENS.length - 1, i)); save(); render(); }
  };

  start();
})();
