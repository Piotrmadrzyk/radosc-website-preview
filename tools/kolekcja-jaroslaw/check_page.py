# -*- coding: utf-8 -*-
"""Kontrola gotowego kolekcja/jaroslaw/index.html — statycznie, bez przeglądarki.

Wzgledem potoku przemyskiego doszła obsługa KARTY JEDNOSTRONNEJ (PT:2:51):
liczba obrazów w siatce liczy się z katalogu (kolumna `skany`), a nie jako 2×karty,
i sprawdzane jest, że karta bez rewersu nie ma ani `data-back`, ani przycisku
odwracania, za to ma adnotację „tylko awers”.

Sprawdza: liczbę kart wobec katalogu, komplet i istnienie skanów, zgodność
atrybutów width/height z plikami, pokrycie filtrów (żadna karta nie może wypaść
poza zasięg), zgodność liczników w indeksie, brak `object-fit: cover`.
"""
import json, os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from classify import T, THEMES, ERAS
from PIL import Image

ROOT = '/home/user/radosc-website-preview'
PAGE = os.path.join(ROOT, 'kolekcja', 'jaroslaw', 'index.html')
CSS = os.path.join(ROOT, 'kolekcja', 'jaroslaw', 'css', 'style.css')
FULL = os.path.join(ROOT, 'assets', 'kolekcja', 'img_jaroslaw')
THUMB = os.path.join(ROOT, 'assets', 'kolekcja', 'thumbs_jaroslaw')
PC = os.path.join(ROOT, '.work-jar', 'jar_pc.json')

errs = []
html = open(PAGE).read()
css = open(CSS).read()
pc = json.load(open(PC))

# --- karty ---
arts = re.findall(r'<article class="pc" data-id="([^"]+)" data-flip="front" '
                  r'data-cat="([^"]+)" data-era="([^"]+)"', html)
print('kart w HTML:', len(arts), '| kart w katalogu:', len(pc))
if len(arts) != len(pc):
    errs.append('liczba kart w HTML (%d) != katalog (%d)' % (len(arts), len(pc)))

want = {r['sygnatura'].replace(':', '-').lower() for r in pc}
got = {a[0] for a in arts}
if want != got:
    errs.append('brakuje: %s | nadmiarowe: %s' % (sorted(want - got), sorted(got - want)))

# --- filtry: żadna karta poza zasięgiem ---
cats = set(re.findall(r'data-cat="([^"*]+)"', html))
eras = set(re.findall(r'data-era="([^"*]+)"', html))
btn_cat = set(re.findall(r'class="ix[^"]*" data-cat="([^"*]+)"', html))
btn_era = set(re.findall(r'class="ix[^"]*" data-era="([^"*]+)"', html))
orphan_cat = cats - btn_cat
orphan_era = eras - btn_era
if orphan_cat:
    errs.append('motywy kart bez przycisku w indeksie: %s' % sorted(orphan_cat))
if orphan_era:
    errs.append('epoki kart bez przycisku w indeksie: %s' % sorted(orphan_era))
empty_cat = btn_cat - cats
empty_era = btn_era - eras
if empty_cat:
    errs.append('przyciski motywu bez kart: %s' % sorted(empty_cat))
if empty_era:
    errs.append('przyciski lat bez kart: %s' % sorted(empty_era))

# --- liczniki w indeksie zgodne z rzeczywistością ---
ct = collections.Counter(a[1] for a in arts)
ce = collections.Counter(a[2] for a in arts)
for key, counter in (('cat', ct), ('era', ce)):
    for k, n in re.findall(r'data-%s="([^"]+)" aria-pressed="[^"]*">[^<]*<sup>(\d+)</sup>' % key, html):
        real = len(arts) if k == '*' else counter[k]
        if int(n) != real:
            errs.append('licznik %s=%s pokazuje %s, jest %d' % (key, k, n, real))

# --- skany: istnienie i zgodność wymiarów ---
imgs = re.findall(r'src="\.\./\.\./assets/kolekcja/thumbs_jaroslaw/([^"]+)"[^>]*?'
                  r'width="(\d+)" height="(\d+)"', html)
