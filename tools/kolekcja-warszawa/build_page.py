# -*- coding: utf-8 -*-
"""Składa kolekcja/warszawa/index.html z katalogu, klasyfikacji i not kuratorskich."""
import json, os, re, sys, html, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from classify import T, THEMES, ERAS

ROOT = '/home/user/radosc-website-preview'
S = '/tmp/claude-0/-home-user-radosc-website-preview/2284476a-e7d4-59c3-b790-803821162acf/scratchpad/'
FULL = os.path.join(ROOT, 'assets', 'kolekcja', 'img_warszawa')
OUT = os.path.join(ROOT, 'kolekcja', 'warszawa', 'index.html')

def slug(sig):
    return sig.replace(':', '-').lower()

def esc(s):
    return html.escape(str(s or '').strip(), quote=True)

# ---- dane ----
pc = json.load(open(S + 'war_pc.json'))
notes = {}
for i in range(1, 9):
    p = os.path.join(ROOT, '.work', 'notes_out', 'chunk%d.json' % i)
    for n in json.load(open(p)):
        notes[n['sygnatura']] = n

missing = [r['sygnatura'] for r in pc if r['sygnatura'] not in notes]
assert not missing, 'brak not: %s' % missing

try:
    from PIL import Image
    def dims(name):
        p = os.path.join(FULL, name)
        return Image.open(p).size if os.path.exists(p) else (None, None)
except ImportError:
    def dims(name):
        return (None, None)

THEME_LBL = dict(THEMES)
ERA_LBL = dict(ERAS)
ct = collections.Counter(T[r['sygnatura']][0] for r in pc)
ce = collections.Counter(T[r['sygnatura']][1] for r in pc)

# ---- karty ----
cards = []
for r in pc:
    sig = r['sygnatura']
    sl = slug(sig)
    n = notes[sig]
    cat, era = T[sig]
    fa, fb = sl + '-a.jpg', sl + '-b.jpg'
    wa, ha = dims(fa)
    wb, hb = dims(fb)
    title = esc(n['tytul'])
    meta = esc(n['meta_wydawca']) + '<span class="sep">&middot;</span>' + esc(n['meta_data'])
    dim_a = ' width="%d" height="%d"' % (wa, ha) if wa else ''
    dim_b = ' width="%d" height="%d"' % (wb, hb) if wb else ''
    cards.append(
'''    <article class="pc" data-id="{sl}" data-flip="front" data-cat="{cat}" data-era="{era}"
             data-front="../../assets/kolekcja/img_warszawa/{fa}"
             data-back="../../assets/kolekcja/img_warszawa/{fb}">
      <div class="pc-stage">
        <div class="pc-flipper">
        <button type="button" class="pc-face pc-face-front" data-open="front" aria-label="Powiększ: {title}">
          <img src="../../assets/kolekcja/thumbs_warszawa/{fa}" alt="{title}"{dim_a} loading="lazy" decoding="async">
        </button>
        <button type="button" class="pc-face pc-face-back" data-open="back" aria-label="Powiększ odwrocie: {title}" tabindex="-1">
          <img src="../../assets/kolekcja/thumbs_warszawa/{fb}" alt="Odwrocie karty: {title}"{dim_b} loading="lazy" decoding="async">
        </button>
        </div>
      </div>
      <div class="pc-tools">
        <button type="button" class="pc-flip" aria-pressed="false">
          <span class="gl" aria-hidden="true">&#8635;</span><span class="pc-flip-txt">Odwrocie</span>
        </button>
      </div>
      <div class="pc-text">
        <h3 class="pc-title">{title}</h3>
        <p class="pc-meta">{meta}</p>
        <p class="pc-body">{body}</p>
        <p class="pc-sig">{sig} &middot; {typ}</p>
      </div>
    </article>'''.format(sl=sl, cat=cat, era=era, fa=fa, fb=fb, title=title, meta=meta,
                         dim_a=dim_a, dim_b=dim_b,
                         body=esc(n['nota']), sig=esc(sig), typ=esc(n['sig_typ'])))

def ix_row(key, opts, all_label, all_count, extra_cls=''):
    parts = ['<button type="button" class="ix is-on" data-%s="*" aria-pressed="true">%s<sup>%d</sup></button>'
             % (key, all_label, all_count)]
    for k, lbl, cnt in opts:
        parts.append('<button type="button" class="ix" data-%s="%s" aria-pressed="false">%s<sup>%d</sup></button>'
                     % (key, k, esc(lbl), cnt))
    return '<span class="ix-sep" aria-hidden="true"></span>'.join(parts)

cat_row = ix_row('cat', [(k, l, ct[k]) for k, l in THEMES], 'Wszystkie', len(pc))
era_row = ix_row('era', [(k, l, ce[k]) for k, l in ERAS], 'wszystkie lata', len(pc))

