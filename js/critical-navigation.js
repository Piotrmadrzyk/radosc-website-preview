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

  /* JEDYNY właściciel stanu hamburgera. Cały stan ustawiany SYNCHRONICZNIE
     w jednym miejscu — bez requestAnimationFrame (w tle bywa dławiony do zera)
     i bez tranzycji przy otwieraniu: po pierwszym kliknięciu menu ma od razu
     computed opacity 1 (stan otwarty steruje CSS .mobile-menu.open). */
  function setMobileNavigationState(isOpen) {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;
    state.menu = isOpen;
    menu.classList.toggle('open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Zamknij menu' : 'Otwórz menu');
    menu.removeAttribute('hidden');
  }
  function openMobileNavigation() { setMobileNavigationState(true); }
  function closeMobileNavigation() { setMobileNavigationState(false); }
  function toggleMobileNavigation() { setMobileNavigationState(!state.menu); }
  function setMenu(open) { setMobileNavigationState(open); }

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
    var burgerEl = document.getElementById('burger');
    if (burgerEl && (e.target.closest('#burger') || burgerEl.contains(e.target))) {
      var before = state.menu;
      toggleMobileNavigation();
      var menuEl = document.getElementById('mobile-menu');
      if (window.__RADOSC_DIAGNOSTICS__) {
        window.__RADOSC_DIAGNOSTICS__.lastHamburgerEvent = {
          deliveredAt: Math.round(performance.now()),
          target: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
          beforeOpen: before,
          afterOpen: state.menu,
          ariaExpanded: burgerEl.getAttribute('aria-expanded'),
          finalOpacity: menuEl ? getComputedStyle(menuEl).opacity : null
        };
      }
      return;
    }
    if (e.target.closest('.menu-sheet-btn')) { setSheet(!state.sheet); return; }
    if (e.target.closest('#menu-sheet-close')) { e.preventDefault(); setSheet(false); return; }
    if (e.target.closest('#menu-sheet-backdrop')) {
      /* klik w tło nie może przejść do strony pod spodem */
      e.preventDefault();
      e.stopPropagation();
      setSheet(false);
      return;
    }
    var menuHit = e.target.closest('#mobile-menu');
    if (menuHit) {
      if (state.menu && !document.getElementById('burger').contains(e.target)) closeMobileNavigation();
      return;
    }
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
