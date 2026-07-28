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
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'pl';
  var CFG = window.ZP_CONFIG || { rezerwacje: { minLeadMin: 60, lastBeforeCloseMin: 60, maxMonths: 12, maxGuests: 12, slotMin: 30, from: '11:00' }, godziny: { 0: { open: '11:00', close: '20:00' }, 1: { open: '08:00', close: '21:00' }, 2: { open: '08:00', close: '21:00' }, 3: { open: '08:00', close: '21:00' }, 4: { open: '08:00', close: '21:00' }, 5: { open: '08:00', close: '21:00' }, 6: { open: '11:00', close: '22:00' } }, t: {} };
  var T = (CFG.t && CFG.t[LANG]) || {};
  function t(key, fallback) { return T[key] || fallback; }

  function phoneDigits(v) { return String(v).replace(/[\s\-().]/g, '').replace(/^\+/, ''); }
  function phoneValid(v) {
    var d = phoneDigits(v);
    return /^\d{9,15}$/.test(d);
  }
  function guestsParse(v) {
    var s = String(v).trim();
    if (!/^\d+$/.test(s)) return NaN;
    return parseInt(s, 10);
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function maxDateStr() {
    var d = new Date();
    d.setMonth(d.getMonth() + (CFG.rezerwacje.maxMonths || 12));
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function fieldValid(field) {
    var v = field.value.trim();
    if (field.type === 'checkbox') return field.checked;
    if (v === '') return false;
    if (field.type === 'email') return EMAIL_RE.test(v);
    if (field.type === 'tel') return phoneValid(v);
    if (field.name === 'guests') {
      var g = guestsParse(v);
      return Number.isFinite(g) && g >= 1 && g <= (CFG.rezerwacje.maxGuests || 12);
    }
    if (field.name === 'rdate') return v >= todayStr() && v <= maxDateStr();
    return true;
  }
  function fieldErrorMessage(field) {
    var v = field.value.trim();
    if (field.type === 'checkbox') return t('consent', 'Zaznacz zgodę na kontakt.');
    if (field.type === 'email') return v === '' ? t('reqEmail', 'Podaj adres e-mail.') : t('badEmail', 'Podaj poprawny adres e-mail.');
    if (field.type === 'tel') return v === '' ? t('reqPhone', 'Podaj numer telefonu.') : t('badPhone', 'Podaj prawidłowy numer telefonu zawierający od 9 do 15 cyfr.');
    if (field.name === 'guests') {
      if (v === '') return t('reqGuests', 'Podaj liczbę osób.');
      var g = guestsParse(v);
      if (!Number.isFinite(g) || g < 1) return t('badGuests', 'Podaj liczbę osób od 1 wzwyż (bez ułamków).');
      return t('bigGroup', 'Grupy powyżej 12 osób prosimy o kontakt telefoniczny: 795 870 359.');
    }
    if (field.name === 'rdate') {
      if (v === '') return t('reqDate', 'Wybierz datę rezerwacji.');
      if (v < todayStr()) return t('badDatePast', 'Wybierz przyszłą datę.');
      return t('badDateFar', 'Rezerwacji można dokonać maksymalnie z 12-miesięcznym wyprzedzeniem.');
    }
    if (field.name === 'name') return t('reqName', 'Podaj imię i nazwisko.');
    if (field.tagName === 'TEXTAREA') return t('reqMsg', 'Napisz krótką wiadomość.');
    if (field.tagName === 'SELECT') {
      if (field.name === 'rtime') return t('reqTime', 'Wybierz godzinę rezerwacji.');
      if (field.name === 'otime') return t('reqTimeOrder', 'Wybierz godzinę zamówienia.');
      return t('reqSelect', 'Wybierz typ zapytania.');
    }
    return t('fillField', 'Uzupełnij to pole.');
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
  /* helpery współdzielone z blokiem rezerwacji (osobna domknięta funkcja niżej) */
  window.__ZP_SHARED = { t: t, CFG: CFG, todayStr: todayStr, maxDateStr: maxDateStr, guestsParse: guestsParse, revalidateField: revalidateField };

  function focusFirstInvalid(field) {
    /* P17: przewiń tak, aby pole i komunikat były widoczne pod sticky headerem */
    var headerH = header ? header.getBoundingClientRect().height : 0;
    var top = field.getBoundingClientRect().top + window.scrollY - headerH - 90;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    setTimeout(function () { field.focus({ preventScroll: true }); }, 250);
  }

  document.querySelectorAll('.demo-form').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var submitting = false;
    form.addEventListener('submit', function (e) {
      if (submitting) { e.preventDefault(); return; } /* P19: blokada podwójnego wysłania */
      status.textContent = t('checking', 'Sprawdzanie formularza…');
      status.classList.remove('is-error');
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
        status.textContent = t('fixForm', 'Uzupełnij poprawnie zaznaczone pola, aby wysłać zapytanie.');
        focusFirstInvalid(invalid[0]);
        return;
      }
      if (form.dataset.endpoint) {
        /* produkcja: wysyłka JSON do webhooka (n8n) bez opuszczania strony */
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var fd = new FormData(form);
        var payload;
        if (form.dataset.formType === 'rezerwacja') {
          payload = {
            imie: fd.get('name') || '',
            telefon: fd.get('phone') || '',
            email: fd.get('email') || '',
            data: fd.get('rdate') || '',
            godzina: fd.get('rtime') || '',
            osoby: fd.get('guests') || '',
            stolik: fd.get('table') || '',
            uwagi: fd.get('message') || '',
            strona: location.pathname.split('/').pop() || 'index.html',
            lang: document.documentElement.lang || 'pl'
          };
        } else if (form.dataset.formType === 'zamowienie') {
          payload = {
            imie: fd.get('name') || '',
            telefon: fd.get('phone') || '',
            email: fd.get('email') || '',
            odbior: fd.get('delivery') || 'odbior',
            adres: fd.get('address') || '',
            godzina: fd.get('otime') || '',
            pozycje: fd.get('order') || '',
            uwagi: fd.get('message') || '',
            strona: location.pathname.split('/').pop() || 'index.html',
            lang: document.documentElement.lang || 'pl'
          };
        } else {
          var temat = fd.get('topic') ||
            [fd.get('event'), fd.get('date'), fd.get('guests') ? fd.get('guests') + ' gości' : '', fd.get('place')]
              .filter(Boolean).join(' · ');
          payload = {
            typ: form.dataset.formType || 'kontakt',
            imie: fd.get('name') || '',
            email: fd.get('email') || '',
            telefon: fd.get('phone') || '',
            temat: temat || '',
            wiadomosc: fd.get('message') || '',
            strona: location.pathname.split('/').pop() || 'index.html',
            lang: document.documentElement.lang || 'pl'
          };
        }
        status.classList.remove('is-error');
        status.textContent = t('sending', 'Wysyłanie…');
        submitting = true;
        if (btn) btn.disabled = true;
        fetch(form.dataset.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json().catch(function () { return {}; });
        }).then(function (d) {
          if (d && d.ok === false) {
            status.classList.add('is-error');
            status.textContent = d.message || t('fixForm', 'Sprawdź dane i spróbuj ponownie.');
            return;
          }
          status.textContent = form.dataset.formType === 'rezerwacja'
            ? t('okReservation', 'Rezerwacja demonstracyjna przyjęta.')
            : form.dataset.formType === 'newsletter'
              ? t('okNewsletter', 'Dziękujemy! Zapis demonstracyjny przyjęty.')
              : form.dataset.formType === 'zamowienie'
                ? ((d && d.message) || t('okOrder', 'Zamówienie demonstracyjne przyjęte.'))
                : t('okContact', 'Dziękujemy! Zgłoszenie demonstracyjne dotarło.');
          form.reset();
          form.querySelectorAll('.field-error').forEach(clearFieldError);
          /* P4/P11: pełny reset stanów pomocniczych po udanej demonstracji */
          document.dispatchEvent(new CustomEvent('zp:form-success', { detail: { form: form } }));
        }).catch(function () {
          status.classList.add('is-error');
          status.textContent = t('sendError', 'Nie udało się wysłać formularza. Spróbuj ponownie albo zadzwoń: 795 870 359.');
        }).finally(function () { submitting = false; if (btn) btn.disabled = false; });
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

  /* szybkie tematy (kontakt) — uzupełniają pole tematu w formularzu.
     P4-6: ponowne kliknięcie odznacza, ręczna edycja tematu czyści chip,
     po udanej wysyłce pełny reset. */
  var topicField = document.getElementById('topic');
  var chips = document.querySelectorAll('.chip[data-topic]');
  function clearChips() {
    chips.forEach(function (c) {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var wasActive = chip.classList.contains('active');
      clearChips();
      if (wasActive) {
        if (topicField) topicField.value = '';
        return; /* ponowne kliknięcie = odznaczenie */
      }
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      if (topicField) { topicField.value = chip.getAttribute('data-topic'); revalidateField(topicField); }
    });
  });
  if (topicField) {
    topicField.addEventListener('input', function () {
      /* ręczna zmiana tematu nie może zostawić mylącego zaznaczenia */
      var active = document.querySelector('.chip[data-topic].active');
      if (active && active.getAttribute('data-topic') !== topicField.value) clearChips();
    });
  }
  document.addEventListener('zp:form-success', function (e) {
    if (e.detail.form.dataset.formType !== 'rezerwacja') clearChips();
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

  /* pasek skrótów Restauracji — gaszenie gradientu po dojechaniu do końca */
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

  /* menu lunchowe (strona Restauracji) */
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

  /* menu weekendowe (strona Restauracji); id kategorii = kotwica dla paska skrótów */
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
    'Wesele lub uroczystość': 'Planujesz wesele lub większą uroczystość? Podaj termin, miejsce i orientacyjną liczbę gości. Wspólnie omówimy menu, zakres obsługi i charakter wydarzenia.',
    'Corporate catering': 'Planning a meeting, training day, conference or regular team lunches? Tell us a few details — we will prepare a no-obligation proposal tailored to the number of guests, venue and character of your event.',
    'Conference catering': 'Planning a meeting, training day, conference or regular team lunches? Tell us a few details — we will prepare a no-obligation proposal tailored to the number of guests, venue and character of your event.',
    'Business meeting': 'Planning a meeting, training day, conference or regular team lunches? Tell us a few details — we will prepare a no-obligation proposal tailored to the number of guests, venue and character of your event.',
    'Family celebration': 'Planning a First Communion, christening, birthday or another family gathering? Tell us about the date and number of guests — we will get in touch to prepare an individual proposal.',
    'First Communion or christening': 'Planning a First Communion, christening, birthday or another family gathering? Tell us about the date and number of guests — we will get in touch to prepare an individual proposal.',
    'Wedding or celebration': 'Planning a wedding or a larger celebration? Share the date, venue and approximate number of guests — together we will discuss the menu, scope of service and character of the event.',
  };
  var DEFAULT_INTRO = document.documentElement.lang === 'en'
    ? 'Tell us about your event — we will prepare a no-obligation proposal tailored to the date, venue and number of guests.'
    : 'Opowiedz nam o wydarzeniu — przygotujemy niezobowiązującą propozycję dopasowaną do terminu, miejsca i liczby gości.';
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
  if (daypart && document.documentElement.lang === 'en') {
    var nowEn = new Date(); var hEn = nowEn.getHours(); var dEn = nowEn.getDay();
    var t = '';
    if (dEn >= 1 && dEn <= 5) {
      if (hEn < 8) t = 'We open at 8:00 — start your day with breakfast and coffee.';
      else if (hEn < 11) t = 'Breakfast time (until 11:00) — coffee on the house with every breakfast.';
      else if (hEn < 15) t = 'Lunch is on — daily specials until 17:00.';
      else if (hEn < 17) t = 'Lunch until 17:00, the dinner menu is already open.';
      else if (hEn < 21) t = 'Evening at Pergola — dinner menu and wood-fired pizza until 21:00.';
      else t = 'Closed for today — pizza and burgers daily 11:00–21:00.';
    } else if (dEn === 6) {
      t = hEn < 11 ? 'We open at 11:00 — weekend menu until 22:00.' : hEn < 22 ? 'Weekend at Pergola — full menu until 22:00.' : 'Closed for today — Sundays from 11:00.';
    } else {
      t = hEn < 11 ? 'We open at 11:00 — weekend menu until 20:00.' : hEn < 20 ? 'Sunday at Pergola — full menu until 20:00.' : 'Closed for today — weekdays from 8:00.';
    }
    daypart.innerHTML = '<b>Today:</b> ' + t;
  } else if (daypart) {
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

  /* ===== ETAP 7.3: tryb wieczorny hero =====
     Po 18:00 (i przed 6:00) strona główna przechodzi w wieczorny nastrój:
     wieczorny kadr oranżerii + ciemna, ciepła zasłona. Do prezentacji
     można wymusić tryb parametrem ?pora=wieczor albo ?pora=dzien. */
  var heroEl = document.querySelector('.hero');
  var isEvening = false;
  if (heroEl) {
    var poraParam = new URLSearchParams(location.search).get('pora');
    var hNow = new Date().getHours();
    isEvening = poraParam === 'wieczor' || (poraParam !== 'dzien' && (hNow >= 18 || hNow < 6));
    if (isEvening) { heroEl.classList.add('is-evening'); document.body.classList.add('is-evening'); }
  }

  /* ===== ETAP 7.3/8: rezerwacja — godziny wg dnia, plan sali z pojemnością =====
     Jedno źródło godzin: ZP_CONFIG (patrz assets/data/site-config.js).
     Helpery walidacji pochodzą z pierwszego modułu (window.__ZP_SHARED). */
  var __ZPS = window.__ZP_SHARED || {};
  var t = __ZPS.t || function (k, f) { return f; };
  var CFG = __ZPS.CFG || { rezerwacje: {}, godziny: {} };
  var todayStr = __ZPS.todayStr || function () { return ''; };
  var maxDateStr = __ZPS.maxDateStr || function () { return ''; };
  var guestsParse = __ZPS.guestsParse || function (v) { return parseInt(v, 10); };
  var revalidateField = __ZPS.revalidateField || function () {};
  var floorPlan = document.querySelector('.floor-plan');
  var resForm = document.querySelector('form[data-form-type="rezerwacja"]');
  if (resForm) {
    var floorSel = document.querySelector('.floor-sel');
    var tableInput = document.querySelector('input[name="table"]');
    var floorClear = document.querySelector('.floor-clear');
    var floorWrap = document.querySelector('.floor-wrap');
    var dateField = resForm.querySelector('input[name="rdate"]');
    var timeField = resForm.querySelector('select[name="rtime"]');
    var guestsField = resForm.querySelector('input[name="guests"]');

    /* P15: zakres dat od dziś do +12 miesięcy */
    if (dateField) { dateField.min = todayStr(); dateField.max = maxDateStr(); }

    function hhmmToMin(s) { var p = s.split(':'); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
    function minToHhmm(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }

    /* P13/14/16: godziny budowane z konfiguracji, filtrowane dla „dzisiaj” */
    function rebuildTimes() {
      if (!timeField) return;
      var prev = timeField.value;
      var dateVal = dateField && dateField.value;
      timeField.innerHTML = '';
      var ph = document.createElement('option');
      ph.value = '';
      ph.textContent = t('pickTime', '— wybierz godzinę —');
      timeField.appendChild(ph);
      var dow = dateVal ? new Date(dateVal + 'T12:00:00').getDay() : null;
      var slots = [];
      var dows = dow === null ? [1, 2, 3, 4, 5, 6, 0] : [dow]; /* bez daty: część wspólna wszystkich dni */
      var from = Math.max.apply(null, dows.map(function (d) {
        return Math.max(hhmmToMin(CFG.rezerwacje.from || '11:00'), hhmmToMin(CFG.godziny[d].open));
      }));
      var to = Math.min.apply(null, dows.map(function (d) {
        return hhmmToMin(CFG.godziny[d].close) - (CFG.rezerwacje.lastBeforeCloseMin || 60);
      }));
      var isToday = dateVal === todayStr();
      var nowMin = new Date().getHours() * 60 + new Date().getMinutes() + (CFG.rezerwacje.minLeadMin || 60);
      for (var m = from; m <= to; m += (CFG.rezerwacje.slotMin || 30)) {
        if (isToday && m < nowMin) continue; /* P14: bez godzin z przeszłości */
        slots.push(minToHhmm(m));
      }
      slots.forEach(function (s) {
        var o = document.createElement('option');
        o.value = s; o.textContent = s;
        timeField.appendChild(o);
      });
      if (prev && slots.indexOf(prev) !== -1) timeField.value = prev;
      var note = timeField.__zpNote;
      if (!note) {
        note = document.createElement('span');
        note.className = 'field-msg';
        note.hidden = true;
        timeField.__zpNote = note;
        (timeField.closest('label') || timeField.parentNode).appendChild(note);
      }
      if (!slots.length && dateVal) {
        note.textContent = t('noTimesToday', 'Na dzisiaj nie ma już dostępnych godzin. Wybierz inny dzień.');
        note.hidden = false;
        timeField.disabled = true;
      } else {
        note.hidden = true;
        timeField.disabled = false;
      }
    }
    rebuildTimes();
    if (dateField) dateField.addEventListener('change', function () { rebuildTimes(); revalidateField(dateField); });

    /* ---- plan sali: pojemność, odznaczanie, reset (P9-12) ---- */
    function tableSeats(g) {
      var m = (g.getAttribute('data-table') || '').match(/\((\d+)/);
      return m ? parseInt(m[1], 10) : 99;
    }
    function clearTable(msg) {
      if (!floorPlan) return;
      floorPlan.querySelectorAll('.tbl.sel').forEach(function (x) { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
      if (tableInput) tableInput.value = '';
      if (floorSel) floorSel.textContent = msg || '';
      if (floorClear) floorClear.hidden = true;
    }
    function applyCapacity() {
      if (!floorPlan) return;
      var g = guestsField ? guestsParse(guestsField.value) : NaN;
      var group = Number.isFinite(g) && g > (CFG.rezerwacje.maxGuests || 12);
      if (floorWrap) floorWrap.classList.toggle('floor-group', group); /* P8: grupa > 12 = plan wyłączony */
      floorPlan.querySelectorAll('.tbl').forEach(function (tb) {
        var small = Number.isFinite(g) && g >= 1 && tableSeats(tb) < g;
        tb.classList.toggle('too-small', small);
        tb.setAttribute('aria-disabled', small || group ? 'true' : 'false');
      });
      var sel = floorPlan.querySelector('.tbl.sel');
      if (sel && ((Number.isFinite(g) && tableSeats(sel) < g) || group)) {
        clearTable(t('tableCleared', 'Wybrany stolik był za mały dla nowej liczby osób — wybierz inny.'));
      }
    }
    if (guestsField) guestsField.addEventListener('input', applyCapacity);

    if (floorPlan) {
      floorPlan.addEventListener('click', function (e) {
        var tb = e.target.closest('.tbl');
        if (!tb) return;
        if (floorWrap && floorWrap.classList.contains('floor-group')) return;
        var g = guestsField ? guestsParse(guestsField.value) : NaN;
        if (Number.isFinite(g) && g >= 1 && tableSeats(tb) < g) {
          if (floorSel) floorSel.textContent = t('tableTooSmall', 'Ten stolik ma za mało miejsc dla podanej liczby osób.');
          return; /* P9: nie pozwalamy wybrać za małego stolika */
        }
        if (tb.classList.contains('sel')) { clearTable(''); return; } /* P10: ponowne kliknięcie odznacza */
        floorPlan.querySelectorAll('.tbl.sel').forEach(function (x) { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
        tb.classList.add('sel');
        tb.setAttribute('aria-pressed', 'true');
        var label = tb.getAttribute('data-table');
        if (tableInput) tableInput.value = label;
        if (floorSel) floorSel.innerHTML = t('tableSelected', 'Wybrany stolik: ') + '<b>' + label + '</b>';
        if (floorClear) floorClear.hidden = false;
      });
      floorPlan.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.tbl')) {
          e.preventDefault();
          e.target.closest('.tbl').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      });
    }
    if (floorClear) floorClear.addEventListener('click', function () { clearTable(''); });

    /* P11: pełny reset po udanej demonstracji rezerwacji */
    document.addEventListener('zp:form-success', function (e) {
      if (e.detail.form !== resForm) return;
      clearTable('');
      if (floorPlan) floorPlan.querySelectorAll('.tbl.too-small').forEach(function (x) { x.classList.remove('too-small'); x.setAttribute('aria-disabled', 'false'); });
      if (floorWrap) floorWrap.classList.remove('floor-group');
      rebuildTimes();
    });
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
    if (wideOk && motionOk && !conn.saveData && !isEvening) { /* wieczorem statyczny wieczorny kadr */
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

/* PWA: rejestracja service workera (instalacja jak aplikacja) */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  var swPath = document.documentElement.lang === 'en' ? '../sw.js' : 'sw.js';
  navigator.serviceWorker.register(swPath, { scope: './' }).catch(function () {});
}

/* treści menu wyrenderowane — nawigacja kotwic może celować w finalny układ */
document.dispatchEvent(new CustomEvent('app:content-ready'));

/* ETAP 8 — audio-wizytówka: odtwarzacz .audio-card (play/pauza + pasek postępu) */
(function () {
  var cards = document.querySelectorAll('.audio-card[data-audio]');
  if (!cards.length) return;
  var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
  var current = null;
  cards.forEach(function (card) {
    var btn = card.querySelector('button');
    var bar = card.querySelector('.au-bar i');
    if (!btn) return;
    var audio = null;
    function setPlaying(on) {
      btn.innerHTML = on ? ICON_PAUSE : ICON_PLAY;
      var l = card.getAttribute(on ? 'data-label-pause' : 'data-label-play');
      if (l) btn.setAttribute('aria-label', l);
    }
    btn.addEventListener('click', function () {
      if (!audio) {
        audio = new Audio(card.getAttribute('data-audio'));
        audio.preload = 'auto';
        audio.addEventListener('timeupdate', function () {
          if (bar && audio.duration) bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
        });
        audio.addEventListener('ended', function () {
          setPlaying(false);
          if (bar) bar.style.width = '0';
        });
      }
      if (audio.paused) {
        if (current && current !== audio && !current.paused) current.pause();
        current = audio;
        var p = audio.play();
        if (p && p.catch) p.catch(function () { setPlaying(false); });
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    });
  });
})();

/* ETAP 9.1 — dynamiczny rok w stopce + akordeon FAQ */
(function () {
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  var faqSeq = 0;
  document.querySelectorAll('.faq-list').forEach(function (list) {
    list.classList.add('faq-acc');
    list.querySelectorAll('.faq-item').forEach(function (item, i) {
      var dt = item.querySelector('dt');
      var dd = item.querySelector('dd');
      if (!dt || !dd) return;
      var open = i === 0; /* pierwsze pytanie otwarte — reszta zwinięta */
      dd.id = dd.id || 'faq-a-' + (++faqSeq);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'faq-q';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-controls', dd.id);
      btn.innerHTML = '<span>' + dt.textContent + '</span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
      dt.textContent = '';
      dt.appendChild(btn);
      item.classList.toggle('faq-open', open);
      dd.hidden = !open;
      btn.addEventListener('click', function () {
        var willOpen = dd.hidden;
        dd.hidden = !willOpen;
        item.classList.toggle('faq-open', willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });
  });
})();