n_scans = sum(r['skany'] for r in pc)
print('obrazów w siatce:', len(imgs), '| skanów wg katalogu:', n_scans)
if len(imgs) != n_scans:
    errs.append('obrazów w siatce %d, wg katalogu %d' % (len(imgs), n_scans))
for name, w, h in imgs:
    fp, tp = os.path.join(FULL, name), os.path.join(THUMB, name)
    if not os.path.exists(fp):
        errs.append('brak pliku pełnego: %s' % name)
        continue
    if not os.path.exists(tp):
        errs.append('brak miniatury: %s' % name)
        continue
    fw, fh = Image.open(fp).size
    if (fw, fh) != (int(w), int(h)):
        errs.append('%s: width/height w HTML %sx%s != plik %dx%d' % (name, w, h, fw, fh))
    tw, th = Image.open(tp).size
    # miniatura musi mieć te same proporcje co pełny plik (tolerancja 1 px zaokrąglenia)
    if abs(fw / fh - tw / th) > 0.02:
        errs.append('%s: proporcje miniatury (%.3f) != pełnego (%.3f)' % (name, tw / th, fw / fh))

# --- linki data-front/data-back ---
for attr, suf in (('data-front', '-a.jpg'), ('data-back', '-b.jpg')):
    for p in re.findall(r'%s="\.\./\.\./assets/kolekcja/img_jaroslaw/([^"]+)"' % attr, html):
        if not p.endswith(suf):
            errs.append('%s wskazuje na %s' % (attr, p))
        if not os.path.exists(os.path.join(FULL, p)):
            errs.append('brak pliku %s' % p)

# --- karty jednostronne: bez data-back, bez przycisku odwracania ---
one = {r['sygnatura'].replace(':', '-').lower() for r in pc if r['skany'] == 1}
two = {r['sygnatura'].replace(':', '-').lower() for r in pc if r['skany'] == 2}
print('kart jednostronnych wg katalogu:', sorted(one))
for m in re.finditer(r'<article class="pc" data-id="([^"]+)".*?</article>', html, re.S):
    sid, body = m.group(1), m.group(0)
    has_back = 'data-back=' in body
    has_flip = 'class="pc-flip"' in body
    has_note = 'pc-oneside' in body
    if sid in one:
        if has_back:
            errs.append('%s: karta bez rewersu ma data-back' % sid)
        if has_flip:
            errs.append('%s: karta bez rewersu ma przycisk odwracania' % sid)
        if not has_note:
            errs.append('%s: karta bez rewersu bez adnotacji „tylko awers”' % sid)
        if 'pc-face-back' in body:
            errs.append('%s: karta bez rewersu ma drugą ścianę' % sid)
    elif sid in two:
        if not has_back:
            errs.append('%s: karta dwustronna bez data-back' % sid)
        if not has_flip:
            errs.append('%s: karta dwustronna bez przycisku odwracania' % sid)
        if has_note:
            errs.append('%s: karta dwustronna z adnotacją „tylko awers”' % sid)

# --- app.js musi być odporny na brak rewersu ---
appjs = open(os.path.join(ROOT, 'kolekcja', 'jaroslaw', 'js', 'app.js')).read()
if 'hasBack' not in appjs:
    errs.append('app.js bez zabezpieczenia lightboxa na brak data-back')

# --- zasady stałe ---
if re.search(r'object-fit\s*:\s*cover', css):
    errs.append('CSS zawiera object-fit: cover')
if 'noindex' not in html:
    errs.append('brak <meta name="robots" content="noindex">')
for href in ('href="../"', 'href="../warszawa/"', 'href="../przemysl/"'):
    if href not in html:
        errs.append('brak linku krzyżowego %s' % href)

print('unikalnych motywów:', len(cats), '| epok:', len(eras))
for e in errs:
    print('BŁĄD:', e)
print('WYNIK:', 'OK' if not errs else '%d błędów' % len(errs))
sys.exit(1 if errs else 0)
