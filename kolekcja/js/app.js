(function () {
  'use strict';

  var tocToggle = document.getElementById('toc-toggle');
  var tocList = document.getElementById('toc-list');
  if (tocToggle && tocList) {
    tocToggle.addEventListener('click', function () {
      var open = tocList.classList.toggle('is-open');
      tocToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    tocList.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        tocList.classList.remove('is-open');
        tocToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('click', function (e) {
      if (!tocList.classList.contains('is-open')) return;
      if (e.target === tocToggle || tocToggle.contains(e.target)) return;
      if (tocList.contains(e.target)) return;
      tocList.classList.remove('is-open');
      tocToggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------- lightbox: pełny, nieucięty podgląd zdjęcia ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxFlip = document.getElementById('lightbox-flip');
  var lastTrigger = null;

  function currentPhotoInFrame(frame) {
    var card = frame.closest('.card');
    var back = card && card.getAttribute('data-flip') === 'back';
    var selector = back ? '.card-photo-back' : '.card-photo-front';
    return frame.querySelector(selector) || frame.querySelector('.card-photo');
  }

  function showCurrentPhotoInLightbox() {
    var img = currentPhotoInFrame(lastTrigger);
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    var card = lastTrigger.closest('.card');
    var onBack = card && card.getAttribute('data-flip') === 'back';
    lightboxFlip.textContent = onBack ? 'Pokaż przód' : 'Odwróć kartę';
  }

  function openLightbox(frame) {
    var img = currentPhotoInFrame(frame);
    if (!img) return;
    lastTrigger = frame;
    var card = frame.closest('.card');
    var hasBack = !!(card && card.querySelector('.flip-btn'));
    lightboxFlip.hidden = !hasBack;
    showCurrentPhotoInLightbox();
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    lightbox.querySelector('.lightbox-close').focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.classList.remove('lightbox-open');
    if (lastTrigger) lastTrigger.focus();
  }

  /* ---------- odwracanie karty (mała ikona na siatce + duży przycisk w lightboxie) ---------- */
  function setCardFlip(card, toBack) {
    card.setAttribute('data-flip', toBack ? 'back' : 'front');
    var smallBtn = card.querySelector('.flip-btn');
    if (smallBtn) smallBtn.setAttribute('aria-label', toBack ? 'Pokaż przód karty' : 'Pokaż odwrocie karty');
  }

  document.querySelectorAll('.flip-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var card = btn.closest('.card');
      if (!card) return;
      setCardFlip(card, card.getAttribute('data-flip') !== 'back');
      if (!lightbox.hidden && lastTrigger && lastTrigger.closest('.card') === card) {
        showCurrentPhotoInLightbox();
      }
    });
  });

  if (lightbox) {
    document.querySelectorAll('[data-lightbox-trigger]').forEach(function (frame) {
      frame.addEventListener('click', function (e) {
        if (e.target.closest('.flip-btn')) return;
        openLightbox(frame);
      });
      frame.addEventListener('keydown', function (e) {
        if (e.target.closest('.flip-btn')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(frame);
        }
      });
    });
    lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
      el.addEventListener('click', closeLightbox);
    });
    lightboxFlip.addEventListener('click', function () {
      if (!lastTrigger) return;
      var card = lastTrigger.closest('.card');
      if (!card) return;
      setCardFlip(card, card.getAttribute('data-flip') !== 'back');
      showCurrentPhotoInLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'f' || e.key === 'F') lightboxFlip.click();
    });
  }
})();
