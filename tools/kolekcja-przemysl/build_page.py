# -*- coding: utf-8 -*-
"""Składa kolekcja/przemysl/index.html z katalogu, klasyfikacji i not kuratorskich."""
import json, os, sys, html, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from classify import T, THEMES, ERAS

ROOT = '/home/user/radosc-website-preview'
WORK = os.path.join(ROOT, '.work-prz')
FULL = os.path.join(ROOT, 'assets', 'kolekcja', 'img_przemysl')
OUT = os.path.join(ROOT, 'kolekcja', 'przemysl', 'index.html')
NOTES = os.path.join(ROOT, 'tools', 'kolekcja-przemysl', 'noty.json')


def slug(sig):
    return sig.replace(':', '-').lower()


def esc(s):
    return html.escape(str(s or '').strip(), quote=True)


# ---- dane ----
pc = json.load(open(os.path.join(WORK, 'prz_pc.json')))
notes = {n['sygnatura']: n for n in json.load(open(NOTES))}

missing = [r['sygnatura'] for r in pc if r['sygnatura'] not in notes]
assert not missing, 'brak not: %s' % missing

from PIL import Image


def dims(name):
    p = os.path.join(FULL, name)
    return Image.open(p).size if os.path.exists(p) else (None, None)


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
    assert wa and wb, 'brak skanu dla %s' % sig
    title = esc(n['tytul'])
    meta = esc(n['meta_wydawca']) + '<span class="sep">&middot;</span>' + esc(n['meta_data'])
    cards.append(
'''    <article class="pc" data-id="{sl}" data-flip="front" data-cat="{cat}" data-era="{era}"
             data-front="../../assets/kolekcja/img_przemysl/{fa}"
             data-back="../../assets/kolekcja/img_przemysl/{fb}">
      <div class="pc-stage">
        <div class="pc-flipper">
        <button type="button" class="pc-face pc-face-front" data-open="front" aria-label="Powiększ: {title}">
          <img src="../../assets/kolekcja/thumbs_przemysl/{fa}" alt="{title}" width="{wa}" height="{ha}" loading="lazy" decoding="async">
        </button>
        <button type="button" class="pc-face pc-face-back" data-open="back" aria-label="Powiększ odwrocie: {title}" tabindex="-1">
          <img src="../../assets/kolekcja/thumbs_przemysl/{fb}" alt="Odwrocie karty: {title}" width="{wb}" height="{hb}" loading="lazy" decoding="async">
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
                         wa=wa, ha=ha, wb=wb, hb=hb,
                         body=esc(n['nota']), sig=esc(sig), typ=esc(n['sig_typ'])))


def ix_row(key, opts, all_label, all_count):
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
<title>PT — Pocztówki Przemyśla</title>
<meta name="description" content="Prywatna kolekcja 104 pocztówek Przemyśla z lat 1898–1955: litografie „Gruss aus”, Twierdza Przemyśl, poczta polowa, międzywojnie.">
<meta name="robots" content="noindex">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23121821'/%3E%3Ctext x='16' y='22' font-family='Georgia,serif' font-size='15' font-weight='700' fill='%2393bcab' text-anchor='middle' letter-spacing='1'%3EPT%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<a class="skip-link" href="#plates">Przejdź do kolekcji</a>

<header class="site-head">
  <div class="site-head-inner">
    <p class="site-mark">PT</p>
    <nav class="site-nav" aria-label="Podstrony kolekcji">
      <p class="site-tag">Pocztówki Przemyśla &middot; 1898&ndash;1955</p>
      <a class="site-x" href="../">Kraków &#8594;</a>
      <a class="site-x" href="../warszawa/">Warszawa &#8594;</a>
    </nav>
  </div>
</header>

<main>
  <section class="hero">
    <div class="hero-inner">
      <p class="eyebrow">Prywatna kolekcja</p>
      <h1>Kartka z miasta, które w 1915 roku<br>przechodziło z rąk do rąk.</h1>
      <p class="lede">Sto cztery karty. Najstarsze to barwne litografie i światłodruki „Gruss aus” z 1898 roku, w nakładzie przemyskich księgarń — M. G. Rosenfelda, M. Glanza, D. Kandla: Rynek, nowy most na Sanie, Plac Reformacki, panorama, a na jednej widok miasta „z roku 1657”. Krążyły do Wiednia i Stuttgartu na kartach z niedzielonym rewersem, ze znaczkiem za dwa krajcary — jeszcze przed reformą walutową 1900 roku. Potem wchodzą wydawcy krakowscy, Salon Malarzy Polskich i „Sztuka”, oraz miejscowe Wydawnictwo kart artystycznych w Przemyślu, z ulicą Mickiewicza, Franciszkańską i Kazimierzowską pełnymi szyldów.</p>
      <p class="lede">Środek zbioru to lata 1914&ndash;1918 — czterdzieści osiem kart. Zniszczone forty Twierdzy Przemyśl w nakładzie wiedeńskiego Kilophotu i „Austriaverlagu”, wysadzony i odbudowany most na Sanie w kilku wariantach, defilada wojsk bawarskich po odbiciu miasta 3 czerwca 1915 roku, oficjalne Kriegsbildkarten wiedeńskiego Kriegshilfsbüro i niemiecka seria „Der Krieg 1914/15 in Postkarten”. Wiele wróciło pocztą polową, z kaszetami cenzury k.u.k. i szpitala garnizonowego nr 3. Dwie pozycje nie są pocztówkami, lecz odbitkami fotograficznymi ze stemplem inwentarzowym Heeresmuseum w Wiedniu. Podpisy tych kart pisane są językiem strony, która je wydała; noty oddzielają je od tego, co widać na zdjęciu.</p>
      <p class="lede">Koniec zbioru jest cichszy: międzywojenne serie krakowskiej „Sztuki” i przemyskiej „Współczesnej Sztuki”, widok lotniczy z 1937 roku, a po wojnie cztery karty — Brama zamkowa z kaszetem I Wystawy Znaczków Pocztowych w Przemyślu z kwietnia 1954 roku i Zarząd Miasta w druku „Czytelnika” ze stycznia 1950.</p>
      <hr class="hero-rule">
      <div class="hero-stats">
        <div><b>104</b><span>karty</span></div>
        <div><b>208</b><span>skanów</span></div>
        <div><b>1898&ndash;1955</b><span>zakres dat</span></div>
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
    <p class="plate-note">Lata w indeksie oznaczają datę wydania karty, nie datę stempla ani moment wykonania zdjęcia — karty Kilophotu z 1916 roku pokazują wydarzenia z roku 1915 i liczy się przy nich rok nakładu. Gdy katalog podaje przedział przechodzący przez granicę epok, karta stoi przy dolnej granicy tego przedziału. Część datowań jest przybliżona albo niepotwierdzona; gdzie tak jest, mówi o tym nota przy karcie. Klik w skan otwiera powiększenie z odwrociem i nawigacją.</p>
    <div class="plate-grid" id="plate-grid">
{cards}
    </div>
    <p class="plates-empty" id="plates-empty" hidden>Dla tego zestawienia nie ma kart.</p>
  </section>
</main>

<footer class="site-foot">
  <div class="site-foot-inner">
    <p>Zbiór prywatny, nieprzeznaczony do sprzedaży. Skany wykonane z własnych egzemplarzy; opisy oparte wyłącznie na katalogu kolekcji — tam, gdzie katalog nie rozstrzyga, nota mówi o tym wprost. Podstrona wyłączona z indeksowania i z nawigacji serwisu.</p>
    <p>Dolna granica 1898 jest pewna (datowniki pocztowe). Górna, 1955, pochodzi z widełek „ok. 1948&ndash;1955” przy jednej karcie powojennej; najpóźniejsza data pewna w zbiorze to 27 kwietnia 1954 roku. Podpisy niemieckie i austro-węgierskie na kartach wojennych cytowane są jako podpisy wydawców, nie jako opis wydarzeń.</p>
    <p>Sygnatury PT:1 &middot; <a href="../">Pocztówki Krakowa</a> &middot; <a href="../warszawa/">Pocztówki Warszawy</a></p>
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
