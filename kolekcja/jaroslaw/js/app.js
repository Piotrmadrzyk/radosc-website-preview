(function () {
  'use strict';

  var grid = document.getElementById('plate-grid');
  if (!grid) return;
  var plates = Array.prototype.slice.call(grid.querySelectorAll('.pc'));
  var emptyNote = document.getElementById('plates-empty');
  var countNote = document.getElementById('ix-count');
  var resetBtn = document.getElementById('ix-reset');
  var filters = { cat: '*', era: '*' };

  function attr(pc, name) { return pc.getAttribute(name); }

  function matches(pc, f) {
    f = f || filters;
    return (f.cat === '*' || attr(pc, 'data-cat') === f.cat) &&
           (f.era === '*' || attr(pc, 'data-era') === f.era);
  }

  /* liczebnik: 1 karta / 2–4 karty / 5 kart */
  function kartaForm(n) {
    if (n === 1) return 'karta';
    var d = n % 10, h = n % 100;
    return (d >= 2 && d <= 4 && (h < 12 || h > 14)) ? 'karty' : 'kart';
  }

  /* ---------- filtrowanie ---------- */
  function countFor(attrName, value) {
    var probe = { cat: filters.cat, era: filters.era };
    probe[attrName === 'data-cat' ? 'cat' : 'era'] = value;
    var n = 0;
    for (var i = 0; i < plates.length; i++) if (matches(plates[i], probe)) n++;
    return n;
  }

  function refreshIndex() {
    ['cat', 'era'].forEach(function (key) {
      var attrName = 'data-' + key;
      document.querySelectorAll('.ix[' + attrName + ']').forEach(function (btn) {
        var n = countFor(attrName, btn.getAttribute(attrName));
        var sup = btn.querySelector('sup');
        if (sup) sup.textContent = n;
        var dead = n === 0 && !btn.classList.contains('is-on');
        btn.disabled = dead;
        btn.setAttribute('aria-disabled', dead ? 'true' : 'false');
      });
    });
    resetBtn.hidden = filters.cat === '*' && filters.era === '*';
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
    refreshIndex();
  }

  function setFilter(key, value) {
    filters[key] = value;
    document.querySelectorAll('.ix[data-' + key + ']').forEach(function (b) {
      var on = b.getAttribute('data-' + key) === value;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    apply();
  }

  ['cat', 'era'].forEach(function (key) {
    document.querySelectorAll('.ix[data-' + key + ']').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setFilter(key, btn.getAttribute('data-' + key));
      });
    });
  });
  resetBtn.addEventListener('click', function () {
    setFilter('cat', '*');
    setFilter('era', '*');
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

  /* ---------- powiększenie ---------- */
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lb-img');
  var lbSide = document.getElementById('lb-side');
  var lbFlip = document.getElementById('lb-flip');
  var lbFlipTxt = document.getElementById('lb-flip-txt');
  var current = null, onBack = false, lastFocus = null;

  function visible() { return plates.filter(function (p) { return matches(p); }); }

  function textOf(pc, sel) {
    var el = pc.querySelector(sel);
    return el ? el.textContent : '';
  }

  /* Karta jednostronna (PT:2:51 — fotografia bez rewersu) nie ma atrybutu
     data-back. Wszystko, co dotyka odwrocia, musi to przetrwać: podmiana
     obrazu, przycisk odwracania w powiększeniu, wstępne wczytanie drugiej
     strony i skrót klawiszowy F. */
  function hasBack(pc) { return !!attr(pc, 'data-back'); }

  function draw() {
    var title = textOf(current, '.pc-title');
    var twoSided = hasBack(current);
    if (!twoSided) onBack = false;
    lbImg.src = attr(current, onBack ? 'data-back' : 'data-front');
    lbImg.alt = (onBack ? 'Odwrocie karty: ' : '') + title;
    lbFlip.hidden = !twoSided;
    lbFlipTxt.textContent = onBack ? 'Awers' : 'Odwrocie';

    var list = visible();
    var pos = list.indexOf(current) + 1;

    lbSide.innerHTML = '';
    function add(tag, cls, text) {
      var el = document.createElement(tag);
      el.className = cls;
      el.textContent = text;
      lbSide.appendChild(el);
      return el;
    }
    if (pos > 0) add('p', 'lb-pos', pos + ' / ' + list.length);
    var meta = current.querySelector('.pc-meta');
    var metaEl = add('p', 'lb-meta', '');
    if (meta) metaEl.innerHTML = meta.innerHTML;
    add('h2', 'lb-title', title);
    add('p', 'lb-body', textOf(current, '.pc-body'));
    add('p', 'lb-sig', textOf(current, '.pc-sig'));
    add('p', 'lb-keys', twoSided ? '\u2190 \u2192 karta \u00b7 F odwrocie \u00b7 Esc zamknij'
                                 : '\u2190 \u2192 karta \u00b7 Esc zamknij');

    var other = attr(current, onBack ? 'data-front' : 'data-back');
    if (other) {
      var pre = new Image();
      pre.src = other;
    }
  }

  function open(pc, side) {
    current = pc;
    onBack = side === 'back';
    lastFocus = document.activeElement;
    draw();
    lb.hidden = false;
    document.body.classList.add('lb-open');
    lb.querySelector('.lb-x').focus();
    if (history.replaceState) history.replaceState(null, '', '#' + attr(pc, 'data-id'));
  }

  function close() {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.classList.remove('lb-open');
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus) lastFocus.focus();
  }

  function step(delta) {
    var list = visible();
    if (!list.length || !current) return;
    var i = list.indexOf(current);
    current = list[((i === -1 ? 0 : i) + delta + list.length) % list.length];
    onBack = false;
    draw();
    if (history.replaceState) history.replaceState(null, '', '#' + attr(current, 'data-id'));
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
    if (!current || !hasBack(current)) return;
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
    else if ((ev.key === 'f' || ev.key === 'F') && !lbFlip.hidden) lbFlip.click();
  });

  /* ---------- wejście z adresu #pt-2-9 ---------- */
  var hash = (location.hash || '').replace('#', '');
  if (hash) {
    var target = plates.filter(function (p) { return attr(p, 'data-id') === hash; })[0];
    if (target) open(target, 'front');
  }
})();
