# -*- coding: utf-8 -*-
"""Kontrola strony w przeglądarce (Chromium przez Playwright).

Sprawdza: błędy konsoli, filtry (każdy motyw i każda epoka, z licznikami),
powiększenie + odwracanie + nawigację, KARTĘ JEDNOSTRONNĄ, wejście z adresu
#sygnatura, brak poziomego scrolla na 390 px oraz — najważniejsze — czy żaden
obraz nie jest zniekształcony ani przycięty.

Dwie rzeczy, na których łatwo się przejechać, i dlatego są tu zrobione wprost:

1. PROPORCJE liczy się na CONTENT-BOX. Passe-partout to padding, a przy
   box-sizing: border-box getBoundingClientRect zwraca border-box — pomiar bez
   odjęcia paddingu pokazuje zniekształcenie tam, gdzie go nie ma. Obrys robi
   `outline`, więc do pomiaru nie wchodzi.

2. Obrazy mają loading="lazy", więc pomiar bez wymuszenia ładowania obejmie
   tylko część siatki i BĘDZIE WYGLĄDAŁ NA KOMPLET. Dlatego przed pomiarem
   wszystkim obrazom ustawiamy loading="eager", czekamy na `complete` każdego
   z nich i dopiero wtedy mierzymy — a na koniec sprawdzamy, czy zmierzona
   liczba zgadza się z liczbą skanów w katalogu.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

ROOT = '/home/user/radosc-website-preview'
URL = 'file://' + os.path.join(ROOT, 'kolekcja', 'jaroslaw', 'index.html')
SHOT = os.path.join(ROOT, '.work-jar', 'shots')
CHROME = '/opt/pw-browsers/chromium'

PC = json.load(open(os.path.join(ROOT, '.work-jar', 'jar_pc.json')))
N_CARDS = len(PC)
N_SCANS = sum(r['skany'] for r in PC)
ONE_SIDED = [r['sygnatura'].replace(':', '-').lower() for r in PC if r['skany'] == 1]

# wymuszenie ładowania wszystkich obrazów siatki, zanim cokolwiek zmierzymy
EAGER_JS = """async () => {
  const imgs = [...document.querySelectorAll('.pc-face img')];
  imgs.forEach(i => { i.loading = 'eager'; i.removeAttribute('loading'); });
  await Promise.all(imgs.map(i => i.complete && i.naturalWidth
    ? Promise.resolve()
    : new Promise(res => { i.addEventListener('load', res, {once:true});
                           i.addEventListener('error', res, {once:true}); })));
  return imgs.length;
}"""

ASPECT_JS = """(sel) => {
  const out = [];
  document.querySelectorAll(sel).forEach(img => {
    if (!img.naturalWidth) return;
    const cs = getComputedStyle(img);
    const r = img.getBoundingClientRect();
    // content-box = border-box minus padding (obrys robi outline, więc nie liczy się)
    const px = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const py = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const cw = r.width - px, ch = r.height - py;
    if (cw <= 1 || ch <= 1) return;
    out.push({
      src: img.getAttribute('src').split('/').pop(),
      natural: img.naturalWidth / img.naturalHeight,
      shown: cw / ch,
      objectFit: cs.objectFit
    });
  });
  return out;
}"""


def check_aspect(data, errs, label):
    for d in data:
        if d['objectFit'] == 'cover':
            errs.append('%s %s: object-fit: cover' % (label, d['src']))
        if abs(d['natural'] - d['shown']) / d['natural'] > 0.02:
            errs.append('%s %s: proporcje %.3f zamiast %.3f (zniekształcenie)'
                        % (label, d['src'], d['shown'], d['natural']))


def main():
    os.makedirs(SHOT, exist_ok=True)
    errs, notes = [], []
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=CHROME)
        ctx = br.new_context(viewport={'width': 1440, 'height': 1000},
                             device_scale_factor=1)
        page = ctx.new_page()
        console = []
        page.on('console', lambda m: console.append((m.type, m.text)))
        page.on('pageerror', lambda e: console.append(('pageerror', str(e))))
        page.goto(URL, wait_until='load')
        page.wait_for_timeout(500)

        n = page.locator('.pc').count()
        notes.append('kart w DOM: %d (katalog: %d)' % (n, N_CARDS))
        if n != N_CARDS:
            errs.append('kart %d, oczekiwano %d' % (n, N_CARDS))

        # --- pasek filtrów nie może rosnąć w kilka linii na 1440 px ---
        # Wymóg jest o zawijanie, nie o samą wysokość: każdy wiersz indeksu ma
        # mieścić się w JEDNEJ linii na 1440 px. Liczymy odrębne pozycje pionowe
        # przycisków w wierszu — więcej niż jedna znaczy, że etykiety się zawinęły.
        bar = page.evaluate('''() => {
          const rows = [...document.querySelectorAll('.index-row')].map(row => ({
            label: (row.querySelector('.index-label') || {}).textContent || '?',
            h: Math.round(row.getBoundingClientRect().height),
            lines: new Set([...row.querySelectorAll('.ix')]
                     .map(b => Math.round(b.getBoundingClientRect().top))).size
          }));
          return {rows, h: Math.round(document.querySelector('.index').getBoundingClientRect().height)};
        }''')
        notes.append('pasek filtrów: %d px | %s' % (
            bar['h'], ', '.join('%s %d px/%d lin.' % (r['label'], r['h'], r['lines'])
                                for r in bar['rows'])))
        for r in bar['rows']:
            if r['lines'] > 1:
                errs.append('wiersz „%s” zawija się na %d linie przy 1440 px — '
                            'skróć etykiety' % (r['label'], r['lines']))

        # --- filtry ---
        cats = page.eval_on_selector_all('.ix[data-cat]', 'els => els.map(e => e.dataset.cat)')
        eras = page.eval_on_selector_all('.ix[data-era]', 'els => els.map(e => e.dataset.era)')
        for key, keys in (('cat', cats), ('era', eras)):
            seen = set()
            for k in keys:
                page.click('.ix[data-%s="%s"]' % (key, k))
                page.wait_for_timeout(60)
                vis = page.eval_on_selector_all('.pc', 'els => els.filter(e => !e.hidden).length')
                sup = page.eval_on_selector('.ix[data-%s="%s"] sup' % (key, k), 'e => +e.textContent')
                if vis != sup:
                    errs.append('%s %s: widocznych %d, licznik %d' % (key, k, vis, sup))
                if vis == 0:
                    errs.append('%s %s: zero kart' % (key, k))
                if k != '*':
                    seen.update(page.eval_on_selector_all(
                        '.pc', 'els => els.filter(e=>!e.hidden).map(e=>e.dataset.id)'))
                notes.append('  %s %-9s -> %3d' % (key, k, vis))
            page.click('.ix[data-%s="*"]' % key)
            page.wait_for_timeout(60)
            if len(seen) != N_CARDS:
                errs.append('filtr %s nie pokrywa wszystkich kart: %d z %d'
                            % (key, len(seen), N_CARDS))

        # przycisk „Wyczyść”
        page.click('.ix[data-cat="ulice"]')
        if page.locator('#ix-reset').is_hidden():
            errs.append('przycisk „Wyczyść” ukryty mimo aktywnego filtra')
        page.click('#ix-reset')
        page.wait_for_timeout(80)
        if page.eval_on_selector_all('.pc', 'e => e.filter(x=>!x.hidden).length') != N_CARDS:
            errs.append('„Wyczyść” nie przywraca pełnego zestawu')

        # --- proporcje w siatce: NAJPIERW wymuś załadowanie wszystkiego ---
        loaded = page.evaluate(EAGER_JS)
        page.wait_for_timeout(400)
        data = page.evaluate(ASPECT_JS, '.pc-face img')
        notes.append('obrazów w siatce: %d wymuszonych, %d zmierzonych (katalog: %d skanów)'
                     % (loaded, len(data), N_SCANS))
        if len(data) != N_SCANS:
            errs.append('zmierzono %d obrazów, a skanów jest %d — pomiar niekompletny'
                        % (len(data), N_SCANS))
        check_aspect(data, errs, 'siatka')

        # --- karta jednostronna ---
        for sid in ONE_SIDED:
            card = '.pc[data-id="%s"]' % sid
            if page.locator(card).count() != 1:
                errs.append('%s: brak karty w DOM' % sid)
                continue
            if page.locator(card + ' .pc-flip').count():
                errs.append('%s: karta bez rewersu ma przycisk odwracania' % sid)
            if not page.locator(card + ' .pc-oneside').count():
                errs.append('%s: brak adnotacji „tylko awers”' % sid)
            page.click(card + ' .pc-face-front')
            page.wait_for_timeout(350)
            if page.locator('#lb').is_hidden():
                errs.append('%s: powiększenie karty jednostronnej się nie otwiera' % sid)
            if page.locator('#lb-flip').is_visible():
                errs.append('%s: przycisk odwracania widoczny mimo braku rewersu' % sid)
            src = page.get_attribute('#lb-img', 'src') or ''
            if not src.endswith('-a.jpg'):
                errs.append('%s: powiększenie pokazuje %r' % (sid, src))
            page.keyboard.press('f')          # nie może się wywalić ani zmienić obrazu
            page.wait_for_timeout(200)
            if (page.get_attribute('#lb-img', 'src') or '') != src:
                errs.append('%s: klawisz F zmienił obraz mimo braku rewersu' % sid)
            page.click('#lb-next')            # nawigacja dalej z karty jednostronnej
            page.wait_for_timeout(300)
            if page.locator('#lb').is_hidden():
                errs.append('%s: nawigacja z karty jednostronnej zamknęła powiększenie' % sid)
            page.keyboard.press('Escape')
            page.wait_for_timeout(250)
            notes.append('  karta jednostronna %s: OK' % sid)

        # --- odwracanie w siatce ---
        page.click('.pc[data-id="pt-2-9"] .pc-flip')
        page.wait_for_timeout(700)
        if page.get_attribute('.pc[data-id="pt-2-9"]', 'data-flip') != 'back':
            errs.append('odwracanie w siatce nie działa')
        page.click('.pc[data-id="pt-2-9"] .pc-flip')
        page.wait_for_timeout(700)

        # --- powiększenie ---
        page.click('.pc[data-id="pt-2-9"] .pc-face-front')
        page.wait_for_timeout(400)
        if page.locator('#lb').is_hidden():
            errs.append('powiększenie się nie otwiera')
        t1 = page.text_content('.lb-title')
        src1 = page.get_attribute('#lb-img', 'src')
        page.click('#lb-flip')
        page.wait_for_timeout(400)
        if page.get_attribute('#lb-img', 'src') == src1:
            errs.append('odwracanie w powiększeniu nie zmienia obrazu')
        if not (page.get_attribute('#lb-img', 'src') or '').endswith('-b.jpg'):
            errs.append('odwrocie w powiększeniu nie pokazuje pliku -b')
        page.click('#lb-next')
        page.wait_for_timeout(400)
        if page.text_content('.lb-title') == t1:
            errs.append('nawigacja w powiększeniu nie zmienia karty')
        check_aspect(page.evaluate(ASPECT_JS, '.lb-img'), errs, 'powiększenie')
        page.screenshot(path=os.path.join(SHOT, 'desktop-lightbox.png'))
        page.keyboard.press('Escape')
        page.wait_for_timeout(300)
        if page.locator('#lb').is_visible():
            errs.append('Escape nie zamyka powiększenia')

        page.evaluate('window.scrollTo(0, 0)')
        page.wait_for_timeout(300)
        page.screenshot(path=os.path.join(SHOT, 'desktop-top.png'))
        page.mouse.wheel(0, 1400)
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(SHOT, 'desktop-grid.png'))

        # --- wejście z adresu #sygnatura ---
        for sig in ('pt-2-32', ONE_SIDED[0] if ONE_SIDED else 'pt-2-32'):
            p2 = ctx.new_page()
            p2.on('pageerror', lambda e: console.append(('pageerror', str(e))))
            p2.goto(URL + '#' + sig, wait_until='load')
            p2.wait_for_timeout(600)
            if p2.locator('#lb').is_hidden():
                errs.append('wejście z adresu #%s nie otwiera powiększenia' % sig)
            elif sig not in (p2.get_attribute('#lb-img', 'src') or ''):
                errs.append('wejście z adresu #%s otwiera niewłaściwą kartę' % sig)
            else:
                notes.append('  wejście z adresu #%s: OK' % sig)
            p2.close()

        ctx.close()

        # --- mobile 390 px ---
        m = br.new_context(viewport={'width': 390, 'height': 844},
                           device_scale_factor=2, is_mobile=True, has_touch=True)
        mp = m.new_page()
        mp.on('console', lambda x: console.append((x.type, x.text)))
        mp.on('pageerror', lambda e: console.append(('pageerror', str(e))))
        mp.goto(URL, wait_until='load')
        mp.wait_for_timeout(700)
        ov = mp.evaluate("() => ({sw: document.documentElement.scrollWidth,"
                         " cw: document.documentElement.clientWidth})")
        notes.append('mobile scrollWidth/clientWidth: %s/%s' % (ov['sw'], ov['cw']))
        if ov['sw'] > ov['cw'] + 1:
            errs.append('poziomy scroll na 390 px (%d > %d)' % (ov['sw'], ov['cw']))
        # nagłówek: cztery podstrony muszą się zmieścić bez rozpychania strony
        head = mp.evaluate("""() => {
          const h = document.querySelector('.site-head-inner').getBoundingClientRect();
          const xs = [...document.querySelectorAll('.site-x')].map(a => {
            const r = a.getBoundingClientRect();
            return {t: a.textContent.trim(), right: Math.round(r.right), top: Math.round(r.top)};
          });
          return {headH: Math.round(h.height), xs};
        }""")
        notes.append('mobile nagłówek: %d px, linki: %s'
                     % (head['headH'], [(x['t'], x['right']) for x in head['xs']]))
        for x in head['xs']:
            if x['right'] > ov['cw'] + 1:
                errs.append('link „%s” w nagłówku wychodzi poza ekran (%d px)' % (x['t'], x['right']))
        # elementy wychodzące poza prawą krawędź (poza świadomie przewijanym paskiem filtrów)
        wide = mp.evaluate("""() => {
          const bad = [];
          document.querySelectorAll('body *').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.right > window.innerWidth + 1
                && getComputedStyle(el).overflowX !== 'auto'
                && !el.closest('.index-row')) bad.push(el.className + ' ' + Math.round(r.right));
          });
          return bad.slice(0, 8);
        }""")
        if wide:
            errs.append('elementy poza szerokością ekranu: %s' % wide)
        mp.screenshot(path=os.path.join(SHOT, 'mobile-top.png'))
        mp.mouse.wheel(0, 1300)
        mp.wait_for_timeout(900)
        mp.screenshot(path=os.path.join(SHOT, 'mobile-grid.png'))
        mp.evaluate(EAGER_JS)
        mp.wait_for_timeout(400)
        check_aspect(mp.evaluate(ASPECT_JS, '.pc-face img'), errs, 'mobile siatka')
        mp.click('.pc[data-id="pt-2-25"] .pc-face-front')
        mp.wait_for_timeout(600)
        check_aspect(mp.evaluate(ASPECT_JS, '.lb-img'), errs, 'mobile powiększenie')
        mp.screenshot(path=os.path.join(SHOT, 'mobile-lightbox.png'))
        m.close()
        br.close()

    bad_console = [c for c in console if c[0] in ('error', 'pageerror')]
    for c in bad_console:
        errs.append('konsola: %s — %s' % c)

    for n_ in notes:
        print(n_)
    print('komunikatów konsoli:', len(console), '| błędów konsoli:', len(bad_console))
    for e in errs:
        print('BŁĄD:', e)
    print('WYNIK:', 'OK' if not errs else '%d błędów' % len(errs))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
