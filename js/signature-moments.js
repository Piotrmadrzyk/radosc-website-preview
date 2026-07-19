/* ============================================================
   ETAP 6.2 — Signature living images
   Jeden sygnaturowy „żywy kadr" na podstronę:
   - index:      data-signature="day-night"   (łuk hero: dzień ↔ wieczór)
   - bistro:     data-signature="coffee-steam" (para nad prawdziwą szklanką)
   - pizza:      data-signature="pizza-heat"   (gorące powietrze nad pizzą)
   - realizacje: data-signature="gala-light"   (migotanie realnych świateł)
   Zasady: wyłącznie transform/opacity/mask, zero bibliotek, zero canvas,
   dekoracje aria-hidden + pointer-events:none, wspólny IntersectionObserver
   pauzuje animacje poza viewportem, prefers-reduced-motion wyłącza całość.
   ============================================================ */
(function () {
  'use strict';
  if (window.__RADOSC_SIGNATURE__) return; // ochrona przed podwójną inicjalizacją
  window.__RADOSC_SIGNATURE__ = 1;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---------- wspólny observer: efekty grają tylko przy viewportcie ---------- */
  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          en.target.classList.toggle('sig-play', en.isIntersecting);
        });
      }, { rootMargin: '140px 0px' })
    : null;
  function watch(el) { if (io) io.observe(el); else el.classList.add('sig-play'); }

  /* ---------- geometria: punkt/prostokąt obrazu → piksele wrappera ----------
     Obsługuje object-fit:cover (z object-position) oraz obrazy bez cropu.   */
  function geom(fig, img) {
    var cw = fig.clientWidth, ch = fig.clientHeight;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (!cw || !ch || !iw || !ih) return null;
    var cs = getComputedStyle(img);
    if (cs.objectFit === 'cover') {
      var pos = (cs.objectPosition || '50% 50%').split(' ');
      var px = (parseFloat(pos[0]) || 50) / 100;
      var py = (parseFloat(pos[1]) || 50) / 100;
      var s = Math.max(cw / iw, ch / ih);
      return { ox: (cw - iw * s) * px, oy: (ch - ih * s) * py, w: iw * s, h: ih * s };
    }
    return { ox: 0, oy: 0, w: cw, h: ch }; // obraz bez cropu wypełnia wrapper
  }

  var placed = []; // [{fig,img,box,rect}] — repozycjonowanie przy resize
  function placeOverlay(item) {
    var g = geom(item.fig, item.img);
    if (!g) return;
    var r = item.rect;
    item.box.style.left = Math.round(g.ox + r.fx * g.w) + 'px';
    item.box.style.top = Math.round(g.oy + r.fy * g.h) + 'px';
    item.box.style.width = Math.round(r.fw * g.w) + 'px';
    item.box.style.height = Math.round(r.fh * g.h) + 'px';
  }
  function addOverlay(fig, cls, html, rect) {
    var img = fig.querySelector('img');
    if (!img) return null;
    var box = document.createElement('span');
    box.className = 'sig-overlay ' + cls;
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = html;
    fig.appendChild(box);
    var item = { fig: fig, img: img, box: box, rect: rect };
    placed.push(item);
    if (img.complete && img.naturalWidth) placeOverlay(item);
    else img.addEventListener('load', function () { placeOverlay(item); }, { once: true });
    watch(fig);
    return item;
  }
  var rsT = null;
  window.addEventListener('resize', function () {
    if (rsT) clearTimeout(rsT);
    rsT = setTimeout(function () { placed.forEach(placeOverlay); }, 150);
  }, { passive: true });

  /* ================= A. DZIEŃ ↔ WIECZÓR (hero strony głównej) =================
     Warstwa bazowa: dzień (oranżeria). Warstwa wierzchnia: wieczór (obecne
     zdjęcie LCP) z miękką maską. Wejście: raz na sesję, po ~700 ms granica
     odsłania dzień; potem spokojne, wygładzone podążanie za kursorem
     w wąskim zakresie (desktop). Mobile: tylko jednorazowe przejście.      */
  (function () {
    var arch = document.querySelector('[data-signature="day-night"]');
    if (!arch) return;
    var day = arch.querySelector('.sig-day');
    var night = arch.querySelector('.sig-night');
    if (!day || !night) return;

    var DEFAULT = 44;           // % szerokości zajęte przez dzień (lewa strona);
                                // wieczór dominuje — podpis łuku pozostaje prawdziwy
    var current = 0;            // 0 = pełny wieczór (stan pierwszego malowania)
    var target = DEFAULT;
    var rafId = null;

    function apply(v) {
      current = v;
      arch.style.setProperty('--sig-split', v.toFixed(2) + '%');
    }

    var seen = false;
    try { seen = sessionStorage.getItem('radosc-sig-hero') === '1'; } catch (e) {}

    function markSeen() { try { sessionStorage.setItem('radosc-sig-hero', '1'); } catch (e) {} }

    function tween(from, to, ms, done) {
      var t0 = performance.now();
      function frame(t) {
        var p = Math.min(1, (t - t0) / ms);
        var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
        apply(from + (to - from) * e);
        if (p < 1) rafId = requestAnimationFrame(frame);
        else { rafId = null; if (done) done(); }
      }
      rafId = requestAnimationFrame(frame);
    }

    function enableCursor() {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      var smoothing = null;
      function loop() {
        var d = target - current;
        if (Math.abs(d) < 0.08) { apply(target); smoothing = null; return; }
        apply(current + d * 0.055); // mocno wygładzone, bez reakcji 1:1
        smoothing = requestAnimationFrame(loop);
      }
      window.addEventListener('pointermove', function (e) {
        var nx = e.clientX / window.innerWidth;
        target = DEFAULT + (nx - 0.5) * 14; // spokojny zakres ±7%
        if (!smoothing) smoothing = requestAnimationFrame(loop);
      }, { passive: true });
    }

    function start() {
      arch.classList.add('sig-ready'); // od teraz maska steruje warstwą wieczoru
      if (seen) { apply(DEFAULT); enableCursor(); return; }
      apply(0); // identycznie z pierwszym malowaniem: pełny wieczór
      setTimeout(function () {
        tween(0, 52, 1700, function () {
          tween(52, DEFAULT, 650, function () { markSeen(); enableCursor(); });
        });
      }, 750);
    }

    // warstwa dnia jest ukryta do czasu inicjalizacji (bez JS strona = 6.1)
    day.removeAttribute('hidden');
    var dImg = day.querySelector('img');
    if (dImg.complete && dImg.naturalWidth) start();
    else {
      dImg.addEventListener('load', start, { once: true });
      dImg.addEventListener('error', function () { day.setAttribute('hidden', ''); }, { once: true });
    }
  })();

  /* ================= B. PARA NAD SZKLANKĄ (bistro, sekcja Kawa) =================
     Zdjęcie ma prawdziwą parę — smugi są jej delikatną kontynuacją,
     zakotwiczone dokładnie nad otworem szklanki (ułamki wymiarów zdjęcia). */
  (function () {
    var fig = document.querySelector('[data-signature="coffee-steam"]');
    if (!fig) return;
    addOverlay(fig, 'sig-steam', '<i class="s1"></i><i class="s2"></i><i class="s3"></i>',
      { fx: 0.24, fy: 0.10, fw: 0.34, fh: 0.40 }); // dół ramki = krawędź szklanki (y≈0.50)
  })();

  /* ================= C. GORĄCE POWIETRZE (pizza, „Prosto z pieca") =============
     Szerokie, prawie przezroczyste, ciepłe pasma falujące nad pizzą —
     bez bieli, bez dymu, bez deformacji zdjęcia.                            */
  (function () {
    var fig = document.querySelector('[data-signature="pizza-heat"]');
    if (!fig) return;
    addOverlay(fig, 'sig-heat', '<i class="h1"></i><i class="h2"></i><i class="h3"></i>',
      { fx: 0.12, fy: 0.10, fw: 0.74, fh: 0.36 }); // strefa nad frontową pizzą
  })();

  /* ================= D. ŚWIATŁA GALI (realizacje, „Gala na setki gości") =======
     Rozświetlenia wyłącznie w miejscach realnych świateł stołowych na
     zdjęciu; każdy punkt ma własny, niesynchroniczny rytm 7–12 s.          */
  (function () {
    var fig = document.querySelector('[data-signature="gala-light"]');
    if (!fig) return;
    // pozycje (ułamki zdjęcia) = realne podświetlone stoły
    var pts = [
      { x: 0.155, y: 0.375, s: 0.070, d: 8.5, dl: 0.0 },
      { x: 0.420, y: 0.372, s: 0.062, d: 11.0, dl: 3.2 },
      { x: 0.735, y: 0.350, s: 0.058, d: 7.4, dl: 5.6 },
      { x: 0.105, y: 0.545, s: 0.078, d: 9.8, dl: 2.1 },
      { x: 0.475, y: 0.545, s: 0.072, d: 12.0, dl: 6.9 },
      { x: 0.300, y: 0.705, s: 0.086, d: 8.0, dl: 4.4 }
    ];
    var html = pts.map(function (p) {
      return '<i style="left:' + (p.x * 100) + '%;top:' + (p.y * 100) + '%;' +
        'width:' + (p.s * 100) + '%;--d:' + p.d + 's;--dl:' + p.dl + 's"></i>';
    }).join('');
    addOverlay(fig, 'sig-gala', html, { fx: 0, fy: 0, fw: 1, fh: 1 });
  })();
})();
