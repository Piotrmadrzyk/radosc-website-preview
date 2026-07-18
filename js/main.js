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

  /* ===== Nawigacja kotwic — model deterministyczny (ETAP 5.6.2) =====
     Zanim ten plik się wykona, kotwice działają natywnie (zwykłe href).
     Po inicjalizacji: klik = preventDefault + JEDEN scrollTo liczony od
     realnej wysokości sticky headera + MAKSYMALNIE JEDNA korekta w rAF.
     Sekcje menu renderuje skrypt — koniec renderu emituje app:content-ready;
     tylko na ten jeden moment może czekać zapamiętany cel. Bez ResizeObserverów
     i wielosekundowych okien pilnujących scrolla. */
  var contentReady = false;
  var pendingAnchor = null;

  function headerOffset() {
    var h = header ? header.getBoundingClientRect().height : 0;
    return Math.max(h + 14, 84);
  }
  function anchorTop(target) {
    var top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
    return Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
  }
  function performScroll(id, opts) {
    var target = document.getElementById(id);
    if (!target) return false;
    var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var behavior = (opts.instant || noMotion) ? 'auto' : 'smooth';
    window.scrollTo({ top: anchorTop(target), behavior: behavior });
    var corrected = false;
    var correctOnce = function () {
      if (corrected) return;
      corrected = true;
      requestAnimationFrame(function () {
        if (Math.abs(window.scrollY - anchorTop(target)) > 4) {
          window.scrollTo({ top: anchorTop(target), behavior: 'auto' });
        }
      });
    };
    if (behavior === 'auto') correctOnce();
    else if ('onscrollend' in window) window.addEventListener('scrollend', correctOnce, { once: true });
    else window.setTimeout(correctOnce, 700);
    if (opts.hash) {
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
    var options = { hash: !opts || opts.hash !== false, instant: !!(opts && opts.instant) };
    if (!contentReady) { pendingAnchor = { id: id, opts: options }; return true; }
    return performScroll(id, options);
  }
  document.addEventListener('app:content-ready', function () {
    contentReady = true;
    if (pendingAnchor) {
      performScroll(pendingAnchor.id, pendingAnchor.opts);
      pendingAnchor = null;
    } else if (window.location.hash.length > 1 && document.getElementById(window.location.hash.slice(1))) {
      /* wejście z hashem albo natywny skok sprzed inicjalizacji:
         jedno bezzwłoczne wyrównanie do finalnego układu */
      performScroll(window.location.hash.slice(1), { hash: false, instant: true });
    }
  }, { once: true });
  window.RADOSC_SCROLL = scrollToSection;

  /* pasek skrótów Bistro — gaszenie gradientu po dojechaniu do końca */
  var jumpbar = document.querySelector('.jumpbar');
  var jumptrack = document.querySelector('.jumpbar-track');
  /* wszystkie kotwice tej samej strony (jumpbar, hero, treść) przewijają
     deterministycznie; linki panelu Menu mają własny handler */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link || link.closest('#menu-sheet')) return;
    var id = link.getAttribute('href').slice(1);
    if (id && scrollToSection(id)) e.preventDefault();
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

  /* globalny dolny panel Menu — bottom sheet (ETAP 5.6) */
  var sheet = document.getElementById('menu-sheet');
  var sheetBackdrop = document.getElementById('menu-sheet-backdrop');
  var sheetBtn = document.querySelector('.menu-sheet-btn');
  var sheetClose = document.getElementById('menu-sheet-close');
  if (sheet && sheetBackdrop && sheetBtn && sheetClose) {
    var sheetLastFocus = null;
    /* jawny stan zamiast czytania sheet.hidden — hidden zmienia się z opóźnieniem
       (timeout animacji), więc szybkie kliknięcia gubiły pierwszą interakcję */
    var sheetOpen = false;
    var sheetHideTimer = null;
    var INERT_SEL = 'main, header.site-header, footer.site-footer, nav.jumpbar, nav.mobile-menu';
    var setSheet = function (open) {
      if (open === sheetOpen) return;
      sheetOpen = open;
      sheetBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      document.querySelectorAll(INERT_SEL).forEach(function (el) {
        if (open) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
        else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
      });
      if (open) {
        if (sheetHideTimer) { window.clearTimeout(sheetHideTimer); sheetHideTimer = null; }
        sheetLastFocus = document.activeElement;
        sheet.hidden = false;
        sheetBackdrop.hidden = false;
        requestAnimationFrame(function () {
          sheet.classList.add('open');
          sheetBackdrop.classList.add('open');
        });
        var firstLink = sheet.querySelector('.sheet-list a');
        (firstLink || sheetClose).focus();
      } else {
        sheet.classList.remove('open');
        sheetBackdrop.classList.remove('open');
        var finishClose = function () {
          sheetHideTimer = null;
          sheet.hidden = true;
          sheetBackdrop.hidden = true;
          /* fokus wraca na przycisk otwierający dopiero po domknięciu stanu DOM */
          if (sheetLastFocus && sheetLastFocus.focus) sheetLastFocus.focus();
        };
        if (reduced) finishClose();
        else sheetHideTimer = window.setTimeout(finishClose, 300);
      }
    };
    /* jedna wspólna ścieżka zamknięcia dla X / Escape / backdropu / wyboru pozycji */
    var closeSheet = function (reason) { setSheet(false); };
    sheetBtn.addEventListener('click', function () { setSheet(!sheetOpen); });
    sheetClose.addEventListener('click', function () { closeSheet('close-button'); });
    sheetBackdrop.addEventListener('click', function (e) {
      /* klik w tło nie może przejść do elementów pod spodem */
      e.preventDefault();
      e.stopPropagation();
      closeSheet('backdrop');
    });
    document.addEventListener('keydown', function (e) {
      if (!sheetOpen) return;
      if (e.key === 'Escape') { closeSheet('escape'); return; }
      /* focus trap wewnątrz panelu */
      if (e.key === 'Tab') {
        var focusables = sheet.querySelectorAll('.sheet-list a, .sheet-close');
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!sheet.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    });
    sheet.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      var page = href.split('#')[0];
      var here = window.location.pathname.split('/').pop() || 'index.html';
      closeSheet('item');
      if (href.indexOf('#') > -1 && page === here) {
        e.preventDefault();
        scrollToSection(href.split('#')[1]);
      }
    });
  }

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

  /* kliknięcia w hamburger / przycisk Menu oddane zanim ten plik się wykonał
     (mikro-kolejka z <head>) — odtwórz teraz, gdy handlery są podpięte */
  if (window.__earlyNav && window.__earlyNav.drain) {
    window.__earlyNav.drain().forEach(function (el) {
      if (el && el.click) el.click();
    });
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
    /* bezpośrednie przewinięcie do formularza (bez zmiany hasha) + fokus
       na nagłówku sekcji — czytelne także dla czytników ekranu */
    if (window.RADOSC_SCROLL && window.RADOSC_SCROLL('zapytanie', { hash: false })) {
      var zh = document.querySelector('#zapytanie h2');
      if (zh) {
        if (!zh.hasAttribute('tabindex')) zh.setAttribute('tabindex', '-1');
        zh.focus({ preventScroll: true });
      }
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
