(function () {
  'use strict';

  var grid = document.getElementById('plate-grid');
  if (!grid) return;
  var plates = Array.prototype.slice.call(grid.querySelectorAll('.pc'));
  var emptyNote = document.getElementById('plates-empty');
  var countNote = document.getElementById('ix-count');
  var filters = { cat: '*', era: '*' };

  /* ---------- filtrowanie ---------- */
  function matches(pc) {
    return (filters.cat === '*' || pc.getAttribute('data-cat') === filters.cat) &&
           (filters.era === '*' || pc.getAttribute('data-era') === filters.era);
  }

  function kartaForm(n) {
    if (n === 1) return 'karta';
    var d = n % 10, h = n % 100;
    return (d >= 2 && d <= 4 && (h < 12 || h > 14)) ? 'karty' : 'kart';
  }

  function apply() {
    var shown = 0;
    plates.forEach(function (pc) {
      var ok = matches(pc);
      pc.hidden = !ok;
      if (ok) shown++;
    });
    emptyNote.hidden = shown > 0;
    countNote.textContent = shown === plates.length
      ? plates.length + ' ' + kartaForm(plates.length)
      : shown + ' z ' + plates.length + ' ' + kartaForm(plates.length);
  }

  ['cat', 'era'].forEach(function (attr) {
    document.querySelectorAll('.ix[data-' + attr + ']').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters[attr] = btn.getAttribute('data-' + attr);
        document.querySelectorAll('.ix[data-' + attr + ']').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        apply();
      });
    });
  });
  apply();

  /* ---------- odwracanie karty w siatce ---------- */
  function setFlip(pc, toBack) {
    pc.setAttribute('data-flip', toBack ? 'back' : 'front');
    var btn = pc.querySelector('.pc-flip');
    if (btn) {
      btn.setAttribute('aria-pressed', toBack ? 'true' : 'false');
      var txt = btn.querySelector('.pc-flip-txt');
      if (txt) txt.textContent = toBack ? 'Awers' : 'Odwrocie';
    }
    var front = pc.querySelector('.pc-face-front');
    var back = pc.querySelector('.pc-face-back');
    if (front) front.tabIndex = toBack ? -1 : 0;
    if (back) back.tabIndex = toBack ? 0 : -1;
  }

  plates.forEach(function (pc) {
    var btn = pc.querySelector('.pc-flip');
    if (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        setFlip(pc, pc.getAttribute('data-flip') !== 'back');
      });
    }
  });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lb-img');
  var lbSide = document.getElementById('lb-side');
  var lbFlip = document.getElementById('lb-flip');
  var lbFlipTxt = document.getElementById('lb-flip-txt');
  var current = null, onBack = false, lastFocus = null;

  function shown() { return plates.filter(matches); }

  function textOf(pc, sel) {
    var el = pc.querySelector(sel);
    return el ? el.textContent : '';
  }

  function draw() {
    var hasBack = current.hasAttribute('data-back');
    if (!hasBack) onBack = false;
    var title = textOf(current, '.pc-title');
    lbImg.src = current.getAttribute(onBack ? 'data-back' : 'data-front');
    lbImg.alt = (onBack ? 'Odwrocie karty: ' : '') + title;
    lbFlip.hidden = !hasBack;
    lbFlipTxt.textContent = onBack ? 'Awers' : 'Odwrocie';

    lbSide.innerHTML = '';
    function add(tag, cls, text) {
      var el = document.createElement(tag);
      el.className = cls;
      el.textContent = text;
      lbSide.appendChild(el);
      return el;
    }
    var meta = current.querySelector('.pc-meta');
    var metaEl = add('p', 'lb-meta', '');
    if (meta) metaEl.innerHTML = meta.innerHTML;
    add('h2', 'lb-title', title);
    add('p', 'lb-body', textOf(current, '.pc-body'));
    add('p', 'lb-sig', textOf(current, '.pc-sig'));

    if (hasBack) {
      var pre = new Image();
      pre.src = current.getAttribute(onBack ? 'data-front' : 'data-back');
    }
  }

  function open(pc, side) {
    current = pc;
    onBack = side === 'back' && pc.hasAttribute('data-back');
    lastFocus = document.activeElement;
    draw();
    lb.hidden = false;
    document.body.classList.add('lb-open');
    lb.querySelector('.lb-x').focus();
  }

  function close() {
    lb.hidden = true;
    lbImg.src = '';
    document.body.classList.remove('lb-open');
    if (lastFocus) lastFocus.focus();
  }

  function step(delta) {
    var list = shown();
    if (!list.length || !current) return;
    var i = list.indexOf(current);
    current = list[((i === -1 ? 0 : i) + delta + list.length) % list.length];
    onBack = false;
    draw();
  }

  plates.forEach(function (pc) {
    pc.querySelectorAll('[data-open]').forEach(function (face) {
      face.addEventListener('click', function () {
        open(pc, face.getAttribute('data-open'));
      });
    });
  });

  lb.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });
  lbFlip.addEventListener('click', function () {
    onBack = !onBack;
    draw();
    if (current) setFlip(current, onBack);
  });
  document.getElementById('lb-prev').addEventListener('click', function () { step(-1); });
  document.getElementById('lb-next').addEventListener('click', function () { step(1); });

  document.addEventListener('keydown', function (ev) {
    if (lb.hidden) return;
    if (ev.key === 'Escape') close();
    else if (ev.key === 'ArrowLeft') step(-1);
    else if (ev.key === 'ArrowRight') step(1);
    else if (ev.key === 'f' || ev.key === 'F') lbFlip.click();
  });
})();
