/* ============================================================
   WIRTUALNY MANAGER — czat AI (Restauracja Zielona Pergola)
   Widget pływający na wszystkich podstronach (PL i EN). Backend:
   webhook n8n → model językowy z wiedzą o restauracji i aktualnym
   menu lunchowym (dogrywanym z assets/data/lunch-menu.js).
   Funkcje: szybkie pytania, link do rezerwacji, odczyt odpowiedzi
   na głos (Web Speech API). Zasady: zero bibliotek, dostępność
   (focus, Esc, aria-live), historia tylko w pamięci strony.
   ============================================================ */
(function () {
  'use strict';
  if (window.__RADOSC_MANAGER__) return;
  window.__RADOSC_MANAGER__ = 1;

  var ENDPOINT = 'https://pmresearch.app.n8n.cloud/webhook/zielona-pergola-manager';
  var EN = document.documentElement.lang === 'en';
  var BASE = EN ? '../' : ''; /* strony EN żyją w /en/ */
  var history = []; /* [{q, a}] — ostatnie wymiany, wysyłane jako kontekst */

  var T = EN ? {
    fab: 'Virtual Manager',
    sub: 'Zielona Pergola Restaurant · AI assistant',
    close: 'Close chat',
    chipsLabel: 'Quick questions',
    chip1: "What's for lunch today?", chip1q: "What's for lunch today?",
    chip2: 'Opening hours', chip2q: 'What are your opening hours?',
    chip3: 'Catering', chip3q: 'I am planning a company event — how does your catering work?',
    chipRes: 'Book a table',
    inputLabel: 'Your question',
    placeholder: 'Ask about lunch, hours, catering…',
    send: 'Send question',
    note: 'AI assistant of a demo website — answers may contain mistakes.',
    speak: 'Read aloud',
    greetDay: 'Good morning!', greetEve: 'Good evening!',
    greet: " I'm the virtual manager of Zielona Pergola. Happy to tell you about today's lunch, opening hours, wood-fired pizza or catering — what would you like to know?",
    offline: 'I am sorry, we are having a technical break. Call us at **795 870 359** or use the contact form.'
  } : {
    fab: 'Wirtualny Manager',
    sub: 'Restauracja Zielona Pergola · asystent AI',
    close: 'Zamknij czat',
    chipsLabel: 'Szybkie pytania',
    chip1: 'Co dziś na lunch?', chip1q: 'Co dziś na lunch?',
    chip2: 'Godziny otwarcia', chip2q: 'Jakie są godziny otwarcia?',
    chip3: 'Catering', chip3q: 'Organizuję imprezę firmową — jak wygląda catering?',
    chipRes: 'Rezerwacja stolika',
    inputLabel: 'Twoje pytanie',
    placeholder: 'Zapytaj o lunch, godziny, catering…',
    send: 'Wyślij pytanie',
    note: 'Asystent AI strony demonstracyjnej — odpowiedzi mogą zawierać błędy.',
    speak: 'Przeczytaj na głos',
    greetDay: 'Dzień dobry!', greetEve: 'Dobry wieczór!',
    greet: ' Jestem wirtualnym managerem Zielonej Pergoli. Chętnie opowiem o dzisiejszym lunchu, godzinach otwarcia, pizzy z pieca albo cateringu — o co chcesz zapytać?',
    offline: 'Przepraszam, mam chwilową przerwę techniczną. Zadzwoń do nas: **795 870 359** albo napisz przez formularz kontaktowy.'
  };
  var RES_HREF = (EN ? 'kontakt.html' : 'kontakt.html') + '#rezerwacja';

  /* menu lunchowe: jeśli strona go nie załadowała, dograj skrypt danych */
  function ensureLunch(cb) {
    if (window.RADOSC_LUNCH) return cb(window.RADOSC_LUNCH);
    var s = document.createElement('script');
    s.src = BASE + 'assets/data/lunch-menu.js';
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
      '<span class="vm-fab-label">' + T.fab + '</span>' +
    '</button>' +
    '<section class="vm-panel" id="vm-panel" role="dialog" aria-label="' + T.fab + '" hidden>' +
      '<header class="vm-head">' +
        '<div><b>' + T.fab + '</b><small>' + T.sub + '</small></div>' +
        '<button class="vm-close" type="button" aria-label="' + T.close + '">&times;</button>' +
      '</header>' +
      '<div class="vm-msgs" aria-live="polite"></div>' +
      '<div class="vm-chips" role="group" aria-label="' + T.chipsLabel + '">' +
        '<button type="button" data-q="' + T.chip1q + '">' + T.chip1 + '</button>' +
        '<button type="button" data-q="' + T.chip2q + '">' + T.chip2 + '</button>' +
        '<button type="button" data-q="' + T.chip3q + '">' + T.chip3 + '</button>' +
        '<a class="vm-chip-link" href="' + RES_HREF + '">' + T.chipRes + '</a>' +
      '</div>' +
      '<form class="vm-input">' +
        '<label class="visually-hidden" for="vm-q">' + T.inputLabel + '</label>' +
        '<button type="button" class="vm-mic" aria-label="' + (EN ? 'Ask by voice' : 'Zapytaj głosem') + '" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></button>' +
        '<input id="vm-q" type="text" maxlength="500" placeholder="' + T.placeholder + '" autocomplete="off">' +
        '<button type="submit" aria-label="' + T.send + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg></button>' +
      '</form>' +
      '<p class="vm-note">' + T.note + '</p>' +
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

  /* ---------- odczyt na głos ----------
     Głos generuje serwer (n8n → nowoczesne TTS, męski, naturalna prosodia);
     syntezator przeglądarki zostaje wyłącznie jako awaryjny fallback. */
  var TTS_ENDPOINT = 'https://pmresearch.app.n8n.cloud/webhook/zielona-pergola-glos';
  var ttsOk = true;
  var audioCache = {}; /* tekst → object URL mp3 */
  var currentAudio = null;

  function stopAudio() {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    root.querySelectorAll('.vm-say.on').forEach(function (b) { b.classList.remove('on'); });
  }

  function speakFallback(text, btn) {
    if (!('speechSynthesis' in window)) { if (btn) btn.classList.remove('on'); return; }
    var u = new SpeechSynthesisUtterance(text);
    u.lang = EN ? 'en-GB' : 'pl-PL';
    u.rate = 1.02;
    var voices = window.speechSynthesis.getVoices();
    /* preferuj głosy neuralne/online — brzmią o klasę lepiej niż systemowe */
    var pref = ['natural', 'online', 'neural', 'google'];
    var lang = EN ? 'en' : 'pl';
    var pool = voices.filter(function (x) { return x.lang && x.lang.toLowerCase().indexOf(lang) === 0; });
    var v = null;
    for (var i = 0; i < pref.length && !v; i++) {
      v = pool.find(function (x) { return x.name.toLowerCase().indexOf(pref[i]) !== -1; });
    }
    u.voice = v || pool[0] || null;
    if (btn) u.onend = u.onerror = function () { btn.classList.remove('on'); };
    window.speechSynthesis.speak(u);
  }

  function speak(text, btn) {
    var playing = currentAudio || ('speechSynthesis' in window && window.speechSynthesis.speaking);
    stopAudio();
    if (playing && btn && btn.__wasOn) { btn.__wasOn = false; return; }
    root.querySelectorAll('.vm-say').forEach(function (b) { b.__wasOn = false; });
    if (btn) { btn.classList.add('on'); btn.__wasOn = true; }
    var clean = text.replace(/\*\*/g, '');
    function play(url) {
      currentAudio = new Audio(url);
      currentAudio.onended = currentAudio.onerror = function () {
        if (btn) { btn.classList.remove('on'); btn.__wasOn = false; }
        currentAudio = null;
      };
      currentAudio.play().catch(function () { if (btn) btn.classList.remove('on'); });
    }
    if (audioCache[clean]) return play(audioCache[clean]);
    fetch(TTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, lang: EN ? 'en' : 'pl' })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.blob();
    }).then(function (blob) {
      if (!blob.type || blob.size < 500) throw new Error('bad audio');
      var url = URL.createObjectURL(blob);
      audioCache[clean] = url;
      if (btn && btn.__wasOn) play(url); /* graj tylko, jeśli nikt nie przerwał */
    }).catch(function () {
      if (btn && btn.__wasOn) speakFallback(clean, btn);
    });
  }

  function addMsg(kind, html, plain) {
    var el = document.createElement('div');
    el.className = 'vm-msg vm-' + kind;
    el.innerHTML = html;
    if (kind.indexOf('bot') === 0 && ttsOk && plain) {
      var say = document.createElement('button');
      say.type = 'button';
      say.className = 'vm-say';
      say.setAttribute('aria-label', T.speak);
      say.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.6 5.4a9 9 0 0 1 0 13.2"/></svg>';
      say.addEventListener('click', function () { speak(plain, say); });
      el.appendChild(say);
    }
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function greet() {
    if (msgs.children.length) return;
    var h = new Date().getHours();
    var hello = (h >= 5 && h < 18) ? T.greetDay : T.greetEve;
    addMsg('bot', render(hello + T.greet), hello + T.greet);
  }

  function setOpen(open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    root.classList.toggle('vm-open', open);
    if (!open && ttsOk) window.speechSynthesis.cancel();
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
        body: JSON.stringify({ message: q, history: history.slice(-4), lunch: lunch, lang: EN ? 'en' : 'pl' })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (d) {
        var a = d && d.reply ? String(d.reply) : '';
        if (!a) throw new Error('empty');
        typing.remove();
        addMsg('bot', render(a), a);
        history.push({ q: q, a: a });
      }).catch(function () {
        typing.remove();
        addMsg('bot', render(T.offline), null);
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

  /* ---------- mikrofon: pytanie głosem (Web Speech API) ---------- */
  var micBtn = root.querySelector('.vm-mic');
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (micBtn && SR) {
    micBtn.hidden = false;
    var rec = null;
    micBtn.addEventListener('click', function () {
      if (rec) { rec.stop(); return; }
      stopAudio();
      rec = new SR();
      rec.lang = EN ? 'en-GB' : 'pl-PL';
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      micBtn.classList.add('rec');
      var finalText = '';
      rec.onresult = function (e) {
        var txt = '';
        for (var i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
        input.value = txt;
        if (e.results[e.results.length - 1].isFinal) finalText = txt;
      };
      rec.onerror = function () { micBtn.classList.remove('rec'); rec = null; };
      rec.onend = function () {
        micBtn.classList.remove('rec');
        rec = null;
        if (finalText.trim()) ask(finalText);
      };
      rec.start();
    });
  }
})();
