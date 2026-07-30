# -*- coding: utf-8 -*-
"""Scala cząstkowe oceny orientacji w jeden rotations.json — i sprawdza scalenie.

PUŁAPKA, dla której ten skrypt istnieje: podagenci oceniający orientację robią
obowiązkowy drugi przebieg kontrolny i NADPISUJĄ swój plik JSON poprawkami.
Scalenie przed ostatnim raportem bierze wersje sprzed poprawek. Dlatego:
  1. uruchamiaj DOPIERO po ostatnim raporcie,
  2. skrypt po scaleniu jeszcze raz czyta pliki źródłowe i porównuje je z wynikiem
     (`--check`), więc rozjazd wyjdzie natychmiast.

    python3 merge_rotations.py           # scal i sprawdź
    python3 merge_rotations.py --check   # tylko sprawdź istniejący rotations.json
"""
import json, os, sys, glob, collections

ROOT = '/home/user/radosc-website-preview'
WORK = os.path.join(ROOT, '.work-jar')
SRC = os.path.join(WORK, 'rot_out')
OUT_WORK = os.path.join(WORK, 'rotations.json')
OUT_REPO = os.path.join(ROOT, 'tools', 'kolekcja-jaroslaw', 'rotations.json')

EXPECTED = json.load(open(os.path.join(WORK, 'expected.json')))   # 115 nazw, w tym pt-2-51 bez rewersu
VALID = {0, 90, 180, 270}


def load_parts():
    parts = {}
    for p in sorted(glob.glob(os.path.join(SRC, '*.json'))):
        parts[os.path.basename(p)] = json.load(open(p))
    return parts


def merge(parts):
    merged, owner, clash = {}, {}, []
    for fname, d in parts.items():
        for k, v in d.items():
            if k in merged and merged[k] != int(v):
                clash.append((k, owner[k], merged[k], fname, int(v)))
            merged[k] = int(v)
            owner[k] = fname
    return merged, clash


def check(merged, parts):
    errs = []
    miss = [k for k in EXPECTED if k not in merged]
    extra = [k for k in merged if k not in EXPECTED]
    if miss:
        errs.append('brak ocen: %s' % miss)
    if extra:
        errs.append('nazwy spoza zbioru: %s' % extra)
    bad = {k: v for k, v in merged.items() if v not in VALID}
    if bad:
        errs.append('wartości spoza {0,90,180,270}: %s' % bad)
    # ponowne porównanie z plikami źródłowymi — łapie scalenie sprzed poprawek
    for fname, d in parts.items():
        for k, v in d.items():
            if merged.get(k) != int(v):
                errs.append('ROZJAZD %s: %s ma %s, scalone ma %s' % (fname, k, v, merged.get(k)))
    return errs


def main():
    parts = load_parts()
    print('plików cząstkowych:', len(parts), '| ocen łącznie:', sum(len(d) for d in parts.values()))
    if '--check' in sys.argv:
        merged = json.load(open(OUT_WORK))
    else:
        merged, clash = merge(parts)
        for c in clash:
            print('  KOLIZJA', c)
        json.dump(merged, open(OUT_WORK, 'w'), ensure_ascii=False, indent=0, sort_keys=True)
        json.dump(merged, open(OUT_REPO, 'w'), ensure_ascii=False, indent=0, sort_keys=True)
    errs = check(merged, parts)
    dist = collections.Counter(merged.values())
    print('ocen:', len(merged), '| rozkład:', dict(sorted(dist.items())))
    print('wymaga obrotu:', sum(v for k, v in dist.items() if k), '/', len(merged))
    if errs:
        for e in errs:
            print('BŁĄD:', e)
        sys.exit(1)
    print('OK — scalenie zgodne z plikami źródłowymi.')


if __name__ == '__main__':
    main()
