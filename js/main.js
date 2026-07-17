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
        var ok = field.value.trim() !== '';
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
})();
