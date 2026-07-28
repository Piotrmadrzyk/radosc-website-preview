/* ZIELONA PERGOLA — interakcje (wspólne dla wszystkich podstron) */
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

  /* formularze — walidacja wspólna dla trybu demo i produkcyjnego.
     ETAP 5.9: przygotowanie pod przyszłą wysyłkę. Podłączenie usługi
     (np. Formspree) wymaga wyłącznie ustawienia atrybutu action="..."
     na <form> i usunięcia <p class="form-note"> — bez zmian w JS:
     gdy action jest ustawione, po pozytywnej walidacji submit
     przechodzi natywnie do usługi; bez action działa tryb demo.
     ETAP 6.1: każde błędne pole dostaje aria-invalid="true" oraz
     widoczny, konkretny komunikat powiązany przez aria-describedby;
     błąd znika dopiero, gdy wartość jest naprawdę poprawna. */
  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  var errSeq = 0;
  function fieldValid(field) {
    var ok = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
    if (ok && field.type === 'email') ok = EMAIL_RE.test(field.value.trim());
    return ok;
  }
  function fieldErrorMessage(field) {
    if (field.type === 'checkbox') return 'Zaznacz zgodę na kontakt.';
    if (field.type === 'email') {
      return field.value.trim() === '' ? 'Podaj adres e-mail.' : 'Podaj poprawny adres e-mail.';
    }
    if (field.type === 'tel') return 'Podaj numer telefonu.';
    if (field.name === 'name') return 'Podaj imię i nazwisko.';
    if (field.tagName === 'TEXTAREA') return 'Napisz krótką wiadomość.';
    if (field.tagName === 'SELECT') return 'Wybierz typ zapytania.';
    return 'Uzupełnij to pole.';
  }
  function setFieldError(field, message) {
    field.classList.add('field-error');
    field.setAttribute('aria-invalid', 'true');
    var msg = field.__radoscErr;
    if (!msg) {
      msg = document.createElement('span');
      msg.className = 'field-msg';
      msg.id = 'field-msg-' + (++errSeq);
      field.__radoscErr = msg;
      (field.closest('label') || field.parentNode).appendChild(msg);
    }
    msg.textContent = message;
    msg.hidden = false;
    field.setAttribute('aria-describedby', msg.id);
  }
  function clearFieldError(field) {
    if (!field || !field.classList) return;
    field.classList.remove('field-error');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    if (field.__radoscErr) { field.__radoscErr.hidden = true; field.__radoscErr.textContent = ''; }
  }
  function revalidateField(field) {
    /* korekta na żywo dopiero po pierwszej nieudanej wysyłce danego pola */
    if (!field || !field.classList || !field.hasAttribute || !field.hasAttribute('required')) return;
    if (!field.classList.contains('field-error')) return;
    if (fieldValid(field)) clearFieldError(field);
    else setFieldError(field, fieldErrorMessage(field));
  }
  document.querySelectorAll('.demo-form').forEach(function (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      var invalid = [];
      form.querySelectorAll('[required]').forEach(function (field) {
        if (fieldValid(field)) {
          clearFieldError(field);
        } else {
          setFieldError(field, fieldErrorMessage(field));
          invalid.push(field);
        }
      });
      if (invalid.length) {
        e.preventDefault();
        status.classList.add('is-error');
        status.textContent = 'Uzupełnij poprawnie zaznaczone pola, aby wysłać zapytanie.';
        invalid[0].focus();
        return;
      }
      if (form.dataset.endpoint) {
        /* produkcja: wysyłka JSON do webhooka (n8n) bez opuszczania strony */
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var fd = new FormData(form);
        var temat = fd.get('topic') ||
          [fd.get('event'), fd.get('date'), fd.get('guests') ? fd.get('guests') + ' gości' : '', fd.get('place')]
            .filter(Boolean).join(' · ');
        var payload = {
          typ: form.dataset.formType || 'kontakt',
          imie: fd.get('name') || '',
          email: fd.get('email') || '',
          telefon: fd.get('phone') || '',
          temat: temat || '',
          wiadomosc: fd.get('message') || '',
          strona: location.pathname.split('/').pop() || 'index.html'
        };
        status.classList.remove('is-error');
        status.textContent = 'Wysyłanie…';
        if (btn) btn.disabled = true;
        fetch(form.dataset.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          status.textContent = 'Dziękujemy! Zapytanie dotarło do nas — odpowiemy najszybciej, jak to możliwe.';
          form.reset();
          form.querySelectorAll('.field-error').forEach(clearFieldError);
        }).catch(function () {
          status.classList.add('is-error');
          status.textContent = 'Nie udało się wysłać formularza. Spróbuj ponownie albo zadzwoń: 795 870 359.';
        }).finally(function () { if (btn) btn.disabled = false; });
        return;
      }
      if (form.getAttribute('action')) { status.classList.remove('is-error'); return; } // produkcja: natywna wysyłka do usługi
      e.preventDefault();
      status.classList.remove('is-error');
      status.textContent =
        'Dziękujemy! Wysyłka formularza zostanie podłączona przed startem strony — ' +
        'do tego czasu prosimy o kontakt telefoniczny lub e-mail.';
      form.reset();
      form.querySelectorAll('.field-error').forEach(clearFieldError);
    });
    form.addEventListener('input', function (e) { revalidateField(e.target); });
    form.addEventListener('change', function (e) { revalidateField(e.target); });
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
    text: 'Pełną kartę pizzy przygotowujemy do publikacji. Zadzwoń — powiemy, co dziś pieczemy: <a class="tel-link" href="tel:+48795870359">795 870 359</a>.'
  });
  renderMenu(window.RADOSC_BURGERY, 'burger-menu', {
    title: 'Menu burgerów potwierdzisz telefonicznie.',
    text: 'Kartę burgerów przygotowujemy do publikacji. Zamówienia i pytania: <a class="tel-link" href="tel:+48795870359">795 870 359</a>.'
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
    inquiryCards.forEach(function (c) {
      var on = c === card;
      c.classList.toggle('is-active', on);
      /* stan wciśnięcia tylko dla kart oferty (mają aria-pressed w HTML) */
      if (c.hasAttribute('aria-pressed')) c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
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
       fokus dopiero po przewinięciu i korekcie, z preventScroll.
       ETAP 6.1: fokus na polu „Typ zapytania" — użytkownik od razu
       widzi, że formularz ustawił się zgodnie z klikniętą kartą. */
    if (window.RADOSC_SCROLL && window.RADOSC_SCROLL('zapytanie', { hash: false })) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var focusTarget = typeField || document.querySelector('#zapytanie h2');
          if (focusTarget) {
            if (focusTarget.tagName === 'H2' && !focusTarget.hasAttribute('tabindex')) {
              focusTarget.setAttribute('tabindex', '-1');
            }
            focusTarget.focus({ preventScroll: true });
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

  /* ===== ETAP 7: suwaki przed/po (sekcja „Za kulisami") ===== */
  document.querySelectorAll('[data-ba]').forEach(function (fig) {
    var range = fig.querySelector('.ba-range');
    if (!range) return;
    range.addEventListener('input', function () {
      fig.style.setProperty('--pos', range.value + '%');
    });
  });

  /* ===== ETAP 7: linia pory dnia w hero (rytm dnia Pergoli) =====
     Godziny: pn–pt śniadania 8–11, lunch/bemary 11–17, karta 15–21;
     pizza i burgery codziennie 11–21; sob. karta 11–22, ndz. 11–20. */
  var daypart = document.getElementById('daypart');
  if (daypart) {
    var now = new Date();
    var h = now.getHours();
    var dow = now.getDay(); /* 0 = niedziela, 6 = sobota */
    var txt = '';
    if (dow >= 1 && dow <= 5) {
      if (h < 8) txt = 'Otwieramy o 8:00 — na początek śniadanie i kawa.';
      else if (h < 11) txt = 'Pora śniadań (do 11:00) — kawa do śniadania gratis.';
      else if (h < 15) txt = 'Trwa lunch — bemary i menu dnia do 17:00.';
      else if (h < 17) txt = 'Lunch jeszcze do 17:00, karta restauracyjna już działa.';
      else if (h < 21) txt = 'Wieczór w Pergoli — karta restauracyjna i pizza z pieca do 21:00.';
      else txt = 'Dziś już zamknięte — zapraszamy jutro. Pizza i burgery codziennie 11:00–21:00.';
    } else if (dow === 6) {
      if (h < 11) txt = 'Otwieramy o 11:00 — weekendowa karta bez lunchy, do 22:00.';
      else if (h < 22) txt = 'Weekend w Pergoli — pełna karta do 22:00, pizza i burgery do 21:00.';
      else txt = 'Dziś już zamknięte — w niedzielę zapraszamy od 11:00.';
    } else {
      if (h < 11) txt = 'Otwieramy o 11:00 — weekendowa karta bez lunchy, do 20:00.';
      else if (h < 20) txt = 'Niedziela w Pergoli — pełna karta do 20:00.';
      else txt = 'Dziś już zamknięte — w tygodniu zapraszamy od 8:00.';
    }
    daypart.innerHTML = '<b>Dziś:</b> ' + txt;
  }

  /* ===== ETAP 7: żywe tło hero (cinemagraph) =====
     Wideo dogrywamy dopiero po pełnym załadowaniu strony, wyłącznie na
     desktopie, bez prefers-reduced-motion i bez trybu oszczędzania danych.
     Do czasu odtworzenia widoczna jest statyczna .scene — zero skoku. */
  var heroVideo = document.querySelector('.scene-video');
  if (heroVideo) {
    var wideOk = window.matchMedia('(min-width: 861px)').matches;
    var motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var conn = navigator.connection || {};
    if (wideOk && motionOk && !conn.saveData) {
      var startHeroVideo = function () {
        heroVideo.src = heroVideo.getAttribute('data-src');
        heroVideo.addEventListener('playing', function () {
          var hero = heroVideo.closest('.hero');
          if (hero) hero.classList.add('has-video');
        }, { once: true });
        var p = heroVideo.play();
        if (p && p.catch) p.catch(function () { /* autoplay zablokowany — zostaje statyczny kadr */ });
      };
      if (document.readyState === 'complete') startHeroVideo();
      else window.addEventListener('load', startHeroVideo, { once: true });
    }
  }
})();

/* treści menu wyrenderowane — nawigacja kotwic może celować w finalny układ */
document.dispatchEvent(new CustomEvent('app:content-ready'));
