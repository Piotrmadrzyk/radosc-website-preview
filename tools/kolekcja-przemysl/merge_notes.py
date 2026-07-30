# -*- coding: utf-8 -*-
"""Scala cząstkowe noty w tools/kolekcja-przemysl/noty.json i robi kontrolę GLOBALNĄ.

Podagenci piszący noty nie widzą się nawzajem — duplikaty tytułów i powtarzalne
początki zdań wychodzą dopiero tutaj.

    python3 merge_notes.py            # scal + sprawdź
    python3 merge_notes.py --check    # sprawdź gotowy noty.json
"""
import json, os, re, sys, collections

ROOT = '/home/user/radosc-website-preview'
WORK = os.path.join(ROOT, '.work-prz')
SRC = os.path.join(WORK, 'notes_out')
PC = os.path.join(WORK, 'prz_pc.json')
OUT = os.path.join(ROOT, 'tools', 'kolekcja-przemysl', 'noty.json')
FIXES = os.path.join(ROOT, 'tools', 'kolekcja-przemysl', 'noty_fixes.json')

BANNED = ['przepiękn', 'piękn', 'perełk', 'niesamowit', 'wspaniał', 'urokliw',
          'magiczn', 'klimatyczn', 'unikatow', 'wyjątkow', 'cudown', 'fascynuj',
          'prawdziwa gratka', 'skarb']
BAD_START = ('Pocztówka', 'Karta', 'Widok', 'Fotografia')
FIELDS = ('sygnatura', 'tytul', 'meta_wydawca', 'meta_data', 'sig_typ', 'nota')


def load():
    if '--check' in sys.argv:
        return json.load(open(OUT))
    notes = {}
    for i in range(1, 8):
        p = os.path.join(SRC, 'chunk%d.json' % i)
        for n in json.load(open(p)):
            assert n['sygnatura'] not in notes, 'duplikat sygnatury ' + n['sygnatura']
            notes[n['sygnatura']] = n
    # poprawki redakcyjne z kontroli globalnej (duplikaty tytułów, powtarzalne początki)
    if os.path.exists(FIXES):
        n_fix = 0
        for sig, patch in json.load(open(FIXES)).items():
            if sig.startswith('_'):
                continue
            assert sig in notes, 'poprawka do nieistniejącej sygnatury ' + sig
            for f, v in patch.items():
                assert f in FIELDS, 'poprawka do nieznanego pola ' + f
                notes[sig][f] = v
                n_fix += 1
        print('naniesionych poprawek redakcyjnych:', n_fix)
    order = [r['sygnatura'] for r in json.load(open(PC))]
    return [notes[s] for s in order if s in notes]


def main():
    order = [r['sygnatura'] for r in json.load(open(PC))]
    notes = load()
    errs, warns = [], []

    got = [n['sygnatura'] for n in notes]
    if got != order:
        errs.append('kolejność/komplet sygnatur się nie zgadza (%d z %d)' % (len(got), len(order)))
        for s in order:
            if s not in got:
                errs.append('  brak noty: %s' % s)

    for n in notes:
        s = n['sygnatura']
        for f in FIELDS:
            if not str(n.get(f) or '').strip():
                errs.append('%s: puste pole %s' % (s, f))
        t, nota = n.get('tytul', ''), n.get('nota', '')
        if 'Przemyśl' in t:
            errs.append('%s: „Przemyśl” w tytule — %r' % (s, t))
        if t.startswith(BAD_START):
            errs.append('%s: tytuł zaczyna się od zakazanego słowa — %r' % (s, t))
        w = len(t.split())
        if not 3 <= w <= 7:
            errs.append('%s: tytuł ma %d słów — %r' % (s, w, t))
        L = len(nota)
        if not 220 <= L <= 420:
            errs.append('%s: nota ma %d znaków' % (s, L))
        low = (t + ' ' + nota).lower()
        for b in BANNED:
            if b in low:
                errs.append('%s: zakazane słowo „%s”' % (s, b))
        if len(n.get('meta_wydawca', '')) > 48:
            warns.append('%s: długie meta_wydawca (%d)' % (s, len(n['meta_wydawca'])))
        if len(n.get('meta_data', '')) > 28:
            warns.append('%s: długie meta_data (%d)' % (s, len(n['meta_data'])))
        if len(n.get('sig_typ', '')) > 64:
            warns.append('%s: długi sig_typ (%d)' % (s, len(n['sig_typ'])))
        if nota.split()[:1] and t.split()[:1] and nota.split()[0].strip(',.').lower() == t.split()[0].lower():
            warns.append('%s: nota zaczyna się słowem z tytułu' % s)

    # --- kontrola globalna, której podagent nie mógł zrobić ---
    dupt = {k: v for k, v in collections.Counter(n['tytul'] for n in notes).items() if v > 1}
    if dupt:
        errs.append('duplikaty tytułów: %s' % dupt)

    first = collections.Counter(n['nota'].split()[0].strip(',.').lower() for n in notes)
    hot = {k: v for k, v in first.items() if v > 4}
    if hot:
        warns.append('powtarzalne pierwsze słowo noty (>4): %s' % hot)

    first2 = collections.Counter(' '.join(n['nota'].split()[:2]).lower() for n in notes)
    hot2 = {k: v for k, v in first2.items() if v > 2}
    if hot2:
        warns.append('powtarzalny początek noty (>2): %s' % hot2)

    tfirst = collections.Counter(n['tytul'].split()[0].lower() for n in notes)
    hott = {k: v for k, v in tfirst.items() if v > 5}
    if hott:
        warns.append('powtarzalne pierwsze słowo tytułu (>5): %s' % hott)

    if '--check' not in sys.argv and not errs:
        json.dump(notes, open(OUT, 'w'), ensure_ascii=False, indent=1)
        print('zapisano', OUT)

    lens = [len(n['nota']) for n in notes]
    print('not:', len(notes), '| długość noty min/śr/max: %d / %d / %d' % (
        min(lens), sum(lens) // len(lens), max(lens)))
    for w in warns:
        print('uwaga:', w)
    for e in errs:
        print('BŁĄD:', e)
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