page = '''<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PT — Pocztówki Warszawy</title>
<meta name="description" content="Prywatna kolekcja 147 pocztówek i fotografii Warszawy z lat 1902–1979, z osią na odbudowie miasta.">
<meta name="robots" content="noindex">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%2314171b'/%3E%3Ctext x='16' y='22' font-family='Georgia,serif' font-size='15' font-weight='700' fill='%23d98b63' text-anchor='middle' letter-spacing='1'%3EPT%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<a class="skip-link" href="#plates">Przejdź do kolekcji</a>

<header class="site-head">
  <div class="site-head-inner">
    <p class="site-mark">PT</p>
    <nav class="site-nav" aria-label="Podstrony kolekcji">
      <p class="site-tag">Pocztówki Warszawy &middot; 1902&ndash;1979</p>
      <a class="site-x" href="../">Kraków &#8594;</a>
    </nav>
  </div>
</header>

<main>
  <section class="hero">
    <div class="hero-inner">
      <p class="eyebrow">Prywatna kolekcja</p>
      <h1>Miasto sfotografowane przed,<br>w gruzach i stawiane od nowa.</h1>
      <p class="lede">Sto czterdzieści siedem kart. Najstarsze pochodzą jeszcze z czasów poczty rosyjskiej: Rynek Starego Miasta z targiem w nakładzie K. Sommera, kościół św. Krzyża wysłany do Paryża, plac Zamkowy do Lwowa. Potem przychodzą podpisy niemieckie z lat I wojny — most Poniatowskiego wysadzony w sierpniu 1915, sobór na placu Saskim, wojsko odpoczywające na ulicach. Z międzywojnia został komplet dziesięciu fotografii J. Krywulta „Pamiątka z Warszawy” z 1936 roku, w oryginalnej kopercie: Marszałkowska z tramwajami, Prudential, Zachęta, Rynek — pierzeje, których w większości już nie ma.</p>
      <p class="lede">Środek zbioru to rok 1944 i to, co po nim zostało: dziesięć kart z serii „Warszawa walcząca” i „Warszawa zburzona” Spółdzielni „Światowid”, ruiny Starówki, kościołów i getta zdjęte dla „Czytelnika” przez zakład J. Bułhak i Syn, cztery amatorskie odbitki ze zniszczeń 1939 roku. Część najliczniejsza — sześćdziesiąt cztery karty z serii „Odbudowa Warszawy” Książki i Wiedzy — pokazuje kierunek odwrotny: Trasę W-Z, Mariensztat, rusztowania na Starym Mieście. Ich rewersy niosą podpisy pisane językiem epoki; noty oddzielają je od tego, co widać na zdjęciu.</p>
      <hr class="hero-rule">
      <div class="hero-stats">
        <div><b>147</b><span>kart</span></div>
        <div><b>294</b><span>skany</span></div>
        <div><b>1902&ndash;1979</b><span>zakres dat</span></div>
      </div>
    </div>
  </section>

  <nav class="index" aria-label="Filtry kolekcji">
    <div class="index-inner">
      <div class="index-row" role="group" aria-label="Motyw">
        <p class="index-label">Motyw</p>
        {cat_row}
      </div>
      <div class="index-row index-row-era" role="group" aria-label="Lata">
        <p class="index-label">Lata</p>
        {era_row}
        <button type="button" class="ix-reset" id="ix-reset" hidden>Wyczyść</button>
        <p class="ix-count" id="ix-count" aria-live="polite"></p>
      </div>
    </div>
  </nav>

  <section class="plates" id="plates" aria-label="Kolekcja pocztówek">
    <p class="plate-note">Lata w indeksie oznaczają datę wydania karty, nie datę stempla ani moment wykonania zdjęcia — karty z Powstania wydrukowano rok po tym, co pokazują, i tam liczy się rok druku. Część datowań katalogowych jest przybliżona albo niepotwierdzona; gdzie tak jest, mówi o tym nota przy karcie. Klik w skan otwiera powiększenie z odwrociem i nawigacją.</p>
    <div class="plate-grid" id="plate-grid">
{cards}
    </div>
    <p class="plates-empty" id="plates-empty" hidden>Dla tego zestawienia nie ma kart.</p>
  </section>
</main>

<footer class="site-foot">
  <div class="site-foot-inner">
    <p>Zbiór prywatny, nieprzeznaczony do sprzedaży. Skany wykonane z własnych egzemplarzy; opisy oparte wyłącznie na katalogu kolekcji — tam, gdzie katalog nie rozstrzyga, nota mówi o tym wprost. Podstrona wyłączona z indeksowania i z nawigacji serwisu.</p>
    <p>Zakres 1902&ndash;1979 obejmuje daty pewne. Trzy najwcześniejsze karty jednodzielne katalog datuje widełkowo na lata 1900&ndash;1905, więc kolekcja może w istocie zaczynać się rok lub dwa wcześniej.</p>
    <p>Sygnatury PT:7, PT:8 i PT:5 &middot; <a href="../">Pocztówki Krakowa</a></p>
  </div>
</footer>

<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Powiększenie karty">
  <div class="lb-veil" data-close></div>
  <div class="lb-shell">
    <figure class="lb-stage">
      <img class="lb-img" id="lb-img" src="" alt="">
      <button type="button" class="lb-flip" id="lb-flip">
        <span aria-hidden="true">&#8635;</span><span id="lb-flip-txt">Odwrocie</span>
      </button>
    </figure>
    <aside class="lb-side" id="lb-side"></aside>
  </div>
  <button type="button" class="lb-x" data-close aria-label="Zamknij">&times;</button>
  <button type="button" class="lb-nav lb-prev" id="lb-prev" aria-label="Poprzednia karta">&#8249;</button>
  <button type="button" class="lb-nav lb-next" id="lb-next" aria-label="Następna karta">&#8250;</button>
</div>

<script src="js/app.js"></script>
</body>
</html>
'''.format(cat_row=cat_row, era_row=era_row, cards='\n\n'.join(cards))

open(OUT, 'w').write(page)
print('zapisano', OUT, '| kart:', len(cards))
