/* RADOŚĆ — interakcje (wspólne dla wszystkich podstron) */
(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* nagłówek: tło po przewinięciu */
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu mobilne */
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('open'); });
    } else {
      menu.classList.remove('open');
      window.setTimeout(function () { menu.hidden = true; }, reduced ? 0 : 300);
    }
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      burger.focus();
    }
  });

  /* subtelne wejścia sekcji przy przewijaniu */
  var revealed = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealed.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealed.forEach(function (el) { io.observe(el); });
  }

  /* formularze demonstracyjne — walidacja bez wysyłki */
  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  document.querySelectorAll('.demo-form').forEach(function (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var invalid = [];
      form.querySelectorAll('[required]').forEach(function (field) {
        var ok = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
        if (ok && field.type === 'email') ok = EMAIL_RE.test(field.value.trim());
        field.classList.toggle('field-error', !ok);
        if (!ok) invalid.push(field);
      });
      if (invalid.length) {
        status.classList.add('is-error');
        status.textContent = 'Uzupełnij poprawnie zaznaczone pola, aby wysłać zapytanie.';
        invalid[0].focus();
        return;
      }
      status.classList.remove('is-error');
      status.textContent =
        'Dziękujemy! Wysyłka formularza zostanie podłączona przed startem strony — ' +
        'do tego czasu prosimy o kontakt telefoniczny lub e-mail.';
      form.reset();
      form.querySelectorAll('.field-error').forEach(function (f) { f.classList.remove('field-error'); });
    });
    form.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('field-error');
    });
  });

  /* szybkie tematy (kontakt) — uzupełniają pole tematu w formularzu */
  var topicField = document.getElementById('topic');
  var chips = document.querySelectorAll('.chip[data-topic]');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      if (topicField) topicField.value = chip.getAttribute('data-topic');
    });
  });

  /* filtry realizacji */
  var filterButtons = document.querySelectorAll('.filter-btn');
  var realCards = document.querySelectorAll('.real-card');
  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      var f = btn.getAttribute('data-filter');
      realCards.forEach(function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(' ');
        card.classList.toggle('hidden', f !== 'all' && cats.indexOf(f) === -1);
      });
    });
  });
})();

/* ============================================================
   Renderowanie menu z plików danych (assets/data/lunch-menu.js,
   assets/data/menu.js) — menu edytuje się TYLKO tam.
   ============================================================ */
(function () {
  'use strict';
  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  var LEAF = ' <span class="veg-leaf" role="img" aria-label="opcja wegetariańska" title="opcja wegetariańska">🌱</span>';

  /* menu lunchowe (strona Bistro) */
  var lunchBox = document.getElementById('lunch-menu');
  if (lunchBox && window.RADOSC_LUNCH) {
    var L = window.RADOSC_LUNCH;
    var h = '';
    if (L.note) h += '<p class="lead"><b>' + esc(L.note) + '</b></p>';
    h += '<div class="lunch-week">';
    L.days.forEach(function (d) {
      h += '<div class="lunch-day"><h3>' + esc(d.day) + '</h3>';
      h += '<div class="lunch-item"><span class="tag">Zupa dnia</span>' +
           '<span class="name">' + esc(d.soup.name) + (d.soup.veg ? LEAF : '') + '</span></div>';
      d.mains.forEach(function (m) {
        h += '<div class="lunch-item"><span class="tag">' + esc(m.label) + '</span>' +
             '<span class="name">' + esc(m.name) + (m.veg ? LEAF : '') + '</span>' +
             (m.desc ? '<p class="desc">' + esc(m.desc) + '</p>' : '') + '</div>';
      });
      h += '</div>';
    });
    if (L.vegetarian) {
      h += '<div class="lunch-day lunch-veg"><h3>' + esc(L.vegetarian.title) + '</h3>';
      L.vegetarian.items.forEach(function (m) {
        h += '<div class="lunch-item"><span class="name">' + esc(m.name) + (m.veg ? LEAF : '') + '</span>' +
             (m.desc ? '<p class="desc">' + esc(m.desc) + '</p>' : '') + '</div>';
      });
      h += '</div>';
    }
    h += '</div>';
    h += '<p class="veg-legend">🌱 — opcja wegetariańska</p>';
    lunchBox.innerHTML = h;
  }

  /* karty menu: pizza / burgery / śniadania */
  function renderMenu(data, boxId, empty) {
    var box = document.getElementById(boxId);
    if (!box || !data) return;
    if (!data.items || !data.items.length) {
      box.innerHTML =
        '<div class="menu-empty"><h3>' + empty.title + '</h3><p>' + empty.text + '</p></div>';
      return;
    }
    var h = '';
    if (data.sizeNote) h += '<p class="menu-size-note">' + esc(data.sizeNote) + '</p>';
    h += '<div class="menu-list">';
    data.items.forEach(function (it) {
      h += '<div class="menu-item"><div class="row">' +
           '<span class="name">' + esc(it.name) + (it.veg ? LEAF : '') + '</span>' +
           '<span class="dots" aria-hidden="true"></span>' +
           (it.price != null ? '<span class="price">' + esc(it.price) + ' zł</span>' : '') +
           '</div>' +
           (it.desc ? '<p class="desc">' + esc(it.desc) + '</p>' : '') + '</div>';
    });
    h += '</div>';
    if (data.note) h += '<p class="menu-size-note">' + esc(data.note) + '</p>';
    box.innerHTML = h;
  }

  renderMenu(window.RADOSC_PIZZA, 'pizza-menu', {
    title: 'Aktualne menu pizzy potwierdzisz telefonicznie.',
    text: 'Pełną kartę pizzy przygotowujemy do publikacji. Zadzwoń — powiemy, co dziś pieczemy: <a class="tel-link" href="tel:+48723800801">723 800 801</a>.'
  });
  renderMenu(window.RADOSC_BURGERY, 'burger-menu', {
    title: 'Menu burgerów potwierdzisz telefonicznie.',
    text: 'Kartę burgerów przygotowujemy do publikacji. Zamówienia i pytania: <a class="tel-link" href="tel:+48723800801">723 800 801</a>.'
  });
  renderMenu(window.RADOSC_SNIADANIA, 'sniadania-menu', {
    title: 'Śniadania', text: ''
  });
})();

