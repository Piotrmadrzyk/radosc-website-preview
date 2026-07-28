/* ============================================================
   ETAP 9 / 9.4 — zamawianie pizzy i burgerów online (demo)
   Koszyk stale widoczny w nagłówku (ikona + licznik), edycja
   w wysuwanym panelu — wzorzec znany z każdego sklepu online,
   zamiast koszyka ukrytego dopiero przy formularzu zamówienia.
   Wysyłką i walidacją pól osobowych zajmuje się js/main.js
   (formularz .demo-form z data-form-type="zamowienie");
   ten moduł prowadzi koszyk, panel koszyka, godziny odbioru
   i pole adresu.
   ============================================================ */
(function () {
  'use strict';
  var form = document.querySelector('form[data-form-type="zamowienie"]');
  if (!form) return;

  var LANG = document.documentElement.lang === 'en' ? 'en' : 'pl';
  var CFG = window.ZP_CONFIG || {};
  var T = (CFG.t && CFG.t[LANG]) || {};
  function t(key, fallback) { return T[key] || fallback; }
  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function plural(n, one, few, many) {
    if (n === 1) return one;
    var mod10 = n % 10, mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
  }

  var OPEN_MIN = 11 * 60;        /* zamówienia online: codziennie 11:00–21:00 */
  var CLOSE_MIN = 21 * 60;
  var LEAD_MIN = 40;             /* minimalne wyprzedzenie na wybraną godzinę */

  var hiddenItems = form.querySelector('input[name="order"]');
  var timeField = form.querySelector('select[name="otime"]');
  var deliveryField = form.querySelector('select[name="delivery"]');
  var addressLabel = document.getElementById('order-address');
  var addressField = form.querySelector('input[name="address"]');
  var submitBtn = form.querySelector('button[type="submit"]');
  var cartSummary = document.getElementById('cart-summary');

  /* ---- koszyk w nagłówku: zawsze widoczna ikona + panel wysuwany ---- */
  var cartTrigger = document.getElementById('cart-trigger');
  var cartBadge = document.getElementById('cart-badge');
  var drawer = document.getElementById('cart-drawer');
  var drawerBody = document.getElementById('cart-drawer-body');
  var drawerBackdrop = document.getElementById('cart-drawer-backdrop');
  var drawerClose = document.getElementById('cart-drawer-close');
  var drawerCta = document.getElementById('cart-drawer-cta');

  function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    requestAnimationFrame(function () { drawer.classList.add('is-open'); });
    document.body.classList.add('cart-drawer-lock');
    if (cartTrigger) cartTrigger.setAttribute('aria-expanded', 'true');
    var closeBtn = drawerClose;
    if (closeBtn) closeBtn.focus();
  }
  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('is-open');
    document.body.classList.remove('cart-drawer-lock');
    if (cartTrigger) { cartTrigger.setAttribute('aria-expanded', 'false'); cartTrigger.focus(); }
    setTimeout(function () { drawer.hidden = true; }, 260);
  }
  if (cartTrigger) cartTrigger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer();
  });
  if (drawerCta) {
    drawerCta.addEventListener('click', function () {
      closeDrawer();
      var sec = document.getElementById('zamowienie');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () {
        var nameField = form.querySelector('input[name="name"]');
        if (nameField) nameField.focus({ preventScroll: true });
      }, 420);
    });
  }

  /* ---- koszyk (przetrwa nawigację między podstronami w tej karcie) ---- */
  var cart = [];
  try { cart = JSON.parse(sessionStorage.getItem('zp-order') || '[]') || []; } catch (e) { cart = []; }
  cart.forEach(function (it) { if (typeof it.note !== 'string') it.note = ''; });
  var seenDrawer = false;
  try { seenDrawer = sessionStorage.getItem('zp-order-seen') === '1'; } catch (e) {}

  function saveCart() {
    try { sessionStorage.setItem('zp-order', JSON.stringify(cart)); } catch (e) { /* tryb prywatny */ }
  }
  function cartTotal() {
    return cart.reduce(function (s, it) { return s + it.price * it.qty; }, 0);
  }
  function cartCount() {
    return cart.reduce(function (s, it) { return s + it.qty; }, 0);
  }
  function addItem(name, price, cat) {
    var found = cart.filter(function (it) { return it.name === name; })[0];
    if (found) { found.qty = Math.min(20, found.qty + 1); }
    else { cart.push({ name: name, price: price, cat: cat, qty: 1, note: '' }); }
    saveCart();
    renderCart({ bump: true });
    /* P: pierwsze dodanie w tej wizycie — pokaż panel koszyka raz, żeby
       gość od razu skojarzył przycisk z koszykiem w nagłówku */
    if (!seenDrawer) {
      seenDrawer = true;
      try { sessionStorage.setItem('zp-order-seen', '1'); } catch (e) {}
      openDrawer();
    }
  }
  function changeQty(name, delta) {
    var it = cart.filter(function (x) { return x.name === name; })[0];
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) cart = cart.filter(function (x) { return x !== it; });
    saveCart();
    renderCart();
  }

  function rowsHtml() {
    var h = '';
    cart.forEach(function (it) {
      h += '<div class="order-row" data-name="' + esc(it.name) + '">' +
        '<div class="o-row-main">' +
        '<span class="o-name">' + esc(it.name) + '</span>' +
        '<span class="o-qty">' +
          '<button type="button" class="o-less" aria-label="' + esc(t('orderLess', 'Zmniejsz ilość')) + ' — ' + esc(it.name) + '">−</button>' +
          '<b>' + it.qty + '</b>' +
          '<button type="button" class="o-more" aria-label="' + esc(t('orderMore', 'Zwiększ ilość')) + ' — ' + esc(it.name) + '">+</button>' +
        '</span>' +
        '<span class="o-price">' + (it.price * it.qty) + ' zł</span>' +
        '</div>' +
        '<input type="text" class="o-note" data-name="' + esc(it.name) + '" maxlength="140" ' +
          'placeholder="' + esc(t('orderNotePlaceholder', 'Uwaga do pozycji — np. mniej ostra, bez cebuli…')) + '" ' +
          'aria-label="' + esc(t('orderNoteAria', 'Uwaga do pozycji')) + ': ' + esc(it.name) + '" ' +
          'value="' + esc(it.note || '') + '">' +
        '</div>';
    });
    if (cart.length) {
      h += '<div class="order-row order-sum"><span class="o-name">' + esc(t('orderTotal', 'Razem')) + '</span><span></span><span class="o-price">' + cartTotal() + ' zł</span></div>';
    }
    return h;
  }

  function renderCart(opts) {
    var has = cart.length > 0;
    var count = cartCount();
    if (submitBtn) submitBtn.disabled = !has;
    if (hiddenItems) hiddenItems.value = has ? JSON.stringify(cart.map(function (it) {
      return { nazwa: it.name, cena: it.price, ilosc: it.qty, uwaga: it.note || '' };
    })) : '';

    /* ikona koszyka w nagłówku — widoczna od pierwszego wejścia na stronę,
       żeby zamawianie było widoczne zanim ktokolwiek cokolwiek doda */
    if (cartTrigger) {
      cartTrigger.hidden = false;
      cartTrigger.setAttribute('aria-label', has
        ? t('cartAriaFilled', 'Koszyk zamówienia') + ': ' + count + ' · ' + cartTotal() + ' zł'
        : t('cartAriaEmpty', 'Koszyk zamówienia (pusty)'));
    }
    if (cartBadge) {
      cartBadge.hidden = !has;
      cartBadge.textContent = String(count);
      if (opts && opts.bump) {
        cartBadge.classList.remove('bump'); void cartBadge.offsetWidth; cartBadge.classList.add('bump');
      }
    }

    if (drawerBody) drawerBody.innerHTML = has ? rowsHtml() :
      '<p class="cart-empty">' + esc(t('orderEmpty', 'Koszyk jest pusty — dodaj coś z karty poniżej.')) + '</p>';
    if (drawerCta) drawerCta.disabled = !has;

    if (cartSummary) {
      cartSummary.innerHTML = has
        ? '<p class="cart-summary-line"><b>' + count + '</b> ' +
          esc(plural(count, t('orderItemOne', 'pozycja'), t('orderItemFew', 'pozycje'), t('orderItemMany', 'pozycji'))) +
          ' &middot; <b>' + cartTotal() + ' zł</b></p>' +
          '<button type="button" class="cart-edit-link" id="cart-edit-link">' + esc(t('orderEdit', 'Edytuj koszyk')) + '</button>'
        : '<p class="cart-summary-line cart-summary-empty">' + esc(t('orderEmpty', 'Koszyk jest pusty — dodaj coś z karty powyżej.')) + '</p>';
      var editLink = document.getElementById('cart-edit-link');
      if (editLink) editLink.addEventListener('click', openDrawer);
    }
  }

  if (drawerBody) {
    drawerBody.addEventListener('click', function (e) {
      var row = e.target.closest('.order-row');
      if (!row) return;
      if (e.target.closest('.o-more')) changeQty(row.getAttribute('data-name'), 1);
      else if (e.target.closest('.o-less')) changeQty(row.getAttribute('data-name'), -1);
    });
    /* uwaga do pozycji — zapisujemy na bieżąco, bez przerenderowania listy
       (inaczej pole straciłoby fokus przy każdym wpisywanym znaku) */
    drawerBody.addEventListener('input', function (e) {
      var input = e.target.closest('.o-note');
      if (!input) return;
      var it = cart.filter(function (x) { return x.name === input.getAttribute('data-name'); })[0];
      if (!it) return;
      it.note = input.value;
      saveCart();
      if (hiddenItems) hiddenItems.value = JSON.stringify(cart.map(function (x) {
        return { nazwa: x.name, cena: x.price, ilosc: x.qty, uwaga: x.note || '' };
      }));
    });
  }

  /* ---- przyciski „Do zamówienia” przy pozycjach kart ---- */
  function decorate(boxId, cat) {
    var box = document.getElementById(boxId);
    if (!box) return;
    box.querySelectorAll('.menu-item').forEach(function (item) {
      var nameEl = item.querySelector('.name');
      var priceEl = item.querySelector('.price');
      if (!nameEl || !priceEl) return;
      var price = parseInt(String(priceEl.textContent).trim(), 10);
      if (!Number.isFinite(price)) return; /* ceny wariantowe („27 / 31”) — tylko telefonicznie */
      var name = nameEl.childNodes[0] ? String(nameEl.childNodes[0].textContent).trim() : nameEl.textContent.trim();
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'order-add';
      btn.textContent = '+ ' + t('orderAdd', 'Do zamówienia');
      btn.setAttribute('aria-label', t('orderAdd', 'Do zamówienia') + ': ' + name + ', ' + price + ' zł');
      btn.addEventListener('click', function () {
        addItem(name, price, cat);
        btn.textContent = '✓ ' + t('orderAdded', 'Dodano');
        btn.classList.add('added');
        setTimeout(function () {
          btn.textContent = '+ ' + t('orderAdd', 'Do zamówienia');
          btn.classList.remove('added');
        }, 1200);
      });
      item.appendChild(btn);
    });
  }
  decorate('pizza-menu', 'pizza');
  decorate('burger-menu', 'burger');
  decorate('antipasti-menu', 'antipasti');
  decorate('makarony-menu', 'makaron');

  /* ---- godziny odbioru: dziś 11:00–21:00, min. 40 min wyprzedzenia ---- */
  function rebuildTimes() {
    if (!timeField) return;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var note = document.getElementById('order-hours-note');
    timeField.innerHTML = '';
    var ph = document.createElement('option');
    ph.value = '';
    ph.textContent = t('orderPickTime', '— wybierz godzinę —');
    timeField.appendChild(ph);
    if (nowMin + LEAD_MIN > CLOSE_MIN) { /* po godzinach — dziś już nic nie upieczemy */
      timeField.disabled = true;
      if (submitBtn) submitBtn.disabled = true;
      if (note) { note.textContent = t('orderClosed', 'Zamówienia online przyjmujemy w godzinach 11:00–21:00.'); note.hidden = false; }
      form.classList.add('order-closed');
      return;
    }
    if (nowMin >= OPEN_MIN && nowMin + LEAD_MIN <= CLOSE_MIN) {
      var asap = document.createElement('option');
      asap.value = 'asap';
      asap.textContent = t('orderAsap', 'jak najszybciej (ok. 30–40 min)');
      timeField.appendChild(asap);
    }
    var from = Math.max(OPEN_MIN, Math.ceil((nowMin + LEAD_MIN) / 30) * 30);
    for (var m = from; m <= CLOSE_MIN; m += 30) {
      var o = document.createElement('option');
      o.value = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
      o.textContent = o.value;
      timeField.appendChild(o);
    }
    if (note) {
      if (nowMin < OPEN_MIN) { note.textContent = t('orderPreorder', 'Przyjmujemy już zamówienia na dziś od godz. 11:00.'); note.hidden = false; }
      else note.hidden = true;
    }
  }
  rebuildTimes();

  /* ---- dostawa: adres wymagany tylko przy dostawie ---- */
  function syncAddress() {
    if (!deliveryField || !addressLabel || !addressField) return;
    var dostawa = deliveryField.value === 'dostawa';
    addressLabel.hidden = !dostawa;
    if (dostawa) addressField.setAttribute('required', '');
    else { addressField.removeAttribute('required'); addressField.value = ''; }
  }
  if (deliveryField) deliveryField.addEventListener('change', syncAddress);
  syncAddress();

  /* ---- po udanej wysyłce: czysty koszyk i świeże godziny ---- */
  document.addEventListener('zp:form-success', function (e) {
    if (e.detail.form !== form) return;
    cart = [];
    saveCart();
    renderCart();
    rebuildTimes();
    syncAddress();
    /* main.js w finally odblokowuje przycisk wysyłki — pusty koszyk musi wygrać */
    setTimeout(renderCart, 80);
  });

  renderCart();
})();
