# -*- coding: utf-8 -*-
"""Arkusze stykowe 5x4 z podpisaną sygnaturą — do końcowej kontroli orientacji.
Bierze GOTOWE pliki wynikowe (assets/kolekcja/img_przemysl), czyli to, co zobaczy
odbiorca strony."""
import os, math
from PIL import Image, ImageDraw, ImageFont

ROOT = '/home/user/radosc-website-preview'
SRC = os.path.join(ROOT, 'assets', 'kolekcja', 'img_przemysl')
OUT = os.path.join(ROOT, '.work-prz', 'sheets')

COLS, ROWS = 5, 4
CELL_W, CELL_H = 236, 250
LABEL_H = 22
PAD = 10
BG = (18, 24, 33)
CELL_BG = (12, 16, 23)
FG = (232, 232, 232)

def font(sz):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
              '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()

def key(name):
    p = name[:-4].split('-')
    return (int(p[1]), int(p[2]), p[3])

def main():
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        os.remove(os.path.join(OUT, f))
    names = sorted((n for n in os.listdir(SRC) if n.endswith('.jpg')), key=key)
    per = COLS * ROWS
    sheets = math.ceil(len(names) / per)
    fnt = font(13)
    hdr = font(15)
    for s in range(sheets):
        batch = names[s * per:(s + 1) * per]
        W = PAD + COLS * (CELL_W + PAD)
        H = PAD + 26 + ROWS * (CELL_H + LABEL_H + PAD)
        sheet = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(sheet)
        d.text((PAD, PAD), 'arkusz %d/%d  —  %s … %s' % (s + 1, sheets, batch[0][:-4], batch[-1][:-4]),
               font=hdr, fill=(147, 188, 171))
        for i, n in enumerate(batch):
            c, r = i % COLS, i // COLS
            x = PAD + c * (CELL_W + PAD)
            y = PAD + 26 + r * (CELL_H + LABEL_H + PAD)
            d.rectangle([x, y, x + CELL_W, y + CELL_H], fill=CELL_BG)
            im = Image.open(os.path.join(SRC, n))
            im.thumbnail((CELL_W - 8, CELL_H - 8), Image.LANCZOS)
            sheet.paste(im, (x + (CELL_W - im.width) // 2, y + (CELL_H - im.height) // 2))
            d.text((x + 2, y + CELL_H + 4), n[:-4], font=fnt, fill=FG)
        sheet.save(os.path.join(OUT, 'sheet-%02d.jpg' % (s + 1)), 'JPEG', quality=82)
    print('arkuszy:', sheets, '| obrazów:', len(names))

if __name__ == '__main__':
    main()
