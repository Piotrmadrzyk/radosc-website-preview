/* ============================================================
   WIRTUALNY MANAGER — czat AI (Restauracja Zielona Pergola)
   Widget pływający na wszystkich podstronach. Backend: webhook
   n8n → model językowy z wiedzą o restauracji i aktualnym menu
   lunchowym (dogrywanym z assets/data/lunch-menu.js).
   Zasady: zero bibliotek, dostępność (focus, Esc, aria-live),
   historia trzymana tylko w pamięci strony.
   ============================================================ */
(function () {
  'use strict';
  if (window.__RADOSC_MANAGER__) return;
  window.__RADOSC_MANAGER__ = 1;

  var ENDPOINT = 'https://pmresearch.app.n8n.cloud/webhook/zielona-pergola-manager';
  var history = []; /* [{q, a}] — ostatnie wymiany, wysyłane jako kontekst */

  /* menu lunchowe: jeśli strona go nie załadowała, dograj skrypt danych */
  function ensureLunch(cb) {
    if (window.RADOSC_LUNCH) return cb(window.RADOSC_LUNCH);
    var s = document.createElement('script');
    s.src = 'assets/data/lunch-menu.js';
    s.onload = function () { cb(window.RADOSC_LUNCH || null); };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }

  /* ---------- struktura widgetu ---------- */
  var root = document.createElement('div');
  root.className = 'vm-root';
  root.innerHTML =
    '<button class="vm-fab" type="button" aria-expanded="false" aria-controls="vm-panel">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '<span class="vm-fab-label">Wirtualny Manager</span>' +
    '</button>' +
    '<section class="vm-panel" id="vm-panel" role="dialog" aria-label="Czat z Wirtualnym Managerem" hidden>' +
      '<header class="vm-head">' +
        '<div><b>Wirtualny Manager</b><small>Restauracja Zielona Pergola · asystent AI</small></div>' +
        '<button class="vm-close" type="button" aria-label="Zamknij czat">&times;</button>' +
      '</header>' +
      '<div class="vm-msgs" aria-live="polite"></div>' +
      '<div class="vm-chips" role="group" aria-label="Szybkie pytania">' +
        '<button type="button" data-q="Co dziś na lunch?">Co dziś na lunch?</button>' +
        '<button type="button" data-q="Jakie są godziny otwarcia?">Godziny otwarcia</button>' +
        '<button type="button" data-q="Organizuję imprezę firmową — jak wygląda catering?">Catering</button>' +
      '</div>' +
      '<form class="vm-input">' +
        '<label class="visually-hidden" for="vm-q">Twoje pytanie</label>' +
        '<input id="vm-q" type="text" maxlength="500" placeholder="Zapytaj o lunch, godziny, catering…" autocomplete="off">' +
        '<button type="submit" aria-label="Wyślij pytanie"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg></button>' +
      '</form>' +
      '<p class="vm-note">Asystent AI strony demonstracyjnej — odpowiedzi mogą zawierać błędy.</p>' +
    '</section>';
  document.body.appendChild(root);

  var fab = root.querySelector('.vm-fab');
  var panel = root.querySelector('.vm-panel');
  var msgs = root.querySelector('.vm-msgs');
  var chipsBox = root.querySelector('.vm-chips');
  var form = root.querySelector('.vm-input');
  var input = root.querySelector('#vm-q');
  var closeBtn = root.querySelector('.vm-close');
  var busy = false;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* markdown-lite: tylko **pogrubienie** po wcześniejszym escapowaniu */
  function render(s) { return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); }

  function addMsg(kind, html) {
    var el = document.createElement('div');
    el.className = 'vm-msg vm-' + kind;
    el.innerHTML = html;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function greet() {
    if (msgs.children.length) return;
    var h = new Date().getHours();
    var hello = h < 5 ? 'Dobry wieczór!' : h < 12 ? 'Dzień dobry!' : h < 18 ? 'Dzień dobry!' : 'Dobry wieczór!';
    addMsg('bot', render(hello + ' Jestem wirtualnym managerem Zielonej Pergoli. Chętnie opowiem o dzisiejszym lunchu, godzinach otwarcia, pizzy z pieca albo cateringu — o co chcesz zapytać?'));
  }

  function setOpen(open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    root.classList.toggle('vm-open', open);
    if (open) { greet(); input.focus(); }
    else fab.focus();
  }
  fab.addEventListener('click', function () { setOpen(panel.hidden); });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  function ask(q) {
    if (busy || !q.trim()) return;
    busy = true;
    addMsg('user', esc(q));
    var typing = addMsg('bot vm-typing', '<i></i><i></i><i></i>');
    input.value = '';
    ensureLunch(function (lunch) {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history: history.slice(-4), lunch: lunch })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (d) {
        var a = d && d.reply ? String(d.reply) : '';
        if (!a) throw new Error('empty');
        typing.classList.remove('vm-typing');
        typing.innerHTML = render(a);
        history.push({ q: q, a: a });
      }).catch(function () {
        typing.classList.remove('vm-typing');
        typing.innerHTML = render('Przepraszam, mam chwilową przerwę techniczną. Zadzwoń do nas: **795 870 359** albo napisz przez formularz kontaktowy.');
      }).finally(function () {
        busy = false;
        msgs.scrollTop = msgs.scrollHeight;
      });
    });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
  chipsBox.addEventListener('click', function (e) {
    var b = e.target.closest('[data-q]');
    if (b) ask(b.getAttribute('data-q'));
  });
})();
