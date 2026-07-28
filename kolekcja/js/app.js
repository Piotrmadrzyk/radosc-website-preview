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
    btn.addEventListener('click', function () {
      var card = btn.closest('.card');
      if (!card) return;
      var toBack = card.getAttribute('data-flip') !== 'back';
      card.setAttribute('data-flip', toBack ? 'back' : 'front');
      btn.setAttribute('aria-label', toBack ? 'Pokaż przód karty' : 'Pokaż odwrocie karty');
    });
  });
})();
