# -*- coding: utf-8 -*-
"""Przypisanie każdej z 147 kart warszawskich do jednego motywu i jednej epoki.
Epoka = data WYDANIA karty wg katalogu (datowniki obiegu opisujemy w nocie, nie w filtrze)."""
import json, re, collections, sys

S = '/tmp/claude-0/-home-user-radosc-website-preview/2284476a-e7d4-59c3-b790-803821162acf/scratchpad/'

THEMES = [
    ('przed',   'Miasto sprzed 1939'),
    ('wojna',   'Wojna i ruiny'),
    ('wz',      'Trasa W-Z'),
    ('osiedla', 'Mariensztat i osiedla'),
    ('mdm',     'MDM i nowe śródmieście'),
    ('zabytki', 'Zabytki odbudowane'),
    ('gmachy',  'Gmachy, ulice, mosty'),
    ('zycie',   'Parki, Wisła, życie miasta'),
    ('pamiec',  'Pomniki i pamięć'),
]

ERAS = [
    ('e1918', 'do 1918'),
    ('e1939', '1918–1939'),
    ('e1945', '1939–1945'),
    ('e1948', '1945–1948'),
    ('e1950', '1949–1950'),
    ('e50',   'lata 50. i później'),
]

T = {}   # sygnatura -> (motyw, epoka)

def put(sigs, theme, era):
    for s in sigs:
        assert s not in T, 'duplikat ' + s
        T[s] = (theme, era)

def pt7(*ns): return ['PT:7:%d' % n for n in ns]
def pt8(*ns): return ['PT:8:%d' % n for n in ns]

# ---- PT:5 ----
put(['PT:5:39'], 'przed', 'e1918')

# ---- seria KiW „Odbudowa Warszawy" i pokrewne, ~1949–1950 ----
put(pt7(3, 5, 6, 7, 8, 10, 18, 21, 27, 34, 57, 58, 60, 63, 71),        'wz',      'e1950')
put(pt8(28, 36, 38),                                                    'wz',      'e1950')
put(pt7(17, 20, 24, 62, 64, 69, 74, 75, 77),                            'osiedla', 'e1950')
put(pt8(27, 31),                                                        'osiedla', 'e1950')
put(pt7(31, 33, 53, 55, 65, 66, 67, 68, 78),                            'zabytki', 'e1950')
put(pt7(13),                                                            'zabytki', 'e50')
put(pt7(15),                                                            'zabytki', 'e50')
put(pt7(1, 2, 4, 11, 19, 22, 23, 26, 28, 56, 59, 73, 76, 79, 80,
        81, 82, 83),                                                    'gmachy',  'e1950')
put(pt8(10, 32, 33, 34),                                                'gmachy',  'e1950')
put(pt7(16),                                                            'gmachy',  'e50')
put(pt7(9, 12, 29, 30, 36, 54, 61, 70, 72),                             'zycie',   'e1950')
put(pt8(25),                                                            'zycie',   'e1950')
put(pt7(25),                                                            'pamiec',  'e1950')
put(pt7(14),                                                            'pamiec',  'e50')
put(pt8(35),                                                            'pamiec',  'e1950')
put(pt7(35, 51, 52),                                                    'pamiec',  'e50')
put(pt7(39, 40),                                                        'pamiec',  'e50')

# ---- MDM / socrealizm, SIW „Kraj" 1952 i wyd. „Sztuka" ----
put(pt7(32, 38, 41, 42, 44, 45, 46, 47),                                'mdm',     'e50')
put(pt7(37),                                                            'osiedla', 'e50')
put(pt7(50),                                                            'zabytki', 'e50')
put(pt8(39, 40),                                                        'zabytki', 'e50')

# ---- widoki przedwojenne (edycja powojenna) ----
put(pt7(43),                                                            'przed',   'e1950')

# ---- PT:8 — miasto sprzed 1939 ----
put(pt8(13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 30, 37, 50),        'przed',   'e1918')
put(pt8(3),                                                             'przed',   'e1918')
put(pt7(48, 49),                                                        'przed',   'e1939')
put(pt8(22, 29, 45),                                                    'przed',   'e1939')
put(pt8(55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65),                    'przed',   'e1939')
put(pt8(26),                                                            'przed',   'e1945')

# ---- wojna i ruiny ----
put(pt8(51, 52, 53, 54),                                                'wojna',   'e1945')
put(pt8(1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 41, 42, 43, 44, 46),            'wojna',   'e1948')
put(pt8(49),                                                            'wojna',   'e50')

# ---------------------------------------------------------------
if __name__ == '__main__':
    pc = json.load(open(S + 'war_pc.json'))
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
        print('  %-9s %-28s %3d' % (k, lbl, ct[k]))
    print('  suma', sum(ct.values()))
    print('\nLATA')
    for k, lbl in ERAS:
        print('  %-7s %-20s %3d' % (k, lbl, ce[k]))
    print('  suma', sum(ce.values()))
