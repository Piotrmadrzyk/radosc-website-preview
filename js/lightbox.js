/* ============================================================
   ETAP 5.8 — grupowy lightbox zdjęć Bistro
   Jedyny właściciel podglądu zdjęć. Zasady:
   - grupy per sekcja (data-lb="..."), bez mieszania sekcji,
   - swipe (touch) i drag (mysz) przez Pointer Events,
   - Esc / X / klik tła / swipe w dół zamykają,
   - fokus: trap w modalu, powrót do elementu otwierającego,
   - scroll strony zablokowany (body.lb-open),
   - prefers-reduced-motion respektowane w CSS,
   - zero zależności, zero globalnych konfliktów nazw.
   ============================================================ */
(function () {
  'use strict';
  if (window.__RADOSC_LIGHTBOX__) return; // ochrona przed podwójną inicjalizacją
  window.__RADOSC_LIGHTBOX__ = 1;

  var groups = {};   // nazwa -> [{full, alt, caption, el}]
  var state = { open: false, group: null, index: 0, opener: null };
  var overlay, stage, imgEl, capEl, cntEl, closeBtn;

  function collect() {
    var items = document.querySelectorAll('[data-lb]');
    for (var i = 0; i < items.length; i++) {
      var fig = items[i];
      var img = fig.querySelector('img');
      if (!img) continue;
      var name = fig.getAttribute('data-lb');
      if (!groups[name]) groups[name] = [];
      var capNode = fig.querySelector('figcaption');
      groups[name].push({
        el: fig,
        img: img,
        full: fig.getAttribute('data-lb-full') || null, // najlepsze źródło ustalamy przy otwarciu (currentSrc)
        alt: img.getAttribute('alt') || '',
        caption: capNode ? capNode.textContent.trim() : ''
      });
      fig.classList.add('lb-zoomable');
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', 'Powiększ zdjęcie: ' + (img.getAttribute('alt') || 'fotografia Bistro'));
      fig.setAttribute('aria-haspopup', 'dialog');
      // dyskretna ikonka lupki (desktop hover; aria-hidden — czysto wizualna)
      var ico = document.createElement('span');
      ico.className = 'lb-ico';
      ico.setAttribute('aria-hidden', 'true');
      ico.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8M11 8v6M8 11h6"/></svg>';
      fig.appendChild(ico);
      (function (n, idx) {
        fig.addEventListener('click', function (e) {
          if (e.defaultPrevented) return;
          e.preventDefault();
          open(n, idx, this);
        });
        fig.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            open(n, idx, this);
          }
        });
      })(name, groups[name].length - 1);
    }
  }

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Powiększone zdjęcie');
    overlay.setAttribute('hidden', '');
    overlay.innerHTML =
      '<button type="button" class="lb-close" aria-label="Zamknij podgląd zdjęcia">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
      '</button>' +
      '<figure class="lb-stage"><img alt=""><figcaption class="lb-bar"><span class="lb-cap"></span><span class="lb-count" aria-live="polite"></span></figcaption></figure>';
    document.body.appendChild(overlay);
    stage = overlay.querySelector('.lb-stage');
    imgEl = overlay.querySelector('img');
    capEl = overlay.querySelector('.lb-cap');
    cntEl = overlay.querySelector('.lb-count');
    closeBtn = overlay.querySelector('.lb-close');

    closeBtn.addEventListener('click', function (e) { e.preventDefault(); close(); });
    overlay.addEventListener('click', function (e) {
      // klik/tap w tło (nie w obraz i nie w X) zamyka
      if (e.target === overlay || e.target === stage) close();
    });
    document.addEventListener('keydown', onKey, true);

    // gesty: Pointer Events (mysz + dotyk)
    var px = 0, py = 0, dx = 0, dy = 0, tracking = false;
    stage.addEventListener('pointerdown', function (e) {
      if (!state.open) return;
      tracking = true; px = e.clientX; py = e.clientY; dx = 0; dy = 0;
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    });
    stage.addEventListener('pointermove', function (e) {
      if (!tracking) return;
      dx = e.clientX - px; dy = e.clientY - py;
      if (!overlay.classList.contains('lb-still')) {
        imgEl.style.transform = 'translate(' + dx * 0.35 + 'px,' + Math.max(0, dy) * 0.3 + 'px)';
      }
    });
    function endGesture() {
      if (!tracking) return;
      tracking = false;
      imgEl.style.transform = '';
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) step(1); else step(-1);
      } else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
        close();
      }
      dx = 0; dy = 0;
    }
    stage.addEventListener('pointerup', endGesture);
    stage.addEventListener('pointercancel', endGesture);
    // klik w sam obraz bez przesunięcia nie zamyka i nie nawiguje — ignorujemy
    imgEl.addEventListener('click', function (e) { e.stopPropagation(); });
    // natywny drag&drop obrazka przerywałby gest przeciągania (pointercancel)
    imgEl.setAttribute('draggable', 'false');
    imgEl.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  function bestSrc(item) {
    // preferuj to, co realnie wybrała przeglądarka (WebP z <source>)
    return item.full || item.img.currentSrc || item.img.src;
  }

  function render() {
    var list = groups[state.group];
    var item = list[state.index];
    imgEl.classList.add('lb-loading');
    imgEl.src = bestSrc(item);
    imgEl.alt = item.alt;
    imgEl.onload = function () { imgEl.classList.remove('lb-loading'); };
    capEl.textContent = item.caption || '';
    if (list.length > 1) {
      cntEl.textContent = (state.index + 1) + ' / ' + list.length;
      cntEl.removeAttribute('hidden');
    } else {
      cntEl.textContent = '';
      cntEl.setAttribute('hidden', '');
    }
    overlay.setAttribute('aria-label', 'Powiększone zdjęcie: ' + (item.caption || item.alt || 'fotografia Bistro'));
    // preload sąsiadów w grupie
    if (list.length > 1) {
      [state.index - 1, state.index + 1].forEach(function (i) {
        if (i >= 0 && i < list.length) { var pre = new Image(); pre.src = bestSrc(list[i]); }
      });
    }
  }

  function open(group, index, openerEl) {
    if (!groups[group] || !groups[group][index]) return;
    state.open = true; state.group = group; state.index = index; state.opener = openerEl || null;
    overlay.removeAttribute('hidden');
    // wymuś reflow, żeby przejście opacity zadziałało po zdjęciu [hidden]
    void overlay.offsetWidth;
    overlay.classList.add('open');
    document.body.classList.add('lb-open');
    render();
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!state.open) return;
    state.open = false;
    overlay.classList.remove('open');
    document.body.classList.remove('lb-open');
    window.setTimeout(function () {
      if (!state.open) overlay.setAttribute('hidden', '');
    }, 240);
    if (state.opener && document.contains(state.opener)) {
      state.opener.focus({ preventScroll: true });
    }
    state.opener = null;
  }

  function step(delta) {
    var list = groups[state.group];
    if (!list || list.length < 2) return; // pojedyncze zdjęcie: brak fałszywej nawigacji
    var next = state.index + delta;
    if (next < 0 || next >= list.length) return; // bez zapętlania — licznik trzyma orientację
    state.index = next;
    render();
  }

  function onKey(e) {
    if (!state.open) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); return; }
    if (e.key === 'Tab') {
      // jedyny fokusowalny element modala to X — pętla fokusu
      e.preventDefault();
      closeBtn.focus();
    }
  }

  function init() {
    collect();
    var total = 0, name;
    for (name in groups) total += groups[name].length;
    if (!total) return;
    build();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
