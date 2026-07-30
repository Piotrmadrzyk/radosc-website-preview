# -*- coding: utf-8 -*-
"""Dekoduje base64 z wyników narzędzia Google Drive do plików .jpg.

Wynik `mcp__Google_Drive__download_file_content` nie mieści się w kontekście
i ląduje w pliku (narzędzie zgłasza to jako „błąd” przekroczenia limitu tokenów —
to jest oczekiwane). Ten skrypt czyta taki plik Z DYSKU DO DYSKU, bez wciągania
kilkunastu MB base64 do kontekstu.

Przypisanie do pliku docelowego idzie po polu "id" z JSON-a, NIE po kolejności
wywołań — przy równoległych pobraniach kolejność się nie zgadza.

    python3 decode.py <plik-wyniku.txt> [...]        # konkretne pliki
    python3 decode.py --scan <katalog-wyników>       # wszystkie nieprzetworzone
"""
import base64, json, os, sys, glob

ROOT = '/home/user/radosc-website-preview'
IDS = os.path.join(ROOT, '.work-jar', 'drive_ids.json')   # {"pt-2-1-a": "<driveId>"}
ORIG = os.path.join(ROOT, '.work-jar', 'orig')


def load_map():
    ids = json.load(open(IDS))
    return {v: k for k, v in ids.items()}          # driveId -> nazwa docelowa


def decode(path, by_id):
    try:
        d = json.load(open(path))
    except Exception as e:
        return None, 'nie-JSON (%s)' % e
    fid = d.get('id')
    stem = by_id.get(fid)
    if not stem:
        # awaryjnie: po tytule pliku na Dysku, np. "PT:1:7b.jpg"
        t = (d.get('title') or '').replace('.jpg', '')
        if t.startswith('PT:2:'):
            num = t[5:-1]
            stem = 'pt-2-%s-%s' % (num, t[-1])
    if not stem:
        return None, 'nieznane id %s / title %s' % (fid, d.get('title'))
    raw = base64.b64decode(d['content'])
    if raw[:2] != b'\xff\xd8':
        return None, '%s: to nie JPEG' % stem
    os.makedirs(ORIG, exist_ok=True)
    open(os.path.join(ORIG, stem + '.jpg'), 'wb').write(raw)
    return stem, None


def main(argv):
    by_id = load_map()
    if argv and argv[0] == '--scan':
        paths = sorted(glob.glob(os.path.join(argv[1], '*download_file_content*.txt')))
    else:
        paths = argv
    ok, err = 0, []
    for p in paths:
        stem, e = decode(p, by_id)
        if e:
            err.append('%s: %s' % (os.path.basename(p), e))
        else:
            ok += 1
    print('zdekodowano:', ok)
    for e in err:
        print('  BŁĄD', e)


if __name__ == '__main__':
    main(sys.argv[1:])
