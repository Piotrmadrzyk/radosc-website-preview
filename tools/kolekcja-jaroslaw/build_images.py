# -*- coding: utf-8 -*-
"""Generuje pliki wynikowe galerii z NIEOBRÓCONYCH oryginałów w .work-jar/orig.

Idempotentny z definicji: źródłem jest zawsze nietknięta migawka .work-jar/orig,
a obrót brany jest z rotations.json. Dwukrotne uruchomienie daje ten sam wynik.

rotations.json: { "pt-2-9-a": 90, ... } — stopnie ZGODNIE Z RUCHEM WSKAZÓWEK ZEGARA,
o które trzeba obrócić oryginał, żeby stanął poprawnie. Brak wpisu = 0.
"""
import json, os, sys
from PIL import Image, ImageOps

ROOT = '/home/user/radosc-website-preview'
ORIG = os.path.join(ROOT, '.work-jar', 'orig')
ROT = os.path.join(ROOT, '.work-jar', 'rotations.json')
FULL = os.path.join(ROOT, 'assets', 'kolekcja', 'img_jaroslaw')
THUMB = os.path.join(ROOT, 'assets', 'kolekcja', 'thumbs_jaroslaw')

FULL_MAX, FULL_Q = 1700, 86
THUMB_MAX, THUMB_Q = 560, 80


def fit(im, box):
    w, h = im.size
    s = min(1.0, box / float(max(w, h)))
    if s >= 1.0:
        return im
    return im.resize((max(1, int(round(w * s))), max(1, int(round(h * s)))), Image.LANCZOS)


def main(only=None):
    rot = json.load(open(ROT)) if os.path.exists(ROT) else {}
    os.makedirs(FULL, exist_ok=True)
    os.makedirs(THUMB, exist_ok=True)
    names = sorted(n for n in os.listdir(ORIG) if n.lower().endswith('.jpg'))
    n_rot = 0
    for name in names:
        stem = name[:-4]
        if only and stem not in only:
            continue
        im = Image.open(os.path.join(ORIG, name))
        im = ImageOps.exif_transpose(im)
        cw = int(rot.get(stem, 0)) % 360
        if cw:
            im = im.rotate(-cw, expand=True)
            n_rot += 1
        if im.mode != 'RGB':
            im = im.convert('RGB')
        fit(im, FULL_MAX).save(os.path.join(FULL, name), 'JPEG',
                               quality=FULL_Q, optimize=True, progressive=True)
        fit(im, THUMB_MAX).save(os.path.join(THUMB, name), 'JPEG',
                                quality=THUMB_Q, optimize=True, progressive=True)
    print('wygenerowano:', len([n for n in names if not only or n[:-4] in only]),
          '| z obrotem:', n_rot)


if __name__ == '__main__':
    main(set(sys.argv[1:]) or None)