/* ============================================================
   ETAP 5.3 — menu weekendowe, antipasti/makarony,
   aktywne karty cateringowe
   ============================================================ */
(function () {
  'use strict';
  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  var LEAF = ' <span class="veg-leaf" role="img" aria-label="opcja wegetariańska" title="opcja wegetariańska">🌱</span>';

  function itemsHtml(items) {
    var h = '<div class="menu-list">';
    items.forEach(function (it) {
      var desc = [it.desc, it.grams].filter(Boolean).join(' · ');
      h += '<div class="menu-item"><div class="row">' +
           '<span class="name">' + esc(it.name) + (it.veg ? LEAF : '') + '</span>' +
           '<span class="dots" aria-hidden="true"></span>' +
           (it.price != null ? '<span class="price">' + esc(it.price) + ' zł</span>' : '') +
           '</div>' +
           (desc ? '<p class="desc">' + esc(desc) + '</p>' : '') + '</div>';
    });
    return h + '</div>';
  }

  /* antipasti + makarony (strona Pizza) */
  function renderExtra(data, boxId) {
    var box = document.getElementById(boxId);
    if (!box || !data || !data.items || !data.items.length) return;
    var h = '';
    if (data.sizeNote) h += '<p class="menu-size-note">' + esc(data.sizeNote) + '</p>';
    h += itemsHtml(data.items);
    if (data.note) h += '<p class="menu-size-note">' + esc(data.note) + '</p>';
    box.innerHTML = h;
  }
  renderExtra(window.RADOSC_ANTIPASTI, 'antipasti-menu');
  renderExtra(window.RADOSC_MAKARONY, 'makarony-menu');

  /* menu weekendowe (strona Bistro) */
  var wkBox = document.getElementById('weekend-menu');
  if (wkBox && window.RADOSC_WEEKEND) {
    var W = window.RADOSC_WEEKEND;
    var h = '';
    W.categories.forEach(function (cat) {
      h += '<h3 class="wk-cat">' + esc(cat.title) + '</h3>' + itemsHtml(cat.items);
    });
    wkBox.innerHTML = h;
  }

  /* aktywne karty cateringowe → wspólny formularz */
  var typeField = document.getElementById('inquiry-type');
  var intro = document.getElementById('inquiry-intro');
  var INTRO_TEXTS = {
    'Catering dla firm': 'Organizujesz spotkanie, szkolenie, konferencję albo chcesz zamawiać lunche dla zespołu? Napisz kilka zdań. Przygotujemy niezobowiązującą propozycję dopasowaną do liczby osób, miejsca i charakteru wydarzenia.',
    'Catering konferencyjny': 'Organizujesz spotkanie, szkolenie, konferencję albo chcesz zamawiać lunche dla zespołu? Napisz kilka zdań. Przygotujemy niezobowiązującą propozycję dopasowaną do liczby osób, miejsca i charakteru wydarzenia.',
    'Spotkanie biznesowe': 'Organizujesz spotkanie, szkolenie, konferencję albo chcesz zamawiać lunche dla zespołu? Napisz kilka zdań. Przygotujemy niezobowiązującą propozycję dopasowaną do liczby osób, miejsca i charakteru wydarzenia.',
    'Przyjęcie rodzinne': 'Planujesz komunię, chrzciny, urodziny, rocznicę lub inne rodzinne spotkanie? Opowiedz nam o terminie i liczbie gości. Skontaktujemy się, aby poznać szczegóły i przygotować indywidualną propozycję.',
    'Komunia lub chrzciny': 'Planujesz komunię, chrzciny, urodziny, rocznicę lub inne rodzinne spotkanie? Opowiedz nam o terminie i liczbie gości. Skontaktujemy się, aby poznać szczegóły i przygotować indywidualną propozycję.',
    'Wesele lub uroczystość': 'Planujesz wesele lub większą uroczystość? Podaj termin, miejsce i orientacyjną liczbę gości. Wspólnie omówimy menu, zakres obsługi i charakter wydarzenia.'
  };
  var DEFAULT_INTRO = 'Opowiedz nam o wydarzeniu — przygotujemy niezobowiązującą propozycję dopasowaną do terminu, miejsca i liczby gości.';
  document.querySelectorAll('[data-inquiry]').forEach(function (card) {
    card.addEventListener('click', function () {
      var val = card.getAttribute('data-inquiry');
      if (typeField) {
        typeField.value = val;
        typeField.classList.remove('field-error');
      }
      if (intro) {
        intro.textContent = INTRO_TEXTS[val] || DEFAULT_INTRO;
        intro.hidden = false;
      }
    });
  });
})();
