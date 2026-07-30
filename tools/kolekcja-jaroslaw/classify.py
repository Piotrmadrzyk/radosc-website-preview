# -*- coding: utf-8 -*-
"""Przypisanie każdej z 58 pozycji jarosławskich do jednego motywu i jednej epoki.

Epoka = data WYDANIA (nakładu) karty wg katalogu, nie data stempla obiegu
i nie moment wykonania zdjęcia. Gdy katalog podaje przedział przechodzący
przez granicę epok (np. „ok. 1910–1916”), bierzemy DOLNĄ granicę — inaczej
karta wędrowałaby do epoki, której katalog nie potwierdza.

Piąta epoka, `enn`, istnieje dlatego, że przy trzech pozycjach katalog nie daje
ŻADNEGO przechylenia — pisze samo „1 poł. XX w. — do zawężenia”. Wciśnięcie ich
do „do 1914” byłoby zmyśleniem precyzji, której katalog nie ma. Pozycje z wahaniem,
ale z wyraźnym przechyleniem („międzywojnie?”, „międzywojnie / 1 poł. XX w.”,
„lata 30. — do potwierdzenia”), idą tam, dokąd katalog się skłania, a niepewność
zostaje opisana w nocie.

Motyw `foto` zbiera trzynaście obiektów, które NIE SĄ pocztówkami: dwanaście odbitek
fotograficznych (straż pożarna, portrety atelierowe, pochody PRL) i jeden rysunek
(PT:6:13 — studium głowy konia). To jedyny podział, przy którym nie trzeba udawać,
że fotografia zakładowa i litografia nakładowa są tym samym rodzajem obiektu.
"""
import json, collections, os, sys

ROOT = '/home/user/radosc-website-preview'
PC = os.path.join(ROOT, '.work-jar', 'jar_pc.json')

THEMES = [
    ('ulice',     'Ulice'),
    ('rynek',     'Rynek i ratusz'),
    ('swiatynie', 'Kościoły i klasztory'),
    ('gmachy',    'Gmachy i dworzec'),
    ('foto',      'Fotografie i rysunek'),
]

ERAS = [
    ('e1914', 'do 1914'),
    ('e1918', '1914–1918'),
    ('e1939', 'międzywojnie'),
    ('epo',   'po 1939'),
    ('enn',   'datowanie nieustalone'),
]

T = {}   # sygnatura -> (motyw, epoka)


def put(sigs, theme, era):
    for s in sigs:
        s = s if ':' in str(s) else 'PT:2:%d' % s
        assert s not in T, 'duplikat ' + s
        T[s] = (theme, era)


# ---- ulice: Grunwaldzka, Kraszewskiego, Sobieskiego, Kościuszki, Grodzka,
#      Krakowska, Trzeciego Maja — trzon zbioru
put([13, 14, 15, 18, 24, 29, 31],                  'ulice', 'e1914')
put([1, 2, 3, 4, 7, 16, 19, 26, 27, 30, 33, 38, 79, 80], 'ulice', 'e1918')

# ---- Rynek (Ringplatz) i ratusz
put([9, 10],                                       'rynek', 'e1914')
put([5, 6, 11, 12, 17, 37],                        'rynek', 'e1918')

# ---- kościoły i klasztory
put([23, 25],                                      'swiatynie', 'e1914')
put([20],                                          'swiatynie', 'e1918')
put([35, 39],                                      'swiatynie', 'e1939')
put([36, 47],                                      'swiatynie', 'epo')
put([34, 41],                                      'swiatynie', 'enn')

# ---- gmachy publiczne, zamek, park, dworzec, panorama
put([8, 28],                                       'gmachy', 'e1914')
put([21, 22, 32, 42],                              'gmachy', 'e1918')
put([40],                                          'gmachy', 'e1939')

# ---- obiekty, które nie są pocztówkami: fotografie i jeden rysunek
put([53, 54],                                      'foto', 'e1914')
put([43, 44, 45, 46, 48, 51],                      'foto', 'e1939')
put([49, 50, 52, 55],                              'foto', 'epo')
put(['PT:6:13'],                                   'foto', 'enn')


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
        print('  %-10s %-24s %3d' % (k, lbl, ct[k]))
    print('  suma', sum(ct.values()))
    print('\nLATA')
    for k, lbl in ERAS:
        print('  %-7s %-24s %3d' % (k, lbl, ce[k]))
    print('  suma', sum(ce.values()))
    # żadna karta nie może wypaść poza zasięg filtrów
    bad = [s for s in sigs if T[s][0] not in dict(THEMES) or T[s][1] not in dict(ERAS)]
    print('\nPOZA ZASIĘGIEM FILTRÓW:', bad)
    # żadna etykieta filtra nie może być pusta
    empty = [k for k, _ in THEMES if not ct[k]] + [k for k, _ in ERAS if not ce[k]]
    print('PUSTE ETYKIETY FILTRÓW:', empty)
    pairs = collections.Counter(T[s] for s in sigs)
    print('par motyw×epoka z kartami:', len(pairs))
    sys.exit(1 if (miss or extra or bad or empty) else 0)
