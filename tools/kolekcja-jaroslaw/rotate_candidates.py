# -*- coding: utf-8 -*-
"""Podgląd wariantów obrotu dla jednego skanu.
   python3 rotate_candidates.py pt-1-9-b        -> .work-jar/cand/pt-1-9-b_{90,180,270}.jpg
   Stopnie liczone ZGODNIE Z RUCHEM WSKAZÓWEK ZEGARA."""
import os, sys
from PIL import Image, ImageOps
ROOT='/home/user/radosc-website-preview/.work-jar'
stem=sys.argv[1].replace('.jpg','')
degs=[int(a) for a in sys.argv[2:]] or [90,180,270]
os.makedirs(ROOT+'/cand', exist_ok=True)
im=ImageOps.exif_transpose(Image.open(f'{ROOT}/orig/{stem}.jpg'))
for d in degs:
    r=im.rotate(-d, expand=True)
    w,h=r.size; s=560.0/max(w,h)
    r.resize((int(w*s),int(h*s))).convert('RGB').save(f'{ROOT}/cand/{stem}_{d}.jpg','JPEG',quality=76)
    print(f'{ROOT}/cand/{stem}_{d}.jpg')
