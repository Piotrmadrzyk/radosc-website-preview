# -*- coding: utf-8 -*-
"""Małe podglądy do oceny orientacji przez podagentów.
Bierze aktualny stan (orig + rotations.json), skaluje do 460 px dłuższego boku."""
import json, os, sys
from PIL import Image, ImageOps

ROOT = '/home/user/radosc-website-preview'
ORIG = os.path.join(ROOT, '.work', 'orig')
ROT = os.path.join(ROOT, '.work', 'rotations.json')
OUT = os.path.join(ROOT, '.work', 'review')
BOX = 460

rot = json.load(open(ROT)) if os.path.exists(ROT) else {}
os.makedirs(OUT, exist_ok=True)
only = set(sys.argv[1:]) or None
n = 0
for name in sorted(os.listdir(ORIG)):
    if not name.lower().endswith('.jpg'):
        continue
    stem = name[:-4]
    if only and stem not in only:
        continue
    im = ImageOps.exif_transpose(Image.open(os.path.join(ORIG, name)))
    cw = int(rot.get(stem, 0)) % 360
    if cw:
        im = im.rotate(-cw, expand=True)
    w, h = im.size
    s = BOX / float(max(w, h))
    if s < 1:
        im = im.resize((int(w * s), int(h * s)), Image.LANCZOS)
    im.convert('RGB').save(os.path.join(OUT, name), 'JPEG', quality=72, optimize=True)
    n += 1
print('podglądy:', n)
