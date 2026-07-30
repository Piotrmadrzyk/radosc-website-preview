# -*- coding: utf-8 -*-
"""Wyciąga z arkusza „Katalog” rekordy przemyskiej serii PT:1 do prz_pc.json.

FILTR IDZIE PO KOLUMNIE `miasto` = „Przemyśl”, nie po `folder_źródłowy`:
kolumna folderu ma dwa warianty zapisu różniące się normalizacją Unicode
(`ś` jako U+015B vs `s` + U+0301), więc grupowanie po folderze rozjeżdża się
na 62 + 42. Po `miasto` wszystkie 143 rekordy są w jednej formie.

Ze 143 przemyskich rekordów bierzemy tylko serię PT:1 (104 pocztówki).
Seria DZF:4 („Przemyśl Henner”, 39 pozycji) to fotografie z zakładu — pomijamy.

    python3 extract_catalog.py <plik.xlsx>
"""
import json, os, sys, collections, re
import openpyxl

ROOT = '/home/user/radosc-website-preview'
OUT_WORK = os.path.join(ROOT, '.work-prz', 'prz_pc.json')
OUT_REPO = os.path.join(ROOT, 'tools', 'kolekcja-przemysl', 'prz_pc.json')

COLS = [('sygnatura', 'sygnatura'), ('tytul_katalogowy', 'tytuł_PL'),
        ('nakladca_fotograf', 'fotograf/nakładca'), ('obiekt', 'obiekt'),
        ('datowanie', 'datowanie'), ('typ', 'typ'), ('stan', 'stan'),
        ('uwagi_katalogu', 'opis_PL'), ('slowa_kluczowe', 'słowa_kluczowe'),
        ('skany', 'skany')]


def main(path):
    ws = openpyxl.load_workbook(path, data_only=True)['Katalog']
    hdr = [c.value for c in ws[1]]
    rows = [dict(zip(hdr, r)) for r in ws.iter_rows(min_row=2, values_only=True) if any(r)]
    print('wierszy w arkuszu:', len(rows))

    prz = [r for r in rows if str(r['miasto']).strip() == 'Przemyśl']
    print('miasto = Przemyśl:', len(prz),
          '| serie:', collections.Counter(re.match(r'([A-Z]+:\d+)', r['sygnatura']).group(1) for r in prz))

    pt = [r for r in prz if r['sygnatura'].startswith('PT:1:')]
    pt.sort(key=lambda r: int(r['sygnatura'].split(':')[2]))

    nums = [int(r['sygnatura'].split(':')[2]) for r in pt]
    gaps = [n for n in range(1, max(nums) + 1) if n not in nums]
    dups = [n for n, c in collections.Counter(nums).items() if c > 1]
    scans = collections.Counter(r['skany'] for r in pt)
    stray = [r['sygnatura'] for r in rows
             if r['sygnatura'].startswith('PT:1:') and str(r['miasto']).strip() != 'Przemyśl']

    print('PT:1:', len(pt), '| zakres %d–%d' % (min(nums), max(nums)),
          '| luki:', gaps, '| duplikaty:', dups)
    print('skanów na kartę:', dict(scans), '| suma skanów:', sum(r['skany'] for r in pt))
    print('PT:1 spoza Przemyśla:', stray)
    assert not gaps and not dups and not stray and set(scans) == {2}

    out = [{k: r[c] for k, c in COLS} for r in pt]
    for p in (OUT_WORK, OUT_REPO):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        json.dump(out, open(p, 'w'), ensure_ascii=False, indent=1)
    print('zapisano', len(out), 'rekordów')


if __name__ == '__main__':
    main(sys.argv[1])
