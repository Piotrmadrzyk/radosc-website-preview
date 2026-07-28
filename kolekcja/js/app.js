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

  document.querySelectorAll('.flip-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var card = btn.closest('.card');
      if (!card) return;
      var toBack = card.getAttribute('data-flip') !== 'back';
      card.setAttribute('data-flip', toBack ? 'back' : 'front');
      btn.setAttribute('aria-label', toBack ? 'Pokaż przód karty' : 'Pokaż odwrocie karty');
    });
  });

  /* ---------- lightbox: pełny, nieucięty podgląd zdjęcia ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lastTrigger = null;

  function currentPhotoInFrame(frame) {
    var card = frame.closest('.card');
    var back = card && card.getAttribute('data-flip') === 'back';
    var selector = back ? '.card-photo-back' : '.card-photo-front';
    return frame.querySelector(selector) || frame.querySelector('.card-photo');
  }

  function openLightbox(frame) {
    var img = currentPhotoInFrame(frame);
    if (!img) return;
    lastTrigger = frame;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }
})();
