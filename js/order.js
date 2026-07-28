/* ============================================================
   ETAP 9 — zamawianie pizzy i burgerów online (demo)
   Koszyk przy kartach menu + sekcja „Zamów online”.
   Wysyłką i walidacją pól osobowych zajmuje się js/main.js
   (formularz .demo-form z data-form-type="zamowienie");
   ten moduł prowadzi koszyk, godziny odbioru i pole adresu.
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

  var OPEN_MIN = 11 * 60;        /* zamówienia online: codziennie 11:00–21:00 */
  var CLOSE_MIN = 21 * 60;
  var LEAD_MIN = 40;             /* minimalne wyprzedzenie na wybraną godzinę */

  var listBox = document.getElementById('order-list');
  var hiddenItems = form.querySelector('input[name="order"]');
  var timeField = form.querySelector('select[name="otime"]');
  var deliveryField = form.querySelector('select[name="delivery"]');
  var addressLabel = document.getElementById('order-address');
  var addressField = form.querySelector('input[name="address"]');
  var submitBtn = form.querySelector('button[type="submit"]');
  var emptyNote = document.getElementById('order-empty');
  var fab = document.getElementById('cart-fab');

  /* ---- koszyk (przetrwa nawigację między podstronami w tej karcie) ---- */
  var cart = [];
  try { cart = JSON.parse(sessionStorage.getItem('zp-order') || '[]') || []; } catch (e) { cart = []; }

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
    else { cart.push({ name: name, price: price, cat: cat, qty: 1 }); }
    saveCart();
    renderCart();
  }
  function changeQty(name, delta) {
    var it = cart.filter(function (x) { return x.name === name; })[0];
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) cart = cart.filter(function (x) { return x !== it; });
    saveCart();
    renderCart();
  }

  function renderCart() {
    var has = cart.length > 0;
    if (emptyNote) emptyNote.hidden = has;
    if (submitBtn) submitBtn.disabled = !has;
    if (hiddenItems) hiddenItems.value = has ? JSON.stringify(cart.map(function (it) {
      return { nazwa: it.name, cena: it.price, ilosc: it.qty };
    })) : '';
    if (listBox) {
      var h = '';
      cart.forEach(function (it) {
        h += '<div class="order-row" data-name="' + esc(it.name) + '">' +
          '<span class="o-name">' + esc(it.name) + '</span>' +
          '<span class="o-qty">' +
            '<button type="button" class="o-less" aria-label="' + esc(t('orderLess', 'Zmniejsz ilość')) + ' — ' + esc(it.name) + '">−</button>' +
            '<b>' + it.qty + '</b>' +
            '<button type="button" class="o-more" aria-label="' + esc(t('orderMore', 'Zwiększ ilość')) + ' — ' + esc(it.name) + '">+</button>' +
          '</span>' +
          '<span class="o-price">' + (it.price * it.qty) + ' zł</span>' +
          '</div>';
      });
      if (has) {
        h += '<div class="order-row order-sum"><span class="o-name">' + esc(t('orderTotal', 'Razem')) + '</span><span></span><span class="o-price">' + cartTotal() + ' zł</span></div>';
      }
      listBox.innerHTML = h;
    }
    if (fab) {
      fab.hidden = !has;
      if (has) fab.innerHTML = '🛒 <b>' + cartCount() + '</b> · ' + cartTotal() + ' zł';
    }
  }

  if (listBox) {
    listBox.addEventListener('click', function (e) {
      var row = e.target.closest('.order-row');
      if (!row) return;
      if (e.target.closest('.o-more')) changeQty(row.getAttribute('data-name'), 1);
      else if (e.target.closest('.o-less')) changeQty(row.getAttribute('data-name'), -1);
    });
  }
  if (fab) {
    fab.addEventListener('click', function () {
      var sec = document.getElementById('zamowienie');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
