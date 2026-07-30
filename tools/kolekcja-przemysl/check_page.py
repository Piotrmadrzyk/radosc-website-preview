# -*- coding: utf-8 -*-
"""Kontrola gotowego kolekcja/przemysl/index.html — statycznie, bez przeglądarki.

Sprawdza: liczbę kart wobec katalogu, komplet i istnienie skanów, zgodność
atrybutów width/height z plikami, pokrycie filtrów (żadna karta nie może wypaść
poza zasięg), zgodność liczników w indeksie, brak `object-fit: cover`.
"""
import json, os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from classify import T, THEMES, ERAS
from PIL import Image

ROOT = '/home/user/radosc-website-preview'
PAGE = os.path.join(ROOT, 'kolekcja', 'przemysl', 'index.html')
CSS = os.path.join(ROOT, 'kolekcja', 'przemysl', 'css', 'style.css')
FULL = os.path.join(ROOT, 'assets', 'kolekcja', 'img_przemysl')
THUMB = os.path.join(ROOT, 'assets', 'kolekcja', 'thumbs_przemysl')
PC = os.path.join(ROOT, '.work-prz', 'prz_pc.json')

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
imgs = re.findall(r'src="\.\./\.\./assets/kolekcja/thumbs_przemysl/([^"]+)"[^>]*?'
                  r'width="(\d+)" height="(\d+)"', html)
print('obrazów w siatce:', len(imgs))
if len(imgs) != 2 * len(pc):
    errs.append('obrazów w siatce %d, oczekiwano %d' % (len(imgs), 2 * len(pc)))
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
    for p in re.findall(r'%s="\.\./\.\./assets/kolekcja/img_przemysl/([^"]+)"' % attr, html):
        if not p.endswith(suf):
            errs.append('%s wskazuje na %s' % (attr, p))
        if not os.path.exists(os.path.join(FULL, p)):
            errs.append('brak pliku %s' % p)

# --- zasady stałe ---
if re.search(r'object-fit\s*:\s*cover', css):
    errs.append('CSS zawiera object-fit: cover')
if 'noindex' not in html:
    errs.append('brak <meta name="robots" content="noindex">')
for href in ('href="../"', 'href="../warszawa/"'):
    if href not in html:
        errs.append('brak linku krzyżowego %s' % href)

print('unikalnych motywów:', len(cats), '| epok:', len(eras))
for e in errs:
    print('BŁĄD:', e)
print('WYNIK:', 'OK' if not errs else '%d błędów' % len(errs))
sys.exit(1 if errs else 0)
