# -*- coding: utf-8 -*-
"""Kontrola strony w przeglądarce (Chromium przez Playwright).

Sprawdza: błędy konsoli, filtry (każdy motyw i każda epoka, z licznikami),
powiększenie + odwracanie + nawigację, wejście z adresu #sygnatura,
brak poziomego scrolla na 390 px oraz — najważniejsze — czy żaden obraz nie
jest zniekształcony ani przycięty. Proporcje liczone na CONTENT-BOX, bo padding
passe-partout zaburza pomiar przy box-sizing: border-box.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

ROOT = '/home/user/radosc-website-preview'
URL = 'file://' + os.path.join(ROOT, 'kolekcja', 'przemysl', 'index.html')
SHOT = os.path.join(ROOT, '.work-prz', 'shots')
CHROME = '/opt/pw-browsers/chromium'

ASPECT_JS = """() => {
  const out = [];
  document.querySelectorAll('.pc-face img, .lb-img').forEach(img => {
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
      objectFit: cs.objectFit,
      cw: cw, ch: ch
    });
  });
  return out;
}"""


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
        page.wait_for_timeout(700)

        n = page.locator('.pc').count()
        notes.append('kart w DOM: %d' % n)
        if n != 104:
            errs.append('kart %d, oczekiwano 104' % n)

        # --- filtry ---
        cats = page.eval_on_selector_all('.ix[data-cat]', 'els => els.map(e => e.dataset.cat)')
        eras = page.eval_on_selector_all('.ix[data-era]', 'els => els.map(e => e.dataset.era)')
        seen = set()
        for c in cats:
            page.click('.ix[data-cat="%s"]' % c)
            page.wait_for_timeout(60)
            vis = page.eval_on_selector_all('.pc', 'els => els.filter(e => !e.hidden).length')
            sup = page.eval_on_selector('.ix[data-cat="%s"] sup' % c, 'e => +e.textContent')
            if vis != sup:
                errs.append('motyw %s: widocznych %d, licznik %d' % (c, vis, sup))
            if vis == 0:
                errs.append('motyw %s: zero kart' % c)
            if c != '*':
                ids = page.eval_on_selector_all('.pc', 'els => els.filter(e=>!e.hidden).map(e=>e.dataset.id)')
                seen.update(ids)
            notes.append('  motyw %-9s -> %3d' % (c, vis))
        page.click('.ix[data-cat="*"]')
        if len(seen) != 104:
            errs.append('motywy nie pokrywają wszystkich kart: %d z 104' % len(seen))

        seen = set()
        for e in eras:
            page.click('.ix[data-era="%s"]' % e)
            page.wait_for_timeout(60)
            vis = page.eval_on_selector_all('.pc', 'els => els.filter(x => !x.hidden).length')
            sup = page.eval_on_selector('.ix[data-era="%s"] sup' % e, 'x => +x.textContent')
            if vis != sup:
                errs.append('epoka %s: widocznych %d, licznik %d' % (e, vis, sup))
            if vis == 0:
                errs.append('epoka %s: zero kart' % e)
            if e != '*':
                ids = page.eval_on_selector_all('.pc', 'els => els.filter(x=>!x.hidden).map(x=>x.dataset.id)')
                seen.update(ids)
            notes.append('  epoka %-7s -> %3d' % (e, vis))
        page.click('.ix[data-era="*"]')
        if len(seen) != 104:
            errs.append('epoki nie pokrywają wszystkich kart: %d z 104' % len(seen))

        # przycisk „Wyczyść”
        page.click('.ix[data-cat="ulice"]')
        if page.locator('#ix-reset').is_hidden():
            errs.append('przycisk „Wyczyść” ukryty mimo aktywnego filtra')
        page.click('#ix-reset')
        page.wait_for_timeout(80)
        if page.eval_on_selector_all('.pc', 'e => e.filter(x=>!x.hidden).length') != 104:
            errs.append('„Wyczyść” nie przywraca pełnego zestawu')

        # --- proporcje w siatce ---
        page.mouse.wheel(0, 4000)
        page.wait_for_timeout(900)
        page.mouse.wheel(0, 20000)
        page.wait_for_timeout(1200)
        page.mouse.wheel(0, -24000)
        page.wait_for_timeout(600)
        data = page.evaluate(ASPECT_JS)
        notes.append('zmierzonych obrazów w siatce: %d' % len(data))
        for d in data:
            if d['objectFit'] == 'cover':
                errs.append('%s: object-fit: cover' % d['src'])
            if abs(d['natural'] - d['shown']) / d['natural'] > 0.02:
                errs.append('%s: proporcje %.3f zamiast %.3f (zniekształcenie)'
                            % (d['src'], d['shown'], d['natural']))

        # --- odwracanie w siatce ---
        page.click('.pc[data-id="pt-1-9"] .pc-flip')
        page.wait_for_timeout(700)
        if page.get_attribute('.pc[data-id="pt-1-9"]', 'data-flip') != 'back':
            errs.append('odwracanie w siatce nie działa')
        page.click('.pc[data-id="pt-1-9"] .pc-flip')
        page.wait_for_timeout(700)

        # --- powiększenie ---
        page.click('.pc[data-id="pt-1-9"] .pc-face-front')
        page.wait_for_timeout(500)
        if page.locator('#lb').is_hidden():
            errs.append('powiększenie się nie otwiera')
        t1 = page.text_content('.lb-title')
        src1 = page.get_attribute('#lb-img', 'src')
        page.click('#lb-flip')
        page.wait_for_timeout(400)
        if page.get_attribute('#lb-img', 'src') == src1:
            errs.append('odwracanie w powiększeniu nie zmienia obrazu')
        if not page.get_attribute('#lb-img', 'src').endswith('-b.jpg'):
            errs.append('odwrocie w powiększeniu nie pokazuje pliku -b')
        page.click('#lb-next')
        page.wait_for_timeout(400)
        if page.text_content('.lb-title') == t1:
            errs.append('nawigacja w powiększeniu nie zmienia karty')
        lb = page.evaluate(ASPECT_JS)
        for d in lb:
            if abs(d['natural'] - d['shown']) / d['natural'] > 0.02:
                errs.append('powiększenie %s: proporcje %.3f zamiast %.3f'
                            % (d['src'], d['shown'], d['natural']))
        page.screenshot(path=os.path.join(SHOT, 'desktop-lightbox.png'))
        page.keyboard.press('Escape')
        page.wait_for_timeout(300)
        if page.locator('#lb').is_visible():
            errs.append('Escape nie zamyka powiększenia')

        page.screenshot(path=os.path.join(SHOT, 'desktop-top.png'))
        page.mouse.wheel(0, 1500)
        page.wait_for_timeout(1200)
        page.screenshot(path=os.path.join(SHOT, 'desktop-grid.png'))

        # --- wejście z adresu #sygnatura ---
        p2 = ctx.new_page()
        p2.goto(URL + '#pt-1-56', wait_until='load')
        p2.wait_for_timeout(600)
        if p2.locator('#lb').is_hidden():
            errs.append('wejście z adresu #pt-1-56 nie otwiera powiększenia')
        elif 'pt-1-56' not in (p2.get_attribute('#lb-img', 'src') or ''):
            errs.append('wejście z adresu otwiera niewłaściwą kartę')
        p2.close()

        ctx.close()

        # --- mobile 390 px ---
        m = br.new_context(viewport={'width': 390, 'height': 844},
                           device_scale_factor=2, is_mobile=True, has_touch=True)
        mp = m.new_page()
        mp.on('console', lambda x: console.append((x.type, x.text)))
        mp.on('pageerror', lambda e: console.append(('pageerror', str(e))))
        mp.goto(URL, wait_until='load')
        mp.wait_for_timeout(800)
        ov = mp.evaluate("() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})")
        notes.append('mobile scrollWidth/clientWidth: %s/%s' % (ov['sw'], ov['cw']))
        if ov['sw'] > ov['cw'] + 1:
            errs.append('poziomy scroll na 390 px (%d > %d)' % (ov['sw'], ov['cw']))
        # elementy wychodzące poza prawą krawędź
        wide = mp.evaluate("""() => {
          const bad = [];
          document.querySelectorAll('body *').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.right > window.innerWidth + 1 && getComputedStyle(el).overflowX !== 'auto'
                && !el.closest('.index-row')) bad.push(el.className + ' ' + Math.round(r.right));
          });
          return bad.slice(0, 8);
        }""")
        if wide:
            errs.append('elementy poza szerokością ekranu: %s' % wide)
        mp.screenshot(path=os.path.join(SHOT, 'mobile-top.png'))
        mp.mouse.wheel(0, 1400)
        mp.wait_for_timeout(1200)
        mp.screenshot(path=os.path.join(SHOT, 'mobile-grid.png'))
        mp.click('.pc[data-id="pt-1-25"] .pc-face-front')
        mp.wait_for_timeout(700)
        mob = mp.evaluate(ASPECT_JS)
        for d in mob:
            if abs(d['natural'] - d['shown']) / d['natural'] > 0.02:
                errs.append('mobile %s: proporcje %.3f zamiast %.3f' % (d['src'], d['shown'], d['natural']))
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
