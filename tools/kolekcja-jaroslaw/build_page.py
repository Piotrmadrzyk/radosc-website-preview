# -*- coding: utf-8 -*-
"""Składa kolekcja/jaroslaw/index.html z katalogu, klasyfikacji i not kuratorskich.

Różnica wobec potoku przemyskiego: obsługa KARTY JEDNOSTRONNEJ. PT:2:51 to
fotografia zachowana tylko od strony awersu. Taka karta dostaje:
  - brak atrybutu `data-back` (lightbox jest na to zabezpieczony w app.js),
  - brak drugiej ściany karty (`.pc-face-back`),
  - zamiast przycisku odwracania — adnotację „tylko awers”.
"""
import json, os, sys, html, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from classify import T, THEMES, ERAS

ROOT = '/home/user/radosc-website-preview'
WORK = os.path.join(ROOT, '.work-jar')
FULL = os.path.join(ROOT, 'assets', 'kolekcja', 'img_jaroslaw')
OUT = os.path.join(ROOT, 'kolekcja', 'jaroslaw', 'index.html')
NOTES = os.path.join(ROOT, 'tools', 'kolekcja-jaroslaw', 'noty.json')


def slug(sig):
    return sig.replace(':', '-').lower()


def esc(s):
    return html.escape(str(s or '').strip(), quote=True)


# ---- dane ----
pc = json.load(open(os.path.join(WORK, 'jar_pc.json')))
notes = {n['sygnatura']: n for n in json.load(open(NOTES))}

missing = [r['sygnatura'] for r in pc if r['sygnatura'] not in notes]
assert not missing, 'brak not: %s' % missing

from PIL import Image


def dims(name):
    p = os.path.join(FULL, name)
    return Image.open(p).size if os.path.exists(p) else (None, None)


ct = collections.Counter(T[r['sygnatura']][0] for r in pc)
ce = collections.Counter(T[r['sygnatura']][1] for r in pc)

FACE_BACK = '''
        <button type="button" class="pc-face pc-face-back" data-open="back" aria-label="Powiększ odwrocie: {title}" tabindex="-1">
          <img src="../../assets/kolekcja/thumbs_jaroslaw/{fb}" alt="Odwrocie karty: {title}" width="{wb}" height="{hb}" loading="lazy" decoding="async">
        </button>'''

TOOLS_FLIP = '''<button type="button" class="pc-flip" aria-pressed="false">
          <span class="gl" aria-hidden="true">&#8635;</span><span class="pc-flip-txt">Odwrocie</span>
        </button>'''

TOOLS_ONE = '''<p class="pc-oneside">tylko awers</p>'''

