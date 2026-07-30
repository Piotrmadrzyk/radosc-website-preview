(function () {
  'use strict';

  /* ---------- filtrowanie: motyw × epoka ---------- */
  var grid = document.getElementById('catalog-grid');
  var allCards = Array.prototype.slice.call(grid.querySelectorAll('.mini-card'));
  var emptyNote = document.getElementById('catalog-empty');
  var countNote = document.getElementById('filter-count');
  var activeCat = '*';
  var activeEra = '*';

  function cardMatches(card) {
    var okCat = activeCat === '*' || card.getAttribute('data-cat') === activeCat;
    var okEra = activeEra === '*' || card.getAttribute('data-era') === activeEra;
    return okCat && okEra;
  }

  function plural(n) {
    if (n === 1) return 'karta';
    var d = n % 10, h = n % 100;
    if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'karty';
    return 'kart';
  }

  function applyFilters() {
    var visible = 0;
    allCards.forEach(function (card) {
      var show = cardMatches(card);
      card.hidden = !show;
      if (show) visible++;
    });
    emptyNote.hidden = visible !== 0;
    countNote.textContent = visible === allCards.length
      ? allCards.length + ' ' + plural(allCards.length)
      : visible + ' z ' + allCards.length + ' ' + plural(allCards.length);
  }

  function wireFilterButtons(attr, onPick) {
    document.querySelectorAll('.fbtn[data-' + attr + ']').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.fbtn[data-' + attr + ']').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        onPick(btn.getAttribute('data-' + attr));
        applyFilters();
      });
    });
  }

  wireFilterButtons('cat', function (v) { activeCat = v; });
  wireFilterButtons('era', function (v) { activeEra = v; });
  applyFilters();

  /* ---------- lightbox: duży skan + opis + odwrocie + nawigacja ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightbox-img');
  var lbInfo = document.getElementById('lightbox-info');
  var lbFlip = document.getElementById('lightbox-flip');
  var lbPrev = document.getElementById('lightbox-prev');
  var lbNext = document.getElementById('lightbox-next');
  var currentCard = null;
  var onBack = false;
  var lastFocus = null;

  function visibleCards() {
    return allCards.filter(cardMatches);
  }

  function titleOf(card) {
    var t = card.querySelector('.mini-title');
    return t ? t.textContent : '';
  }

  function render() {
    var hasBack = currentCard.hasAttribute('data-back');
    if (!hasBack) onBack = false;
    var src = currentCard.getAttribute(onBack ? 'data-back' : 'data-front');
    lbImg.src = src;
    lbImg.alt = (onBack ? 'Odwrocie: ' : '') + titleOf(currentCard);
    lbFlip.hidden = !hasBack;
    lbFlip.textContent = onBack ? 'Pokaż przód' : 'Odwróć kartę';
    var tpl = currentCard.querySelector('.card-info');
    lbInfo.innerHTML = '';
    if (tpl) lbInfo.appendChild(tpl.content.cloneNode(true));
    /* podgrzej drugą stronę karty */
    if (hasBack) {
      var pre = new Image();
      pre.src = currentCard.getAttribute(onBack ? 'data-front' : 'data-back');
    }
  }

  function openLightbox(card) {
    currentCard = card;
    onBack = false;
    lastFocus = document.activeElement;
    render();
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    lightbox.querySelector('.lightbox-close').focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.src = '';
    document.body.classList.remove('lightbox-open');
    if (lastFocus) lastFocus.focus();
  }

  function step(delta) {
    var list = visibleCards();
    if (!list.length || !currentCard) return;
    var i = list.indexOf(currentCard);
    if (i === -1) i = 0;
    currentCard = list[(i + delta + list.length) % list.length];
    onBack = false;
    render();
  }

  allCards.forEach(function (card) {
    var btn = card.querySelector('[data-open]');
    if (btn) btn.addEventListener('click', function () { openLightbox(card); });
  });

  lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
    el.addEventListener('click', closeLightbox);
  });
  lbFlip.addEventListener('click', function () { onBack = !onBack; render(); });
  lbPrev.addEventListener('click', function () { step(-1); });
  lbNext.addEventListener('click', function () { step(1); });

  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'f' || e.key === 'F') { onBack = !onBack; render(); }
  });
})();
