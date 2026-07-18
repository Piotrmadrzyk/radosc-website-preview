/* RADOŚĆ — krytyczna nawigacja: hamburger + dolny panel Menu (ETAP 5.6.3).
   Ładowany SYNCHRONICZNIE w <head> (plik jest mały). Handlery są delegowane
   na document, więc pierwszy rzeczywisty klik działa nawet wtedy, gdy
   main.js i dane menu wciąż się pobierają. main.js NIE dubluje tej logiki. */

window.__RADOSC_DIAGNOSTICS__ = {
  navigationInitialized: false,
  initializedAt: null,
  contentReady: false,
  lastAnchorRequest: null,
  lastScrollAttempt: null,
  lastScrollResult: null
};

(function () {
  'use strict';

  var state = { menu: false, sheet: false };
  var sheetLastFocus = null;
  var sheetHideTimer = null;
  var INERT_SEL = 'main, header.site-header, footer.site-footer, nav.jumpbar, nav.mobile-menu';

  function reduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setMenu(open) {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;
    state.menu = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('open'); });
    } else {
      menu.classList.remove('open');
      window.setTimeout(function () { menu.hidden = true; }, reduced() ? 0 : 300);
    }
  }

  function setSheet(open) {
    var sheet = document.getElementById('menu-sheet');
    var backdrop = document.getElementById('menu-sheet-backdrop');
    var btn = document.querySelector('.menu-sheet-btn');
    if (!sheet || !backdrop || !btn || state.sheet === open) return;
    state.sheet = open;
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    var inertEls = document.querySelectorAll(INERT_SEL);
    for (var i = 0; i < inertEls.length; i++) {
      if (open) { inertEls[i].setAttribute('inert', ''); inertEls[i].setAttribute('aria-hidden', 'true'); }
      else { inertEls[i].removeAttribute('inert'); inertEls[i].removeAttribute('aria-hidden'); }
    }
    if (open) {
      if (sheetHideTimer) { window.clearTimeout(sheetHideTimer); sheetHideTimer = null; }
      sheetLastFocus = document.activeElement;
      /* zawartość i geometria panelu są statyczne (fade, bez przesuwania) —
         najpierw pokazujemy, potem tylko animujemy przezroczystość */
      sheet.hidden = false;
      backdrop.hidden = false;
      requestAnimationFrame(function () {
        sheet.classList.add('open');
        backdrop.classList.add('open');
      });
      var first = sheet.querySelector('.sheet-list a');
      (first || document.getElementById('menu-sheet-close')).focus();
    } else {
      sheet.classList.remove('open');
      backdrop.classList.remove('open');
      var finishClose = function () {
        sheetHideTimer = null;
        sheet.hidden = true;
        backdrop.hidden = true;
        if (sheetLastFocus && sheetLastFocus.focus) sheetLastFocus.focus();
      };
      if (reduced()) finishClose();
      else sheetHideTimer = window.setTimeout(finishClose, 220);
    }
  }

  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest('#burger')) { setMenu(!state.menu); return; }
    if (e.target.closest('.menu-sheet-btn')) { setSheet(!state.sheet); return; }
    if (e.target.closest('#menu-sheet-close')) { e.preventDefault(); setSheet(false); return; }
    if (e.target.closest('#menu-sheet-backdrop')) {
      /* klik w tło nie może przejść do strony pod spodem */
      e.preventDefault();
      e.stopPropagation();
      setSheet(false);
      return;
    }
    if (e.target.closest('#mobile-menu a')) { setMenu(false); return; }
    if (e.target.closest('#menu-sheet a')) { setSheet(false); return; }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (state.sheet) { setSheet(false); return; }
      if (state.menu) {
        setMenu(false);
        var b = document.getElementById('burger');
        if (b) b.focus();
      }
      return;
    }
    if (e.key === 'Tab' && state.sheet) {
      var sheet = document.getElementById('menu-sheet');
      if (!sheet) return;
      var f = sheet.querySelectorAll('.sheet-list a, .sheet-close');
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!sheet.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });

  window.__RADOSC_NAV__ = { setMenu: setMenu, setSheet: setSheet, state: state };
})();