# ---- karty ----
cards = []
one_sided = []
for r in pc:
    sig = r['sygnatura']
    sl = slug(sig)
    n = notes[sig]
    cat, era = T[sig]
    two = r['skany'] == 2
    fa = sl + '-a.jpg'
    wa, ha = dims(fa)
    assert wa, 'brak skanu awersu dla %s' % sig
    title = esc(n['tytul'])
    meta = esc(n['meta_wydawca']) + '<span class="sep">&middot;</span>' + esc(n['meta_data'])

    if two:
        fb = sl + '-b.jpg'
        wb, hb = dims(fb)
        assert wb, 'brak skanu rewersu dla %s' % sig
        back_attr = '\n             data-back="../../assets/kolekcja/img_jaroslaw/%s"' % fb
        face_back = FACE_BACK.format(title=title, fb=fb, wb=wb, hb=hb)
        tools = TOOLS_FLIP
    else:
        one_sided.append(sig)
        back_attr, face_back, tools = '', '', TOOLS_ONE

    cards.append(
'''    <article class="pc" data-id="{sl}" data-flip="front" data-cat="{cat}" data-era="{era}"
             data-front="../../assets/kolekcja/img_jaroslaw/{fa}"{back_attr}>
      <div class="pc-stage">
        <div class="pc-flipper">
        <button type="button" class="pc-face pc-face-front" data-open="front" aria-label="Powiększ: {title}">
          <img src="../../assets/kolekcja/thumbs_jaroslaw/{fa}" alt="{title}" width="{wa}" height="{ha}" loading="lazy" decoding="async">
        </button>{face_back}
        </div>
      </div>
      <div class="pc-tools">
        {tools}
      </div>
      <div class="pc-text">
        <h3 class="pc-title">{title}</h3>
        <p class="pc-meta">{meta}</p>
        <p class="pc-body">{body}</p>
        <p class="pc-sig">{sig} &middot; {typ}</p>
      </div>
    </article>'''.format(sl=sl, cat=cat, era=era, fa=fa, back_attr=back_attr,
                         face_back=face_back, tools=tools, title=title, meta=meta,
                         wa=wa, ha=ha,
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

scans = sum(r['skany'] for r in pc)

page = '''<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PT — Pocztówki Jarosławia</title>
<meta name="description" content="Prywatna kolekcja 58 obiektów z Jarosławia z lat 1900–1975: chromolitografie „Sztuki” i Salonu Malarzy Polskich, poczta polowa, fotografie straży pożarnej, karty PRL.">
<meta name="robots" content="noindex">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23191410'/%3E%3Ctext x='16' y='22' font-family='Georgia,serif' font-size='15' font-weight='700' fill='%23c8757c' text-anchor='middle' letter-spacing='1'%3EPT%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<a class="skip-link" href="#plates">Przejdź do kolekcji</a>

<header class="site-head">
  <div class="site-head-inner">
    <p class="site-mark">PT</p>
    <nav class="site-nav" aria-label="Podstrony kolekcji">
      <p class="site-tag">Pocztówki Jarosławia &middot; 1900&ndash;1975</p>
      <a class="site-x" href="../">Kraków<span class="arr"> &#8594;</span></a>
      <a class="site-x" href="../warszawa/">Warszawa<span class="arr"> &#8594;</span></a>
      <a class="site-x" href="../przemysl/">Przemyśl<span class="arr"> &#8594;</span></a>
    </nav>
  </div>
</header>

<main>
  <section class="hero">
    <div class="hero-inner">
      <p class="eyebrow">Prywatna kolekcja</p>
      <h1>Jedna ulica, kilkanaście razy,<br>przez siedemdziesiąt pięć lat.</h1>
      <p class="lede">Pięćdziesiąt osiem pozycji. Zbiór zaczyna się od kart z niedzielonym rewersem, ze znaczkiem austriackim za pięć halerzy: „Pozdrowienie z Jarosławia / Gruss aus Jaroslau” z ratuszem i z kościołem Fary w nakładzie Ch. Schorra na miejscu, widoki ulicy Kościuszki i Sobieskiego u J. Kleina w Krakowie, panorama i ulica Krakowska z budynkiem Casino u A. Freya w Jarosławiu. Podpisy są dwujęzyczne — Grunwaldgasse, Ringplatz, Rathaus, Altes Schloß — bo to jeszcze Galicja.</p>
      <p class="lede">Środek zbioru to lata 1914&ndash;1918 i dwa krakowskie nakłady, które wracają na tych kartach raz po raz: Salon Malarzy Polskich i Wydawnictwo „Sztuka” z numerem „Déposé” przy sygnaturze. Chromolitografie z ożywioną sceną targową na Rynku i z szyldami przy Grunwaldzkiej krążyły jako poczta polowa — z kaszetami szpitali rezerwowych, batalionów marszowych Landsturmu, cenzury k.u.k. Jedna karta pojechała do Paryża i wróciła z francuską dopłatą. Jedna, wydana w 1918 roku, poszła w obieg dopiero w kwietniu 1940, jako Feldpost innej wojny.</p>
      <p class="lede">Koniec jest już zupełnie inny w materii: trzynaście obiektów w tym zbiorze nie jest pocztówkami. To odbitki fotograficzne — grupy straży pożarnej i portret strażaka w hełmie, portret atelierowy pary, dzieci w parku, pochody na Grunwaldzkiej z transparentem państwowego domu dziecka — oraz jeden odręczny rysunek, studium głowy konia w kiełznie, którego związek z Jarosławiem katalog zostawia do potwierdzenia. Najpóźniejsza data pewna w zbiorze to 11 listopada 1975 roku, datownik na karcie z kolegiatą.</p>
      <hr class="hero-rule">
      <div class="hero-stats">
        <div><b>{n_cards}</b><span>pozycji</span></div>
        <div><b>{n_scans}</b><span>skanów</span></div>
        <div><b>1900&ndash;1975</b><span>zakres dat</span></div>
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
    <p class="plate-note">Lata w indeksie oznaczają datę wydania karty, nie datę stempla — w tym zbiorze te dwie daty rozjeżdżają się częściej niż gdzie indziej, bo karty z nakładów z lat 1915&ndash;1918 obiegały jeszcze przez następne dwie dekady. Gdy katalog podaje przedział przechodzący przez granicę epok, karta stoi przy dolnej granicy tego przedziału. Trzy pozycje, przy których katalog pisze samo „1 poł. XX w.” i nie skłania się w żadną stronę, stoją osobno jako datowanie nieustalone — dopisywanie im precyzji byłoby zmyślaniem. Klik w skan otwiera powiększenie z odwrociem i nawigacją.</p>
    <div class="plate-grid" id="plate-grid">
{cards}
    </div>
    <p class="plates-empty" id="plates-empty" hidden>Dla tego zestawienia nie ma kart.</p>
  </section>
</main>

<footer class="site-foot">
  <div class="site-foot-inner">
    <p>Zbiór prywatny, nieprzeznaczony do sprzedaży. Skany wykonane z własnych egzemplarzy; opisy oparte wyłącznie na katalogu kolekcji — tam, gdzie katalog nie rozstrzyga, nota mówi o tym wprost. Podstrona wyłączona z indeksowania i z nawigacji serwisu.</p>
    <p>Zakres dat obejmuje daty nakładu i daty obiegu: najwcześniejsza pewna to 24 lutego 1902 roku, najpóźniejsza 11 listopada 1975. Jedna pozycja (PT:2:51) zachowała się tylko od strony awersu i nie ma odwrocia. Trzynaście pozycji to nie pocztówki, lecz odbitki fotograficzne i jeden rysunek — noty nazywają je po imieniu. Podpisy niemieckie, a na karcie z 1941 roku także ukraińskie, cytowane są jako podpisy wydawców, nie jako opis rzeczywistości.</p>
    <p>Sygnatury PT:2 i PT:6 &middot; <a href="../">Pocztówki Krakowa</a> &middot; <a href="../warszawa/">Pocztówki Warszawy</a> &middot; <a href="../przemysl/">Pocztówki Przemyśla</a></p>
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
'''.format(cat_row=cat_row, era_row=era_row, cards='\n\n'.join(cards),
           n_cards=len(pc), n_scans=scans)

open(OUT, 'w').write(page)
print('zapisano', OUT, '| kart:', len(cards), '| skanów:', scans,
      '| jednostronne:', one_sided)
