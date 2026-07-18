/* RADOŚĆ — interakcje (wspólne dla wszystkich podstron) */
window.__MAIN_JS_EXECUTIONS__ = (window.__MAIN_JS_EXECUTIONS__ || 0) + 1;
console.info('[RADOSC] main.js loaded', {
  build: window.__RADOSC_BUILD__,
  executions: window.__MAIN_JS_EXECUTIONS__,
  src: document.currentScript ? document.currentScript.src : null
});
(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* nagłówek: tło po przewinięciu */
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* hamburger i menu mobilne: obsługa w js/critical-navigation.js */

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

  /* ===== Nawigacja kotwic (ETAP 5.6.3 — uproszczenie awaryjne) =====
     Zanim main.js się wykona, kotwice działają natywnie (zwykłe href).
     Po inicjalizacji: preventDefault + pushState + navigateToSection:
     JEDEN scrollTo behavior:auto liczony od realnej wysokości headera
     + MAKSYMALNIE JEDNA korekta scrollBy w requestAnimationFrame.
     Bez smooth (przywrócimy po odbiorze live), bez scrollend,
     bez ResizeObserverów i timerów. */
  var contentReady = false;
  var pendingAnchor = null;

  function navigateToSection(id, opts) {
    var target = document.getElementById(id);
    if (!target) return false;
    var d = window.__RADOSC_DIAGNOSTICS__;
    var offset = header ? header.getBoundingClientRect().height : 0;
    var rectBefore = target.getBoundingClientRect().top;
    var yBefore = window.scrollY;
    var destination = Math.max(0, yBefore + rectBefore - offset - 16);
    if (d) d.lastScrollAttempt = { id: id, rectTopBefore: Math.round(rectBefore), scrollYBefore: Math.round(yBefore), destination: Math.round(destination), at: Math.round(performance.now()) };
    window.scrollTo({ top: destination, behavior: 'auto' });
    requestAnimationFrame(function () {
      var correction = target.getBoundingClientRect().top - offset - 16;
      if (Math.abs(correction) > 4) {
        window.scrollBy({ top: correction, behavior: 'auto' });
      }
      if (d) d.lastScrollResult = { id: id, scrollYAfter: Math.round(window.scrollY), rectTopAfter: Math.round(target.getBoundingClientRect().top), at: Math.round(performance.now()) };
    });
    if (opts && opts.hash) {
      try {
        if (window.location.hash !== '#' + id && window.history.pushState) {
          window.history.pushState(null, '', '#' + id);
        }
      } catch (err) { /* podgląd w iframie bez dostępu do historii */ }
    }
    return true;
  }
  function scrollToSection(id, opts) {
    if (!document.getElementById(id)) return false;
    var options = { hash: !opts || opts.hash !== false };
    if (window.__RADOSC_DIAGNOSTICS__) window.__RADOSC_DIAGNOSTICS__.lastAnchorRequest = { id: id, contentReady: contentReady, at: Math.round(performance.now()) };
    if (!contentReady) { pendingAnchor = { id: id, opts: options }; return true; }
    return navigateToSection(id, options);
  }
  document.addEventListener('app:content-ready', function () {
    contentReady = true;
    if (window.__RADOSC_DIAGNOSTICS__) window.__RADOSC_DIAGNOSTICS__.contentReady = true;
    if (pendingAnchor) {
      navigateToSection(pendingAnchor.id, pendingAnchor.opts);
      pendingAnchor = null;
    } else if (window.location.hash.length > 1 && document.getElementById(window.location.hash.slice(1))) {
      /* wejście z hashem albo natywny skok sprzed inicjalizacji:
         dokładnie jedno wyrównanie do finalnego układu */
      navigateToSection(window.location.hash.slice(1), { hash: false });
    }
  }, { once: true });
  window.RADOSC_SCROLL = scrollToSection;

  /* pasek skrótów Bistro — gaszenie gradientu po dojechaniu do końca */
  var jumpbar = document.querySelector('.jumpbar');
  var jumptrack = document.querySelector('.jumpbar-track');
  /* wszystkie kotwice tej samej strony (jumpbar, hero, treść) przewijają
     deterministycznie; linki panelu Menu mają własny handler */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    var link = e.target.closest ? e.target.closest('a[href*="#"]') : null;
    if (!link) return;
    var hash = link.hash || '';
    if (hash.length < 2) return;
    var samePage = link.pathname === window.location.pathname && link.hostname === window.location.hostname;
    if (!samePage) return;
    if (scrollToSection(hash.slice(1))) e.preventDefault();
  });

  if (jumpbar && jumptrack) {
    var updateJumpHint = function () {
      var atEnd = jumptrack.scrollLeft + jumptrack.clientWidth >= jumptrack.scrollWidth - 4;
      jumpbar.classList.toggle('at-end', atEnd);
    };
    jumptrack.addEventListener('scroll', updateJumpHint, { passive: true });
    window.addEventListener('resize', updateJumpHint, { passive: true });
    updateJumpHint();
  }

  /* dolny panel Menu: obsługa w js/critical-navigation.js */

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

  /* diagnostyka: pełna nawigacja podpięta */
  if (window.__RADOSC_DIAGNOSTICS__) {
    window.__RADOSC_DIAGNOSTICS__.navigationInitialized = true;
    window.__RADOSC_DIAGNOSTICS__.initializedAt = performance.now();
  }
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

  /* menu weekendowe (strona Bistro); id kategorii = kotwica dla paska skrótów */
  function slug(s) {
    var MAP = { 'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z' };
    return String(s).toLowerCase().replace(/[ąćęłńóśźż]/g, function (c) { return MAP[c]; })
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  var wkBox = document.getElementById('weekend-menu');
  if (wkBox && window.RADOSC_WEEKEND) {
    var W = window.RADOSC_WEEKEND;
    var h = '';
    W.categories.forEach(function (cat) {
      h += '<h3 class="wk-cat" id="wk-' + slug(cat.title) + '">' + esc(cat.title) + '</h3>' + itemsHtml(cat.items);
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
  var inquiryCards = document.querySelectorAll('[data-inquiry]');
  function activateInquiry(card) {
    var val = card.getAttribute('data-inquiry');
    inquiryCards.forEach(function (c) { c.classList.toggle('is-active', c === card); });
    if (typeField) {
      typeField.value = val;
      typeField.classList.remove('field-error');
      typeField.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (intro) {
      intro.textContent = INTRO_TEXTS[val] || DEFAULT_INTRO;
      intro.hidden = false;
    }
    /* ta sama funkcja przewijania co kotwice (bez zmiany hasha);
       fokus dopiero po przewinięciu i korekcie, z preventScroll */
    if (window.RADOSC_SCROLL && window.RADOSC_SCROLL('zapytanie', { hash: false })) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var zh = document.querySelector('#zapytanie h2');
          if (zh) {
            if (!zh.hasAttribute('tabindex')) zh.setAttribute('tabindex', '-1');
            zh.focus({ preventScroll: true });
          }
        });
      });
      return true;
    }
    return false;
  }
  inquiryCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (activateInquiry(card)) e.preventDefault();
    });
    /* karty są linkami — Enter działa natywnie, Space obsługujemy sami */
    card.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        activateInquiry(card);
      }
    });
  });
})();

/* treści menu wyrenderowane — nawigacja kotwic może celować w finalny układ */
document.dispatchEvent(new CustomEvent('app:content-ready'));
