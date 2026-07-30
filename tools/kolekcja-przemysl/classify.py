# -*- coding: utf-8 -*-
"""Przypisanie każdej ze 104 kart przemyskich do jednego motywu i jednej epoki.

Epoka = data WYDANIA (nakładu) karty wg katalogu, nie data stempla obiegu
i nie moment wykonania zdjęcia. Gdy katalog podaje przedział przechodzący
przez granicę epok (np. „ok. 1910–1918”), bierzemy DOLNĄ granicę — inaczej
karta wędrowałaby do epoki, której katalog nie potwierdza.
"""
import json, collections, os, sys

ROOT = '/home/user/radosc-website-preview'
PC = os.path.join(ROOT, '.work-prz', 'prz_pc.json')

THEMES = [
    ('grussaus', '„Gruss aus” i wielowidokowe'),
    ('ulice',    'Ulice i place'),
    ('san',      'San, Zasanie, panoramy'),
    ('mosty',    'Mosty na Sanie'),
    ('twierdza', 'Twierdza i forty'),
    ('wojna',    'Wojsko i poczta polowa'),
    ('gmachy',   'Zamek i gmachy'),
]

ERAS = [
    ('e1905', 'do 1905'),
    ('e1914', '1905–1914'),
    ('e1918', 'I wojna 1914–1918'),
    ('e1939', 'międzywojnie'),
    ('epo',   'po 1939'),
]

T = {}   # sygnatura -> (motyw, epoka)


def put(ns, theme, era):
    for n in ns:
        s = 'PT:1:%d' % n
        assert s not in T, 'duplikat ' + s
        T[s] = (theme, era)


# ---- „Gruss aus” i karty wielowidokowe ----
put([9, 10, 11, 13, 15, 16, 17, 18, 19, 37, 56, 81, 100], 'grussaus', 'e1905')
put([73],                                                  'grussaus', 'e1939')

# ---- ulice i place ----
put([54],                                                  'ulice', 'e1905')
put([32, 49, 76, 79, 84, 85, 89],                          'ulice', 'e1914')
put([12, 41, 46, 52, 60, 66, 67, 93, 104],                 'ulice', 'e1918')
put([23, 30, 38, 42, 59, 61, 65, 69, 70, 71, 86, 101],     'ulice', 'e1939')
put([57],                                                  'ulice', 'epo')

# ---- San, Zasanie, panoramy, wybrzeża ----
put([20, 26, 51, 58, 72],                                  'san', 'e1914')
put([43, 53, 55, 75, 94, 99],                              'san', 'e1918')
put([21, 24, 44, 64, 77, 87],                              'san', 'e1939')

# ---- mosty na Sanie ----
put([7, 8, 27, 31, 34, 36, 47, 78, 92, 98],                'mosty', 'e1918')
put([6, 14],                                               'mosty', 'e1939')
put([3],                                                   'mosty', 'epo')

# ---- Twierdza Przemyśl i forty ----
put([1, 2, 28, 29, 74, 91, 95, 96, 102],                   'twierdza', 'e1918')

# ---- wojsko, front, poczta polowa, karty patriotyczne ----
put([4, 5, 22, 33, 35, 39, 50, 63, 68, 82, 83, 90, 97, 103], 'wojna', 'e1918')

# ---- zamek, gmachy, instytucje ----
put([40, 45, 48, 88],                                      'gmachy', 'e1914')
put([62],                                                  'gmachy', 'e1939')
put([25, 80],                                              'gmachy', 'epo')


if __name__ == '__main__':
    pc = json.load(open(PC))
    sigs = [r['sygnatura'] for r in pc]
    miss = [s for s in sigs if s not in T]
    extra = [s for s in T if s not in sigs]
    print('kart w katalogu:', len(sigs), '| przypisanych:', len(T))
    print('BEZ PRZYPISANIA:', miss)
    print('NADMIAROWE:', extra)
    ct = collections.Counter(T[s][0] for s in sigs)
    ce = collections.Counter(T[s][1] for s in sigs)
    print('\nMOTYW')
    for k, lbl in THEMES:
        print('  %-9s %-36s %3d' % (k, lbl, ct[k]))
    print('  suma', sum(ct.values()))
    print('\nLATA')
    for k, lbl in ERAS:
        print('  %-7s %-22s %3d' % (k, lbl, ce[k]))
    print('  suma', sum(ce.values()))
    # żadna karta nie może wypaść poza zasięg filtrów
    bad = [s for s in sigs if T[s][0] not in dict(THEMES) or T[s][1] not in dict(ERAS)]
    print('\nPOZA ZASIĘGIEM FILTRÓW:', bad)
    # każda para (motyw, epoka) obecna w danych musi dać niepusty wynik
    pairs = collections.Counter(T[s] for s in sigs)
    print('par motyw×epoka z kartami:', len(pairs))
    sys.exit(1 if (miss or extra or bad) else 0)
