/* RADOŚĆ — podgląd strony głównej · interakcje */
(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* nagłówek: tło po przewinięciu poza górę hero */
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

  /* formularz demonstracyjny — bez wysyłki */
  var form = document.getElementById('demo-form');
  var status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent =
        'Dziękujemy! To wersja demonstracyjna podglądu — wiadomości nie są jeszcze wysyłane.';
    });
  }
})();
